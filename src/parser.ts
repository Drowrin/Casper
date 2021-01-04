export class Entity {
    name: string;
    id: string;
    categories: object[];

    description?: string;

    equipment?:Equipment;
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
        if (data.tool) this.tool = new Tool(this, m, data.tool);
        if (data.property) this.property = new Property(this, m, data.property);
        if (data.category) this.category = new Category(this, m, data.category);
        if (data.armor) this.armor = new Armor(this, m, data.armor);
        if (data.weapon) this.weapon = new Weapon(this, m, data.weapon);
        if (data.vehicle) this.vehicle = new Vehicle(this, m, data.vehicle);
    }
}

export class Equipment {
    properties: object[];
    cost: string;
    weight: string;

    constructor(parent: Entity, m: { [key: string]: any }, data: any) {
        const { categories, cost, weight, properties } = data;

        this.cost = cost;
        this.weight = weight;
        this.properties = properties.map(Property.resolver(parent, m));
    }
}

export class Tool {
    proficiency: string;
    skills: object[];
    supplies: object[];
    uses: object[];
    activities: object[];

    constructor(parent: Entity, m: { [key: string]: any }, data: any) {
        const { proficiency, skills, supplies, uses, activities } = data;

        this.proficiency = proficiency;
        this.skills = skills;
        this.supplies = supplies;
        this.uses = uses;
        this.activities = activities;
    }
}

export class Property {
    categories: string[];
    args: string[];
    description: string;
    display: string;
    entities: string[];

    constructor(parent: Entity, m: { [key: string]: any }, data: any) {
        const { categories, args, description, display } = data;

        this.categories = categories;
        this.args = args;
        this.description = description;
        this.display = display;

        const name = parent.id.split('$')[1];
        this.entities = [];
        for (const k in m) {
            if (m[k].equipment && m[k].equipment.properties.some((prop: any) => prop.ref === name)){
                this.entities.push(k);
            }
        }
    }

    static resolver(parent: Entity, m: { [key: string]: any }) {
        return function (prop: any) {
            const ref = `property$${prop.ref}`;
            const entity = m[ref];

            if (entity === undefined)
                throw `${parent.id} contains an undefined reference: "${ref}"!`
            
            const property = entity.property;
            
            if (property.categories.length > 0 && !property.categories.some((c: any) => m[parent.id].categories.includes(c)))
                throw `${parent.id} [${m[parent.id].categories}] does not match any possible categories for ${ref} [${property.categories}]!`
            
            var description = property.description;
            var display = property.display || entity.name;
            var argmap: { [key: string]: any } = {};
            for (const arg of property.args) {
                var val = prop[arg];
                if (val === undefined)
                    throw `property ${entity.name} of ${parent.id} is missing arg "${arg}"!`

                description = description.replace(`<${arg}>`, val);
                display = display.replace(`<${arg}>`, val);
                argmap[arg] = val;
            }
            
            return {
                name: entity.name,
                id: entity.id,
                description: description,
                display: display,
                ...argmap
            }
        }
    }
}

export class Category {
    entities: string[];

    constructor(parent: Entity, m: { [key: string]: any }, data: any ) {
        const name = parent.id.split('$')[1];
        this.entities = [];
        for (const k in m) {
            if (m[k].categories.includes(name)){
                this.entities.push(k);
            }
        }
    }

    static resolver(parent: Entity, m: { [key: string]: any }) {
        return function (ref: string) {
            const fullRef = `category$${ref}`;
            const entity = m[fullRef];

            if (entity === undefined)
                throw `${parent.id} contains an undefined reference: "${fullRef}"!`
            
            return {
                name: entity.name,
                id: entity.id,
                description: entity.description,
            };
        };
    }
}

export class Armor {
    ac: string;

    constructor(parent: Entity, m: { [key: string]: any }, data: any ) {
        const equipment = parent.equipment;

        if (equipment === undefined)
            throw `${parent.id} cannot be armor without also being equipment!`

        const { ac, properties } = data;

        this.ac = ac;
    }
}

export class Weapon {
    damage: string;
    type: string;

    constructor(parent: Entity, m: { [key: string]: any }, data: any ) {
        const { damage, type, properties } = data;

        this.damage = damage;
        this.type = type;
    }
}

export class Vehicle {
    speed: string;
    capacity: string;
    workers: string;

    constructor(parent: Entity, m: { [key: string]: any }, data: any ) {
        const { speed, capacity, workers } = data;

        this.speed = speed;
        this.capacity = capacity;
        this.workers = workers;
    }
}