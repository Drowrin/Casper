import { component } from './component';

export interface ArmorData {
    /**
     * The AC of this armor.
     * For example, "+2" or "13 + Dex Modifier (max 2)"
     */
    ac: string | number;
}

@component('armor')
export class Armor {
    ac: string | number;

    constructor(data: ArmorData) {
        this.ac = data.ac;
    }
}
