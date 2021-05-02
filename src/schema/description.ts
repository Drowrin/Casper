import { Component } from './component';

export namespace Description {
    export const KEY = 'description';

    export type Data = string;

    export function process(data: Data, { markdown }: Component.Context) {
        return {
            raw: data,
            rendered: markdown.makeHtml(data),
        };
    }
}
Component.register(Description);

declare module '.' {
    export interface EntityData {
        /**
         * Description is optional.
         * Should give a brief overview of an entity, just a few sentences.
         */
        description?: Description.Data;
    }
}
