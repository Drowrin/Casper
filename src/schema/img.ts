import { Component } from '../component';

export namespace Img {
    export const KEY = 'img';

    export interface Data {
        /**
         * @TJS-format uri-reference
         */
        uri: string;
    }
}
Component.register(Img);

declare module '.' {
    export interface EntityData {
        /**
         * Optional image to be displayed with an entity.
         */
        img?: Img.Data;
    }
}
