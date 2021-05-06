# casper

`casper` is the backend portion of project magi. It loads entities from yaml data, resolves connections between them, and provides the data with a REST API. Indexed data is also provided to facilitate fast client-side searching.

The project is currently in very early development. Overall structure is likely to change as the project grows.

## Development

To install dependencies

`npm install`

To build

`npm run build`

To run a previous build without rebuilding

`npm start`

To build and then run the dev build

`npm run dev`

Data may be viewed at `localhost:3001`. The port and data directory can be configured in config.yaml (generated on first run). [balthasar](https://github.com/Drowrin/balthasar) provides a frontend for the data.

## Docker

A Dockerfile is included for easy deployment and for a reproducible environment.

To build a docker image

`docker build -t casper .`

To run the generated image

`docker run -p 3001:3001 -v path/to/data:/casper/data casper`

or with docker-compose

```
casper:
  image: casper
  volumes:
    - path/to/data:/casper/data
  ports:
    - 3001:3001
```

## Command Line Interface

casper includes a command line interface for quickly interacting with data when loading the whole server is not necessary.

`npm run casper <args>`

Multiple args are joined together to form an entity id, which is looked up in the manifest. If the entity exists, the resolved data will be printed to the console.

## Powered By...

-   [TypeScript](https://www.typescriptlang.org/)
-   [Express](https://expressjs.com/)
-   [cors](https://www.npmjs.com/package/cors)
-   [Fuse.js](https://fusejs.io/)
-   [js-yaml](https://www.npmjs.com/package/js-yaml)
-   [object-hash](https://www.npmjs.com/package/object-hash)
-   [Ajv](https://ajv.js.org/)
-   [typescript-json-schema](https://github.com/YousefED/typescript-json-schema)
