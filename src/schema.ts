// Entities do not need to be in any particular file structure.
// They could all be in one giant file and it would work.
// Organization of entities is purely up to what makes the most sense to the author of the data.

// The root of each yaml file should be an array. As such, each entity should start with a "-".
// This is true even if a file contains only one entity.

// TODO: convert this all into Typescript definitions and type checking?
// TODO: dependency structure? for example: Weapon requires Equipment? Category requires Description?

export default [{
    // Every entity needs a name. This does not have to be unique, just descriptive.
    name: "string",

    // Every entity needs an id. This needs to be unique.
    // Convention is namespaced ids, separated by $. For example, "tool$smithing".
    id: "string",

    // Every entity should have at least one category, such as "weapon" or "equipment".
    // Categories are also defined by entities, with the id convention "category$<category-name>"".
    // Strings in this list should refer to categories by id. The "category$" prefix is automatically added.
    // Example:
    // category:
    //   - martial
    //   - ranged
    //   - weapon
    categories: ["string"],

    // Description is optional.
    // Should give a brief overview of an entity, just a few sentences.
    "description?": "string",

    // If this entity defines a category, this should be `true`. Otherwise ignore.
    "category?": "boolean",

    // A property defines special rules for using equipment.
    // If this entity defines a property that other entities will refer to, it should contain this `property` component.
    //
    // `categories` describes a list of categories this property could apply to.
    //     For example, Range is only valid for the Weapon category.
    //     The rules for this are the same as for the root `categories` list. "category$" is prepended automatically.
    //
    // `args` lists names of args that a property requires. For example, Range requires `normal` and `max` args.
    //     Args are replaced in `description` and `display` wherever `<arg>` appears.
    //     For example, Range.display is "Range(<normal>/<max>)"
    //
    // `description` describes the property. This is different from the root description because args are replaced in it.
    //
    // `display` is optional.
    //     If it is undefined, it defaults to the root name. This is useful for unchanging properties like "Heavy".
    //     If it is defined, args are replaced in it before being displayed.
    "property?": {
        categories: ["string"],
        args: ["string"],
        description: "string",
        "display?": "string",
    },

    // Any entity that is a physical item with at least cost and weight should have this component.
    // TODO: handle "materials" like paper and ink, planks, ingots? Optional "bundle" and "unit" fields?
    // TODO: rename to "item" or something to be more general?
    // TODO: move properties to root component?
    //
    // `cost` is a string including coinage. For example "10 gp".
    //     May be null. Useful for items that do not have a market value.
    //
    // `weight` is a string including unit. For example "5 lb".
    //     May be null. Useful for items with negligible weight.
    //
    // `properties` is a list of objects that include `ref`, which refers to a property by id.
    //     Like categories, "property$" is added automatically.
    //     If the property requires args, they should be included as properties of the object.
    //     With Range and Heavy for example:
    //     properties:
    //       - ref: range
    //         normal: 30
    //         max: 60
    //       - ref: heavy
    "equipment?": {
        cost: "string",
        weight: "string",
        properties: [{
            ref: "string",
        }],
    },

    // If an entity is armor, it should include this component.
    // `ac` is a string describing the AC of this armor.
    //     For example, "+2" or "13 + Dex Modifier (max 2)"
    "armor?": {
        ac: "string",
    },

    // If an entity is a weapon, it should include this component.
    // `damage` is a string that describes how much damage the weapon does.
    //     This should be dice or a flat amount.
    //     May be null. Useful for weapons like the Net.
    //
    // `type` is a string that describes what damage type the weapon does. For example "Bludgeoning".
    //     May be null. Useful for weapons like the Net.
    //
    // Even if both damage and type are null, the weapon component should still be included on weapons.
    "weapon?": {
        damage: "string",
        type: "string",
    },

    // If an entity is a vehicle, it should include this component.
    // All three attributes can be null if they do not apply to a particular vehicle.
    // All three attributes can be simple stats (like "30 mph") or short sentences describing properties of the vehicle.
    // TODO: move some of this into equipment properties?
    "vehicle?": {
        speed: "string",
        capacity: "string",
        workers: "string",
    },

    // The tool component is applied to non-combat equipment that requires proficiency in order to perform special tasks.
    // For example: tools, vehicles, and instruments.
    // TODO: change `supplies` to reference other item/equipment entities?
    // TODO: change `skills` to reference and augment skill entities, similar to how Properties work?
    //
    // `proficiency` is a brief overview of what proficiency in this tool grants a character.
    //
    // `skills` is a list of objects with `name` and `description` properties.
    //     `name` specifies one or more skills.
    //     `description` explains how this tool proficiency can effect the named skills.
    //
    // `supplies` is a list of objects describing common supplies this tool might use in its work.
    //     `cost` and `weight` work just like the `Equipment` component.
    //     `name` and `description` work like the root attributes
    //
    // `activities` is a list of objects describing examples of simple tasks this tool can do with a skill check.
    //     `description` describes the task being attempted
    //     `dc` describes an exmaple dc required for success. Format is "dc (Attribute)". For example "15 (Intelligence)"
    //
    // `uses` is a list of objects describing tasks that are more complex than activities.
    //     `name` is the name of the task.
    //     `description` describes the task being performed, what materials and rolls it might require, and the possible results.
    "tool?": {
        proficiency: "string",
        skills: [{
            name: "string",
            description: "string",
        }],
        supplies: [{
            name: "string",
            cost: "string",
            weight: "string",
            description: "string",
        }],
        activities: [{
            description: "string",
            dc: "string",
        }],
        uses: [{
            name: "string",
            description: "string",
        }],
    },
}];