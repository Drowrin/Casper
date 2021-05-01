import { Component } from './component';

Component.register(Armor);
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
