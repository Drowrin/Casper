import { EntityData, Manifest } from '../schema';
import { Armor } from './armor';
import { Category, ResolvedCategory } from './category';
import { Component } from './component';
import { Img } from './img';
import { Item } from './item';
import { Property, ResolvedProperty } from './property';
import { Tool } from './tool';
import { Vehicle } from './vehicle';
import { Weapon } from './weapon';

/**
 * Collection of components that will attempt to resolve in each entity
 */
export const components: Component[] = [
    Img,
    Item,
    Tool,
    ResolvedProperty,
    Property,
    ResolvedCategory,
    Category,
    Armor,
    Weapon,
    Vehicle,
];

/**
 * The core of all casper data. Everything is an entity.
 * All entities have a name, id, and at least one category.
 * All the other fields are optional components.
 */
export class Entity {
    // required fields
    name: string;
    id: string;

    // optional. brief description of this entity.
    description?: string;

    // optional components
    // if the raw data contains a matching field, it is resolved into a component
    [key: string]: any;

    constructor(data: EntityData, m: Manifest) {
        this.name = data.name;
        this.id = data.id;

        this.description = data.description;

        for (const comp of components) {
            comp.resolve?.(data, this, m);
        }
    }
}
