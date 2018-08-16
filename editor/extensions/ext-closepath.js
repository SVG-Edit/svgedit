/* globals jQuery */
/**
 * ext-closepath.js
 *
 * @license MIT
 *
 * @copyright 2010 Jeff Schiller
 *
 */
import '../svgpathseg.js';

// This extension adds a simple button to the contextual panel for paths
// The button toggles whether the path is open or closed
export default {
  name: 'closepath',
  async init ({importLocale}) {
    const strings = await importLocale();
    const $ = jQuery;
    const svgEditor = this;
    let selElems;
    const updateButton = function (path) {
      const seglist = path.pathSegList,
        closed = seglist.getItem(seglist.numberOfItems - 1).pathSegType === 1,
        showbutton = closed ? '#tool_openpath' : '#tool_closepath',
        hidebutton = closed ? '#tool_closepath' : '#tool_openpath';
      $(hidebutton).hide();
      $(showbutton).show();
    };
    const showPanel = function (on) {
      $('#closepath_panel').toggle(on);
      if (on) {
        const path = selElems[0];
        if (path) { updateButton(path); }
      }
    };
    const toggleClosed = function () {
      const path = selElems[0];
      if (path) {
        const seglist = path.pathSegList,
          last = seglist.numberOfItems - 1;
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
        icon: svgEditor.curConfig.extIconsPath + 'openpath.png',
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
        icon: svgEditor.curConfig.extIconsPath + 'closepath.png',
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
      svgicons: svgEditor.curConfig.extIconsPath + 'closepath_icons.svg',
      buttons: strings.buttons.map((button, i) => {
        return Object.assign(buttons[i], button);
      }),
      callback () {
        $('#closepath_panel').hide();
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
