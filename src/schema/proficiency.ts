import { Component } from '../component';

export namespace Proficiency {
    export const KEY = 'proficiency';
    export const REQUIRES = ['description'];

    export interface Data {
        /**
         * Default ability used by this proficiency.
         * Lowercase ability name.
         * Used to look up ability by id.
         */
        ability: string;

        /**
         * Some profiencies can be used together.
         * For example, Smithing and History to recall information about weaponry.
         * This is a list of skills this proficiency can affect, and how.
         */
        combos?: Array<{
            /**
             * Reference to the affected skill. The lowercase name of the skill.
             */
            skill: string;

            /**
             * Description of how the referenced skill can be effected by this proficiency, and under what circumstances.
             */
            effect: string;
        }>;
    }

    export function process(data: Data, ctx: Component.Context) {
        if (!ctx.passed['description'].includes(data.ability))
            throw `${data.ability} does not refer to a valid ability!`;

        let combos = data.combos?.map((c) => {
            let combo = ctx.manifest[c.skill];

            if (combo === undefined)
                throw `${c.skill} does not refer to a valid entity!`;

            return {
                name: combo.name,
                id: combo.id,
                description: {
                    raw: c.effect,
                    rendered: c.effect,
                },
            };
        });

        let ability = ctx.manifest[data.ability];

        return {
            combos,

            ability: {
                name: ability.name,
                id: ability.id,
                description: ability.description,
            },
        };
    }
}
Component.register(Proficiency);

declare module '.' {
    export interface EntityData {
        /**
         * If an entity represents something that a character can be proficient in, it should have this component.
         */
        proficiency?: Proficiency.Data;
    }
}
