import { Converter } from 'showdown';
import { Entity, Manifest } from '.';
import { component, requires } from './component';

export type ArticleData = string;

@component('article')
@requires('description')
export class Article {
    raw: string;
    rendered: string;

    constructor(data: ArticleData, _e: Entity, _m: Manifest, c: Converter) {
        this.raw = data;
        this.rendered = c.makeHtml(this.raw);
    }
}
