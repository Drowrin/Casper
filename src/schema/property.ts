import { Component } from '../component';

export namespace Property {
    export const KEY = 'property';
    export const REQUIRES = ['description'];

    export interface Data {
        /**
         * Determine what type of equipment this property is meant to be included on.
         */
        type: 'weapon' | 'armor' | 'any';
    }

    export function process(data: Data, ctx: Component.Context) {
        var entities = [];

        function hasProp(prop: Properties.Data) {
            return prop.ref === ctx.id;
        }

        for (const [k, v] of Object.entries(ctx.entities)) {
            if (v.properties?.some(hasProp)) {
                entities.push(k);
            }
        }

        let alltext = ctx.parent.name + ctx.parent.description.raw;
        let matches = alltext.matchAll(/{(\w+)}/g);
        let args = [...new Set([...matches].map((m) => m[1]))];

        return {
            type: data.type,
            args,
            entities,
        };
    }
}
Component.register(Property);

declare module '.' {
    export interface EntityData {
        /**
         * A property defines special rules for using equipment.
         * If this entity defines a property that other entities will refer to, it should contain this `property` component.
         */
        property?: Property.Data;
    }
}

export namespace Properties {
    export const KEY = 'properties';
    export const REQUIRES = ['item'];
    export const WAIT_FOR = ['property'];

    export interface Data {
        /**
         * Refers to a proprty by id.
         * Like categories, "property$" is added automatically.
         */
        ref: string;

        /**
         * Other fields are args used by the property while being resolving.
         * Not all properties require args.
         *
         * Range and Heavy for example:
         * properties:
         *   - ref: range
         *     normal: 30
         *     max: 60
         *   - ref: heavy
         */
        [key: string]: any;
    }

    export function process(data: Data[], ctx: Component.Context) {
        return data.map((d) => {
            if (!ctx.passed['property'].includes(d.ref))
                throw `${d.ref} does not refer to a valid property!`;

            // expand ref into full id and get the property entity.
            const entity = ctx.manifest[d.ref];

            // process display and description with arg values. replace <argname> with the arg values.
            var description = entity.description;
            var name = entity.name;
            var args: { [key: string]: any } = {};

            for (const arg of entity.property.args) {
                // get arg value if it exists. throw error if it doesn't exist
                var val = d[arg];
                if (val === undefined)
                    throw `property ${entity.name} is missing arg "${arg}"!`;

                description = description.replace(`{${arg}}`, val);
                name = name.replace(`{${arg}}`, val);
                args[arg] = val;
            }

            return {
                name,
                id: entity.id,
                description,
                args,
            };
        });
    }
}
Component.register(Properties);

declare module '.' {
    export interface EntityData {
        /**
         * A list of references to properties that this object has.
         */
        properties?: Properties.Data[];
    }
}
