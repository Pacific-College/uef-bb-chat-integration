// Verify that we're in the integration iframe
if (!window.parent) {
  throw new Error('Not within iframe');
}

const integrationHost = `${window.location.protocol}//${window.location.hostname}:${window.location.port}`;
const shouldShowPanel = true;

let messageChannel;
let panelId;

// Set up the window.postMessage listener for the integration handshake (for step #2)
window.addEventListener("message", onPostMessageReceived, false);

// (1) Send the integration handshake message to Learn Ultra. This notifies Learn Ultra that the integration has
// loaded and is ready to communicate.
window.parent.postMessage({"type": "integration:hello"}, `${window.__lmsHost}/*`);

function onPostMessageReceived(evt) {
  // Do some basic message validation.
  const fromTrustedHost = evt.origin === window.__lmsHost || evt.origin === integrationHost;
  if (!fromTrustedHost || !evt.data || !evt.data.type) {
    return;
  }

  // (2) A majority of the communication between the integration and Learn Ultra will be over a "secure" MessageChannel.
  // As response to the integration handshake, Learn Ultra will send a MessageChannel port to the integration.
  if (evt.data.type === 'integration:hello') {
    // Store the MessageChannel port for future use
    messageChannel = new LoggedMessageChannel(evt.ports[0]);
    messageChannel.onmessage = onMessageFromUltra;

    // (3) Now, we need to authorize with Learn Ultra using the OAuth2 token that the server negotiated for us
    messageChannel.postMessage({
      type: 'authorization:authorize',

      // This token is passed in through integration.ejs
      token: window.__token,
    });
  }
}

function onMessageFromUltra(message) {
  // (4) If our authorization token was valid, Learn Ultra will send us a response, notifying us that the authorization
  // was successful
  if (message.data.type === 'authorization:authorize') {
    onAuthorizedWithUltra();
  }

  // (6) On click, route, and hover messages, we will receive an event:event event
  if (message.data.type === 'event:event') {
    // From here, you can do something with those events...
  }

  // (8) Once Ultra has opened the panel, it will notify us that we can render into the panel
  if (message.data.type === 'portal:panel:response') {
    renderPanelContents(message);
  }
}

function onAuthorizedWithUltra() {
  console.log('Authorization was successful');

  // (5) Once we are authorized, we can subscribe to events, such as telemetry events
  messageChannel.postMessage({
    type: 'event:subscribe',
    subscriptions: ['click', 'route'],
  });

  if (shouldShowPanel) {
    setTimeout(() => {
      // (7) For demo purposes, we will open a panel. We send a message to Ultra requesting a panel be
      // opened (if shouldShowPanel is enabled)
      messageChannel.postMessage({
        type: 'portal:panel',
        correlationId: 'panel-1',
        panelType: 'small',
        panelTitle: 'Demo Integration',
        attributes: {
          onClose: {
            callbackId: 'panel-1-close',
          },
        },
      });
    }, 2000);
  }
}

function renderPanelContents(message) {
  // (9) Notify Ultra to render our contents into the panel
  if (message.data.correlationId === 'panel-1') {
    panelId = message.data.portalId;
    messageChannel.postMessage({
      type: 'portal:render',
      portalId: message.data.portalId,
      contents: {
        tag: 'span',
        props: {
          style: {
            display: 'flex',
            height: '100%',
            width: '100%',
            flexDirection: 'column',
            alignItems: 'stretch',
            justifyContent: 'stretch',
          },
        },
        children: [{
          tag: 'iframe',
          props: {
            style: {flex: '1 1 auto'},
            src: `${integrationHost}/iframe-panel`,
          },
        }]
      },
    });
  }
}

// Sets up a way to communicate between the iframe and the integration script
window.addEventListener('storage', onEventFromIframe);
function onEventFromIframe(evt) {
  if (evt.key !== 'event') {
    return;
  }

  const message = JSON.parse(evt.newValue);
  switch (message.type) {
    // Handles when the user clicks the "close panel" button
    case 'demo:closePanel':
      messageChannel.postMessage({
        type: 'portal:panel:close',
        id: panelId,
      });
      break;
  }
}

/**
 * A MessageChannel-compatible API, but with console logging.
 */
class LoggedMessageChannel {
  onmessage = () => { /* */
  };

  constructor(messageChannel) {
    this.messageChannel = messageChannel;
    this.messageChannel.onmessage = this.onMessage;
  }

  onMessage = (evt) => {
    console.log(`[UEF] From Learn Ultra:`, evt.data);
    this.onmessage(evt);
  };

  postMessage = (msg) => {
    console.log(`[UEF] To Learn Ultra`, msg);
    this.messageChannel.postMessage(msg);
  }
}