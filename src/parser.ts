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

    // optional. brief description of this entity.
    description?: string;

    // optional components
    // if the raw data contains a matching field, it is resolved into a component
    equipment?:Equipment;
    properties?:ResolvedProperty[];
    tool?:Tool;
    property?:Property;
    category?:Category;
    armor?:Armor;
    weapon?:Weapon;
    vehicle?:Vehicle;

    constructor(m: { [key: string]: any }, data: any) {
        this.name = data.name;
        this.id = data.id;

        this.categories = data.categories.map(Category.resolver(this, m));

        this.description = data.description;

        if (data.equipment) this.equipment = new Equipment(this, m, data.equipment);
        if (data.properties) this.properties = data.properties.map(Property.resolver(this, m));
        if (data.tool) this.tool = new Tool(this, m, data.tool);
        if (data.property) this.property = new Property(this, m, data.property);
        if (data.category) this.category = new Category(this, m, data.category);
        if (data.armor) this.armor = new Armor(this, m, data.armor);
        if (data.weapon) this.weapon = new Weapon(this, m, data.weapon);
        if (data.vehicle) this.vehicle = new Vehicle(this, m, data.vehicle);
    }
}

export class Equipment {
    cost: string;
    weight: string;

    constructor(parent: Entity, m: { [key: string]: any }, data: any) {
        this.cost = data.cost;
        this.weight = data.weight;
    }
}

export class Tool {
    proficiency: string;
    skills: {name: string, description: string}[];
    supplies: {name: string, cost: string, weight: string, description: string}[];
    activities: {description: string, dc: string}[];
    uses: {name: string, description: string}[];

    constructor(parent: Entity, m: { [key: string]: any }, data: any) {
        this.proficiency = data.proficiency;
        this.skills = data.skills;
        this.supplies = data.supplies;
        this.uses = data.uses;
        this.activities = data.activities;
    }
}

class ResolvedProperty {
    constructor(
        public name: string,
        public id: string,
        public description: string,
        public display: string,
        public args: { [key: string]: {ref: string, [key: string]: any} },
    ) {}
}


export class Property {
    categories: string[];
    args: string[];
    description: string;
    display: string;
    entities: string[];

    constructor(parent: Entity, m: { [key: string]: any }, data: any) {
        this.categories = data.categories;
        this.args = data.args;
        this.description = data.description;
        this.display = data.display;

        // collect a list of ids of all entities that contain this property
        const name = parent.id.split('$')[1];
        this.entities = [];
        for (const k in m) {
            if (m[k].properties && m[k].properties.some((prop: any) => prop.ref === name)){
                this.entities.push(k);
            }
        }
    }

    /**
     * Generates a resolver function that has access to the manifest and parent Entity.
     * Convenient for mapping arrays of references, but can simply be called with Property.resolver(parent,m)(data).
     */
    static resolver(parent: Entity, m: { [key: string]: any }) {
        /**
         * Resolves a Property reference into a ResolvedProperty.
         */
        return function (prop: {ref: string, [key:string]: any}): ResolvedProperty {
            // expand ref into full id and get the property entity.
            const ref = `property$${prop.ref}`;
            const entity = m[ref];

            if (entity === undefined)
                throw `${parent.id} contains an undefined reference: "${ref}"!`
            
            const property = entity.property;

            // check that the parent entity belongs to at least one of the categories this property requires.
            if (property.categories.length > 0 && !property.categories.some((c: any) => m[parent.id].categories.includes(c)))
                throw `${parent.id} [${m[parent.id].categories}] does not match any possible categories for ${ref} [${property.categories}]!`
            
            // process display and description with arg values. replace <argname> with the arg values.
            var description = property.description;
            var display = property.display || entity.name;
            var argmap: { [key: string]: any } = {};
            for (const arg of property.args) {
                // get arg value if it exists. throw error if it doesn't exist
                var val = prop[arg];
                if (val === undefined)
                    throw `property ${entity.name} of ${parent.id} is missing arg "${arg}"!`

                description = description.replace(`<${arg}>`, val);
                display = display.replace(`<${arg}>`, val);
                argmap[arg] = val;
            }
            
            return new ResolvedProperty(entity.name, entity.id, description, display, argmap);
        }
    }
}

class ResolvedCategory {
    constructor(
        public name: string,
        public id: string,
        public description: string,
    ) {}
}

export class Category {
    entities: string[];

    constructor(parent: Entity, m: { [key: string]: any }, data: any ) {
        // collect a list of ids of all entities that are in this category
        const name = parent.id.split('$')[1];
        this.entities = [];
        for (const k in m) {
            if (m[k].categories.includes(name)){
                this.entities.push(k);
            }
        }
    }

    /**
     * Generates a resolver function that has access to the manifest and parent Entity.
     * Convenient for mapping arrays of references, but can simply be called with Category.resolver(parent,m)(data).
     */
    static resolver(parent: Entity, m: { [key: string]: any }) {
        /**
         * Resolves a Property reference into a ResolvedCategory.
         */
        return function (ref: string): ResolvedCategory {
            const fullRef = `category$${ref}`;
            const entity = m[fullRef];

            if (entity === undefined)
                throw `${parent.id} contains an undefined reference: "${fullRef}"!`
            
            return new ResolvedCategory (entity.name, entity.id, entity.description);
        };
    }
}

export class Armor {
    ac: string;

    constructor(parent: Entity, m: { [key: string]: any }, data: any ) {
        this.ac = data.ac;
    }
}

export class Weapon {
    damage: string;
    type: string;

    constructor(parent: Entity, m: { [key: string]: any }, data: any ) {
        this.damage = data.damage;
        this.type = data.type;
    }
}

export class Vehicle {
    speed: string;
    capacity: string;
    workers: string;

    constructor(parent: Entity, m: { [key: string]: any }, data: any ) {
        this.speed = data.speed;
        this.capacity = data.capacity;
        this.workers = data.workers;
    }
}