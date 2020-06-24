import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { createContext } from './context';
import { GatewayOptions, GraphQLServer, Service } from './types';
import { getSubscriptionEndpoint, tryParseJson, defaultErrorLogger } from './utils';
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
    logError = defaultErrorLogger,
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
            const details = formatter(err && err.message);
            logError(path, details);
            return {
              [path]: details,
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
      try {
        if (newService) {
          const serviceName = newService.name;
          const newServices = services.map(oldService => (oldService.name === serviceName ? newService : oldService));
          services.splice(0, services.length, ...newServices);
        }

        schema.update(services);
      } catch (err) {
        logError(`update/${newService?.name}`, err);
      }
    },
    insert(service) {
      try {
        const existingService = gqlxServer.get(service.name);

        if (existingService !== undefined) {
          gqlxServer.update(service);
        } else {
          const newServices = [...services, service];
          services.splice(0, services.length, ...newServices);
          gqlxServer.update();
        }
      } catch (err) {
        logError(`insert/${service?.name}`, err);
      }
    },
    remove(serviceName) {
      try {
        const newServices = services.filter(svc => svc.name !== serviceName);
        services.splice(0, services.length, ...newServices);
        gqlxServer.update();
      } catch (err) {
        logError(`remove/${serviceName}`, err);
      }
    },
    get(serviceName) {
      const [service] = services.filter(svc => svc.name === serviceName);
      return service;
    },
  };
  return gqlxServer;
}
