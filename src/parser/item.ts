import { ItemData, ValueData } from '../schema';
import { component } from './component';

@component('item')
export class Item {
    cost?: ValueData;
    weight?: number;

    constructor(data: ItemData) {
        this.cost = data.cost;
        this.weight = data.weight;
    }
}
