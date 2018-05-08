import express from 'express';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import bodyParser from 'body-parser';
import schema from './data/schema';
import compression from 'compression';
import { ApolloEngine } from 'apollo-engine';

const app = express();
const engine = new ApolloEngine({
  stores: [{
    name: 'privateResponseMemcache',
    memcache: {
      url: ['localhost:4567'],
    },
  }],
  sessionAuth: {
    header: 'Authorization',
    tokenAuthUrl: 'https://auth.mycompany.com/engine-auth-check',
  },
  queryCache: {
    privateFullQueryStore: 'privateResponseMemcache',
    // By not mentioning publicFullQueryStore, we keep it enabled with
    // the default empty-string-named in-memory store.
  },
  apiKey: process.env.ENGINE_API_KEY,
});

app
  .use('/graphql', bodyParser.json(), graphqlExpress({ schema }))
  .use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }))
  .use(compression())
  .use('/graphql', bodyParser.json(), graphqlExpress({
    schema,
    context: {},
    tracing: true,
    cacheControl: true
  }));

// No engine.start() or app.use() required!

// Instead of app.listen():
engine.listen({
  port: process.env.GRAPHQL_PORT,
  graphqlPaths: ['/graphql'],
  expressApp: app,
  launcherOptions: {
    startupTimeout: 3000,
  }
}, () => {
  console.log('Listening!');
});