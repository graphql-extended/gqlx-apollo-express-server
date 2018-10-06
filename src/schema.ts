import * as GraphQLJSON from 'graphql-type-json';
import { GraphQLUpload } from 'apollo-upload-server';
import { mergeSchemas, makeExecutableSchema } from 'graphql-tools';
import { EventEmitter } from 'events';
import { SchemaBag, Service } from './types';
import { GraphQLSchema } from 'graphql';

function createFromServices<TData>(rootSchema: GraphQLSchema, services: Array<Service<TData>>) {
  const schemas = services.map(m => m.schema);
  schemas.splice(0, 0, rootSchema);
  return mergeSchemas({
    schemas,
  });
}

export function createSchema<TData>(services: Array<Service<TData>>): SchemaBag<TData> {
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
