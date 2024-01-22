import { configureApp } from "./utils";
import serverless from 'serverless-http';

const app = configureApp();

// Returns the content that gets loaded within the panel's iframe.
app.get('/iframe-panel', (req, res) => {
  return res.render('iframe');
});

const handler = serverless(app);
export { handler };