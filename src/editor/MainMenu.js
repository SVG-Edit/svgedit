/* globals seConfirm, seAlert */
import SvgCanvas from "../svgcanvas/svgcanvas.js";
import { convertUnit, isValidUnit } from '../common/units.js';
import { isChrome } from '../common/browser.js';

const { $id } = SvgCanvas;
const homePage = 'https://github.com/SVG-Edit/svgedit';

/**
 *
 */
class MainMenu {
  /**
   * @param {PlainObject} editor svgedit handler
   */
  constructor(editor) {
    this.editor = editor;
    /**
     * @type {Integer}
     */
    this.exportWindowCt = 0;
  }

  /**
   * @fires module:svgcanvas.SvgCanvas#event:ext_onNewDocument
   * @returns {void}
   */
  async clickClear() {
    const [ x, y ] = this.editor.configObj.curConfig.dimensions;
    const ok = await seConfirm(this.editor.i18next.t('notification.QwantToClear'));
    if (ok === "Cancel") {
      return;
    }
    this.editor.leftPanel.clickSelect();
    this.editor.svgCanvas.clear();
    this.editor.svgCanvas.setResolution(x, y);
    this.editor.updateCanvas(true);
    this.editor.zoomImage();
    this.editor.layersPanel.populateLayers();
    this.editor.topPanel.updateContextPanel();
    this.editor.svgCanvas.runExtensions("onNewDocument");
  }
  /**
   *
   * @returns {void}
   */
  hideDocProperties() {
    const $imgDialog = document.getElementById("se-img-prop");
    $imgDialog.setAttribute("dialog", "close");
    $imgDialog.setAttribute("save", this.editor.configObj.pref("img_save"));
    this.editor.docprops = false;
  }

  /**
   *
   * @returns {void}
   */
  hidePreferences() {
    const $editDialog = document.getElementById("se-edit-prefs");
    $editDialog.setAttribute("dialog", "close");
    this.editor.configObj.preferences = false;
  }

  /**
   * @param {Event} e
   * @returns {boolean} Whether there were problems saving the document properties
   */
  saveDocProperties(e) {
    // set title
    const { title, w, h, save } = e.detail;
    // set document title
    this.editor.svgCanvas.setDocumentTitle(title);

    if (w !== "fit" && !isValidUnit("width", w)) {
      seAlert(this.editor.i18next.t('notification.invalidAttrValGiven'));
      return false;
    }
    if (h !== "fit" && !isValidUnit("height", h)) {
      seAlert(this.editor.i18next.t('notification.invalidAttrValGiven'));
      return false;
    }
    if (!this.editor.svgCanvas.setResolution(w, h)) {
      seAlert(this.editor.i18next.t('notification.noContentToFitTo'));
      return false;
    }
    // Set image save option
    this.editor.configObj.pref("img_save", save);
    this.editor.updateCanvas();
    this.hideDocProperties();
    return true;
  }
  /**
   * Save user preferences based on current values in the UI.
   * @param {Event} e
   * @function module:SVGthis.savePreferences
   * @returns {Promise<void>}
   */
  async savePreferences(e) {
    const {
      lang,
      bgcolor,
      bgurl,
      gridsnappingon,
      gridsnappingstep,
      gridcolor,
      showrulers,
      baseunit
    } = e.detail;
    // Set background
    this.editor.setBackground(bgcolor, bgurl);

    // set language
    if (lang && lang !== this.editor.configObj.pref("lang")) {
      this.editor.configObj.pref("lang", lang);
      seAlert('Changing the language needs reload');
    }

    // set grid setting
    this.editor.configObj.curConfig.gridSnapping = gridsnappingon;
    this.editor.configObj.curConfig.snappingStep = gridsnappingstep;
    this.editor.configObj.curConfig.gridColor = gridcolor;
    this.editor.configObj.curConfig.showRulers = showrulers;
    $id('rulers').style.display = (this.editor.configObj.curConfig.showRulers) ? 'block' : 'none';
    if (this.editor.configObj.curConfig.showRulers) {
      this.editor.rulers.updateRulers();
    }
    this.editor.configObj.curConfig.baseUnit = baseunit;
    this.editor.svgCanvas.setConfig(this.editor.configObj.curConfig);
    this.editor.updateCanvas();
    this.hidePreferences();
  }

  /**
   *
   * @returns {void}
   */
  clickSave() {
    // In the future, more options can be provided here
    const saveOpts = {
      images: this.editor.configObj.pref("img_save"),
      round_digits: 6
    };
    this.editor.svgCanvas.save(saveOpts);
  }

  /**
   *
   * @param e
   * @returns {Promise<void>} Resolves to `undefined`
   */
  async clickExport(e) {
    if (e?.detail?.trigger !== "ok" || e?.detail?.imgType === undefined) {
      return;
    }
    const imgType = e?.detail?.imgType;
    const quality = e?.detail?.quality ? e?.detail?.quality / 100 : 1;
    // Open placeholder window (prevents popup)
    let exportWindowName;

    /**
     *
     * @returns {void}
     */
    const openExportWindow = () => {
      const loadingImage  = this.editor.i18next.t('notification.loadingImage');
      if (this.editor.configObj.curConfig.exportWindowType === "new") {
        this.editor.exportWindowCt++;
      }
      this.editor.exportWindowName =
        this.editor.configObj.curConfig.canvasName + this.editor.exportWindowCt;
      let popHTML; let popURL;
      if (this.editor.loadingURL) {
        popURL = this.editor.loadingURL;
      } else {
        popHTML = `<!DOCTYPE html><html>
          <head>
            <meta charset="utf-8">
            <title>${loadingImage}</title>
          </head>
          <body><h1>${loadingImage}</h1></body>
        <html>`;
        if (typeof URL !== "undefined" && URL.createObjectURL) {
          const blob = new Blob([ popHTML ], { type: "text/html" });
          popURL = URL.createObjectURL(blob);
        } else {
          popURL = "data:text/html;base64;charset=utf-8," + popHTML;
        }
        this.editor.loadingURL = popURL;
      }
      this.editor.exportWindow = window.open(
        popURL,
        this.editor.exportWindowName
      );
    };
    const chrome = isChrome();
    if (imgType === "PDF") {
      if (!this.editor.customExportPDF && !chrome) {
        openExportWindow();
      }
      this.editor.svgCanvas.exportPDF(exportWindowName);
    } else {
      if (!this.editor.customExportImage) {
        openExportWindow();
      }
      /* const results = */ await this.editor.svgCanvas.rasterExport(
        imgType,
        quality,
        this.editor.exportWindowName
      );
    }
  }

  /**
   * By default,  this.editor.svgCanvas.open() is a no-op. It is up to an extension
   *  mechanism (opera widget, etc.) to call `setCustomHandlers()` which
   *  will make it do something.
   * @returns {void}
   */
  clickOpen() {
    this.editor.svgCanvas.open();
  }

  /**
   *
   * @returns {void}
   */
  // eslint-disable-next-line class-methods-use-this
  clickImport() {
    /* empty fn */
  }

  /**
   *
   * @returns {void}
   */
  showDocProperties() {
    if (this.editor.docprops) {
      return;
    }
    this.editor.docprops = true;
    const $imgDialog = document.getElementById("se-img-prop");

    // update resolution option with actual resolution
    const resolution = this.editor.svgCanvas.getResolution();
    if (this.editor.configObj.curConfig.baseUnit !== "px") {
      resolution.w =
        convertUnit(resolution.w) + this.editor.configObj.curConfig.baseUnit;
      resolution.h =
        convertUnit(resolution.h) + this.editor.configObj.curConfig.baseUnit;
    }
    $imgDialog.setAttribute("save", this.editor.configObj.pref("img_save"));
    $imgDialog.setAttribute("width", resolution.w);
    $imgDialog.setAttribute("height", resolution.h);
    $imgDialog.setAttribute("title", this.editor.svgCanvas.getDocumentTitle());
    $imgDialog.setAttribute("dialog", "open");
  }

  /**
   *
   * @returns {void}
   */
  showPreferences() {
    if (this.editor.configObj.preferences) {
      return;
    }
    this.editor.configObj.preferences = true;
    const $editDialog = document.getElementById("se-edit-prefs");
    // Update background color with current one
    const canvasBg = this.editor.configObj.curPrefs.bkgd_color;
    const url = this.editor.configObj.pref("bkgd_url");
    if (url) {
      $editDialog.setAttribute("bgurl", url);
    }
    $editDialog.setAttribute(
      "gridsnappingon",
      this.editor.configObj.curConfig.gridSnapping
    );
    $editDialog.setAttribute(
      "gridsnappingstep",
      this.editor.configObj.curConfig.snappingStep
    );
    $editDialog.setAttribute(
      "gridcolor",
      this.editor.configObj.curConfig.gridColor
    );
    $editDialog.setAttribute("canvasbg", canvasBg);
    $editDialog.setAttribute("dialog", "open");
  }

  /**
   *
   * @returns {void}
   */
  // eslint-disable-next-line class-methods-use-this
  openHomePage() {
    window.open(homePage, "_blank");
  }

  /**
   * @type {module}
   */
  init() {
    // add Top panel
    const template = document.createElement("template");
    const { i18next } = this.editor;
    // eslint-disable-next-line no-unsanitized/property
    template.innerHTML = `
    <se-menu id="main_button" label="SVG-Edit" src="./images/logo.svg" alt="logo">
        <!-- File-like buttons: New, Save, Source -->
        <se-menu-item id="tool_clear" label="${i18next.t('tools.new_doc')}" shortcut="N" src="./images/new.svg">
        </se-menu-item>
        <se-menu-item id="tool_open" label="${i18next.t('tools.open_doc')}" src="./images/open.svg">
        </se-menu-item>
        <se-menu-item id="tool_save" label="${i18next.t('tools.save_doc')}" shortcut="S" src="./images/saveImg.svg">
        </se-menu-item>
        <se-menu-item id="tool_import" label="${i18next.t('tools.import_doc')}" src="./images/importImg.svg"></se-menu-item>
        <se-menu-item id="tool_export" label="${i18next.t('tools.export_img')}" src="./images/export.svg"></se-menu-item>
        <se-menu-item id="tool_docprops" label="${i18next.t('tools.docprops')}" shortcut="D" src="./images/docprop.svg">
        </se-menu-item>
        <se-menu-item id="tool_editor_prefs" label="${i18next.t('config.editor_prefs')}" src="./images/editPref.svg">
        </se-menu-item>
        <se-menu-item id="tool_editor_homepage" label="${i18next.t('tools.editor_homepage')}" src="./images/logo.svg">
        </se-menu-item>
    </se-menu>
       `;
    this.editor.$svgEditor.append(template.content.cloneNode(true));

    // register action to main menu entries
    /**
     * Associate all button actions as well as non-button keyboard shortcuts.
     */

    $id("tool_clear").addEventListener("click", this.clickClear.bind(this));
    $id("tool_open").addEventListener("click", (e) => {
      e.preventDefault();
      this.clickOpen();
      window.dispatchEvent(new CustomEvent("openImage"));
    });
    $id("tool_import").addEventListener("click", () => {
      this.clickImport();
      window.dispatchEvent(new CustomEvent("importImages"));
    });
    $id("tool_save").addEventListener(
      "click",
      function() {
        const $editorDialog = document.getElementById("se-svg-editor-dialog");
        const editingsource = $editorDialog.getAttribute("dialog") === "open";
        if (editingsource) {
          this.saveSourceEditor();
        } else {
          this.clickSave();
        }
      }.bind(this)
    );
    // this.clickExport.bind(this)
    $id("tool_export").addEventListener("click", function() {
      document
        .getElementById("se-export-dialog")
        .setAttribute("dialog", "open");
    });
    $id("se-export-dialog").addEventListener(
      "change",
      this.clickExport.bind(this)
    );
    $id("tool_docprops").addEventListener(
      "click",
      this.showDocProperties.bind(this)
    );
    $id("tool_editor_prefs").addEventListener(
      "click",
      this.showPreferences.bind(this)
    );
    $id("tool_editor_homepage").addEventListener(
      "click",
      this.openHomePage.bind(this)
    );
    $id("se-img-prop").addEventListener(
      "change",
      function(e) {
        if (e.detail.dialog === "closed") {
          this.hideDocProperties();
        } else {
          this.saveDocProperties(e);
        }
      }.bind(this)
    );
    $id("se-edit-prefs").addEventListener(
      "change",
      function(e) {
        if (e.detail.dialog === "closed") {
          this.hidePreferences();
        } else {
          this.savePreferences(e);
        }
      }.bind(this)
    );
  }
}

export default MainMenu;
