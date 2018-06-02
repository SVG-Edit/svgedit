/* globals jQuery */
/*
 * ext-closepath.js
 *
 * Licensed under the MIT License
 *
 * Copyright(c) 2010 Jeff Schiller
 *
 */
import '../pathseg.js';

// This extension adds a simple button to the contextual panel for paths
// The button toggles whether the path is open or closed
export default {
  name: 'ClosePath',
  init () {
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

    return {
      name: 'ClosePath',
      svgicons: svgEditor.curConfig.extIconsPath + 'closepath_icons.svg',
      buttons: [{
        id: 'tool_openpath',
        type: 'context',
        panel: 'closepath_panel',
        title: 'Open path',
        events: {
          click () {
            toggleClosed();
          }
        }
      },
      {
        id: 'tool_closepath',
        type: 'context',
        panel: 'closepath_panel',
        title: 'Close path',
        events: {
          click () {
            toggleClosed();
          }
        }
      }],
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
