import { GraphQLService } from 'apollo-server-core';
import { execute } from 'graphql';
import { EventEmitter } from 'events';
import { createSchema } from './schema';

const UPDATE_SCHEMA_EVENT = 'schema-update';

export function createGateway({ get: getSchema, onUpdate }: ReturnType<typeof createSchema>): GraphQLService {
  const eventEmitter = new EventEmitter();

  const executor: GraphQLService['executor'] = args =>
    execute({
      ...args,
      schema: getSchema(),
      contextValue: args.context,
      variableValues: args.request.variables,
    });

  onUpdate((newSchema: ReturnType<typeof getSchema>) => eventEmitter.emit(UPDATE_SCHEMA_EVENT, newSchema));

  return {
    load: () =>
      Promise.resolve({
        schema: getSchema(),
        executor,
      }),
    onSchemaChange: callback => {
      eventEmitter.on(UPDATE_SCHEMA_EVENT, callback);
      return () => eventEmitter.removeListener(UPDATE_SCHEMA_EVENT, callback);
    },
    executor,
  };
}
