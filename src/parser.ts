import fs = require('fs');
import path = require('path');
import yaml = require('js-yaml');
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import {
    clearErrors,
    EntityData,
    error,
    Manifest,
    reportErrors,
    resolveEntities,
} from './schema';
import { Config } from './config';
import { Casper, CasperOptions } from './casper';

export class Parser {
    ajv: Ajv;
    schema: string;

    out: EntityData[];

    dirs: Set<string>;
    files: Set<string>;

    constructor() {
        this.ajv = new Ajv({
            allowUnionTypes: true,
            verbose: true,
        });
        addFormats(this.ajv);

        this.schema = JSON.parse(
            <string>(<any>fs.readFileSync('./build/validator.json'))
        );

        this.out = [];

        this.dirs = new Set();
        this.files = new Set();

        this.findFiles();
    }

    validate(entity: any, file: string) {
        if (entity == undefined) return;

        try {
            if (entity.id === undefined) {
                error(
                    file,
                    `contains an entity without an id: ${JSON.stringify(
                        entity
                    )}`
                );
                return;
            }
        } catch (err) {
            error(file, err);
            return;
        }

        const valid = this.ajv.validate(this.schema, entity);

        if (valid) {
            this.out.push(entity);
        } else {
            let err =
                this.ajv.errors?.map((err) => {
                    const { keyword, instancePath, message } = err;

                    if (
                        keyword === 'additionalProperties' &&
                        instancePath === ''
                    )
                        return 'Unrecognized component!';

                    return {
                        keyword,
                        instancePath,
                        message,
                    };
                }) ?? [];

            error(file + ' | ' + entity.id, err);
            return;
        }
    }

    getFileEntities(file: string) {
        let buffer: Buffer = fs.readFileSync(file);

        if (buffer.length == 0) return;

        let entities;
        try {
            entities = <any>yaml.load(buffer.toString());
        } catch (err) {
            error(file, err);
            return;
        }

        if (!Array.isArray(entities)) {
            entities = [entities];
        }

        for (const entity of entities) {
            this.validate(entity, file);
        }
    }

    findFilesInner(p: string): void {
        // read various stats about the file. Used here to determine if a path points to a directory or a file.
        var stats = fs.lstatSync(p);

        if (stats.isFile() && p.endsWith('.yml')) {
            // if the path points to a yaml file, add it to the output
            this.files.add(p);
        } else if (stats.isDirectory()) {
            this.dirs.add(p);

            // iterate through each file in the current directory
            for (const file of fs.readdirSync(p)) {
                if (!file.startsWith('.')) {
                    // the full path to this particular file
                    var pathString = path.join(p, file);
                    this.findFilesInner(pathString);
                }
            }
        }
    }

    /**
     * Recurse through directories and gather paths to all yaml files.
     */
    findFiles() {
        this.dirs = new Set();
        this.files = new Set();

        // get a collection of all the yml files in the data directory
        for (const dataDir of Config.dataDirs) {
            this.findFilesInner(dataDir);
        }
    }

    /**
     * Load all YAML files in a directory recursively.
     * Each file is validated and references are replaced.
     * Returns a map of ids to entities
     */
    parseFiles(): Manifest {
        this.out = [];

        clearErrors();

        for (const file of this.files) {
            this.getFileEntities(file);
        }

        let entities = resolveEntities(this.out);

        reportErrors();

        return entities;
    }

    /**
     * Parse everything in dataDirs and create a new Casper instance from the data.
     */
    makeCasper(options?: CasperOptions): Casper {
        return new Casper(this.parseFiles(), options);
    }
}
