import { component, requires } from './component';

export type ArticleData = string;

@component('article')
@requires('description')
export class Article {
    raw: string;

    constructor(data: ArticleData) {
        this.raw = data;
    }
}
