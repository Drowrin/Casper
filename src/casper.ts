import yaml = require('js-yaml');
import fs = require('fs');
import path = require('path');
import Fuse from 'fuse.js';
import YamlValidator = require('yaml-validator');
import { schema } from "./schema";
import { Entity } from "./parser";
import { exit } from 'process';

type EntityMap = { [key: string]: Entity };

/**
 * Load all YAML files in a directory recursively.
 * Each file is validated and references are replaced.
 * Returns a map of ids to entities
 */
function loadFiles(mainDataDir: string, validator: YamlValidator): any[] {
    
    /**
     * Recurse through directories and gather paths to all yaml files.
     */
    function loadFilesInner(dataDir: string): string[] {
        var out: string[] = [];
    
        for (const file of fs.readdirSync(dataDir)) {
            var pathString = path.join(dataDir, file);
            var stats = fs.lstatSync(pathString);
    
            if (stats.isFile() && file.endsWith('.yml')) {
                out.push(pathString);
            } else if (stats.isDirectory()) {
                out = out.concat(loadFilesInner(dataDir));
            }
        }
    
        return out;
    }

    const allFiles = loadFilesInner(mainDataDir);

    validator.validate(allFiles);
    const errors = validator.report();
    if (errors > 0) {
        console.error(`Invalid files: ${errors}\nCheck parselog for details`);
        exit();
    }

    var out: any[] = [];
    for (const file of allFiles) {
        out = out.concat(
            (<any> yaml.safeLoad(
                <string><any> fs.readFileSync(file)
            ))
        );
    }

    return out;
}

/**
 * Take raw data and resolve into Entity objects.
 */
function resolveEntities(ent: any[]): { [key: string]: Entity } {
    // Initial validation of data. Sort into id -> entity map so that entities can reference each other while resolving
    var d: { [key: string]: any } = {};
    for (var e of ent) {
        if (e.id in d)
            throw `Duplicate id ${e.id}\n${e.name}\n${d[e.id].name}`

        d[e.id] = e;
    }

    // resolve entities
    var out: { [key: string]: Entity } = {};
    for (var key in d) {
        out[key] = new Entity(d, d[key]);
    }
    
    return out;
}

export class Casper {
    entities: EntityMap;
    length: number;

    constructor(dataDir: string) {
        const validator = new YamlValidator({
            structure: schema,
            log: "parselog",
        });

        var ent = loadFiles(dataDir, validator);

        this.length = ent.length;

        this.entities = resolveEntities(ent);
    }

    get(id: string): Entity | undefined {
        return this.entities[id];
    }

    index() {
        return Fuse.createIndex(
            [
                {
                    name: 'name',
                    weight: 2,
                },
                { 
                    name: 'id',
                    weight: 1.5
                },
                {
                    name: 'description',
                    weight: 0.2
                },
                {
                    name: 'components.equipment.categories.name',
                    weight: 1
                },
                {
                    name: 'components.armor.properties.name',
                    weight: 1
                },
                {
                    name: 'components.weapon.properties.name',
                    weight: 1
                },
            ],
            Object.values(this.entities),
        );
    }
}

if (require.main === module) {
    var arg = process.argv.slice(2).join('$');

    var casper = new Casper('./data');

    console.log(casper.get(arg));
}