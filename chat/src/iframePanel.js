import { configureApp } from "./utils";
import serverless from 'serverless-http';

const app = configureApp();

// Returns the content that gets loaded within the panel's iframe.
app.get('/iframe-panel', (req, res) => {
  const fcToken = process.env.FC_TOKEN || '';
  return res.render('iframe', { fcToken});
});

const handler = serverless(app);
export { handler };