/**
* Depends on Firefox add-on and executables from {@link https://github.com/brettz9/webappfind}
* @author Brett Zamir
* @license MIT
* @todo See WebAppFind Readme for SVG-related todos
*/

export default {
  name: 'webappfind',
  async init ({importLocale}) {
    const strings = await importLocale();
    const svgEditor = this;
    const saveMessage = 'save',
      readMessage = 'read',
      excludedMessages = [readMessage, saveMessage];

    let pathID;
    this.canvas.bind(
      'message',
      /**
      * @param {external:Window} win
      * @param {module:svgcanvas.SvgCanvas#event:message} data
      * @listens module:svgcanvas.SvgCanvas#event:message
      * @throws {Error} Unexpected event type
      * @returns {undefined}
      */
      (win, {data, origin}) => {
        // console.log('data, origin', data, origin);
        let type, content;
        try {
          ({type, pathID, content} = data.webappfind); // May throw if data is not an object
          if (origin !== location.origin || // We are only interested in a message sent as though within this URL by our browser add-on
              excludedMessages.includes(type) // Avoid our post below (other messages might be possible in the future which may also need to be excluded if your subsequent code makes assumptions on the type of message this is)
          ) {
            return;
          }
        } catch (err) {
          return;
        }

        switch (type) {
        case 'view':
          // Populate the contents
          svgEditor.loadFromString(content);

          /* if ($('#tool_save_file')) {
            $('#tool_save_file').disabled = false;
          } */
          break;
        case 'save-end':
          alert(`save complete for pathID ${pathID}!`);
          break;
        default:
          throw new Error('Unexpected WebAppFind event type');
        }
      }
    );

    /*
    window.postMessage({
      webappfind: {
        type: readMessage
      }
    }, window.location.origin === 'null'
      // Avoid "null" string error for `file:` protocol (even though
      //  file protocol not currently supported by Firefox)
      ? '*'
      : window.location.origin
    );
    */
    const buttons = [{
      id: 'webappfind_save', //
      icon: svgEditor.curConfig.extIconsPath + 'webappfind.png',
      type: 'app_menu',
      position: 4, // Before 0-based index position 4 (after the regular "Save Image (S)")
      events: {
        click () {
          if (!pathID) { // Not ready yet as haven't received first payload
            return;
          }
          window.postMessage({
            webappfind: {
              type: saveMessage,
              pathID,
              content: svgEditor.canvas.getSvgString()
            }
          }, window.location.origin === 'null'
            // Avoid "null" string error for `file:` protocol (even
            //  though file protocol not currently supported by add-on)
            ? '*'
            : window.location.origin
          );
        }
      }
    }];

    return {
      name: strings.name,
      svgicons: svgEditor.curConfig.extIconsPath + 'webappfind-icon.svg',
      buttons: strings.buttons.map((button, i) => {
        return Object.assign(buttons[i], button);
      })
    };
  }
};
