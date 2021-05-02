import { Converter } from 'showdown';

import './activity';
import './armor';
import './article';
import './category';
import './description';
import './id';
import './img';
import './item';
import './name';
import './proficiency';
import './property';
import './source';
import './spell';
import './tool';
import './vehicle';
import './weapon';

import { Component } from '../component';
import { casperMarkdown } from '../markdown';

export interface EntityData {}

export type EntityMap = { [key: string]: EntityData };

/**
 * The core of all casper data. Everything is an entity.
 */
export interface Entity {
    [key: string]: any;
}

/**
 * The output data, a map of Entities.
 */
export interface Manifest {
    [key: string]: Entity;
}

/**
 * Take raw data and resolve into Entity objects.
 */
export function resolveEntities(ent: EntityData[]): Manifest {
    // Initial validation of data. Sort into id -> entity map so that entities can reference each other while resolving
    var d: EntityMap = {};
    for (var e of ent) {
        if (e.id in d) throw `Duplicate id ${e.id}\n${e.name}\n${d[e.id].name}`;

        d[e.id] = e;
    }

    let converter = new Converter({
        extensions: [casperMarkdown(d)],

        ghCompatibleHeaderId: true,
        simplifiedAutoLink: true,
        excludeTrailingPunctuationFromURLs: true,
        literalMidWordUnderscores: true,
        strikethrough: true,
        tables: true,
        tablesHeaderId: true,
        tasklists: true,
        disableForced4SpacesIndentedSublists: true,
    });

    // const cats = getAllCategories(d, converter);

    // the initial state of the output manifest before entities are resolved
    var out: { [key: string]: Entity } = {};
    for (var key in d) {
        out[key] = {};
    }

    let passed: { [key: string]: string[] } = {};

    // resolve components in order
    for (const comp of Component.all()) {
        passed[comp.KEY] = [];

        for (var [k, v] of Object.entries(out)) {
            let ctx: Component.Context = {
                id: k,
                entities: d,
                manifest: out,
                passed,
                parent: v,
                data: d[k],
                markdown: converter,
            };

            Component.resolve(comp, ctx);
        }
    }

    return out;
}
