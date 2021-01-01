var express = require('express');
var { graphqlHTTP } = require('express-graphql');
var { buildSchema } = require('graphql');
var parser = require('./parser');

var schema = buildSchema(`
  type Tool {
    name: String
    description: String
    uses: String
    cost: String
    weight: String
  }

  type Query {
    tools : [Tool]
    tool(name: String!)
  }
`);

var root = {
    tools: () => {
        return [{name: 'Hello World!'}];
    }
};

var app = express();
app.use('/', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
}));

app.listen(4000);
console.log('Running a GraphQL API server at http://localhost:4000/');