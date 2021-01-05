# casper

`casper` is the backend portion of project magi. It loads entities from yaml data, resolves connections between them, and provides the data with a REST API. Indexed data is also provided to facilitate fast client-side searching.

The project is currently in very early development. Overall structure is likely to change as the project grows.

## Development
To install dependencies
```npm install```

To run a dev build
```npm run build```
```npm run start```

Data may be viewed at `localhost:3001`. In the future, this will be configurable for dev builds. [balthasar](https://github.com/Drowrin/balthasar) provides a frontend for the data.