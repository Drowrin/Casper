import fs = require('fs');
import path = require('path');
import yaml = require('js-yaml');
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { EntityData, Manifest, resolveEntities } from './schema';
import { exit } from 'process';

/**
 * Load all YAML files in a directory recursively.
 * Each file is validated and references are replaced.
 * Returns a map of ids to entities
 */
export function parseFiles(mainDataDirs: string[]): Manifest {
    const schema = JSON.parse(
        <string>(<any>fs.readFileSync('./build/validator.json'))
    );
    const ajv = new Ajv({
        allowUnionTypes: true,
        verbose: true,
    });
    addFormats(ajv);

    /**
     * Recurse through directories and gather paths to all yaml files.
     */
    function loadFilesInner(dataDir: string): string[] {
        // read various stats about the file. Used here to determine if a path points to a directory or a file.
        var stats = fs.lstatSync(dataDir);

        if (stats.isFile() && dataDir.endsWith('.yml')) {
            // if the path points to a yaml file, add it to the output
            return [dataDir];
        } else if (stats.isDirectory()) {
            var out: string[] = [];

            // iterate through each file in the current directory
            for (const file of fs.readdirSync(dataDir)) {
                if (!file.startsWith('.')) {
                    // the full path to this particular file
                    var pathString = path.join(dataDir, file);
                    out = out.concat(loadFilesInner(pathString));
                }
            }

            return out;
        }

        // file didn't match anything we care about, ignore.
        return [];
    }

    // get a collection of all the yml files in the data directory
    let allFiles: string[] = [];
    for (const dataDir of mainDataDirs) {
        allFiles = allFiles.concat(loadFilesInner(dataDir));
    }

    console.log(`Files loaded: ${allFiles}`);

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
                        const { keyword, dataPath, message } = err;

                        if (
                            keyword === 'additionalProperties' &&
                            dataPath === ''
                        )
                            return 'Unrecognized component!';

                        return {
                            keyword,
                            dataPath,
                            message,
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

    return resolveEntities(out);
}
