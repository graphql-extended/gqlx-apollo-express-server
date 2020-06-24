import { defaultSubscriptionsPath } from './constants';

export function defaultErrorLogger(path: string, details: any) {
  console.error(`Encountered an error at "%s": %s`, path, details);
}

export function tryParseJson(message?: string) {
  if (message) {
    try {
      return JSON.parse(message);
    } catch (_) {}
  }

  return message;
}

export function getSubscriptionEndpoint(host: string, path = defaultSubscriptionsPath) {
  host = host.replace('http', 'ws');

  if (!path.startsWith('/') && !host.endsWith('/')) {
    return `${host}/${path}`;
  } else if (path.startsWith('/') && host.endsWith('/')) {
    return `${host}/${path.substring(1)}`;
  }

  return `${host}${path}`;
}
