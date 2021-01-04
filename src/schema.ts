export const schema = [{
    name: "string",
    id: "string",
    categories: ["string"],

    "description?": "string",

    "category?": "boolean",

    "property?": {
        categories: ["string"],
        args: ["string"],
        description: "string",
        "display?": "string",
    },

    "equipment?": {
        cost: "string",
        weight: "string",
        properties: [{
            ref: "string",
        }],
    },

    "armor?": {
        ac: "string",
    },

    "weapon?": {
        damage: "string",
        type: "string",
    },

    "vehicle?": {
        speed: "string",
        capacity: "string",
        workers: "string",
    },

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
        uses: [{
            name: "string",
            description: "string",
        }],
        activities: [{
            description: "string",
            dc: "string",
        }],
    },
}];