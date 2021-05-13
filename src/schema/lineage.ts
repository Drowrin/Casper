import { Component } from '../component';

export namespace Trait {
    export const KEY = 'trait';
    export const REQUIRES = ['description'];

    export interface Data {
        /**
         * The type of trait this entity represents.
         */
        type: 'minor' | 'major' | 'heritage';

        /**
         * Some traits have requirements. They should be described here.
         */
        requirements?: string;
    }
}
Component.register(Trait);

export namespace Lineage {
    export const KEY = 'lineage';
    export const REQUIRES = ['description'];
    export const WAIT_FOR = ['language', 'trait'];

    export interface CoreTraits {
        /**
         * A description of features the lineage may have.
         */
        appearance: string;

        /**
         * Mechanical size category of the lineage.
         */
        size: 'small' | 'medium';

        /**
         * Average height and weight ranges of the lineage.
         */
        stature: {
            /**
             * Average height range of the lineage in feet.
             * Should be two numbers separated by a hyphen, for example "4-5".
             * @pattern ^\d-\d$
             */
            height: string;

            /**
             * Average weight range of the lineage in feet.
             * Should be two numbers separated by a hyphen, for example "200-300".
             * @pattern ^\d+-\d+$
             */
            weight: string;
        };

        /**
         * Information on how this lineage ages, including lifespan and age of maturity.
         */
        age: {
            /**
             * The average lifespan of the lineage in years.
             */
            lifespan: number;

            /**
             * The age at which a lineage is culturally considered an adult.
             */
            adulthood: number;

            /**
             * The age at which a lineage is physically an adult.
             */
            maturity: number;
        };

        /**
         * An array of id references pointing to languages this lineage typically speaks.
         */
        languages: string[];
    }

    export interface Data extends CoreTraits {
        /**
         * An array of id references pointing to traits for this lineage.
         */
        traits: string[];

        /**
         * An optional boolean indicating whether or not this is a limited lineage.
         * @default false
         */
        limited: boolean;
    }

    export function checkLanguages(ctx: Component.Context, langs?: string[]) {
        langs?.forEach((l) => {
            if (!ctx.passed['language'].includes(l))
                throw `${l} does not refer to a valid Language!`;
        });
    }

    export function checkTraits(ctx: Component.Context, traits?: string[]) {
        traits?.forEach((t) => {
            if (!ctx.passed['trait'].includes(t))
                throw `${t} does not refer to a valid Trait!`;
        });
    }

    export function procStature(stature: { height: string; weight: string }) {
        return {
            height: stature.height.split('-').map((i) => parseInt(i)),
            weight: stature.weight.split('-').map((i) => parseInt(i)),
        };
    }

    export function procLang(ctx: Component.Context, l: string) {
        let lang = ctx.manifest[l];
        return {
            name: lang.name,
            id: lang.id,
            description: lang.description,
        };
    }

    export function procTrait(ctx: Component.Context, t: string) {
        let trait = ctx.manifest[t];
        return {
            name: trait.name,
            id: trait.id,
            description: trait.description,
        };
    }

    export function process(data: Data, ctx: Component.Context) {
        let { stature, languages, traits, ...core } = { ...data };

        checkTraits(ctx, traits);
        checkLanguages(ctx, languages);

        return {
            ...core,

            stature: procStature(stature),

            languages: languages.map((l) => procLang(ctx, l)),

            traits: traits.map((t) => procTrait(ctx, t)),

            subs: [],
        };
    }
}
Component.register(Lineage);

export namespace SubLineage {
    export const KEY = 'sublineage';
    export const REQUIRES = ['description'];
    export const WAIT_FOR = ['language', 'trait', 'lineage'];

    export interface Data extends Partial<Lineage.Data> {
        /**
         * A string id reference pointing to a Lineage.
         * This is the lineage that this entity is a sublineage of.
         */
        of: string;
    }

    export function process(data: Data, ctx: Component.Context) {
        let { of, stature, languages, traits, ...core } = { ...data };

        if (!ctx.passed['lineage'].includes(of))
            throw `${of} does not refer to a valid Lineage!`;

        let base = ctx.manifest[of];

        Lineage.checkLanguages(ctx, languages);
        Lineage.checkTraits(ctx, traits);

        let res = {
            ...core,

            stature: stature && Lineage.procStature(stature),

            languages:
                languages && languages.map((l) => Lineage.procLang(ctx, l)),

            traits: traits && traits.map((t) => Lineage.procTrait(ctx, t)),
        };

        base.lineage.subs.push({
            name: ctx.parent.name,
            id: ctx.parent.id,
            description: ctx.parent.description,
        });

        let { subs, ...lineage } = base.lineage;

        Object.entries(res).forEach(([k, v]) => {
            if (v !== undefined) {
                if (Array.isArray(lineage[k])) {
                    lineage[k] = [...lineage[k], ...(<any[]>v)];
                } else {
                    lineage[k] = v;
                }
            }
        });

        return {
            delta: {
                ...res,
            },

            full: {
                ...lineage,
            },

            of: {
                name: base.name,
                id: base.id,
                description: base.description,
            },
        };
    }
}
Component.register(SubLineage);

declare module '.' {
    export interface EntityData {
        /**
         * If an entity is a lineage, it should include this component.
         */
        lineage: Lineage.Data;

        /**
         * If an entity is a sublineage, it should include this component.
         */
        sublineage: SubLineage.Data;

        /**
         * If an entity is a trait, it should include this component.
         */
        trait: Trait.Data;
    }
}
