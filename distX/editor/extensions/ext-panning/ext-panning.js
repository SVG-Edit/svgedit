function __variableDynamicImportRuntime0__(path) {
  switch (path) {
    case './locale/en.js':
      return Promise.resolve().then(function () { return en$1; });
    case './locale/sv.js':
      return Promise.resolve().then(function () { return sv$1; });
    case './locale/tr.js':
      return Promise.resolve().then(function () { return tr$1; });
    case './locale/uk.js':
      return Promise.resolve().then(function () { return uk$1; });
    case './locale/zh-CN.js':
      return Promise.resolve().then(function () { return zhCN$1; });
    default:
      return new Promise(function (resolve, reject) {
        (typeof queueMicrotask === 'function' ? queueMicrotask : setTimeout)(reject.bind(null, new Error("Unknown variable dynamic import: " + path)));
      });
  }
}

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

const name = 'panning';
const loadExtensionTranslation = async function (svgEditor) {
  let translationModule;
  const lang = svgEditor.configObj.pref('lang');
  try {
    translationModule = await __variableDynamicImportRuntime0__(`./locale/${lang}.js`);
  } catch (_error) {
    console.warn(`Missing translation (${lang}) for ${name} - using 'en'`);
    translationModule = await Promise.resolve().then(function () { return en$1; });
  }
  svgEditor.i18next.addResourceBundle(lang, name, translationModule.default);
};
var extPanning = {
  name,
  async init() {
    const svgEditor = this;
    await loadExtensionTranslation(svgEditor);
    const {
      svgCanvas
    } = svgEditor;
    const {
      $id,
      $click
    } = svgCanvas;
    const insertAfter = (referenceNode, newNode) => {
      referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    };
    return {
      name: svgEditor.i18next.t(`${name}:name`),
      callback() {
        const btitle = `${name} [Space / mouse wheel + drag]`;
        // Add the button and its handler(s)
        const buttonTemplate = document.createElement('template');
        buttonTemplate.innerHTML = `
        <se-button id="ext-panning" title="${btitle}" src="panning.svg"></se-button>
        `;
        insertAfter($id('tool_zoom'), buttonTemplate.content.cloneNode(true));
        $click($id('ext-panning'), () => {
          if (this.leftPanel.updateLeftPanel('ext-panning')) {
            svgCanvas.setMode('ext-panning');
          }
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

var en = {
  name: 'Extension Panning',
  buttons: [{
    title: 'Panning'
  }]
};

var en$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: en
});

var sv = {
  name: 'Panorering av tillägg',
  buttons: [{
    title: 'Panorering'
  }]
};

var sv$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: sv
});

var tr = {
  name: 'Kaydırma Aracı ',
  buttons: [{
    title: 'Kaydırma'
  }]
};

var tr$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: tr
});

var uk = {
  name: 'Розширення: Малювання',
  buttons: [{
    title: 'Малювання'
  }]
};

var uk$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: uk
});

var zhCN = {
  name: '移动',
  buttons: [{
    title: '移动'
  }]
};

var zhCN$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: zhCN
});

export { extPanning as default };
//# sourceMappingURL=ext-panning.js.map
