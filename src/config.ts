import fs = require('fs');
import yaml = require('js-yaml');

export interface Config {
    /**
     * The port the server will run at.
     */
    port: number;

    /**
     * The data directories that will be searched for data.
     */
    dataDirs: string[];
}

export const DefaultConfig: Config = {
    port: 3001,
    dataDirs: ['./data'],
};

let a: Partial<Config> = {};
let b: Config = { ...DefaultConfig, ...a };

if (!fs.existsSync('./config.yaml')) {
    console.log("Config doesn't exist, generating default...");
    fs.writeFileSync('./config.yaml', yaml.dump(DefaultConfig));
}

export const Config: Config = {
    ...DefaultConfig,
    ...(<Config>yaml.safeLoad(<string>(<any>fs.readFileSync('./config.yaml')))),
};

console.log(
    '======CONFIG======\n' + yaml.dump(Config) + '==================\n'
);
