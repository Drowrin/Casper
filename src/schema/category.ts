import { Component } from '../component';

export namespace Category {
    export const KEY = 'category';
    export const REQUIRES = ['description'];

    export interface Data {
        name: string;
        id: string;
        description: { raw: string; rendered: string };
    }

    export type Map = { [key: string]: Data };

    export function trigger(ctx: Component.Context) {
        if (ctx.id.endsWith('*')) {
            if (ctx.data.description === undefined)
                throw `${ctx.id} does not contain "description", which is a requirement to be a category`;

            return true;
        }

        return false;
    }

    export function getData(_: Component.Context) {
        return []; // placeholder, set by Categories below
    }

    export function transform(processed: any, ctx: Component.Context) {
        ctx.parent['entities'] = processed;
    }
}
Component.register(Category);

export namespace Categories {
    export const KEY = 'categories';
    export const WAIT_FOR = [Category.KEY]; // wait for Categories to be processed
    export const SUPPRESS_TYPE = true;

    export function trigger(_: Component.Context) {
        return true; // All entities should have categories processed
    }

    export function process(
        data: string[] | undefined,
        ctx: Component.Context
    ) {
        let cats = ctx.passed[Category.KEY];

        let out = [];

        for (const k of cats) {
            let category_id = k.slice(0, -1);
            if (ctx.id.startsWith(category_id) && ctx.id != k) {
                out.push(k);
            }
        }

        if (data !== undefined) {
            for (const r of data) {
                let ref = `${r}.*`;

                if (!ctx.passed[Category.KEY].includes(ref))
                    throw `${ctx.id} contains an undefined category reference: "${r}"`;

                if (out.includes(ref))
                    throw `${ctx.id} contains a duplicate category reference: "${r}"`;

                out.push(ref);
            }
        }

        return out.map((id) => {
            let category = ctx.manifest[id];

            category.entities.push(ctx.id);

            return {
                id,
                name: category.name,
                description: category.description,
            };
        });
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
