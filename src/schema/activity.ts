import { components } from '.';
import { component, requires } from './component';

export interface ActivityData {
    /**
     * Time taken to perform this activity.
     * If it is not an action type, it should be a span of time taken to perform the activity.
     */
    time: string;
}

@component('activity')
@requires('desctiption')
export class Activity {
    time: string;

    constructor(data: ActivityData) {
        this.time = data.time;
    }
}
