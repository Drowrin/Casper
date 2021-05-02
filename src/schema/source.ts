import { Component } from './component';

export namespace Source {
    export const KEY = 'source';

    export type Data = string;
}
Component.register(Source);

declare module '.' {
    export interface EntityData {
        /**
         * Source is optional.
         * The book or other source that this entity was published in.
         * example: Player's Handbook pg.69
         */
        source?: Source.Data;
    }
}
