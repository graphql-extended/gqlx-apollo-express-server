import * as express from 'express';
import { configureGqlx, createServices } from './index';

const port = +(process.env.PORT || 3000);
const app = express();
const gqlx = configureGqlx({
  port,
  host: 'http://www.example.com',
  services: createServices([
    {
      name: 'default',
      source: `
        scalar JSON
        type Query {
          hello(name: String): String {
            name ? 'Hello ' + name : 'Hello World'
          }
          foo(x: Int!, y: Int!): JSON {
            { x, y }
          }
        }
      `,
      data: {},
    },
  ]),
});

gqlx.applyMiddleware(app);
app.listen(port);
