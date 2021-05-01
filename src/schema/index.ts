import { Converter } from 'showdown';
import { Activities, Activity } from './activity';
import { Armor } from './armor';
import { Article } from './article';
import { Component } from './component';
import { Description } from './description';
import { Img } from './img';
import { Item } from './item';
import { Proficiency } from './proficiency';
import { Properties, Property } from './property';
import { Source } from './source';
import { Spell } from './spell';
import { Tool } from './tool';
import { Vehicle } from './vehicle';
import { Weapon } from './weapon';

export interface EntityData {
    /**
     * Every entity needs a name. This does not have to be unique, just descriptive.
     */
    name: string;

    /**
     * Every entity needs an id. This needs to be unique.
     * Convention is namespaced ids, separated by .
     * For example, "tool.smithing" or "tool.instrument.drum".
     * These namespaces are categories.
     * A category should be an existing entity with an id like "tool.*" or "tool.instrument.*"
     * @TJS-pattern ^\w+(.(\w+|\*))*$
     */
    id: string;

    /**
     * Some entities belong to multiple categories.
     * Additional categories that do not fit in the id can be added here.
     * Example:
     * categories:
     *   - weapon.martial
     *   - weapon.ranged
     */
    categories?: string[];

    /**
     * Description is optional.
     * Should give a brief overview of an entity, just a few sentences.
     */
    description?: Description.Data;

    /**
     * Article is for longer text than description--text that is the primary content of the entity.
     * Description is required, as article is too long to be shown in search results.
     */
    article?: Article.Data;

    /**
     * Source is optional.
     * The book or other source that this entity was published in.
     * example: Player's Handbook pg.69
     */
    source?: Source.Data;

    /**
     * Optional image to be displayed with an entity.
     */
    img?: Img.Data;

    /**
     * A property defines special rules for using equipment.
     * If this entity defines a property that other entities will refer to, it should contain this `property` component.
     */
    property?: Property.Data;

    /**
     * A list of references to properties that this object has.
     */
    properties?: Properties.Data[];

    /**
     * Any entity that is a physical item with at least cost and weight should have this component.
     * This should be present on all items, even if all optional fields are skipped.
     */
    item?: Item.Data;

    /**
     * If an entity is armor, it should include this component.
     */
    armor?: Armor.Data;

    /**
     * If an entity is a weapon, it should include this component.
     */
    weapon?: Weapon.Data;

    /**
     * If an entity is a spell, it should include this component.
     */
    spell?: Spell.Data;

    /**
     * If an entity is a vehicle, it should include this component.
     */
    vehicle?: Vehicle.Data;

    /**
     * If an entity describes an activity or action a character can take, it should include this component.
     */
    activity?: Activity.Data;

    /**
     * A list of activities related to this entity.
     */
    activities?: Activities.Data[];

    /**
     * If an entity represents something that a character can be proficient in, it should have this component.
     */
    proficiency?: Proficiency.Data;

    /**
     * The tool component is applied to non-combat equipment that requires proficiency in order to perform special tasks.
     * For example: tools, vehicles, and instruments.
     */
    tool?: Tool.Data;
}

export interface CategoryData {
    name: string;
    id: string;
    description: { raw: string; rendered: string };
}

type CategoryMap = { [key: string]: CategoryData };

export function getAllCategories(m: Manifest, c: Converter): CategoryMap {
    return Object.entries(m)
        .filter(([k, _]) => k.endsWith('*'))
        .reduce((o, [k, v]) => {
            if (v.description === undefined)
                throw `${v.id} does not contain "description", which is a requirement to be a category`;
            return {
                ...o,
                [k.slice(0, -1)]: {
                    name: v.name,
                    id: v.id,
                    description: {
                        raw: v.description,
                        rendered: c.makeHtml(v.description),
                    },
                },
            };
        }, {});
}

function getEntityCategories(
    data: EntityData,
    cats: CategoryMap,
    c: Converter
) {
    let out = [];

    for (const [k, v] of Object.entries(cats)) {
        if (data.id.startsWith(k)) {
            out.push(v);
        }
    }

    data.categories?.forEach((e) => {
        const cat = cats[`${e}.`];

        if (cat === undefined)
            throw `${data.id} contains an undefined reference: "${e}"`;

        out.push(cat);
    });

    return <CategoryData[]>out;
}

function resolveCategory(
    ed: EntityData,
    entity: Entity,
    m: Manifest,
    cats: { [key: string]: CategoryData },
    c: Converter
) {
    if (ed.id.endsWith('*')) {
        entity.entities = [];

        for (const [k, v] of Object.entries(m)) {
            if (
                getEntityCategories(v, cats, c)
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
    Property,
    Property,
    Armor,
    Weapon,
    Vehicle,
    Proficiency,
    Activity,
    Activity,
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

    constructor(
        data: EntityData,
        m: Manifest,
        cats: CategoryMap,
        c: Converter
    ) {
        this.name = data.name;
        this.id = data.id;

        this.categories = getEntityCategories(data, cats, c);
        resolveCategory(data, this, m, cats, c);

        // Check all possible components against the entity data.
        // If a component key matches, the constructed component is added to this Entity.
        for (const comp of components) {
            Component.resolve(comp, data, this, m, c);
        }
    }
}
