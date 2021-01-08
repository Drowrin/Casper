import { Entity } from '.';
import { Manifest } from '../schema';

export interface Component {
    new (...args: any[]): {};
    resolve?(ed: any, entity: Entity, m: Manifest): void;
    required?: string[];
}

export function component(key: string) {
    return function <T extends Component>(Base: T) {
        let required: string[] = Base?.required ?? [];

        return class extends Base {
            static required = required;

            static resolve(ed: any, entity: Entity, m: Manifest) {
                const data = ed[key];

                if (data !== undefined) {
                    for (const req of this.required) {
                        if (ed[req] === undefined)
                            throw `${entity.id} does not meet requirement for ${key}: ${req}`;
                    }

                    if (Array.isArray(data)) {
                        entity[key] = data.map(
                            (d: any) => new this(d, entity, m)
                        );
                    } else {
                        entity[key] = new this(data, entity, m);
                    }
                }
            }
        };
    };
}

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
