import { GraphQLSchema } from 'graphql';
import { DynamicResolver } from 'gqlx-js';
import { Request } from 'express';

export interface Service {
  name: string;
  schema: GraphQLSchema;
  url: string;
  createService(api: any): DynamicResolver;
}

export interface ApiCreator<T> {
  (service: Service, req?: Request): T;
}

export interface GatewayOptions<T> {
  port: number;
  keepAlive?: number;
  tracing?: boolean;
  cacheControl?: boolean;
  maxFileSize: number;
  maxFiles: number;
  host: string;
  formatter?(error?: string): any;
  services: Array<Service>;
  createApi(service: Service, req?: Request): T;
  paths: {
    graphiql?: string | false;
    subscriptions?: string;
    root?: string;
  };
}
