import * as schema from './schema';

type SMap<t> = { [key: string]: t };
type Manifest = SMap<schema.EntityData>;

/**
 * The core of all casper data. Everything is an entity.
 * All entities have a name, id, and at least one category.
 * All the other fields are optional components.
 */
export class Entity {
    // required fields
    name: string;
    id: string;
    categories: ResolvedCategory[] = [];

    // optional. displayed alongside an entity if present.
    img?: Img;

    // optional. brief description of this entity.
    description?: string;

    // optional components
    // if the raw data contains a matching field, it is resolved into a component
    [key: string]: any;

    constructor(data: schema.EntityData, m: Manifest) {
        this.name = data.name;
        this.id = data.id;

        this.description = data.description;

        applyComponents(data, this, m);
    }
}

var components: Component[] = [];

function applyComponents(data: schema.EntityData, parent: any, m: Manifest) {
    for (const comp of components) {
        comp.resolve?.(data, parent, m);
    }
}

interface Component {
    new (...args: any[]): {};
    resolve?(ed: any, entity: Entity, m: Manifest): void;
}

function component(key: string) {
    return function <T extends Component>(Base: T) {
        class c extends Base {
            static resolve(ed: any, entity: Entity, m: Manifest) {
                const data = ed[key];

                if (data !== undefined) {
                    if (Array.isArray(data)) {
                        entity[key] = data.map(
                            (d: any) => new this(d, entity, m)
                        );
                    } else {
                        entity[key] = new this(data, entity, m);
                    }
                }
            }
        }

        components.push(c);

        return Base;
    };
}

@component('img')
export class Img {
    uri: string;

    constructor(data: schema.ImgData) {
        this.uri = data.uri;
    }
}

@component('item')
export class Item {
    cost?: schema.ValueData;
    weight?: number;

    constructor(data: schema.ItemData) {
        this.cost = data.cost;
        this.weight = data.weight;
    }
}

@component('tool')
export class Tool {
    proficiency: string;
    skills?: { name: string; description: string }[];
    supplies?: any[];
    activities?: { description: string; dc: string }[];
    uses?: { name: string; description: string }[];

    constructor(data: schema.ToolData) {
        this.proficiency = data.proficiency;
        this.skills = data.skills;
        this.supplies = data.supplies;
        this.activities = data.activities;
        this.uses = data.uses;
    }
}

@component('properties')
export class ResolvedProperty {
    name: string;
    id: string;
    description: string;
    display: string;
    args: SMap<any>;

    constructor(data: schema.PropertyRef, parent: Entity, m: Manifest) {
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
        var argmap: SMap<any> = {};
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

export class Property {
    categories: string[];
    args: string[];
    description: string;
    display?: string;
    entities: string[];

    constructor(parent: Entity, m: Manifest, data: schema.PropertyData) {
        this.categories = data.categories;
        this.args = data.args;
        this.description = data.description;
        this.display = data.display;

        // collect a list of ids of all entities that contain this property
        const name = parent.id.split('$')[1];
        this.entities = [];
        function hasProp(prop: schema.PropertyRef) {
            return prop.ref === name;
        }
        for (const [k, v] of Object.entries(m)) {
            if (v.properties?.some(hasProp)) {
                this.entities.push(k);
            }
        }
    }
}

@component('categories')
export class ResolvedCategory {
    name: string;
    id: string;
    description: string;

    constructor(ref: string, parent: Entity, m: Manifest) {
        const fullRef = `category$${ref}`;
        const entity = m[fullRef];

        if (entity === undefined)
            throw `${parent.id} contains an undefined reference: "${fullRef}"!`;

        this.name = entity.name;
        this.id = entity.id;
        this.description = <string>entity.description; // TODO: require description with category in validation
    }
}

@component('category')
export class Category {
    entities: string[];

    constructor(data: schema.CategoryData, parent: Entity, m: Manifest) {
        // collect a list of ids of all entities that are in this category
        const name = parent.id.split('$')[1];
        this.entities = [];
        for (const k in m) {
            if (m[k].categories.includes(name)) {
                this.entities.push(k);
            }
        }
    }
}

@component('armor')
export class Armor {
    ac: string | number;

    constructor(data: schema.ArmorData) {
        this.ac = data.ac;
    }
}

@component('weapon')
export class Weapon {
    damage?: string | number;
    type?: string;

    constructor(data: schema.WeaponData) {
        this.damage = data.damage;
        this.type = data.type;
    }
}

@component('vehicle')
export class Vehicle {
    speed?: string;
    capacity?: string;
    workers?: string;

    constructor(data: schema.VehicleData) {
        this.speed = data.speed;
        this.capacity = data.capacity;
        this.workers = data.workers;
    }
}
