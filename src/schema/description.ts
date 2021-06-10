import { Component } from '../component';

export namespace Description {
    export const KEY = 'description';
    export const SUPPRESS_TYPE = true;

    export type Data = string;
}
Component.register(Description);

declare module '.' {
    export interface EntityData {
        /**
         * Description is optional.
         * Should give a brief overview of an entity, just a few sentences.
         */
        description?: Description.Data;
    }
}
