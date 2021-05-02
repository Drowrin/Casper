import { Component } from './component';

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
Component.register(Vehicle);

declare module '.' {
    export interface EntityData {
        /**
         * If an entity is a vehicle, it should include this component.
         */
        vehicle?: Vehicle.Data;
    }
}
