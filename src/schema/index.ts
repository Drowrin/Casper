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

import { Component } from './component';
import { Category } from './category';

export interface EntityData {}

export type Manifest = { [key: string]: EntityData };

/**
 * The core of all casper data. Everything is an entity.
 * All entities have a name, id, and at least one category.
 * All the other fields are optional components.
 */
export class Entity {
    // optional components
    // if the raw data contains a matching field, it is resolved into a component
    [key: string]: any;

    constructor(
        data: EntityData,
        manifest: Manifest,
        categories: Category.Map,
        markdown: Converter
    ) {
        const ctx: Component.Context = {
            manifest,
            categories,
            markdown,
            parent: this,
            rawData: data,
        };

        // Check all possible components against the entity data.
        // If a component key matches, the constructed component is added to this Entity.
        for (const comp of Component.all()) {
            Component.resolve(comp, data, ctx);
        }
    }
}
