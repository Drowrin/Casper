import { Converter } from 'showdown';
import { Entity, Manifest } from '.';
import { component } from './component';

export type DescriptionData = string;

@component('description')
export class Description {
    raw: string;
    rendered: string;

    constructor(data: DescriptionData, _e: Entity, _m: Manifest, c: Converter) {
        this.raw = data;
        this.rendered = c.makeHtml(this.raw);
    }
}
