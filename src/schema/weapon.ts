import { Component } from './component';

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
Component.register(Weapon);

declare module '.' {
    export interface EntityData {
        /**
         * If an entity is a weapon, it should include this component.
         */
        weapon?: Weapon.Data;
    }
}
