import express = require('express');
import cors = require('cors');
import fs = require('fs');
import WebSocket = require('ws');
import { CasperOptions, Casper } from './casper';
import { Config } from './config';
import { Parser } from './parser';
import { Type } from './schema/type';

// TODO: heartbeat system to test connection occasionally.
const wss = new WebSocket.Server({ port: Config.wsport });
let sockets: Array<WebSocket> = [];

wss.on('connection', function connection(ws) {
    sockets.push(ws);
    console.log('Registered new websocket client!');

    ws.on('close', function () {
        console.log('Closing a websocket client!');
        sockets.splice(sockets.indexOf(ws), 1);
    });
});

const casperOptions: CasperOptions = { index: true };

let parser = new Parser();
let casper: Casper;

let lastChange: number = 0;
let changeThreshold = 500;

function updateCasper() {
    lastChange = Date.now();
    parser.findFiles();
    casper = parser.makeCasper(casperOptions);

    let taken = Date.now() - lastChange;
    let files = parser.files.size;
    let entities = casper.manifest.size;
    console.log(
        `Loaded ${files} files containing ${entities} valid entities in ${taken}ms`
    );

    console.log(`All known types: ${Array.from(Type.TYPES).join(', ')}`);

    sockets.forEach((ws) => ws.send(JSON.stringify({ hash: casper.hash })));
    if (sockets.length)
        console.log(`Notified ${sockets.length} clients of updates`);

    // console.log(
    //     `All known entity keys: ${Array.from(
    //         new Set(casper.rawManifest.flatMap((e) => Object.keys(e)))
    //     ).join(', ')}`
    // );
}

parser.dirs.forEach((d) => {
    fs.watch(d, (_, filename) => {
        if (!(filename.endsWith('.yml') || filename.endsWith('.yaml'))) return; // only reload if YAML files change

        if (Date.now() - lastChange < changeThreshold) return; // filter out rapid file changes

        console.log(`\nChange detected in ${filename}, reloading casper.`);
        updateCasper();
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
