import { component } from './component';

export interface ImgData {
    /**
     * @TJS-format uri-reference
     */
    uri: string;
}

@component('img')
export class Img {
    uri: string;

    constructor(data: ImgData) {
        this.uri = data.uri;
    }
}
