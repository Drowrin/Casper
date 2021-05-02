import { Component } from './component';
import { EntityData } from '.';

/**
 * Get a list of all the categories this entity belongs to.
 */
function getEntityCategories(data: EntityData, cats: Category.Map) {
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

    return <Category.Data[]>out;
}

export namespace Category {
    export const KEY = 'entities';
    export const REQUIRES = ['description'];

    export interface Data {
        name: string;
        id: string;
        description: { raw: string; rendered: string };
    }

    export type Map = { [key: string]: Data };

    export function trigger(ctx: Component.Context) {
        return ctx.data.id.endsWith('*');
    }

    export function process(_: void, ctx: Component.Context) {
        let entities = [];

        for (const [k, v] of Object.entries(ctx.manifest)) {
            let entityCatIDs = getEntityCategories(v, ctx.categories).map(
                (e) => e.id
            );
            if (entityCatIDs.includes(ctx.parent.id)) {
                entities.push(k);
            }
        }

        return entities;
    }
}
Component.register(Category);

export namespace Categories {
    export const KEY = 'categories';

    export function trigger(_: Component.Context) {
        return true; // All entities should have categories processed
    }

    export function process(_: void, ctx: Component.Context) {
        let categories = getEntityCategories(ctx.data, ctx.categories);

        if (categories.length > 0) return categories;
    }
}
Component.register(Categories);

declare module '.' {
    export interface EntityData {
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
}
