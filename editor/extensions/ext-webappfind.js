/* globals svgEditor */
/*
Depends on Firefox add-on and executables from https://github.com/brettz9/webappfind

Todos:
1. See WebAppFind Readme for SVG-related todos
*/
(function () {
const saveMessage = 'webapp-save',
  readMessage = 'webapp-read',
  excludedMessages = [readMessage, saveMessage];
let pathID;

// Todo: Update to new API once released
window.addEventListener('message', function (e) {
  if (e.origin !== window.location.origin || // PRIVACY AND SECURITY! (for viewing and saving, respectively)
    (!Array.isArray(e.data) || excludedMessages.includes(e.data[0])) // Validate format and avoid our post below
  ) {
    return;
  }
  const messageType = e.data[0];
  let svgString;
  switch (messageType) {
  case 'webapp-view':
    // Populate the contents
    pathID = e.data[1];

    svgString = e.data[2];
    svgEditor.loadFromString(svgString);

    /* if ($('#tool_save_file')) {
      $('#tool_save_file').disabled = false;
    } */
    break;
  case 'webapp-save-end':
    alert('save complete for pathID ' + e.data[1] + '!');
    break;
  default:
    throw new Error('Unexpected mode');
  }
}, false);

window.postMessage([readMessage], window.location.origin !== 'null' ? window.location.origin : '*'); // Avoid "null" string error for file: protocol (even though file protocol not currently supported by add-on)

svgEditor.addExtension('WebAppFind', function () {
  return {
    name: 'WebAppFind',
    svgicons: svgEditor.curConfig.extPath + 'webappfind-icon.svg',
    buttons: [{
      id: 'webappfind_save', //
      type: 'app_menu',
      title: 'Save Image back to Disk',
      position: 4, // Before 0-based index position 4 (after the regular "Save Image (S)")
      events: {
        click () {
          if (!pathID) { // Not ready yet as haven't received first payload
            return;
          }
          window.postMessage([saveMessage, pathID, svgEditor.canvas.getSvgString()], window.location.origin);
        }
      }
    }]
  };
});
}());
