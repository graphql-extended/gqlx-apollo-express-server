import * as express from 'express';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { Server } from 'http';
import { apolloUploadExpress } from 'apollo-upload-server';
import { createContext } from './context';
import { getSchema } from './schema';
import { GatewayOptions } from './types';
import { tryParseJson } from './utils';
import { getSubscriptionEndpoint, createSubscription } from './subscription';

export function setupGateway<T>(app: express.Application, options: GatewayOptions<T>) {
  const {
    maxFiles,
    maxFileSize,
    paths,
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
