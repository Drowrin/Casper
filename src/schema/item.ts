import { Component } from './component';

export namespace Value {
    export interface Data {
        /**
         * Platinum pieces
         * @type integer
         * @minimum 1
         */
        pp?: number;

        /**
         * Gold pieces
         * @minimum 1
         */
        gp?: number;

        /**
         * Electrum pieces
         * @type integer
         * @minimum 1
         */
        ep?: number;

        /**
         * Silver pieces
         * @type integer
         * @minimum 1
         */
        sp?: number;

        /**
         * Copper pieces
         * @type integer
         * @minimum 1
         */
        cp?: number;
    }
}

export namespace Item {
    export const KEY = 'item';

    export interface Data {
        /**
         * Value of this item. Optional for priceless items or items of negligible worth.
         */
        cost?: Value.Data;

        /**
         * Weight of this item in lb.
         */
        weight?: number;

        /**
         * Default bundle for things like arrows.
         * Cost/weight of an individual item is <recorded number> / <bundle>
         * @default 1
         */
        bundle: number;
    }
}
Component.register(Item);

declare module '.' {
    export interface EntityData {
        /**
         * Any entity that is a physical item with at least cost and weight should have this component.
         * This should be present on all items, even if all optional fields are skipped.
         */
        item?: Item.Data;
    }
}
