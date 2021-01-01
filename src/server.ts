import express = require('express');
import { Casper } from "./casper";

const casper = new Casper();

if (casper.length == 0) {
    console.error("No entities loaded! At least one entry is required");
} else {
    console.log(`Loaded ${casper.length} entities!`);

    const app = express();

    app.get('/', (req, res) => {
        res.json(casper);
    });

    app.get('/entity/:id', (req, res) => {
        res.json(casper.get(req.params.id));
    });
    
    app.listen(3000);
    console.log('Express started on port 3000');
}