(function () {
  'use strict';

  /*
   * ext-panning.js
   *
   * Licensed under the MIT License
   *
   * Copyright(c) 2013 Luis Aguirre
   *
   */

  /*
    This is a very basic SVG-Edit extension to let tablet/mobile devices panning without problem
  */

  svgEditor.addExtension('ext-panning', function () {
    var svgCanvas = svgEditor.canvas;
    return {
      name: 'Extension Panning',
      svgicons: svgEditor.curConfig.extIconsPath + 'ext-panning.xml',
      buttons: [{
        id: 'ext-panning',
        type: 'mode',
        title: 'Panning',
        events: {
          click: function click() {
            svgCanvas.setMode('ext-panning');
          }
        }
      }],
      mouseDown: function mouseDown() {
        if (svgCanvas.getMode() === 'ext-panning') {
          svgEditor.setPanning(true);
          return { started: true };
        }
      },
      mouseUp: function mouseUp() {
        if (svgCanvas.getMode() === 'ext-panning') {
          svgEditor.setPanning(false);
          return {
            keep: false,
            element: null
          };
        }
      }
    };
  });

}());
