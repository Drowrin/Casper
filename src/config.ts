import fs = require('fs');
import yaml = require('js-yaml');

export interface Config {
    /**
     * The port the server will run at.
     *
     * Default: 3001
     */
    port: number;

    /**
     * The port the websocket server will run at.
     *
     * Default: 3002
     */
    wsport: number;

    /**
     * The data directories that will be searched for data.
     *
     * Default: [`./data`]
     */
    dataDirs: string[];

    /**
     * Where parsing error logs should be sent.
     * Can be either `stderr` or a path.
     * If it is `stderr`, errors will be logged with `console.error`.
     * Otherwise, it will be assumed to be a path, and errors will be logged to that file.
     * Note: This file will be overwritten each time the parser runs.
     *
     * Default: `stderr`
     */
    errorLogs: string;

    /**
     * Number of characters allowed in the brief component.
     */
    brief: number;
}

export const DefaultConfig: Config = {
    port: 3001,
    wsport: 3002,
    dataDirs: ['./data'],
    errorLogs: 'stderr',
    brief: 250,
};

if (!fs.existsSync('./config.yaml')) {
    console.log("Config doesn't exist, generating default...");
    fs.writeFileSync('./config.yaml', yaml.dump(DefaultConfig));
}

export const Config: Config = {
    ...DefaultConfig,
    ...(<Config>yaml.load(<string>(<any>fs.readFileSync('./config.yaml')))),
};

console.log(
    '======CONFIG======\n' + yaml.dump(Config) + '==================\n'
);
