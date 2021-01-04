export const schema = [{
        name: "string",
        id: "string",

        "description?": "string",

        "category?": "boolean",

        "property?": {
            categories: ["string"],
            args: ["string"],
            description: "string",
            "display?": "string",
        },

        "equipment?": {
            categories: ["string"],
            cost: "string",
            weight: "string",
        },

        "armor?": {
            ac: "string",
            properties: [{
                ref: "string",
            }],
        },

        "weapon?": {
            damage: "string",
            type: "string",
            properties: [{
                ref: "string",
            }],
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