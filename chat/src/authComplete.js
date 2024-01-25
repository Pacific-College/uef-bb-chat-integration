import fetch from 'node-fetch';
import { configureApp, buildUrl } from "./utils";
import serverless from 'serverless-http';
import config from './config';

const app = configureApp();

// (2) After the OAuth2 authorization code workflow is complete, we receive the authorization code. Now, we need to
// exchange the authorization code for an bearer token that we can use to authorize with Learn Ultra. Once we have the
// authorization token, we can start loading the integration.
app.get('/authorization-complete', async (req, res, next) => {
  const lmsHost = req.query.lms_host;
  const authorizationCode = req.query.code;
  const isStudent = false;
  const chatStaffUrl = process.env.CHAT_STAFF_URL || 'https://google.com';
  const chatStudentUrl = process.env.CHAT_STUDENT_URL || 'https://google.com';
  const chatRouteUrl = isStudent ? chatStudentUrl : chatStaffUrl;
  const chatIconUrl = process.env.CHAT_ICON_URL || 'https://picsum.photos/125';
  const chatDisplayName = process.env.CHAT_DISPLAY_NAME || 'Chat';
  const stage = process.env.APP_STAGE || 'development';

  // Rebuild the redirect_uri, so we can supply it as part of the OAuth2 token request. The specification requires
  // us to supply the original redirect_uri as a security measure.
  const lmsUrl = new URL(lmsHost);
  const redirectUri = buildUrl(`${config.integrationUrl}/authorization-complete`, {
    lms_host: `${lmsUrl.protocol}//${lmsUrl.host}`,
  });

  // Build the authorization header, using the application key and secret
  const requestToken = Buffer.from(`${config.applicationKey}:${config.applicationSecret}`).toString('base64');

  // Retrieve the authorization token from Learn
  const authorizationRequest = await fetch(
    buildUrl(`${lmsHost}/learn/api/public/v1/oauth2/token`, {
      code: authorizationCode,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    }), {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${requestToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
  );

  // Validate the request and fail if the underlying authorization token request fails
  if (!authorizationRequest.ok) {
    console.error(await authorizationRequest.json());
    next(new Error('Unable to process authorization token'));
    return;
  }
  const authorizationRequestBody = await authorizationRequest.json();
  const authorizationToken = authorizationRequestBody.access_token;

  // Now that we have the authorization token, we can render the integration content
  return res.render('integration', { authorizationToken, lmsHost, chatIconUrl, chatRouteUrl, chatDisplayName, stage });
});

const handler = serverless(app);
export { handler };