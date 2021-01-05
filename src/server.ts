import express = require('express');
import cors = require('cors');
import hash = require('object-hash');
import { Casper } from "./casper";

// Load, validate, and resolve entities
// If there are issues loading the data, the app will display errors and close here.
const casper = new Casper('./data');

console.log(`Loaded ${casper.length} entities!`);
console.log(`Manifest Size: ${Buffer.byteLength(JSON.stringify(casper), 'utf-8')} bytes`);

// Create search index for fast client-side searches.
// TODO: merge index into manifest for simplicity and fewer requests?
const index = JSON.stringify(casper.index().toJSON());

console.log(`Index generated! Size: ${Buffer.byteLength(index, 'utf-8')} bytes`);

// This hash is used by the client to quickly determine if it needs to download new data.
const casperHash = hash(casper) + hash(index);

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

/**
 * Returns the pre-generated search index.
 */
app.get('/index', (req, res) => {
    res.send(index);
});

// Start the app and wait for requests.
app.listen(3001);
console.log('Express started on port 3001');