import fs = require('fs');
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
import { Config } from '../config';

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
export type Manifest = { [key: string]: Entity };

export type ErrorMap = { [key: string]: any[] };

let errors: ErrorMap = {};

export function error(key: string, err: any) {
    if (errors[key] === undefined) errors[key] = [];

    errors[key].push(err);
}

export function clearErrors() {
    errors = {};
}

export function reportErrors() {
    let errorCount = Object.keys(errors).length;
    if (errorCount > 0) {
        let prettyErrors = JSON.stringify(errors, null, 2);

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

        console.error(`Error count: ${errorCount}`);
    }
}

/**
 * Take raw data and resolve into Entity objects.
 */
export function resolveEntities(ent: EntityData[]): Manifest {
    // Initial validation of data. Sort into id -> entity map so that entities can reference each other while resolving
    var d: EntityMap = {};
    for (var e of ent) {
        if (e.id in d) {
            error(e.id, `Duplicate id ${e.id}\n${e.name}\n${d[e.id].name}`);
        } else {
            d[e.id] = e;
        }
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
    var out: Manifest = {};
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

            try {
                Component.resolve(comp, ctx);
            } catch (err) {
                error(ctx.id, err);

                delete out[ctx.id];
                delete d[ctx.id];

                for (var k in passed) {
                    let i = passed[k].indexOf(ctx.id);
                    if (i > -1) passed[k].splice(i, 1);
                }
            }
        }
    }

    return out;
}
