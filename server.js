import express from 'express';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import bodyParser from 'body-parser';
import schema from './data/schema';
import compression from 'compression';
import { ApolloEngine } from 'apollo-engine';

const app = express();
const engine = new ApolloEngine({
  apiKey: process.env.ENGINE_API_KEY,
});

app
  .use('/graphql', bodyParser.json(), graphqlExpress({ schema }))
  .use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }))
  .use(compression())
  .use('/graphql', bodyParser.json(), graphqlExpress({
    schema,
    // This option turns on tracing
    tracing: true
  }));

// No engine.start() or app.use() required!

// Instead of app.listen():
engine.listen({
  port: process.env.GRAPHQL_PORT,
  graphqlPaths: ['/graphql'],
  expressApp: app,
  launcherOptions: {
    startupTimeout: 3000,
  },
}, () => {
  console.log('Listening!');
});