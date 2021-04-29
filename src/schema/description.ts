import { component } from './component';

export type DescriptionData = string;

@component('description')
export class Description {
    raw: string;

    constructor(data: DescriptionData) {
        this.raw = data;
    }
}
