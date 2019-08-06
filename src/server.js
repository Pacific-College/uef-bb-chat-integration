import fetch from 'node-fetch';
import config from '../config';
import {buildUrl, configureApp} from "./utils";

const app = configureApp();

// (1) This endpoint receives the LTI launch from the LMS. From here, we will redirect to begin the OAuth2 workflow (see #2)
app.post('/lti-launch', (req, res) => {
  // Normally, you'd want to validate the LTI request you receive here. However, we will omit this as an exercise to
  // the reader (see Step 1-3 of https://www.imsglobal.org/wiki/step-1-lti-launch-request)

  // We will use the launch_presentation_return_url to determine the hostname of the LMS. We are making some assumption
  // that the LMS will be hosted at the root of the return URL, so a production-quality application will likely want to
  // do something more robust here.
  const url = new URL(req.body.launch_presentation_return_url);

  // Now, we will build the return URL that will point the user back to the integration after the OAuth2 workflow (the
  // URL for #2).
  const redirectUri = buildUrl(`${config.integrationUrl}/authorization-complete`, {
    lms_host: `${url.protocol}//${url.host}`,
  });

  // Now, we will build the authorization code request URL. In a production scenario, you would want to add state,
  // code_challenge, and code_challenge_method parameters for additional security.
  const authorizationCodeParams = {
    redirect_uri: encodeURIComponent(redirectUri),
    response_type: 'code',
    client_id: config.applicationKey,
  };
  const authorizationCodeUrl = buildUrl(
    `${url.protocol}//${url.host}/learn/api/public/v1/oauth2/authorizationcode`,
    authorizationCodeParams
  );

  // Now we will redirect to begin the OAuth2 authorization code workflow. Once that workflow is done, Learn will return
  // us to /authorization-complete (step #2).
  res.redirect(authorizationCodeUrl);
});

// (2) After the OAuth2 authorization code workflow is complete, we receive the authorization code. Now, we need to
// exchange the authorization code for an bearer token that we can use to authorize with Learn Ultra. Once we have the
// authorization token, we can start loading the integration.
app.get('/authorization-complete', async (req, res, next) => {
  const lmsHost = req.query.lms_host;
  const authorizationCode = req.query.code;

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
  return res.render('integration', { authorizationToken, lmsHost });
});

// Returns the content that gets loaded within the panel's iframe.
app.get('/iframe-panel', (req, res) => {
  return res.render('iframe');
});

app.listen(config.listenPort, () => {
  console.log(`Integration listening on port ${config.listenPort}`);
});