import express from "express";
import path from 'path';
import bodyParser from 'body-parser';
import { engine } from 'express-handlebars';

/**
 * Creates and configures an Express application
 * @returns {app}
 */
export function configureApp() {
  const app = express();
  app.use(bodyParser.urlencoded({ extended: true }));
  const integrationDir = path.join(__dirname, '/integration');

  app.use(express.urlencoded({extended: true}));
  app.use('/assets', express.static(integrationDir));
  app.use(express.json());
  app.engine('handlebars', engine({ defaultLayout: false }));
  app.set('view engine', 'handlebars');
  app.set('views', integrationDir);

  return app;
}

/**
 * Builds a URL with query parameters
 * @param baseUrl The URL of the request, including protocol, hostname, port
 * @param queryParams The query parameters, as a map
 * @returns {string} The joined URL
 */
export function buildUrl(baseUrl, queryParams) {
  const paramsString = Object.keys(queryParams)
    .map(i => `${i}=${queryParams[i]}`)
    .join('&');

  return `${baseUrl}?${paramsString}`;
}
