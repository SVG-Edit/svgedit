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

const name = "panning";

const loadExtensionTranslation = async function (svgEditor) {
  let translationModule;
  const lang = svgEditor.configObj.pref('lang');
  try {
    // eslint-disable-next-line no-unsanitized/method
    translationModule = await import(`./locale/${lang}.js`);
  } catch (_error) {
    // eslint-disable-next-line no-console
    console.warn(`Missing translation (${lang}) for ${name} - using 'en'`);
    // eslint-disable-next-line no-unsanitized/method
    translationModule = await import(`./locale/en.js`);
  }
  svgEditor.i18next.addResourceBundle(lang, name, translationModule.default);
};

export default {
  name,
  async init() {
    const svgEditor = this;
    await loadExtensionTranslation(svgEditor);
    const {
      svgCanvas
    } = svgEditor;
    const {
      $id
    } = svgCanvas;
    const insertAfter = (referenceNode, newNode) => {
      referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    };
    return {
      newUI: true,
      name: svgEditor.i18next.t(`${name}:name`),
      callback() {
        const btitle = svgEditor.i18next.t(`${name}:buttons.0.title`);
        // Add the button and its handler(s)
        const buttonTemplate = document.createElement("template");
        // eslint-disable-next-line no-unsanitized/property
        buttonTemplate.innerHTML = `
        <se-button id="ext-panning" title="${btitle}" src="./images/panning.svg"></se-button>
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
