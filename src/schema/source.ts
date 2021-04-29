import { component } from './component';

export type SourceData = string;

@component('source')
export class Source {
    raw: string;

    constructor(data: SourceData) {
        this.raw = data;
    }
}
