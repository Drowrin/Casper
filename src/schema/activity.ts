import { Component } from './component';

Component.register(Activity);
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

Component.register(Activities);
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
