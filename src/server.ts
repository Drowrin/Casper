import express = require('express');
import cors = require('cors');
import { Casper } from "./casper";

const casper = new Casper();

console.log(`Loaded ${casper.length} entities!`);

const app = express();
app.use(cors());

app.get('/', (req, res) => {
    res.json(casper);
});

app.get('/entity/:id', (req, res) => {
    res.json(casper.get(req.params.id));
});

app.listen(3001);
console.log('Express started on port 3001');