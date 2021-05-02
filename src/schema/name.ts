import { Component } from '../component';

export namespace Name {
    export const KEY = 'name';
    export const HOIST = true;

    export type Data = string;
}
Component.register(Name);

declare module '.' {
    export interface EntityData {
        /**
         * Every entity needs a name. This does not have to be unique, just descriptive.
         * This is a required field.
         */
        name: string;
    }
}
