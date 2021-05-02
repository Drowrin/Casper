import { Component } from './component';

export namespace Property {
    export const KEY = 'propterty';

    export interface Data {
        /**
         * Names of args that a property requires. For example, Range requires `normal` and `max` args.
         * Args are replaced in `description` and `display` wherever `<arg>` appears.
         * For example, Range.display is "Range(<normal>/<max>)"
         */
        args: string[];

        /**
         * Describes the property. This is different from the root description because args are replaced in it.
         */
        description: string;

        /**
         * Optional display string.
         * If it is undefined, it defaults to the root name. This is useful for unchanging properties like "Heavy".
         * If it is defined, args are replaced in it before being displayed.
         */
        display?: string;
    }

    export function process(data: Data, ctx: Component.Context) {
        const name = ctx.id.split('.')[1];
        var entities = [];

        function hasProp(prop: Properties.Data) {
            return prop.ref === name;
        }

        for (const [k, v] of Object.entries(ctx.entities)) {
            if (v.properties?.some(hasProp)) {
                entities.push(k);
            }
        }

        return {
            args: data.args,
            description: {
                raw: data.description,
                rendered: ctx.markdown.makeHtml(data.description),
            },
            display: data.display,
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
            // expand ref into full id and get the property entity.
            const ref = `property.${d.ref}`;
            const entity = ctx.entities[ref];

            if (entity === undefined)
                throw `${ctx.id} contains an undefined reference: "${ref}"!`;

            const property = entity.property;

            if (property === undefined)
                throw `${ctx.id} references ${entity.id} as a property, but ${entity.id} lacks the property component!`;

            // process display and description with arg values. replace <argname> with the arg values.
            var description = property.description;
            var display = property.display || entity.name;
            var argmap: { [key: string]: any } = {};
            for (const arg of property.args) {
                // get arg value if it exists. throw error if it doesn't exist
                var val = d[arg];
                if (val === undefined)
                    throw `property ${entity.name} of ${ctx.id} is missing arg "${arg}"!`;

                description = description.replace(`<${arg}>`, val);
                display = display.replace(`<${arg}>`, val);
                argmap[arg] = val;
            }

            return {
                name: entity.name,
                id: entity.id,
                description: {
                    raw: description,
                    rendered: ctx.markdown.makeHtml(description),
                },
                display: display,
                args: argmap,
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
