import yaml = require('js-yaml');
import fs = require('fs');
import path = require('path');
import Fuse from 'fuse.js';
import Ajv, { ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import { Entity, EntityData } from './schema';
import { exit } from 'process';

/**
 * Load all YAML files in a directory recursively.
 * Each file is validated and references are replaced.
 * Returns a map of ids to entities
 */
function loadFiles(mainDataDir: string, schemaDir: string): EntityData[] {
    const schema = JSON.parse(<string>(<any>fs.readFileSync(schemaDir)));
    const ajv = new Ajv({
        allowUnionTypes: true,
        verbose: true,
    });
    addFormats(ajv);

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

    // load all the files into one big array of all raw entities
    var out: EntityData[] = [];
    var errors: { [key: string]: any[] } = {};
    for (const file of allFiles) {
        const entities = <any>(
            yaml.safeLoad(<string>(<any>fs.readFileSync(file)))
        );

        if (!Array.isArray(entities))
            throw `File ${file} not an array of entities`;

        for (const entity of entities) {
            if (entity.id === undefined)
                throw `File ${file} contains an entity without an id: ${JSON.stringify(
                    entity
                )}`;

            const valid = ajv.validate(schema, entity);

            if (!valid)
                errors[entity.id] =
                    ajv.errors?.map((err) => {
                        const {
                            keyword,
                            dataPath,
                            message,
                            parentSchema,
                            data,
                        } = err;

                        if (
                            keyword === 'additionalProperties' &&
                            dataPath === ''
                        )
                            return 'Unrecognized component!';

                        return {
                            keyword,
                            dataPath,
                            message,
                            parentSchema,
                            data,
                        };
                    }) ?? [];
        }

        out = out.concat(<EntityData[]>entities);
    }

    if (Object.keys(errors).length > 0) {
        console.log('Data validation failed!');
        console.log(JSON.stringify(errors, null, 2));
        exit();
    }

    return out;
}

type EntityMap = { [key: string]: Entity };

/**
 * Take raw data and resolve into Entity objects.
 */
function resolveEntities(ent: EntityData[]): EntityMap {
    // Initial validation of data. Sort into id -> entity map so that entities can reference each other while resolving
    var d: { [key: string]: EntityData } = {};
    for (var e of ent) {
        if (e.id in d) throw `Duplicate id ${e.id}\n${e.name}\n${d[e.id].name}`;

        d[e.id] = e;
    }

    // resolve raw entity data into full Entity objects.
    // the Entity constructor does a lot. It recursively resolves and validates each component of this entity.
    var out: { [key: string]: Entity } = {};
    for (var key in d) {
        out[key] = new Entity(d[key], d);
    }

    return out;
}

/**
 * The core of the project; the main manifest.
 * Serialized to JSON before being sent to clients.
 */
export class Casper {
    entities: EntityMap;
    length: number;

    constructor(dataDir: string, schemaDir: string) {
        // load files and perform initial validation
        // this array is not saved after it is transformed into a map of resolved Entity objects
        var ent = loadFiles(dataDir, schemaDir);

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
                    weight: 1.5,
                },
                {
                    name: 'description',
                    weight: 0.2,
                },
                {
                    name: 'components.categories.name',
                    weight: 1,
                },
                {
                    name: 'components.properties.name',
                    weight: 1,
                },
            ],
            Object.values(this.entities)
        );
    }
}

// commandline interface for casper, rather than running a server
// args are transformed into an id, and then the result of an id lookup is printed to the console.
// used for debugging data changes
// example: `npm run casper weapon longsword`
if (require.main === module) {
    var arg = process.argv.slice(2).join('$');

    var casper = new Casper('./data', './schema.json');

    console.log(JSON.stringify(casper.get(arg), null, 2));
}
