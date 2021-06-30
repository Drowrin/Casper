import { Component } from '../component';

export namespace Description {
    export const KEY = 'description';
    export const SUPPRESS_TYPE = true;

    export function trigger(ctx: Component.Context) {
        return KEY in ctx.data || 'brief' in ctx.data;
    }

    export function getData(ctx: Component.Context) {
        if (KEY in ctx.data) return ctx.data[KEY];

        return ctx.data['brief'];
    }

    export type Data = string;
}
Component.register(Description);

declare module '.' {
    export interface EntityData {
        /**
         * Description is optional.
         * Should give an overview of an entity.
         */
        description?: Description.Data;
    }
}
