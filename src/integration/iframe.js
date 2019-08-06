const integrationHost = `${window.location.protocol}//${window.location.hostname}:${window.location.port}`;

document.addEventListener('DOMContentLoaded', () => {
  document.getElementsByClassName('close-button').item(0).addEventListener('click', () => {
    // This notifies the integration script (see step #10) that the close button was clicked
    window.localStorage.setItem('event', JSON.stringify({
      type: 'demo:close',

      // Add a timestamp to always force the value to change; otherwise, if the storage value doesn't change, we don't
      // get the storage event.
      ts: new Date() * Math.random(),
    }));
  });
});
