import * as GraphQLJSON from 'graphql-type-json';
import { mergeSchemas, makeExecutableSchema } from 'graphql-tools';
import { EventEmitter } from 'events';
import { SchemaBag, Service } from './types';
import { GraphQLSchema } from 'graphql';

const { GraphQLUpload } = require('apollo-upload-server');

function createFromServices<TApi, TData>(rootSchema: GraphQLSchema, services: Array<Service<TApi, TData>>) {
  const schemas = services.map(m => m.schema);
  schemas.splice(0, 0, rootSchema);
  return mergeSchemas({
    schemas,
  });
}

export function createSchema<TApi, TData>(services: Array<Service<TApi, TData>>): SchemaBag<TApi, TData> {
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

  let executableSchema = createFromServices(rootSchema, services);

  return {
    update(services) {
      executableSchema = createFromServices(rootSchema, services);
      events.emit('updated');
    },
    onUpdate(cb) {
      const listener = () => cb(executableSchema);
      events.addListener('updated', listener);
      return () => events.removeListener('updated', listener);
    },
    get() {
      return executableSchema;
    },
  };
}
