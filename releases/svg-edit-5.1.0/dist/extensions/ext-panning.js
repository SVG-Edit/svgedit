var svgEditorExtension_panning = (function () {
  'use strict';

  /**
   * ext-panning.js
   *
   * @license MIT
   *
   * @copyright 2013 Luis Aguirre
   *
   */

  /*
    This is a very basic SVG-Edit extension to let tablet/mobile devices pan without problem
  */
  var extPanning = {
    name: 'panning',
    init: function init(_ref) {
      var importLocale, strings, svgEditor, svgCanvas, buttons;
      return regeneratorRuntime.async(function init$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              importLocale = _ref.importLocale;
              _context.next = 3;
              return regeneratorRuntime.awrap(importLocale());

            case 3:
              strings = _context.sent;
              svgEditor = this;
              svgCanvas = svgEditor.canvas;
              buttons = [{
                id: 'ext-panning',
                icon: svgEditor.curConfig.extIconsPath + 'panning.png',
                type: 'mode',
                events: {
                  click: function click() {
                    svgCanvas.setMode('ext-panning');
                  }
                }
              }];
              return _context.abrupt("return", {
                name: strings.name,
                svgicons: svgEditor.curConfig.extIconsPath + 'ext-panning.xml',
                buttons: strings.buttons.map(function (button, i) {
                  return Object.assign(buttons[i], button);
                }),
                mouseDown: function mouseDown() {
                  if (svgCanvas.getMode() === 'ext-panning') {
                    svgEditor.setPanning(true);
                    return {
                      started: true
                    };
                  }

                  return undefined;
                },
                mouseUp: function mouseUp() {
                  if (svgCanvas.getMode() === 'ext-panning') {
                    svgEditor.setPanning(false);
                    return {
                      keep: false,
                      element: null
                    };
                  }

                  return undefined;
                }
              });

            case 8:
            case "end":
              return _context.stop();
          }
        }
      }, null, this);
    }
  };

  return extPanning;

}());
