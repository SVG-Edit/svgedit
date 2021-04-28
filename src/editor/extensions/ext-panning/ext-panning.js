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
  async init({
    importLocale
  }) {
    const svgEditor = this;
    const strings = await loadExtensionTranslation(svgEditor.configObj.pref('lang'));
    const {
      svgCanvas
    } = svgEditor;
    const {
      $id
    } = svgCanvas;
    const insertAfter = (referenceNode, newNode) => {
      referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    }
    return {
      newUI: true,
      name: strings.name,
      callback() {
        // Add the button and its handler(s)
        const buttonTemplate = document.createElement("template");
        buttonTemplate.innerHTML = `
        <se-button id="ext-panning" title="Panning" src="./images/panning.svg"></se-button>
        `;
        insertAfter($id('tool_zoom'), buttonTemplate.content.cloneNode(true));
        $id('ext-panning').addEventListener("click", () => {
          svgCanvas.setMode('ext-panning');
        });
      },
      mouseDown() {
        if (svgCanvas.getMode() === 'ext-panning') {
          svgEditor.setPanning(true);
          return {
            started: true
          };
        }
        return undefined;
      },
      mouseUp() {
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
