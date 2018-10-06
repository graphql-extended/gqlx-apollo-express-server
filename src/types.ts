import { GraphQLSchema } from 'graphql';
import { DynamicResolver } from 'gqlx-js';
import { Request } from 'express';

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
  createApi(service: Service<TData>, req?: Request): TApi;
  paths?: {
    graphiql?: string | false;
    subscriptions?: string;
    root?: string;
  };
}
