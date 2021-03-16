/* eslint-disable max-len */
/* globals jQuery seConfirm seAlert */
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
import {isMac} from '../common/browser.js';

import SvgCanvas from '../svgcanvas/svgcanvas.js';
import ConfigObj from './ConfigObj.js';

import {
  readLang, putLocale,
  setStrings
} from './locale.js';

import EditorStartup from './EditorStartup.js';
import LeftPanel from './panels/LeftPanel.js';
import TopPanel from './panels/TopPanel.js';
import BottomPanel from './panels/BottomPanel.js';
import LayersPanel from './panels/LayersPanel.js';
import MainMenu from './MainMenu.js';

const {$id, $qa, isNullish, encode64, decode64, blankPageObjectURL} = SvgCanvas;

/**
 *
 */
class Editor extends EditorStartup {
  /**
   *
   */
  constructor () {
    super();
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
    this.flyoutFuncs = {};
    this.uiStrings = {};
    this.svgCanvas = null;
    this.isReady = false;
    this.customExportImage = false;
    this.customExportPDF = false;
    this.configObj = new ConfigObj(this);
    this.configObj.pref = this.configObj.pref.bind(this.configObj);
    this.setConfig = this.configObj.setConfig.bind(this.configObj);
    this.callbacks = [];
    this.curContext = null;
    this.exportWindowName = null;
    this.docprops = false;
    this.configObj.preferences = false;
    this.canvMenu = null;
    // eslint-disable-next-line max-len
    this.goodLangs = ['ar', 'cs', 'de', 'en', 'es', 'fa', 'fr', 'fy', 'hi', 'it', 'ja', 'nl', 'pl', 'pt-BR', 'ro', 'ru', 'sk', 'sl', 'zh-CN', 'zh-TW'];
    const modKey = (isMac() ? 'meta+' : 'ctrl+');
    const curObj = this;
    this.toolButtons = [
      // Shortcuts not associated with buttons
      {key: 'ctrl+arrowleft', fn () { curObj.rotateSelected(0, 1);}},
      {key: 'ctrl+arrowright', fn () { curObj.rotateSelected(1, 1); }},
      {key: 'ctrl+shift+arrowleft', fn () { curObj.rotateSelected(0, 5); }},
      {key: 'ctrl+shift+arrowright', fn () { curObj.rotateSelected(1, 5); }},
      {key: 'shift+o', fn () { curObj.svgCanvas.cycleElement(0); }},
      {key: 'shift+p', fn () { curObj.svgCanvas.cycleElement(1); }},
      {key: 'tab', fn () { curObj.svgCanvas.cycleElement(0); }},
      {key: 'shift+tab', fn () { curObj.svgCanvas.cycleElement(1); }},
      {key: [modKey + 'arrowup', true], fn () { curObj.zoomImage(2); }},
      {key: [modKey + 'arrowdown', true], fn () { curObj.zoomImage(0.5); }},
      {key: [modKey + ']', true], fn () { curObj.moveUpDownSelected('Up'); }},
      {key: [modKey + '[', true], fn () { curObj.moveUpDownSelected('Down'); }},
      {key: ['arrowup', true], fn () { curObj.moveSelected(0, -1); }},
      {key: ['arrowdown', true], fn () { curObj.moveSelected(0, 1); }},
      {key: ['arrowleft', true], fn () { curObj.moveSelected(-1, 0); }},
      {key: ['arrowright', true], fn () { curObj.moveSelected(1, 0); }},
      {key: 'shift+arrowup', fn () { curObj.moveSelected(0, -10); }},
      {key: 'shift+arrowdown', fn () { curObj.moveSelected(0, 10); }},
      {key: 'shift+arrowleft', fn () { curObj.moveSelected(-10, 0); }},
      {key: 'shift+arrowright', fn () { curObj.moveSelected(10, 0); }},
      {key: ['alt+arrowup', true], fn () { curObj.svgCanvas.cloneSelectedElements(0, -1); }},
      {key: ['alt+arrowdown', true], fn () { curObj.svgCanvas.cloneSelectedElements(0, 1); }},
      {key: ['alt+arrowleft', true], fn () { curObj.svgCanvas.cloneSelectedElements(-1, 0); }},
      {key: ['alt+arrowright', true], fn () { curObj.svgCanvas.cloneSelectedElements(1, 0); }},
      {key: ['alt+shift+arrowup', true], fn () { curObj.svgCanvas.cloneSelectedElements(0, -10); }},
      {key: ['alt+shift+arrowdown', true], fn () { curObj.svgCanvas.cloneSelectedElements(0, 10); }},
      {key: ['alt+shift+arrowleft', true], fn () { curObj.svgCanvas.cloneSelectedElements(-10, 0); }},
      {key: ['alt+shift+arrowright', true], fn () { curObj.svgCanvas.cloneSelectedElements(10, 0); }},
      {key: 'a', fn () { curObj.svgCanvas.selectAllInCurrentLayer(); }},
      {key: modKey + 'a', fn () { curObj.svgCanvas.selectAllInCurrentLayer(); }},
      {key: modKey + 'x', fn () { curObj.cutSelected(); }},
      {key: modKey + 'c', fn () { curObj.copySelected(); }},
      {key: modKey + 'v', fn () { curObj.pasteInCenter(); }}
    ];
    this.leftPanel = new LeftPanel(this);
    this.bottomPanel = new BottomPanel(this);
    this.topPanel = new TopPanel(this);
    this.layersPanel = new LayersPanel(this);
    this.mainMenu = new MainMenu(this);
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
        this.svgCanvas.open = opts.open.bind(this);
      }
      if (opts.save) {
        this.showSaveWarning = false;
        this.svgCanvas.bind('saved', opts.save.bind(this));
      }
      if (opts.exportImage) {
        this.customExportImage = opts.exportImage.bind(this);
        this.svgCanvas.bind('exported', this.customExportImage); // canvg and our RGBColor will be available to the method
      }
      if (opts.exportPDF) {
        this.customExportPDF = opts.exportPDF.bind(this);
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
      const key = `${(e.altKey) ? 'alt+' : ''}${(e.shiftKey) ? 'shift+' : ''}${(e.metaKey) ? 'meta+' : ''}${(e.ctrlKey) ? 'ctrl+' : ''}${e.key.toLowerCase()}`;
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
  * Expose the `uiStrings`.
  * @function module:SVGthis.canvas.getUIStrings
  * @returns {module:SVGthis.uiStrings}
  */
  getUIStrings () {
    return this.uiStrings;
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
    const done = this.configObj.pref('export_notice_done');
    if (done !== 'all') {
      let note = this.uiStrings.notification.saveFromBrowser.replace('%s', data.type);

      // Check if there are issues
      if (issues.length) {
        const pre = '\n \u2022 ';
        note += ('\n\n' + this.uiStrings.notification.noteTheseIssues + pre + issues.join(pre));
      }

      // Note that this will also prevent the notice even though new issues may appear later.
      // May want to find a way to deal with that without annoying the user
      this.configObj.pref('export_notice_done', 'all');
      seAlert(note);
    }
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
      $id("image_url").style.display = 'none';
      $id("change_image_url").style.display = 'block';
    } else {
      // regular URL
      this.svgCanvas.embedImage(url, function (dataURI) {
        // Couldn't embed, so show warning
        $('#url_notice').toggle(!dataURI);
        this.defaultImageURL = url;
      });
      $id("image_url").style.display = 'block';
      $id("change_image_url").style.display = 'none';
    }
  }

  /**
   *
   * @param {string} color
   * @param {string} url
   * @returns {void}
   */
  setBackground (color, url) {
    // if (color == this.configObj.pref('bkgd_color') && url == this.configObj.pref('bkgd_url')) { return; }
    this.configObj.pref('bkgd_color', color);
    this.configObj.pref('bkgd_url', url, true);

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
    const cnvs = $id("svgcanvas");

    let w = parseFloat(getComputedStyle(this.workarea, null).width.replace("px", "")), h = parseFloat(getComputedStyle(this.workarea, null).height.replace("px", ""));
    const wOrig = w, hOrig = h;
    const oldCtr = {
      x: wArea.scrollLeft + wOrig / 2,
      y: wArea.scrollTop + hOrig / 2
    };
    const multi = this.configObj.curConfig.canvas_expansion;
    w = Math.max(wOrig, this.svgCanvas.contentW * zoom * multi);
    h = Math.max(hOrig, this.svgCanvas.contentH * zoom * multi);

    if (w === wOrig && h === hOrig) {
      this.workarea.style.overflow = 'hidden';
    } else {
      this.workarea.style.overflow = 'scroll';
    }

    const oldCanY = parseFloat(getComputedStyle(cnvs, null).height.replace("px", "")) / 2;
    const oldCanX = parseFloat(getComputedStyle(cnvs, null).width.replace("px", "")) / 2;
    
    cnvs.style.width = w + "px";
    cnvs.style.height = h + "px";
    const newCanY = h / 2;
    const newCanX = w / 2;
    const offset = this.svgCanvas.updateCanvas(w, h);

    const ratio = newCanX / oldCanX;

    const scrollX = w / 2 - wOrig / 2;
    const scrollY = h / 2 - hOrig / 2;

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
      if (this.svgCanvas.contentW > parseFloat(getComputedStyle(wArea, null).width.replace("px", ""))) {
        // Top-left
        this.workarea.scrollLeft = offset.x - 10;
        this.workarea.scrollTop = offset.y - 10;
      } else {
        // Center
        wArea.scrollLeft = scrollX;
        wArea.scrollTop = scrollY;
      }
    } else {
      wArea.scrollLeft = newCtr.x - wOrig / 2;
      wArea.scrollTop = newCtr.y - hOrig / 2;
    }
    if (this.configObj.curConfig.showRulers) {
      this.rulers.updateRulers(cnvs, zoom);
      this.workarea.scroll();
    }

    if (this.configObj.urldata.storagePrompt !== true && this.storagePromptState === 'ignore') {
      if($id("dialog_box") != null) $id("dialog_box").style.display = 'none';      
    }
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
    if(document.querySelectorAll("#wireframe_rules").length > 0){
      document.querySelector("#wireframe_rules").textContent = (this.workarea.classList.contains('wireframe') ? rule : '');
    }
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
      this.leftPanel.clickSelect();
    }
    const isNode = mode === 'pathedit';
    // if this.elems[1] is present, then we have more than one element
    this.selectedElement = (elems.length === 1 || isNullish(elems[1]) ? elems[0] : null);
    this.multiselected = (elems.length >= 2 && !isNullish(elems[1]));
    if (!isNullish(this.selectedElement) && !isNode) {
      this.topPanel.update();
    } // if (!isNullish(elem))

    // Deal with pathedit mode
    this.togglePathEditMode(isNode, elems);
    this.topPanel.updateContextPanel();
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
      this.leftPanel.clickSelect();
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
    this.topPanel.updateContextPanel();

    // In the event a gradient was flipped:
    if (this.selectedElement && mode === 'select') {
      this.bottomPanel.updateColorpickers();
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
    const zInfo = this.svgCanvas.setBBoxZoom(bbox, parseFloat(getComputedStyle(wArea, null).width.replace("px", "")) - scrbar, parseFloat(getComputedStyle(wArea, null).height.replace("px", "")) - scrbar);
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
      this.leftPanel.clickSelect();
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
  * @function module:SVGEditor.setIcon
  * @param {string|Element|external:jQuery} elem
  * @param {string|external:jQuery} iconId
  * @returns {void}
  */
  setIcon (elem, iconId) {
    // eslint-disable-next-line max-len
    const icon = (typeof iconId === 'string') ? $('<img src="' + this.configObj.curConfig.imgPath + iconId + '">') : iconId.clone();
    if (!icon) {
      // Todo: Investigate why this still occurs in some cases
      console.log('NOTE: Icon image missing: ' + iconId); 
      return;
    }
    $(elem).empty().append(icon);
  }

  /**
   * @param {external:Window} win
   * @param {module:svgcanvas.SvgCanvas#event:extension_added} ext
   * @listens module:svgcanvas.SvgCanvas#event:extension_added
   * @returns {Promise<void>|void} Resolves to `undefined`
   */
  async extAdded (win, ext) {
   
    const self = this;
    const btnSelects = [];
    if (!ext) {
      return undefined;
    }
    let cbCalled = false;

    if (ext.langReady && this.langChanged) { // We check for this since the "lang" pref could have been set by storage
      const lang = this.configObj.pref('lang');
      await ext.langReady({lang});
    }

    /**
    *
    * @returns {void}
    */
    const runCallback = () => {
      if (ext.callback && !cbCalled) {
        cbCalled = true;
        ext.callback.call(this);
      }
    };

    if (ext.events) {
      this.leftPanel.add(ext.events.id, ext.events.click);
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
  * @function copySelected
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
    const x = (this.workarea.scrollLeft + parseFloat(getComputedStyle(this.workarea, null).width.replace("px", "")) / 2) / zoom - this.svgCanvas.contentW;
    const y = (this.workarea.scrollTop + parseFloat(getComputedStyle(this.workarea, null).height.replace("px", "")) / 2) / zoom - this.svgCanvas.contentH;
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
    this.topPanel.updateContextPanel();
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
  async saveSourceEditor (e) {
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
      const ok = await seConfirm(this.uiStrings.notification.QerrorsRevertToSource);
      if (ok === false || ok === 'Cancel') {
        return;
      }
      saveChanges();
      return;
    }
    saveChanges();
    this.leftPanel.clickSelect();
  }

  /**
  * @param {Event} e
  * @returns {void} Resolves to `undefined`
  */
  cancelOverlays (e) {
    if($id("dialog_box") != null) $id("dialog_box").style.display = 'none';
    const $editorDialog = document.getElementById('se-svg-editor-dialog');
    const editingsource = $editorDialog.getAttribute('dialog') === 'open';
    if (!editingsource && !this.docprops && !this.configObj.preferences) {
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
    } catch (err) {/* empty fn */}
    this.canvMenu.setAttribute((svgeditClipboard ? 'en' : 'dis') + 'ablemenuitems', '#paste,#paste_in_place');
  }

  /**
   * @function module:SVGthis.openPrep
   * @returns {boolean|Promise<boolean>} Resolves to boolean indicating `true` if there were no changes
   *  and `false` after the user confirms.
   */
  async openPrep () {
    if (this.svgCanvas.undoMgr.getUndoStackSize() === 0) {
      return true;
    }
    return await seConfirm(this.uiStrings.notification.QwantToOpen);
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
    this.configObj.pref('lang', lang);
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
      '#stroke_color': '#tool_stroke .color_block',
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
  ready (cb) {
    return new Promise((resolve, reject) => {
      if (this.isReady) {
        resolve(cb());
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
        return cb();
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
      return new Promise((resolve, reject) => {
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
            if($id("dialog_box") != null) $id("dialog_box").style.display = 'none';
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
 * @param {module:svgcanvas.ExtensionInitCallback} initfn Config to be invoked on this module
 * @param {module:svgcanvas.ExtensionInitArgs} initArgs
 * @throws {Error} If called too early
 * @returns {Promise<void>} Resolves to `undefined`
*/
  addExtension (name, initfn, initArgs) {
  // Note that we don't want this on this.ready since some extensions
  // may want to run before then (like server_opensave).
    if (!this.svgCanvas) {
      throw new Error('Extension added too early');
    }
    return this.svgCanvas.addExtension.call(this, name, initfn, initArgs);
  }
}

export default Editor;
