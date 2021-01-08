import { Entity } from '.';
import { Manifest } from '../schema';

export interface Component {
    new (...args: any[]): {};
    resolve?(ed: any, entity: Entity, m: Manifest): void;
}

export function component(key: string) {
    return function <T extends Component>(Base: T) {
        return class extends Base {
            static resolve(ed: any, entity: Entity, m: Manifest) {
                const data = ed[key];

                if (data !== undefined) {
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
