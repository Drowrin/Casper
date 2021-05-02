import { Converter } from 'showdown';
import { Entity, EntityData } from '.';
import { Manifest } from '../schema';
import { Category } from './category';

export namespace Component {
    export interface Context {
        /**
         * The initial manifest parsed from the source yaml.
         * This is a map of string ids to EntityData objects.
         */
        manifest: Manifest;

        /**
         * The current entity being processed.
         * This is partial/in-progress data, not the source data.
         * This is the state of the entity directly before this component is added to it.
         * As such the state should not be relied on, but it can still be used to get entity name, id, and so on.
         */
        parent: Entity;

        /**
         * The entity data parsed from the source without any processing.
         */
        rawData: EntityData;

        /**
         * A pre-confiugured markdown converter from Showdownjs.
         * Most common usage would be `markdown.makeHtml(string)`.
         */
        markdown: Converter;

        /**
         * All valid categories. A map from string ids to CategoryData.
         */
        categories: Category.Map;
    }

    /**
     * A collection of all registered components.
     */
    var list: Component[] = [];

    /**
     * Register a component so it can be accessed globally.
     * As a side effect, this helps validate namespaces that are intended to become Components.
     * @param {Component} c The component to be registered
     */
    export function register(c: Component) {
        if (!list.includes(c)) {
            list.push(c);
        }
    }

    /**
     * Get the list of all registered components.
     */
    export function all() {
        return list;
    }

    /**
     * Adds constructed Component to Entity if the Component's key is present in the EntityData.
     * Manifest is used in some contructors so that entities can reference each other.
     * This function does not return anything, it modifies the parent Entity in-place.
     * @param {Component} c The component to be resolved
     * @param {any} data The raw data of the entity currently being parsed
     * @param {Component.Context} ctx The context of resolving this entity
     */
    export function resolve(c: Component, data: any, ctx: Context) {
        // only operate if the trigger passes or the KEY exists on the data
        if (c.trigger?.(data, ctx) || c.KEY in data) {
            const cData = data[c.KEY];

            // check that the parent entity contains all of the other components required by this component
            c.REQUIRES?.forEach((r) => {
                if (data[r] === undefined)
                    throw `${ctx.parent.id} does not contain "${r}", which is a requirement for "${c.KEY}"`;
            });

            let out = c.process?.(cData, ctx) || cData;
            if (out !== undefined) ctx.parent[c.KEY] = out;
        }
    }
}

export interface Component {
    /**
     * The key on the root of an entity that will be interpreted as this component.
     * Also, the output data is stored at entity.KEY.
     * */
    KEY: string;

    /**
     * Array of keys referring to other components that this component requires.
     * If a required component is not present on an entity, this component's valirdator will fail.
     */
    REQUIRES?: string[];

    /**
     * A function to determine if this component's processing should trigger.
     * If this function is not included, the default trigger checks if KEY is in the data.
     */
    trigger?(data: any, ctx: Component.Context): boolean;

    /**
     * A function that is called to process input data before it is entered into the final manifest.
     *
     * This function is optional. If not present, the data will be copied from source as-is.
     *
     * @param {any} data The data for this component, parsed directly from the source yaml
     * @param {Component.Context} ctx The context of this processing call. See Component.Context for more info
     * @returns {any} The processed data that will be output into the final manifest
     */
    process?(data: any, ctx: Component.Context): any;
}
