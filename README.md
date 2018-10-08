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
gqlxServer.install(app);
app.listen(port);
```

The `gqlx-apollo-express-server` is service-based, i.e., we have to supply services for performing the GraphQL resolver duty. The advantage is that we can easily swap services during runtime, e.g., if these services relate to independent functionality such as microservices which are updated during we can reflect these updates in the GraphQL instance as well - without having to restart the server.

## Documentation

A Node.js Express middleware for integrating an Apollo server supporting gqlx.

(tbd)

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
