import { WeaponData } from '../schema';
import { component } from './component';

@component('weapon')
export class Weapon {
    damage?: string | number;
    type?: string;

    constructor(data: WeaponData) {
        this.damage = data.damage;
        this.type = data.type;
    }
}
