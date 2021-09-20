/* globals seConfirm */
/**
 * @file ext-opensave.js
 *
 * @license MIT
 *
 * @copyright 2020 OptimistikSAS
 *
 */

/**
   * @type {module:svgcanvas.EventHandler}
   * @param {external:Window} wind
   * @param {module:svgcanvas.SvgCanvas#event:saved} svg The SVG source
   * @listens module:svgcanvas.SvgCanvas#event:saved
   * @returns {void}
   */
import { fileOpen, fileSave } from 'browser-fs-access';

const name = "opensave";
let handle = null;

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
  svgEditor.i18next.addResourceBundle(lang, 'translation', translationModule.default, true, true);
};

export default {
  name,
  async init(_S) {
    const svgEditor = this;
    const { svgCanvas } = svgEditor;
    const { $id } = svgCanvas;
    await loadExtensionTranslation(svgEditor);

    /**
     * @fires module:svgcanvas.SvgCanvas#event:ext_onNewDocument
     * @returns {void}
     */
    const clickClear = async function () {
      const [ x, y ] = svgEditor.configObj.curConfig.dimensions;
      const ok = await seConfirm(svgEditor.i18next.t('notification.QwantToClear'));
      if (ok === "Cancel") {
        return;
      }
      svgEditor.leftPanel.clickSelect();
      svgEditor.svgCanvas.clear();
      svgEditor.svgCanvas.setResolution(x, y);
      svgEditor.updateCanvas(true);
      svgEditor.zoomImage();
      svgEditor.layersPanel.populateLayers();
      svgEditor.topPanel.updateContextPanel();
      svgEditor.svgCanvas.runExtensions("onNewDocument");
    };

    /**
     * By default,  this.editor.svgCanvas.open() is a no-op. It is up to an extension
     *  mechanism (opera widget, etc.) to call `setCustomHandlers()` which
     *  will make it do something.
     * @returns {void}
     */
    const clickOpen = async function () {
      // ask user before clearing an unsaved SVG
      const response = await svgEditor.openPrep();
      if (response === 'Cancel') { return; }
      svgCanvas.clear();
      try {
        const blob = await fileOpen({
          mimeTypes: [ 'image/*' ]
        });
        const svgContent = await blob.text();
        await svgEditor.loadSvgString(svgContent);
        svgEditor.updateCanvas();
      } catch (err) {
        if (err.name !== 'AbortError') {
          return console.error(err);
        }
      }
    };

    const b64toBlob = (b64Data, contentType='', sliceSize=512) => {
      const byteCharacters = atob(b64Data);
      const byteArrays = [];
      for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
      const blob = new Blob(byteArrays, { type: contentType });
      return blob;
    };

    /**
     *
     * @returns {void}
     */
    const clickSave = async function (type, _) {
      const $editorDialog = $id("se-svg-editor-dialog");
      const editingsource = $editorDialog.getAttribute("dialog") === "open";
      if (editingsource) {
        svgEditor.saveSourceEditor();
      } else {
        // In the future, more options can be provided here
        const saveOpts = {
          images: svgEditor.configObj.pref("img_save"),
          round_digits: 6
        };
        // remove the selected outline before serializing
        svgCanvas.clearSelection();
        // Update save options if provided
        if (saveOpts) {
          const saveOptions = svgCanvas.mergeDeep(svgCanvas.getSvgOption(), saveOpts);
          for (const [ key, value ] of Object.entries(saveOptions)) {
            svgCanvas.setSvgOption(key, value);
          }
        }
        svgCanvas.setSvgOption('apply', true);

        // no need for doctype, see https://jwatt.org/svg/authoring/#doctype-declaration
        const svg = '<?xml version="1.0"?>\n' + svgCanvas.svgCanvasToString();
        const b64Data = svgCanvas.encode64(svg);
        const blob = b64toBlob(b64Data, 'image/svg+xml');
        try {
          if(type === "save" && handle !== null) {
            const throwIfExistingHandleNotGood = false;
            handle = await fileSave(blob, {
              fileName: 'icon.svg',
              extensions: [ '.svg' ]
            }, handle, throwIfExistingHandleNotGood);
          } else {
            handle = await fileSave(blob, {
              fileName: 'icon.svg',
              extensions: [ '.svg' ]
            });
          }
        } catch (err) {
          if (err.name !== 'AbortError') {
            return console.error(err);
          }
        }
      }
    };

    return {
      name: svgEditor.i18next.t(`${name}:name`),
      // The callback should be used to load the DOM with the appropriate UI items
      callback() {
        // eslint-disable-next-line no-unsanitized/property
        const buttonTemplate = `
        <se-menu-item id="tool_clear" label="opensave.new_doc" shortcut="N" src="new.svg"></se-menu-item>`;
        svgCanvas.insertChildAtIndex($id('main_button'), buttonTemplate, 0);
        const openButtonTemplate = `<se-menu-item id="tool_open" label="opensave.open_image_doc" src="open.svg"></se-menu-item>`;
        svgCanvas.insertChildAtIndex($id('main_button'), openButtonTemplate, 1);
        const saveButtonTemplate = `<se-menu-item id="tool_save" label="opensave.save_doc" shortcut="S" src="saveImg.svg"></se-menu-item>`;
        svgCanvas.insertChildAtIndex($id('main_button'), saveButtonTemplate, 2);
        const saveAsButtonTemplate = `<se-menu-item id="tool_save_as" label="opensave.save_as_doc" src="saveImg.svg"></se-menu-item>`;
        svgCanvas.insertChildAtIndex($id('main_button'), saveAsButtonTemplate, 3);
        // handler
        $id("tool_clear").addEventListener("click", clickClear.bind(this));
        $id("tool_open").addEventListener("click", clickOpen.bind(this));
        $id("tool_save").addEventListener("click", clickSave.bind(this, "save"));
        $id("tool_save_as").addEventListener("click", clickSave.bind(this, "saveas"));
      }
    };
  }
};
