import { Component } from './component';

Component.register(Description);
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
