import { component } from './component';

export interface WeaponData {
    /**
     * How much damage the weapon does.
     * This should be dice or a flat amount.
     * Optional -- useful for weapons like the Net.
     */
    damage?: string | number;

    /**
     * Damage type the weapon does. For example "Bludgeoning".
     * Optional -- useful for weapons like the Net.
     */
    type?: string;
}

@component('weapon')
export class Weapon {
    damage?: string | number;
    type?: string;

    constructor(data: WeaponData) {
        this.damage = data.damage;
        this.type = data.type;
    }
}
