import { Component } from '../component';

export namespace Armor {
    export const KEY = 'armor';
    export const REQUIRES = ['item'];
    export const OPTIONAL = ['properties'];

    export interface Data {
        /**
         * The AC of this armor.
         */
        ac: number;
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
