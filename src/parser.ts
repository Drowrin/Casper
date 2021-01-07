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
    categories: ResolvedCategory[];

    // optional. displayed alongside an entity if present.
    img?: Img;

    // optional. brief description of this entity.
    description?: string;

    // optional components
    // if the raw data contains a matching field, it is resolved into a component
    [key: string]: any;

    constructor(m: Manifest, data: schema.EntityData) {
        this.name = data.name;
        this.id = data.id;

        this.categories = data.categories.map(Category.resolver(this, m));

        this.description = data.description;

        // if (data.img) this.img = new Img(this, m, data.img);
        for (const comp of components) {
            comp.resolve?.(this, m, data);
        }

        if (data.item) this.item = new Item(this, m, data.item);
        if (data.properties)
            this.properties = data.properties.map(Property.resolver(this, m));
        if (data.tool) this.tool = new Tool(this, m, data.tool);
        if (data.property) this.property = new Property(this, m, data.property);
        if (data.category) this.category = new Category(this, m, data.category);
        if (data.armor) this.armor = new Armor(this, m, data.armor);
        if (data.weapon) this.weapon = new Weapon(this, m, data.weapon);
        if (data.vehicle) this.vehicle = new Vehicle(this, m, data.vehicle);
    }
}

var components: Component[] = [];

interface Component {
    new (...args: any[]): {};
    array?: boolean;
    computed?<D>(e: Entity, m: Manifest, d: D): { [key: string]: any };
    resolve?(entity: Entity, m: Manifest, ed: any): void;
}

function component(key: string) {
    return function <T extends Component>(Base: T) {
        class c extends Base {
            static resolve(entity: Entity, m: Manifest, ed: any) {
                const data = ed[key];

                if (data !== undefined) {
                    if (this.array)
                        entity[key] = data.map(
                            (d: any) =>
                                new this(d, this.computed?.(entity, m, d))
                        );

                    entity[key] = new this(
                        data,
                        this.computed?.(entity, m, data)
                    );
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

    constructor({ uri }: schema.ImgData) {
        this.uri = uri;
    }
}

export class Item {
    cost?: schema.ValueData;
    weight?: number;

    constructor(parent: Entity, m: Manifest, data: schema.ItemData) {
        this.cost = data.cost;
        this.weight = data.weight;
    }
}

export class Tool {
    proficiency: string;
    skills?: { name: string; description: string }[];
    supplies?: {
        name: string;
        cost: string;
        weight: string;
        description: string;
    }[];
    activities?: { description: string; dc: string }[];
    uses?: { name: string; description: string }[];

    constructor(parent: Entity, m: Manifest, data: schema.ToolData) {
        this.proficiency = data.proficiency;
        this.skills = data.skills;
        this.supplies = data.supplies;
        this.activities = data.activities;
        this.uses = data.uses;
    }
}

interface ResolvedProperty {
    name: string;
    id: string;
    description: string;
    display: string;
    args: SMap<any>;
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
        for (const [k, v] of Object.entries(m)) {
            if (
                v.properties?.some(
                    (prop: schema.PropertyRef) => prop.ref === name
                )
            ) {
                this.entities.push(k);
            }
        }
    }

    /**
     * Generates a resolver function that has access to the manifest and parent Entity.
     * Convenient for mapping arrays of references, but can simply be called with Property.resolver(parent,m)(data).
     */
    static resolver(parent: Entity, m: Manifest) {
        /**
         * Resolves a Property reference into a ResolvedProperty.
         */
        return function (prop: schema.PropertyRef): ResolvedProperty {
            // expand ref into full id and get the property entity.
            const ref = `property$${prop.ref}`;
            const entity = m[ref];

            if (entity === undefined)
                throw `${parent.id} contains an undefined reference: "${ref}"!`;

            const property = entity.property;

            if (property === undefined)
                throw `${parent.id} references ${entity.id} as a property, but ${entity.id} lacks the property component!`;

            // check that the parent entity belongs to at least one of the categories this property requires.
            if (
                property.categories.length > 0 &&
                !property.categories.some((c: string) =>
                    m[parent.id].categories.includes(c)
                )
            )
                throw `${parent.id} [${
                    m[parent.id].categories
                }] does not match any possible categories for ${ref} [${
                    property.categories
                }]!`;

            // process display and description with arg values. replace <argname> with the arg values.
            var description = property.description;
            var display = property.display || entity.name;
            var argmap: SMap<any> = {};
            for (const arg of property.args) {
                // get arg value if it exists. throw error if it doesn't exist
                var val = prop[arg];
                if (val === undefined)
                    throw `property ${entity.name} of ${parent.id} is missing arg "${arg}"!`;

                description = description.replace(`<${arg}>`, val);
                display = display.replace(`<${arg}>`, val);
                argmap[arg] = val;
            }

            return {
                name: entity.name,
                id: entity.id,
                description,
                display,
                args: argmap,
            };
        };
    }
}

interface ResolvedCategory {
    name: string;
    id: string;
    description: string;
}

export class Category {
    entities: string[];

    constructor(parent: Entity, m: Manifest, data: schema.CategoryData) {
        // collect a list of ids of all entities that are in this category
        const name = parent.id.split('$')[1];
        this.entities = [];
        for (const k in m) {
            if (m[k].categories.includes(name)) {
                this.entities.push(k);
            }
        }
    }

    /**
     * Generates a resolver function that has access to the manifest and parent Entity.
     * Convenient for mapping arrays of references, but can simply be called with Category.resolver(parent,m)(data).
     */
    static resolver(parent: Entity, m: Manifest) {
        /**
         * Resolves a Property reference into a ResolvedCategory.
         */
        return function (ref: string): ResolvedCategory {
            const fullRef = `category$${ref}`;
            const entity = m[fullRef];

            if (entity === undefined)
                throw `${parent.id} contains an undefined reference: "${fullRef}"!`;

            return {
                name: entity.name,
                id: entity.id,
                description: <string>entity.description, // TODO: require description with category in validation
            };
        };
    }
}

export class Armor {
    ac: string | number;

    constructor(parent: Entity, m: Manifest, data: schema.ArmorData) {
        this.ac = data.ac;
    }
}

export class Weapon {
    damage?: string | number;
    type?: string;

    constructor(parent: Entity, m: Manifest, data: schema.WeaponData) {
        this.damage = data.damage;
        this.type = data.type;
    }
}

export class Vehicle {
    speed?: string;
    capacity?: string;
    workers?: string;

    constructor(parent: Entity, m: Manifest, data: schema.VehicleData) {
        this.speed = data.speed;
        this.capacity = data.capacity;
        this.workers = data.workers;
    }
}
