import { Component } from './component';

export namespace Spell {
    export const KEY = 'spell';
    export const REQUIRES = ['description'];

    export interface ComponentData {
        /**
         * Whether or not the spell requires a verbal component.
         */
        verbal: boolean;

        /**
         * Whether or not the spell requires a somatic component.
         */
        somatic: boolean;

        /**
         * Whether or not the spell requires a material component.
         * If true, then the value is a string containing the necessary component.
         */
        material: false | string;
    }

    export interface LevelData {
        /**
         * The amount of damage the spell deals, if any.
         */
        damage?: string;

        /**
         * The area of effect of the spell.
         * example: 30ft cube
         */
        aoe?: string;

        /**
         * The range of the spell.
         * This should be the number in feet or a string.
         */
        range?: number | string;

        /**
         * The duration of time that the spell lasts.
         */
        duration?: string;

        /**
         * The number of attack rolls or spell effects.
         * @default 1
         */
        count?: number;
    }

    export interface UpcastData {
        description: string;
        levels?: {
            [key: number]: LevelData;
        };
    }

    export interface Data extends LevelData {
        /**
         * The base level that the spell can be cast at.
         * @type integer
         * @minimum 0
         * @maximum 9
         */
        level: number;

        /**
         * The school of magic that the spell belongs to.
         */
        school:
            | 'Conjuration'
            | 'Necromancy'
            | 'Evocation'
            | 'Abjuration'
            | 'Transmutation'
            | 'Divination'
            | 'Enchantment'
            | 'Illusion';

        /**
         * The casting time of the spell.
         */
        castTime: string;

        /**
         * The components required to cast the spell.
         */
        components: ComponentData;

        /**
         * Whether or not the spell has the ritual tag.
         * @default false
         */
        ritual: boolean;

        /**
         * Whether or not the spell requires concentration.
         * @default false
         */
        concentration: boolean;

        /**
         * The ability of the saving throw required by the spell, if any.
         */
        savingThrow?: 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA';

        /**
         * Whether or not the spell's attack roll is melee or ranged, if any.
         */
        attack?: 'melee' | 'ranged';

        /**
         * The extra effects of the spell when cast at a higher level, if any.
         */
        upcast?: UpcastData;
    }
}
Component.register(Spell);

declare module '.' {
    export interface EntityData {
        /**
         * If an entity is a spell, it should include this component.
         */
        spell?: Spell.Data;
    }
}
