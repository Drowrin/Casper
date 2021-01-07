import { Entity } from '.';
import { CategoryData, Manifest } from '../schema';
import { component } from './component';

@component('category')
export class Category {
    entities: string[];

    constructor(data: CategoryData, parent: Entity, m: Manifest) {
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
