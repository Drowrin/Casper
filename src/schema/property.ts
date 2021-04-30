import { Entity, Manifest } from '.';
import { component, requires } from './component';

export interface PropertyData {
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

@component('property')
export class Property {
    args: string[];
    description: string;
    display?: string;
    entities: string[];

    constructor(data: PropertyData, parent: Entity, m: Manifest) {
        this.args = data.args;
        this.description = data.description;
        this.display = data.display;

        // collect a list of ids of all entities that contain this property
        const name = parent.id.split('.')[1];
        this.entities = [];
        function hasProp(prop: PropertyRef) {
            return prop.ref === name;
        }
        for (const [k, v] of Object.entries(m)) {
            if (v.properties?.some(hasProp)) {
                this.entities.push(k);
            }
        }
    }
}

export interface PropertyRef {
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

@component('properties')
@requires('item')
export class ResolvedProperty {
    name: string;
    id: string;
    description: string;
    display: string;
    args: { [key: string]: any };

    constructor(data: PropertyRef, parent: Entity, m: Manifest) {
        // expand ref into full id and get the property entity.
        const ref = `property.${data.ref}`;
        const entity = m[ref];

        if (entity === undefined)
            throw `${parent.id} contains an undefined reference: "${ref}"!`;

        const property = entity.property;

        if (property === undefined)
            throw `${parent.id} references ${entity.id} as a property, but ${entity.id} lacks the property component!`;

        // process display and description with arg values. replace <argname> with the arg values.
        var description = property.description;
        var display = property.display || entity.name;
        var argmap: { [key: string]: any } = {};
        for (const arg of property.args) {
            // get arg value if it exists. throw error if it doesn't exist
            var val = data[arg];
            if (val === undefined)
                throw `property ${entity.name} of ${parent.id} is missing arg "${arg}"!`;

            description = description.replace(`<${arg}>`, val);
            display = display.replace(`<${arg}>`, val);
            argmap[arg] = val;
        }

        this.name = entity.name;
        this.id = entity.id;
        this.description = description;
        this.display = display;
        this.args = argmap;
    }
}
