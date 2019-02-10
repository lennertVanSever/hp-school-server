import { ApolloServer } from 'apollo-server';
import { resolvers } from './data/resolvers';
import { typeDefs } from './data/Schema';
import ApolloClient from 'apollo-boost';
import fetch from 'node-fetch';
// import './dataGenerator';

global.fetch = fetch;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  playground: {
    settings: {
      'editor.theme': 'light',
      'editor.cursorShape': 'line'
    },
  }
});


const port = process.env.PORT || 5000;
server.listen({ port }).then(({ url }) => {
  console.log(`🚀  ${url}`);
  global.client = new ApolloClient({
    uri: 'http://localhost:4000/graphql',
  });
});
