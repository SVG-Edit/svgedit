/**
 * @file ext-panning.js
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
    const svgEditor = this;
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    const {default: strings} = await import(`./locale/${svgEditor.curPrefs.lang}.js`);
    const svgCanvas = svgEditor.canvas;
    const buttons = [{
      id: 'ext-panning',
      icon: 'panning.png',
      type: 'mode',
      events: {
        click () {
          svgCanvas.setMode('ext-panning');
        }
      }
    }];
    return {
      name: strings.name,
      svgicons: 'ext-panning.xml',
      buttons: strings.buttons.map((button, i) => {
        return Object.assign(buttons[i], button);
      }),
      mouseDown () {
        if (svgCanvas.getMode() === 'ext-panning') {
          svgEditor.setPanning(true);
          return {started: true};
        }
        return undefined;
      },
      mouseUp () {
        if (svgCanvas.getMode() === 'ext-panning') {
          svgEditor.setPanning(false);
          return {
            keep: false,
            element: null
          };
        }
        return undefined;
      }
    };
  }
};
