import { Component } from '../component';
import { Config } from '../config';

export namespace Brief {
    export const KEY = 'brief';
    export const SUPPRESS_TYPE = true;

    export type Data = string;

    export function trigger(ctx: Component.Context) {
        return KEY in ctx.data || 'description' in ctx.data;
    }

    export function getData(ctx: Component.Context) {
        if (KEY in ctx.data) return ctx.data[KEY];

        let desc = <string>ctx.data['description'];

        if (desc.length > Config.brief) {
            desc = desc.slice(0, Config.brief - 3) + '...';
        }

        return desc;
    }
}
Component.register(Brief);

declare module '.' {
    export interface EntityData {
        /**
         * Brief is optional. It will be generated from description if omitted.
         * Should give a brief overview of an entity, just a few sentences.
         */
        brief?: Brief.Data;
    }
}
