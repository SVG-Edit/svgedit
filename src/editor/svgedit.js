/* globals jQuery seConfirm seAlert seSelect */
/**
* The main module for the visual SVG this.
*
* @license MIT
*
* @copyright 2010 Alexis Deveria
* 2010 Pavol Rusnak
* 2010 Jeff Schiller
* 2010 Narendra Sisodiya
* 2014 Brett Zamir
* 2020 OptimistikSAS
* @module SVGEditor
* @borrows module:locale.putLocale as putLocale
* @borrows module:locale.readLang as readLang
* @borrows module:locale.setStrings as setStrings
*/

import './touch.js';
import {isChrome, isGecko, isMac} from '../common/browser.js';
import {convertUnit, isValidUnit} from '../common/units.js';
import {
  hasCustomHandler, getCustomHandler, injectExtendedContextMenuItemsIntoDom
} from './contextmenu.js';

import SvgCanvas from '../svgcanvas/svgcanvas.js';
import jQueryPluginJSHotkeys from './js-hotkeys/jquery.hotkeys.min.js';
import ConfigObj from './ConfigObj.js';
import LayersPanel from './panels/LayersPanel.js';
import LeftPanelHandlers from './panels/LeftPanelHandlers.js';
import BottomPanelHandlers from './panels/BottomPanelHandlers.js';
import TopPanelHandlers from './panels/TopPanelHandlers.js';
import Rulers from './Rulers.js';

import {
  readLang, putLocale,
  setStrings
} from './locale.js';

const {$id, $qa, isNullish, encode64, decode64, blankPageObjectURL} = SvgCanvas;

// JFH hotkey is used for text input.
const $ = [jQueryPluginJSHotkeys].reduce((jq, func) => func(jq), jQuery);
const homePage = 'https://github.com/SVG-Edit/svgedit';
/**
 *
 */
class Editor {
  /**
   *
   */
  constructor () {
    /**
    * @type {Float}
    */
    this.tool_scale = 1;
    /**
    * @type {Integer}
    */
    this.exportWindowCt = 0;
    /**
    * @type {boolean}
    */
    this.langChanged = false;
    /**
    * @type {boolean}
    */
    this.showSaveWarning = false;
    /**
     * Will be set to a boolean by `ext-storage.js`
     * @type {"ignore"|"waiting"|"closed"}
    */
    this.storagePromptState = 'ignore';
    /*
    * EDITOR PUBLIC METHODS
    */
    this.putLocale = putLocale;
    this.readLang = readLang;
    this.setStrings = setStrings;
    /**
      * LOCALE.
      * @name module:SVGthis.uiStrings
      * @type {PlainObject}
      */
    this.uiStrings = {};
    this.svgCanvas = null;
    this.isReady = false;
    this.customExportImage = false;
    this.customExportPDF = false;
    this.configObj = new ConfigObj(this);
    this.pref = this.configObj.pref.bind(this.configObj);
    this.setConfig = this.configObj.setConfig.bind(this.configObj);
    this.callbacks = [];
    this.curContext = null;
    this.exportWindowName = null;
    this.docprops = false;
    this.preferences = false;
    this.canvMenu = null;
    // eslint-disable-next-line max-len
    this.goodLangs = ['ar', 'cs', 'de', 'en', 'es', 'fa', 'fr', 'fy', 'hi', 'it', 'ja', 'nl', 'pl', 'pt-BR', 'ro', 'ru', 'sk', 'sl', 'zh-CN', 'zh-TW'];
    const modKey = (isMac() ? 'meta+' : 'ctrl+');
    this.toolButtons = [
      // Shortcuts not associated with buttons
      {key: 'ctrl+left', fn () { this.rotateSelected(0, 1); }},
      {key: 'ctrl+right', fn () { this.rotateSelected(1, 1); }},
      {key: 'ctrl+shift+left', fn () { this.rotateSelected(0, 5); }},
      {key: 'ctrl+shift+right', fn () { this.rotateSelected(1, 5); }},
      {key: 'shift+O', fn: this.selectPrev},
      {key: 'shift+P', fn: this.selectNext},
      {key: [modKey + 'up', true], fn () { this.zoomImage(2); }},
      {key: [modKey + 'down', true], fn () { this.zoomImage(0.5); }},
      {key: [modKey + ']', true], fn () { this.moveUpDownSelected('Up'); }},
      {key: [modKey + '[', true], fn () { this.moveUpDownSelected('Down'); }},
      {key: ['up', true], fn () { this.moveSelected(0, -1); }},
      {key: ['down', true], fn () { this.moveSelected(0, 1); }},
      {key: ['left', true], fn () { this.moveSelected(-1, 0); }},
      {key: ['right', true], fn () { this.moveSelected(1, 0); }},
      {key: 'shift+up', fn () { this.moveSelected(0, -10); }},
      {key: 'shift+down', fn () { this.moveSelected(0, 10); }},
      {key: 'shift+left', fn () { this.moveSelected(-10, 0); }},
      {key: 'shift+right', fn () { this.moveSelected(10, 0); }},
      {key: ['alt+up', true], fn () { this.svgCanvas.cloneSelectedElements(0, -1); }},
      {key: ['alt+down', true], fn () { this.svgCanvas.cloneSelectedElements(0, 1); }},
      {key: ['alt+left', true], fn () { this.svgCanvas.cloneSelectedElements(-1, 0); }},
      {key: ['alt+right', true], fn () { this.svgCanvas.cloneSelectedElements(1, 0); }},
      {key: ['alt+shift+up', true], fn () { this.svgCanvas.cloneSelectedElements(0, -10); }},
      {key: ['alt+shift+down', true], fn () { this.svgCanvas.cloneSelectedElements(0, 10); }},
      {key: ['alt+shift+left', true], fn () { this.svgCanvas.cloneSelectedElements(-10, 0); }},
      {key: ['alt+shift+right', true], fn () { this.svgCanvas.cloneSelectedElements(10, 0); }},
      {key: 'a', fn () { this.svgCanvas.selectAllInCurrentLayer(); }},
      {key: modKey + 'a', fn () { this.svgCanvas.selectAllInCurrentLayer(); }},
      {key: modKey + 'x', fn: this.cutSelected},
      {key: modKey + 'c', fn: this.copySelected},
      {key: modKey + 'v', fn: this.pasteInCenter}
    ];
  }
  /**
   *
   * @param {string} str SVG string
   * @param {PlainObject} [opts={}]
   * @param {boolean} [opts.noAlert]
   * @throws {Error} Upon failure to load SVG
   * @returns {void}
   */
  loadSvgString (str, {noAlert} = {}) {
    const success = this.svgCanvas.setSvgString(str) !== false;
    if (success) return;
    if (!noAlert) seAlert(this.uiStrings.notification.errorLoadingSVG);
    throw new Error('Error loading SVG');
  }

  /**
  * All methods are optional.
  * @interface module:SVGthis.CustomHandler
  * @type {PlainObject}
  */
  /**
  * Its responsibilities are:
  *  - invoke a file chooser dialog in 'open' mode
  *  - let user pick a SVG file
  *  - calls [svgCanvas.setSvgString()]{@link module:svgcanvas.SvgCanvas#setSvgString} with the string contents of that file.
  * Not passed any parameters.
  * @function module:SVGthis.CustomHandler#open
  * @returns {void}
  */
  /**
  * Its responsibilities are:
  *  - accept the string contents of the current document
  *  - invoke a file chooser dialog in 'save' mode
  *  - save the file to location chosen by the user.
  * @function module:SVGthis.CustomHandler#save
  * @param {external:Window} win
  * @param {module:svgcanvas.SvgCanvas#event:saved} svgStr A string of the SVG
  * @listens module:svgcanvas.SvgCanvas#event:saved
  * @returns {void}
  */
  /**
  * Its responsibilities (with regard to the object it is supplied in its 2nd argument) are:
  *  - inform user of any issues supplied via the "issues" property
  *  - convert the "svg" property SVG string into an image for export;
  *    utilize the properties "type" (currently 'PNG', 'JPEG', 'BMP',
  *    'WEBP', 'PDF'), "mimeType", and "quality" (for 'JPEG' and 'WEBP'
  *    types) to determine the proper output.
  * @function module:SVGthis.CustomHandler#exportImage
  * @param {external:Window} win
  * @param {module:svgcanvas.SvgCanvas#event:exported} data
  * @listens module:svgcanvas.SvgCanvas#event:exported
  * @returns {void}
  */
  /**
  * @function module:SVGthis.CustomHandler#exportPDF
  * @param {external:Window} win
  * @param {module:svgcanvas.SvgCanvas#event:exportedPDF} data
  * @listens module:svgcanvas.SvgCanvas#event:exportedPDF
  * @returns {void}
  */

  /**
  * Allows one to override default SVGEdit `open`, `save`, and
  * `export` editor behaviors.
  * @function module:SVGthis.setCustomHandlers
  * @param {module:SVGthis.CustomHandler} opts Extension mechanisms may call `setCustomHandlers` with three functions: `opts.open`, `opts.save`, and `opts.exportImage`
  * @returns {Promise<void>}
  */

  /**
   * @param {PlainObject} opts
   * @returns {Promise<PlainObject>}
   */
  setCustomHandlers (opts) {
    return this.ready(() => {
      if (opts.open) {
        $('#tool_open > input[type="file"]').remove();
        $('#tool_open').show();
        this.svgCanvas.open = opts.open;
      }
      if (opts.save) {
        this.showSaveWarning = false;
        this.svgCanvas.bind('saved', opts.save);
      }
      if (opts.exportImage) {
        this.customExportImage = opts.exportImage;
        this.svgCanvas.bind('exported', this.customExportImage); // canvg and our RGBColor will be available to the method
      }
      if (opts.exportPDF) {
        this.customExportPDF = opts.exportPDF;
        this.svgCanvas.bind('exportedPDF', this.customExportPDF); // jsPDF and our RGBColor will be available to the method
      }
    });
  }

  /**
   * @function module:SVGthis.randomizeIds
   * @param {boolean} arg
   * @returns {void}
   */
  randomizeIds (arg) {
    this.svgCanvas.randomizeIds(arg);
  }
  /** @lends module:SVGEditor~Actions */
  /**
       * @returns {void}
       */
  setAll () {
    const keyHandler = {}; // will contain the action for each pressed key

    this.toolButtons.forEach((opts) => {
      // Bind function to shortcut key
      if (opts.key) {
        // Set shortcut based on options
        let keyval = opts.key;
        let pd = false;
        if (Array.isArray(opts.key)) {
          keyval = opts.key[0];
          if (opts.key.length > 1) { pd = opts.key[1]; }
        }
        keyval = String(keyval);
        const {fn} = opts;
        keyval.split('/').forEach((key) => { keyHandler[key] = {fn, pd}; });
      }
      return true;
    });
    // register the keydown event
    document.addEventListener('keydown', (e) => {
      // only track keyboard shortcuts for the body containing the SVG-Editor
      if (e.target.nodeName !== 'BODY') return;
      // normalize key
      const key = `${(e.metaKey) ? 'meta+' : ''}${(e.ctrlKey) ? 'ctrl+' : ''}${e.key.toLowerCase()}`;
      // return if no shortcut defined for this key
      if (!keyHandler[key]) return;
      // launch associated handler and preventDefault if necessary
      keyHandler[key].fn();
      if (keyHandler[key].pd) {
        e.preventDefault();
      }
    });

    // Misc additional actions

    // Make 'return' keypress trigger the change event
    $('.attr_changer, #image_url').bind(
      'keydown',
      'return',
      function (evt) {
        $(this).change();
        evt.preventDefault();
      }
    );

    $(window).bind('keydown', 'tab', function (e) {
      if (this.uiContext === 'canvas') {
        e.preventDefault();
        this.selectNext();
      }
    }.bind(this)).bind('keydown', 'shift+tab', function (e) {
      if (this.uiContext === 'canvas') {
        e.preventDefault();
        this.selectPrev();
      }
    }.bind(this));
  }
  /**
     * @returns {void}
     */
  setTitles () {
    // Tooltips not directly associated with a single function
    const keyAssocs = {
      '4/Shift+4': '#tools_rect',
      '5/Shift+5': '#tools_ellipse'
    };
    Object.entries(keyAssocs).forEach(([keyval, sel]) => {
      const menu = ($(sel).parents('#main_menu').length);

      $qa(sel).forEach((element) => {
        const t = (menu) ? $(element).text().split(' [')[0] : element.title.split(' [')[0];
        let keyStr = '';
        // Shift+Up
        keyval.split('/').forEach((key, i) => {
          const modBits = key.split('+');
          let mod = '';
          if (modBits.length > 1) {
            mod = modBits[0] + '+';
            key = modBits[1];
          }
          keyStr += (i ? '/' : '') + mod + (this.uiStrings['key_' + key] || key);
        });
        if (menu) {
          this.lastChild.textContent = t + ' [' + keyStr + ']';
        } else {
          this.title = t + ' [' + keyStr + ']';
        }
      });
    });
  }
  /**
     * @param {string} sel Selector to match
     * @returns {module:SVGthis.ToolButton}
     */
  getButtonData (sel) {
    return Object.values(this.toolButtons).find((btn) => {
      return btn.sel === sel;
    });
  }
  /**
   * @fires module:svgcanvas.SvgCanvas#event:ext_addLangData
   * @fires module:svgcanvas.SvgCanvas#event:ext_langReady
   * @fires module:svgcanvas.SvgCanvas#event:ext_langChanged
   * @fires module:svgcanvas.SvgCanvas#event:extensions_added
   * @returns {Promise<module:locale.LangAndData>} Resolves to result of {@link module:locale.readLang}
   */
  async extAndLocaleFunc () {
    const {langParam, langData} = await this.putLocale(this.pref('lang'), this.goodLangs);
    await this.setLang(langParam, langData);

    $id('svg_container').style.visibility = 'visible';

    try {
      // load standard extensions
      await Promise.all(
        this.configObj.curConfig.extensions.map(async (extname) => {
          /**
           * @tutorial ExtensionDocs
           * @typedef {PlainObject} module:SVGthis.ExtensionObject
           * @property {string} [name] Name of the extension. Used internally; no need for i18n. Defaults to extension name without beginning "ext-" or ending ".js".
           * @property {module:svgcanvas.ExtensionInitCallback} [init]
           */
          try {
            /**
             * @type {module:SVGthis.ExtensionObject}
             */
            const imported = await import(`./extensions/${encodeURIComponent(extname)}/${encodeURIComponent(extname)}.js`);
            const {name = extname, init} = imported.default;
            return this.addExtension(name, (init && init.bind(this)), {$, langParam});
          } catch (err) {
            // Todo: Add config to alert any errors
            console.error('Extension failed to load: ' + extname + '; ', err); // eslint-disable-line no-console
            return undefined;
          }
        })
      );
      // load user extensions (given as pathNames)
      await Promise.all(
        this.configObj.curConfig.userExtensions.map(async (extPathName) => {
          /**
           * @tutorial ExtensionDocs
           * @typedef {PlainObject} module:SVGthis.ExtensionObject
           * @property {string} [name] Name of the extension. Used internally; no need for i18n. Defaults to extension name without beginning "ext-" or ending ".js".
           * @property {module:svgcanvas.ExtensionInitCallback} [init]
           */
          try {
            /**
             * @type {module:SVGthis.ExtensionObject}
             */
            const imported = await import(encodeURI(extPathName));
            const {name, init} = imported.default;
            return this.addExtension(name, (init && init.bind(this)), {$, langParam});
          } catch (err) {
            // Todo: Add config to alert any errors
            console.error('Extension failed to load: ' + extPathName + '; ', err); // eslint-disable-line no-console
            return undefined;
          }
        })
      );
      this.svgCanvas.bind(
        'extensions_added',
        /**
        * @param {external:Window} win
        * @param {module:svgcanvas.SvgCanvas#event:extensions_added} data
        * @listens module:SvgCanvas#event:extensions_added
        * @returns {void}
        */
        (win, data) => {
          extensionsAdded = true;
          this.setAll();

          if (this.storagePromptState === 'ignore') {
            this.updateCanvas(true);
          }

          messageQueue.forEach(
            /**
             * @param {module:svgcanvas.SvgCanvas#event:message} messageObj
             * @fires module:svgcanvas.SvgCanvas#event:message
             * @returns {void}
             */
            (messageObj) => {
              this.svgCanvas.call('message', messageObj);
            }
          );
        }
      );
      this.svgCanvas.call('extensions_added');
    } catch (err) {
      // Todo: Report errors through the UI
      console.log(err); // eslint-disable-line no-console
    }
  }
  /**
   * @fires module:svgcanvas.SvgCanvas#event:svgEditorReady
   * @returns {void}
   */
  static readySignal () {
    // let the opener know SVG Edit is ready (now that config is set up)
    const w = window.opener || window.parent;
    if (w) {
      try {
        /**
         * Triggered on a containing `document` (of `window.opener`
         * or `window.parent`) when the editor is loaded.
         * @event module:SVGEditor#event:svgEditorReadyEvent
         * @type {Event}
         * @property {true} bubbles
         * @property {true} cancelable
         */
        /**
         * @name module:SVGthis.svgEditorReadyEvent
         * @type {module:SVGEditor#event:svgEditorReadyEvent}
         */
        const svgEditorReadyEvent = new w.CustomEvent('svgEditorReady', {
          bubbles: true,
          cancelable: true
        });
        w.document.documentElement.dispatchEvent(svgEditorReadyEvent);
      } catch (e) {}
    }
  }
  /**
  * Expose the `uiStrings`.
  * @function module:SVGthis.canvas.getUIStrings
  * @returns {module:SVGthis.uiStrings}
  */
  getUIStrings () {
    return this.uiStrings;
  }

  /**
  * Auto-run after a Promise microtask.
  * @function module:SVGthis.init
  * @returns {void}
  */
  init () {
    try {
      if ('localStorage' in window) { // && onWeb removed so Webkit works locally
        /**
        * The built-in interface implemented by `localStorage`
        * @external Storage
        */
        /**
        * @name storage
        * @memberof module:SVGEditor
        * @type {external:Storage}
        */
        this.storage = this.localStorage;
      }
      // Image props dialog added to DOM
      const newSeImgPropDialog = document.createElement('se-img-prop-dialog');
      newSeImgPropDialog.setAttribute('id', 'se-img-prop');
      document.body.append(newSeImgPropDialog);
      // editor prefences dialoag added to DOM
      const newSeEditPrefsDialog = document.createElement('se-edit-prefs-dialog');
      newSeEditPrefsDialog.setAttribute('id', 'se-edit-prefs');
      document.body.append(newSeEditPrefsDialog);
      // canvas menu added to DOM
      const dialogBox = document.createElement('se-cmenu_canvas-dialog');
      dialogBox.setAttribute('id', 'se-cmenu_canvas');
      document.body.append(dialogBox);
    } catch (err) {}

    this.configObj.load();

    /**
    * @name module:SVGthis.canvas
    * @type {module:svgcanvas.SvgCanvas}
    */
    this.svgCanvas = new SvgCanvas(
      $id('svgcanvas'),
      this.configObj.curConfig
    );

    this.leftPanelHandlers = new LeftPanelHandlers(this);
    this.bottomPanelHandlers = new BottomPanelHandlers(this);
    this.topPanelHandlers = new TopPanelHandlers(this);
    this.layersPanel = new LayersPanel(this);

    const {undoMgr} = this.svgCanvas;
    this.workarea = $('#workarea');
    this.canvMenu = document.getElementById('se-cmenu_canvas');
    this.exportWindow = null;
    this.defaultImageURL = this.configObj.curConfig.imgPath + 'logo.svg';
    const zoomInIcon = 'crosshair';
    const zoomOutIcon = 'crosshair';
    this.uiContext = 'toolbars';

    // For external openers
    Editor.readySignal();

    this.rulers = new Rulers(this);

    this.layersPanel.populateLayers();
    this.selectedElement = null;
    this.multiselected = false;

    $('#cur_context_panel').delegate('a', 'click', (evt) => {
      const link = $(evt.currentTarget);
      if (link.attr('data-root')) {
        this.svgCanvas.leaveContext();
      } else {
        this.svgCanvas.setContext(link.text());
      }
      this.svgCanvas.clearSelection();
      return false;
    });
    // bind the selected event to our function that handles updates to the UI
    this.svgCanvas.bind('selected', this.selectedChanged.bind(this));
    this.svgCanvas.bind('transition', this.elementTransition.bind(this));
    this.svgCanvas.bind('changed', this.elementChanged.bind(this));
    this.svgCanvas.bind('saved', this.saveHandler.bind(this));
    this.svgCanvas.bind('exported', this.exportHandler.bind(this));
    this.svgCanvas.bind('exportedPDF', function (win, data) {
      if (!data.output) { // Ignore Chrome
        return;
      }
      const {exportWindowName} = data;
      if (exportWindowName) {
        this.exportWindow = window.open('', this.exportWindowName); // A hack to get the window via JSON-able name without opening a new one
      }
      if (!this.exportWindow || this.exportWindow.closed) {
        seAlert(this.uiStrings.notification.popupWindowBlocked);
        return;
      }
      this.exportWindow.location.href = data.output;
    }.bind(this));
    this.svgCanvas.bind('zoomed', this.zoomChanged.bind(this));
    this.svgCanvas.bind('zoomDone', this.zoomDone.bind(this));
    this.svgCanvas.bind(
      'updateCanvas',
      /**
     * @param {external:Window} win
     * @param {PlainObject} centerInfo
     * @param {false} centerInfo.center
     * @param {module:math.XYObject} centerInfo.newCtr
     * @listens module:svgcanvas.SvgCanvas#event:updateCanvas
     * @returns {void}
     */
      function (win, {center, newCtr}) {
        this.updateCanvas(center, newCtr);
      }.bind(this)
    );
    this.svgCanvas.bind('contextset', this.contextChanged.bind(this));
    this.svgCanvas.bind('extension_added', this.extAdded.bind(this));
    this.svgCanvas.textActions.setInputElem($('#text')[0]);

    this.setBackground(this.pref('bkgd_color'), this.pref('bkgd_url'));

    // update resolution option with actual resolution
    const res = this.svgCanvas.getResolution();
    if (this.configObj.curConfig.baseUnit !== 'px') {
      res.w = convertUnit(res.w) + this.configObj.curConfig.baseUnit;
      res.h = convertUnit(res.h) + this.configObj.curConfig.baseUnit;
    }
    $('#se-img-prop').attr('dialog', 'close');
    $('#se-img-prop').attr('title', this.svgCanvas.getDocumentTitle());
    $('#se-img-prop').attr('width', res.w);
    $('#se-img-prop').attr('height', res.h);
    $('#se-img-prop').attr('save', this.pref('img_save'));

    // Lose focus for select elements when changed (Allows keyboard shortcuts to work better)
    $('select').change((evt) => { $(evt.currentTarget).blur(); });

    // fired when user wants to move elements to another layer
    let promptMoveLayerOnce = false;
    $('#selLayerNames').change((evt) => {
      const destLayer = evt.currentTarget.options[evt.currentTarget.selectedIndex].value;
      const confirmStr = this.uiStrings.notification.Qmovethis.elemsToLayer.replace('%s', destLayer);
      /**
    * @param {boolean} ok
    * @returns {void}
    */
      const moveToLayer = (ok) => {
        if (!ok) { return; }
        promptMoveLayerOnce = true;
        this.svgCanvas.moveSelectedToLayer(destLayer);
        this.svgCanvas.clearSelection();
        this.layersPanel.populateLayers();
      };
      if (destLayer) {
        if (promptMoveLayerOnce) {
          moveToLayer(true);
        } else {
          const ok = seConfirm(confirmStr);
          if (!ok) {
            return;
          }
          moveToLayer(true);
        }
      }
    });

    $('#font_family').change((evt) => {
      this.svgCanvas.setFontFamily(evt.currentTarget.value);
    });

    $('#seg_type').change((evt) => {
      this.svgCanvas.setSegType($(evt.currentTarget).val());
    });

    $('#text').bind('keyup input', (evt) => {
      this.svgCanvas.setTextContent(evt.currentTarget.value);
    });

    $('#image_url').change((evt) => {
      this.setImageURL(evt.currentTarget.value);
    });

    $('#link_url').change((evt) => {
      if (evt.currentTarget.value.length) {
        this.svgCanvas.setLinkURL(evt.currentTarget.value);
      } else {
        this.svgCanvas.removeHyperlink();
      }
    });

    $('#g_title').change((evt) => {
      this.svgCanvas.setGroupTitle(evt.currentTarget.value);
    });

    const wArea = this.workarea[0];

    let lastX = null, lastY = null,
      panning = false, keypan = false;

    $('#svgcanvas').bind('mousemove mouseup', function (evt) {
      if (panning === false) { return true; }

      wArea.scrollLeft -= (evt.clientX - lastX);
      wArea.scrollTop -= (evt.clientY - lastY);

      lastX = evt.clientX;
      lastY = evt.clientY;

      if (evt.type === 'mouseup') { panning = false; }
      return false;
    }).mousedown(function (evt) {
      if (evt.button === 1 || keypan === true) {
        panning = true;
        lastX = evt.clientX;
        lastY = evt.clientY;
        return false;
      }
      return true;
    });

    $(window).mouseup(() => {
      panning = false;
    });

    $(document).bind('keydown', 'space', function (evt) {
      this.svgCanvas.spaceKey = keypan = true;
      evt.preventDefault();
    }.bind(this)).bind('keyup', 'space', function (evt) {
      evt.preventDefault();
      this.svgCanvas.spaceKey = keypan = false;
    }.bind(this)).bind('keydown', 'shift', function (evt) {
      if (this.svgCanvas.getMode() === 'zoom') {
        this.workarea.css('cursor', zoomOutIcon);
      }
    }.bind(this)).bind('keyup', 'shift', function (evt) {
      if (this.svgCanvas.getMode() === 'zoom') {
        this.workarea.css('cursor', zoomInIcon);
      }
    }.bind(this));

    /**
     * @function module:SVGthis.setPanning
     * @param {boolean} active
     * @returns {void}
     */
    this.setPanning = (active) => {
      this.svgCanvas.spaceKey = keypan = active;
    };

    const button = $('#main_icon');
    const overlay = $('#main_icon span');
    const list = $('#main_menu');

    let onButton = false;
    let height = 0;
    let jsHover = true;
    let setClick = false;

    $(window).mouseup(function (evt) {
      if (!onButton) {
        button.removeClass('buttondown');
        // do not hide if it was the file input as that input needs to be visible
        // for its change event to fire
        if (evt.target.tagName !== 'INPUT') {
          list.fadeOut(200);
        } else if (!setClick) {
          setClick = true;
          $(evt.target).click(() => {
            list.css('margin-left', '-9999px').show();
          });
        }
      }
      onButton = false;
    }).mousedown(function (evt) {
      // $('.contextMenu').hide();
      const islib = $(evt.target).closest('.contextMenu').length;
      if (!islib) {
        $('.contextMenu').fadeOut(250);
      }
    });

    overlay.bind('mousedown', () => {
      if (!button.hasClass('buttondown')) {
        // Margin must be reset in case it was changed before;
        list.css('margin-left', 0).show();
        if (!height) {
          height = list.height();
        }
        // Using custom animation as slideDown has annoying 'bounce effect'
        list.css('height', 0).animate({
          height
        }, 200);
        onButton = true;
      } else {
        list.fadeOut(200);
      }
      button.toggleClass('buttondown buttonup');
    }).hover(() => {
      onButton = true;
    }).mouseout(() => {
      onButton = false;
    });

    const listItems = $('#main_menu li');

    // Check if JS method of hovering needs to be used (Webkit bug)
    listItems.mouseover(function () {
      jsHover = ($(this).css('background-color') === 'rgba(0, 0, 0, 0)');

      listItems.unbind('mouseover');
      if (jsHover) {
        listItems.mouseover(() => {
          this.style.backgroundColor = '#FFC';
        }).mouseout((evt) => {
          evt.currentTarget.style.backgroundColor = 'transparent';
          return true;
        });
      }
    });
    // Unfocus text input when this.workarea is mousedowned.
    let inp;
    /**
      *
      * @returns {void}
      */
    const unfocus = () => {
      $(inp).blur();
    };

    $('#svg_editor').find('button, select, input:not(#text)').focus(() => {
      inp = this;
      this.uiContext = 'toolbars';
      this.workarea.mousedown(unfocus);
    }).blur(() => {
      this.uiContext = 'canvas';
      this.workarea.unbind('mousedown', unfocus);
      // Go back to selecting text if in textedit mode
      if (this.svgCanvas.getMode() === 'textedit') {
        $('#text').focus();
      }
    });
    const winWh = {width: $(window).width(), height: $(window).height()};

    $(window).resize(function (evt) {
      $.each(winWh, function (type, val) {
        const curval = $(window)[type]();
        this.workarea[0]['scroll' + (type === 'width' ? 'Left' : 'Top')] -= (curval - val) / 2;
        winWh[type] = curval;
      });
    });

    this.workarea.scroll(() => {
    // TODO: jQuery's scrollLeft/Top() wouldn't require a null check
      this.rulers.manageScroll();
    });

    $('#url_notice').click(() => {
      seAlert(this.title);
    });

    $('#stroke_width').val(this.configObj.curConfig.initStroke.width);
    $('#group_opacity').val(this.configObj.curConfig.initOpacity * 100);

    $('#group_opacityLabel').click(() => {
      $('#opacity_dropdown button').mousedown();
      $(window).mouseup();
    });

    $('.push_button').mousedown(() => {
      if (!$(this).hasClass('disabled')) {
        $(this).addClass('push_button_pressed').removeClass('push_button');
      }
    }).mouseout(() => {
      $(this).removeClass('push_button_pressed').addClass('push_button');
    }).mouseup(() => {
      $(this).removeClass('push_button_pressed').addClass('push_button');
    });

    this.layersPanel.populateLayers();

    const centerCanvas = () => {
    // this centers the canvas vertically in the this.workarea (horizontal handled in CSS)
      this.workarea.css('line-height', this.workarea.height() + 'px');
    };

    $(window).bind('load resize', centerCanvas);

    // Prevent browser from erroneously repopulating fields
    $('input,select').attr('autocomplete', 'off');

    /**
   * Associate all button actions as well as non-button keyboard shortcuts.
   */
    this.leftPanelHandlers.init();
    this.bottomPanelHandlers.init();
    this.topPanelHandlers.init();
    this.layersPanel.init();

    $id('tool_clear').addEventListener('click', this.clickClear.bind(this));
    $id('tool_open').addEventListener('click', function (e) {
      this.clickOpen();
      window.dispatchEvent(new CustomEvent('openImage'));
    }.bind(this));
    $id('tool_import').addEventListener('click', (e) => {
      this.clickImport();
      window.dispatchEvent(new CustomEvent('importImage'));
    });
    $id('tool_save').addEventListener('click', function (e) {
      const $editorDialog = document.getElementById('se-svg-editor-dialog');
      const editingsource = $editorDialog.getAttribute('dialog') === 'open';
      if (editingsource) {
        this.saveSourceEditor();
      } else {
        this.clickSave();
      }
    }.bind(this));
    $id('tool_export').addEventListener('click', this.clickExport.bind(this));
    $id('tool_docprops').addEventListener('click', this.showDocProperties.bind(this));
    $id('tool_editor_prefs').addEventListener('click', this.showPreferences.bind(this));
    $id('tool_editor_homepage').addEventListener('click', this.openHomePage.bind(this));
    $id('se-img-prop').addEventListener('change', function (e) {
      if (e.detail.dialog === 'closed') {
        this.hideDocProperties();
      } else {
        this.saveDocProperties(e);
      }
    }.bind(this));
    $id('se-edit-prefs').addEventListener('change', function (e) {
      if (e.detail.dialog === 'closed') {
        this.hidePreferences();
      } else {
        this.savePreferences(e);
      }
    }.bind(this));
    $id('se-svg-editor-dialog').addEventListener('change', function (e) {
      if (e?.detail?.copy === 'click') {
        this.cancelOverlays(e);
      } else if (e?.detail?.dialog === 'closed') {
        this.hideSourceEditor();
      } else {
        this.saveSourceEditor(e);
      }
    }.bind(this));
    $id('se-cmenu_canvas').addEventListener('change', function (e) {
      const action = e?.detail?.trigger;
      switch (action) {
      case 'delete':
        this.svgCanvas.deleteSelectedElements();
        break;
      case 'cut':
        this.cutSelected();
        break;
      case 'copy':
        this.copySelected();
        break;
      case 'paste':
        this.svgCanvas.pasteElements();
        break;
      case 'paste_in_place':
        this.svgCanvas.pasteElements('in_place');
        break;
      case 'group':
      case 'group_elements':
        this.svgCanvas.groupSelectedElements();
        break;
      case 'ungroup':
        this.svgCanvas.ungroupSelectedElement();
        break;
      case 'move_front':
        this.svgCanvas.moveToTopSelectedElement();
        break;
      case 'move_up':
        this.moveUpDownSelected('Up');
        break;
      case 'move_down':
        this.moveUpDownSelected('Down');
        break;
      case 'move_back':
        this.svgCanvas.moveToBottomSelected();
        break;
      default:
        if (hasCustomHandler(action)) {
          getCustomHandler(action).call();
        }
        break;
      }
    }.bind(this));

    // Select given tool
    this.ready(function () {
      const preTool = $id(`tool_${this.configObj.curConfig.initTool}`);
      const regTool = $id(this.configObj.curConfig.initTool);
      const selectTool = $id('tool_select');
      const $editDialog = $id('se-edit-prefs');

      if (preTool) {
        preTool.click();
      } else if (regTool) {
        regTool.click();
      } else {
        selectTool.click();
      }

      if (this.configObj.curConfig.wireframe) {
        $id('tool_wireframe').click();
      }

      $('#rulers').toggle(Boolean(this.configObj.curConfig.showRulers));

      if (this.configObj.curConfig.showRulers) {
        $editDialog.setAttribute('showrulers', true);
      }

      if (this.configObj.curConfig.baseUnit) {
        $editDialog.setAttribute('baseunit', this.configObj.curConfig.baseUnit);
      }

      if (this.configObj.curConfig.gridSnapping) {
        $editDialog.setAttribute('gridsnappingon', true);
      }

      if (this.configObj.curConfig.snappingStep) {
        $editDialog.setAttribute('gridsnappingstep', this.configObj.curConfig.snappingStep);
      }

      if (this.configObj.curConfig.gridColor) {
        $editDialog.setAttribute('gridcolor', this.configObj.curConfig.gridColor);
      }
    }.bind(this));

    // zoom
    $id('zoom').value = (this.svgCanvas.getZoom() * 100).toFixed(1);
    this.canvMenu.setAttribute('disableallmenu', true);
    this.canvMenu.setAttribute('enablemenuitems', '#delete,#cut,#copy');

    this.enableOrDisableClipboard();

    window.addEventListener('storage', function (e) {
      if (e.key !== 'svgedit_clipboard') { return; }

      this.enableOrDisableClipboard();
    }.bind(this));

    window.addEventListener('beforeunload', function (e) {
    // Suppress warning if page is empty
      if (undoMgr.getUndoStackSize() === 0) {
        this.showSaveWarning = false;
      }

      // showSaveWarning is set to 'false' when the page is saved.
      if (!this.configObj.curConfig.no_save_warning && this.showSaveWarning) {
      // Browser already asks question about closing the page
        e.returnValue = this.uiStrings.notification.unsavedChanges; // Firefox needs this when beforeunload set by addEventListener (even though message is not used)
        return this.uiStrings.notification.unsavedChanges;
      }
      return true;
    }.bind(this));

    // Use HTML5 File API: http://www.w3.org/TR/FileAPI/
    // if browser has HTML5 File API support, then we will show the open menu item
    // and provide a file input to click. When that change event fires, it will
    // get the text contents of the file and send it to the canvas
    if (window.FileReader) {
    /**
    * @param {Event} e
    * @returns {void}
    */
      const importImage = function (e) {
        $.process_cancel(this.uiStrings.notification.loadingImage);
        e.stopPropagation();
        e.preventDefault();
        $('#main_menu').hide();
        const file = (e.type === 'drop') ? e.dataTransfer.files[0] : this.files[0];
        if (!file) {
          $('#dialog_box').hide();
          return;
        }

        if (!file.type.includes('image')) {
          return;
        }
        // Detected an image
        // svg handling
        let reader;
        if (file.type.includes('svg')) {
          reader = new FileReader();
          reader.onloadend = function (ev) {
            const newElement = this.svgCanvas.importSvgString(ev.target.result, true);
            this.svgCanvas.ungroupSelectedElement();
            this.svgCanvas.ungroupSelectedElement();
            this.svgCanvas.groupSelectedElements();
            this.svgCanvas.alignSelectedElements('m', 'page');
            this.svgCanvas.alignSelectedElements('c', 'page');
            // highlight imported element, otherwise we get strange empty selectbox
            this.svgCanvas.selectOnly([newElement]);
            $('#dialog_box').hide();
          };
          reader.readAsText(file);
        } else {
        // bitmap handling
          reader = new FileReader();
          reader.onloadend = function ({target: {result}}) {
          /**
          * Insert the new image until we know its dimensions.
          * @param {Float} width
          * @param {Float} height
          * @returns {void}
          */
            const insertNewImage = function (width, height) {
              const newImage = this.svgCanvas.addSVGElementFromJson({
                element: 'image',
                attr: {
                  x: 0,
                  y: 0,
                  width,
                  height,
                  id: this.svgCanvas.getNextId(),
                  style: 'pointer-events:inherit'
                }
              });
              this.svgCanvas.setHref(newImage, result);
              this.svgCanvas.selectOnly([newImage]);
              this.svgCanvas.alignSelectedElements('m', 'page');
              this.svgCanvas.alignSelectedElements('c', 'page');
              this.topPanelHandlers.updateContextPanel();
              $('#dialog_box').hide();
            };
            // create dummy img so we know the default dimensions
            let imgWidth = 100;
            let imgHeight = 100;
            const img = new Image();
            img.style.opacity = 0;
            img.addEventListener('load', () => {
              imgWidth = img.offsetWidth || img.naturalWidth || img.width;
              imgHeight = img.offsetHeight || img.naturalHeight || img.height;
              insertNewImage(imgWidth, imgHeight);
            });
            img.src = result;
          };
          reader.readAsDataURL(file);
        }
      };

      this.workarea[0].addEventListener('dragenter', this.onDragEnter);
      this.workarea[0].addEventListener('dragover', this.onDragOver);
      this.workarea[0].addEventListener('dragleave', this.onDragLeave);
      this.workarea[0].addEventListener('drop', importImage);

      const open = $('<input type="file">').change(async function (e) {
        const ok = await this.openPrep();
        if (!ok) { return; }
        this.svgCanvas.clear();
        if (this.files.length === 1) {
          $.process_cancel(this.uiStrings.notification.loadingImage);
          const reader = new FileReader();
          reader.onloadend = async function ({target}) {
            await this.loadSvgString(target.result);
            this.updateCanvas();
          };
          reader.readAsText(this.files[0]);
        }
      });
      $('#tool_open').show();
      $(window).on('openImage', () => open.click());

      const imgImport = $('<input type="file">').change(importImage);
      $('#tool_import').show();
      $(window).on('importImage', () => imgImport.click());
    }

    this.updateCanvas(true);
    // Load extensions
    this.extAndLocaleFunc();
    // Defer injection to wait out initial menu processing. This probably goes
    //    away once all context menu behavior is brought to context menu.
    this.ready(() => {
      injectExtendedContextMenuItemsIntoDom();
    });
  }

  /**
  * @param {boolean} editmode
  * @param {module:svgcanvas.SvgCanvas#event:selected} elems
  * @returns {void}
  */
  togglePathEditMode (editmode, elems) {
    $('#path_node_panel').toggle(editmode);
    if (editmode) {
      // Change select icon
      $('.tool_button_current').removeClass('tool_button_current').addClass('tool_button');
      $('#tool_select').addClass('tool_button_current').removeClass('tool_button');
      this.multiselected = false;
      if (elems.length) {
        this.selectedElement = this.elems[0];
      }
    } else {
      setTimeout(() => {
        // setIcon('#tool_select', 'select');
      }, 1000);
    }
  }

  /**
   * @type {module:svgcanvas.EventHandler}
   * @param {external:Window} wind
   * @param {module:svgcanvas.SvgCanvas#event:saved} svg The SVG source
   * @listens module:svgcanvas.SvgCanvas#event:saved
   * @returns {void}
   */
  saveHandler (wind, svg) {
    this.showSaveWarning = false;

    // by default, we add the XML prolog back, systems integrating SVG-edit (wikis, CMSs)
    // can just provide their own custom save handler and might not want the XML prolog
    svg = '<?xml version="1.0"?>\n' + svg;

    // Since saving SVGs by opening a new window was removed in Chrome use artificial link-click
    // https://stackoverflow.com/questions/45603201/window-is-not-allowed-to-navigate-top-frame-navigations-to-data-urls
    const a = document.createElement('a');
    a.href = 'data:image/svg+xml;base64,' + encode64(svg);
    a.download = 'icon.svg';
    a.style.display = 'none';
    document.body.append(a); // Need to append for Firefox

    a.click();

    // Alert will only appear the first time saved OR the
    //   first time the bug is encountered
    let done = this.pref('save_notice_done');

    if (done !== 'all') {
      let note = this.uiStrings.notification.saveFromBrowser.replace('%s', 'SVG');
      // Check if FF and has <defs/>
      if (isGecko()) {
        if (svg.includes('<defs')) {
          // warning about Mozilla bug #308590 when applicable (seems to be fixed now in Feb 2013)
          note += '\n\n' + this.uiStrings.notification.defsFailOnSave;
          this.pref('save_notice_done', 'all');
          done = 'all';
        } else {
          this.pref('save_notice_done', 'part');
        }
      } else {
        this.pref('save_notice_done', 'all');
      }
      if (done !== 'part') {
        seAlert(note);
      }
    }
  }

  /**
   * @param {external:Window} win
   * @param {module:svgcanvas.SvgCanvas#event:exported} data
   * @listens module:svgcanvas.SvgCanvas#event:exported
   * @returns {void}
   */
  exportHandler (win, data) {
    const {issues, exportWindowName} = data;

    this.exportWindow = window.open(blankPageObjectURL || '', exportWindowName); // A hack to get the window via JSON-able name without opening a new one

    if (!this.exportWindow || this.exportWindow.closed) {
      seAlert(this.uiStrings.notification.popupWindowBlocked);
      return;
    }

    this.exportWindow.location.href = data.bloburl || data.datauri;
    const done = this.pref('export_notice_done');
    if (done !== 'all') {
      let note = this.uiStrings.notification.saveFromBrowser.replace('%s', data.type);

      // Check if there are issues
      if (issues.length) {
        const pre = '\n \u2022 ';
        note += ('\n\n' + this.uiStrings.notification.noteTheseIssues + pre + issues.join(pre));
      }

      // Note that this will also prevent the notice even though new issues may appear later.
      // May want to find a way to deal with that without annoying the user
      this.pref('export_notice_done', 'all');
      this.exportWindow.seAlert(note);
    }
  }

  /**
   *
   * @param {Element} opt
   * @param {boolean} changeElem
   * @returns {void}
   */
  setStrokeOpt (opt, changeElem) {
    const {id} = opt;
    const bits = id.split('_');
    const [pre, val] = bits;

    if (changeElem) {
      this.svgCanvas.setStrokeAttr('stroke-' + pre, val);
    }
    $(opt).addClass('current').siblings().removeClass('current');
  }

  /**
  * Set a selected image's URL.
  * @function module:SVGthis.setImageURL
  * @param {string} url
  * @returns {void}
  */
  setImageURL (url) {
    if (!url) {
      url = this.defaultImageURL;
    }
    this.svgCanvas.setImageURL(url);
    $('#image_url').val(url);

    if (url.startsWith('data:')) {
      // data URI found
      $('#image_url').hide();
      $('#change_image_url').show();
    } else {
      // regular URL
      this.svgCanvas.embedImage(url, function (dataURI) {
        // Couldn't embed, so show warning
        $('#url_notice').toggle(!dataURI);
        this.defaultImageURL = url;
      });
      $('#image_url').show();
      $('#change_image_url').hide();
    }
  }

  /**
   *
   * @param {string} color
   * @param {string} url
   * @returns {void}
   */
  setBackground (color, url) {
    // if (color == this.pref('bkgd_color') && url == this.pref('bkgd_url')) { return; }
    this.pref('bkgd_color', color);
    this.pref('bkgd_url', url, true);

    // This should be done in  this.svgCanvas.js for the borderRect fill
    this.svgCanvas.setBackground(color, url);
  }

  /**
  * @function module:SVGthis.updateCanvas
  * @param {boolean} center
  * @param {module:math.XYObject} newCtr
  * @returns {void}
  */
  updateCanvas (center, newCtr) {
    const zoom = this.svgCanvas.getZoom();
    const wArea = this.workarea;
    const cnvs = $('#svgcanvas');

    let w = this.workarea.width(), h = this.workarea.height();
    const wOrig = w, hOrig = h;
    const oldCtr = {
      x: wArea[0].scrollLeft + wOrig / 2,
      y: wArea[0].scrollTop + hOrig / 2
    };
    const multi = this.configObj.curConfig.canvas_expansion;
    w = Math.max(wOrig, this.svgCanvas.contentW * zoom * multi);
    h = Math.max(hOrig, this.svgCanvas.contentH * zoom * multi);

    if (w === wOrig && h === hOrig) {
      this.workarea.css('overflow', 'hidden');
    } else {
      this.workarea.css('overflow', 'scroll');
    }

    const oldCanY = cnvs.height() / 2;
    const oldCanX = cnvs.width() / 2;
    cnvs.width(w).height(h);
    const newCanY = h / 2;
    const newCanX = w / 2;
    const offset = this.svgCanvas.updateCanvas(w, h);

    const ratio = newCanX / oldCanX;

    const scrollX = w / 2 - wOrig / 2; // eslint-disable-line no-shadow
    const scrollY = h / 2 - hOrig / 2; // eslint-disable-line no-shadow

    if (!newCtr) {
      const oldDistX = oldCtr.x - oldCanX;
      const newX = newCanX + oldDistX * ratio;

      const oldDistY = oldCtr.y - oldCanY;
      const newY = newCanY + oldDistY * ratio;

      newCtr = {
        x: newX,
        y: newY
      };
    } else {
      newCtr.x += offset.x;
      newCtr.y += offset.y;
    }

    if (center) {
      // Go to top-left for larger documents
      if (this.svgCanvas.contentW > wArea.width()) {
        // Top-left
        this.workarea[0].scrollLeft = offset.x - 10;
        this.workarea[0].scrollTop = offset.y - 10;
      } else {
        // Center
        wArea[0].scrollLeft = scrollX;
        wArea[0].scrollTop = scrollY;
      }
    } else {
      wArea[0].scrollLeft = newCtr.x - wOrig / 2;
      wArea[0].scrollTop = newCtr.y - hOrig / 2;
    }
    if (this.configObj.curConfig.showRulers) {
      this.rulers.updateRulers(cnvs, zoom);
      this.workarea.scroll();
    }

    if (this.configObj.urldata.storagePrompt !== true && this.storagePromptState === 'ignore') {
      $('#dialog_box').hide();
    }
  }

  /**
  * Updates the toolbar (colors, opacity, etc) based on the selected element.
  * This function also updates the opacity and id elements that are in the
  * context panel.
  * @returns {void}
  */
  updateToolbar () {
    let i, len;
    if (!isNullish(this.selectedElement)) {
      switch (this.selectedElement.tagName) {
      case 'use':
      case 'image':
      case 'foreignObject':
        break;
      case 'g':
      case 'a': {
        // Look for common styles
        const childs = this.selectedElement.getElementsByTagName('*');
        let gWidth = null;
        for (i = 0, len = childs.length; i < len; i++) {
          const swidth = childs[i].getAttribute('stroke-width');

          if (i === 0) {
            gWidth = swidth;
          } else if (gWidth !== swidth) {
            gWidth = null;
          }
        }

        $('#stroke_width').val(gWidth === null ? '' : gWidth);
        this.bottomPanelHandlers.updateColorpickers(true);
        break;
      } default: {
        this.bottomPanelHandlers.updateColorpickers(true);

        $('#stroke_width').val(this.selectedElement.getAttribute('stroke-width') || 1);
        $('#stroke_style').val(this.selectedElement.getAttribute('stroke-dasharray') || 'none');

        let attr = this.selectedElement.getAttribute('stroke-linejoin') || 'miter';

        if ($('#linejoin_' + attr).length) {
          this.setStrokeOpt($('#linejoin_' + attr)[0]);
        }

        attr = this.selectedElement.getAttribute('stroke-linecap') || 'butt';

        if ($('#linecap_' + attr).length) {
          this.setStrokeOpt($('#linecap_' + attr)[0]);
        }
      }
      }
    }

    // All elements including image and group have opacity
    if (!isNullish(this.selectedElement)) {
      const opacPerc = (this.selectedElement.getAttribute('opacity') || 1.0) * 100;
      $('#group_opacity').val(opacPerc);
      $('#opac_slider').slider('option', 'value', opacPerc);
      $id('elem_id').value = this.selectedElement.id;
      $id('elem_class').value =
        (this.selectedElement.getAttribute('class') !== null) ? this.selectedElement.getAttribute('class') : '';
    }

    this.bottomPanelHandlers.updateToolButtonState();
  }

  /**
  *
  * @returns {void}
  */
  updateWireFrame () {
    const rule = `
      #workarea.wireframe #svgcontent * {
        stroke-width: ${1 / this.svgCanvas.getZoom()}px;
      }
    `;
    $('#wireframe_rules').text(this.workarea.hasClass('wireframe') ? rule : '');
  }

  /**
  * @param {string} [title=svgCanvas.getDocumentTitle()]
  * @returns {void}
  */
  updateTitle (title) {
    title = title || this.svgCanvas.getDocumentTitle();
    const newTitle = document.querySelector('title').text + (title ? ': ' + title : '');

    // Remove title update with current context info, isn't really necessary
    // if (this.curContext) {
    //   new_title = new_title + this.curContext;
    // }
    $('title:first').text(newTitle);
  }

  // called when we've selected a different element
  /**
  *
  * @param {external:Window} win
  * @param {module:svgcanvas.SvgCanvas#event:selected} elems Array of elements that were selected
  * @listens module:svgcanvas.SvgCanvas#event:selected
  * @fires module:svgcanvas.SvgCanvas#event:ext_selectedChanged
  * @returns {void}
  */
  selectedChanged (win, elems) {
    const mode = this.svgCanvas.getMode();
    if (mode === 'select') {
      this.leftPanelHandlers.clickSelect();
    }
    const isNode = mode === 'pathedit';
    // if this.elems[1] is present, then we have more than one element
    this.selectedElement = (elems.length === 1 || isNullish(elems[1]) ? elems[0] : null);
    this.multiselected = (elems.length >= 2 && !isNullish(elems[1]));
    if (!isNullish(this.selectedElement) && !isNode) {
      this.updateToolbar();
    } // if (!isNullish(elem))

    // Deal with pathedit mode
    this.togglePathEditMode(isNode, elems);
    this.topPanelHandlers.updateContextPanel();
    this.svgCanvas.runExtensions('selectedChanged', /** @type {module:svgcanvas.SvgCanvas#event:ext_selectedChanged} */ {
      elems,
      selectedElement: this.selectedElement,
      multiselected: this.multiselected
    });
  }

  // Call when part of element is in process of changing, generally
  // on mousemove actions like rotate, move, etc.
  /**
   * @param {external:Window} win
   * @param {module:svgcanvas.SvgCanvas#event:transition} elems
   * @listens module:svgcanvas.SvgCanvas#event:transition
   * @fires module:svgcanvas.SvgCanvas#event:ext_elementTransition
   * @returns {void}
   */
  elementTransition (win, elems) {
    const mode = this.svgCanvas.getMode();
    const elem = elems[0];

    if (!elem) {
      return;
    }

    this.multiselected = (elems.length >= 2 && !isNullish(elems[1]));
    // Only updating fields for single elements for now
    if (!this.multiselected) {
      switch (mode) {
      case 'rotate': {
        const ang = this.svgCanvas.getRotationAngle(elem);
        $('#angle').val(ang);
        $('#tool_reorient').toggleClass('disabled', ang === 0);
        break;
      }
      }
    }
    this.svgCanvas.runExtensions('elementTransition', /** @type {module:svgcanvas.SvgCanvas#event:ext_elementTransition} */ {
      elems
    });
  }

  // called when any element has changed
  /**
   * @param {external:Window} win
   * @param {Array<PlainObject>} elems
   * @listens module:svgcanvas.SvgCanvas#event:changed
   * @fires module:svgcanvas.SvgCanvas#event:ext_elementChanged
   * @returns {void}
   */
  elementChanged (win, elems) {
    const mode = this.svgCanvas.getMode();
    if (mode === 'select') {
      this.leftPanelHandlers.clickSelect();
    }

    elems.forEach((elem) => {
      const isSvgElem = (elem && elem.tagName === 'svg');
      if (isSvgElem || this.svgCanvas.isLayer(elem)) {
        this.layersPanel.populateLayers();
        // if the element changed was the svg, then it could be a resolution change
        if (isSvgElem) {
          this.updateCanvas();
        }
      // Update selectedElement if element is no longer part of the image.
      // This occurs for the text elements in Firefox
      } else if (elem && this.selectedElement && isNullish(this.selectedElement.parentNode)) {
        // || elem && elem.tagName == "path" && !multiselected) { // This was added in r1430, but not sure why
        this.selectedElement = elem;
      }
    });

    this.showSaveWarning = true;

    // we update the contextual panel with potentially new
    // positional/sizing information (we DON'T want to update the
    // toolbar here as that creates an infinite loop)
    // also this updates the history buttons

    // we tell it to skip focusing the text control if the
    // text element was previously in focus
    this.topPanelHandlers.updateContextPanel();

    // In the event a gradient was flipped:
    if (this.selectedElement && mode === 'select') {
      this.bottomPanelHandlers.updateColorpickers();
    }

    this.svgCanvas.runExtensions('elementChanged', /** @type {module:svgcanvas.SvgCanvas#event:ext_elementChanged} */ {
      elems
    });
  }

  /**
   * @returns {void}
   */
  zoomDone () {
    this.updateWireFrame();
  }

  /**
  * @typedef {PlainObject} module:SVGthis.BBoxObjectWithFactor (like `DOMRect`)
  * @property {Float} x
  * @property {Float} y
  * @property {Float} width
  * @property {Float} height
  * @property {Float} [factor] Needed if width or height are 0
  * @property {Float} [zoom]
  * @see module:svgcanvas.SvgCanvas#event:zoomed
  */

  /**
  * @function module:svgcanvas.SvgCanvas#zoomChanged
  * @param {external:Window} win
  * @param {module:svgcanvas.SvgCanvas#event:zoomed} bbox
  * @param {boolean} autoCenter
  * @listens module:svgcanvas.SvgCanvas#event:zoomed
  * @returns {void}
  */
  zoomChanged (win, bbox, autoCenter) {
    const scrbar = 15,
      // res =  this.svgCanvas.getResolution(), // Currently unused
      wArea = this.workarea;
    // const canvasPos = $('#svgcanvas').position(); // Currently unused
    const zInfo = this.svgCanvas.setBBoxZoom(bbox, wArea.width() - scrbar, wArea.height() - scrbar);
    if (!zInfo) { return; }
    const zoomlevel = zInfo.zoom,
      bb = zInfo.bbox;

    if (zoomlevel < 0.001) {
      this.changeZoom(0.1);
      return;
    }

    $id('zoom').value = (this.svgCanvas.getZoom() * 100).toFixed(1);

    if (autoCenter) {
      this.updateCanvas();
    } else {
      this.updateCanvas(
        false,
        {x: bb.x * zoomlevel + (bb.width * zoomlevel) / 2, y: bb.y * zoomlevel + (bb.height * zoomlevel) / 2}
      );
    }

    if (this.svgCanvas.getMode() === 'zoom' && bb.width) {
      // Go to select if a zoom box was drawn
      this.leftPanelHandlers.clickSelect();
    }

    this.zoomDone();
  }

  /**
   * @param {external:Window} win
   * @param {module:svgcanvas.SvgCanvas#event:contextset} context
   * @listens module:svgcanvas.SvgCanvas#event:contextset
   * @returns {void}
   */
  contextChanged (win, context) {
    let linkStr = '';
    if (context) {
      let str = '';
      linkStr = '<a href="#" data-root="y">' + this.svgCanvas.getCurrentDrawing().getCurrentLayerName() + '</a>';

      $(context).parentsUntil('#svgcontent > g').andSelf().each(() => {
        if (this.id) {
          str += ' > ' + this.id;
          linkStr += (this !== context) ? ` > <a href="#">${this.id}</a>` : ` > ${this.id}`;
        }
      });

      this.curContext = str;
    } else {
      this.curContext = null;
    }
    $('#cur_context_panel').toggle(Boolean(context)).html(linkStr);

    this.updateTitle();
  }

  /**
   * @param {external:Window} win
   * @param {module:svgcanvas.SvgCanvas#event:extension_added} ext
   * @listens module:svgcanvas.SvgCanvas#event:extension_added
   * @returns {Promise<void>|void} Resolves to `undefined`
   */
  async extAdded (win, ext) {
    if (!ext) {
      return undefined;
    }
    let cbCalled = false;

    if (ext.langReady && this.langChanged) { // We check for this since the "lang" pref could have been set by storage
      const lang = this.pref('lang');
      await ext.langReady({lang});
    }

    /**
    *
    * @returns {void}
    */
    const runCallback = () => {
      if (ext.callback && !cbCalled) {
        cbCalled = true;
        ext.callback.call(editor);
      }
    };

    /**
    * @typedef {PlainObject} module:SVGthis.ContextTool
    * @property {string} panel The ID of the existing panel to which the tool is being added. Required.
    * @property {string} id The ID of the actual tool element. Required.
    * @property {PlainObject<string, external:jQuery.Function>|PlainObject<"change", external:jQuery.Function>} events DOM event names keyed to associated functions. Example: `{change () { seAlert('Option was changed') } }`. "change" event is one specifically handled for the "button-select" type. Required.
    * @property {string} title The tooltip text that will appear when the user hovers over the tool. Required.
    * @property {"tool_button"|"select"|"button-select"|"input"|string} type The type of tool being added. Expected.
    * @property {PlainObject<string, string>} [options] List of options and their labels for select tools. Example: `{1: 'One', 2: 'Two', all: 'All' }`. Required by "select" tools.
    * @property {string} [container_id] The ID to be given to the tool's container element.
    * @property {string} [defval] Default value
    * @property {string|Integer} [colnum] Added as part of the option list class.
    * @property {string} [label] Label associated with the tool, visible in the UI
    * @property {Integer} [size] Value of the "size" attribute of the tool input
    */
    if (ext.context_tools) {
      $.each(ext.context_tools, function (i, tool) {
        // Add select tool
        const contId = tool.container_id ? (' id="' + tool.container_id + '"') : '';

        let panel = $('#' + tool.panel);
        // create the panel if it doesn't exist
        if (!panel.length) {
          panel = $('<div>', {id: tool.panel}).appendTo('#tools_top');
        }

        let html;
        // TODO: Allow support for other types, or adding to existing tool
        switch (tool.type) {
        case 'tool_button': {
          html = '<div class="tool_button">' + tool.id + '</div>';
          const div = $(html).appendTo(panel);
          if (tool.events) {
            $.each(tool.events, function (evt, func) {
              $(div).bind(evt, func);
            });
          }
          break;
        } case 'select': {
          html = '<label' + contId + '>' +
            '<select id="' + tool.id + '">';
          $.each(tool.options, function (val, text) {
            const sel = (val === tool.defval) ? ' selected' : '';
            html += '<option value="' + val + '"' + sel + '>' + text + '</option>';
          });
          html += '</select></label>';
          // Creates the tool, hides & adds it, returns the select element
          const sel = $(html).appendTo(panel).find('select');

          $.each(tool.events, function (evt, func) {
            $(sel).bind(evt, func);
          });
          break;
        } case 'button-select': {
          html = '<div id="' + tool.id + '" class="dropdown toolset" title="' + tool.title + '">' +
            '<div id="cur_' + tool.id + '" class="icon_label"></div><button></button></div>';

          const list = $('<ul id="' + tool.id + '_opts"></ul>').appendTo('#option_lists');

          if (tool.colnum) {
            list.addClass('optcols' + tool.colnum);
          }

          // Creates the tool, hides & adds it, returns the select element
          /* const dropdown = */ $(html).appendTo(panel).children();
          break;
        } case 'input': {
          html = '<label' + contId + '>' +
            '<span id="' + tool.id + '_label">' +
            tool.label + ':</span>' +
            '<input id="' + tool.id + '" title="' + tool.title +
            '" size="' + (tool.size || '4') +
            '" value="' + (tool.defval || '') + '" type="text"/></label>';

          // Creates the tool, hides & adds it, returns the select element

          // Add to given tool.panel
          const inp = $(html).appendTo(panel).find('input');

          if (tool.events) {
            $.each(tool.events, function (evt, func) {
              inp.bind(evt, func);
            });
          }
          break;
        } default:
          break;
        }
      });
    }

    if (ext.events) {
      this.leftPanelHandlers.add(ext.events.id, ext.events.click);
    }
    return runCallback();
  }

  /*
    this.addDropDown('#font_family_dropdown', () => {
      $('#font_family').val($(this).text()).change();
    });
  */
  /**
  * @param {Float} multiplier
  * @returns {void}
  */
  zoomImage (multiplier) {
    const resolution = this.svgCanvas.getResolution();
    multiplier = multiplier ? resolution.zoom * multiplier : 1;
    // setResolution(res.w * multiplier, res.h * multiplier, true);
    $id('zoom').value = (multiplier * 100).toFixed(1);
    this.svgCanvas.setZoom(multiplier);
    this.zoomDone();
    this.updateCanvas(true);
  }

  /**
  *
  * @returns {void}
  */
  cutSelected () {
    if (!isNullish(this.selectedElement) || this.multiselected) {
      this.svgCanvas.cutSelectedElements();
    }
  }

  /**
  *
  * @returns {void}
  */
  copySelected () {
    if (!isNullish(this.selectedElement) || this.multiselected) {
      this.svgCanvas.copySelectedElements();
    }
  }

  /**
  *
  * @returns {void}
  */
  pasteInCenter () {
    const zoom = this.svgCanvas.getZoom();
    const x = (this.workarea[0].scrollLeft + this.workarea.width() / 2) / zoom - this.svgCanvas.contentW;
    const y = (this.workarea[0].scrollTop + this.workarea.height() / 2) / zoom - this.svgCanvas.contentH;
    this.svgCanvas.pasteElements('point', x, y);
  }

  /**
  * @param {"Up"|"Down"} dir
  * @returns {void}
  */
  moveUpDownSelected (dir) {
    if (!isNullish(this.selectedElement)) {
      this.svgCanvas.moveUpDownSelected(dir);
    }
  }

  /**
  * @param {Float} dx
  * @param {Float} dy
  * @returns {void}
  */
  moveSelected (dx, dy) {
    if (!isNullish(this.selectedElement) || this.multiselected) {
      if (this.configObj.curConfig.gridSnapping) {
        // Use grid snap value regardless of zoom level
        const multi = this.svgCanvas.getZoom() * this.configObj.curConfig.snappingStep;
        dx *= multi;
        dy *= multi;
      }
      this.svgCanvas.moveSelectedElements(dx, dy);
    }
  }

  /**
  *
  * @returns {void}
  */
  selectNext () {
    this.svgCanvas.cycleElement(1);
  }

  /**
  *
  * @returns {void}
  */
  selectPrev () {
    this.svgCanvas.cycleElement(0);
  }

  /**
  * @param {0|1} cw
  * @param {Integer} step
  * @returns {void}
  */
  rotateSelected (cw, step) {
    if (isNullish(this.selectedElement) || this.multiselected) { return; }
    if (!cw) { step *= -1; }
    const angle = Number.parseFloat($('#angle').val()) + step;
    this.svgCanvas.setRotationAngle(angle);
    this.topPanelHandlers.updateContextPanel();
  }

  /**
   * @fires module:svgcanvas.SvgCanvas#event:ext_onNewDocument
   * @returns {void}
   */
  clickClear () {
    const [x, y] = this.configObj.curConfig.dimensions;
    const ok = seConfirm(this.uiStrings.notification.QwantToClear);
    if (!ok) {
      return;
    }
    this.leftPanelHandlers.clickSelect();
    this.svgCanvas.clear();
    this.svgCanvas.setResolution(x, y);
    this.updateCanvas(true);
    this.zoomImage();
    this.layersPanel.populateLayers();
    this.topPanelHandlers.updateContextPanel();
    this.svgCanvas.runExtensions('onNewDocument');
  }

  /**
  *
  * @returns {void}
  */
  clickSave () {
    // In the future, more options can be provided here
    const saveOpts = {
      images: this.pref('img_save'),
      round_digits: 6
    };
    this.svgCanvas.save(saveOpts);
  }

  /**
  *
  * @returns {Promise<void>} Resolves to `undefined`
  */
  async clickExport () {
    const imgType = await seSelect('Select an image type for export: ', [
      // See http://kangax.github.io/jstests/toDataUrl_mime_type_test/ for a useful list of MIME types and browser support
      // 'ICO', // Todo: Find a way to preserve transparency in SVG-Edit if not working presently and do full packaging for x-icon; then switch back to position after 'PNG'
      'PNG',
      'JPEG', 'BMP', 'WEBP', 'PDF'
    ]);

    if (!imgType) {
      return;
    }
    // Open placeholder window (prevents popup)
    let exportWindowName;

    /**
     *
     * @returns {void}
     */
    const openExportWindow = () => {
      const {loadingImage} = this.uiStrings.notification;
      if (this.configObj.curConfig.exportWindowType === 'new') {
        this.exportWindowCt++;
      }
      this.exportWindowName = this.configObj.curConfig.canvasName + this.exportWindowCt;
      let popHTML, popURL;
      if (this.loadingURL) {
        popURL = this.loadingURL;
      } else {
        popHTML = `<!DOCTYPE html><html>
          <head>
            <meta charset="utf-8">
            <title>${loadingImage}</title>
          </head>
          <body><h1>${loadingImage}</h1></body>
        <html>`;
        if (typeof URL !== 'undefined' && URL.createObjectURL) {
          const blob = new Blob([popHTML], {type: 'text/html'});
          popURL = URL.createObjectURL(blob);
        } else {
          popURL = 'data:text/html;base64;charset=utf-8,' + encode64(popHTML);
        }
        this.loadingURL = popURL;
      }
      this.exportWindow = window.open(popURL, this.exportWindowName);
    };
    const chrome = isChrome();
    if (imgType === 'PDF') {
      if (!this.customExportPDF && !chrome) {
        openExportWindow();
      }
      this.svgCanvas.exportPDF(exportWindowName);
    } else {
      if (!this.customExportImage) {
        openExportWindow();
      }
      const quality = 1; // JFH !!! Number.parseInt($('#image-slider').val()) / 100;
      /* const results = */ await this.svgCanvas.rasterExport(imgType, quality, this.exportWindowName);
    }
  }

  /**
   * By default,  this.svgCanvas.open() is a no-op. It is up to an extension
   *  mechanism (opera widget, etc.) to call `setCustomHandlers()` which
   *  will make it do something.
   * @returns {void}
   */
  clickOpen () {
    this.svgCanvas.open();
  }

  /**
  *
  * @returns {void}
  */
  // eslint-disable-next-line class-methods-use-this
  clickImport () {
    /* empty fn */
  }

  /**
  *
  * @returns {void}
  */
  showDocProperties () {
    if (this.docprops) { return; }
    this.docprops = true;
    const $imgDialog = document.getElementById('se-img-prop');

    // update resolution option with actual resolution
    const resolution = this.svgCanvas.getResolution();
    if (this.configObj.curConfig.baseUnit !== 'px') {
      resolution.w = convertUnit(resolution.w) + this.configObj.curConfig.baseUnit;
      resolution.h = convertUnit(resolution.h) + this.configObj.curConfig.baseUnit;
    }
    $imgDialog.setAttribute('save', this.pref('img_save'));
    $imgDialog.setAttribute('width', resolution.w);
    $imgDialog.setAttribute('height', resolution.h);
    $imgDialog.setAttribute('title', this.svgCanvas.getDocumentTitle());
    $imgDialog.setAttribute('dialog', 'open');
  }

  /**
  *
  * @returns {void}
  */
  showPreferences () {
    if (this.preferences) { return; }
    this.preferences = true;
    const $editDialog = document.getElementById('se-edit-prefs');
    $('#main_menu').hide();
    // Update background color with current one
    const canvasBg = this.configObj.curPrefs.bkgd_color;
    const url = this.pref('bkgd_url');
    if (url) {
      $editDialog.setAttribute('bgurl', url);
    }
    $editDialog.setAttribute('gridsnappingon', this.configObj.curConfig.gridSnapping);
    $editDialog.setAttribute('gridsnappingstep', this.configObj.curConfig.snappingStep);
    $editDialog.setAttribute('gridcolor', this.configObj.curConfig.gridColor);
    $editDialog.setAttribute('canvasbg', canvasBg);
    $editDialog.setAttribute('dialog', 'open');
  }

  /**
  *
  * @returns {void}
  */
  // eslint-disable-next-line class-methods-use-this
  openHomePage () {
    window.open(homePage, '_blank');
  }

  /**
  *
  * @returns {void}
  */
  // eslint-disable-next-line class-methods-use-this
  hideSourceEditor () {
    const $editorDialog = document.getElementById('se-svg-editor-dialog');
    $editorDialog.setAttribute('dialog', 'closed');
  }

  /**
  * @param {Event} e
  * @returns {void} Resolves to `undefined`
  */
  saveSourceEditor (e) {
    const $editorDialog = document.getElementById('se-svg-editor-dialog');
    if ($editorDialog.getAttribute('dialog') !== 'open') return;
    const saveChanges = () => {
      this.svgCanvas.clearSelection();
      this.hideSourceEditor();
      this.zoomImage();
      this.layersPanel.populateLayers();
      this.updateTitle();
    };

    if (!this.svgCanvas.setSvgString(e.detail.value)) {
      const ok = seConfirm(this.uiStrings.notification.QerrorsRevertToSource);
      if (!ok) {
        return;
      }
      saveChanges();
      return;
    }
    saveChanges();
    this.leftPanelHandlers.clickSelect();
  }

  /**
  *
  * @returns {void}
  */
  hideDocProperties () {
    const $imgDialog = document.getElementById('se-img-prop');
    $imgDialog.setAttribute('dialog', 'close');
    $imgDialog.setAttribute('save', this.pref('img_save'));
    this.docprops = false;
  }

  /**
  *
  * @returns {void}
  */
  hidePreferences () {
    const $editDialog = document.getElementById('se-edit-prefs');
    $editDialog.setAttribute('dialog', 'close');
    this.preferences = false;
  }

  /**
  * @param {Event} e
  * @returns {boolean} Whether there were problems saving the document properties
  */
  saveDocProperties (e) {
    // set title
    const {title, w, h, save} = e.detail;
    // set document title
    this.svgCanvas.setDocumentTitle(title);

    if (w !== 'fit' && !isValidUnit('width', w)) {
      seAlert(this.uiStrings.notification.invalidAttrValGiven);
      return false;
    }
    if (h !== 'fit' && !isValidUnit('height', h)) {
      seAlert(this.uiStrings.notification.invalidAttrValGiven);
      return false;
    }
    if (!this.svgCanvas.setResolution(w, h)) {
      seAlert(this.uiStrings.notification.noContentToFitTo);
      return false;
    }
    // Set image save option
    this.pref('img_save', save);
    this.updateCanvas();
    this.hideDocProperties();
    return true;
  }

  /**
  * Save user preferences based on current values in the UI.
  * @param {Event} e
  * @function module:SVGthis.savePreferences
  * @returns {Promise<void>}
  */
  async savePreferences (e) {
    const {lang, bgcolor, bgurl, gridsnappingon, gridsnappingstep, gridcolor, showrulers, baseunit} = e.detail;
    // Set background
    this.setBackground(bgcolor, bgurl);

    // set language
    if (lang && lang !== this.pref('lang')) {
      const {langParam, langData} = await this.putLocale(lang, this.goodLangs);
      await this.setLang(langParam, langData);
    }

    // set grid setting
    this.configObj.curConfig.gridSnapping = gridsnappingon;
    this.configObj.curConfig.snappingStep = gridsnappingstep;
    this.configObj.curConfig.gridColor = gridcolor;
    this.configObj.curConfig.showRulers = showrulers;

    $('#rulers').toggle(this.configObj.curConfig.showRulers);
    if (this.configObj.curConfig.showRulers) { this.rulers.updateRulers(); }
    this.configObj.curConfig.baseUnit = baseunit;
    this.svgCanvas.setConfig(this.configObj.curConfig);
    this.updateCanvas();
    this.hidePreferences();
  }

  /**
  * @param {Event} e
  * @returns {void} Resolves to `undefined`
  */
  cancelOverlays (e) {
    $('#dialog_box').hide();
    const $editorDialog = document.getElementById('se-svg-editor-dialog');
    const editingsource = $editorDialog.getAttribute('dialog') === 'open';
    if (!editingsource && !this.docprops && !this.preferences) {
      if (this.curContext) {
        this.svgCanvas.leaveContext();
      }
      return;
    }

    if (editingsource) {
      const origSource = this.svgCanvas.getSvgString();
      if (origSource !== e.detail.value) {
        const ok = seConfirm(this.uiStrings.notification.QignoreSourceChanges);
        if (ok) {
          this.hideSourceEditor();
        }
      } else {
        this.hideSourceEditor();
      }
    }
  }

  /**
   * @returns {void}
   */
  enableOrDisableClipboard () {
    let svgeditClipboard;
    try {
      svgeditClipboard = this.localStorage.getItem('svgedit_clipboard');
    } catch (err) {}
    this.canvMenu.setAttribute((svgeditClipboard ? 'en' : 'dis') + 'ablemenuitems', '#paste,#paste_in_place');
  }

  /**
   * @function module:SVGthis.openPrep
   * @returns {boolean|Promise<boolean>} Resolves to boolean indicating `true` if there were no changes
   *  and `false` after the user confirms.
   */
  openPrep () {
    $('#main_menu').hide();
    if (this.undoMgr.getUndoStackSize() === 0) {
      return true;
    }
    return seConfirm(this.uiStrings.notification.QwantToOpen);
  }

  /**
   *
   * @param {Event} e
   * @returns {void}
   */
  // eslint-disable-next-line class-methods-use-this
  onDragEnter (e) {
    e.stopPropagation();
    e.preventDefault();
    // and indicator should be displayed here, such as "drop files here"
  }

  /**
   *
   * @param {Event} e
   * @returns {void}
   */
  // eslint-disable-next-line class-methods-use-this
  onDragOver (e) {
    e.stopPropagation();
    e.preventDefault();
  }

  /**
   *
   * @param {Event} e
   * @returns {void}
   */
  // eslint-disable-next-line class-methods-use-this
  onDragLeave (e) {
    e.stopPropagation();
    e.preventDefault();
    // hypothetical indicator should be removed here
  }

  /**
  * @function module:SVGthis.setLang
  * @param {string} lang The language code
  * @param {module:locale.LocaleStrings} allStrings See {@tutorial LocaleDocs}
  * @fires module:svgcanvas.SvgCanvas#event:ext_langReady
  * @fires module:svgcanvas.SvgCanvas#event:ext_langChanged
  * @returns {void} A Promise which resolves to `undefined`
  */
  setLang (lang, allStrings) {
    this.langChanged = true;
    this.pref('lang', lang);
    const $editDialog = document.getElementById('se-edit-prefs');
    $editDialog.setAttribute('lang', lang);
    if (!allStrings) {
      return;
    }
    // Todo: Remove `allStrings.lang` property in locale in
    //   favor of just `lang`?
    document.documentElement.lang = allStrings.lang; // lang;
    // Todo: Add proper RTL Support!
    // Todo: Use RTL detection instead and take out of locales?
    // document.documentElement.dir = allStrings.dir;
    $.extend(this.uiStrings, allStrings);

    // const notif = allStrings.notification; // Currently unused
    // $.extend will only replace the given strings
    const oldLayerName = $('#layerlist tr.layersel td.layername').text();
    const renameLayer = (oldLayerName === this.uiStrings.common.layer + ' 1');

    this.svgCanvas.setUiStrings(allStrings);
    this.setTitles();

    if (renameLayer) {
      this.svgCanvas.renameCurrentLayer(this.uiStrings.common.layer + ' 1');
      this.layersPanel.populateLayers();
    }

    this.svgCanvas.runExtensions('langChanged', /** @type {module:svgcanvas.SvgCanvas#event:ext_langChanged} */ lang);

    // Copy title for certain tool elements
    this.elems = {
      '#stroke_color': '#tool_stroke .icon_label, #tool_stroke .color_block',
      '#fill_color': '#tool_fill label, #tool_fill .color_block',
      '#linejoin_miter': '#cur_linejoin',
      '#linecap_butt': '#cur_linecap'
    };

    $.each(this.elems, function (source, dest) {
      $(dest).attr('title', $(source)[0].title);
    });

    // Copy alignment titles
    $('#multiselected_panel div[id^=tool_align]').each(() => {
      $('#tool_pos' + this.id.substr(10))[0].title = this.title;
    });
  }

  /**
* @callback module:SVGthis.ReadyCallback
* @returns {Promise<void>|void}
*/
  /**
* Queues a callback to be invoked when the editor is ready (or
*   to be invoked immediately if it is already ready--i.e.,
*   if `runCallbacks` has been run).
* @function module:SVGthis.ready
* @param {module:SVGthis.ReadyCallback} cb Callback to be queued to invoke
* @returns {Promise<ArbitraryCallbackResult>} Resolves when all callbacks, including the supplied have resolved
*/
  ready (cb) { // eslint-disable-line promise/prefer-await-to-callbacks
    return new Promise((resolve, reject) => { // eslint-disable-line promise/avoid-new
      if (this.isReady) {
        resolve(cb()); // eslint-disable-line node/callback-return, promise/prefer-await-to-callbacks
        return;
      }
      this.callbacks.push([cb, resolve, reject]);
    });
  }

  /**
* Invokes the callbacks previous set by `svgthis.ready`
* @function module:SVGthis.runCallbacks
* @returns {Promise<void>} Resolves to `undefined` if all callbacks succeeded and rejects otherwise
*/
  async runCallbacks () {
    try {
      await Promise.all(this.callbacks.map(([cb]) => {
        return cb(); // eslint-disable-line promise/prefer-await-to-callbacks
      }));
    } catch (err) {
      this.callbacks.forEach(([, , reject]) => {
        reject();
      });
      throw err;
    }
    this.callbacks.forEach(([, resolve]) => {
      resolve();
    });
    this.isReady = true;
  }

  /**
 * @function module:SVGthis.loadFromString
 * @param {string} str The SVG string to load
 * @param {PlainObject} [opts={}]
 * @param {boolean} [opts.noAlert=false] Option to avoid alert to user and instead get rejected promise
 * @returns {Promise<void>}
 */
  loadFromString (str, {noAlert} = {}) {
    return this.ready(async () => {
      try {
        await this.loadSvgString(str, {noAlert});
      } catch (err) {
        if (noAlert) {
          throw err;
        }
      }
    });
  }

  /**
 * @callback module:SVGthis.URLLoadCallback
 * @param {boolean} success
 * @returns {void}
 */
  /**
 * @function module:SVGthis.loadFromURL
 * @param {string} url URL from which to load an SVG string via Ajax
 * @param {PlainObject} [opts={}] May contain properties: `cache`, `callback`
 * @param {boolean} [opts.cache]
 * @param {boolean} [opts.noAlert]
 * @returns {Promise<void>} Resolves to `undefined` or rejects upon bad loading of
 *   the SVG (or upon failure to parse the loaded string) when `noAlert` is
 *   enabled
 */
  loadFromURL (url, {cache, noAlert} = {}) {
    return this.ready(() => {
      return new Promise((resolve, reject) => { // eslint-disable-line promise/avoid-new
        $.ajax({
          url,
          dataType: 'text',
          cache: Boolean(cache),
          beforeSend () {
            $.process_cancel(this.uiStrings.notification.loadingImage);
          },
          success (str) {
            this.loadSvgString(str, {noAlert});
          },
          error (xhr, stat, err) {
            if (xhr.status !== 404 && xhr.responseText) {
              this.loadSvgString(xhr.responseText, {noAlert});
              return;
            }
            if (noAlert) {
              reject(new Error('URLLoadFail'));
              return;
            }
            seAlert(this.uiStrings.notification.URLLoadFail + ': \n' + err);
            resolve();
          },
          complete () {
            $('#dialog_box').hide();
          }
        });
      });
    });
  }

  /**
* @function module:SVGthis.loadFromDataURI
* @param {string} str The Data URI to base64-decode (if relevant) and load
* @param {PlainObject} [opts={}]
* @param {boolean} [opts.noAlert]
* @returns {Promise<void>} Resolves to `undefined` and rejects if loading SVG string fails and `noAlert` is enabled
*/
  loadFromDataURI (str, {noAlert} = {}) {
    return this.ready(() => {
      let base64 = false;
      let pre = str.match(/^data:image\/svg\+xml;base64,/);
      if (pre) {
        base64 = true;
      } else {
        pre = str.match(/^data:image\/svg\+xml(?:;|;utf8)?,/);
      }
      if (pre) {
        pre = pre[0];
      }
      const src = str.slice(pre.length);
      return this.loadSvgString(base64 ? decode64(src) : decodeURIComponent(src), {noAlert});
    });
  }

  /**
 * @function module:SVGthis.addExtension
 * @param {string} name Used internally; no need for i18n.
 * @param {module:svgcanvas.ExtensionInitCallback} init Config to be invoked on this module
 * @param {module:svgcanvas.ExtensionInitArgs} initArgs
 * @throws {Error} If called too early
 * @returns {Promise<void>} Resolves to `undefined`
*/
  addExtension (name, init, initArgs) {
  // Note that we don't want this on this.ready since some extensions
  // may want to run before then (like server_opensave).
    if (!this.svgCanvas) {
      throw new Error('Extension added too early');
    }
    return this.svgCanvas.addExtension.call(this, name, init, initArgs);
  }
}

const editor = new Editor();
editor.init();

let extensionsAdded = false;
const messageQueue = [];
/**
 * @param {PlainObject} info
 * @param {any} info.data
 * @param {string} info.origin
 * @fires module:svgcanvas.SvgCanvas#event:message
 * @returns {void}
 */
const messageListener = ({data, origin}) => { // eslint-disable-line no-shadow
  // console.log('data, origin, extensionsAdded', data, origin, extensionsAdded);
  const messageObj = {data, origin};
  if (!extensionsAdded) {
    messageQueue.push(messageObj);
  } else {
    // Extensions can handle messages at this stage with their own
    //  canvas `message` listeners
    this.svgCanvas.call('message', messageObj);
  }
};
window.addEventListener('message', messageListener);
export default editor;
