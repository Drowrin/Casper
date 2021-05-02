import { Component } from './component';

export namespace Activity {
    export const KEY = 'activity';
    export const REQUIRES = ['description'];

    export interface Data {
        /**
         * Time taken to perform this activity.
         * If it is not an action type, it should be a span of time taken to perform the activity.
         */
        time: string;
    }
}
Component.register(Activity);

declare module '.' {
    export interface EntityData {
        /**
         * If an entity describes an activity or action a character can take, it should include this component.
         */
        activity?: Activity.Data;
    }
}

export namespace Activities {
    export const KEY = 'activities';

    export interface Data {
        /**
         * Refers to an activity by id.
         */
        ref: string;
    }

    export function process(data: Data, ctx: Component.Context) {
        const ref = `activity.${data.ref}`;
        const entity = ctx.manifest[ref];

        if (entity === undefined)
            throw `${ctx.parent.id} contains an undefined reference: "${ref}!`;

        const activity = entity.activity;

        if (activity === undefined)
            throw `${ctx.parent.id} references ${entity.id} as an activity, but ${entity.id} lacks the activity component!`;

        return {
            name: entity.name,
            id: entity.id,
            description: {
                raw: entity.description,
                rendered: ctx.markdown.makeHtml(<string>entity.description),
            },
            time: activity.time,
        };
    }
}
Component.register(Activities);

declare module '.' {
    export interface EntityData {
        /**
         * A list of activities related to this entity.
         */
        activities?: Activities.Data[];
    }
}
