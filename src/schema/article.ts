import { Component } from './component';

Component.register(Article);
export namespace Article {
    export const KEY = 'article';
    export const REQUIRES = ['description'];

    export type Data = string;

    export function process(data: Data, { markdown }: Component.Context) {
        return {
            raw: data,
            rendered: markdown.makeHtml(data),
        };
    }
}
