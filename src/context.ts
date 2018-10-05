import { ServicesContext } from 'gqlx-js';
import { ApiCreator, Service } from './types';
import { Request } from 'express';

export function createContext<T>(
  req: undefined | Request,
  services: Array<Service>,
  createApi: ApiCreator<T>,
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
