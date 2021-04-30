import { Converter } from 'showdown';
import {
    Activity,
    ActivityData,
    ActivityRef,
    ResolvedActivity,
} from './activity';
import { Armor, ArmorData } from './armor';
import { Article, ArticleData } from './article';
import { Component } from './component';
import { Description, DescriptionData } from './description';
import { Img, ImgData } from './img';
import { Item, ItemData } from './item';
import { Proficiency, ProficiencyData } from './proficiency';
import {
    Property,
    PropertyData,
    PropertyRef,
    ResolvedProperty,
} from './property';
import { Source, SourceData } from './source';
import { Spell, SpellData } from './spell';
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
     * Convention is namespaced ids, separated by $. For example, "tool$smithing" or "tool$instrument$drum".
     * These namespaces are categories.
     * A category should be an existing entity with an id like "tool$*" or "tool$instrument$*"
     * @TJS-pattern ^\w+(\$(\w+|\*))*$
     */
    id: string;

    /**
     * Some entities belong to multiple categories.
     * Additional categories that do not fit in the id can be added here.
     * Example:
     * categories:
     *   - weapon$martial
     *   - weapon$ranged
     */
    categories?: string[];

    /**
     * Description is optional.
     * Should give a brief overview of an entity, just a few sentences.
     */
    description?: DescriptionData;

    /**
     * Article is for longer text than description--text that is the primary content of the entity.
     * Description is required, as article is too long to be shown in search results.
     */
    article?: ArticleData;

    /**
     * Source is optional.
     * The book or other source that this entity was published in.
     * example: Player's Handbook pg.69
     */
    source?: SourceData;

    /**
     * Optional image to be displayed with an entity.
     */
    img?: ImgData;

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
     * If an entity is a spell, it should include this component.
     */
    spell?: SpellData;

    /**
     * If an entity is a vehicle, it should include this component.
     */
    vehicle?: VehicleData;

    /**
     * If an entity describes an activity or action a character can take, it should include this component.
     */
    activity?: ActivityData;

    /**
     * A list of activities related to this entity.
     */
    activities?: ActivityRef[];

    /**
     * If an entity represents something that a character can be proficient in, it should have this component.
     */
    proficiency?: ProficiencyData;

    /**
     * The tool component is applied to non-combat equipment that requires proficiency in order to perform special tasks.
     * For example: tools, vehicles, and instruments.
     */
    tool?: ToolData;
}

export interface CategoryData {
    name: string;
    id: string;
    description: string;
}

function getAllCategories(m: Manifest): Manifest {
    return Object.entries(m)
        .filter(([k, _]) => k.endsWith('*'))
        .reduce((o, [k, v]) => {
            if (v.description === undefined)
                throw `${v.id} does not contain "description", which is a requirement to be a category`;
            return {
                ...o,
                [k.slice(0, -1)]: v,
            };
        }, {});
}

function getEntityCategories(data: EntityData, m: Manifest) {
    const cats = getAllCategories(m);

    let out = [];

    for (const [k, v] of Object.entries(cats)) {
        if (data.id.startsWith(k)) {
            out.push(v);
        }
    }

    data.categories?.forEach((e) => {
        const cat = cats[`${e}$`];

        if (cat === undefined)
            throw `${data.id} contains an undefined reference: "${e}"`;

        out.push(cat);
    });

    return <CategoryData[]>out;
}

function resolveCategory(ed: EntityData, entity: Entity, m: Manifest) {
    if (ed.id.endsWith('*')) {
        entity.entities = [];

        for (const [k, v] of Object.entries(m)) {
            if (
                getEntityCategories(v, m)
                    .map((e) => e.id)
                    .includes(ed.id)
            ) {
                entity.entities.push(k);
            }
        }
    }
}

export type Manifest = { [key: string]: EntityData };

/**
 * Collection of components that will attempt to resolve in each entity
 */
export const components: Component[] = [
    Description,
    Article,
    Source,
    Img,
    Item,
    Tool,
    ResolvedProperty,
    Property,
    Armor,
    Weapon,
    Vehicle,
    Proficiency,
    Activity,
    ResolvedActivity,
    Spell,
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

    categories: CategoryData[];

    // optional components
    // if the raw data contains a matching field, it is resolved into a component
    [key: string]: any;

    constructor(data: EntityData, m: Manifest, c: Converter) {
        this.name = data.name;
        this.id = data.id;

        this.categories = getEntityCategories(data, m);
        resolveCategory(data, this, m);

        // Check all possible components against the entity data.
        // If a component key matches, the constructed component is added to this Entity.
        for (const comp of components) {
            comp.resolve?.(data, this, m, c);
        }
    }
}
