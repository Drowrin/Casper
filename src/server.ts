import express = require('express');
import cors = require('cors');
import fs = require('fs');
import WebSocket = require('ws');
import { CasperOptions, Casper } from './casper';
import { Config } from './config';
import { Parser } from './parser';
import { Type } from './schema/type';

interface HBWebSocket extends WebSocket {
    isAlive: boolean;
}

const wss = new WebSocket.Server({ port: Config.wsport });

wss.on('connection', function connection(ws: HBWebSocket) {
    ws.isAlive = true;
    ws.on('pong', function heartbeat() {
        (<HBWebSocket>this).isAlive = true;
    });

    const interval = setInterval(() => {
        wss.clients.forEach((ws) => {
            let hbws = <HBWebSocket>ws;

            if (hbws.isAlive === false) {
                console.log('Connection to a client timed out');
                return hbws.terminate();
            }

            hbws.isAlive = false;
            hbws.ping();
        });
    }, 30000);

    ws.on('close', function () {
        clearInterval(interval);
    });
});

const casperOptions: CasperOptions = { index: true };

let parser = new Parser();
let casper: Casper;

let lastChange: number = 0;
let changeThreshold = 500;

function updateCasper(filename?: string) {
    if (Date.now() - lastChange < changeThreshold) {
        return; // filter out rapid file changes
    }

    if (filename)
        console.log(`\nChange detected in ${filename}, reloading casper.`);

    lastChange = Date.now();
    parser.findFiles();
    casper = parser.makeCasper(casperOptions);

    let taken = Date.now() - lastChange;
    let files = parser.files.size;
    let entities = casper.manifest.size;
    console.log(
        `Loaded ${files} files containing ${entities} valid entities in ${taken}ms`
    );

    if (wss.clients.size) {
        wss.clients.forEach((ws) =>
            ws.send(JSON.stringify({ hash: casper.hash }))
        );
        console.log(`Notified ${wss.clients.size} clients of updates`);
    }
}

parser.dirs.forEach((d) => {
    fs.watch(d, (_, filename) => {
        if (!(filename.endsWith('.yml') || filename.endsWith('.yaml'))) {
            return; // only reload if YAML files change
        }

        setTimeout(() => updateCasper(filename));
    });
});

updateCasper();

// Prepare the express application, allowing CORS.
const app = express();
app.use(cors());

/**
 * Main data endpoint. This returns the whole entity manifest.
 */
app.get('/', (req, res) => {
    res.json(casper.json());
});

/**
 * Dedicated endpoint for the casper version hash.
 * Returns nothing else so that the client can compare hashes as quickly as possible.
 */
app.get('/hash', (req, res) => {
    res.send(casper.hash);
});

/**
 * This endpoint returns a particular entity.
 * Mostly used for debugging.
 */
app.get('/:id', (req, res) => {
    res.json(casper.get(req.params.id));
});

app.get('/search/:term', (req, res) => {
    res.json(casper.search(req.params.term));
});

// Start the app and wait for requests.
app.listen(Config.port);
