/**
 * @file ext-closepath.js
 *
 * @license MIT
 *
 * @copyright 2010 Jeff Schiller
 *
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

// This extension adds a simple button to the contextual panel for paths
// The button toggles whether the path is open or closed
export default {
  name: 'closepath',
  async init ({ _importLocale }) {
    const svgEditor = this;
    const { svgCanvas } = svgEditor;
    const { $id } = svgCanvas;
    const strings = await loadExtensionTranslation(svgEditor.configObj.pref('lang'));
    let selElems;
    const updateButton = function (path) {
      const seglist = path.pathSegList;
      const closed = seglist.getItem(seglist.numberOfItems - 1).pathSegType === 1;
      const showbutton = closed ? 'tool_openpath' : 'tool_closepath';
      const hidebutton = closed ? 'tool_closepath' : 'tool_openpath';
      $id(hidebutton).style.display = 'none';
      $id(showbutton).style.display = 'block';
    };
    const showPanel = function (on) {
      $id('closepath_panel').style.display = (on) ? 'block' : 'none';
      if (on) {
        const path = selElems[0];
        if (path) { updateButton(path); }
      }
    };
    const toggleClosed = function () {
      const path = selElems[0];
      if (path) {
        const seglist = path.pathSegList;
        const last = seglist.numberOfItems - 1;
        // is closed
        if (seglist.getItem(last).pathSegType === 1) {
          seglist.removeItem(last);
        } else {
          seglist.appendItem(path.createSVGPathSegClosePath());
        }
        updateButton(path);
      }
    };

    const buttons = [
      {
        id: 'tool_openpath',
        icon: 'openpath.png',
        type: 'context',
        panel: 'closepath_panel',
        events: {
          click () {
            toggleClosed();
          }
        }
      },
      {
        id: 'tool_closepath',
        icon: 'closepath.png',
        type: 'context',
        panel: 'closepath_panel',
        events: {
          click () {
            toggleClosed();
          }
        }
      }
    ];

    return {
      name: strings.name,
      svgicons: 'closepath_icons.svg',
      buttons: strings.buttons.map((button, i) => {
        return Object.assign(buttons[i], button);
      }),
      callback () {
        $id("closepath_panel").style.display = 'none';
      },
      selectedChanged (opts) {
        selElems = opts.elems;
        let i = selElems.length;
        while (i--) {
          const elem = selElems[i];
          if (elem && elem.tagName === 'path') {
            if (opts.selectedElement && !opts.multiselected) {
              showPanel(true);
            } else {
              showPanel(false);
            }
          } else {
            showPanel(false);
          }
        }
      }
    };
  }
};
