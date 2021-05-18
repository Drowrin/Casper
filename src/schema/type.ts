import { Component } from '../component';

export namespace Type {
    export const KEY = 'type';
    export const SINK = true;

    export let TYPES: Set<string> = new Set();

    export function trigger(_: Component.Context) {
        return true; // trigger on every entity
    }

    export function getData(ctx: Component.Context): Component[] {
        return (
            ctx.components
                // exclude any components that have requested exclusion
                .filter((c) => !c.SUPPRESS_TYPE)
                // exclude all HOIST or SINK components
                .filter((c) => !c.HOIST && !c.SINK)
                // get all components for which this component passed the trigger
                .filter((c) => ctx.passed[c.KEY].includes(ctx.id))
        );
    }

    export function process(components: Component[], ctx: Component.Context) {
        let out = new Array(...components);

        components.forEach((comp) => {
            let requires = comp.REQUIRES || [];
            let optional = comp.OPTIONAL || [];

            [...requires, ...optional].forEach((r) => {
                let i = out.map((c) => c.KEY).indexOf(r);
                if (i > -1) out.splice(i, 1);
            });
        });

        if (out.length == 0) return 'entity';

        if (out.length == 1) return out[0].KEY;

        let types = out.map((c) => c.KEY).join(', ');
        throw `${ctx.id} has multiple valid types! ${types}`;
    }

    export function transform(processed: any, ctx: Component.Context) {
        TYPES.add(processed);
        ctx.parent[KEY] = processed;
    }
}
Component.register(Type);
