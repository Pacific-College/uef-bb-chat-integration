function sendToIntegration(message) {
  window.localStorage.setItem('event', JSON.stringify({
    ...message,

    // Add a timestamp to always force the value to change; otherwise, if the storage value doesn't change, we don't
    // get the storage event.
    ts: new Date() * Math.random(),
  }));
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementsByClassName('close-button').item(0).addEventListener('click', () => {
    // This notifies the integration script (see step #10) that the close button was clicked
    sendToIntegration({
      type: 'demo:closePanel'
    });
  });
});
