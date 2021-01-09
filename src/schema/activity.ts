import { Entity, Manifest } from '.';
import { component, requires } from './component';

export interface ActivityData {
    /**
     * Time taken to perform this activity.
     * If it is not an action type, it should be a span of time taken to perform the activity.
     */
    time: string;
}

@component('activity')
@requires('description')
export class Activity {
    time: string;

    constructor(data: ActivityData) {
        this.time = data.time;
    }
}

export interface ActivityRef {
    /**
     * Refers to an activity by id.
     */
    ref: string;
}

@component('activities')
export class ResolvedActivity {
    name: string;
    id: string;
    description: string;
    time: string;

    constructor(data: ActivityRef, parent: Entity, m: Manifest) {
        const ref = `activity$${data.ref}`;
        const entity = m[ref];

        if (entity === undefined)
            throw `${parent.id} contains an undefined reference: "${ref}!`;

        const activity = entity.activity;

        if (activity === undefined)
            throw `${parent.id} references ${entity.id} as an activity, but ${entity.id} lacks the activity component!`;

        this.name = entity.name;
        this.id = entity.id;
        this.description = <string>entity.description;
        this.time = activity.time;
    }
}
