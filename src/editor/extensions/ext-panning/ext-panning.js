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

const loadExtensionTranslation = async function (lang) {
  let translationModule;
  try {
    translationModule = await import(`./locale/${encodeURIComponent(lang)}.js`);
  } catch (_error) {
    // eslint-disable-next-line no-console
    console.error(`Missing translation (${lang}) - using 'en'`);
    translationModule = await import(`./locale/en.js`);
  }
  return translationModule.default;
};

export default {
  name: 'panning',
  async init ({importLocale}) {
    const svgEditor = this;
    const strings = await loadExtensionTranslation(svgEditor.curPrefs.lang);
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
