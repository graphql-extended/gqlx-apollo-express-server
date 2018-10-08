import { GraphQLSchema } from 'graphql';
import { DynamicResolver } from 'gqlx-js';
import { Request, Application } from 'express';
import { Server } from 'http';

export interface Service<TData> {
  name: string;
  schema: GraphQLSchema;
  data: TData;
  createService(api: any): DynamicResolver;
}

export interface ServiceDefinition<TData> {
  name: string;
  source: string;
  data: TData;
}

export interface ApiCreator<TApi, TData> {
  (service: Service<TData>, req?: Request): TApi;
}

export interface ServerPaths {
  graphiql?: string | false;
  subscriptions?: string;
  root?: string;
}

export interface Unsubscriber {
  (): void;
}

export interface SchemaBag<TData> {
  get(): GraphQLSchema;
  onUpdate(cb: (schema: GraphQLSchema) => void): Unsubscriber;
  update(services: Array<Service<TData>>): void;
}

export interface SubscriptionOptions<TApi, TData> {
  schema: SchemaBag<TData>;
  services: Array<Service<TData>>;
  keepAlive?: number;
  createApi?: ApiCreator<TApi, TData>;
  paths?: ServerPaths;
}

export interface GatewayOptions<TApi, TData> {
  port: number;
  host: string;
  services: Array<Service<TData>>;
  keepAlive?: number;
  tracing?: boolean;
  cacheControl?: boolean;
  maxFileSize?: number;
  maxFiles?: number;
  formatter?(error?: string): any;
  createApi?: ApiCreator<TApi, TData>;
  paths?: ServerPaths;
}

export interface GraphQLServer<TData> {
  install(application: Application): void;
  subscribe(server: Server): Unsubscriber;
  update(): void;
  insert(service: Service<TData>): void;
}
