import { Component } from './component';

Component.register(Weapon);
export namespace Weapon {
    export const KEY = 'weapon';
    export const REQUIRES = ['item'];

    export interface Data {
        /**
         * How much damage the weapon does.
         * This should be dice or a flat amount.
         * Optional -- useful for weapons like the Net.
         */
        damage?: string | number;

        /**
         * Damage type the weapon does. For example "Bludgeoning".
         * Optional -- useful for weapons like the Net.
         */
        type?: string;
    }
}
