import express from "express";
import path from 'path';
import bodyParser from 'body-parser';
import { engine } from 'express-handlebars';
import crypto from 'crypto';

/**
 * Creates and configures an Express application
 * @returns {app}
 */
export function configureApp() {
  const app = express();
  app.use(bodyParser.urlencoded({ extended: true }));
  const integrationDir = path.join(__dirname, '/integration');

  app.use(express.urlencoded({ extended: true }));
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

export const HMAC_SHA1 = {
  buildSignatureRaw: function ({
    url,
    method,
    params,
    appSecret,
    token
  }) {
    const sig = [
      method.toUpperCase(),
      specialEncode(url),
      cleanRequestBody(params)
    ];
    
    return this.signString(sig.join('&'), appSecret, token);
  },

  signString: function (str, key, token) {
    key = `${key}&`;
    if (token) {
      key += token;
    }
    return crypto.createHmac('sha1', key).update(str).digest('base64');
  }
};

function specialEncode(str) {
  // Implement special encoding (RFC 3986)
  return encodeURIComponent(str).replace(/[!'()*]/g, char => '%' + char.charCodeAt(0).toString(16));
}

function cleanRequestBody(body) {
  let cleanParams, encodeParam, out;
    out = [];
    encodeParam = function(key, val) {
      const encodeParam = key + '=' + specialEncode(val)
      return encodeParam;
    };
    cleanParams = function(params) {
      let i, key, len, val, vals;
      if (typeof params !== 'object') {
        return;
      }
      for (key in params) {
        vals = params[key];
        if (key === 'oauth_signature') {
          continue;
        }
        if (!params.hasOwnProperty(key)) continue;
        if (Array.isArray(vals) === true) {
          for (i = 0, len = vals.length; i < len; i++) {
            val = vals[i];
            out.push(encodeParam(key, val));
          }
        } else {
          out.push(encodeParam(key, vals));
        }
      }
    };
    cleanParams(body);
    return specialEncode(out.sort().join('&'));
}