import { Component } from '../component';

export namespace Id {
    export const KEY = 'id';
    export const HOIST = true;

    export type Data = string;
}
Component.register(Id);

declare module '.' {
    export interface EntityData {
        /**
         * Every entity needs an id. This needs to be unique.
         * This is a required field.
         * Convention is namespaced ids, separated by .
         * For example, "tool.smithing" or "tool.instrument.drum".
         * These namespaces are categories.
         * A category should be an existing entity with an id like "tool.*" or "tool.instrument.*"
         * @TJS-pattern ^\w+(.(\w+|\*))*$
         */
        id: string;
    }
}
