import { Service, ServiceDefinition } from './types';
import { assertValidSchema } from 'graphql';
import { makeExecutableSchema } from 'graphql-tools';
import { compile } from 'gqlx-js';
import { defaultApi } from './constants';

export function createService<TData>(name: string, gqlxSource: string, data: TData, api = defaultApi) {
  const gql = compile(name, gqlxSource, api);
  const service: Service<TData> = {
    name,
    createService: gql.createService,
    schema: makeExecutableSchema({
      typeDefs: gql.schema,
      resolvers: gql.resolvers as any,
    }),
    data,
  };
  assertValidSchema(service.schema);
  return service;
}

export function createServices<TData>(definitions: Array<ServiceDefinition<TData>>, api = defaultApi) {
  return definitions.map(({ name, source, data }) => createService(name, source, data, api));
}
