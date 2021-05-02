import { Converter } from 'showdown';

import './activity';
import './armor';
import './article';
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

    /**
     * Some entities belong to multiple categories.
     * Additional categories that do not fit in the id can be added here.
     * Example:
     * categories:
     *   - weapon.martial
     *   - weapon.ranged
     */
    categories?: string[];
}

export interface CategoryData {
    name: string;
    id: string;
    description: { raw: string; rendered: string };
}

type CategoryMap = { [key: string]: CategoryData };

/**
 * Gets all entities that are considered categories and renders them with markdown.
 */
export function getAllCategories(m: Manifest, c: Converter): CategoryMap {
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
 * Get a list of all the categories this entity belongs to.
 */
function getEntityCategories(data: EntityData, cats: CategoryMap) {
    let out = [];

    for (const [k, v] of Object.entries(cats)) {
        if (data.id.startsWith(k) && data.id != `${k}*`) {
            out.push(v);
        }
    }

    data.categories?.forEach((e) => {
        const cat = cats[`${e}.`];

        if (cat === undefined)
            throw `${data.id} contains an undefined reference: "${e}"`;

        out.push(cat);
    });

    return <CategoryData[]>out;
}

/**
 * Determine if this entity is a category, and if so, put a list of all its members at entity.entities.
 */
function resolveCategory(
    entity: Entity,
    m: Manifest,
    cats: { [key: string]: CategoryData }
) {
    if (entity.id.endsWith('*')) {
        entity.entities = [];

        for (const [k, v] of Object.entries(m)) {
            let entityCatIDs = getEntityCategories(v, cats).map((e) => e.id);
            if (entityCatIDs.includes(entity.id)) {
                entity.entities.push(k);
            }
        }
    }
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

    categories?: CategoryData[];

    // optional components
    // if the raw data contains a matching field, it is resolved into a component
    [key: string]: any;

    constructor(
        data: EntityData,
        manifest: Manifest,
        cats: CategoryMap,
        converter: Converter
    ) {
        this.name = data.name;
        this.id = data.id;

        // TODO: convert these category methods to more standard components?
        let entityCats = getEntityCategories(data, cats);
        if (entityCats.length > 0) this.categories = entityCats;

        resolveCategory(this, manifest, cats);

        // Check all possible components against the entity data.
        // If a component key matches, the constructed component is added to this Entity.
        for (const comp of Component.all()) {
            Component.resolve(comp, data, this, manifest, converter);
        }
    }
}
