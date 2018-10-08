import { apolloUploadExpress } from 'apollo-upload-server';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { createContext } from './context';
import { GatewayOptions, GraphQLServer } from './types';
import { getSubscriptionEndpoint, tryParseJson } from './utils';
import { createSubscription } from './subscription';
import { createSchema } from './schema';
import { defaultGraphiQLPath, defaultRootPath, defaultApiCreator } from './constants';

export function configureGqlx<TApi, TData>(options: GatewayOptions<TApi, TData>): GraphQLServer<TData> {
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

  return {
    install(app) {
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
    update() {
      schema.update(services);
    },
    insert(service) {
      const serviceName = service.name;
      const index = services.findIndex(svc => svc.name === serviceName);
      const newServices =
        index !== -1
          ? services.map(oldService => {
              if (oldService.name === serviceName) {
                return service;
              }

              return oldService;
            })
          : [...services, service];
      schema.update(newServices);
      services.splice(0, services.length, ...newServices);
    },
  };
}
