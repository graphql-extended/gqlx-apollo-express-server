# gqlx Node.js Express Middleware using Apollo Server

[![Build Status](https://travis-ci.org/graphql-extended/gqlx-apollo-express-server.svg?branch=master)](https://travis-ci.org/graphql-extended/gqlx-apollo-express-server)
[![npm](https://img.shields.io/npm/v/gqlx-apollo-express-server.svg)](https://www.npmjs.com/package/gqlx-apollo-express-server)
[![node](https://img.shields.io/node/v/gqlx-apollo-express-server.svg)](https://www.npmjs.com/package/gqlx-apollo-express-server)
[![GitHub tag](https://img.shields.io/github/tag/graphql-extended/gqlx-apollo-express-server.svg)](https://github.com/graphql-extended/gqlx-apollo-express-server/releases)
[![GitHub issues](https://img.shields.io/github/issues/graphql-extended/gqlx-apollo-express-server.svg)](https://github.com/graphql-extended/gqlx-apollo-express-server/issues)

An opinionated Express middleware bringing a pre-configured Apollo server with gqlx support to your project.

![gqlx Logo](https://github.com/graphql-extended/gqlx-spec/raw/master/logo.png)

## Getting Started

To get started just install the package via npm.

```bash
npm i gqlx-apollo-express-server
```

Since Express is used as a peer dependency you need to have it installed already or you'll need to install it.

```js
import * as express from 'express';
import * as bodyParser from 'body-parser';
import { configureGqlx, createServices } from 'gqlx-apollo-express-server';

const port = +(process.env.PORT || 3000);
const app = express();
const gqlxServer = configureGqlx({
  port,
  host: 'http://www.example.com',
  services: createServices([
    {
      name: 'default',
      source: `
        type Query {
          hello(name: String): String {
            name ? 'Hello ' + name : 'Hello World'
          }
        }
      `,
      data: {},
    },
  ]),
});

app.use(bodyParser.json());
gqlxServer.applyMiddleware(app);
app.listen(port);
```

The `gqlx-apollo-express-server` is service-based, i.e., we have to supply services for performing the GraphQL resolver duty. The advantage is that we can easily swap services during runtime, e.g., if these services relate to independent functionality such as microservices which are updated during we can reflect these updates in the GraphQL instance as well - without having to restart the server.

## Documentation

A Node.js Express middleware for integrating an Apollo server supporting gqlx.

All you need is to use the `configureGqlx` method for configuring everything you need. The object is ready to be used on an express application. It will install multiple middlewares (depending on the configuration) to serve GraphQL (and potentially some other stuff, such as an GraphiQL instance).

```js
// ...
import { configureGqlx } from 'gqlx-apollo-express-server';

const app = express();
configureGqlx({ port, /* ... */ }).applyMiddleware(app);
```

Right now the following options are supported:

```ts
interface GatewayOptions<TApi, TData> {
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
   * Defines an error formatter.
   * @param error The error to format.
   * @returns The formatted error message.
   */
  formatter?(error?: string): any;
  /**
   * Creates the API to be used by the services.
   */
  createApi?: ApiCreator<TApi, TData>;
  /**
   * Optionally, changes the used server paths.
   */
  paths?: ServerPaths;
}
```

Only the first three (`port`, `host`, and `services`) are required.

## Contributing

We are totally open for contribution and appreciate any feedback, bug reports, or feature requests. More detailed information on contributing incl. a code of conduct are soon to be presented.

## FAQ

*What needs to be configured?*

Only a bare minimum of configuration is necessary. The getting started contains a sample using only the required options. What services to expose and how these are defined is fully up to you.

## Changelog

This project adheres to [semantic versioning](https://semver.org).

You can find the changelog in the [CHANGELOG.md](CHANGELOG.md) file.

## License

gqlx-apollo-express-server is released using the MIT license. For more information see the [LICENSE file](LICENSE).
