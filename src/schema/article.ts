import { Component } from '../component';

export namespace Article {
    export const KEY = 'article';
    export const REQUIRES = ['description'];

    export type Data = { [key: string]: string };
}
Component.register(Article);

declare module '.' {
    export interface EntityData {
        /**
         * Article is for longer text than description--text that is the primary content of the entity.
         * Description is required, as article is too long to be shown in search results.
         */
        article?: Article.Data;
    }
}
