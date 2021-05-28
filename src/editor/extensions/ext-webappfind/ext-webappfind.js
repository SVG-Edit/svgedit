/**
* Depends on Firefox add-on and executables from
* {@link https://github.com/brettz9/webappfind}.
* @author Brett Zamir
* @license MIT
* @todo See WebAppFind Readme for SVG-related todos
*/

const loadExtensionTranslation = async function (lang) {
  let translationModule;
  try {
    // eslint-disable-next-line no-unsanitized/method
    translationModule = await import(`./locale/${encodeURIComponent(lang)}.js`);
  } catch (_error) {
    // eslint-disable-next-line no-console
    console.error(`Missing translation (${lang}) - using 'en'`);
    translationModule = await import(`./locale/en.js`);
  }
  return translationModule.default;
};

export default {
  name: 'webappfind',
  async init () {
    const svgEditor = this;
    const strings = await loadExtensionTranslation(svgEditor.configObj.pref('lang'));
    const saveMessage = 'save';
    const readMessage = 'read';
    const excludedMessages = [ readMessage, saveMessage ];

    let pathID;
    this.canvas.bind(
      'message',
      /**
       *
       * @param {external:Window} win external Window handler
       * @param {*} param1 info
       * @returns {void}
       */
      (win, { data, origin }) => {
        let type; let content;
        try {
          ({ type, pathID, content } = data.webappfind); // May throw if data is not an object
          if (origin !== location.origin || // We are only interested in a message sent as though within this URL by our browser add-on
              // Avoid our post below (other msgs might be possible which may need to be excluded if code makes assumptions on the type of message)
              excludedMessages.includes(type)
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
          break;
        case 'save-end':
          // eslint-disable-next-line no-alert
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
    const buttons = [ {
      id: 'webappfind_save', //
      icon: 'webappfind.png',
      type: 'app_menu',
      position: 4, // Before 0-based index position 4 (after the regular "Save Image (S)")
      events: {
        click () {
          if (!pathID) { // Not ready yet as haven't received first payload
            return;
          }
          window.postMessage(
            {
              webappfind: {
                type: saveMessage,
                pathID,
                content: svgEditor.svgCanvas.getSvgString()
              }
            }, window.location.origin === 'null'
              // Avoid "null" string error for `file:` protocol (even
              //  though file protocol not currently supported by add-on)
              ? '*'
              : window.location.origin
          );
        }
      }
    } ];

    return {
      name: strings.name,
      svgicons: 'webappfind-icon.svg',
      buttons: strings.buttons.map((button, i) => {
        return Object.assign(buttons[i], button);
      })
    };
  }
};
