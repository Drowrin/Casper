import { VehicleData } from '../schema';
import { component } from './component';

@component('vehicle')
export class Vehicle {
    speed?: string;
    capacity?: string;
    workers?: string;

    constructor(data: VehicleData) {
        this.speed = data.speed;
        this.capacity = data.capacity;
        this.workers = data.workers;
    }
}
