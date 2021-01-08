import express = require('express');
import cors = require('cors');
import { Casper } from './casper';

// Load, validate, and resolve entities
// If there are issues loading the data, the app will display errors and close here.
const casper = new Casper('./data');

// This hash is used by the client to quickly determine if it needs to download new data.
const casperHash = casper.hash();

console.log(`Casper version hash: ${casperHash}`);

// Prepare the express application, allowing CORS.
const app = express();
app.use(cors());

/**
 * Main data endpoint. This returns the whole entity manifest.
 */
app.get('/', (req, res) => {
    res.json(casper);
});

/**
 * This endpoint returns a particular entity.
 * Mostly used for debugging.
 */
app.get('/entity/:id', (req, res) => {
    res.json(casper.get(req.params.id));
});

/**
 * Dedicated endpoint for the casper version hash.
 * Returns nothing else so that the client can compare hashes as quickly as possible.
 */
app.get('/hash', (req, res) => {
    res.send(casperHash);
});

// Start the app and wait for requests.
app.listen(3001);
console.log('Express started on port 3001');
