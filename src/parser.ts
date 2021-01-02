function validate(name: string, data: any, required: string[]) {
    if (data === undefined)
        throw `${name} must be non-empty!`
    
    for (var r of required) {
        if (data[r] === undefined)
            throw `${name} is missing "${r}"!`
    }
}

var component_data: Map<string, any> = new Map();
function component(c: any) {
    component_data.set(c.name.toLowerCase(), c);
    return c;
}

export class Entity {
    name: string;
    id: string;
    components: { [key: string]: any };
    description?: string;

    constructor(m: { [key: string]: any }, data: any) {
        validate('root', data, ['id', 'name']);

        var { name, id, description, ...components} = data;

        this.name = name;
        this.id = id;

        if (description !== undefined)
            this.description = description;

        this.components = {};

        for (var key in components) {
            if (component_data.get(key) === undefined)
                throw `${this.id} contains unknown component: "${key}"!`
            
            var f = component_data.get(key);
            this.components[key] = new f(this, m, components[key]);
        }
    }
}

@component
export class Equipment {
    categories: object[];
    cost: string;
    weight: string;

    constructor(parent: Entity, m: { [key: string]: any }, data: any) {
        validate('equipment', data, ['categories', 'cost', 'weight']);

        const { categories, cost, weight } = data;

        this.cost = cost;
        this.weight = weight;
        this.categories = categories.map(function (s: string) {
            const ref = `category$${s}`;
            const entity = m[ref];

            if (entity === undefined)
                throw `${parent.id} contains an undefined reference: "${ref}"!`
            
            return {
                name: entity.name,
                id: entity.id,
                description: entity.description,
            };
        });
    }
}

@component
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

@component
export class Property {
    categories: string[];
    args: string[];
    description: string;
    display: string;

    constructor(parent: Entity, m: { [key: string]: any }, data: any) {
        validate('property', data, ['categories', 'args', 'description', 'display']);

        const { categories, args, description, display } = data;

        this.categories = categories;
        this.args = args;
        this.description = description;
        this.display = display;
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

@component
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
}

@component
export class Armor {
    ac: string;
    properties: object[];

    constructor(parent: Entity, m: { [key: string]: any }, data: any ) {
        validate('armor', data, ['ac', 'properties']);

        const equipment = parent.components.equipment;

        if (equipment === undefined)
            throw `${parent.id} cannot be armor without also being equipment!`

        const { ac, properties } = data;

        this.ac = ac;
        this.properties = properties.map(Property.resolver(parent, m));
    }
}

@component
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

@component
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