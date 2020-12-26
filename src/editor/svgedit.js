/* eslint-disable no-alert */
/* globals jQuery seSelect */
/**
* The main module for the visual SVG Editor.
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
import {getTypeMap, convertUnit, isValidUnit} from '../common/units.js';
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

import {
  readLang, putLocale,
  setStrings
} from './locale.js';

const {$id, isNullish, encode64, decode64, blankPageObjectURL} = SvgCanvas;

const editor = {
  /**
  * @type {Float}
  */
  tool_scale: 1,
  /**
  * @type {Integer}
  */
  exportWindowCt: 0,
  /**
  * @type {boolean}
  */
  langChanged: false,
  /**
  * @type {boolean}
  */
  showSaveWarning: false,
  /**
   * Will be set to a boolean by `ext-storage.js`
   * @type {"ignore"|"waiting"|"closed"}
  */
  storagePromptState: 'ignore',
  /*
   * EDITOR PUBLIC METHODS
  */
  putLocale,
  readLang,
  setStrings
};

// JFH hotkey is used for text input.
const $ = [jQueryPluginJSHotkeys].reduce((jq, func) => func(jq), jQuery);
const homePage = 'https://github.com/SVG-Edit/svgedit';

const callbacks = [];

/**
* LOCALE.
* @name module:SVGEditor.uiStrings
* @type {PlainObject}
*/
const uiStrings = editor.uiStrings = {};

let svgCanvas,
  isReady = false,
  customExportImage = false,
  customExportPDF = false;

/**
 *
 * @param {string} str SVG string
 * @param {PlainObject} [opts={}]
 * @param {boolean} [opts.noAlert]
 * @throws {Error} Upon failure to load SVG
 */
const loadSvgString = (str, {noAlert} = {}) => {
  const success = svgCanvas.setSvgString(str) !== false;
  if (success) return;
  if (!noAlert) window.alert(uiStrings.notification.errorLoadingSVG);
  throw new Error('Error loading SVG');
};

editor.configObj = new ConfigObj(editor);
editor.pref = editor.configObj.pref.bind(editor.configObj);
editor.setConfig = editor.configObj.setConfig.bind(editor.configObj);
editor.curPrefs = editor.configObj.curPrefs;
editor.curConfig = editor.configObj.curConfig;

/**
* All methods are optional.
* @interface module:SVGEditor.CustomHandler
* @type {PlainObject}
*/
/**
* Its responsibilities are:
*  - invoke a file chooser dialog in 'open' mode
*  - let user pick a SVG file
*  - calls [svgCanvas.setSvgString()]{@link module:svgcanvas.SvgCanvas#setSvgString} with the string contents of that file.
* Not passed any parameters.
* @function module:SVGEditor.CustomHandler#open
* @returns {void}
*/
/**
* Its responsibilities are:
*  - accept the string contents of the current document
*  - invoke a file chooser dialog in 'save' mode
*  - save the file to location chosen by the user.
* @function module:SVGEditor.CustomHandler#save
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
* @function module:SVGEditor.CustomHandler#exportImage
* @param {external:Window} win
* @param {module:svgcanvas.SvgCanvas#event:exported} data
* @listens module:svgcanvas.SvgCanvas#event:exported
* @returns {void}
*/
/**
* @function module:SVGEditor.CustomHandler#exportPDF
* @param {external:Window} win
* @param {module:svgcanvas.SvgCanvas#event:exportedPDF} data
* @listens module:svgcanvas.SvgCanvas#event:exportedPDF
* @returns {void}
*/

/**
* Allows one to override default SVGEdit `open`, `save`, and
* `export` editor behaviors.
* @function module:SVGEditor.setCustomHandlers
* @param {module:SVGEditor.CustomHandler} opts Extension mechanisms may call `setCustomHandlers` with three functions: `opts.open`, `opts.save`, and `opts.exportImage`
* @returns {Promise<void>}
*/
editor.setCustomHandlers = function (opts) {
  return editor.ready(() => {
    if (opts.open) {
      $('#tool_open > input[type="file"]').remove();
      $('#tool_open').show();
      svgCanvas.open = opts.open;
    }
    if (opts.save) {
      editor.showSaveWarning = false;
      svgCanvas.bind('saved', opts.save);
    }
    if (opts.exportImage) {
      customExportImage = opts.exportImage;
      svgCanvas.bind('exported', customExportImage); // canvg and our RGBColor will be available to the method
    }
    if (opts.exportPDF) {
      customExportPDF = opts.exportPDF;
      svgCanvas.bind('exportedPDF', customExportPDF); // jsPDF and our RGBColor will be available to the method
    }
  });
};

/**
 * @function module:SVGEditor.randomizeIds
 * @param {boolean} arg
 * @returns {void}
 */
editor.randomizeIds = (arg) => {
  svgCanvas.randomizeIds(arg);
};

/**
* Auto-run after a Promise microtask.
* @function module:SVGEditor.init
* @returns {void}
*/
editor.init = () => {
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
      editor.storage = localStorage;
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

  editor.configObj.load();

  // eslint-disable-next-line max-len
  const goodLangs = ['ar', 'cs', 'de', 'en', 'es', 'fa', 'fr', 'fy', 'hi', 'it', 'ja', 'nl', 'pl', 'pt-BR', 'ro', 'ru', 'sk', 'sl', 'zh-CN', 'zh-TW'];
  /**
   * @fires module:svgcanvas.SvgCanvas#event:ext_addLangData
   * @fires module:svgcanvas.SvgCanvas#event:ext_langReady
   * @fires module:svgcanvas.SvgCanvas#event:ext_langChanged
   * @fires module:svgcanvas.SvgCanvas#event:extensions_added
   * @returns {Promise<module:locale.LangAndData>} Resolves to result of {@link module:locale.readLang}
   */
  const extAndLocaleFunc = async () => {
    const {langParam, langData} = await editor.putLocale(editor.pref('lang'), goodLangs);
    await setLang(langParam, langData);

    $id('svg_container').style.visibility = 'visible';

    try {
      // load standard extensions
      await Promise.all(
        editor.configObj.curConfig.extensions.map(async (extname) => {
          /**
           * @tutorial ExtensionDocs
           * @typedef {PlainObject} module:SVGEditor.ExtensionObject
           * @property {string} [name] Name of the extension. Used internally; no need for i18n. Defaults to extension name without beginning "ext-" or ending ".js".
           * @property {module:svgcanvas.ExtensionInitCallback} [init]
           */
          try {
            /**
             * @type {module:SVGEditor.ExtensionObject}
             */
            const imported = await import(`./extensions/${encodeURIComponent(extname)}/${encodeURIComponent(extname)}.js`);
            const {name = extname, init} = imported.default;
            return editor.addExtension(name, (init && init.bind(editor)), {$, langParam});
          } catch (err) {
            // Todo: Add config to alert any errors
            console.error('Extension failed to load: ' + extname + '; ', err); // eslint-disable-line no-console
            return undefined;
          }
        })
      );
      // load user extensions (given as pathNames)
      await Promise.all(
        editor.configObj.curConfig.userExtensions.map(async (extPathName) => {
          /**
           * @tutorial ExtensionDocs
           * @typedef {PlainObject} module:SVGEditor.ExtensionObject
           * @property {string} [name] Name of the extension. Used internally; no need for i18n. Defaults to extension name without beginning "ext-" or ending ".js".
           * @property {module:svgcanvas.ExtensionInitCallback} [init]
           */
          try {
            /**
             * @type {module:SVGEditor.ExtensionObject}
             */
            const imported = await import(encodeURI(extPathName));
            const {name, init} = imported.default;
            return editor.addExtension(name, (init && init.bind(editor)), {$, langParam});
          } catch (err) {
            // Todo: Add config to alert any errors
            console.error('Extension failed to load: ' + extPathName + '; ', err); // eslint-disable-line no-console
            return undefined;
          }
        })
      );
      svgCanvas.bind(
        'extensions_added',
        /**
        * @param {external:Window} win
        * @param {module:svgcanvas.SvgCanvas#event:extensions_added} data
        * @listens module:svgcanvas.SvgCanvas#event:extensions_added
        * @returns {void}
        */
        (win, data) => {
          extensionsAdded = true;
          Actions.setAll();

          if (editor.storagePromptState === 'ignore') {
            updateCanvas(true);
          }

          messageQueue.forEach(
            /**
             * @param {module:svgcanvas.SvgCanvas#event:message} messageObj
             * @fires module:svgcanvas.SvgCanvas#event:message
             * @returns {void}
             */
            (messageObj) => {
              svgCanvas.call('message', messageObj);
            }
          );
        }
      );
      svgCanvas.call('extensions_added');
    } catch (err) {
      // Todo: Report errors through the UI
      console.log(err); // eslint-disable-line no-console
    }
  };

  /**
  * @name module:SVGEditor.canvas
  * @type {module:svgcanvas.SvgCanvas}
  */
  editor.canvas = svgCanvas = new SvgCanvas(
    $id('svgcanvas'),
    editor.configObj.curConfig
  );

  editor.leftPanelHandlers = new LeftPanelHandlers(editor);
  editor.bottomPanelHandlers = new BottomPanelHandlers(editor);
  editor.topPanelHandlers = new TopPanelHandlers(editor);
  editor.layersPanel = new LayersPanel(editor);

  const modKey = (isMac() ? 'meta+' : 'ctrl+');
  const {undoMgr} = svgCanvas;
  const workarea = $('#workarea');
  editor.workarea = workarea;
  const canvMenu = document.getElementById('se-cmenu_canvas');
  let exportWindow = null;
  let defaultImageURL = editor.configObj.curConfig.imgPath + 'logo.svg';
  const zoomInIcon = 'crosshair';
  const zoomOutIcon = 'crosshair';
  let uiContext = 'toolbars';

  // For external openers
  (function () {
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
         * @name module:SVGEditor.svgEditorReadyEvent
         * @type {module:SVGEditor#event:svgEditorReadyEvent}
         */
        const svgEditorReadyEvent = new w.CustomEvent('svgEditorReady', {
          bubbles: true,
          cancelable: true
        });
        w.document.documentElement.dispatchEvent(svgEditorReadyEvent);
      } catch (e) {}
    }
  }());

  // Make [1,2,5] array
  const rIntervals = [];
  for (let i = 0.1; i < 1e5; i *= 10) {
    rIntervals.push(i);
    rIntervals.push(2 * i);
    rIntervals.push(5 * i);
  }

  editor.layersPanel.populateLayers();
  editor.selectedElement = null;
  editor.multiselected = false;

  /**
  * @param {boolean} editmode
  * @param {module:svgcanvas.SvgCanvas#event:selected} elems
  * @returns {void}
  */
  const togglePathEditMode = function (editmode, elems) {
    $('#path_node_panel').toggle(editmode);
    if (editmode) {
      // Change select icon
      $('.tool_button_current').removeClass('tool_button_current').addClass('tool_button');
      $('#tool_select').addClass('tool_button_current').removeClass('tool_button');
      editor.multiselected = false;
      if (elems.length) {
        editor.selectedElement = elems[0];
      }
    } else {
      setTimeout(() => {
        // setIcon('#tool_select', 'select');
      }, 1000);
    }
  };

  /**
   * @type {module:svgcanvas.EventHandler}
   * @param {external:Window} wind
   * @param {module:svgcanvas.SvgCanvas#event:saved} svg The SVG source
   * @listens module:svgcanvas.SvgCanvas#event:saved
   * @returns {void}
   */
  const saveHandler = function (wind, svg) {
    editor.showSaveWarning = false;

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
    let done = editor.pref('save_notice_done');

    if (done !== 'all') {
      let note = uiStrings.notification.saveFromBrowser.replace('%s', 'SVG');
      // Check if FF and has <defs/>
      if (isGecko()) {
        if (svg.includes('<defs')) {
          // warning about Mozilla bug #308590 when applicable (seems to be fixed now in Feb 2013)
          note += '\n\n' + uiStrings.notification.defsFailOnSave;
          editor.pref('save_notice_done', 'all');
          done = 'all';
        } else {
          editor.pref('save_notice_done', 'part');
        }
      } else {
        editor.pref('save_notice_done', 'all');
      }
      if (done !== 'part') {
        alert(note);
      }
    }
  };

  /**
   * @param {external:Window} win
   * @param {module:svgcanvas.SvgCanvas#event:exported} data
   * @listens module:svgcanvas.SvgCanvas#event:exported
   * @returns {void}
   */
  const exportHandler = function (win, data) {
    const {issues, exportWindowName} = data;

    exportWindow = window.open(blankPageObjectURL || '', exportWindowName); // A hack to get the window via JSON-able name without opening a new one

    if (!exportWindow || exportWindow.closed) {
      alert(uiStrings.notification.popupWindowBlocked);
      return;
    }

    exportWindow.location.href = data.bloburl || data.datauri;
    const done = editor.pref('export_notice_done');
    if (done !== 'all') {
      let note = uiStrings.notification.saveFromBrowser.replace('%s', data.type);

      // Check if there are issues
      if (issues.length) {
        const pre = '\n \u2022 ';
        note += ('\n\n' + uiStrings.notification.noteTheseIssues + pre + issues.join(pre));
      }

      // Note that this will also prevent the notice even though new issues may appear later.
      // May want to find a way to deal with that without annoying the user
      editor.pref('export_notice_done', 'all');
      exportWindow.alert(note);
    }
  };

  /**
   *
   * @param {Element} opt
   * @param {boolean} changeElem
   * @returns {void}
   */
  function setStrokeOpt (opt, changeElem) {
    const {id} = opt;
    const bits = id.split('_');
    const [pre, val] = bits;

    if (changeElem) {
      svgCanvas.setStrokeAttr('stroke-' + pre, val);
    }
    $(opt).addClass('current').siblings().removeClass('current');
  }

  /**
  * Set a selected image's URL.
  * @function module:SVGEditor.setImageURL
  * @param {string} url
  * @returns {void}
  */
  const setImageURL = editor.setImageURL = function (url) {
    if (!url) {
      url = defaultImageURL;
    }
    svgCanvas.setImageURL(url);
    $('#image_url').val(url);

    if (url.startsWith('data:')) {
      // data URI found
      $('#image_url').hide();
      $('#change_image_url').show();
    } else {
      // regular URL
      svgCanvas.embedImage(url, function (dataURI) {
        // Couldn't embed, so show warning
        $('#url_notice').toggle(!dataURI);
        defaultImageURL = url;
      });
      $('#image_url').show();
      $('#change_image_url').hide();
    }
  };

  /**
   *
   * @param {string} color
   * @param {string} url
   * @returns {void}
   */
  function setBackground (color, url) {
    // if (color == editor.pref('bkgd_color') && url == editor.pref('bkgd_url')) { return; }
    editor.pref('bkgd_color', color);
    editor.pref('bkgd_url', url, true);

    // This should be done in svgcanvas.js for the borderRect fill
    svgCanvas.setBackground(color, url);
  }

  /**
   *
   * @param {HTMLDivElement} [scanvas]
   * @param {Float} [zoom]
   * @returns {void}
   */
  function updateRulers (scanvas, zoom) {
    if (!zoom) { zoom = svgCanvas.getZoom(); }
    if (!scanvas) { scanvas = $('#svgcanvas'); }

    let d, i;
    const limit = 30000;
    const contentElem = svgCanvas.getContentElem();
    const units = getTypeMap();
    const unit = units[editor.configObj.curConfig.baseUnit]; // 1 = 1px

    // draw x ruler then y ruler
    for (d = 0; d < 2; d++) {
      const isX = (d === 0);
      const dim = isX ? 'x' : 'y';
      const lentype = isX ? 'width' : 'height';
      const contentDim = Number(contentElem.getAttribute(dim));

      const $hcanvOrig = $('#ruler_' + dim + ' canvas:first');

      // Bit of a hack to fully clear the canvas in Safari & IE9
      const $hcanv = $hcanvOrig.clone();
      $hcanvOrig.replaceWith($hcanv);

      const hcanv = $hcanv[0];

      // Set the canvas size to the width of the container
      let rulerLen = scanvas[lentype]();
      const totalLen = rulerLen;
      hcanv.parentNode.style[lentype] = totalLen + 'px';
      let ctx = hcanv.getContext('2d');
      let ctxArr, num, ctxArrNum;

      ctx.fillStyle = 'rgb(200,0,0)';
      ctx.fillRect(0, 0, hcanv.width, hcanv.height);

      // Remove any existing canvasses
      $hcanv.siblings().remove();

      // Create multiple canvases when necessary (due to browser limits)
      if (rulerLen >= limit) {
        ctxArrNum = Number.parseInt(rulerLen / limit) + 1;
        ctxArr = [];
        ctxArr[0] = ctx;
        let copy;
        for (i = 1; i < ctxArrNum; i++) {
          hcanv[lentype] = limit;
          copy = hcanv.cloneNode(true);
          hcanv.parentNode.append(copy);
          ctxArr[i] = copy.getContext('2d');
        }

        copy[lentype] = rulerLen % limit;

        // set copy width to last
        rulerLen = limit;
      }

      hcanv[lentype] = rulerLen;

      const uMulti = unit * zoom;

      // Calculate the main number interval
      const rawM = 50 / uMulti;
      let multi = 1;
      for (i = 0; i < rIntervals.length; i++) {
        num = rIntervals[i];
        multi = num;
        if (rawM <= num) {
          break;
        }
      }

      const bigInt = multi * uMulti;

      ctx.font = '9px sans-serif';

      let rulerD = ((contentDim / uMulti) % multi) * uMulti;
      let labelPos = rulerD - bigInt;
      // draw big intervals
      let ctxNum = 0;
      while (rulerD < totalLen) {
        labelPos += bigInt;
        // const realD = rulerD - contentDim; // Currently unused

        const curD = Math.round(rulerD) + 0.5;
        if (isX) {
          ctx.moveTo(curD, 15);
          ctx.lineTo(curD, 0);
        } else {
          ctx.moveTo(15, curD);
          ctx.lineTo(0, curD);
        }

        num = (labelPos - contentDim) / uMulti;
        let label;
        if (multi >= 1) {
          label = Math.round(num);
        } else {
          const decs = String(multi).split('.')[1].length;
          label = num.toFixed(decs);
        }

        // Change 1000s to Ks
        if (label !== 0 && label !== 1000 && label % 1000 === 0) {
          label = (label / 1000) + 'K';
        }

        if (isX) {
          ctx.fillText(label, rulerD + 2, 8);
        } else {
          // draw label vertically
          const str = String(label).split('');
          for (i = 0; i < str.length; i++) {
            ctx.fillText(str[i], 1, (rulerD + 9) + i * 9);
          }
        }

        const part = bigInt / 10;
        // draw the small intervals
        for (i = 1; i < 10; i++) {
          let subD = Math.round(rulerD + part * i) + 0.5;
          if (ctxArr && subD > rulerLen) {
            ctxNum++;
            ctx.stroke();
            if (ctxNum >= ctxArrNum) {
              i = 10;
              rulerD = totalLen;
              continue;
            }
            ctx = ctxArr[ctxNum];
            rulerD -= limit;
            subD = Math.round(rulerD + part * i) + 0.5;
          }

          // odd lines are slighly longer
          const lineNum = (i % 2) ? 12 : 10;
          if (isX) {
            ctx.moveTo(subD, 15);
            ctx.lineTo(subD, lineNum);
          } else {
            ctx.moveTo(15, subD);
            ctx.lineTo(lineNum, subD);
          }
        }
        rulerD += bigInt;
      }
      ctx.strokeStyle = '#000';
      ctx.stroke();
    }
  }

  /**
  * @function module:SVGEditor.updateCanvas
  * @param {boolean} center
  * @param {module:math.XYObject} newCtr
  * @returns {void}
  */
  const updateCanvas = editor.updateCanvas = function (center, newCtr) {
    const zoom = svgCanvas.getZoom();
    const wArea = workarea;
    const cnvs = $('#svgcanvas');

    let w = workarea.width(), h = workarea.height();
    const wOrig = w, hOrig = h;
    const oldCtr = {
      x: wArea[0].scrollLeft + wOrig / 2,
      y: wArea[0].scrollTop + hOrig / 2
    };
    const multi = editor.configObj.curConfig.canvas_expansion;
    w = Math.max(wOrig, svgCanvas.contentW * zoom * multi);
    h = Math.max(hOrig, svgCanvas.contentH * zoom * multi);

    if (w === wOrig && h === hOrig) {
      workarea.css('overflow', 'hidden');
    } else {
      workarea.css('overflow', 'scroll');
    }

    const oldCanY = cnvs.height() / 2;
    const oldCanX = cnvs.width() / 2;
    cnvs.width(w).height(h);
    const newCanY = h / 2;
    const newCanX = w / 2;
    const offset = svgCanvas.updateCanvas(w, h);

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
      if (svgCanvas.contentW > wArea.width()) {
        // Top-left
        workarea[0].scrollLeft = offset.x - 10;
        workarea[0].scrollTop = offset.y - 10;
      } else {
        // Center
        wArea[0].scrollLeft = scrollX;
        wArea[0].scrollTop = scrollY;
      }
    } else {
      wArea[0].scrollLeft = newCtr.x - wOrig / 2;
      wArea[0].scrollTop = newCtr.y - hOrig / 2;
    }
    if (editor.configObj.curConfig.showRulers) {
      updateRulers(cnvs, zoom);
      workarea.scroll();
    }

    if (editor.configObj.urldata.storagePrompt !== true && editor.storagePromptState === 'ignore') {
      $('#dialog_box').hide();
    }
  };

  /**
  * Updates the toolbar (colors, opacity, etc) based on the selected element.
  * This function also updates the opacity and id elements that are in the
  * context panel.
  * @returns {void}
  */
  const updateToolbar = () => {
    let i, len;
    if (!isNullish(editor.selectedElement)) {
      switch (editor.selectedElement.tagName) {
      case 'use':
      case 'image':
      case 'foreignObject':
        break;
      case 'g':
      case 'a': {
        // Look for common styles
        const childs = editor.selectedElement.getElementsByTagName('*');
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
        editor.bottomPanelHandlers.updateColorpickers(true);
        break;
      } default: {
        editor.bottomPanelHandlers.updateColorpickers(true);

        $('#stroke_width').val(editor.selectedElement.getAttribute('stroke-width') || 1);
        $('#stroke_style').val(editor.selectedElement.getAttribute('stroke-dasharray') || 'none');

        let attr = editor.selectedElement.getAttribute('stroke-linejoin') || 'miter';

        if ($('#linejoin_' + attr).length) {
          setStrokeOpt($('#linejoin_' + attr)[0]);
        }

        attr = editor.selectedElement.getAttribute('stroke-linecap') || 'butt';

        if ($('#linecap_' + attr).length) {
          setStrokeOpt($('#linecap_' + attr)[0]);
        }
      }
      }
    }

    // All elements including image and group have opacity
    if (!isNullish(editor.selectedElement)) {
      const opacPerc = (editor.selectedElement.getAttribute('opacity') || 1.0) * 100;
      $('#group_opacity').val(opacPerc);
      $('#opac_slider').slider('option', 'value', opacPerc);
      $id('elem_id').value = editor.selectedElement.id;
      $id('elem_class').value = (editor.selectedElement.getAttribute('class') !== null) ? editor.selectedElement.getAttribute('class') : '';
    }

    editor.bottomPanelHandlers.updateToolButtonState();
  };

  /**
  *
  * @returns {void}
  */
  const updateWireFrame = () => {
    const rule = `
      #workarea.wireframe #svgcontent * {
        stroke-width: ${1 / svgCanvas.getZoom()}px;
      }
    `;
    $('#wireframe_rules').text(workarea.hasClass('wireframe') ? rule : '');
  };

  let curContext = '';

  /**
  * @param {string} [title=svgCanvas.getDocumentTitle()]
  * @returns {void}
  */
  const updateTitle = function (title) {
    title = title || svgCanvas.getDocumentTitle();
    const newTitle = document.querySelector('title').text + (title ? ': ' + title : '');

    // Remove title update with current context info, isn't really necessary
    // if (curContext) {
    //   new_title = new_title + curContext;
    // }
    $('title:first').text(newTitle);
  };

  // called when we've selected a different element
  /**
  *
  * @param {external:Window} win
  * @param {module:svgcanvas.SvgCanvas#event:selected} elems Array of elements that were selected
  * @listens module:svgcanvas.SvgCanvas#event:selected
  * @fires module:svgcanvas.SvgCanvas#event:ext_selectedChanged
  * @returns {void}
  */
  const selectedChanged = function (win, elems) {
    const mode = svgCanvas.getMode();
    if (mode === 'select') {
      editor.leftPanelHandlers.clickSelect();
    }
    const isNode = mode === 'pathedit';
    // if elems[1] is present, then we have more than one element
    editor.selectedElement = (elems.length === 1 || isNullish(elems[1]) ? elems[0] : null);
    editor.multiselected = (elems.length >= 2 && !isNullish(elems[1]));
    if (!isNullish(editor.selectedElement) && !isNode) {
      updateToolbar();
    } // if (!isNullish(elem))

    // Deal with pathedit mode
    togglePathEditMode(isNode, elems);
    editor.topPanelHandlers.updateContextPanel();
    svgCanvas.runExtensions('selectedChanged', /** @type {module:svgcanvas.SvgCanvas#event:ext_selectedChanged} */ {
      elems,
      selectedElement: editor.selectedElement,
      multiselected: editor.multiselected
    });
  };

  // Call when part of element is in process of changing, generally
  // on mousemove actions like rotate, move, etc.
  /**
   * @param {external:Window} win
   * @param {module:svgcanvas.SvgCanvas#event:transition} elems
   * @listens module:svgcanvas.SvgCanvas#event:transition
   * @fires module:svgcanvas.SvgCanvas#event:ext_elementTransition
   * @returns {void}
   */
  const elementTransition = function (win, elems) {
    const mode = svgCanvas.getMode();
    const elem = elems[0];

    if (!elem) {
      return;
    }

    editor.multiselected = (elems.length >= 2 && !isNullish(elems[1]));
    // Only updating fields for single elements for now
    if (!editor.multiselected) {
      switch (mode) {
      case 'rotate': {
        const ang = svgCanvas.getRotationAngle(elem);
        $('#angle').val(ang);
        $('#tool_reorient').toggleClass('disabled', ang === 0);
        break;

      // TODO: Update values that change on move/resize, etc
      // } case 'select': {
      // } case 'resize': {
      //   break;
      // }
      }
      }
    }
    svgCanvas.runExtensions('elementTransition', /** @type {module:svgcanvas.SvgCanvas#event:ext_elementTransition} */ {
      elems
    });
  };

  // called when any element has changed
  /**
   * @param {external:Window} win
   * @param {module:svgcanvas.SvgCanvas#event:changed} elems
   * @listens module:svgcanvas.SvgCanvas#event:changed
   * @fires module:svgcanvas.SvgCanvas#event:ext_elementChanged
   * @returns {void}
   */
  const elementChanged = function (win, elems) {
    const mode = svgCanvas.getMode();
    if (mode === 'select') {
      editor.leftPanelHandlers.clickSelect();
    }

    elems.forEach((elem) => {
      const isSvgElem = (elem && elem.tagName === 'svg');
      if (isSvgElem || svgCanvas.isLayer(elem)) {
        editor.layersPanel.populateLayers();
        // if the element changed was the svg, then it could be a resolution change
        if (isSvgElem) {
          updateCanvas();
        }
      // Update selectedElement if element is no longer part of the image.
      // This occurs for the text elements in Firefox
      } else if (elem && editor.selectedElement && isNullish(editor.selectedElement.parentNode)) {
        // || elem && elem.tagName == "path" && !multiselected) { // This was added in r1430, but not sure why
        editor.selectedElement = elem;
      }
    });

    editor.showSaveWarning = true;

    // we update the contextual panel with potentially new
    // positional/sizing information (we DON'T want to update the
    // toolbar here as that creates an infinite loop)
    // also this updates the history buttons

    // we tell it to skip focusing the text control if the
    // text element was previously in focus
    editor.topPanelHandlers.updateContextPanel();

    // In the event a gradient was flipped:
    if (editor.selectedElement && mode === 'select') {
      editor.bottomPanelHandlers.updateColorpickers();
    }

    svgCanvas.runExtensions('elementChanged', /** @type {module:svgcanvas.SvgCanvas#event:ext_elementChanged} */ {
      elems
    });
  };

  /**
   * @returns {void}
   */
  const zoomDone = () => {
    updateWireFrame();
    // updateCanvas(); // necessary?
  };

  /**
  * @typedef {PlainObject} module:SVGEditor.BBoxObjectWithFactor (like `DOMRect`)
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
  const zoomChanged = svgCanvas.zoomChanged = function (win, bbox, autoCenter) {
    const scrbar = 15,
      // res = svgCanvas.getResolution(), // Currently unused
      wArea = workarea;
    // const canvasPos = $('#svgcanvas').position(); // Currently unused
    const zInfo = svgCanvas.setBBoxZoom(bbox, wArea.width() - scrbar, wArea.height() - scrbar);
    if (!zInfo) { return; }
    const zoomlevel = zInfo.zoom,
      bb = zInfo.bbox;

    if (zoomlevel < 0.001) {
      editor.changeZoom(0.1);
      return;
    }

    $id('zoom').value = (svgCanvas.getZoom() * 100).toFixed(1);

    if (autoCenter) {
      updateCanvas();
    } else {
      updateCanvas(false, {x: bb.x * zoomlevel + (bb.width * zoomlevel) / 2, y: bb.y * zoomlevel + (bb.height * zoomlevel) / 2});
    }

    if (svgCanvas.getMode() === 'zoom' && bb.width) {
      // Go to select if a zoom box was drawn
      editor.leftPanelHandlers.clickSelect();
    }

    zoomDone();
  };

  $('#cur_context_panel').delegate('a', 'click', (evt) => {
    const link = $(evt.currentTarget);
    if (link.attr('data-root')) {
      svgCanvas.leaveContext();
    } else {
      svgCanvas.setContext(link.text());
    }
    svgCanvas.clearSelection();
    return false;
  });

  /**
   * @param {external:Window} win
   * @param {module:svgcanvas.SvgCanvas#event:contextset} context
   * @listens module:svgcanvas.SvgCanvas#event:contextset
   * @returns {void}
   */
  const contextChanged = function (win, context) {
    let linkStr = '';
    if (context) {
      let str = '';
      linkStr = '<a href="#" data-root="y">' + svgCanvas.getCurrentDrawing().getCurrentLayerName() + '</a>';

      $(context).parentsUntil('#svgcontent > g').andSelf().each(() => {
        if (this.id) {
          str += ' > ' + this.id;
          linkStr += (this !== context) ? ` > <a href="#">${this.id}</a>` : ` > ${this.id}`;
        }
      });

      curContext = str;
    } else {
      curContext = null;
    }
    $('#cur_context_panel').toggle(Boolean(context)).html(linkStr);

    updateTitle();
  };

  /**
   * @param {external:Window} win
   * @param {module:svgcanvas.SvgCanvas#event:extension_added} ext
   * @listens module:svgcanvas.SvgCanvas#event:extension_added
   * @returns {Promise<void>|void} Resolves to `undefined`
   */
  const extAdded = async (win, ext) => {
    if (!ext) {
      return undefined;
    }
    let cbCalled = false;

    if (ext.langReady && editor.langChanged) { // We check for this since the "lang" pref could have been set by storage
      const lang = editor.pref('lang');
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
    * @typedef {PlainObject} module:SVGEditor.ContextTool
    * @property {string} panel The ID of the existing panel to which the tool is being added. Required.
    * @property {string} id The ID of the actual tool element. Required.
    * @property {PlainObject<string, external:jQuery.Function>|PlainObject<"change", external:jQuery.Function>} events DOM event names keyed to associated functions. Example: `{change () { alert('Option was changed') } }`. "change" event is one specifically handled for the "button-select" type. Required.
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
      editor.leftPanelHandlers.add(ext.events.id, ext.events.click);
    }
    return runCallback();
  };

  // bind the selected event to our function that handles updates to the UI
  svgCanvas.bind('selected', selectedChanged);
  svgCanvas.bind('transition', elementTransition);
  svgCanvas.bind('changed', elementChanged);
  svgCanvas.bind('saved', saveHandler);
  svgCanvas.bind('exported', exportHandler);
  svgCanvas.bind('exportedPDF', function (win, data) {
    if (!data.output) { // Ignore Chrome
      return;
    }
    const {exportWindowName} = data;
    if (exportWindowName) {
      exportWindow = window.open('', exportWindowName); // A hack to get the window via JSON-able name without opening a new one
    }
    if (!exportWindow || exportWindow.closed) {
      alert(uiStrings.notification.popupWindowBlocked);
      return;
    }
    exportWindow.location.href = data.output;
  });
  svgCanvas.bind('zoomed', zoomChanged);
  svgCanvas.bind('zoomDone', zoomDone);
  svgCanvas.bind(
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
      updateCanvas(center, newCtr);
    }
  );
  svgCanvas.bind('contextset', contextChanged);
  svgCanvas.bind('extension_added', extAdded);
  svgCanvas.textActions.setInputElem($('#text')[0]);

  setBackground(editor.pref('bkgd_color'), editor.pref('bkgd_url'));

  // update resolution option with actual resolution
  const res = svgCanvas.getResolution();
  if (editor.configObj.curConfig.baseUnit !== 'px') {
    res.w = convertUnit(res.w) + editor.configObj.curConfig.baseUnit;
    res.h = convertUnit(res.h) + editor.configObj.curConfig.baseUnit;
  }
  $('#se-img-prop').attr('dialog', 'close');
  $('#se-img-prop').attr('title', svgCanvas.getDocumentTitle());
  $('#se-img-prop').attr('width', res.w);
  $('#se-img-prop').attr('height', res.h);
  $('#se-img-prop').attr('save', editor.pref('img_save'));

  // Lose focus for select elements when changed (Allows keyboard shortcuts to work better)
  $('select').change((evt) => { $(evt.currentTarget).blur(); });

  // fired when user wants to move elements to another layer
  let promptMoveLayerOnce = false;
  $('#selLayerNames').change((evt) => {
    const destLayer = evt.currentTarget.options[evt.currentTarget.selectedIndex].value;
    const confirmStr = uiStrings.notification.QmoveElemsToLayer.replace('%s', destLayer);
    /**
    * @param {boolean} ok
    * @returns {void}
    */
    const moveToLayer = function (ok) {
      if (!ok) { return; }
      promptMoveLayerOnce = true;
      svgCanvas.moveSelectedToLayer(destLayer);
      svgCanvas.clearSelection();
      editor.layersPanel.populateLayers();
    };
    if (destLayer) {
      if (promptMoveLayerOnce) {
        moveToLayer(true);
      } else {
        const ok = confirm(confirmStr);
        if (!ok) {
          return;
        }
        moveToLayer(true);
      }
    }
  });

  $('#font_family').change((evt) => {
    svgCanvas.setFontFamily(evt.currentTarget.value);
  });

  $('#seg_type').change((evt) => {
    svgCanvas.setSegType($(evt.currentTarget).val());
  });

  $('#text').bind('keyup input', (evt) => {
    svgCanvas.setTextContent(evt.currentTarget.value);
  });

  $('#image_url').change((evt) => {
    setImageURL(evt.currentTarget.value);
  });

  $('#link_url').change((evt) => {
    if (evt.currentTarget.value.length) {
      svgCanvas.setLinkURL(evt.currentTarget.value);
    } else {
      svgCanvas.removeHyperlink();
    }
  });

  $('#g_title').change((evt) => {
    svgCanvas.setGroupTitle(evt.currentTarget.value);
  });

  (function () {
    const wArea = workarea[0];

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
      svgCanvas.spaceKey = keypan = true;
      evt.preventDefault();
    }).bind('keyup', 'space', function (evt) {
      evt.preventDefault();
      svgCanvas.spaceKey = keypan = false;
    }).bind('keydown', 'shift', function (evt) {
      if (svgCanvas.getMode() === 'zoom') {
        workarea.css('cursor', zoomOutIcon);
      }
    }).bind('keyup', 'shift', function (evt) {
      if (svgCanvas.getMode() === 'zoom') {
        workarea.css('cursor', zoomInIcon);
      }
    });

    /**
     * @function module:SVGEditor.setPanning
     * @param {boolean} active
     * @returns {void}
     */
    editor.setPanning = function (active) {
      svgCanvas.spaceKey = keypan = active;
    };
  }());

  (function () {
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
  }());
  // Made public for UI customization.
  // TODO: Group UI functions into a public editor.ui interface.
  /**
   * See {@link http://api.jquery.com/bind/#bind-eventType-eventData-handler}.
   * @callback module:SVGEditor.DropDownCallback
   * @param {external:jQuery.Event} ev See {@link http://api.jquery.com/Types/#Event}
   * @listens external:jQuery.Event
   * @returns {void|boolean} Calls `preventDefault()` and `stopPropagation()`
  */
  /**
   * @function module:SVGEditor.addDropDown
   * @param {Element|string} elem DOM Element or selector
   * @param {module:SVGEditor.DropDownCallback} callback Mouseup callback
   * @param {boolean} dropUp
   * @returns {void}
  */
  editor.addDropDown = function (elem, callback, dropUp) {
    if (!$(elem).length) { return; } // Quit if called on non-existent element
    const button = $(elem).find('button');
    const list = $(elem).find('ul').attr('id', $(elem)[0].id + '-list');
    if (dropUp) {
      $(elem).addClass('dropup');
    } else {
      // Move list to place where it can overflow container
      $('#option_lists').append(list);
    }
    list.find('li').bind('mouseup', callback);

    let onButton = false;
    $(window).mouseup(function (evt) {
      if (!onButton) {
        button.removeClass('down');
        list.hide();
      }
      onButton = false;
    });

    button.bind('mousedown', () => {
      if (!button.hasClass('down')) {
        if (!dropUp) {
          const pos = $(elem).position();
          list.css({
            top: pos.top + 24,
            left: pos.left - 10
          });
        }
        list.show();
        onButton = true;
      } else {
        list.hide();
      }
      button.toggleClass('down');
    }).hover(() => {
      onButton = true;
    }).mouseout(() => {
      onButton = false;
    });
  };

  editor.addDropDown('#font_family_dropdown', () => {
    $('#font_family').val($(this).text()).change();
  });

  /**
  * @param {Float} multiplier
  * @returns {void}
  */
  editor.zoomImage = function (multiplier) {
    const resolution = this.svgCanvasgetResolution();
    multiplier = multiplier ? resolution.zoom * multiplier : 1;
    // setResolution(res.w * multiplier, res.h * multiplier, true);
    $id('zoom').value = (multiplier * 100).toFixed(1);
    this.svgCanvassetZoom(multiplier);
    zoomDone();
    updateCanvas(true);
  };

  // Unfocus text input when workarea is mousedowned.
  (function () {
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
      uiContext = 'toolbars';
      workarea.mousedown(unfocus);
    }).blur(() => {
      uiContext = 'canvas';
      workarea.unbind('mousedown', unfocus);
      // Go back to selecting text if in textedit mode
      if (svgCanvas.getMode() === 'textedit') {
        $('#text').focus();
      }
    });
  }());

  /**
  *
  * @returns {void}
  */
  const cutSelected = () => {
    if (!isNullish(editor.selectedElement) || editor.multiselected) {
      svgCanvas.cutSelectedElements();
    }
  };

  /**
  *
  * @returns {void}
  */
  const copySelected = () => {
    if (!isNullish(editor.selectedElement) || editor.multiselected) {
      svgCanvas.copySelectedElements();
    }
  };

  /**
  *
  * @returns {void}
  */
  const pasteInCenter = () => {
    const zoom = svgCanvas.getZoom();
    const x = (workarea[0].scrollLeft + workarea.width() / 2) / zoom - svgCanvas.contentW;
    const y = (workarea[0].scrollTop + workarea.height() / 2) / zoom - svgCanvas.contentH;
    svgCanvas.pasteElements('point', x, y);
  };

  /**
  * @param {"Up"|"Down"} dir
  * @returns {void}
  */
  const moveUpDownSelected = function (dir) {
    if (!isNullish(editor.selectedElement)) {
      svgCanvas.moveUpDownSelected(dir);
    }
  };

  /**
  * @param {Float} dx
  * @param {Float} dy
  * @returns {void}
  */
  const moveSelected = function (dx, dy) {
    if (!isNullish(editor.selectedElement) || editor.multiselected) {
      if (editor.configObj.curConfig.gridSnapping) {
        // Use grid snap value regardless of zoom level
        const multi = svgCanvas.getZoom() * editor.configObj.curConfig.snappingStep;
        dx *= multi;
        dy *= multi;
      }
      svgCanvas.moveSelectedElements(dx, dy);
    }
  };

  /**
  *
  * @returns {void}
  */
  const selectNext = () => {
    svgCanvas.cycleElement(1);
  };

  /**
  *
  * @returns {void}
  */
  const selectPrev = () => {
    svgCanvas.cycleElement(0);
  };

  /**
  * @param {0|1} cw
  * @param {Integer} step
  * @returns {void}
  */
  const rotateSelected = function (cw, step) {
    if (isNullish(editor.selectedElement) || editor.multiselected) { return; }
    if (!cw) { step *= -1; }
    const angle = Number.parseFloat($('#angle').val()) + step;
    svgCanvas.setRotationAngle(angle);
    editor.topPanelHandlers.updateContextPanel();
  };

  /**
   * @fires module:svgcanvas.SvgCanvas#event:ext_onNewDocument
   * @returns {void}
   */
  const clickClear = () => {
    const [x, y] = editor.configObj.curConfig.dimensions;
    const ok = confirm(uiStrings.notification.QwantToClear);
    if (!ok) {
      return;
    }
    editor.leftPanelHandlers.clickSelect();
    svgCanvas.clear();
    svgCanvas.setResolution(x, y);
    updateCanvas(true);
    editor.zoomImage();
    editor.layersPanel.populateLayers();
    editor.topPanelHandlers.updateContextPanel();
    svgCanvas.runExtensions('onNewDocument');
  };

  /**
  *
  * @returns {void}
  */
  const clickSave = () => {
    // In the future, more options can be provided here
    const saveOpts = {
      images: editor.pref('img_save'),
      round_digits: 6
    };
    svgCanvas.save(saveOpts);
  };

  let loadingURL;
  /**
  *
  * @returns {Promise<void>} Resolves to `undefined`
  */
  const clickExport = async () => {
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
    function openExportWindow () {
      const {loadingImage} = uiStrings.notification;
      if (editor.configObj.curConfig.exportWindowType === 'new') {
        editor.exportWindowCt++;
      }
      exportWindowName = editor.configObj.curConfig.canvasName + editor.exportWindowCt;
      let popHTML, popURL;
      if (loadingURL) {
        popURL = loadingURL;
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
        loadingURL = popURL;
      }
      exportWindow = window.open(popURL, exportWindowName);
    }
    const chrome = isChrome();
    if (imgType === 'PDF') {
      if (!customExportPDF && !chrome) {
        openExportWindow();
      }
      svgCanvas.exportPDF(exportWindowName);
    } else {
      if (!customExportImage) {
        openExportWindow();
      }
      const quality = 1; // JFH !!! Number.parseInt($('#image-slider').val()) / 100;
      /* const results = */ await svgCanvas.rasterExport(imgType, quality, exportWindowName);
    }
  };

  /**
   * By default, svgCanvas.open() is a no-op. It is up to an extension
   *  mechanism (opera widget, etc.) to call `setCustomHandlers()` which
   *  will make it do something.
   * @returns {void}
   */
  const clickOpen = () => {
    svgCanvas.open();
  };

  /**
  *
  * @returns {void}
  */
  const clickImport = () => {
    /* empty fn */
  };

  let docprops = false;
  let preferences = false;

  /**
  *
  * @returns {void}
  */
  const showDocProperties = () => {
    if (docprops) { return; }
    docprops = true;
    const $imgDialog = document.getElementById('se-img-prop');

    // update resolution option with actual resolution
    const resolution = svgCanvas.getResolution();
    if (editor.configObj.curConfig.baseUnit !== 'px') {
      resolution.w = convertUnit(resolution.w) + editor.configObj.curConfig.baseUnit;
      resolution.h = convertUnit(resolution.h) + editor.configObj.curConfig.baseUnit;
    }
    $imgDialog.setAttribute('save', editor.pref('img_save'));
    $imgDialog.setAttribute('width', resolution.w);
    $imgDialog.setAttribute('height', resolution.h);
    $imgDialog.setAttribute('title', svgCanvas.getDocumentTitle());
    $imgDialog.setAttribute('dialog', 'open');
  };

  /**
  *
  * @returns {void}
  */
  const showPreferences = () => {
    if (preferences) { return; }
    preferences = true;
    const $editDialog = document.getElementById('se-edit-prefs');
    $('#main_menu').hide();
    // Update background color with current one
    const canvasBg = editor.configObj.curPrefs.bkgd_color;
    const url = editor.pref('bkgd_url');
    if (url) {
      $editDialog.setAttribute('bgurl', url);
    }
    $editDialog.setAttribute('gridsnappingon', editor.configObj.curConfig.gridSnapping);
    $editDialog.setAttribute('gridsnappingstep', editor.configObj.curConfig.snappingStep);
    $editDialog.setAttribute('gridcolor', editor.configObj.curConfig.gridColor);
    $editDialog.setAttribute('canvasbg', canvasBg);
    $editDialog.setAttribute('dialog', 'open');
  };

  /**
  *
  * @returns {void}
  */
  const openHomePage = () => {
    window.open(homePage, '_blank');
  };

  /**
  *
  * @returns {void}
  */
  const hideSourceEditor = () => {
    const $editorDialog = document.getElementById('se-svg-editor-dialog');
    $editorDialog.setAttribute('dialog', 'closed');
  };

  /**
  * @param {Event} e
  * @returns {void} Resolves to `undefined`
  */
  const saveSourceEditor = (e) => {
    const $editorDialog = document.getElementById('se-svg-editor-dialog');
    if ($editorDialog.getAttribute('dialog') === 'open') return;
    const saveChanges = () => {
      svgCanvas.clearSelection();
      hideSourceEditor();
      editor.zoomImage();
      editor.layersPanel.populateLayers();
      updateTitle();
    };

    if (!svgCanvas.setSvgString(e.detail.value)) {
      const ok = confirm(uiStrings.notification.QerrorsRevertToSource);
      if (!ok) {
        return;
      }
      saveChanges();
      return;
    }
    saveChanges();
    editor.leftPanelHandlers.clickSelect();
  };

  /**
  *
  * @returns {void}
  */
  const hideDocProperties = () => {
    const $imgDialog = document.getElementById('se-img-prop');
    $imgDialog.setAttribute('dialog', 'close');
    $imgDialog.setAttribute('save', editor.pref('img_save'));
    docprops = false;
  };

  /**
  *
  * @returns {void}
  */
  const hidePreferences = () => {
    const $editDialog = document.getElementById('se-edit-prefs');
    $editDialog.setAttribute('dialog', 'close');
    preferences = false;
  };

  /**
  * @param {Event} e
  * @returns {boolean} Whether there were problems saving the document properties
  */
  const saveDocProperties = function (e) {
    // set title
    const {title, w, h, save} = e.detail;
    // set document title
    svgCanvas.setDocumentTitle(title);

    if (w !== 'fit' && !isValidUnit('width', w)) {
      alert(uiStrings.notification.invalidAttrValGiven);
      return false;
    }
    if (h !== 'fit' && !isValidUnit('height', h)) {
      alert(uiStrings.notification.invalidAttrValGiven);
      return false;
    }
    if (!svgCanvas.setResolution(w, h)) {
      alert(uiStrings.notification.noContentToFitTo);
      return false;
    }
    // Set image save option
    editor.pref('img_save', save);
    updateCanvas();
    hideDocProperties();
    return true;
  };

  /**
  * Save user preferences based on current values in the UI.
  * @param {Event} e
  * @function module:SVGEditor.savePreferences
  * @returns {Promise<void>}
  */
  const savePreferences = editor.savePreferences = async function (e) {
    const {lang, bgcolor, bgurl, gridsnappingon, gridsnappingstep, gridcolor, showrulers, baseunit} = e.detail;
    // Set background
    setBackground(bgcolor, bgurl);

    // set language
    if (lang && lang !== editor.pref('lang')) {
      const {langParam, langData} = await editor.putLocale(lang, goodLangs);
      await setLang(langParam, langData);
    }

    // set grid setting
    editor.configObj.curConfig.gridSnapping = gridsnappingon;
    editor.configObj.curConfig.snappingStep = gridsnappingstep;
    editor.configObj.curConfig.gridColor = gridcolor;
    editor.configObj.curConfig.showRulers = showrulers;

    $('#rulers').toggle(editor.configObj.curConfig.showRulers);
    if (editor.configObj.curConfig.showRulers) { updateRulers(); }
    editor.configObj.curConfig.baseUnit = baseunit;

    svgCanvas.setConfig(editor.configObj.curConfig);
    updateCanvas();
    hidePreferences();
  };

  /**
  * @param {Event} e
  * @returns {void} Resolves to `undefined`
  */
  const cancelOverlays = (e) => {
    $('#dialog_box').hide();
    const $editorDialog = document.getElementById('se-svg-editor-dialog');
    const editingsource = $editorDialog.getAttribute('dialog') === 'open';
    if (!editingsource && !docprops && !preferences) {
      if (curContext) {
        svgCanvas.leaveContext();
      }
      return;
    }

    if (editingsource) {
      const origSource = svgCanvas.getSvgString();
      if (origSource !== e.detail.value) {
        const ok = confirm(uiStrings.notification.QignoreSourceChanges);
        if (ok) {
          hideSourceEditor();
        }
      } else {
        hideSourceEditor();
      }
    }
  };

  const winWh = {width: $(window).width(), height: $(window).height()};

  $(window).resize(function (evt) {
    $.each(winWh, function (type, val) {
      const curval = $(window)[type]();
      workarea[0]['scroll' + (type === 'width' ? 'Left' : 'Top')] -= (curval - val) / 2;
      winWh[type] = curval;
    });
  });

  workarea.scroll(() => {
    // TODO: jQuery's scrollLeft/Top() wouldn't require a null check
    if ($('#ruler_x').length) {
      $('#ruler_x')[0].scrollLeft = workarea[0].scrollLeft;
    }
    if ($('#ruler_y').length) {
      $('#ruler_y')[0].scrollTop = workarea[0].scrollTop;
    }
  });

  $('#url_notice').click(() => {
    alert(this.title);
  });

  $('#stroke_width').val(editor.configObj.curConfig.initStroke.width);
  $('#group_opacity').val(editor.configObj.curConfig.initOpacity * 100);

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

  editor.layersPanel.populateLayers();

  const centerCanvas = () => {
    // this centers the canvas vertically in the workarea (horizontal handled in CSS)
    workarea.css('line-height', workarea.height() + 'px');
  };

  $(window).bind('load resize', centerCanvas);

  // Prevent browser from erroneously repopulating fields
  $('input,select').attr('autocomplete', 'off');

  /* eslint-disable jsdoc/require-property */
  /**
   * Associate all button actions as well as non-button keyboard shortcuts.
   * @namespace {PlainObject} module:SVGEditor~Actions
   */
  const Actions = (function () {
    /* eslint-enable jsdoc/require-property */
    /**
    * @typedef {PlainObject} module:SVGEditor.ToolButton
    * @property {string} sel The CSS selector for the tool
    * @property {external:jQuery.Function} fn A handler to be attached to the `evt`
    * @property {string} evt The event for which the `fn` listener will be added
    * @property {module:SVGEditor.Key} [key] [key, preventDefault, NoDisableInInput]
    * @property {string} [parent] Selector
    * @property {boolean} [hidekey] Whether to show key value in title
    * @property {string} [icon] The button ID
    */
    /**
     *
     * @name module:SVGEditor~ToolButtons
     * @type {module:SVGEditor.ToolButton[]}
     */

    editor.leftPanelHandlers.init();
    editor.bottomPanelHandlers.init();
    editor.topPanelHandlers.init();
    editor.layersPanel.init();

    $id('tool_clear').addEventListener('click', clickClear);
    $id('tool_open').addEventListener('click', function (e) {
      clickOpen();
      window.dispatchEvent(new CustomEvent('openImage'));
    });
    $id('tool_import').addEventListener('click', function (e) {
      clickImport();
      window.dispatchEvent(new CustomEvent('importImage'));
    });
    $id('tool_save').addEventListener('click', function (e) {
      const $editorDialog = document.getElementById('se-svg-editor-dialog');
      const editingsource = $editorDialog.getAttribute('dialog') === 'open';
      if (editingsource) {
        saveSourceEditor();
      } else {
        clickSave();
      }
    });
    $id('tool_export').addEventListener('click', clickExport);
    $id('tool_docprops').addEventListener('click', showDocProperties);
    $id('tool_editor_prefs').addEventListener('click', showPreferences);
    $id('tool_editor_homepage').addEventListener('click', openHomePage);
    $id('se-img-prop').addEventListener('change', function (e) {
      if (e.detail.dialog === 'closed') {
        hideDocProperties();
      } else {
        saveDocProperties(e);
      }
    });
    $id('se-edit-prefs').addEventListener('change', function (e) {
      if (e.detail.dialog === 'closed') {
        hidePreferences();
      } else {
        savePreferences(e);
      }
    });
    $id('se-svg-editor-dialog').addEventListener('change', function (e) {
      if (e?.detail?.copy === 'click') {
        cancelOverlays(e);
      } else if (e?.detail?.dialog === 'closed') {
        hideSourceEditor();
      } else {
        saveSourceEditor(e);
      }
    });
    $id('se-cmenu_canvas').addEventListener('change', function (e) {
      const action = e?.detail?.trigger;
      switch (action) {
      case 'delete':
        svgCanvas.deleteSelectedElements();
        break;
      case 'cut':
        cutSelected();
        break;
      case 'copy':
        copySelected();
        break;
      case 'paste':
        svgCanvas.pasteElements();
        break;
      case 'paste_in_place':
        svgCanvas.pasteElements('in_place');
        break;
      case 'group':
      case 'group_elements':
        svgCanvas.groupSelectedElements();
        break;
      case 'ungroup':
        svgCanvas.ungroupSelectedElement();
        break;
      case 'move_front':
        svgCanvas.moveToTopSelectedElement();
        break;
      case 'move_up':
        moveUpDownSelected('Up');
        break;
      case 'move_down':
        moveUpDownSelected('Down');
        break;
      case 'move_back':
        svgCanvas.moveToBottomSelected();
        break;
      default:
        if (hasCustomHandler(action)) {
          getCustomHandler(action).call();
        }
        break;
      }
    });

    const toolButtons = [
      // Shortcuts not associated with buttons
      {key: 'ctrl+left', fn () { rotateSelected(0, 1); }},
      {key: 'ctrl+right', fn () { rotateSelected(1, 1); }},
      {key: 'ctrl+shift+left', fn () { rotateSelected(0, 5); }},
      {key: 'ctrl+shift+right', fn () { rotateSelected(1, 5); }},
      {key: 'shift+O', fn: selectPrev},
      {key: 'shift+P', fn: selectNext},
      {key: [modKey + 'up', true], fn () { editor.zoomImage(2); }},
      {key: [modKey + 'down', true], fn () { editor.zoomImage(0.5); }},
      {key: [modKey + ']', true], fn () { moveUpDownSelected('Up'); }},
      {key: [modKey + '[', true], fn () { moveUpDownSelected('Down'); }},
      {key: ['up', true], fn () { moveSelected(0, -1); }},
      {key: ['down', true], fn () { moveSelected(0, 1); }},
      {key: ['left', true], fn () { moveSelected(-1, 0); }},
      {key: ['right', true], fn () { moveSelected(1, 0); }},
      {key: 'shift+up', fn () { moveSelected(0, -10); }},
      {key: 'shift+down', fn () { moveSelected(0, 10); }},
      {key: 'shift+left', fn () { moveSelected(-10, 0); }},
      {key: 'shift+right', fn () { moveSelected(10, 0); }},
      {key: ['alt+up', true], fn () { svgCanvas.cloneSelectedElements(0, -1); }},
      {key: ['alt+down', true], fn () { svgCanvas.cloneSelectedElements(0, 1); }},
      {key: ['alt+left', true], fn () { svgCanvas.cloneSelectedElements(-1, 0); }},
      {key: ['alt+right', true], fn () { svgCanvas.cloneSelectedElements(1, 0); }},
      {key: ['alt+shift+up', true], fn () { svgCanvas.cloneSelectedElements(0, -10); }},
      {key: ['alt+shift+down', true], fn () { svgCanvas.cloneSelectedElements(0, 10); }},
      {key: ['alt+shift+left', true], fn () { svgCanvas.cloneSelectedElements(-10, 0); }},
      {key: ['alt+shift+right', true], fn () { svgCanvas.cloneSelectedElements(10, 0); }},
      {key: 'a', fn () { svgCanvas.selectAllInCurrentLayer(); }},
      {key: modKey + 'a', fn () { svgCanvas.selectAllInCurrentLayer(); }},
      {key: modKey + 'x', fn: cutSelected},
      {key: modKey + 'c', fn: copySelected},
      {key: modKey + 'v', fn: pasteInCenter}
    ];

    // Tooltips not directly associated with a single function
    const keyAssocs = {
      '4/Shift+4': '#tools_rect',
      '5/Shift+5': '#tools_ellipse'
    };

    return {
      /** @lends module:SVGEditor~Actions */
      /**
       * @returns {void}
       */
      setAll () {
        const keyHandler = {}; // will contain the action for each pressed key

        toolButtons.forEach((opts) => {
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
          if (uiContext === 'canvas') {
            e.preventDefault();
            selectNext();
          }
        }).bind('keydown', 'shift+tab', function (e) {
          if (uiContext === 'canvas') {
            e.preventDefault();
            selectPrev();
          }
        });
      },
      /**
       * @returns {void}
       */
      setTitles () {
        $.each(keyAssocs, function (keyval, sel) {
          const menu = ($(sel).parents('#main_menu').length);

          $(sel).each(function () {
            const t = (menu) ? $(this).text().split(' [')[0] : this.title.split(' [')[0];
            let keyStr = '';
            // Shift+Up
            $.each(keyval.split('/'), function (i, key) {
              const modBits = key.split('+');
              let mod = '';
              if (modBits.length > 1) {
                mod = modBits[0] + '+';
                key = modBits[1];
              }
              keyStr += (i ? '/' : '') + mod + (uiStrings['key_' + key] || key);
            });
            if (menu) {
              this.lastChild.textContent = t + ' [' + keyStr + ']';
            } else {
              this.title = t + ' [' + keyStr + ']';
            }
          });
        });
      },
      /**
       * @param {string} sel Selector to match
       * @returns {module:SVGEditor.ToolButton}
       */
      getButtonData (sel) {
        return Object.values(toolButtons).find((btn) => {
          return btn.sel === sel;
        });
      }
    };
  }());

  // Select given tool
  editor.ready(function () {
    const preTool = $id(`tool_${editor.configObj.curConfig.initTool}`);
    const regTool = $id(editor.configObj.curConfig.initTool);
    const selectTool = $id('tool_select');
    const $editDialog = $id('se-edit-prefs');

    if (preTool) {
      preTool.click();
    } else if (regTool) {
      regTool.click();
    } else {
      selectTool.click();
    }

    if (editor.configObj.curConfig.wireframe) {
      $id('tool_wireframe').click();
    }

    $('#rulers').toggle(Boolean(editor.configObj.curConfig.showRulers));

    if (editor.configObj.curConfig.showRulers) {
      $editDialog.setAttribute('showrulers', true);
    }

    if (editor.configObj.curConfig.baseUnit) {
      $editDialog.setAttribute('baseunit', editor.configObj.curConfig.baseUnit);
    }

    if (editor.configObj.curConfig.gridSnapping) {
      $editDialog.setAttribute('gridsnappingon', true);
    }

    if (editor.configObj.curConfig.snappingStep) {
      $editDialog.setAttribute('gridsnappingstep', editor.configObj.curConfig.snappingStep);
    }

    if (editor.configObj.curConfig.gridColor) {
      $editDialog.setAttribute('gridcolor', editor.configObj.curConfig.gridColor);
    }
  });

  // zoom
  $id('zoom').value = (svgCanvas.getZoom() * 100).toFixed(1);
  canvMenu.setAttribute('disableallmenu', true);
  canvMenu.setAttribute('enablemenuitems', '#delete,#cut,#copy');
  /**
   * @returns {void}
   */
  function enableOrDisableClipboard () {
    let svgeditClipboard;
    try {
      svgeditClipboard = localStorage.getItem('svgedit_clipboard');
    } catch (err) {}
    canvMenu.setAttribute((svgeditClipboard ? 'en' : 'dis') + 'ablemenuitems', '#paste,#paste_in_place');
  }
  enableOrDisableClipboard();

  window.addEventListener('storage', function (e) {
    if (e.key !== 'svgedit_clipboard') { return; }

    enableOrDisableClipboard();
  });

  window.addEventListener('beforeunload', function (e) {
    // Suppress warning if page is empty
    if (undoMgr.getUndoStackSize() === 0) {
      editor.showSaveWarning = false;
    }

    // showSaveWarning is set to 'false' when the page is saved.
    if (!editor.configObj.curConfig.no_save_warning && editor.showSaveWarning) {
      // Browser already asks question about closing the page
      e.returnValue = uiStrings.notification.unsavedChanges; // Firefox needs this when beforeunload set by addEventListener (even though message is not used)
      return uiStrings.notification.unsavedChanges;
    }
    return true;
  });

  /**
  * Expose the `uiStrings`.
  * @function module:SVGEditor.canvas.getUIStrings
  * @returns {module:SVGEditor.uiStrings}
  */
  editor.canvas.getUIStrings = () => {
    return uiStrings;
  };

  /**
   * @function module:SVGEditor.openPrep
   * @returns {boolean|Promise<boolean>} Resolves to boolean indicating `true` if there were no changes
   *  and `false` after the user confirms.
   */
  editor.openPrep = () => {
    $('#main_menu').hide();
    if (undoMgr.getUndoStackSize() === 0) {
      return true;
    }
    return confirm(uiStrings.notification.QwantToOpen);
  };

  /**
   *
   * @param {Event} e
   * @returns {void}
   */
  function onDragEnter (e) {
    e.stopPropagation();
    e.preventDefault();
    // and indicator should be displayed here, such as "drop files here"
  }

  /**
   *
   * @param {Event} e
   * @returns {void}
   */
  function onDragOver (e) {
    e.stopPropagation();
    e.preventDefault();
  }

  /**
   *
   * @param {Event} e
   * @returns {void}
   */
  function onDragLeave (e) {
    e.stopPropagation();
    e.preventDefault();
    // hypothetical indicator should be removed here
  }
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
      $.process_cancel(uiStrings.notification.loadingImage);
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
          const newElement = svgCanvas.importSvgString(ev.target.result, true);
          svgCanvas.ungroupSelectedElement();
          svgCanvas.ungroupSelectedElement();
          svgCanvas.groupSelectedElements();
          svgCanvas.alignSelectedElements('m', 'page');
          svgCanvas.alignSelectedElements('c', 'page');
          // highlight imported element, otherwise we get strange empty selectbox
          svgCanvas.selectOnly([newElement]);
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
            const newImage = svgCanvas.addSVGElementFromJson({
              element: 'image',
              attr: {
                x: 0,
                y: 0,
                width,
                height,
                id: svgCanvas.getNextId(),
                style: 'pointer-events:inherit'
              }
            });
            svgCanvas.setHref(newImage, result);
            svgCanvas.selectOnly([newImage]);
            svgCanvas.alignSelectedElements('m', 'page');
            svgCanvas.alignSelectedElements('c', 'page');
            editor.topPanelHandlers.updateContextPanel();
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

    workarea[0].addEventListener('dragenter', onDragEnter);
    workarea[0].addEventListener('dragover', onDragOver);
    workarea[0].addEventListener('dragleave', onDragLeave);
    workarea[0].addEventListener('drop', importImage);

    const open = $('<input type="file">').change(async function (e) {
      const ok = await editor.openPrep();
      if (!ok) { return; }
      svgCanvas.clear();
      if (this.files.length === 1) {
        $.process_cancel(uiStrings.notification.loadingImage);
        const reader = new FileReader();
        reader.onloadend = async function ({target}) {
          await loadSvgString(target.result);
          updateCanvas();
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

  updateCanvas(true);

  /**
  * @function module:SVGEditor.setLang
  * @param {string} lang The language code
  * @param {module:locale.LocaleStrings} allStrings See {@tutorial LocaleDocs}
  * @fires module:svgcanvas.SvgCanvas#event:ext_langReady
  * @fires module:svgcanvas.SvgCanvas#event:ext_langChanged
  * @returns {void} A Promise which resolves to `undefined`
  */
  const setLang = editor.setLang = function (lang, allStrings) {
    editor.langChanged = true;
    editor.pref('lang', lang);
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
    $.extend(uiStrings, allStrings);

    // const notif = allStrings.notification; // Currently unused
    // $.extend will only replace the given strings
    const oldLayerName = $('#layerlist tr.layersel td.layername').text();
    const renameLayer = (oldLayerName === uiStrings.common.layer + ' 1');

    svgCanvas.setUiStrings(allStrings);
    Actions.setTitles();

    if (renameLayer) {
      svgCanvas.renameCurrentLayer(uiStrings.common.layer + ' 1');
      editor.layersPanel.populateLayers();
    }

    svgCanvas.runExtensions('langChanged', /** @type {module:svgcanvas.SvgCanvas#event:ext_langChanged} */ lang);

    // Copy title for certain tool elements
    const elems = {
      '#stroke_color': '#tool_stroke .icon_label, #tool_stroke .color_block',
      '#fill_color': '#tool_fill label, #tool_fill .color_block',
      '#linejoin_miter': '#cur_linejoin',
      '#linecap_butt': '#cur_linecap'
    };

    $.each(elems, function (source, dest) {
      $(dest).attr('title', $(source)[0].title);
    });

    // Copy alignment titles
    $('#multiselected_panel div[id^=tool_align]').each(() => {
      $('#tool_pos' + this.id.substr(10))[0].title = this.title;
    });
  };

  // Load extensions
  extAndLocaleFunc();
};

/**
* @callback module:SVGEditor.ReadyCallback
* @returns {Promise<void>|void}
*/
/**
* Queues a callback to be invoked when the editor is ready (or
*   to be invoked immediately if it is already ready--i.e.,
*   if `runCallbacks` has been run).
* @function module:SVGEditor.ready
* @param {module:SVGEditor.ReadyCallback} cb Callback to be queued to invoke
* @returns {Promise<ArbitraryCallbackResult>} Resolves when all callbacks, including the supplied have resolved
*/
editor.ready = function (cb) { // eslint-disable-line promise/prefer-await-to-callbacks
  return new Promise((resolve, reject) => { // eslint-disable-line promise/avoid-new
    if (isReady) {
      resolve(cb()); // eslint-disable-line node/callback-return, promise/prefer-await-to-callbacks
      return;
    }
    callbacks.push([cb, resolve, reject]);
  });
};

/**
* Invokes the callbacks previous set by `svgEditor.ready`
* @function module:SVGEditor.runCallbacks
* @returns {Promise<void>} Resolves to `undefined` if all callbacks succeeded and rejects otherwise
*/
editor.runCallbacks = async () => {
  try {
    await Promise.all(callbacks.map(([cb]) => {
      return cb(); // eslint-disable-line promise/prefer-await-to-callbacks
    }));
  } catch (err) {
    callbacks.forEach(([, , reject]) => {
      reject();
    });
    throw err;
  }
  callbacks.forEach(([, resolve]) => {
    resolve();
  });
  isReady = true;
};

/**
 * @function module:SVGEditor.loadFromString
 * @param {string} str The SVG string to load
 * @param {PlainObject} [opts={}]
 * @param {boolean} [opts.noAlert=false] Option to avoid alert to user and instead get rejected promise
 * @returns {Promise<void>}
 */
editor.loadFromString = function (str, {noAlert} = {}) {
  return editor.ready(async () => {
    try {
      await loadSvgString(str, {noAlert});
    } catch (err) {
      if (noAlert) {
        throw err;
      }
    }
  });
};

/**
 * @callback module:SVGEditor.URLLoadCallback
 * @param {boolean} success
 * @returns {void}
 */
/**
 * @function module:SVGEditor.loadFromURL
 * @param {string} url URL from which to load an SVG string via Ajax
 * @param {PlainObject} [opts={}] May contain properties: `cache`, `callback`
 * @param {boolean} [opts.cache]
 * @param {boolean} [opts.noAlert]
 * @returns {Promise<void>} Resolves to `undefined` or rejects upon bad loading of
 *   the SVG (or upon failure to parse the loaded string) when `noAlert` is
 *   enabled
 */
editor.loadFromURL = function (url, {cache, noAlert} = {}) {
  return editor.ready(() => {
    return new Promise((resolve, reject) => { // eslint-disable-line promise/avoid-new
      $.ajax({
        url,
        dataType: 'text',
        cache: Boolean(cache),
        beforeSend () {
          $.process_cancel(uiStrings.notification.loadingImage);
        },
        success (str) {
          loadSvgString(str, {noAlert});
        },
        error (xhr, stat, err) {
          if (xhr.status !== 404 && xhr.responseText) {
            loadSvgString(xhr.responseText, {noAlert});
            return;
          }
          if (noAlert) {
            reject(new Error('URLLoadFail'));
            return;
          }
          alert(uiStrings.notification.URLLoadFail + ': \n' + err);
          resolve();
        },
        complete () {
          $('#dialog_box').hide();
        }
      });
    });
  });
};

/**
* @function module:SVGEditor.loadFromDataURI
* @param {string} str The Data URI to base64-decode (if relevant) and load
* @param {PlainObject} [opts={}]
* @param {boolean} [opts.noAlert]
* @returns {Promise<void>} Resolves to `undefined` and rejects if loading SVG string fails and `noAlert` is enabled
*/
editor.loadFromDataURI = function (str, {noAlert} = {}) {
  return editor.ready(() => {
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
    return loadSvgString(base64 ? decode64(src) : decodeURIComponent(src), {noAlert});
  });
};

/**
 * @function module:SVGEditor.addExtension
 * @param {string} name Used internally; no need for i18n.
 * @param {module:svgcanvas.ExtensionInitCallback} init Config to be invoked on this module
 * @param {module:svgcanvas.ExtensionInitArgs} initArgs
 * @throws {Error} If called too early
 * @returns {Promise<void>} Resolves to `undefined`
*/
editor.addExtension = (name, init, initArgs) => {
  // Note that we don't want this on editor.ready since some extensions
  // may want to run before then (like server_opensave).
  if (!svgCanvas) {
    throw new Error('Extension added too early');
  }
  return svgCanvas.addExtension.call(editor, name, init, initArgs);
};

// Defer injection to wait out initial menu processing. This probably goes
//    away once all context menu behavior is brought to context menu.
editor.ready(() => {
  injectExtendedContextMenuItemsIntoDom();
});

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
    svgCanvas.call('message', messageObj);
  }
};
window.addEventListener('message', messageListener);

// Run init once DOM is loaded
// jQuery(editor.init);

(async () => {
try {
  // We wait a micro-task to let the svgEditor variable be defined for module checks
  await Promise.resolve();
  editor.init();
} catch (err) {
  console.error(err); // eslint-disable-line no-console
}
})();

export default editor;
