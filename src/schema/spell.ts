import { component, requires } from './component';

export interface SpellData {
    /**
     * The base level that the spell can be cast at.
     * @type integer
     * @minimum 1
     * @maximum 9
     */
    level: number;

    /**
     * The school of magic that the spell belongs to.
     */
    school: string;

    /**
     * The casting time of the spell.
     */
    castTime: string;

    /**
     * The range of the spell.
     * This should be the number in feet or a string.
     */
    range: number | string;

    /**
     * The components required to cast the spell.
     */
    components: ComponentData;

    /**
     * Whether or not the spell has the ritual tag.
     */
    ritual: boolean;

    /**
     * Whether or not the spell requires concentration.
     */
    concentration: boolean;

    /**
     * The duration of time that the spell lasts.
     */
    duration: string;

    /**
     * The extra effects of the spell when cast at a higher level, if any.
     */
    higherLevel?: string;

    /**
     * The ability of the saving throw required by the spell, if any.
     */
    savingThrow?: 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA';

    /**
     * Whether or not the spell's attack roll is melee or ranged, if any.
     */
    attack?: 'melee' | 'ranged';

    /**
     * The amount of damage the spell deals, if any.
     * Takes an array of DamageData nodes, useful for spells that deal multiple damage types.
     */
    damage?: Array<DamageData>;

    /**
     * The amount of healing the spell provides, if any.
     * This should be dice or a flat amount.
     */
    healing?: string | number;
}

@component('spell')
@requires('item')
export class Spell {
    damage?: Array<DamageData>;

    constructor(data: SpellData) {
        this.damage = data.damage;
    }
}
