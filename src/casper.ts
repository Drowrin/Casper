import hash = require('object-hash');
import Fuse from 'fuse.js';

import { Entity, Manifest } from './schema';

/**
 * Used by Fuse.js to generate a search index.
 * See examples for more information: https://fusejs.io/examples.html
 */
const defaultFuseKeys = [
    {
        name: 'name',
        weight: 1,
    },
];

const defaultFuseOptions: Fuse.IFuseOptions<Entity> = {
    threshold: 0.55,
    includeMatches: true,
    includeScore: true,
    useExtendedSearch: true,
};

export interface CasperOptions {
    /**
     * Can be either a boolean or a pre-generated FuseIndex.
     * If it is a boolean and is `true`, a FuseIndex will be generated during Casper construction.
     * If it is a pre-generated FuseIndex, it will be saved directly into the Casper instance.
     */
    index?: Fuse.FuseIndex<Entity> | boolean;

    /**
     * If index is set to `true`, these keys will be used when generating the index.
     * This is optional. If it is not provided, default keys will be used.
     */
    indexKeys?: Fuse.FuseOptionKey[];

    /**
     * If this is present, the manifest will not be hashed during Casper construction and this value will be used instead.
     */
    overrideHash?: string;

    /**
     * Override default search options for Fuse.js
     */
    searchOptions?: Fuse.IFuseOptions<Entity>;
}

/**
 * The core of the project; the main manifest.
 * Serialized to JSON before being sent to clients.
 */
export class Casper {
    rawManifest: Entity[];
    manifest: Map<string, Entity>;
    hash: string;

    index?: Fuse.FuseIndex<Entity>;
    fuse?: Fuse<Entity>;

    options: CasperOptions;

    /**
     * Create a Casper instance from pre-processed JSON data.
     * Validates the root level only.
     */
    static fromJson(data: string, options: CasperOptions = {}): Casper {
        let c = JSON.parse(data);

        if (c.manifest === undefined)
            throw 'JSON data did not include a manifest!';

        if (c.hash === undefined)
            throw 'JSON data did not incldue a version hash!';

        if (options.overrideHash === undefined) options.overrideHash = c.hash;

        if (c.index !== undefined && !options.index) options.index = c.index;

        return new this(c.manifest, options);
    }

    constructor(manifest: Manifest, options: CasperOptions = {}) {
        this.options = options;
        this.rawManifest = Object.values(manifest).sort((a, b) => {
            if (a.id < b.id) return -1;
            if (a.id > b.id) return 1;
            return 0;
        });

        this.manifest = new Map<string, Entity>(
            this.rawManifest.map((e) => [e.id, e])
        );

        if (options.index !== undefined) {
            let searchOptions = {
                ...defaultFuseOptions,
                ...options.searchOptions,
            };

            this.options.searchOptions = searchOptions;

            if (typeof options.index === 'boolean') {
                if (options.index === true) {
                    this.index = Fuse.createIndex(
                        options.indexKeys || defaultFuseKeys,
                        this.rawManifest
                    );

                    this.fuse = new Fuse(
                        Object.values(manifest),
                        searchOptions,
                        this.index
                    );
                }
            } else {
                this.index = options.index;
            }
        }

        this.hash = options.overrideHash || hash(this.rawManifest);
    }

    /**
     * Get a particular entity by id.
     */
    get(id: string): Entity | undefined {
        return this.manifest.get(id);
    }

    /**
     * Search through the entities in the manifest.
     * If an index was not generated or passed during construction, this will always return [].
     */
    search(term: string) {
        if (this.fuse === undefined) return [];

        return this.fuse.search(term);
    }

    /**
     * Get this Casper instance in a JSON-serializable form.
     */
    json() {
        return {
            manifest: this.rawManifest,
            hash: this.hash,
            index: this.index,
            options: this.options,
        };
    }
}
