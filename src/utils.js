import express from "express";

/**
 * Creates and configures an Express application
 * @returns {app}
 */
export function configureApp() {
  const app = express();
  const integrationDir = __dirname + '/integration';

  app.use(express.urlencoded({extended: true}));
  app.use('/assets', express.static(integrationDir));
  app.set('view engine', 'ejs');
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