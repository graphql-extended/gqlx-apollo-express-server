import { ServicesContext } from 'gqlx-js';
import { ApiCreator, Service } from './types';
import { Request } from 'express';

export function createContext<TApi, TData>(
  req: undefined | Request,
  services: Array<Service<TData>>,
  createApi: ApiCreator<TApi, TData>,
): ServicesContext {
  return {
    getService(name: string) {
      const service = services.find(m => m.name === name);

      if (service) {
        const api = createApi(service, req);
        return service.createService(api);
      }

      return () => Promise.resolve(undefined);
    },
  };
}
