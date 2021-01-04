import express = require('express');
import cors = require('cors');
import hash = require('object-hash');
import { Casper } from "./casper";

const casper = new Casper();

console.log(`Loaded ${casper.length} entities!`);

const index = JSON.stringify(casper.index().toJSON());

console.log(`Index generated! Size: ${Buffer.byteLength(index, 'utf-8')} bytes`);

const casperHash = hash(casper + index);

console.log(`Casper version hash: ${casperHash}`);

const app = express();
app.use(cors());

app.get('/', (req, res) => {
    res.json(casper);
});

app.get('/entity/:id', (req, res) => {
    res.json(casper.get(req.params.id));
});

app.get('/hash', (req, res) => {
    res.send(casperHash);
});

app.get('/index', (req, res) => {
    res.send(index);
});

app.listen(3001);
console.log('Express started on port 3001');