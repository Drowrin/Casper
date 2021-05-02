import { Component } from '../component';

export namespace Armor {
    export const KEY = 'armor';
    export const REQUIRES = ['item'];

    export interface Data {
        /**
         * The AC of this armor.
         * For example, "+2" or "13 + Dex Modifier (max 2)"
         */
        ac: string | number;
    }
}
Component.register(Armor);

declare module '.' {
    export interface EntityData {
        /**
         * If an entity is armor, it should include this component.
         */
        armor?: Armor.Data;
    }
}
