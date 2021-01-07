import { Entity } from '.';
import { Manifest, PropertyData, PropertyRef } from '../schema';
import { component } from './component';

@component('property')
export class Property {
    categories: string[];
    args: string[];
    description: string;
    display?: string;
    entities: string[];

    constructor(data: PropertyData, parent: Entity, m: Manifest) {
        this.categories = data.categories;
        this.args = data.args;
        this.description = data.description;
        this.display = data.display;

        // collect a list of ids of all entities that contain this property
        const name = parent.id.split('$')[1];
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

@component('properties')
export class ResolvedProperty {
    name: string;
    id: string;
    description: string;
    display: string;
    args: { [key: string]: any };

    constructor(data: PropertyRef, parent: Entity, m: Manifest) {
        // expand ref into full id and get the property entity.
        const ref = `property$${data.ref}`;
        const entity = m[ref];

        if (entity === undefined)
            throw `${parent.id} contains an undefined reference: "${ref}"!`;

        const property = entity.property;

        if (property === undefined)
            throw `${parent.id} references ${entity.id} as a property, but ${entity.id} lacks the property component!`;

        // check that the parent entity belongs to at least one of the categories this property requires.
        const categories = property.categories;
        function checkCategories(c: string) {
            return m[parent.id].categories.includes(c);
        }
        if (categories.length > 0 && !categories.some(checkCategories)) {
            throw `${parent.id} does not match any possible categories for ${ref} [${property.categories}]!`;
        }

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
