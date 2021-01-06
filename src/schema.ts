// Entities do not need to be in any particular file structure.
// They could all be in one giant file and it would work.
// Organization of entities is purely up to what makes the most sense to the author of the data.

// The root of each yaml file should be an array. As such, each entity should start with a "-".
// This is true even if a file contains only one entity.

// TODO: dependency structure? for example: Weapon requires Equipment? Category requires Description?

export interface EntityData {
    /**
     * Every entity needs a name. This does not have to be unique, just descriptive.
     */
    name: string,

    /**
     * Every entity needs an id. This needs to be unique.
     * Convention is namespaced ids, separated by $. For example, "tool$smithing".
     * @TJS-pattern ^\w+(\$\w+)+$
     */
    id: string,

    /**
     * Every entity should have at least one category, such as "weapon" or "equipment".
     * Categories are also defined by entities, with the id convention "category$<category-name>"".
     * Strings in this list should refer to categories by id. The "category$" prefix is automatically added.
     * Example:
     * category:
     *   - martial
     *   - ranged
     * 
     * @minItems 1
     */
    categories: string[],

    /**
     * Description is optional.
     * Should give a brief overview of an entity, just a few sentences.
     */
    description?: string,

    /**
     * If this entity defines a category, this should be `true`. Otherwise ignore.
     */
    category?: CategoryData,

    /**
     * A property defines special rules for using equipment.
     * If this entity defines a property that other entities will refer to, it should contain this `property` component.
     */
    property?: PropertyData,

    /**
     * A list of references to properties that this object has.
     */
    properties?: PropertyRef[],

    /**
     * Any entity that is a physical item with at least cost and weight should have this component.
     * This should be present on all equipment, even if all optional fields are skipped.
     */
    equipment?: EquipmentData,

    /**
     * If an entity is armor, it should include this component.
     */
    armor?: ArmorData,

    /**
     * If an entity is a weapon, it should include this component.
     */
    weapon?: WeaponData,

    /**
     * If an entity is a vehicle, it should include this component.
     */
    vehicle?: VehicleData,

    /**
     * The tool component is applied to non-combat equipment that requires proficiency in order to perform special tasks.
     * For example: tools, vehicles, and instruments.
     */
    tool?: ToolData,
}

export interface CategoryData {
    // Empty for now
}

export interface PropertyData {
    /**
     * Describes a list of categories this property could apply to.
     * For example, Range is only valid for the Weapon category.
     * The rules for this are the same as for the root `categories` list. "category$" is prepended automatically.
     */
    categories: string[],

    /**
     * Names of args that a property requires. For example, Range requires `normal` and `max` args.
     * Args are replaced in `description` and `display` wherever `<arg>` appears.
     * For example, Range.display is "Range(<normal>/<max>)"
     */
    args: string[],

    /**
     * Describes the property. This is different from the root description because args are replaced in it.
     */
    description: string,

    /**
     * Optional display string.
     * If it is undefined, it defaults to the root name. This is useful for unchanging properties like "Heavy".
     * If it is defined, args are replaced in it before being displayed.
     */
    display?: string,
}

export interface PropertyRef {
    /**
     * Refers to a proprty by id.
     * Like categories, "property$" is added automatically.
     */
    ref: string,

    /**
     * Other fields are args used by the property while being resolving.
     * Not all properties require args.
     * 
     * Range and Heavy for example:
     * properties:
     *   - ref: range
     *     normal: 30
     *     max: 60
     *   - ref: heavy
     */
    [key: string]: any
}

// TODO: handle "materials" like paper and ink, planks, ingots? Optional "bundle" and "unit" fields?
// TODO: rename to "item" or something to be more general?
export interface EquipmentData {
    /**
     * String including coinage, if the item has a value. For example "10 gp".
     * @TJS-pattern ^(((\d+,?)*\d+ (pp|gp|ep|sp|cp)) ?)+$
     */
    cost?: string,

    /**
     * String including unit. For example "5 lb" or "2.25 lb".
     * @TJS-pattern ^\d?\.?\d+ lb$
     */
    weight?: string,
}

export interface ArmorData {
    /**
     * The AC of this armor.
     * For example, "+2" or "13 + Dex Modifier (max 2)"
     */
    ac: string | number,
}

export interface WeaponData {
    /**
     * How much damage the weapon does.
     * This should be dice or a flat amount.
     * Optional -- useful for weapons like the Net.
     */
    damage?: string | number,

    /**
     * Damage type the weapon does. For example "Bludgeoning".
     * Optional -- useful for weapons like the Net.
     */
    type?: string,
}

// All three attributes can be null if they do not apply to a particular vehicle.
// All three attributes can be simple stats (like "30 mph") or short sentences describing properties of the vehicle.
// TODO: move some of this into equipment properties?
export interface VehicleData {
    speed?: string,
    capacity?: string,
    workers?: string,
}

// TODO: convert to entities?
export interface ToolSkillData {
    /**
     * Specifies one or more comma-separated skills.
     * For example "Arcana" or "Arcana, Religion, Investigation".
     */
    name: string,

    /**
     * Explains how this tool proficiency can effect the named skills.
     */
    description: string,
}

// TODO: convert to entities?
export interface ToolActivityData {
    /**
     * Describes the task being attempted
     */
    description: string,

    /**
     * An exmaple dc required for success. Format is "dc (Attribute)". For example "15 (Intelligence)"
     */
    dc: string
}

// TODO: convert to entities?
export interface ToolUseData {
    /**
     * Name of the task.
     */
    name: string,

    /**
     * Describes the task being performed, what materials and rolls it might require, and the possible results.
     */
    description: string,
}

// TODO: change `supplies` to reference other item/equipment entities?
// TODO: change `skills` to reference and augment skill entities, similar to how Properties work?
export interface ToolData {
    /**
     * A brief overview of what proficiency in this tool grants a character.
     */
    proficiency: string,

    /**
     * A list of skills and how they are affected by this tool proficiency.
     */
    skills?: ToolSkillData[],

    /**
     * Supplies that this tool miught use in its work.
     */
    supplies?: any[],

    /**
     * Examples of simple tasks this tool can do with a skill check.
     */
    activities?: ToolActivityData[],

    /**
     * Tasks that are more complex than activities and generally have more defined rules.
     */
    uses?: ToolUseData[];
}