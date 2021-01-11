import { AbilityCheck } from './abilitycheck';
import { component, requires } from './component';

// TODO: change `supplies` to reference other item entities?
// TODO: change `skills` to reference and augment skill entities, similar to how Properties work?
export interface ToolData {
    /**
     * Non-exhaustive list of the most common supplies that this tool might use in its work.
     * each entry in this array should be a reference to an item.
     */
    supplies?: string[];

    /**
     * Examples of simple tasks this tool can do with a skill check.
     */
    checks?: AbilityCheck[];
}

@component('tool')
@requires('item')
@requires('proficiency')
export class Tool {
    supplies?: any[];
    checks?: AbilityCheck[];

    constructor(data: ToolData) {
        this.supplies = data.supplies;
        this.checks = data.checks;
    }
}
