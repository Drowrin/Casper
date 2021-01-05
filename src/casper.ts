import yaml = require('js-yaml');
import fs = require('fs');
import path = require('path');
import Fuse from 'fuse.js';
import YamlValidator = require('yaml-validator');
import schema from "./schema";
import { Entity } from "./parser";
import { exit } from 'process';

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
    
        // iterate through each file in the current directory
        for (const file of fs.readdirSync(dataDir)) {
            // the full path to this particular file
            var pathString = path.join(dataDir, file);
            // read various stats about the file. Used here to determine if a path points to a directory or a file.
            var stats = fs.lstatSync(pathString);
            
            if (stats.isFile() && file.endsWith('.yml')) {
                // if the path points to a yaml file, add it to the output
                out.push(pathString);
            } else if (stats.isDirectory() && !file.startsWith('.')) {
                // if the path points to a non-hidden directory, recurse into it and add all it's files to the output
                out = out.concat(loadFilesInner(dataDir));
            }
        }
    
        return out;
    }

    // get a collection of all the yml files in the data directory
    const allFiles = loadFilesInner(mainDataDir);

    // validate the yaml files against the schema in src/schema.js
    // if there are errors, direct the user to the parselog and close the app.
    validator.validate(allFiles);
    const errors = validator.report();
    if (errors > 0) {
        console.error(`Invalid files: ${errors}\nCheck parselog for details`);
        exit();
    }

    // load all the files into one big array of all raw entities
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

    // resolve raw entity data into full Entity objects.
    // the Entity constructor does a lot. It recursively resolves and validates each component of this entity.
    var out: { [key: string]: Entity } = {};
    for (var key in d) {
        out[key] = new Entity(d, d[key]);
    }
    
    return out;
}


type EntityMap = { [key: string]: Entity };

/**
 * The core of the project; the main manifest.
 * Serialized to JSON before being sent to clients.
 */
export class Casper {
    entities: EntityMap;
    length: number;

    constructor(dataDir: string) {
        // create the yaml validator that is passed to the data loader
        const validator = new YamlValidator({
            structure: schema,
            log: "parselog",
        });

        // load files and perform initial validation
        // this array is not saved after it is transformed into a map of resolved Entity objects
        var ent = loadFiles(dataDir, validator);

        // count entities and set length property before the array is lost
        this.length = ent.length;

        this.entities = resolveEntities(ent);
    }

    /**
     * Get a particular entity by id.
     */
    get(id: string): Entity | undefined {
        return this.entities[id];
    }

    /**
     * Generate and return a search index for fuse.js.
     */
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
                    name: 'components.categories.name',
                    weight: 1
                },
                {
                    name: 'components.equipment.properties.name',
                    weight: 1
                },
            ],
            Object.values(this.entities),
        );
    }
}

// commandline interface for casper, rather than running a server
// args are transformed into an id, and then the result of an id lookup is printed to the console.
// used for debugging data changes
// example: `npm run casper weapon longsword`
if (require.main === module) {
    var arg = process.argv.slice(2).join('$');

    var casper = new Casper('./data');

    console.log(casper.get(arg));
}