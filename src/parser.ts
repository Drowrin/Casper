import fs = require('fs');
import path = require('path');
import yaml = require('js-yaml');
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { EntityData, Manifest, resolveEntities } from './schema';
import { Config } from './config';
import { Casper, CasperOptions } from './casper';

type ErrorMap = { [key: string]: any[] };

export class Parser {
    ajv: Ajv;
    schema: string;

    errors: ErrorMap;
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

        this.errors = {};
        this.out = [];

        this.dirs = new Set();
        this.files = new Set();

        this.findFiles();
    }

    error(key: string, err: any) {
        if (this.errors[key] === undefined) this.errors[key] = [];

        this.errors[key].push(err);
    }

    validate(obj: any) {
        return this.ajv.validate(this.schema, obj);
    }

    getFileEntities(file: string) {
        let entities = <any>yaml.load(<string>(<any>fs.readFileSync(file)));

        if (!Array.isArray(entities)) {
            entities = [entities];
        }

        for (const entity of entities) {
            if (entity.id === undefined)
                this.error(
                    file,
                    `contains an entity without an id: ${JSON.stringify(
                        entity
                    )}`
                );

            const valid = this.validate(entity);

            if (valid) {
                this.out.push(entity);
            } else {
                this.errors[entity.id] =
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
            }
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
        this.errors = {};

        console.log(`Files loaded: ${Array.from(this.files)}`);

        for (const file of this.files) {
            this.getFileEntities(file);
        }

        let errorCount = Object.keys(this.errors).length;
        if (errorCount > 0) {
            let prettyErrors = JSON.stringify(this.errors, null, 2);

            if (Config.errorLogs === 'stderr') {
                console.error(
                    `\n======ERRORS======\n${prettyErrors}\n==================\n`
                );
            } else {
                try {
                    fs.writeFileSync(Config.errorLogs, prettyErrors);
                } catch (err) {
                    console.error(err);
                }
            }

            console.error(`Parsing error count: ${errorCount}`);
        }

        return resolveEntities(this.out);
    }

    /**
     * Parse everything in dataDirs and create a new Casper instance from the data.
     */
    makeCasper(options?: CasperOptions): Casper {
        return new Casper(this.parseFiles(), options);
    }
}
