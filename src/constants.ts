import { AvailableApi } from 'gqlx-js';
import { ApiCreator } from './types';

export const defaultSubscriptionsPath = '/subscriptions';
export const defaultGraphiQLPath = '/graphiql';
export const defaultRootPath = '/';
export const defaultApi: AvailableApi = {};

export const defaultApiCreator: ApiCreator<any, any> = () => ({});
