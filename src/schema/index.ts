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
import { Category } from './category';
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
 * Gets all entities that are considered categories and renders them with markdown.
 */
export function getAllCategories(m: EntityMap, c: Converter): Category.Map {
    return Object.entries(m)
        .filter(([k, _]) => k.endsWith('*'))
        .reduce((o, [k, v]) => {
            if (v.description === undefined)
                throw `${v.id} does not contain "description", which is a requirement to be a category`;
            return {
                ...o,
                [k.slice(0, -1)]: {
                    name: v.name,
                    id: v.id,
                    description: {
                        raw: v.description,
                        rendered: c.makeHtml(v.description),
                    },
                },
            };
        }, {});
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

    const cats = getAllCategories(d, converter);

    // the initial state of the output manifest before entities are resolved
    var out: { [key: string]: Entity } = {};
    for (var key in d) {
        out[key] = {};
    }

    // resolve components in order
    for (const comp of Component.all()) {
        for (var [k, v] of Object.entries(out)) {
            let ctx: Component.Context = {
                id: k,
                entities: d,
                manifest: out,
                parent: v,
                data: d[k],
                markdown: converter,
                categories: cats,
            };

            Component.resolve(comp, ctx);
        }
    }

    return out;
}
