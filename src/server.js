const express = require('express');
const app = express();
const config = require(`./config`);

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
    const redirectUri = `${config.integrationUrl}/authorization-complete`;

    // Now, we will build the authorization code request URL. In a production scenario, you would want to add state,
    // code_challenge, and code_challenge_method parameters for additional security.
    const authorizationCodeParams = {
        redirect_uri: redirectUri,
        response_type: 'code',
        client_id: config.applicationKey,
    };
    const authorizationCodeUrl = buildUrl(
        `${url.protocol}://${url.host}/learn/api/public/v1/oauth2/authorizationcode`,
        authorizationCodeParams
    );

    res.redirect(authorizationCodeUrl);
});

// (2) After the OAuth2 authorization code workflow is complete, we receive the authorization code. Now, we need to
// exchange the authorization code for an bearer token that we can use to authorize with Learn Ultra.
app.get('/authorization-complete', (req, res) => {

});

/**
 * Builds a URL with query parameters
 * @param baseUrl The URL of the request, including protocol, hostname, port
 * @param queryParams The query parameters, as a map
 * @returns {string} The joined URL
 */
function buildUrl(baseUrl, queryParams) {
    const paramsString = Object.keys(queryParams)
        .map(i => `${i}=${queryParams[i]}`)
        .join('&');

    return `${baseUrl}?${paramsString}`;
}