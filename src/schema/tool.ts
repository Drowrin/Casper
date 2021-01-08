import { component, requires } from './component';

// TODO: convert to entities?
export interface ToolSkillData {
    /**
     * Specifies one or more comma-separated skills.
     * For example "Arcana" or "Arcana, Religion, Investigation".
     */
    name: string;

    /**
     * Explains how this tool proficiency can effect the named skills.
     */
    description: string;
}

// TODO: convert to entities?
export interface ToolActivityData {
    /**
     * Describes the task being attempted
     */
    description: string;

    /**
     * An exmaple dc required for success. Format is "dc (Attribute)". For example "15 (Intelligence)"
     */
    dc: string;
}

// TODO: convert to entities?
export interface ToolUseData {
    /**
     * Name of the task.
     */
    name: string;

    /**
     * Describes the task being performed, what materials and rolls it might require, and the possible results.
     */
    description: string;
}

// TODO: change `supplies` to reference other item entities?
// TODO: change `skills` to reference and augment skill entities, similar to how Properties work?
export interface ToolData {
    /**
     * A brief overview of what proficiency in this tool grants a character.
     */
    proficiency: string;

    /**
     * A list of skills and how they are affected by this tool proficiency.
     */
    skills?: ToolSkillData[];

    /**
     * Supplies that this tool miught use in its work.
     */
    supplies?: any[];

    /**
     * Examples of simple tasks this tool can do with a skill check.
     */
    activities?: ToolActivityData[];

    /**
     * Tasks that are more complex than activities and generally have more defined rules.
     */
    uses?: ToolUseData[];
}

@component('tool')
@requires('item')
export class Tool {
    proficiency: string;
    skills?: { name: string; description: string }[];
    supplies?: any[];
    activities?: { description: string; dc: string }[];
    uses?: { name: string; description: string }[];

    constructor(data: ToolData) {
        this.proficiency = data.proficiency;
        this.skills = data.skills;
        this.supplies = data.supplies;
        this.activities = data.activities;
        this.uses = data.uses;
    }
}
