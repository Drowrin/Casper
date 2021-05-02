import { Converter } from 'showdown';

import './activity';
import './armor';
import './article';
import './category';
import './description';
import './img';
import './item';
import './proficiency';
import './property';
import './source';
import './spell';
import './tool';
import './vehicle';
import './weapon';

import { Component } from './component';
import { Category } from './category';

export interface EntityData {
    /**
     * Every entity needs a name. This does not have to be unique, just descriptive.
     */
    name: string;

    /**
     * Every entity needs an id. This needs to be unique.
     * Convention is namespaced ids, separated by .
     * For example, "tool.smithing" or "tool.instrument.drum".
     * These namespaces are categories.
     * A category should be an existing entity with an id like "tool.*" or "tool.instrument.*"
     * @TJS-pattern ^\w+(.(\w+|\*))*$
     */
    id: string;
}

export type Manifest = { [key: string]: EntityData };

/**
 * The core of all casper data. Everything is an entity.
 * All entities have a name, id, and at least one category.
 * All the other fields are optional components.
 */
export class Entity {
    // required fields
    name: string;
    id: string;

    // optional components
    // if the raw data contains a matching field, it is resolved into a component
    [key: string]: any;

    constructor(
        data: EntityData,
        manifest: Manifest,
        categories: Category.Map,
        markdown: Converter
    ) {
        this.name = data.name;
        this.id = data.id;

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
