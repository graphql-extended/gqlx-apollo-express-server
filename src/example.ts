import * as express from 'express';
import * as bodyParser from 'body-parser';
import { setupGateway, createServices } from './index';

const port = +(process.env.PORT || 3000);
const app = express();

app.use(bodyParser.json());

setupGateway(app, {
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

app.listen(port);
