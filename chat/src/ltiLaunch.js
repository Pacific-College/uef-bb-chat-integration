import { configureApp, buildUrl } from "./utils";
import serverless from 'serverless-http';
import { URL } from 'url';
import { HMAC_SHA1 } from './utils';
import config from './config';

const app = configureApp();

// (1) This endpoint receives the LTI launch from the LMS. From here, we will redirect to begin the OAuth2 workflow (see step #2)
app.post('/lti-launch', (req, res) => {
  // Normally, you'd want to validate the LTI request you receive here. However, we will omit this as an exercise to
  // the reader (see Step 1-3 of https://www.imsglobal.org/wiki/step-1-lti-launch-request)

  // Validate the LTI launch request
  // Step 1
  let isValidLtiRequest = req.method === 'POST';
  isValidLtiRequest = isValidLtiRequest && req.body.lti_message_type === 'basic-lti-launch-request';
  isValidLtiRequest = isValidLtiRequest && (req.body.lti_version === 'LTI-1p0' || req.body.lti_version === 'LTI-2p0');
  isValidLtiRequest = isValidLtiRequest && req.body.oauth_consumer_key && req.body.oauth_consumer_key.trim() !== '';
  isValidLtiRequest = isValidLtiRequest && req.body.resource_link_id && req.body.resource_link_id.trim() !== '';

  if (!isValidLtiRequest) {
    // If the request is not a valid LTI launch, send an appropriate response
    return res.status(400).send('Invalid LTI launch request');
  }

  // Step 2 - Validate the OAuth signature
  try {
    const appSecret = process.env.APP_SECRET;
    if (!appSecret) {
      throw new Error('Missing app secret or app key');
    }

    const requestUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    console.log(requestUrl)
    const signatureData = {
      url: requestUrl,
      method: req.method,
      params: req.body,
      appSecret: appSecret,
      token: ''
    };
    const signature = HMAC_SHA1.buildSignatureRaw(signatureData);

    if (signature === req.body.oauth_signature) {
      res.send('Oauth signature is valid');
    }
  } catch (error) {
    return res.status(403).send(error.message);
  }

  // Step 3
  let isValid = true;

  // Check for a user ID
  isValid = isValid && req.body.user_id && req.body.user_id.trim() !== '';

  // Check for a role
  isValid = isValid && req.body.roles && req.body.roles.trim() !== '';

  if (isValid) {
    // Function to parse the roles string into an array
    const parseRoles = (rolesString) => {
      // Assuming roles are separated by comma, semicolon, or space
      return rolesString.split(/[,; ]+/).filter(role => role.trim() !== '');
    };

    // Check that the user is either a Learner or an Instructor
    const roles = parseRoles(req.body.roles);
    isValid = roles && roles.length > 0;
    // isValid = roles.includes('urn:lti:role:ims/lis/Learner') || roles.includes('urn:lti:role:ims/lis/Instructor') || roles.includes('urn:lti:sysrole:ims/lis/Administrator');
  }

  if (!isValid) {
    // Handle the case where the checks fail
    res.status(400).send('Invalid user ID or role');
    return;
  }


  // We will use the launch_presentation_return_url to determine the hostname of the LMS. We are making some assumption
  // that the LMS will be hosted at the root of the return URL, so a production-quality application will likely want to
  // do something more robust here.
  const url = new URL(req.body.launch_presentation_return_url);

  // Now, we will build the return URL that will point the user back to the integration after the OAuth2 workflow (the
  // URL for  *2).
  const redirectUri = buildUrl(`${config.integrationUrl}/authorization-complete`, {
    lis_person_name_given: req.body.lis_person_name_given || '',
    lis_person_name_family: req.body.lis_person_name_family || '',
    lis_person_contact_email_primary: req.body.lis_person_contact_email_primary || '',
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

const handler = serverless(app);

export { handler };