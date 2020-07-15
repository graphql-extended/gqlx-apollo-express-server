import { GraphQLSchema } from 'graphql';
import { DynamicResolver } from 'gqlx-js';
import { Request, Application } from 'express';
import { Server } from 'http';

export interface Service<TApi, TData> {
  /**
   * The name of the service.
   */
  name: string;
  /**
   * The extracted pure GraphQL schema.
   */
  schema: GraphQLSchema;
  /**
   * The additional service data.
   */
  data: TData;
  /**
   * The function to create the dynamic resolvers.
   * @param api The API of the gateway to be used by the resolvers.
   * @returns The resolvers for the pure GraphQL schema.
   */
  createService(api: TApi): DynamicResolver;
}

export interface ServiceDefinition<TData> {
  name: string;
  source: string;
  data: TData;
}

export interface ApiCreator<TApi, TData> {
  (service: Service<TApi, TData>, req?: Request): TApi;
}

export interface ServerPaths {
  /**
   * Path for the GraphiQL website.
   */
  graphiql?: string | false;
  /**
   * Path for the WebSocket endpoint.
   */
  subscriptions?: string;
  /**
   * Path for the root GraphQL endpoint.
   */
  root?: string;
}

export interface Unsubscriber {
  (): void;
}

export interface SchemaBag<TApi, TData> {
  get(): GraphQLSchema;
  onUpdate(cb: (schema: GraphQLSchema) => void): Unsubscriber;
  update(services: Array<Service<TApi, TData>>): void;
}

export interface SubscriptionOptions<TApi, TData> {
  schema: SchemaBag<TApi, TData>;
  services: Array<Service<TApi, TData>>;
  keepAlive?: number;
  createApi?: ApiCreator<TApi, TData>;
  paths?: ServerPaths;
}

export interface GatewayOptions<TApi, TData> {
  /**
   * The port of the server.
   */
  port: number;
  /**
   * The (external) hostname for lookups.
   */
  host: string;
  /**
   * The different services to register.
   */
  services: Array<Service<TApi, TData>>;
  /**
   * The optional keep alive in milliseconds.
   */
  keepAlive?: number;
  /**
   * Activates the optional tracing.
   */
  tracing?: boolean;
  /**
   * Activates the optional cache-control.
   */
  cacheControl?: boolean;
  /**
   * Optionally, sets the max. size of a file (in bytes).
   */
  maxFileSize?: number;
  /**
   * Optionally, sets the max. number of files to upload.
   */
  maxFiles?: number;
  /**
   * Optionally, adds a custom logger for errors.
   */
  logError?(path: string, details: any): void;
  /**
   * Defines an error formatter.
   * @param error The error to format.
   * @returns The formatted error message.
   */
  formatter?(error?: string): string;
  /**
   * Creates the API to be used by the services.
   */
  createApi?: ApiCreator<TApi, TData>;
  /**
   * Optionally, changes the used server paths.
   */
  paths?: ServerPaths;
  /**
   * Enables and disables schema introspection. By default is true.
   */
  introspection?: boolean;
}

export interface GraphQLServer<TApi, TData> {
  /**
   * Applies the middleware to a given express app.
   * @param app The app to apply the middleware to.
   */
  applyMiddleware(app: Application): void;
  /**
   * Creates a subscription server based on the given server.
   * @param server The server to create a subscription for.
   * @returns A disposer function for unsubscribing.
   */
  subscribe(server: Server): Unsubscriber;
  /**
   * Performs a schema update of all inserted services.
   */
  update(): void;
  /**
   * Updates an existing service during runtime.
   * @param service The service to update.
   */
  update(service: Service<TApi, TData>): void;
  /**
   * Inserts a new service during runtime. If the service has
   * been inserted already the service will be updated.
   * @param service The service to insert.
   */
  insert(service: Service<TApi, TData>): void;
  /**
   * Removes an existing service during runtime.
   * @param service The service to remove.
   */
  remove(serviceName: string): void;
  /**
   * Gets an existing service specified by its name.
   * @param serviceName The name of the service to get.
   * @returns The instance of the service.
   */
  get(serviceName: string): Service<TApi, TData>;
}
