import express = require('express');
import cors = require('cors');
import { Casper } from './casper';
import { Config } from './config';
import { Parser } from './parser';

// Load, validate, and resolve entities
// If there are issues loading the data, the app will display errors and close here.
let parser = new Parser(Config.dataDirs);
const casper = Casper.parse(parser, { index: true });

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
