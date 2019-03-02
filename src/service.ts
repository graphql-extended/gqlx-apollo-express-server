import { assertValidSchema } from 'graphql';
import { makeExecutableSchema } from 'graphql-tools';
import { compile } from 'gqlx-js';
import { Service, ServiceDefinition } from './types';
import { defaultApi } from './constants';

export function createService<TApi, TData>(name: string, gqlxSource: string, data: TData, api = defaultApi) {
  const gql = compile(name, gqlxSource, api);
  const service: Service<TApi, TData> = {
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

export function createServices<TApi, TData>(definitions: Array<ServiceDefinition<TData>>, api = defaultApi) {
  return definitions.map(({ name, source, data }) => createService<TApi, TData>(name, source, data, api));
}
