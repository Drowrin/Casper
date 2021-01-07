import { ArmorData } from '../schema';
import { component } from './component';

@component('armor')
export class Armor {
    ac: string | number;

    constructor(data: ArmorData) {
        this.ac = data.ac;
    }
}
