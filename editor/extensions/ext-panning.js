/*
 * ext-panning.js
 *
 * Licensed under the MIT License
 *
 * Copyright(c) 2013 Luis Aguirre
 *
 */

/*
  This is a very basic SVG-Edit extension to let tablet/mobile devices pan without problem
*/

export default {
  name: 'ext-panning',
  init () {
    const svgEditor = this;
    const svgCanvas = svgEditor.canvas;
    return {
      name: 'Extension Panning',
      svgicons: svgEditor.curConfig.extIconsPath + 'ext-panning.xml',
      buttons: [{
        id: 'ext-panning',
        type: 'mode',
        title: 'Panning',
        events: {
          click () {
            svgCanvas.setMode('ext-panning');
          }
        }
      }],
      mouseDown () {
        if (svgCanvas.getMode() === 'ext-panning') {
          svgEditor.setPanning(true);
          return {started: true};
        }
      },
      mouseUp () {
        if (svgCanvas.getMode() === 'ext-panning') {
          svgEditor.setPanning(false);
          return {
            keep: false,
            element: null
          };
        }
      }
    };
  }
};
