import { Server } from 'http';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { execute, subscribe } from 'graphql';
import { GatewayOptions } from './types';
import { getSchema, onUpdate } from './schema';
import { createContext } from './context';

const defaultSubscriptionsPath = '/subscriptions';

export function getSubscriptionEndpoint(host: string, path = defaultSubscriptionsPath) {
  host = host.replace('http', 'ws');

  if (!path.startsWith('/') && !host.endsWith('/')) {
    return `${host}/${path}`;
  } else if (path.startsWith('/') && host.endsWith('/')) {
    return `${host}/${path.substring(1)}`;
  }

  return `${host}${path}`;
}

export function createSubscription<TApi, TData>(server: Server, options: GatewayOptions<TApi, TData>) {
  const { paths = {} } = options;
  const path = paths.subscriptions || defaultSubscriptionsPath;
  const subscription = new SubscriptionServer(
    {
      execute,
      subscribe,
      keepAlive: options.keepAlive,
      schema: getSchema(),
      async onOperation(_message: any, params: any, ws: any) {
        const req = ws.upgradeReq;
        const context = createContext(req, options.services, options.createApi);
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

  const stopListening = onUpdate(schema => {
    (subscription as any).schema = schema;
  });

  return () => {
    stopListening();
    subscription.close();
  };
}
