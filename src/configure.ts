import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { createContext } from './context';
import { GatewayOptions, GraphQLServer, Service } from './types';
import { getSubscriptionEndpoint, tryParseJson } from './utils';
import { createSubscription } from './subscription';
import { createSchema } from './schema';
import { defaultGraphiQLPath, defaultRootPath, defaultApiCreator } from './constants';

const { apolloUploadExpress } = require('apollo-upload-server');

export function configureGqlx<TApi, TData>(options: GatewayOptions<TApi, TData>) {
  const {
    maxFiles = 1,
    maxFileSize = 16 * 1024 * 1024,
    paths = {},
    host,
    keepAlive,
    formatter = tryParseJson,
    services,
    createApi = defaultApiCreator,
    tracing = false,
    cacheControl = true,
  } = options;
  const schema = createSchema(services);
  const gqlxServer: GraphQLServer<TApi, TData> = {
    applyMiddleware(app) {
      const root = paths.root || defaultRootPath;

      if (paths.graphiql !== false) {
        const path = paths.graphiql || defaultGraphiQLPath;
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
          schema: schema.get(),
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
    },
    subscribe(server) {
      const unsubscribe = createSubscription(server, {
        keepAlive,
        createApi,
        paths,
        schema,
        services,
      });
      server.on('close', unsubscribe);
      return unsubscribe;
    },
    update(newService?: Service<TApi, TData>) {
      if (newService) {
        const serviceName = newService.name;
        const newServices = services.map(oldService => (oldService.name === serviceName ? newService : oldService));
        services.splice(0, services.length, ...newServices);
      }

      schema.update(services);
    },
    insert(service) {
      const existingService = gqlxServer.get(service.name);

      if (existingService !== undefined) {
        gqlxServer.update(service);
      } else {
        const newServices = [...services, service];
        services.splice(0, services.length, ...newServices);
        gqlxServer.update();
      }
    },
    remove(serviceName) {
      const newServices = services.filter(svc => svc.name !== serviceName);
      services.splice(0, services.length, ...newServices);
      gqlxServer.update();
    },
    get(serviceName) {
      const [service] = services.filter(svc => svc.name === serviceName);
      return service;
    },
  };
  return gqlxServer;
}
