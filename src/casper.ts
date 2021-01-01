import yaml = require('js-yaml');
import fs = require('fs');
import path = require('path');
import { Entity } from "./parser";

type EntityMap = { [key: string]: Entity };

/**
 * Load all YAML files in a directory recursively.
 * Each file is validated and references are replaced.
 * Returns a map of ids to entities
 */
function loadFiles(mainDataDir: string): any[] {
    
    /**
     * Recurse through directories and gather all YAML data.
     * Returns an array of all entities.
     */
    function loadFilesInner(dataDir: string): any[] {
        var out: any[] = [];
    
        for (const file of fs.readdirSync(dataDir)) {
            var pathString = path.join(dataDir, file);
            var stats = fs.lstatSync(pathString);
    
            if (stats.isFile() && file.endsWith('.yml')) {
                out = out.concat(
                    yaml.safeLoad(
                        <string><any> fs.readFileSync(pathString)
                    )
                );
            } else if (stats.isDirectory()) {
                out = out.concat(loadFilesInner(dataDir));
            }
        }
    
        return out;
    }

    return loadFilesInner(mainDataDir);
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

/**
 * Returns all valid components that appear in at least one entity
 */
function collectComponents(entities: EntityMap): string [] {
    var components: Set<string> = new Set();

    for (const entity of Object.values(entities))
        for (const component in entity.components)
            components.add(component);

    return Array.from(components);
}

export class Casper {
    entities: EntityMap;
    components: string [];
    length: number;

    constructor(dataDir = './data') {
        var ent = loadFiles(dataDir);

        this.length = ent.length;

        this.entities = resolveEntities(ent);

        this.components = collectComponents(this.entities);
    }

    get(id: string): Entity | undefined {
        return this.entities[id];
    }
}

if (require.main === module) {
    var arg = process.argv.slice(2).join('$');

    var casper = new Casper();

    console.log(casper.get(arg));
}