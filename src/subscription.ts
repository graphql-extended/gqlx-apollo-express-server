import { Server } from 'http';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { execute, subscribe, GraphQLSchema } from 'graphql';
import { SubscriptionOptions } from './types';
import { createContext } from './context';
import { defaultSubscriptionsPath, defaultApiCreator } from './constants';

function getUpdater(subscription: any) {
  return (schema: GraphQLSchema) => {
    subscription.schema = schema;
  };
}

export function createSubscription<TApi, TData>(server: Server, options: SubscriptionOptions<TApi, TData>) {
  const { paths = {}, schema, services, createApi = defaultApiCreator } = options;
  const path = paths.subscriptions || defaultSubscriptionsPath;
  const subscription = new SubscriptionServer(
    {
      execute,
      subscribe,
      keepAlive: options.keepAlive,
      schema: schema.get(),
      async onOperation(_message: any, params: any, ws: any) {
        const req = ws.upgradeReq;
        const context = createContext(req, services, createApi);
        return {
          ...params,
          context,
        };
      },
    },
    {
      server,
      path,
    },
  );
  const stopListening = schema.onUpdate(getUpdater(subscription));

  return () => {
    stopListening();
    subscription.close();
  };
}
