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
export default {
  name: 'panning',
  async init ({importLocale}) {
    const strings = await importLocale();
    const svgEditor = this;
    const svgCanvas = svgEditor.canvas;
    const buttons = [{
      id: 'ext-panning',
      icon: svgEditor.curConfig.extIconsPath + 'panning.png',
      type: 'mode',
      events: {
        click () {
          svgCanvas.setMode('ext-panning');
        }
      }
    }];
    return {
      name: strings.name,
      svgicons: svgEditor.curConfig.extIconsPath + 'ext-panning.xml',
      buttons: strings.buttons.map((button, i) => {
        return Object.assign(buttons[i], button);
      }),
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
