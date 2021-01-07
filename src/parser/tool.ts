import { ToolData } from '../schema';
import { component } from './component';

@component('tool')
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
