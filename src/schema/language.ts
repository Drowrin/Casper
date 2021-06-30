import { Component } from '../component';

export namespace Language {
    export const KEY = 'language';
    export const REQUIRES = ['description'];
    export const WAIT_FOR = ['brief'];

    export interface Data {
        /**
         * A list of who typically speaks the language.
         */
        speakers: string[];

        /**
         * Some languages are written in the script of another language. This can be optionally indicated here.
         * This should be an id reference to a language.
         */
        script?: string;

        /**
         * Marks if this language should be considered exotic.
         * An exotic language is not commonly used, and requires specific education to learn.
         * @default false;
         */
        exotic: boolean;
    }

    export function process(data: Data, ctx: Component.Context) {
        if (data.script && ctx.entities[data.script]?.language === undefined)
            throw `${data.script} is not a valid language!`;

        let script = data.script && ctx.manifest[data.script];

        return {
            speakers: data.speakers,
            exotic: data.exotic,
            script: script && {
                name: script.name,
                id: script.id,
                description: script.description,
                brief: script.brief,
            },
        };
    }
}
Component.register(Language);

declare module '.' {
    export interface EntityData {
        /**
         * If an entity is a language, it should include this component
         */
        language?: Language.Data;
    }
}
