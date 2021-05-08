import express = require('express');
import cors = require('cors');
import fs = require('fs');
import { CasperOptions } from './casper';
import { Config } from './config';
import { Parser } from './parser';

const casperOptions: CasperOptions = { index: true };

let parser = new Parser();
parser.findFiles();

let casper = parser.makeCasper(casperOptions);

let lastChange: { [key: string]: number } = {};
let changeThreshold = 1000;

parser.dirs.forEach((d) => {
    fs.watch(d, (_, filename) => {
        if (Date.now() - (lastChange[filename] || 0) > changeThreshold) {
            console.log(`\nChange detected in ${filename}, reloading casper.`);
            lastChange[filename] = Date.now();
            parser.findFiles();
            casper = parser.makeCasper(casperOptions);
        }
    });
});

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

// Start the app and wait for requests.
app.listen(Config.port);
console.log('Express started on port 3001');
