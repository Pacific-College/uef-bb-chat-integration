import { configureApp } from "./utils";
import serverless from 'serverless-http';

const app = configureApp();

// Returns the content that gets loaded within the panel's iframe.
app.get('/iframe-panel', (req, res) => {
  const fcToken = process.env.FC_TOKEN || '';
  const widgetId = process.env.WIDGET_ID || '';
  return res.render('iframe', { fcToken, widgetId });
});

const handler = serverless(app);
export { handler };