import { AbilityCheck } from './abilitycheck';
import { Component } from './component';

Component.register(Tool);
export namespace Tool {
    export const KEY = 'tool';
    export const REQUIRES = ['item', 'proficiency'];

    // TODO: change `supplies` to reference other item entities?
    // TODO: change `skills` to reference and augment skill entities, similar to how Properties work?
    export interface Data {
        /**
         * Non-exhaustive list of the most common supplies that this tool might use in its work.
         * each entry in this array should be a reference to an item.
         */
        supplies?: string[];

        /**
         * Examples of simple tasks this tool can do with a skill check.
         */
        checks?: AbilityCheck.Data[];
    }
}
