import { component, requires } from './component';

// All three attributes can be null if they do not apply to a particular vehicle.
// All three attributes can be simple stats (like "30 mph") or short sentences describing properties of the vehicle.
// TODO: move some of this into properties?
export interface VehicleData {
    speed?: string;
    capacity?: string;
    workers?: string;
}

@component('vehicle')
@requires('tool', 'item')
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
