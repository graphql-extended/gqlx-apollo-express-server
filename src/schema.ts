import * as GraphQLJSON from 'graphql-type-json';
import { mergeSchemas } from 'graphql-tools';
import { GraphQLSchema } from 'graphql';
import { EventEmitter } from 'events';
import { Service } from './types';
import { makeExecutableSchema } from 'graphql-tools';
import { GraphQLUpload } from 'apollo-upload-server';

const events = new EventEmitter();
const rootSchema = makeExecutableSchema({
  typeDefs: `
    scalar JSON
    scalar Upload

    type Query {
      _: Boolean
    }

    type Mutation {
      _: Boolean
    }

    type Subscription {
      _: Boolean
    }

    schema {
      query: Query
      mutation: Mutation
      subscription: Subscription
    }
  `,
  resolvers: {
    Query: {},
    Mutation: {},
    Subscription: {},
    Upload: GraphQLUpload,
    JSON: GraphQLJSON,
  },
});

let executableSchema = rootSchema;

export function updateSchema<TData>(services: Array<Service<TData>>) {
  const schemas = services.map(m => m.schema);
  schemas.splice(0, 0, rootSchema);

  const schema = mergeSchemas({
    schemas,
  });

  executableSchema = schema;
  events.emit('updated');
}

export function onUpdate(cb: (schema: GraphQLSchema) => void): () => void {
  const listener = () => cb(executableSchema);
  events.addListener('updated', listener);
  return () => events.removeListener('updated', listener);
}

export function getSchema() {
  return executableSchema;
}
