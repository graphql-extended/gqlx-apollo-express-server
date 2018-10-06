import * as express from 'express';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { Server } from 'http';
import { assertValidSchema } from 'graphql';
import { apolloUploadExpress } from 'apollo-upload-server';
import { makeExecutableSchema } from 'graphql-tools';
import { compile, AvailableApi } from 'gqlx-js';
import { createContext } from './context';
import { getSchema } from './schema';
import { GatewayOptions, Service, ServiceDefinition } from './types';
import { tryParseJson } from './utils';
import { getSubscriptionEndpoint, createSubscription } from './subscription';

export function createService<TData>(name: string, gqlxSource: string, data: TData, api: AvailableApi = {}) {
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

export function createServices<TData>(definitions: Array<ServiceDefinition<TData>>, api: AvailableApi = {}) {
  return definitions.map(({ name, source, data }) => createService(name, source, data, api));
}

export function setupGateway<TApi, TData>(app: express.Application, options: GatewayOptions<TApi, TData>) {
  const {
    maxFiles = 1,
    maxFileSize = 16 * 1024 * 1024,
    paths = {},
    host,
    formatter = tryParseJson,
    services,
    createApi,
    tracing = false,
    cacheControl = true,
  } = options;
  const root = paths.root || '/';

  if (paths.graphiql !== false) {
    const path = paths.graphiql || '/graphiql';
    const subscriptionsEndpoint = getSubscriptionEndpoint(host, paths.subscriptions);

    app.use(
      path,
      graphiqlExpress({
        endpointURL: root,
        subscriptionsEndpoint,
      }),
    );
  }

  app.use(
    root,
    apolloUploadExpress({
      maxFileSize,
      maxFiles,
    }),
    graphqlExpress(req => ({
      schema: getSchema(),
      context: createContext(req, services, createApi),
      formatError(err: any) {
        const path = (err && err.path && err.path[0]) || 'error';
        const message = formatter(err && err.message);
        return {
          [path]: message,
        };
      },
      tracing,
      cacheControl,
    })),
  );

  return (server: Server) => {
    const unsubscribe = createSubscription(server, options);
    server.on('close', unsubscribe);
  };
}
