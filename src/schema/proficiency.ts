import { component, requires } from './component';

export interface ProficiencyComboData {
    /**
     * Reference to the affected skill. The lowercase name of the skill.
     */
    skill: string;

    /**
     * Description of how the referenced skill can be effected by this proficiency, and under what circumstances.
     */
    effect: string;
}

export interface ProficiencyData {
    /**
     * Default ability used by this proficiency.
     * Lowercase ability name.
     * Used to look up ability by id.
     */
    ability?: string;

    /**
     * Some profiencies can be used together.
     * For example, Smithing and History to recall information about weaponry.
     * This is a list of skills this proficiency can affect, and how.
     */
    combos?: ProficiencyComboData[];
}

@component('proficiency')
@requires('description')
export class Proficiency {
    ability?: string;
    combos?: ProficiencyComboData[];

    constructor(data: ProficiencyData) {
        this.ability = data.ability;
        this.combos = data.combos;
    }
}
