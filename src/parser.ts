function validate(name: string, data: any, required: string[]) {
    if (data === undefined)
        throw `${name} must be non-empty!`
    
    for (var r of required) {
        if (data[r] === undefined)
            throw `${name} is missing "${r}"!`
    }
}

export class Entity {
    name: string;
    id: string;

    description?: string;

    equipment?:Equipment;
    tool?:Tool;
    property?:Property;
    category?:Category;
    armor?:Armor;
    weapon?:Weapon;
    vehicle?:Vehicle;

    constructor(m: { [key: string]: any }, data: any) {
        validate('root', data, ['id', 'name']);

        this.name = data.name;
        this.id = data.id;

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
    categories: object[];
    cost: string;
    weight: string;

    constructor(parent: Entity, m: { [key: string]: any }, data: any) {
        validate('equipment', data, ['categories', 'cost', 'weight']);

        const { categories, cost, weight } = data;

        this.cost = cost;
        this.weight = weight;
        this.categories = categories.map(Category.resolver(parent, m));
    }
}

export class Tool {
    proficiency: string;
    skills: object[];
    supplies: object[];
    uses: object[];
    activities: object[];

    constructor(parent: Entity, m: { [key: string]: any }, data: any) {
        validate('tool', data, ['proficiency', 'skills', 'supplies', 'uses', 'activities']);

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
        validate('property', data, ['categories', 'args', 'description', 'display']);

        const { categories, args, description, display } = data;

        this.categories = categories;
        this.args = args;
        this.description = description;
        this.display = display;

        const name = parent.id.split('$')[1];
        this.entities = [];
        for (const k in m) {
            const e = m[k].armor || m[k].weapon;
            if (e && e.properties.some((prop: any) => prop.ref === name)){
                this.entities.push(k);
            }
        }
    }

    static resolver(parent: Entity, m: { [key: string]: any }) {
        return function (prop: any) {
            const equipment = m[parent.id].equipment;

            if (equipment === undefined)
                throw `${parent.id} cannot be a weapon without also being equipment!`

            const ref = `property$${prop.ref}`;
            const entity = m[ref];

            if (entity === undefined)
                throw `${parent.id} contains an undefined reference: "${ref}"!`
            
            const property = entity.property;

            if (property.categories.length > 0 && !property.categories.some((c: any) => equipment.categories.includes(c)))
                throw `${parent.id} [${equipment.categories}] does not match any possible categories for ${ref} [${property.categories}]!`
            
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
            if (m[k].equipment && m[k].equipment.categories.includes(name)){
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
    properties: object[];

    constructor(parent: Entity, m: { [key: string]: any }, data: any ) {
        validate('armor', data, ['ac', 'properties']);

        const equipment = parent.equipment;

        if (equipment === undefined)
            throw `${parent.id} cannot be armor without also being equipment!`

        const { ac, properties } = data;

        this.ac = ac;
        this.properties = properties.map(Property.resolver(parent, m));
    }
}

export class Weapon {
    damage: string;
    type: string;
    properties: object[];

    constructor(parent: Entity, m: { [key: string]: any }, data: any ) {
        validate('weapon', data, ['damage', 'type', 'properties']);
        
        const { damage, type, properties } = data;

        this.damage = damage;
        this.type = type;
        this.properties = properties.map(Property.resolver(parent, m));
    }
}

export class Vehicle {
    speed: string;
    capacity: string;
    workers: string;

    constructor(parent: Entity, m: { [key: string]: any }, data: any ) {
        validate('vehicle', data, ['speed', 'capacity', 'workers']);

        const { speed, capacity, workers } = data;

        this.speed = speed;
        this.capacity = capacity;
        this.workers = workers;
    }
}