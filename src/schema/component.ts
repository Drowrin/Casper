import { Converter } from 'showdown';
import { Entity } from '.';
import { Manifest } from '../schema';

/**
 * Slightly hacky solution
 * Typescript does not support abstract static properties/methods, so this mixin is necessary
 */
export interface Component {
    new (...args: any[]): {};
    resolve?(ed: any, entity: Entity, m: Manifest, c: Converter): void;
    required?: string[];
}

/**
 * Turns a class into a Component class.
 * Adds static methods and fields to the class decorated.
 * Most importanly, adds Class.resolve()
 *
 * Class constructor should accept it's data as the first argument.
 * Optionally it can accept the parent Entity and the Manifest as the second and third argument.
 *
 * If the component root is an array, like `properties`, the class should describe a single array element.
 * The resolver will handle mapping the array to multiple components.
 */
export function component(key: string) {
    return function <T extends Component>(Base: T) {
        let required: string[] = Base?.required ?? [];

        return class extends Base {
            static required = required;

            /**
             * Adds constructed Component to Entity if the Component's key is present in the EntityData
             * Manifest is used in some contructors so that entities can reference each other.
             */
            static resolve(ed: any, entity: Entity, m: Manifest, c: Converter) {
                const data = ed[key];

                if (data !== undefined) {
                    // check that the parent entity contains all of the other components required by this component
                    for (const req of this.required) {
                        if (ed[req] === undefined)
                            throw `${entity.id} does not contain "${req}", which is a requirement for "${key}"`;
                    }

                    // If the data is an array, make an array of components.
                    // used for stuff like `categories` and `properties`.
                    if (Array.isArray(data)) {
                        entity[key] = data.map(
                            (d: any) => new this(d, entity, m, c)
                        );
                    } else {
                        entity[key] = new this(data, entity, m, c);
                    }
                }
            }
        };
    };
}

/**
 * Marks a component as requiring one or more other components.
 * Multiple requirements can be handled either by multiple arguments, or by stacking multiple decorators.
 * Each key passed to the decorator should be the key of another component.
 */
export function requires(...keys: string[]) {
    return function <T extends Component>(Base: T) {
        if (Base.required !== undefined) {
            Base.required.concat(keys);
            return Base;
        } else {
            return class extends Base {
                static required = keys;
            };
        }
    };
}
