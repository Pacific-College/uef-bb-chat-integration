// This file will load server.js using babel and a few polyfills
require('@babel/register')({
  presets: ['@babel/env']
});
require("core-js/stable");
require("regenerator-runtime/runtime");

require('./server');