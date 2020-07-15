import { makeExecutableSchema } from 'apollo-server-express';
import { assertValidSchema } from 'graphql';
import { compile, GqlTransformOptions } from 'gqlx-js';
import { Service, ServiceDefinition } from './types';
import { defaultApi } from './constants';

export function createService<TApi, TData>(
  name: string,
  gqlxSource: string,
  data: TData,
  api = defaultApi,
  options?: GqlTransformOptions,
) {
  const gql = compile(name, gqlxSource, api, options);
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

export function createServices<TApi, TData>(
  definitions: Array<ServiceDefinition<TData>>,
  api = defaultApi,
  options?: GqlTransformOptions,
) {
  return definitions.map(({ name, source, data }) => createService<TApi, TData>(name, source, data, api, options));
}
