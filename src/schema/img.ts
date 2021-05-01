import { Component } from './component';

Component.register(Img);
export namespace Img {
    export const KEY = 'img';

    export interface Data {
        /**
         * @TJS-format uri-reference
         */
        uri: string;
    }
}
