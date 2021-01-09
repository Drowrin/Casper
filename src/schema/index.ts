import { Armor, ArmorData } from './armor';
import { Category, CategoryData, ResolvedCategory } from './category';
import { Component } from './component';
import { Img, ImgData } from './img';
import { Item, ItemData } from './item';
import {
    Property,
    PropertyData,
    PropertyRef,
    ResolvedProperty,
} from './property';
import { Tool, ToolData } from './tool';
import { Vehicle, VehicleData } from './vehicle';
import { Weapon, WeaponData } from './weapon';

export interface EntityData {
    /**
     * Every entity needs a name. This does not have to be unique, just descriptive.
     */
    name: string;

    /**
     * Every entity needs an id. This needs to be unique.
     * Convention is namespaced ids, separated by $. For example, "tool$smithing".
     * @TJS-pattern ^\w+(\$\w+)+$
     */
    id: string;

    /**
     * Every entity should have at least one category, such as "weapon".
     * Categories are also defined by entities, with the id convention "category$<category-name>"".
     * Strings in this list should refer to categories by id. The "category$" prefix is automatically added.
     * Example:
     * category:
     *   - martial
     *   - ranged
     *
     * @minItems 1
     */
    categories: string[];

    /**
     * Description is optional.
     * Should give a brief overview of an entity, just a few sentences.
     */
    description?: string;

    /**
     * Source is optional.
     * The book or other source that this entity was published in.
     * example: Player's Handbook pg.69
     */
    source?: string;

    /**
     * Optional image to be displayed with an entity.
     */
    img?: ImgData;

    /**
     * If this entity defines a category, this should be `true`. Otherwise ignore.
     */
    category?: CategoryData;

    /**
     * A property defines special rules for using equipment.
     * If this entity defines a property that other entities will refer to, it should contain this `property` component.
     */
    property?: PropertyData;

    /**
     * A list of references to properties that this object has.
     */
    properties?: PropertyRef[];

    /**
     * Any entity that is a physical item with at least cost and weight should have this component.
     * This should be present on all items, even if all optional fields are skipped.
     */
    item?: ItemData;

    /**
     * If an entity is armor, it should include this component.
     */
    armor?: ArmorData;

    /**
     * If an entity is a weapon, it should include this component.
     */
    weapon?: WeaponData;

    /**
     * If an entity is a vehicle, it should include this component.
     */
    vehicle?: VehicleData;

    /**
     * The tool component is applied to non-combat equipment that requires proficiency in order to perform special tasks.
     * For example: tools, vehicles, and instruments.
     */
    tool?: ToolData;
}

export type Manifest = { [key: string]: EntityData };

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

    // optional fields
    // brief description of this entity.
    description?: string;
    // publilshed source of this entity.
    source?: string;

    // optional components
    // if the raw data contains a matching field, it is resolved into a component
    [key: string]: any;

    constructor(data: EntityData, m: Manifest) {
        this.name = data.name;
        this.id = data.id;

        this.description = data.description;
        this.source = data.source;

        // Check all possible components against the entity data.
        // If a component key matches, the constructed component is added to this Entity.
        for (const comp of components) {
            comp.resolve?.(data, this, m);
        }
    }
}
