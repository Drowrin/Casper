import { Component } from '../component';

export namespace Req {
    export const KEY = 'req';
    export const SUPPRESS_TYPE = true;

    export interface Data {
        /**
         * Strength required.
         */
        str?: number;

        /**
         * Constitution required.
         */
        con?: number;

        /**
         * Dexterity required.
         */
        dex?: number;

        /**
         * Intelligence required.
         */
        int?: number;

        /**
         * Wisdom required.
         */
        wis?: number;

        /**
         * Charisma required.
         */
        cha?: number;

        /**
         * Total character levels required.
         */
        level?: number;

        /**
         * A string id of another entity that this entity requires.
         */
        entity?: string;

        /**
         * True if this entity requires the ability to cast a spell.
         */
        spellcasting?: boolean;
    }

    function checkBounds(d: Data, s: string) {
        let val = (<any>d)[s];
        if (val && (val < 1 || val > 20))
            throw `${s}(${val}) is out of bounds (1-20)!`;
    }

    export function process(data: Data | Data[], ctx: Component.Context) {
        if (!Array.isArray(data)) {
            data = [data];
        }

        return data.map((d) => {
            let { entity, ...r } = d;

            let e = entity && ctx.entities[entity];

            if (entity && e === undefined)
                throw `${entity} does not refer to a valid entity!`;

            ['str', 'con', 'dex', 'int', 'wis', 'cha', 'level'].forEach((s) =>
                checkBounds(r, s)
            );

            return {
                ...r,
                entity: e,
            };
        });
    }
}
Component.register(Req);

declare module '.' {
    export interface EntityData {
        /**
         * If an has requirements, it should include this component.
         */
        req?: Req.Data | Req.Data[];
    }
}
