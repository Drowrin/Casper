import { Component } from './component';

Component.register(Vehicle);
export namespace Vehicle {
    export const KEY = 'vehicle';
    export const REQUIRES = ['tool', 'item', 'proficiency'];

    // All three attributes can be null if they do not apply to a particular vehicle.
    // All three attributes can be simple stats (like "30 mph") or short sentences describing properties of the vehicle.
    export interface Data {
        speed?: string;
        capacity?: string;
        workers?: string;
    }
}
