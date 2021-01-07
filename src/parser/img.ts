import { ImgData } from '../schema';
import { component } from './component';

@component('img')
export class Img {
    uri: string;

    constructor(data: ImgData) {
        this.uri = data.uri;
    }
}
