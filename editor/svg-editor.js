/* globals jQuery */
/*
 * svg-editor.js
 *
 * Licensed under the MIT License
 *
 * Copyright(c) 2010 Alexis Deveria
 * Copyright(c) 2010 Pavol Rusnak
 * Copyright(c) 2010 Jeff Schiller
 * Copyright(c) 2010 Narendra Sisodiya
 * Copyright(c) 2014 Brett Zamir
 *
 */

import './touch.js';
import {NS} from './svgedit.js';
import {isWebkit, isGecko, isIE, isMac, isTouch} from './browser.js';
import * as Utils from './svgutils.js';
import {getTypeMap, convertUnit, isValidUnit} from './units.js';
import {
  hasCustomHandler, getCustomHandler, injectExtendedContextMenuItemsIntoDom
} from './contextmenu.js';

import SvgCanvas from './svgcanvas.js';
import Layer from './layer.js';

import jqPluginJSHotkeys from './js-hotkeys/jquery.hotkeys.min.js';
import jqPluginBBQ from './jquerybbq/jquery.bbq.min.js';
import jqPluginSVGIcons from './svgicons/jquery.svgicons.js';
import jqPluginJGraduate from './jgraduate/jquery.jgraduate.js';
import jqPluginSpinBtn from './spinbtn/JQuerySpinBtn.js';
import jqPluginSVG from './jquery-svg.js'; // Needed for SVG attribute setting and array form with `attr`
import jqPluginContextMenu from './contextmenu/jquery.contextMenu.js';
import jqPluginJPicker from './jgraduate/jpicker.js';
import {
  readLang, putLocale,
  init as localeInit
} from './locale/locale.js';
import loadStylesheets from './external/load-stylesheets/index-es.js';

const $ = [
  jqPluginJSHotkeys, jqPluginBBQ, jqPluginSVGIcons, jqPluginJGraduate,
  jqPluginSpinBtn, jqPluginSVG, jqPluginContextMenu, jqPluginJPicker
].reduce(($, cb) => cb($), jQuery);

/*
if (!$.loadingStylesheets) {
  $.loadingStylesheets = [];
}
*/
const stylesheet = 'svg-editor.css';
if (!$.loadingStylesheets.includes(stylesheet)) {
  $.loadingStylesheets.push(stylesheet);
}
const favicon = 'images/logo.png';
if ($.loadingStylesheets.some((item) => {
  return Array.isArray(item) && item[0] === favicon;
})) {
  $.loadingStylesheets.push([favicon, {favicon: true}]);
}

const editor = {};

// EDITOR PROPERTIES: (defined below)
//    curPrefs, curConfig, canvas, storage, uiStrings
//
// STATE MAINTENANCE PROPERTIES
editor.tool_scale = 1; // Dependent on icon size, so any use to making configurable instead? Used by JQuerySpinBtn.js
editor.exportWindowCt = 0;
editor.langChanged = false;
editor.showSaveWarning = false;
editor.storagePromptClosed = false; // For use with ext-storage.js

const callbacks = [],
  /**
  * PREFS AND CONFIG
  */
  // The iteration algorithm for defaultPrefs does not currently support array/objects
  defaultPrefs = {
    // EDITOR OPTIONS (DIALOG)
    lang: '', // Default to "en" if locale.js detection does not detect another language
    iconsize: '', // Will default to 's' if the window height is smaller than the minimum height and 'm' otherwise
    bkgd_color: '#FFF',
    bkgd_url: '',
    // DOCUMENT PROPERTIES (DIALOG)
    img_save: 'embed',
    // ALERT NOTICES
    // Only shows in UI as far as alert notices, but useful to remember, so keeping as pref
    save_notice_done: false,
    export_notice_done: false
  },
  defaultExtensions = [
    'ext-overview_window.js',
    'ext-markers.js',
    'ext-connector.js',
    'ext-eyedropper.js',
    'ext-shapes.js',
    'ext-imagelib.js',
    'ext-grid.js',
    'ext-polygon.js',
    'ext-star.js',
    'ext-panning.js',
    'ext-storage.js'
  ],
  defaultConfig = {
    // Todo: svgcanvas.js also sets and checks: show_outside_canvas, selectNew; add here?
    // Change the following to preferences and add pref controls to the UI (e.g., initTool, wireframe, showlayers)?
    canvasName: 'default',
    canvas_expansion: 3,
    initFill: {
      color: 'FF0000', // solid red
      opacity: 1
    },
    initStroke: {
      width: 5,
      color: '000000', // solid black
      opacity: 1
    },
    text: {
      stroke_width: 0,
      font_size: 24,
      font_family: 'serif'
    },
    initOpacity: 1,
    colorPickerCSS: null, // Defaults to 'left' with a position equal to that of the fill_color or stroke_color element minus 140, and a 'bottom' equal to 40
    initTool: 'select',
    exportWindowType: 'new', // 'same' (todo: also support 'download')
    wireframe: false,
    showlayers: false,
    no_save_warning: false,
    // PATH CONFIGURATION
    // The following path configuration items are disallowed in the URL (as should any future path configurations)
    imgPath: 'images/',
    langPath: 'locale/', // Default will be changed if this is a modular load
    extPath: 'extensions/', // Default will be changed if this is a modular load
    extIconsPath: 'extensions/',
    jGraduatePath: 'jgraduate/images/',
    // DOCUMENT PROPERTIES
    // Change the following to a preference (already in the Document Properties dialog)?
    dimensions: [640, 480],
    // EDITOR OPTIONS
    // Change the following to preferences (already in the Editor Options dialog)?
    gridSnapping: false,
    gridColor: '#000',
    baseUnit: 'px',
    snappingStep: 10,
    showRulers: true,
    // URL BEHAVIOR CONFIGURATION
    preventAllURLConfig: false,
    preventURLContentLoading: false,
    // EXTENSION CONFIGURATION (see also preventAllURLConfig)
    lockExtensions: false, // Disallowed in URL setting
    noDefaultExtensions: false, // noDefaultExtensions can only be meaningfully used in `svgedit-config-iife.js` or in the URL
    // EXTENSION-RELATED (GRID)
    showGrid: false, // Set by ext-grid.js
    // EXTENSION-RELATED (STORAGE)
    noStorageOnLoad: false, // Some interaction with ext-storage.js; prevent even the loading of previously saved local storage
    forceStorage: false, // Some interaction with ext-storage.js; strongly discouraged from modification as it bypasses user privacy by preventing them from choosing whether to keep local storage or not
    emptyStorageOnDecline: false // Used by ext-storage.js; empty any prior storage if the user declines to store
  },
  /**
  * LOCALE
  */
  uiStrings = editor.uiStrings = {};

let svgCanvas, urldata,
  isReady = false,
  customExportImage = false,
  customExportPDF = false,
  curPrefs = {},
  // Note: The difference between Prefs and Config is that Prefs
  //   can be changed in the UI and are stored in the browser,
  //   while config cannot
  curConfig = {
    // We do not put on defaultConfig to simplify object copying
    //   procedures (we obtain instead from defaultExtensions)
    extensions: [],
    stylesheets: [],
    /**
    * Can use window.location.origin to indicate the current
    * origin. Can contain a '*' to allow all domains or 'null' (as
    * a string) to support all file:// URLs. Cannot be set by
    * URL for security reasons (not safe, at least for
    * privacy or data integrity of SVG content).
    * Might have been fairly safe to allow
    *   `new URL(window.location.href).origin` by default but
    *   avoiding it ensures some more security that even third
    *   party apps on the same domain also cannot communicate
    *   with this app by default.
    * For use with ext-xdomain-messaging.js
    * @todo We might instead make as a user-facing preference.
    */
    allowedOrigins: []
  };

function loadSvgString (str, callback) {
  const success = svgCanvas.setSvgString(str) !== false;
  callback = callback || $.noop;
  if (success) {
    callback(true); // eslint-disable-line standard/no-callback-literal
  } else {
    $.alert(uiStrings.notification.errorLoadingSVG, function () {
      callback(false); // eslint-disable-line standard/no-callback-literal
    });
  }
}

/**
* EXPORTS
*/

/**
* Store and retrieve preferences
* @param {string} key The preference name to be retrieved or set
* @param {string} [val] The value. If the value supplied is missing or falsey, no change to the preference will be made.
* @returns {string} If val is missing or falsey, the value of the previously stored preference will be returned.
* @todo Can we change setting on the jQuery namespace (onto editor) to avoid conflicts?
* @todo Review whether any remaining existing direct references to
*  getting curPrefs can be changed to use $.pref() getting to ensure
*  defaultPrefs fallback (also for sake of allowInitialUserOverride); specifically, bkgd_color could be changed so that
*  the pref dialog has a button to auto-calculate background, but otherwise uses $.pref() to be able to get default prefs
*  or overridable settings
*/
$.pref = function (key, val) {
  if (val) {
    curPrefs[key] = val;
    editor.curPrefs = curPrefs; // Update exported value
    return;
  }
  return (key in curPrefs) ? curPrefs[key] : defaultPrefs[key];
};

/**
* EDITOR PUBLIC METHODS
* @todo Sort these methods per invocation order, ideally with init at the end
* @todo Prevent execution until init executes if dependent on it?
*/
editor.putLocale = putLocale;
editor.readLang = readLang;

/**
* Where permitted, sets canvas and/or defaultPrefs based on previous
*  storage. This will override URL settings (for security reasons) but
*  not `svgedit-config-iife.js` configuration (unless initial user
*  overriding is explicitly permitted there via `allowInitialUserOverride`).
* @todo Split `allowInitialUserOverride` into `allowOverrideByURL` and
*  `allowOverrideByUserStorage` so `svgedit-config-iife.js` can disallow some
*  individual items for URL setting but allow for user storage AND/OR
*  change URL setting so that it always uses a different namespace,
*  so it won't affect pre-existing user storage (but then if users saves
*  that, it will then be subject to tampering
*/
editor.loadContentAndPrefs = function () {
  if (!curConfig.forceStorage &&
    (curConfig.noStorageOnLoad ||
        !document.cookie.match(/(?:^|;\s*)store=(?:prefsAndContent|prefsOnly)/)
    )
  ) {
    return;
  }

  // LOAD CONTENT
  if (editor.storage && // Cookies do not have enough available memory to hold large documents
    (curConfig.forceStorage ||
      (!curConfig.noStorageOnLoad &&
        document.cookie.match(/(?:^|;\s*)store=prefsAndContent/))
    )
  ) {
    const name = 'svgedit-' + curConfig.canvasName;
    const cached = editor.storage.getItem(name);
    if (cached) {
      editor.loadFromString(cached);
    }
  }

  // LOAD PREFS
  for (const key in defaultPrefs) {
    if (defaultPrefs.hasOwnProperty(key)) { // It's our own config, so we don't need to iterate up the prototype chain
      const storeKey = 'svg-edit-' + key;
      if (editor.storage) {
        const val = editor.storage.getItem(storeKey);
        if (val) {
          defaultPrefs[key] = String(val); // Convert to string for FF (.value fails in Webkit)
        }
      } else if (window.widget) {
        defaultPrefs[key] = window.widget.preferenceForKey(storeKey);
      } else {
        const result = document.cookie.match(new RegExp('(?:^|;\\s*)' + Utils.regexEscape(encodeURIComponent(storeKey)) + '=([^;]+)'));
        defaultPrefs[key] = result ? decodeURIComponent(result[1]) : '';
      }
    }
  }
};

/**
* Allows setting of preferences or configuration (including extensions).
* @param {Object} opts The preferences or configuration (including extensions)
* @param {Object} [cfgCfg] Describes configuration which applies to the
*    particular batch of supplied options
* @param {boolean} [cfgCfg.allowInitialUserOverride=false] Set to true if you wish
*  to allow initial overriding of settings by the user via the URL
*  (if permitted) or previously stored preferences (if permitted);
*  note that it will be too late if you make such calls in extension
*  code because the URL or preference storage settings will
*   have already taken place.
* @param {boolean} [cfgCfg.overwrite=true] Set to false if you wish to
*  prevent the overwriting of prior-set preferences or configuration
*  (URL settings will always follow this requirement for security
*  reasons, so `svgedit-config-iife.js` settings cannot be overridden unless it
*  explicitly permits via `allowInitialUserOverride` but extension config
*  can be overridden as they will run after URL settings). Should
*   not be needed in `svgedit-config-iife.js`.
*/
editor.setConfig = function (opts, cfgCfg) {
  cfgCfg = cfgCfg || {};
  function extendOrAdd (cfgObj, key, val) {
    if (cfgObj[key] && typeof cfgObj[key] === 'object') {
      $.extend(true, cfgObj[key], val);
    } else {
      cfgObj[key] = val;
    }
  }
  $.each(opts, function (key, val) {
    if (opts.hasOwnProperty(key)) {
      // Only allow prefs defined in defaultPrefs
      if (defaultPrefs.hasOwnProperty(key)) {
        if (cfgCfg.overwrite === false && (
          curConfig.preventAllURLConfig ||
          curPrefs.hasOwnProperty(key)
        )) {
          return;
        }
        if (cfgCfg.allowInitialUserOverride === true) {
          defaultPrefs[key] = val;
        } else {
          $.pref(key, val);
        }
      } else if (['extensions', 'stylesheets', 'allowedOrigins'].includes(key)) {
        if (cfgCfg.overwrite === false &&
          (
            curConfig.preventAllURLConfig ||
            ['allowedOrigins', 'stylesheets'].includes(key) ||
            (key === 'extensions' && curConfig.lockExtensions)
          )
        ) {
          return;
        }
        curConfig[key] = curConfig[key].concat(val); // We will handle any dupes later
      // Only allow other curConfig if defined in defaultConfig
      } else if (defaultConfig.hasOwnProperty(key)) {
        if (cfgCfg.overwrite === false && (
          curConfig.preventAllURLConfig ||
          curConfig.hasOwnProperty(key)
        )) {
          return;
        }
        // Potentially overwriting of previously set config
        if (curConfig.hasOwnProperty(key)) {
          if (cfgCfg.overwrite === false) {
            return;
          }
          extendOrAdd(curConfig, key, val);
        } else {
          if (cfgCfg.allowInitialUserOverride === true) {
            extendOrAdd(defaultConfig, key, val);
          } else {
            if (defaultConfig[key] && typeof defaultConfig[key] === 'object') {
              curConfig[key] = {};
              $.extend(true, curConfig[key], val); // Merge properties recursively, e.g., on initFill, initStroke objects
            } else {
              curConfig[key] = val;
            }
          }
        }
      }
    }
  });
  editor.curConfig = curConfig; // Update exported value
};

/**
* @param {Object} opts Extension mechanisms may call setCustomHandlers with three functions: opts.open, opts.save, and opts.exportImage
* opts.open's responsibilities are:
*  - invoke a file chooser dialog in 'open' mode
*  - let user pick a SVG file
*  - calls svgCanvas.setSvgString() with the string contents of that file
*  opts.save's responsibilities are:
*  - accept the string contents of the current document
*  - invoke a file chooser dialog in 'save' mode
*  - save the file to location chosen by the user
*  opts.exportImage's responsibilities (with regard to the object it is supplied in its 2nd argument) are:
*  - inform user of any issues supplied via the "issues" property
*  - convert the "svg" property SVG string into an image for export;
*    utilize the properties "type" (currently 'PNG', 'JPEG', 'BMP',
*    'WEBP', 'PDF'), "mimeType", and "quality" (for 'JPEG' and 'WEBP'
*    types) to determine the proper output.
*/
editor.setCustomHandlers = function (opts) {
  editor.ready(function () {
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

editor.randomizeIds = function () {
  svgCanvas.randomizeIds(arguments);
};

editor.init = function () {
  const modularVersion = !('svgEditor' in window) ||
    !window.svgEditor ||
    window.svgEditor.modules !== false;
  if (!modularVersion) {
    Object.assign(defaultConfig, {
      langPath: '../dist/locale/',
      extPath: '../dist/extensions/'
    });
  }

  // const host = location.hostname,
  //  onWeb = host && host.includes('.');
  // Some FF versions throw security errors here when directly accessing
  try {
    if ('localStorage' in window) { // && onWeb removed so Webkit works locally
      editor.storage = localStorage;
    }
  } catch (err) {}

  // Todo: Avoid var-defined functions and group functions together, etc. where possible
  const goodLangs = [];
  $('#lang_select option').each(function () {
    goodLangs.push(this.value);
  });

  function setupCurPrefs () {
    curPrefs = $.extend(true, {}, defaultPrefs, curPrefs); // Now safe to merge with priority for curPrefs in the event any are already set
    // Export updated prefs
    editor.curPrefs = curPrefs;
  }
  function setupCurConfig () {
    curConfig = $.extend(true, {}, defaultConfig, curConfig); // Now safe to merge with priority for curConfig in the event any are already set

    // Now deal with extensions and other array config
    if (!curConfig.noDefaultExtensions) {
      curConfig.extensions = curConfig.extensions.concat(defaultExtensions);
    }
    // ...and remove any dupes
    $.each(['extensions', 'stylesheets', 'allowedOrigins'], function (i, cfg) {
      curConfig[cfg] = $.grep(curConfig[cfg], function (n, i) { // Supposedly faster than filter per http://amandeep1986.blogspot.hk/2015/02/jquery-grep-vs-js-filter.html
        return i === curConfig[cfg].indexOf(n);
      });
    });
    // Export updated config
    editor.curConfig = curConfig;
  }
  (() => {
    // Load config/data from URL if given
    let src, qstr;
    urldata = $.deparam.querystring(true);
    if (!$.isEmptyObject(urldata)) {
      if (urldata.dimensions) {
        urldata.dimensions = urldata.dimensions.split(',');
      }

      if (urldata.bkgd_color) {
        urldata.bkgd_color = '#' + urldata.bkgd_color;
      }

      if (urldata.extensions) {
        // For security reasons, disallow cross-domain or cross-folder extensions via URL
        urldata.extensions = urldata.extensions.match(/[:/\\]/) ? '' : urldata.extensions.split(',');
      }

      // Disallowing extension paths via URL for
      // security reasons, even for same-domain
      // ones given potential to interact in undesirable
      // ways with other script resources
      $.each(
        [
          'extPath', 'imgPath', 'extIconsPath',
          'langPath', 'jGraduatePath'
        ],
        function (pathConfig) {
          if (urldata[pathConfig]) {
            delete urldata[pathConfig];
          }
        }
      );

      editor.setConfig(urldata, {overwrite: false}); // Note: source and url (as with storagePrompt later) are not set on config but are used below

      setupCurConfig();

      if (!curConfig.preventURLContentLoading) {
        src = urldata.source;
        qstr = $.param.querystring();
        if (!src) { // urldata.source may have been null if it ended with '='
          if (qstr.includes('source=data:')) {
            src = qstr.match(/source=(data:[^&]*)/)[1];
          }
        }
        if (src) {
          if (src.startsWith('data:')) {
            editor.loadFromDataURI(src);
          } else {
            editor.loadFromString(src);
          }
          return;
        }
        if (urldata.url) {
          editor.loadFromURL(urldata.url);
          return;
        }
      }
      if (!urldata.noStorageOnLoad || curConfig.forceStorage) {
        editor.loadContentAndPrefs();
      }
      setupCurPrefs();
    } else {
      setupCurConfig();
      editor.loadContentAndPrefs();
      setupCurPrefs();
    }
  })();

  const setIcon = editor.setIcon = function (elem, iconId, forcedSize) {
    const icon = (typeof iconId === 'string') ? $.getSvgIcon(iconId, true) : iconId.clone();
    if (!icon) {
      console.log('NOTE: Icon image missing: ' + iconId);
      return;
    }
    $(elem).empty().append(icon);
  };

  const extFunc = function () {
    $.each(curConfig.extensions, function () {
      const extname = this;
      if (!extname.match(/^ext-.*\.js/)) { // Ensure URL cannot specify some other unintended file in the extPath
        return;
      }
      const s = document.createElement('script');
      if (modularVersion) {
        s.type = 'module'; // Make this the default when widely supported
      }
      const url = curConfig.extPath + extname;
      s.src = url;
      document.querySelector('head').appendChild(s);
      /*
      // Todo: Insert script with type=module instead when modules widely supported
      $.getScript(curConfig.extPath + extname, function (d) {
        // Fails locally in Chrome 5
        if (!d) {
          const s = document.createElement('script');
          s.src = curConfig.extPath + extname;
          document.querySelector('head').appendChild(s);
        }
      }).fail((jqxhr, settings, exception) => {
        console.log(exception);
      });
      */
    });

    // const lang = ('lang' in curPrefs) ? curPrefs.lang : null;
    editor.putLocale(null, goodLangs, curConfig);
  };

  const stateObj = {tool_scale: editor.tool_scale};

  const setFlyoutPositions = function () {
    $('.tools_flyout').each(function () {
      const shower = $('#' + this.id + '_show');
      const pos = shower.offset();
      const w = shower.outerWidth();
      $(this).css({left: (pos.left + w) * editor.tool_scale, top: pos.top});
    });
  };

  const scaleElements = function (elems, scale) {
    // const prefix = '-' + uaPrefix.toLowerCase() + '-'; // Currently unused
    const sides = ['top', 'left', 'bottom', 'right'];

    elems.each(function () {
      // Handled in CSS
      // this.style[uaPrefix + 'Transform'] = 'scale(' + scale + ')';
      const el = $(this);
      const w = el.outerWidth() * (scale - 1);
      const h = el.outerHeight() * (scale - 1);
      // const margins = {}; // Currently unused

      for (let i = 0; i < 4; i++) {
        const s = sides[i];
        let cur = el.data('orig_margin-' + s);
        if (cur == null) {
          cur = parseInt(el.css('margin-' + s), 10);
          // Cache the original margin
          el.data('orig_margin-' + s, cur);
        }
        let val = cur * scale;
        if (s === 'right') {
          val += w;
        } else if (s === 'bottom') {
          val += h;
        }

        el.css('margin-' + s, val);
        // el.css('outline', '1px solid red');
      }
    });
  };

  const setIconSize = editor.setIconSize = function (size) {
    // const elems = $('.tool_button, .push_button, .tool_button_current, .disabled, .icon_label, #url_notice, #tool_open');
    const selToscale = '#tools_top .toolset, #editor_panel > *, #history_panel > *,' +
  '        #main_button, #tools_left > *, #path_node_panel > *, #multiselected_panel > *,' +
  '        #g_panel > *, #tool_font_size > *, .tools_flyout';

    const elems = $(selToscale);

    let scale = 1;
    if (typeof size === 'number') {
      scale = size;
    } else {
      const iconSizes = {s: 0.75, m: 1, l: 1.25, xl: 1.5};
      scale = iconSizes[size];
    }

    stateObj.tool_scale = editor.tool_scale = scale;

    setFlyoutPositions();
    // $('.tools_flyout').each(function () {
    //   const pos = $(this).position();
    //   console.log($(this), pos.left+(34 * scale));
    //   $(this).css({left: pos.left+(34 * scale), top: pos.top+(77 * scale)});
    //   console.log('l', $(this).css('left'));
    // });
    //
    // const scale = .75;

    const hiddenPs = elems.parents(':hidden');
    hiddenPs.css('visibility', 'hidden').show();
    scaleElements(elems, scale);
    hiddenPs.css('visibility', 'visible').hide();
    // return;

    $.pref('iconsize', size);
    $('#iconsize').val(size);

    // Change icon size
    // $('.tool_button, .push_button, .tool_button_current, .disabled, .icon_label, #url_notice, #tool_open')
    // .find('> svg, > img').each(function () {
    //   this.setAttribute('width',size_num);
    //   this.setAttribute('height',size_num);
    // });
    //
    // $.resizeSvgIcons({
    //   '.flyout_arrow_horiz > svg, .flyout_arrow_horiz > img': size_num / 5,
    //   '#logo > svg, #logo > img': size_num * 1.3,
    //   '#tools_bottom .icon_label > *': (size_num === 16 ? 18 : size_num * .75)
    // });
    // if (size != 's') {
    //   $.resizeSvgIcons({'#layerbuttons svg, #layerbuttons img': size_num * .6});
    // }

    // Note that all rules will be prefixed with '#svg_editor' when parsed
    const cssResizeRules = {
      // '.tool_button,\
      // .push_button,\
      // .tool_button_current,\
      // .push_button_pressed,\
      // .disabled,\
      // .icon_label,\
      // .tools_flyout .tool_button': {
      //   width: {s: '16px', l: '32px', xl: '48px'},
      //   height: {s: '16px', l: '32px', xl: '48px'},
      //   padding: {s: '1px', l: '2px', xl: '3px'}
      // },
      // '.tool_sep': {
      //   height: {s: '16px', l: '32px', xl: '48px'},
      //   margin: {s: '2px 2px', l: '2px 5px', xl: '2px 8px'}
      // },
      // '#main_icon': {
      //   width: {s: '31px', l: '53px', xl: '75px'},
      //   height: {s: '22px', l: '42px', xl: '64px'}
      // },
      '#tools_top': {
        left: 50 + $('#main_button').width(),
        height: 72
      },
      '#tools_left': {
        width: 31,
        top: 74
      },
      'div#workarea': {
        left: 38,
        top: 74
      }
      // '#tools_bottom': {
      //   left: {s: '27px', l: '46px', xl: '65px'},
      //   height: {s: '58px', l: '98px', xl: '145px'}
      // },
      // '#color_tools': {
      //   'border-spacing': {s: '0 1px'},
      //   'margin-top': {s: '-1px'}
      // },
      // '#color_tools .icon_label': {
      //   width: {l:'43px', xl: '60px'}
      // },
      // '.color_tool': {
      //   height: {s: '20px'}
      // },
      // '#tool_opacity': {
      //   top: {s: '1px'},
      //   height: {s: 'auto', l:'auto', xl:'auto'}
      // },
      // '#tools_top input, #tools_bottom input': {
      //   'margin-top': {s: '2px', l: '4px', xl: '5px'},
      //   height: {s: 'auto', l: 'auto', xl: 'auto'},
      //   border: {s: '1px solid #555', l: 'auto', xl: 'auto'},
      //   'font-size': {s: '.9em', l: '1.2em', xl: '1.4em'}
      // },
      // '#zoom_panel': {
      //   'margin-top': {s: '3px', l: '4px', xl: '5px'}
      // },
      // '#copyright, #tools_bottom .label': {
      //   'font-size': {l: '1.5em', xl: '2em'},
      //   'line-height': {s: '15px'}
      // },
      // '#tools_bottom_2': {
      //   width: {l: '295px', xl: '355px'},
      //   top: {s: '4px'}
      // },
      // '#tools_top > div, #tools_top': {
      //   'line-height': {s: '17px', l: '34px', xl: '50px'}
      // },
      // '.dropdown button': {
      //   height: {s: '18px', l: '34px', xl: '40px'},
      //   'line-height': {s: '18px', l: '34px', xl: '40px'},
      //   'margin-top': {s: '3px'}
      // },
      // '#tools_top label, #tools_bottom label': {
      //   'font-size': {s: '1em', l: '1.5em', xl: '2em'},
      //   height: {s: '25px', l: '42px', xl: '64px'}
      // },
      // 'div.toolset': {
      //   height: {s: '25px', l: '42px', xl: '64px'}
      // },
      // '#tool_bold, #tool_italic': {
      //   'font-size': {s: '1.5em', l: '3em', xl: '4.5em'}
      // },
      // '#sidepanels': {
      //   top: {s: '50px', l: '88px', xl: '125px'},
      //   bottom: {s: '51px', l: '68px', xl: '65px'}
      // },
      // '#layerbuttons': {
      //   width: {l: '130px', xl: '175px'},
      //   height: {l: '24px', xl: '30px'}
      // },
      // '#layerlist': {
      //   width: {l: '128px', xl: '150px'}
      // },
      // '.layer_button': {
      //   width: {l: '19px', xl: '28px'},
      //   height: {l: '19px', xl: '28px'}
      // },
      // 'input.spin-button': {
      //   'background-image': {l: 'url('images/spinbtn_updn_big.png')', xl: 'url('images/spinbtn_updn_big.png')'},
      //   'background-position': {l: '100% -5px', xl: '100% -2px'},
      //   'padding-right': {l: '24px', xl: '24px' }
      // },
      // 'input.spin-button.up': {
      //   'background-position': {l: '100% -45px', xl: '100% -42px'}
      // },
      // 'input.spin-button.down': {
      //   'background-position': {l: '100% -85px', xl: '100% -82px'}
      // },
      // '#position_opts': {
      //   width: {all: (size_num*4) +'px'}
      // }
    };

    let ruleElem = $('#tool_size_rules');
    if (!ruleElem.length) {
      ruleElem = $('<style id="tool_size_rules"></style>').appendTo('head');
    } else {
      ruleElem.empty();
    }

    if (size !== 'm') {
      let styleStr = '';
      $.each(cssResizeRules, function (selector, rules) {
        selector = '#svg_editor ' + selector.replace(/,/g, ', #svg_editor');
        styleStr += selector + '{';
        $.each(rules, function (prop, values) {
          let val;
          if (typeof values === 'number') {
            val = (values * scale) + 'px';
          } else if (values[size] || values.all) {
            val = (values[size] || values.all);
          }
          styleStr += (prop + ':' + val + ';');
        });
        styleStr += '}';
      });
      // this.style[uaPrefix + 'Transform'] = 'scale(' + scale + ')';
      const prefix = '-' + uaPrefix.toLowerCase() + '-';
      styleStr += (selToscale + '{' + prefix + 'transform: scale(' + scale + ');}' +
        ' #svg_editor div.toolset .toolset {' + prefix + 'transform: scale(1); margin: 1px !important;}' + // Hack for markers
        ' #svg_editor .ui-slider {' + prefix + 'transform: scale(' + (1 / scale) + ');}' // Hack for sliders
      );
      ruleElem.text(styleStr);
    }

    setFlyoutPositions();
  };
  $.svgIcons(curConfig.imgPath + 'svg_edit_icons.svg', {
    w: 24, h: 24,
    id_match: false,
    no_img: !isWebkit(), // Opera & Firefox 4 gives odd behavior w/images
    fallback_path: curConfig.imgPath,
    fallback: {
      new_image: 'clear.png',
      save: 'save.png',
      open: 'open.png',
      source: 'source.png',
      docprops: 'document-properties.png',
      wireframe: 'wireframe.png',

      undo: 'undo.png',
      redo: 'redo.png',

      select: 'select.png',
      select_node: 'select_node.png',
      pencil: 'fhpath.png',
      pen: 'line.png',
      square: 'square.png',
      rect: 'rect.png',
      fh_rect: 'freehand-square.png',
      circle: 'circle.png',
      ellipse: 'ellipse.png',
      fh_ellipse: 'freehand-circle.png',
      path: 'path.png',
      text: 'text.png',
      image: 'image.png',
      zoom: 'zoom.png',

      clone: 'clone.png',
      node_clone: 'node_clone.png',
      delete: 'delete.png',
      node_delete: 'node_delete.png',
      group: 'shape_group_elements.png',
      ungroup: 'shape_ungroup.png',
      move_top: 'move_top.png',
      move_bottom: 'move_bottom.png',
      to_path: 'to_path.png',
      link_controls: 'link_controls.png',
      reorient: 'reorient.png',

      align_left: 'align-left.png',
      align_center: 'align-center.png',
      align_right: 'align-right.png',
      align_top: 'align-top.png',
      align_middle: 'align-middle.png',
      align_bottom: 'align-bottom.png',

      go_up: 'go-up.png',
      go_down: 'go-down.png',

      ok: 'save.png',
      cancel: 'cancel.png',

      arrow_right: 'flyouth.png',
      arrow_down: 'dropdown.gif'
    },
    placement: {
      '#logo': 'logo',

      '#tool_clear div,#layer_new': 'new_image',
      '#tool_save div': 'save',
      '#tool_export div': 'export',
      '#tool_open div div': 'open',
      '#tool_import div div': 'import',
      '#tool_source': 'source',
      '#tool_docprops > div': 'docprops',
      '#tool_wireframe': 'wireframe',

      '#tool_undo': 'undo',
      '#tool_redo': 'redo',

      '#tool_select': 'select',
      '#tool_fhpath': 'pencil',
      '#tool_line': 'pen',
      '#tool_rect,#tools_rect_show': 'rect',
      '#tool_square': 'square',
      '#tool_fhrect': 'fh_rect',
      '#tool_ellipse,#tools_ellipse_show': 'ellipse',
      '#tool_circle': 'circle',
      '#tool_fhellipse': 'fh_ellipse',
      '#tool_path': 'path',
      '#tool_text,#layer_rename': 'text',
      '#tool_image': 'image',
      '#tool_zoom': 'zoom',

      '#tool_clone,#tool_clone_multi': 'clone',
      '#tool_node_clone': 'node_clone',
      '#layer_delete,#tool_delete,#tool_delete_multi': 'delete',
      '#tool_node_delete': 'node_delete',
      '#tool_add_subpath': 'add_subpath',
      '#tool_openclose_path': 'open_path',
      '#tool_move_top': 'move_top',
      '#tool_move_bottom': 'move_bottom',
      '#tool_topath': 'to_path',
      '#tool_node_link': 'link_controls',
      '#tool_reorient': 'reorient',
      '#tool_group_elements': 'group_elements',
      '#tool_ungroup': 'ungroup',
      '#tool_unlink_use': 'unlink_use',

      '#tool_alignleft, #tool_posleft': 'align_left',
      '#tool_aligncenter, #tool_poscenter': 'align_center',
      '#tool_alignright, #tool_posright': 'align_right',
      '#tool_aligntop, #tool_postop': 'align_top',
      '#tool_alignmiddle, #tool_posmiddle': 'align_middle',
      '#tool_alignbottom, #tool_posbottom': 'align_bottom',
      '#cur_position': 'align',

      '#linecap_butt,#cur_linecap': 'linecap_butt',
      '#linecap_round': 'linecap_round',
      '#linecap_square': 'linecap_square',

      '#linejoin_miter,#cur_linejoin': 'linejoin_miter',
      '#linejoin_round': 'linejoin_round',
      '#linejoin_bevel': 'linejoin_bevel',

      '#url_notice': 'warning',

      '#layer_up': 'go_up',
      '#layer_down': 'go_down',
      '#layer_moreopts': 'context_menu',
      '#layerlist td.layervis': 'eye',

      '#tool_source_save,#tool_docprops_save,#tool_prefs_save': 'ok',
      '#tool_source_cancel,#tool_docprops_cancel,#tool_prefs_cancel': 'cancel',

      '#rwidthLabel, #iwidthLabel': 'width',
      '#rheightLabel, #iheightLabel': 'height',
      '#cornerRadiusLabel span': 'c_radius',
      '#angleLabel': 'angle',
      '#linkLabel,#tool_make_link,#tool_make_link_multi': 'globe_link',
      '#zoomLabel': 'zoom',
      '#tool_fill label': 'fill',
      '#tool_stroke .icon_label': 'stroke',
      '#group_opacityLabel': 'opacity',
      '#blurLabel': 'blur',
      '#font_sizeLabel': 'fontsize',

      '.flyout_arrow_horiz': 'arrow_right',
      '.dropdown button, #main_button .dropdown': 'arrow_down',
      '#palette .palette_item:first, #fill_bg, #stroke_bg': 'no_color'
    },
    resize: {
      '#logo .svg_icon': 28,
      '.flyout_arrow_horiz .svg_icon': 5,
      '.layer_button .svg_icon, #layerlist td.layervis .svg_icon': 14,
      '.dropdown button .svg_icon': 7,
      '#main_button .dropdown .svg_icon': 9,
      '.palette_item:first .svg_icon': 15,
      '#fill_bg .svg_icon, #stroke_bg .svg_icon': 16,
      '.toolbar_button button .svg_icon': 16,
      '.stroke_tool div div .svg_icon': 20,
      '#tools_bottom label .svg_icon': 18
    },
    callback (icons) {
      $('.toolbar_button button > svg, .toolbar_button button > img').each(function () {
        $(this).parent().prepend(this);
      });

      const tleft = $('#tools_left');

      let minHeight;
      if (tleft.length) {
        minHeight = tleft.offset().top + tleft.outerHeight();
      }

      const size = $.pref('iconsize');
      editor.setIconSize(size || ($(window).height() < minHeight ? 's' : 'm'));

      // Look for any missing flyout icons from plugins
      $('.tools_flyout').each(function () {
        const shower = $('#' + this.id + '_show');
        const sel = shower.attr('data-curopt');
        // Check if there's an icon here
        if (!shower.children('svg, img').length) {
          const clone = $(sel).children().clone();
          if (clone.length) {
            clone[0].removeAttribute('style'); // Needed for Opera
            shower.append(clone);
          }
        }
      });

      let stylesheets = $.loadingStylesheets;
      if (curConfig.stylesheets.length) {
        // Ensure a copy with unique items
        stylesheets = [...new Set(curConfig.stylesheets)];
        const idx = stylesheets.indexOf('@default');
        if (idx > -1) {
          stylesheets.splice(idx, 1, ...$.loadingStylesheets);
        }
      }
      loadStylesheets(stylesheets).then(() => {
        editor.runCallbacks();

        setTimeout(function () {
          $('.flyout_arrow_horiz:empty').each(function () {
            $(this).append($.getSvgIcon('arrow_right').width(5).height(5));
          });
        }, 1);
      });
    }
  });

  editor.canvas = svgCanvas = new SvgCanvas(
    document.getElementById('svgcanvas'),
    curConfig
  );
  const palette = [ // Todo: Make into configuration item?
      '#000000', '#3f3f3f', '#7f7f7f', '#bfbfbf', '#ffffff',
      '#ff0000', '#ff7f00', '#ffff00', '#7fff00',
      '#00ff00', '#00ff7f', '#00ffff', '#007fff',
      '#0000ff', '#7f00ff', '#ff00ff', '#ff007f',
      '#7f0000', '#7f3f00', '#7f7f00', '#3f7f00',
      '#007f00', '#007f3f', '#007f7f', '#003f7f',
      '#00007f', '#3f007f', '#7f007f', '#7f003f',
      '#ffaaaa', '#ffd4aa', '#ffffaa', '#d4ffaa',
      '#aaffaa', '#aaffd4', '#aaffff', '#aad4ff',
      '#aaaaff', '#d4aaff', '#ffaaff', '#ffaad4'
    ],
    modKey = (isMac() ? 'meta+' : 'ctrl+'), // ⌘
    path = svgCanvas.pathActions,
    {undoMgr} = svgCanvas,
    workarea = $('#workarea'),
    canvMenu = $('#cmenu_canvas'),
    // layerMenu = $('#cmenu_layers'), // Unused
    paintBox = {fill: null, stroke: null};

  let resizeTimer, curScrollPos;
  let exportWindow = null,
    defaultImageURL = curConfig.imgPath + 'logo.png',
    zoomInIcon = 'crosshair',
    zoomOutIcon = 'crosshair',
    uiContext = 'toolbars';

  // For external openers
  (function () {
    // let the opener know SVG Edit is ready (now that config is set up)
    const w = window.opener || window.parent;
    let svgEditorReadyEvent;
    if (w) {
      try {
        svgEditorReadyEvent = w.document.createEvent('Event');
        svgEditorReadyEvent.initEvent('svgEditorReady', true, true);
        w.document.documentElement.dispatchEvent(svgEditorReadyEvent);
      } catch (e) {}
    }
  }());

  // This sets up alternative dialog boxes. They mostly work the same way as
  // their UI counterparts, expect instead of returning the result, a callback
  // needs to be included that returns the result as its first parameter.
  // In the future we may want to add additional types of dialog boxes, since
  // they should be easy to handle this way.
  (function () {
    $('#dialog_container').draggable({
      cancel: '#dialog_content, #dialog_buttons *',
      containment: 'window'
    }).css('position', 'absolute');
    const box = $('#dialog_box'),
      btnHolder = $('#dialog_buttons'),
      dialogContent = $('#dialog_content'),
      dbox = function (type, msg, callback, defaultVal, opts, changeCb, checkbox) {
        dialogContent.html('<p>' + msg.replace(/\n/g, '</p><p>') + '</p>')
          .toggleClass('prompt', (type === 'prompt'));
        btnHolder.empty();

        const ok = $('<input type="button" value="' + uiStrings.common.ok + '">').appendTo(btnHolder);

        if (type !== 'alert') {
          $('<input type="button" value="' + uiStrings.common.cancel + '">')
            .appendTo(btnHolder)
            .click(function () {
              box.hide();
              if (callback) {
                callback(false); // eslint-disable-line standard/no-callback-literal
              }
            });
        }

        let ctrl, chkbx;
        if (type === 'prompt') {
          ctrl = $('<input type="text">').prependTo(btnHolder);
          ctrl.val(defaultVal || '');
          ctrl.bind('keydown', 'return', function () { ok.click(); });
        } else if (type === 'select') {
          const div = $('<div style="text-align:center;">');
          ctrl = $('<select>').appendTo(div);
          if (checkbox) {
            const label = $('<label>').text(checkbox.label);
            chkbx = $('<input type="checkbox">').appendTo(label);
            chkbx.val(checkbox.value);
            if (checkbox.tooltip) {
              label.attr('title', checkbox.tooltip);
            }
            chkbx.prop('checked', !!checkbox.checked);
            div.append($('<div>').append(label));
          }
          $.each(opts || [], function (opt, val) {
            if (typeof val === 'object') {
              ctrl.append($('<option>').val(val.value).html(val.text));
            } else {
              ctrl.append($('<option>').html(val));
            }
          });
          dialogContent.append(div);
          if (defaultVal) {
            ctrl.val(defaultVal);
          }
          if (changeCb) {
            ctrl.bind('change', 'return', changeCb);
          }
          ctrl.bind('keydown', 'return', function () { ok.click(); });
        } else if (type === 'process') {
          ok.hide();
        }

        box.show();

        ok.click(function () {
          box.hide();
          const resp = (type === 'prompt' || type === 'select') ? ctrl.val() : true;
          if (callback) {
            if (chkbx) {
              callback(resp, chkbx.prop('checked'));
            } else {
              callback(resp);
            }
          }
        }).focus();

        if (type === 'prompt' || type === 'select') {
          ctrl.focus();
        }
      };

    $.alert = function (msg, cb) { dbox('alert', msg, cb); };
    $.confirm = function (msg, cb) { dbox('confirm', msg, cb); };
    $.process_cancel = function (msg, cb) { dbox('process', msg, cb); };
    $.prompt = function (msg, txt, cb) { dbox('prompt', msg, cb, txt); };
    $.select = function (msg, opts, cb, changeCb, txt, checkbox) { dbox('select', msg, cb, txt, opts, changeCb, checkbox); };
  }());

  const setSelectMode = function () {
    const curr = $('.tool_button_current');
    if (curr.length && curr[0].id !== 'tool_select') {
      curr.removeClass('tool_button_current').addClass('tool_button');
      $('#tool_select').addClass('tool_button_current').removeClass('tool_button');
      $('#styleoverrides').text('#svgcanvas svg *{cursor:move;pointer-events:all} #svgcanvas svg{cursor:default}');
    }
    svgCanvas.setMode('select');
    workarea.css('cursor', 'auto');
  };

  // used to make the flyouts stay on the screen longer the very first time
  // const flyoutspeed = 1250; // Currently unused
  // let textBeingEntered = false; // Currently unused
  const origTitle = $('title:first').text();
  // Make [1,2,5] array
  const rIntervals = [];
  for (let i = 0.1; i < 1E5; i *= 10) {
    rIntervals.push(i);
    rIntervals.push(2 * i);
    rIntervals.push(5 * i);
  }

  // This function highlights the layer passed in (by fading out the other layers)
  // if no layer is passed in, this function restores the other layers
  const toggleHighlightLayer = function (layerNameToHighlight) {
    let i;
    const curNames = [], numLayers = svgCanvas.getCurrentDrawing().getNumLayers();
    for (i = 0; i < numLayers; i++) {
      curNames[i] = svgCanvas.getCurrentDrawing().getLayerName(i);
    }

    if (layerNameToHighlight) {
      for (i = 0; i < numLayers; ++i) {
        if (curNames[i] !== layerNameToHighlight) {
          svgCanvas.getCurrentDrawing().setLayerOpacity(curNames[i], 0.5);
        }
      }
    } else {
      for (i = 0; i < numLayers; ++i) {
        svgCanvas.getCurrentDrawing().setLayerOpacity(curNames[i], 1.0);
      }
    }
  };

  const populateLayers = function () {
    svgCanvas.clearSelection();
    const layerlist = $('#layerlist tbody').empty();
    const selLayerNames = $('#selLayerNames').empty();
    const drawing = svgCanvas.getCurrentDrawing();
    const currentLayerName = drawing.getCurrentLayerName();
    const icon = $.getSvgIcon('eye');
    let layer = svgCanvas.getCurrentDrawing().getNumLayers();
    // we get the layers in the reverse z-order (the layer rendered on top is listed first)
    while (layer--) {
      const name = drawing.getLayerName(layer);
      const layerTr = $('<tr class="layer">').toggleClass('layersel', name === currentLayerName);
      const layerVis = $('<td class="layervis">').toggleClass('layerinvis', !drawing.getLayerVisibility(name));
      const layerName = $('<td class="layername">' + name + '</td>');
      layerlist.append(layerTr.append(layerVis, layerName));
      selLayerNames.append('<option value="' + name + '">' + name + '</option>');
    }
    if (icon !== undefined) {
      const copy = icon.clone();
      $('td.layervis', layerlist).append(copy);
      $.resizeSvgIcons({'td.layervis .svg_icon': 14});
    }
    // handle selection of layer
    $('#layerlist td.layername')
      .mouseup(function (evt) {
        $('#layerlist tr.layer').removeClass('layersel');
        $(this.parentNode).addClass('layersel');
        svgCanvas.setCurrentLayer(this.textContent);
        evt.preventDefault();
      })
      .mouseover(function () {
        toggleHighlightLayer(this.textContent);
      })
      .mouseout(function () {
        toggleHighlightLayer();
      });
    $('#layerlist td.layervis').click(function () {
      const row = $(this.parentNode).prevAll().length;
      const name = $('#layerlist tr.layer:eq(' + row + ') td.layername').text();
      const vis = $(this).hasClass('layerinvis');
      svgCanvas.setLayerVisibility(name, vis);
      $(this).toggleClass('layerinvis');
    });

    // if there were too few rows, let's add a few to make it not so lonely
    let num = 5 - $('#layerlist tr.layer').size();
    while (num-- > 0) {
      // FIXME: there must a better way to do this
      layerlist.append('<tr><td style="color:white">_</td><td/></tr>');
    }
  };

  let editingsource = false;
  let origSource = '';
  const showSourceEditor = function (e, forSaving) {
    if (editingsource) { return; }

    editingsource = true;
    origSource = svgCanvas.getSvgString();
    $('#save_output_btns').toggle(!!forSaving);
    $('#tool_source_back').toggle(!forSaving);
    $('#svg_source_textarea').val(origSource);
    $('#svg_source_editor').fadeIn();
    $('#svg_source_textarea').focus();
  };

  let selectedElement = null;
  let multiselected = false;

  const togglePathEditMode = function (editmode, elems) {
    $('#path_node_panel').toggle(editmode);
    $('#tools_bottom_2,#tools_bottom_3').toggle(!editmode);
    if (editmode) {
      // Change select icon
      $('.tool_button_current').removeClass('tool_button_current').addClass('tool_button');
      $('#tool_select').addClass('tool_button_current').removeClass('tool_button');
      setIcon('#tool_select', 'select_node');
      multiselected = false;
      if (elems.length) {
        selectedElement = elems[0];
      }
    } else {
      setTimeout(() => {
        setIcon('#tool_select', 'select');
      }, 1000);
    }
  };

  const saveHandler = function (wind, svg) {
    editor.showSaveWarning = false;

    // by default, we add the XML prolog back, systems integrating SVG-edit (wikis, CMSs)
    // can just provide their own custom save handler and might not want the XML prolog
    svg = '<?xml version="1.0"?>\n' + svg;

    // IE9 doesn't allow standalone Data URLs
    // https://connect.microsoft.com/IE/feedback/details/542600/data-uri-images-fail-when-loaded-by-themselves
    if (isIE()) {
      showSourceEditor(0, true);
      return;
    }

    // Since saving SVGs by opening a new window was removed in Chrome use artificial link-click
    // https://stackoverflow.com/questions/45603201/window-is-not-allowed-to-navigate-top-frame-navigations-to-data-urls
    const a = document.createElement('a');
    a.href = 'data:image/svg+xml;base64,' + Utils.encode64(svg);
    a.download = 'icon.svg';

    a.click();

    // Alert will only appear the first time saved OR the
    //   first time the bug is encountered
    let done = $.pref('save_notice_done');
    if (done !== 'all') {
      let note = uiStrings.notification.saveFromBrowser.replace('%s', 'SVG');
      // Check if FF and has <defs/>
      if (isGecko()) {
        if (svg.includes('<defs')) {
          // warning about Mozilla bug #308590 when applicable (seems to be fixed now in Feb 2013)
          note += '\n\n' + uiStrings.notification.defsFailOnSave;
          $.pref('save_notice_done', 'all');
          done = 'all';
        } else {
          $.pref('save_notice_done', 'part');
        }
      } else {
        $.pref('save_notice_done', 'all');
      }
      if (done !== 'part') {
        alert(note);
      }
    }
  };

  const exportHandler = function (win, data) {
    const {issues, exportWindowName} = data;

    if (exportWindowName) {
      exportWindow = window.open(Utils.blankPageObjectURL || '', exportWindowName); // A hack to get the window via JSON-able name without opening a new one
    }

    if (!exportWindow || exportWindow.closed) {
      $.alert(uiStrings.notification.popupWindowBlocked);
      return;
    }

    exportWindow.location.href = data.bloburl || data.datauri;
    const done = $.pref('export_notice_done');
    if (done !== 'all') {
      let note = uiStrings.notification.saveFromBrowser.replace('%s', data.type);

      // Check if there's issues
      if (issues.length) {
        const pre = '\n \u2022 ';
        note += ('\n\n' + uiStrings.notification.noteTheseIssues + pre + issues.join(pre));
      }

      // Note that this will also prevent the notice even though new issues may appear later.
      // May want to find a way to deal with that without annoying the user
      $.pref('export_notice_done', 'all');
      exportWindow.alert(note);
    }
  };

  const operaRepaint = function () {
    // Repaints canvas in Opera. Needed for stroke-dasharray change as well as fill change
    if (!window.opera) {
      return;
    }
    $('<p/>').hide().appendTo('body').remove();
  };

  function setStrokeOpt (opt, changeElem) {
    const {id} = opt;
    const bits = id.split('_');
    const pre = bits[0];
    const val = bits[1];

    if (changeElem) {
      svgCanvas.setStrokeAttr('stroke-' + pre, val);
    }
    operaRepaint();
    setIcon('#cur_' + pre, id, 20);
    $(opt).addClass('current').siblings().removeClass('current');
  }

  // This is a common function used when a tool has been clicked (chosen)
  // It does several common things:
  // - removes the tool_button_current class from whatever tool currently has it
  // - hides any flyouts
  // - adds the tool_button_current class to the button passed in
  const toolButtonClick = editor.toolButtonClick = function (button, noHiding) {
    if ($(button).hasClass('disabled')) { return false; }
    if ($(button).parent().hasClass('tools_flyout')) { return true; }
    const fadeFlyouts = 'normal';
    if (!noHiding) {
      $('.tools_flyout').fadeOut(fadeFlyouts);
    }
    $('#styleoverrides').text('');
    workarea.css('cursor', 'auto');
    $('.tool_button_current').removeClass('tool_button_current').addClass('tool_button');
    $(button).addClass('tool_button_current').removeClass('tool_button');
    return true;
  };

  const clickSelect = editor.clickSelect = function () {
    if (toolButtonClick('#tool_select')) {
      svgCanvas.setMode('select');
      $('#styleoverrides').text('#svgcanvas svg *{cursor:move;pointer-events:all}, #svgcanvas svg{cursor:default}');
    }
  };

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

  function setBackground (color, url) {
    // if (color == $.pref('bkgd_color') && url == $.pref('bkgd_url')) { return; }
    $.pref('bkgd_color', color);
    $.pref('bkgd_url', url);

    // This should be done in svgcanvas.js for the borderRect fill
    svgCanvas.setBackground(color, url);
  }

  function promptImgURL () {
    let curhref = svgCanvas.getHref(selectedElement);
    curhref = curhref.startsWith('data:') ? '' : curhref;
    $.prompt(uiStrings.notification.enterNewImgURL, curhref, function (url) {
      if (url) { setImageURL(url); }
    });
  }

  const setInputWidth = function (elem) {
    const w = Math.min(Math.max(12 + elem.value.length * 6, 50), 300);
    $(elem).width(w);
  };

  function updateRulers (scanvas, zoom) {
    if (!zoom) { zoom = svgCanvas.getZoom(); }
    if (!scanvas) { scanvas = $('#svgcanvas'); }

    let d, i;
    const limit = 30000;
    const contentElem = svgCanvas.getContentElem();
    const units = getTypeMap();
    const unit = units[curConfig.baseUnit]; // 1 = 1px

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
        ctxArrNum = parseInt(rulerLen / limit, 10) + 1;
        ctxArr = [];
        ctxArr[0] = ctx;
        let copy;
        for (i = 1; i < ctxArrNum; i++) {
          hcanv[lentype] = limit;
          copy = hcanv.cloneNode(true);
          hcanv.parentNode.appendChild(copy);
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
    const multi = curConfig.canvas_expansion;
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
    if (curConfig.showRulers) {
      updateRulers(cnvs, zoom);
      workarea.scroll();
    }
    if (urldata.storagePrompt !== true && !editor.storagePromptClosed) {
      $('#dialog_box').hide();
    }
  };

  const updateToolButtonState = function () {
    let index, button;
    const bNoFill = (svgCanvas.getColor('fill') === 'none');
    const bNoStroke = (svgCanvas.getColor('stroke') === 'none');
    const buttonsNeedingStroke = ['#tool_fhpath', '#tool_line'];
    const buttonsNeedingFillAndStroke = ['#tools_rect .tool_button', '#tools_ellipse .tool_button', '#tool_text', '#tool_path'];
    if (bNoStroke) {
      for (index in buttonsNeedingStroke) {
        button = buttonsNeedingStroke[index];
        if ($(button).hasClass('tool_button_current')) {
          clickSelect();
        }
        $(button).addClass('disabled');
      }
    } else {
      for (index in buttonsNeedingStroke) {
        button = buttonsNeedingStroke[index];
        $(button).removeClass('disabled');
      }
    }

    if (bNoStroke && bNoFill) {
      for (index in buttonsNeedingFillAndStroke) {
        button = buttonsNeedingFillAndStroke[index];
        if ($(button).hasClass('tool_button_current')) {
          clickSelect();
        }
        $(button).addClass('disabled');
      }
    } else {
      for (index in buttonsNeedingFillAndStroke) {
        button = buttonsNeedingFillAndStroke[index];
        $(button).removeClass('disabled');
      }
    }

    svgCanvas.runExtensions('toolButtonStateUpdate', {
      nofill: bNoFill,
      nostroke: bNoStroke
    });

    // Disable flyouts if all inside are disabled
    $('.tools_flyout').each(function () {
      const shower = $('#' + this.id + '_show');
      let hasEnabled = false;
      $(this).children().each(function () {
        if (!$(this).hasClass('disabled')) {
          hasEnabled = true;
        }
      });
      shower.toggleClass('disabled', !hasEnabled);
    });

    operaRepaint();
  };

  // Updates the toolbar (colors, opacity, etc) based on the selected element
  // This function also updates the opacity and id elements that are in the context panel
  const updateToolbar = function () {
    let i, len;
    if (selectedElement != null) {
      switch (selectedElement.tagName) {
      case 'use':
      case 'image':
      case 'foreignObject':
        break;
      case 'g':
      case 'a':
        // Look for common styles
        const childs = selectedElement.getElementsByTagName('*');
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

        paintBox.fill.update(true);
        paintBox.stroke.update(true);

        break;
      default:
        paintBox.fill.update(true);
        paintBox.stroke.update(true);

        $('#stroke_width').val(selectedElement.getAttribute('stroke-width') || 1);
        $('#stroke_style').val(selectedElement.getAttribute('stroke-dasharray') || 'none');

        let attr = selectedElement.getAttribute('stroke-linejoin') || 'miter';

        if ($('#linejoin_' + attr).length) {
          setStrokeOpt($('#linejoin_' + attr)[0]);
        }

        attr = selectedElement.getAttribute('stroke-linecap') || 'butt';

        if ($('#linecap_' + attr).length) {
          setStrokeOpt($('#linecap_' + attr)[0]);
        }
      }
    }

    // All elements including image and group have opacity
    if (selectedElement != null) {
      const opacPerc = (selectedElement.getAttribute('opacity') || 1.0) * 100;
      $('#group_opacity').val(opacPerc);
      $('#opac_slider').slider('option', 'value', opacPerc);
      $('#elem_id').val(selectedElement.id);
      $('#elem_class').val(selectedElement.getAttribute('class'));
    }

    updateToolButtonState();
  };

  // updates the context panel tools based on the selected element
  const updateContextPanel = function () {
    let elem = selectedElement;
    // If element has just been deleted, consider it null
    if (elem != null && !elem.parentNode) { elem = null; }
    const currentLayerName = svgCanvas.getCurrentDrawing().getCurrentLayerName();
    const currentMode = svgCanvas.getMode();
    const unit = curConfig.baseUnit !== 'px' ? curConfig.baseUnit : null;

    const isNode = currentMode === 'pathedit'; // elem ? (elem.id && elem.id.startsWith('pathpointgrip')) : false;
    const menuItems = $('#cmenu_canvas li');
    $('#selected_panel, #multiselected_panel, #g_panel, #rect_panel, #circle_panel,' +
      '#ellipse_panel, #line_panel, #text_panel, #image_panel, #container_panel,' +
      ' #use_panel, #a_panel').hide();
    if (elem != null) {
      const elname = elem.nodeName;
      // If this is a link with no transform and one child, pretend
      // its child is selected
      // if (elname === 'a') { // && !$(elem).attr('transform')) {
      //   elem = elem.firstChild;
      // }

      const angle = svgCanvas.getRotationAngle(elem);
      $('#angle').val(angle);

      const blurval = svgCanvas.getBlur(elem);
      $('#blur').val(blurval);
      $('#blur_slider').slider('option', 'value', blurval);

      if (svgCanvas.addedNew) {
        if (elname === 'image' && svgCanvas.getMode() === 'image') {
          // Prompt for URL if not a data URL
          if (!svgCanvas.getHref(elem).startsWith('data:')) {
            promptImgURL();
          }
        }
        /* else if (elname == 'text') {
          // TODO: Do something here for new text
        } */
      }

      if (!isNode && currentMode !== 'pathedit') {
        $('#selected_panel').show();
        // Elements in this array already have coord fields
        if (['line', 'circle', 'ellipse'].includes(elname)) {
          $('#xy_panel').hide();
        } else {
          let x, y;

          // Get BBox vals for g, polyline and path
          if (['g', 'polyline', 'path'].includes(elname)) {
            const bb = svgCanvas.getStrokedBBox([elem]);
            if (bb) {
              ({x, y} = bb);
            }
          } else {
            x = elem.getAttribute('x');
            y = elem.getAttribute('y');
          }

          if (unit) {
            x = convertUnit(x);
            y = convertUnit(y);
          }

          $('#selected_x').val(x || 0);
          $('#selected_y').val(y || 0);
          $('#xy_panel').show();
        }

        // Elements in this array cannot be converted to a path
        const noPath = !['image', 'text', 'path', 'g', 'use'].includes(elname);
        $('#tool_topath').toggle(noPath);
        $('#tool_reorient').toggle(elname === 'path');
        $('#tool_reorient').toggleClass('disabled', angle === 0);
      } else {
        const point = path.getNodePoint();
        $('#tool_add_subpath').removeClass('push_button_pressed').addClass('tool_button');
        $('#tool_node_delete').toggleClass('disabled', !path.canDeleteNodes);

        // Show open/close button based on selected point
        setIcon('#tool_openclose_path', path.closed_subpath ? 'open_path' : 'close_path');

        if (point) {
          const segType = $('#seg_type');
          if (unit) {
            point.x = convertUnit(point.x);
            point.y = convertUnit(point.y);
          }
          $('#path_node_x').val(point.x);
          $('#path_node_y').val(point.y);
          if (point.type) {
            segType.val(point.type).removeAttr('disabled');
          } else {
            segType.val(4).attr('disabled', 'disabled');
          }
        }
        return;
      }

      // update contextual tools here
      const panels = {
        g: [],
        a: [],
        rect: ['rx', 'width', 'height'],
        image: ['width', 'height'],
        circle: ['cx', 'cy', 'r'],
        ellipse: ['cx', 'cy', 'rx', 'ry'],
        line: ['x1', 'y1', 'x2', 'y2'],
        text: [],
        use: []
      };

      const {tagName} = elem;

      // if ($(elem).data('gsvg')) {
      //   $('#g_panel').show();
      // }

      let linkHref = null;
      if (tagName === 'a') {
        linkHref = svgCanvas.getHref(elem);
        $('#g_panel').show();
      }

      if (elem.parentNode.tagName === 'a') {
        if (!$(elem).siblings().length) {
          $('#a_panel').show();
          linkHref = svgCanvas.getHref(elem.parentNode);
        }
      }

      // Hide/show the make_link buttons
      $('#tool_make_link, #tool_make_link').toggle(!linkHref);

      if (linkHref) {
        $('#link_url').val(linkHref);
      }

      if (panels[tagName]) {
        const curPanel = panels[tagName];

        $('#' + tagName + '_panel').show();

        $.each(curPanel, function (i, item) {
          let attrVal = elem.getAttribute(item);
          if (curConfig.baseUnit !== 'px' && elem[item]) {
            const bv = elem[item].baseVal.value;
            attrVal = convertUnit(bv);
          }
          $('#' + tagName + '_' + item).val(attrVal || 0);
        });

        if (tagName === 'text') {
          $('#text_panel').css('display', 'inline');
          $('#tool_font_size').css('display', 'inline');
          if (svgCanvas.getItalic()) {
            $('#tool_italic').addClass('push_button_pressed').removeClass('tool_button');
          } else {
            $('#tool_italic').removeClass('push_button_pressed').addClass('tool_button');
          }
          if (svgCanvas.getBold()) {
            $('#tool_bold').addClass('push_button_pressed').removeClass('tool_button');
          } else {
            $('#tool_bold').removeClass('push_button_pressed').addClass('tool_button');
          }
          $('#font_family').val(elem.getAttribute('font-family'));
          $('#font_size').val(elem.getAttribute('font-size'));
          $('#text').val(elem.textContent);
          if (svgCanvas.addedNew) {
            // Timeout needed for IE9
            setTimeout(function () {
              $('#text').focus().select();
            }, 100);
          }
        // text
        } else if (tagName === 'image' && svgCanvas.getMode() === 'image') {
          setImageURL(svgCanvas.getHref(elem));
        // image
        } else if (tagName === 'g' || tagName === 'use') {
          $('#container_panel').show();
          const title = svgCanvas.getTitle();
          const label = $('#g_title')[0];
          label.value = title;
          setInputWidth(label);
          $('#g_title').prop('disabled', tagName === 'use');
        }
      }
      menuItems[(tagName === 'g' ? 'en' : 'dis') + 'ableContextMenuItems']('#ungroup');
      menuItems[((tagName === 'g' || !multiselected) ? 'dis' : 'en') + 'ableContextMenuItems']('#group');
    // if (elem != null)
    } else if (multiselected) {
      $('#multiselected_panel').show();
      menuItems
        .enableContextMenuItems('#group')
        .disableContextMenuItems('#ungroup');
    } else {
      menuItems.disableContextMenuItems('#delete,#cut,#copy,#group,#ungroup,#move_front,#move_up,#move_down,#move_back');
    }

    // update history buttons
    $('#tool_undo').toggleClass('disabled', undoMgr.getUndoStackSize() === 0);
    $('#tool_redo').toggleClass('disabled', undoMgr.getRedoStackSize() === 0);

    svgCanvas.addedNew = false;

    if ((elem && !isNode) || multiselected) {
      // update the selected elements' layer
      $('#selLayerNames').removeAttr('disabled').val(currentLayerName);

      // Enable regular menu options
      canvMenu.enableContextMenuItems('#delete,#cut,#copy,#move_front,#move_up,#move_down,#move_back');
    } else {
      $('#selLayerNames').attr('disabled', 'disabled');
    }
  };

  const updateWireFrame = function () {
    // Test support
    if (supportsNonSS) { return; }

    const rule = '#workarea.wireframe #svgcontent * { stroke-width: ' + 1 / svgCanvas.getZoom() + 'px; }';
    $('#wireframe_rules').text(workarea.hasClass('wireframe') ? rule : '');
  };

  let curContext = '';

  const updateTitle = function (title) {
    title = title || svgCanvas.getDocumentTitle();
    const newTitle = origTitle + (title ? ': ' + title : '');

    // Remove title update with current context info, isn't really necessary
    // if (curContext) {
    //   new_title = new_title + curContext;
    // }
    $('title:first').text(newTitle);
  };

  // called when we've selected a different element
  /**
  *
  * @param win
  * @param elems Array of elements that were selected
  */
  const selectedChanged = function (win, elems) {
    const mode = svgCanvas.getMode();
    if (mode === 'select') {
      setSelectMode();
    }
    const isNode = mode === 'pathedit';
    // if elems[1] is present, then we have more than one element
    selectedElement = (elems.length === 1 || elems[1] == null ? elems[0] : null);
    multiselected = (elems.length >= 2 && elems[1] != null);
    if (selectedElement != null) {
      // unless we're already in always set the mode of the editor to select because
      // upon creation of a text element the editor is switched into
      // select mode and this event fires - we need our UI to be in sync

      if (!isNode) {
        updateToolbar();
      }
    } // if (elem != null)

    // Deal with pathedit mode
    togglePathEditMode(isNode, elems);
    updateContextPanel();
    svgCanvas.runExtensions('selectedChanged', {
      elems,
      selectedElement,
      multiselected
    });
  };

  // Call when part of element is in process of changing, generally
  // on mousemove actions like rotate, move, etc.
  const elementTransition = function (win, elems) {
    const mode = svgCanvas.getMode();
    const elem = elems[0];

    if (!elem) {
      return;
    }

    multiselected = (elems.length >= 2 && elems[1] != null);
    // Only updating fields for single elements for now
    if (!multiselected) {
      switch (mode) {
      case 'rotate':
        const ang = svgCanvas.getRotationAngle(elem);
        $('#angle').val(ang);
        $('#tool_reorient').toggleClass('disabled', ang === 0);
        break;

      // TODO: Update values that change on move/resize, etc
      // case "select":
      // case "resize":
      //   break;
      }
    }
    svgCanvas.runExtensions('elementTransition', {
      elems
    });
  };

  /**
   * Test whether an element is a layer or not.
   * @param {SVGGElement} elem - The SVGGElement to test.
   * @returns {boolean} True if the element is a layer
   */
  function isLayer (elem) {
    return elem && elem.tagName === 'g' && Layer.CLASS_REGEX.test(elem.getAttribute('class'));
  }

  // called when any element has changed
  const elementChanged = function (win, elems) {
    const mode = svgCanvas.getMode();
    if (mode === 'select') {
      setSelectMode();
    }

    for (let i = 0; i < elems.length; ++i) {
      const elem = elems[i];

      const isSvgElem = (elem && elem.tagName === 'svg');
      if (isSvgElem || isLayer(elem)) {
        populateLayers();
        // if the element changed was the svg, then it could be a resolution change
        if (isSvgElem) {
          updateCanvas();
        }
      // Update selectedElement if element is no longer part of the image.
      // This occurs for the text elements in Firefox
      } else if (elem && selectedElement && selectedElement.parentNode == null) {
        // || elem && elem.tagName == "path" && !multiselected) { // This was added in r1430, but not sure why
        selectedElement = elem;
      }
    }

    editor.showSaveWarning = true;

    // we update the contextual panel with potentially new
    // positional/sizing information (we DON'T want to update the
    // toolbar here as that creates an infinite loop)
    // also this updates the history buttons

    // we tell it to skip focusing the text control if the
    // text element was previously in focus
    updateContextPanel();

    // In the event a gradient was flipped:
    if (selectedElement && mode === 'select') {
      paintBox.fill.update();
      paintBox.stroke.update();
    }

    svgCanvas.runExtensions('elementChanged', {
      elems
    });
  };

  const zoomDone = function () {
    updateWireFrame();
    // updateCanvas(); // necessary?
  };

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
      changeZoom({value: 0.1});
      return;
    }

    $('#zoom').val((zoomlevel * 100).toFixed(1));

    if (autoCenter) {
      updateCanvas();
    } else {
      updateCanvas(false, {x: bb.x * zoomlevel + (bb.width * zoomlevel) / 2, y: bb.y * zoomlevel + (bb.height * zoomlevel) / 2});
    }

    if (svgCanvas.getMode() === 'zoom' && bb.width) {
      // Go to select if a zoom box was drawn
      setSelectMode();
    }

    zoomDone();
  };

  const changeZoom = function (ctl) {
    const zoomlevel = ctl.value / 100;
    if (zoomlevel < 0.001) {
      ctl.value = 0.1;
      return;
    }
    const zoom = svgCanvas.getZoom();
    const wArea = workarea;

    zoomChanged(window, {
      width: 0,
      height: 0,
      // center pt of scroll position
      x: (wArea[0].scrollLeft + wArea.width() / 2) / zoom,
      y: (wArea[0].scrollTop + wArea.height() / 2) / zoom,
      zoom: zoomlevel
    }, true);
  };

  $('#cur_context_panel').delegate('a', 'click', function () {
    const link = $(this);
    if (link.attr('data-root')) {
      svgCanvas.leaveContext();
    } else {
      svgCanvas.setContext(link.text());
    }
    svgCanvas.clearSelection();
    return false;
  });

  const contextChanged = function (win, context) {
    let linkStr = '';
    if (context) {
      let str = '';
      linkStr = '<a href="#" data-root="y">' + svgCanvas.getCurrentDrawing().getCurrentLayerName() + '</a>';

      $(context).parentsUntil('#svgcontent > g').andSelf().each(function () {
        if (this.id) {
          str += ' > ' + this.id;
          if (this !== context) {
            linkStr += ' > <a href="#">' + this.id + '</a>';
          } else {
            linkStr += ' > ' + this.id;
          }
        }
      });

      curContext = str;
    } else {
      curContext = null;
    }
    $('#cur_context_panel').toggle(!!context).html(linkStr);

    updateTitle();
  };

  // Makes sure the current selected paint is available to work with
  const prepPaints = function () {
    paintBox.fill.prep();
    paintBox.stroke.prep();
  };

  const flyoutFuncs = {};

  const setFlyoutTitles = function () {
    $('.tools_flyout').each(function () {
      const shower = $('#' + this.id + '_show');
      if (shower.data('isLibrary')) {
        return;
      }

      const tooltips = [];
      $(this).children().each(function () {
        tooltips.push(this.title);
      });
      shower[0].title = tooltips.join(' / ');
    });
  };

  const setupFlyouts = function (holders) {
    $.each(holders, function (holdSel, btnOpts) {
      const buttons = $(holdSel).children();
      const showSel = holdSel + '_show';
      const shower = $(showSel);
      let def = false;
      buttons.addClass('tool_button')
        .unbind('click mousedown mouseup') // may not be necessary
        .each(function (i) {
          // Get this buttons options
          const opts = btnOpts[i];

          // Remember the function that goes with this ID
          flyoutFuncs[opts.sel] = opts.fn;

          if (opts.isDefault) { def = i; }

          // Clicking the icon in flyout should set this set's icon
          const func = function (event) {
            let options = opts;
            // Find the currently selected tool if comes from keystroke
            if (event.type === 'keydown') {
              const flyoutIsSelected = $(options.parent + '_show').hasClass('tool_button_current');
              const currentOperation = $(options.parent + '_show').attr('data-curopt');
              $.each(holders[opts.parent], function (i, tool) {
                if (tool.sel === currentOperation) {
                  if (!event.shiftKey || !flyoutIsSelected) {
                    options = tool;
                  } else {
                    options = holders[opts.parent][i + 1] || holders[opts.parent][0];
                  }
                }
              });
            }
            if ($(this).hasClass('disabled')) { return false; }
            if (toolButtonClick(showSel)) {
              options.fn();
            }
            let icon;
            if (options.icon) {
              icon = $.getSvgIcon(options.icon, true);
            } else {
              icon = $(options.sel).children().eq(0).clone();
            }

            icon[0].setAttribute('width', shower.width());
            icon[0].setAttribute('height', shower.height());
            shower.children(':not(.flyout_arrow_horiz)').remove();
            shower.append(icon).attr('data-curopt', options.sel); // This sets the current mode
          };

          $(this).mouseup(func);

          if (opts.key) {
            $(document).bind('keydown', opts.key[0] + ' shift+' + opts.key[0], func);
          }
        });

      if (def) {
        shower.attr('data-curopt', btnOpts[def].sel);
      } else if (!shower.attr('data-curopt')) {
        // Set first as default
        shower.attr('data-curopt', btnOpts[0].sel);
      }

      let timer;
      const pos = $(showSel).position();

      // Clicking the "show" icon should set the current mode
      shower.mousedown(function (evt) {
        if (shower.hasClass('disabled')) {
          return false;
        }
        const holder = $(holdSel);
        const l = pos.left + 34;
        const w = holder.width() * -1;
        const time = holder.data('shown_popop') ? 200 : 0;
        timer = setTimeout(function () {
          // Show corresponding menu
          if (!shower.data('isLibrary')) {
            holder.css('left', w).show().animate({
              left: l
            }, 150);
          } else {
            holder.css('left', l).show();
          }
          holder.data('shown_popop', true);
        }, time);
        evt.preventDefault();
      }).mouseup(function (evt) {
        clearTimeout(timer);
        const opt = $(this).attr('data-curopt');
        // Is library and popped up, so do nothing
        if (shower.data('isLibrary') && $(showSel.replace('_show', '')).is(':visible')) {
          toolButtonClick(showSel, true);
          return;
        }
        if (toolButtonClick(showSel) && flyoutFuncs[opt]) {
          flyoutFuncs[opt]();
        }
      });
      // $('#tools_rect').mouseleave(function () { $('#tools_rect').fadeOut(); });
    });
    setFlyoutTitles();
    setFlyoutPositions();
  };

  const makeFlyoutHolder = function (id, child) {
    const div = $('<div>', {
      class: 'tools_flyout',
      id
    }).appendTo('#svg_editor').append(child);

    return div;
  };

  const uaPrefix = (function () {
    let prop;
    const regex = /^(Moz|Webkit|Khtml|O|ms|Icab)(?=[A-Z])/;
    const someScript = document.getElementsByTagName('script')[0];
    for (prop in someScript.style) {
      if (regex.test(prop)) {
        // test is faster than match, so it's better to perform
        // that on the lot and match only when necessary
        return prop.match(regex)[0];
      }
    }
    // Nothing found so far?
    if ('WebkitOpacity' in someScript.style) { return 'Webkit'; }
    if ('KhtmlOpacity' in someScript.style) { return 'Khtml'; }

    return '';
  }());

  // TODO: Combine this with addDropDown or find other way to optimize
  const addAltDropDown = function (elem, list, callback, opts) {
    const button = $(elem);
    const {dropUp} = opts;
    list = $(list);
    if (dropUp) {
      $(elem).addClass('dropup');
    }
    list.find('li').bind('mouseup', function () {
      if (opts.seticon) {
        setIcon('#cur_' + button[0].id, $(this).children());
        $(this).addClass('current').siblings().removeClass('current');
      }
      callback.apply(this, arguments);
    });

    let onButton = false;
    $(window).mouseup(function (evt) {
      if (!onButton) {
        button.removeClass('down');
        list.hide();
        list.css({top: 0, left: 0});
      }
      onButton = false;
    });

    // const height = list.height(); // Currently unused
    button.bind('mousedown', function () {
      const off = button.offset();
      if (dropUp) {
        off.top -= list.height();
        off.left += 8;
      } else {
        off.top += button.height();
      }
      list.offset(off);

      if (!button.hasClass('down')) {
        list.show();
        onButton = true;
      } else {
        // CSS position must be reset for Webkit
        list.hide();
        list.css({top: 0, left: 0});
      }
      button.toggleClass('down');
    }).hover(function () {
      onButton = true;
    }).mouseout(function () {
      onButton = false;
    });

    if (opts.multiclick) {
      list.mousedown(function () {
        onButton = true;
      });
    }
  };

  const extsPreLang = [];
  const extAdded = function (win, ext) {
    if (!ext) {
      return;
    }
    let cbCalled = false;
    let resizeDone = false;
    let cbReady = true; // Set to false to delay callback (e.g. wait for $.svgIcons)

    if (ext.langReady) {
      if (editor.langChanged) { // We check for this since the "lang" pref could have been set by storage
        const lang = $.pref('lang');
        ext.langReady({lang, uiStrings});
      } else {
        extsPreLang.push(ext);
      }
    }

    function prepResize () {
      if (resizeTimer) {
        clearTimeout(resizeTimer);
        resizeTimer = null;
      }
      if (!resizeDone) {
        resizeTimer = setTimeout(function () {
          resizeDone = true;
          setIconSize($.pref('iconsize'));
        }, 50);
      }
    }

    const runCallback = function () {
      if (ext.callback && !cbCalled && cbReady) {
        cbCalled = true;
        ext.callback();
      }
    };

    const btnSelects = [];

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
        case 'tool_button':
          html = '<div class="tool_button">' + tool.id + '</div>';
          const div = $(html).appendTo(panel);
          if (tool.events) {
            $.each(tool.events, function (evt, func) {
              $(div).bind(evt, func);
            });
          }
          break;
        case 'select':
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
        case 'button-select':
          html = '<div id="' + tool.id + '" class="dropdown toolset" title="' + tool.title + '">' +
            '<div id="cur_' + tool.id + '" class="icon_label"></div><button></button></div>';

          const list = $('<ul id="' + tool.id + '_opts"></ul>').appendTo('#option_lists');

          if (tool.colnum) {
            list.addClass('optcols' + tool.colnum);
          }

          // Creates the tool, hides & adds it, returns the select element
          /* const dropdown = */ $(html).appendTo(panel).children();

          btnSelects.push({
            elem: ('#' + tool.id),
            list: ('#' + tool.id + '_opts'),
            title: tool.title,
            callback: tool.events.change,
            cur: ('#cur_' + tool.id)
          });

          break;
        case 'input':
          html = '<label' + contId + '>' +
            '<span id="' + tool.id + '_label">' +
            tool.label + ':</span>' +
            '<input id="' + tool.id + '" title="' + tool.title +
            '" size="' + (tool.size || '4') + '" value="' + (tool.defval || '') + '" type="text"/></label>';

          // Creates the tool, hides & adds it, returns the select element

          // Add to given tool.panel
          const inp = $(html).appendTo(panel).find('input');

          if (tool.spindata) {
            inp.SpinButton(tool.spindata);
          }

          if (tool.events) {
            $.each(tool.events, function (evt, func) {
              inp.bind(evt, func);
            });
          }
          break;

        default:
          break;
        }
      });
    }

    if (ext.buttons) {
      const fallbackObj = {},
        placementObj = {},
        {svgicons} = ext,
        holders = {};

      // Add buttons given by extension
      $.each(ext.buttons, function (i, btn) {
        let icon, svgicon, tlsId;

        let {id} = btn;
        let num = i;
        // Give button a unique ID
        while ($('#' + id).length) {
          id = btn.id + '_' + (++num);
        }

        if (!svgicons) {
          icon = $('<img src="' + btn.icon + '">');
        } else {
          fallbackObj[id] = btn.icon;
          svgicon = btn.svgicon || btn.id;
          if (btn.type === 'app_menu') {
            placementObj['#' + id + ' > div'] = svgicon;
          } else {
            placementObj['#' + id] = svgicon;
          }
        }

        let cls, parent;

        // Set button up according to its type
        switch (btn.type) {
        case 'mode_flyout':
        case 'mode':
          cls = 'tool_button';
          parent = '#tools_left';
          break;
        case 'context':
          cls = 'tool_button';
          parent = '#' + btn.panel;
          // create the panel if it doesn't exist
          if (!$(parent).length) {
            $('<div>', {id: btn.panel}).appendTo('#tools_top');
          }
          break;
        case 'app_menu':
          cls = '';
          parent = '#main_menu ul';
          break;
        }
        let flyoutHolder, curH, showBtn, refData, refBtn;
        const button = $((btn.list || btn.type === 'app_menu') ? '<li/>' : '<div/>')
          .attr('id', id)
          .attr('title', btn.title)
          .addClass(cls);
        if (!btn.includeWith && !btn.list) {
          if ('position' in btn) {
            if ($(parent).children().eq(btn.position).length) {
              $(parent).children().eq(btn.position).before(button);
            } else {
              $(parent).children().last().before(button);
            }
          } else {
            button.appendTo(parent);
          }

          if (btn.type === 'mode_flyout') {
          // Add to flyout menu / make flyout menu
            // const opts = btn.includeWith;
            // // opts.button, default, position
            refBtn = $(button);

            flyoutHolder = refBtn.parent();
            // Create a flyout menu if there isn't one already
            if (!refBtn.parent().hasClass('tools_flyout')) {
              // Create flyout placeholder
              tlsId = refBtn[0].id.replace('tool_', 'tools_');
              showBtn = refBtn.clone()
                .attr('id', tlsId + '_show')
                .append($('<div>', {class: 'flyout_arrow_horiz'}));

              refBtn.before(showBtn);

              // Create a flyout div
              flyoutHolder = makeFlyoutHolder(tlsId, refBtn);
              flyoutHolder.data('isLibrary', true);
              showBtn.data('isLibrary', true);
            }
            // refData = Actions.getButtonData(opts.button);

            placementObj['#' + tlsId + '_show'] = btn.id;
            // TODO: Find way to set the current icon using the iconloader if this is not default

            // Include data for extension button as well as ref button
            curH = holders['#' + flyoutHolder[0].id] = [{
              sel: '#' + id,
              fn: btn.events.click,
              icon: btn.id,
              // key: btn.key,
              isDefault: true
            }, refData];
            //
            // // {sel:'#tool_rect', fn: clickRect, evt: 'mouseup', key: 4, parent: '#tools_rect', icon: 'rect'}
            //
            // const pos = ('position' in opts)?opts.position:'last';
            // const len = flyoutHolder.children().length;
            //
            // // Add at given position or end
            // if (!isNaN(pos) && pos >= 0 && pos < len) {
            //   flyoutHolder.children().eq(pos).before(button);
            // } else {
            //   flyoutHolder.append(button);
            //   curH.reverse();
            // }
          } else if (btn.type === 'app_menu') {
            button.append('<div>').append(btn.title);
          }
        } else if (btn.list) {
          // Add button to list
          button.addClass('push_button');
          $('#' + btn.list + '_opts').append(button);
          if (btn.isDefault) {
            $('#cur_' + btn.list).append(button.children().clone());
            svgicon = btn.svgicon || btn.id;
            placementObj['#cur_' + btn.list] = svgicon;
          }
        } else if (btn.includeWith) {
          // Add to flyout menu / make flyout menu
          const opts = btn.includeWith;
          // opts.button, default, position
          refBtn = $(opts.button);

          flyoutHolder = refBtn.parent();
          // Create a flyout menu if there isn't one already
          if (!refBtn.parent().hasClass('tools_flyout')) {
            // Create flyout placeholder
            tlsId = refBtn[0].id.replace('tool_', 'tools_');
            showBtn = refBtn.clone()
              .attr('id', tlsId + '_show')
              .append($('<div>', {class: 'flyout_arrow_horiz'}));

            refBtn.before(showBtn);

            // Create a flyout div
            flyoutHolder = makeFlyoutHolder(tlsId, refBtn);
          }

          refData = Actions.getButtonData(opts.button);

          if (opts.isDefault) {
            placementObj['#' + tlsId + '_show'] = btn.id;
          }
          // TODO: Find way to set the current icon using the iconloader if this is not default

          // Include data for extension button as well as ref button
          curH = holders['#' + flyoutHolder[0].id] = [{
            sel: '#' + id,
            fn: btn.events.click,
            icon: btn.id,
            key: btn.key,
            isDefault: btn.includeWith ? btn.includeWith.isDefault : 0
          }, refData];

          // {sel:'#tool_rect', fn: clickRect, evt: 'mouseup', key: 4, parent: '#tools_rect', icon: 'rect'}

          const pos = ('position' in opts) ? opts.position : 'last';
          const len = flyoutHolder.children().length;

          // Add at given position or end
          if (!isNaN(pos) && pos >= 0 && pos < len) {
            flyoutHolder.children().eq(pos).before(button);
          } else {
            flyoutHolder.append(button);
            curH.reverse();
          }
        }

        if (!svgicons) {
          button.append(icon);
        }

        if (!btn.list) {
          // Add given events to button
          $.each(btn.events, function (name, func) {
            if (name === 'click' && btn.type === 'mode') {
              if (btn.includeWith) {
                button.bind(name, func);
              } else {
                button.bind(name, function () {
                  if (toolButtonClick(button)) {
                    func();
                  }
                });
              }
              if (btn.key) {
                $(document).bind('keydown', btn.key, func);
                if (btn.title) {
                  button.attr('title', btn.title + ' [' + btn.key + ']');
                }
              }
            } else {
              button.bind(name, func);
            }
          });
        }

        setupFlyouts(holders);
      });

      $.each(btnSelects, function () {
        addAltDropDown(this.elem, this.list, this.callback, {seticon: true});
      });

      if (svgicons) {
        cbReady = false; // Delay callback
      }

      $.svgIcons(svgicons, {
        w: 24, h: 24,
        id_match: false,
        no_img: (!isWebkit()),
        fallback: fallbackObj,
        placement: placementObj,
        callback (icons) {
          // Non-ideal hack to make the icon match the current size
          // if (curPrefs.iconsize && curPrefs.iconsize !== 'm') {
          if ($.pref('iconsize') !== 'm') {
            prepResize();
          }
          cbReady = true; // Ready for callback
          runCallback();
        }
      });
    }

    runCallback();
  };

  const getPaint = function (color, opac, type) {
    // update the editor's fill paint
    const opts = { alpha: opac };
    if (color.startsWith('url(#')) {
      let refElem = svgCanvas.getRefElem(color);
      if (refElem) {
        refElem = refElem.cloneNode(true);
      } else {
        refElem = $('#' + type + '_color defs *')[0];
      }
      opts[refElem.tagName] = refElem;
    } else if (color.startsWith('#')) {
      opts.solidColor = color.substr(1);
    } else {
      opts.solidColor = 'none';
    }
    return new $.jGraduate.Paint(opts);
  };

  // $('#text').focus(function () { textBeingEntered = true; });
  // $('#text').blur(function () { textBeingEntered = false; });

  // bind the selected event to our function that handles updates to the UI
  svgCanvas.bind('selected', selectedChanged);
  svgCanvas.bind('transition', elementTransition);
  svgCanvas.bind('changed', elementChanged);
  svgCanvas.bind('saved', saveHandler);
  svgCanvas.bind('exported', exportHandler);
  svgCanvas.bind('exportedPDF', function (win, data) {
    const {exportWindowName} = data;
    if (exportWindowName) {
      exportWindow = window.open('', exportWindowName); // A hack to get the window via JSON-able name without opening a new one
    }
    exportWindow.location.href = data.dataurlstring;
  });
  svgCanvas.bind('zoomed', zoomChanged);
  svgCanvas.bind('zoomDone', zoomDone);
  svgCanvas.bind('updateCanvas', function (win, {center, newCtr}) {
    updateCanvas(center, newCtr);
  });
  svgCanvas.bind('contextset', contextChanged);
  svgCanvas.bind('extension_added', extAdded);
  svgCanvas.textActions.setInputElem($('#text')[0]);

  let str = '<div class="palette_item" data-rgb="none"></div>';
  $.each(palette, function (i, item) {
    str += '<div class="palette_item" style="background-color: ' + item + ';" data-rgb="' + item + '"></div>';
  });
  $('#palette').append(str);

  // Set up editor background functionality
  // TODO add checkerboard as "pattern"
  const colorBlocks = ['#FFF', '#888', '#000']; // ,'url(data:image/gif;base64,R0lGODlhEAAQAIAAAP%2F%2F%2F9bW1iH5BAAAAAAALAAAAAAQABAAAAIfjG%2Bgq4jM3IFLJgpswNly%2FXkcBpIiVaInlLJr9FZWAQA7)'];
  str = '';
  $.each(colorBlocks, function () {
    str += '<div class="color_block" style="background-color:' + this + ';"></div>';
  });
  $('#bg_blocks').append(str);
  const blocks = $('#bg_blocks div');
  const curBg = 'cur_background';
  blocks.each(function () {
    const blk = $(this);
    blk.click(function () {
      blocks.removeClass(curBg);
      $(this).addClass(curBg);
    });
  });

  setBackground($.pref('bkgd_color'), $.pref('bkgd_url'));

  $('#image_save_opts input').val([$.pref('img_save')]);

  const changeRectRadius = function (ctl) {
    svgCanvas.setRectRadius(ctl.value);
  };

  const changeFontSize = function (ctl) {
    svgCanvas.setFontSize(ctl.value);
  };

  const changeStrokeWidth = function (ctl) {
    let val = ctl.value;
    if (val === 0 && selectedElement && ['line', 'polyline'].includes(selectedElement.nodeName)) {
      val = ctl.value = 1;
    }
    svgCanvas.setStrokeWidth(val);
  };

  const changeRotationAngle = function (ctl) {
    svgCanvas.setRotationAngle(ctl.value);
    $('#tool_reorient').toggleClass('disabled', parseInt(ctl.value, 10) === 0);
  };

  const changeOpacity = function (ctl, val) {
    if (val == null) { val = ctl.value; }
    $('#group_opacity').val(val);
    if (!ctl || !ctl.handle) {
      $('#opac_slider').slider('option', 'value', val);
    }
    svgCanvas.setOpacity(val / 100);
  };

  const changeBlur = function (ctl, val, noUndo) {
    if (val == null) { val = ctl.value; }
    $('#blur').val(val);
    let complete = false;
    if (!ctl || !ctl.handle) {
      $('#blur_slider').slider('option', 'value', val);
      complete = true;
    }
    if (noUndo) {
      svgCanvas.setBlurNoUndo(val);
    } else {
      svgCanvas.setBlur(val, complete);
    }
  };

  $('#stroke_style').change(function () {
    svgCanvas.setStrokeAttr('stroke-dasharray', $(this).val());
    operaRepaint();
  });

  $('#stroke_linejoin').change(function () {
    svgCanvas.setStrokeAttr('stroke-linejoin', $(this).val());
    operaRepaint();
  });

  // Lose focus for select elements when changed (Allows keyboard shortcuts to work better)
  $('select').change(function () { $(this).blur(); });

  // fired when user wants to move elements to another layer
  let promptMoveLayerOnce = false;
  $('#selLayerNames').change(function () {
    const destLayer = this.options[this.selectedIndex].value;
    const confirmStr = uiStrings.notification.QmoveElemsToLayer.replace('%s', destLayer);
    const moveToLayer = function (ok) {
      if (!ok) { return; }
      promptMoveLayerOnce = true;
      svgCanvas.moveSelectedToLayer(destLayer);
      svgCanvas.clearSelection();
      populateLayers();
    };
    if (destLayer) {
      if (promptMoveLayerOnce) {
        moveToLayer(true);
      } else {
        $.confirm(confirmStr, moveToLayer);
      }
    }
  });

  $('#font_family').change(function () {
    svgCanvas.setFontFamily(this.value);
  });

  $('#seg_type').change(function () {
    svgCanvas.setSegType($(this).val());
  });

  $('#text').bind('keyup input', function () {
    svgCanvas.setTextContent(this.value);
  });

  $('#image_url').change(function () {
    setImageURL(this.value);
  });

  $('#link_url').change(function () {
    if (this.value.length) {
      svgCanvas.setLinkURL(this.value);
    } else {
      svgCanvas.removeHyperlink();
    }
  });

  $('#g_title').change(function () {
    svgCanvas.setGroupTitle(this.value);
  });

  $('.attr_changer').change(function () {
    const attr = this.getAttribute('data-attr');
    let val = this.value;
    const valid = isValidUnit(attr, val, selectedElement);

    if (!valid) {
      $.alert(uiStrings.notification.invalidAttrValGiven);
      this.value = selectedElement.getAttribute(attr);
      return false;
    }

    if (attr !== 'id' && attr !== 'class') {
      if (isNaN(val)) {
        val = svgCanvas.convertToNum(attr, val);
      } else if (curConfig.baseUnit !== 'px') {
        // Convert unitless value to one with given unit

        const unitData = getTypeMap();

        if (selectedElement[attr] || svgCanvas.getMode() === 'pathedit' || attr === 'x' || attr === 'y') {
          val *= unitData[curConfig.baseUnit];
        }
      }
    }

    // if the user is changing the id, then de-select the element first
    // change the ID, then re-select it with the new ID
    if (attr === 'id') {
      const elem = selectedElement;
      svgCanvas.clearSelection();
      elem.id = val;
      svgCanvas.addToSelection([elem], true);
    } else {
      svgCanvas.changeSelectedAttribute(attr, val);
    }
    this.blur();
  });

  // Prevent selection of elements when shift-clicking
  $('#palette').mouseover(function () {
    const inp = $('<input type="hidden">');
    $(this).append(inp);
    inp.focus().remove();
  });

  $('.palette_item').mousedown(function (evt) {
    // shift key or right click for stroke
    const picker = evt.shiftKey || evt.button === 2 ? 'stroke' : 'fill';
    let color = $(this).data('rgb');
    let paint;

    // Webkit-based browsers returned 'initial' here for no stroke
    if (color === 'none' || color === 'transparent' || color === 'initial') {
      color = 'none';
      paint = new $.jGraduate.Paint();
    } else {
      paint = new $.jGraduate.Paint({alpha: 100, solidColor: color.substr(1)});
    }

    paintBox[picker].setPaint(paint);
    svgCanvas.setColor(picker, color);

    if (color !== 'none' && svgCanvas.getPaintOpacity(picker) !== 1) {
      svgCanvas.setPaintOpacity(picker, 1.0);
    }
    updateToolButtonState();
  }).bind('contextmenu', function (e) { e.preventDefault(); });

  $('#toggle_stroke_tools').on('click', function () {
    $('#tools_bottom').toggleClass('expanded');
  });

  (function () {
    const wArea = workarea[0];

    let lastX = null, lastY = null,
      panning = false, keypan = false;

    $('#svgcanvas').bind('mousemove mouseup', function (evt) {
      if (panning === false) { return; }

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
    });

    $(window).mouseup(function () {
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

    /*
    // Currently unused
    const hideMenu = function () {
      list.fadeOut(200);
    };
    */

    $(window).mouseup(function (evt) {
      if (!onButton) {
        button.removeClass('buttondown');
        // do not hide if it was the file input as that input needs to be visible
        // for its change event to fire
        if (evt.target.tagName !== 'INPUT') {
          list.fadeOut(200);
        } else if (!setClick) {
          setClick = true;
          $(evt.target).click(function () {
            list.css('margin-left', '-9999px').show();
          });
        }
      }
      onButton = false;
    }).mousedown(function (evt) {
      // $('.contextMenu').hide();
      const islib = $(evt.target).closest('div.tools_flyout, .contextMenu').length;
      if (!islib) {
        $('.tools_flyout:visible,.contextMenu').fadeOut(250);
      }
    });

    overlay.bind('mousedown', function () {
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
    }).hover(function () {
      onButton = true;
    }).mouseout(function () {
      onButton = false;
    });

    const listItems = $('#main_menu li');

    // Check if JS method of hovering needs to be used (Webkit bug)
    listItems.mouseover(function () {
      jsHover = ($(this).css('background-color') === 'rgba(0, 0, 0, 0)');

      listItems.unbind('mouseover');
      if (jsHover) {
        listItems.mouseover(function () {
          this.style.backgroundColor = '#FFC';
        }).mouseout(function () {
          this.style.backgroundColor = 'transparent';
          return true;
        });
      }
    });
  }());
  // Made public for UI customization.
  // TODO: Group UI functions into a public editor.ui interface.
  editor.addDropDown = function (elem, callback, dropUp) {
    if (!$(elem).length) { return; } // Quit if called on non-existant element
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

    button.bind('mousedown', function () {
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
    }).hover(function () {
      onButton = true;
    }).mouseout(function () {
      onButton = false;
    });
  };

  editor.addDropDown('#font_family_dropdown', function () {
    $('#font_family').val($(this).text()).change();
  });

  editor.addDropDown('#opacity_dropdown', function () {
    if ($(this).find('div').length) { return; }
    const perc = parseInt($(this).text().split('%')[0], 10);
    changeOpacity(false, perc);
  }, true);

  // For slider usage, see: http://jqueryui.com/demos/slider/
  $('#opac_slider').slider({
    start () {
      $('#opacity_dropdown li:not(.special)').hide();
    },
    stop () {
      $('#opacity_dropdown li').show();
      $(window).mouseup();
    },
    slide (evt, ui) {
      changeOpacity(ui);
    }
  });

  editor.addDropDown('#blur_dropdown', $.noop);

  let slideStart = false;
  $('#blur_slider').slider({
    max: 10,
    step: 0.1,
    stop (evt, ui) {
      slideStart = false;
      changeBlur(ui);
      $('#blur_dropdown li').show();
      $(window).mouseup();
    },
    start () {
      slideStart = true;
    },
    slide (evt, ui) {
      changeBlur(ui, null, slideStart);
    }
  });

  editor.addDropDown('#zoom_dropdown', function () {
    const item = $(this);
    const val = item.data('val');
    if (val) {
      zoomChanged(window, val);
    } else {
      changeZoom({value: parseFloat(item.text())});
    }
  }, true);

  addAltDropDown('#stroke_linecap', '#linecap_opts', function () {
    setStrokeOpt(this, true);
  }, {dropUp: true});

  addAltDropDown('#stroke_linejoin', '#linejoin_opts', function () {
    setStrokeOpt(this, true);
  }, {dropUp: true});

  addAltDropDown('#tool_position', '#position_opts', function () {
    const letter = this.id.replace('tool_pos', '').charAt(0);
    svgCanvas.alignSelectedElements(letter, 'page');
  }, {multiclick: true});

  /*

  When a flyout icon is selected
    (if flyout) {
    - Change the icon
    - Make pressing the button run its stuff
    }
    - Run its stuff

  When its shortcut key is pressed
    - If not current in list, do as above
    , else:
    - Just run its stuff

  */

  // Unfocus text input when workarea is mousedowned.
  (function () {
    let inp;
    const unfocus = function () {
      $(inp).blur();
    };

    $('#svg_editor').find('button, select, input:not(#text)').focus(function () {
      inp = this;
      uiContext = 'toolbars';
      workarea.mousedown(unfocus);
    }).blur(function () {
      uiContext = 'canvas';
      workarea.unbind('mousedown', unfocus);
      // Go back to selecting text if in textedit mode
      if (svgCanvas.getMode() === 'textedit') {
        $('#text').focus();
      }
    });
  }());

  const clickFHPath = function () {
    if (toolButtonClick('#tool_fhpath')) {
      svgCanvas.setMode('fhpath');
    }
  };

  const clickLine = function () {
    if (toolButtonClick('#tool_line')) {
      svgCanvas.setMode('line');
    }
  };

  const clickSquare = function () {
    if (toolButtonClick('#tool_square')) {
      svgCanvas.setMode('square');
    }
  };

  const clickRect = function () {
    if (toolButtonClick('#tool_rect')) {
      svgCanvas.setMode('rect');
    }
  };

  const clickFHRect = function () {
    if (toolButtonClick('#tool_fhrect')) {
      svgCanvas.setMode('fhrect');
    }
  };

  const clickCircle = function () {
    if (toolButtonClick('#tool_circle')) {
      svgCanvas.setMode('circle');
    }
  };

  const clickEllipse = function () {
    if (toolButtonClick('#tool_ellipse')) {
      svgCanvas.setMode('ellipse');
    }
  };

  const clickFHEllipse = function () {
    if (toolButtonClick('#tool_fhellipse')) {
      svgCanvas.setMode('fhellipse');
    }
  };

  const clickImage = function () {
    if (toolButtonClick('#tool_image')) {
      svgCanvas.setMode('image');
    }
  };

  const clickZoom = function () {
    if (toolButtonClick('#tool_zoom')) {
      svgCanvas.setMode('zoom');
      workarea.css('cursor', zoomInIcon);
    }
  };

  const zoomImage = function (multiplier) {
    const res = svgCanvas.getResolution();
    multiplier = multiplier ? res.zoom * multiplier : 1;
    // setResolution(res.w * multiplier, res.h * multiplier, true);
    $('#zoom').val(multiplier * 100);
    svgCanvas.setZoom(multiplier);
    zoomDone();
    updateCanvas(true);
  };

  const dblclickZoom = function () {
    if (toolButtonClick('#tool_zoom')) {
      zoomImage();
      setSelectMode();
    }
  };

  const clickText = function () {
    if (toolButtonClick('#tool_text')) {
      svgCanvas.setMode('text');
    }
  };

  const clickPath = function () {
    if (toolButtonClick('#tool_path')) {
      svgCanvas.setMode('path');
    }
  };

  // Delete is a contextual tool that only appears in the ribbon if
  // an element has been selected
  const deleteSelected = function () {
    if (selectedElement != null || multiselected) {
      svgCanvas.deleteSelectedElements();
    }
  };

  const cutSelected = function () {
    if (selectedElement != null || multiselected) {
      svgCanvas.cutSelectedElements();
    }
  };

  const copySelected = function () {
    if (selectedElement != null || multiselected) {
      svgCanvas.copySelectedElements();
    }
  };

  const pasteInCenter = function () {
    const zoom = svgCanvas.getZoom();
    const x = (workarea[0].scrollLeft + workarea.width() / 2) / zoom - svgCanvas.contentW;
    const y = (workarea[0].scrollTop + workarea.height() / 2) / zoom - svgCanvas.contentH;
    svgCanvas.pasteElements('point', x, y);
  };

  const moveToTopSelected = function () {
    if (selectedElement != null) {
      svgCanvas.moveToTopSelectedElement();
    }
  };

  const moveToBottomSelected = function () {
    if (selectedElement != null) {
      svgCanvas.moveToBottomSelectedElement();
    }
  };

  const moveUpDownSelected = function (dir) {
    if (selectedElement != null) {
      svgCanvas.moveUpDownSelected(dir);
    }
  };

  const convertToPath = function () {
    if (selectedElement != null) {
      svgCanvas.convertToPath();
    }
  };

  const reorientPath = function () {
    if (selectedElement != null) {
      path.reorient();
    }
  };

  const makeHyperlink = function () {
    if (selectedElement != null || multiselected) {
      $.prompt(uiStrings.notification.enterNewLinkURL, 'http://', function (url) {
        if (url) { svgCanvas.makeHyperlink(url); }
      });
    }
  };

  const moveSelected = function (dx, dy) {
    if (selectedElement != null || multiselected) {
      if (curConfig.gridSnapping) {
        // Use grid snap value regardless of zoom level
        const multi = svgCanvas.getZoom() * curConfig.snappingStep;
        dx *= multi;
        dy *= multi;
      }
      svgCanvas.moveSelectedElements(dx, dy);
    }
  };

  const linkControlPoints = function () {
    $('#tool_node_link').toggleClass('push_button_pressed tool_button');
    const linked = $('#tool_node_link').hasClass('push_button_pressed');
    path.linkControlPoints(linked);
  };

  const clonePathNode = function () {
    if (path.getNodePoint()) {
      path.clonePathNode();
    }
  };

  const deletePathNode = function () {
    if (path.getNodePoint()) {
      path.deletePathNode();
    }
  };

  const addSubPath = function () {
    const button = $('#tool_add_subpath');
    const sp = !button.hasClass('push_button_pressed');
    button.toggleClass('push_button_pressed tool_button');
    path.addSubPath(sp);
  };

  const opencloseSubPath = function () {
    path.opencloseSubPath();
  };

  const selectNext = function () {
    svgCanvas.cycleElement(1);
  };

  const selectPrev = function () {
    svgCanvas.cycleElement(0);
  };

  const rotateSelected = function (cw, step) {
    if (selectedElement == null || multiselected) { return; }
    if (!cw) { step *= -1; }
    const angle = parseFloat($('#angle').val()) + step;
    svgCanvas.setRotationAngle(angle);
    updateContextPanel();
  };

  const clickClear = function () {
    const dims = curConfig.dimensions;
    $.confirm(uiStrings.notification.QwantToClear, function (ok) {
      if (!ok) { return; }
      setSelectMode();
      svgCanvas.clear();
      svgCanvas.setResolution(dims[0], dims[1]);
      updateCanvas(true);
      zoomImage();
      populateLayers();
      updateContextPanel();
      prepPaints();
      svgCanvas.runExtensions('onNewDocument');
    });
  };

  const clickBold = function () {
    svgCanvas.setBold(!svgCanvas.getBold());
    updateContextPanel();
    return false;
  };

  const clickItalic = function () {
    svgCanvas.setItalic(!svgCanvas.getItalic());
    updateContextPanel();
    return false;
  };

  const clickSave = function () {
    // In the future, more options can be provided here
    const saveOpts = {
      images: $.pref('img_save'),
      round_digits: 6
    };
    svgCanvas.save(saveOpts);
  };

  let loadingURL;
  const clickExport = function () {
    $.select('Select an image type for export: ', [
      // See http://kangax.github.io/jstests/toDataUrl_mime_type_test/ for a useful list of MIME types and browser support
      // 'ICO', // Todo: Find a way to preserve transparency in SVG-Edit if not working presently and do full packaging for x-icon; then switch back to position after 'PNG'
      'PNG',
      'JPEG', 'BMP', 'WEBP', 'PDF'
    ], function (imgType) { // todo: replace hard-coded msg with uiStrings.notification.
      if (!imgType) {
        return;
      }
      // Open placeholder window (prevents popup)
      let exportWindowName;
      function openExportWindow () {
        const str = uiStrings.notification.loadingImage;
        if (curConfig.exportWindowType === 'new') {
          editor.exportWindowCt++;
        }
        exportWindowName = curConfig.canvasName + editor.exportWindowCt;
        let popHTML, popURL;
        if (loadingURL) {
          popURL = loadingURL;
        } else {
          popHTML = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + str + '</title></head><body><h1>' + str + '</h1></body><html>';
          if (typeof URL && URL.createObjectURL) {
            const blob = new Blob([popHTML], {type: 'text/html'});
            popURL = URL.createObjectURL(blob);
          } else {
            popURL = 'data:text/html;base64;charset=utf-8,' + Utils.encode64(popHTML);
          }
          loadingURL = popURL;
        }
        exportWindow = window.open(popURL, exportWindowName);
      }
      if (imgType === 'PDF') {
        if (!customExportPDF) {
          openExportWindow();
        }
        svgCanvas.exportPDF(exportWindowName);
      } else {
        if (!customExportImage) {
          openExportWindow();
        }
        const quality = parseInt($('#image-slider').val(), 10) / 100;
        svgCanvas.rasterExport(imgType, quality, exportWindowName);
      }
    }, function () {
      const sel = $(this);
      if (sel.val() === 'JPEG' || sel.val() === 'WEBP') {
        if (!$('#image-slider').length) {
          $(`<div><label>${uiStrings.ui.quality}
              <input id="image-slider"
                type="range" min="1" max="100" value="92" />
            </label></div>`).appendTo(sel.parent());
        }
      } else {
        $('#image-slider').parent().remove();
      }
    });
  };

  // by default, svgCanvas.open() is a no-op.
  // it is up to an extension mechanism (opera widget, etc)
  // to call setCustomHandlers() which will make it do something
  const clickOpen = function () {
    svgCanvas.open();
  };

  const clickImport = function () {
  };

  const clickUndo = function () {
    if (undoMgr.getUndoStackSize() > 0) {
      undoMgr.undo();
      populateLayers();
    }
  };

  const clickRedo = function () {
    if (undoMgr.getRedoStackSize() > 0) {
      undoMgr.redo();
      populateLayers();
    }
  };

  const clickGroup = function () {
    // group
    if (multiselected) {
      svgCanvas.groupSelectedElements();
    // ungroup
    } else if (selectedElement) {
      svgCanvas.ungroupSelectedElement();
    }
  };

  const clickClone = function () {
    svgCanvas.cloneSelectedElements(20, 20);
  };

  const clickAlign = function () {
    const letter = this.id.replace('tool_align', '').charAt(0);
    svgCanvas.alignSelectedElements(letter, $('#align_relative_to').val());
  };

  const clickWireframe = function () {
    $('#tool_wireframe').toggleClass('push_button_pressed tool_button');
    workarea.toggleClass('wireframe');

    if (supportsNonSS) { return; }
    let wfRules = $('#wireframe_rules');
    if (!wfRules.length) {
      wfRules = $('<style id="wireframe_rules"></style>').appendTo('head');
    } else {
      wfRules.empty();
    }

    updateWireFrame();
  };

  $('#svg_docprops_container, #svg_prefs_container').draggable({cancel: 'button,fieldset', containment: 'window'});

  let docprops = false;
  let preferences = false;

  const showDocProperties = function () {
    if (docprops) { return; }
    docprops = true;

    // This selects the correct radio button by using the array notation
    $('#image_save_opts input').val([$.pref('img_save')]);

    // update resolution option with actual resolution
    const res = svgCanvas.getResolution();
    if (curConfig.baseUnit !== 'px') {
      res.w = convertUnit(res.w) + curConfig.baseUnit;
      res.h = convertUnit(res.h) + curConfig.baseUnit;
    }

    $('#canvas_width').val(res.w);
    $('#canvas_height').val(res.h);
    $('#canvas_title').val(svgCanvas.getDocumentTitle());

    $('#svg_docprops').show();
  };

  const showPreferences = function () {
    if (preferences) { return; }
    preferences = true;
    $('#main_menu').hide();

    // Update background color with current one
    const blocks = $('#bg_blocks div');
    const curBg = 'cur_background';
    const canvasBg = curPrefs.bkgd_color;
    const url = $.pref('bkgd_url');
    blocks.each(function () {
      const blk = $(this);
      const isBg = blk.css('background-color') === canvasBg;
      blk.toggleClass(curBg, isBg);
      if (isBg) { $('#canvas_bg_url').removeClass(curBg); }
    });
    if (!canvasBg) { blocks.eq(0).addClass(curBg); }
    if (url) {
      $('#canvas_bg_url').val(url);
    }
    $('#grid_snapping_on').prop('checked', curConfig.gridSnapping);
    $('#grid_snapping_step').attr('value', curConfig.snappingStep);
    $('#grid_color').attr('value', curConfig.gridColor);

    $('#svg_prefs').show();
  };

  const hideSourceEditor = function () {
    $('#svg_source_editor').hide();
    editingsource = false;
    $('#svg_source_textarea').blur();
  };

  const saveSourceEditor = function () {
    if (!editingsource) { return; }

    const saveChanges = function () {
      svgCanvas.clearSelection();
      hideSourceEditor();
      zoomImage();
      populateLayers();
      updateTitle();
      prepPaints();
    };

    if (!svgCanvas.setSvgString($('#svg_source_textarea').val())) {
      $.confirm(uiStrings.notification.QerrorsRevertToSource, function (ok) {
        if (!ok) { return false; }
        saveChanges();
      });
    } else {
      saveChanges();
    }
    setSelectMode();
  };

  const hideDocProperties = function () {
    $('#svg_docprops').hide();
    $('#canvas_width,#canvas_height').removeAttr('disabled');
    $('#resolution')[0].selectedIndex = 0;
    $('#image_save_opts input').val([$.pref('img_save')]);
    docprops = false;
  };

  const hidePreferences = function () {
    $('#svg_prefs').hide();
    preferences = false;
  };

  const saveDocProperties = function () {
    // set title
    const newTitle = $('#canvas_title').val();
    updateTitle(newTitle);
    svgCanvas.setDocumentTitle(newTitle);

    // update resolution
    const width = $('#canvas_width'), w = width.val();
    const height = $('#canvas_height'), h = height.val();

    if (w !== 'fit' && !isValidUnit('width', w)) {
      $.alert(uiStrings.notification.invalidAttrValGiven);
      width.parent().addClass('error');
      return false;
    }

    width.parent().removeClass('error');

    if (h !== 'fit' && !isValidUnit('height', h)) {
      $.alert(uiStrings.notification.invalidAttrValGiven);
      height.parent().addClass('error');
      return false;
    }

    height.parent().removeClass('error');

    if (!svgCanvas.setResolution(w, h)) {
      $.alert(uiStrings.notification.noContentToFitTo);
      return false;
    }

    // Set image save option
    $.pref('img_save', $('#image_save_opts :checked').val());
    updateCanvas();
    hideDocProperties();
  };

  const savePreferences = editor.savePreferences = function () {
    // Set background
    const color = $('#bg_blocks div.cur_background').css('background-color') || '#FFF';
    setBackground(color, $('#canvas_bg_url').val());

    // set language
    const lang = $('#lang_select').val();
    if (lang !== $.pref('lang')) {
      editor.putLocale(lang, goodLangs, curConfig);
    }

    // set icon size
    setIconSize($('#iconsize').val());

    // set grid setting
    curConfig.gridSnapping = $('#grid_snapping_on')[0].checked;
    curConfig.snappingStep = $('#grid_snapping_step').val();
    curConfig.gridColor = $('#grid_color').val();
    curConfig.showRulers = $('#show_rulers')[0].checked;

    $('#rulers').toggle(curConfig.showRulers);
    if (curConfig.showRulers) { updateRulers(); }
    curConfig.baseUnit = $('#base_unit').val();

    svgCanvas.setConfig(curConfig);

    updateCanvas();
    hidePreferences();
  };

  let resetScrollPos = $.noop;

  const cancelOverlays = function () {
    $('#dialog_box').hide();
    if (!editingsource && !docprops && !preferences) {
      if (curContext) {
        svgCanvas.leaveContext();
      }
      return;
    }

    if (editingsource) {
      if (origSource !== $('#svg_source_textarea').val()) {
        $.confirm(uiStrings.notification.QignoreSourceChanges, function (ok) {
          if (ok) { hideSourceEditor(); }
        });
      } else {
        hideSourceEditor();
      }
    } else if (docprops) {
      hideDocProperties();
    } else if (preferences) {
      hidePreferences();
    }
    resetScrollPos();
  };

  const winWh = {width: $(window).width(), height: $(window).height()};

  // Fix for Issue 781: Drawing area jumps to top-left corner on window resize (IE9)
  if (isIE()) {
    (() => {
      resetScrollPos = function () {
        if (workarea[0].scrollLeft === 0 && workarea[0].scrollTop === 0) {
          workarea[0].scrollLeft = curScrollPos.left;
          workarea[0].scrollTop = curScrollPos.top;
        }
      };

      curScrollPos = {
        left: workarea[0].scrollLeft,
        top: workarea[0].scrollTop
      };

      $(window).resize(resetScrollPos);
      editor.ready(function () {
        // TODO: Find better way to detect when to do this to minimize
        // flickering effect
        setTimeout(function () {
          resetScrollPos();
        }, 500);
      });

      workarea.scroll(function () {
        curScrollPos = {
          left: workarea[0].scrollLeft,
          top: workarea[0].scrollTop
        };
      });
    })();
  }

  $(window).resize(function (evt) {
    $.each(winWh, function (type, val) {
      const curval = $(window)[type]();
      workarea[0]['scroll' + (type === 'width' ? 'Left' : 'Top')] -= (curval - val) / 2;
      winWh[type] = curval;
    });
    setFlyoutPositions();
  });

  (() => {
    workarea.scroll(function () {
      // TODO: jQuery's scrollLeft/Top() wouldn't require a null check
      if ($('#ruler_x').length) {
        $('#ruler_x')[0].scrollLeft = workarea[0].scrollLeft;
      }
      if ($('#ruler_y').length) {
        $('#ruler_y')[0].scrollTop = workarea[0].scrollTop;
      }
    });
  })();

  $('#url_notice').click(function () {
    $.alert(this.title);
  });

  $('#change_image_url').click(promptImgURL);

  // added these event handlers for all the push buttons so they
  // behave more like buttons being pressed-in and not images
  (function () {
    const toolnames = ['clear', 'open', 'save', 'source', 'delete', 'delete_multi', 'paste', 'clone', 'clone_multi', 'move_top', 'move_bottom'];
    const curClass = 'tool_button_current';

    let allTools = '';

    $.each(toolnames, function (i, item) {
      allTools += (i ? ',' : '') + '#tool_' + item;
    });

    $(allTools).mousedown(function () {
      $(this).addClass(curClass);
    }).bind('mousedown mouseout', function () {
      $(this).removeClass(curClass);
    });

    $('#tool_undo, #tool_redo').mousedown(function () {
      if (!$(this).hasClass('disabled')) { $(this).addClass(curClass); }
    }).bind('mousedown mouseout', function () {
      $(this).removeClass(curClass);
    });
  }());

  // switch modifier key in tooltips if mac
  // NOTE: This code is not used yet until I can figure out how to successfully bind ctrl/meta
  // in Opera and Chrome
  if (isMac() && !window.opera) {
    const shortcutButtons = ['tool_clear', 'tool_save', 'tool_source', 'tool_undo', 'tool_redo', 'tool_clone'];
    let i = shortcutButtons.length;
    while (i--) {
      const button = document.getElementById(shortcutButtons[i]);
      if (button) {
        const {title} = button;
        const index = title.indexOf('Ctrl+');
        button.title = [title.substr(0, index), 'Cmd+', title.substr(index + 5)].join('');
      }
    }
  }

  // TODO: go back to the color boxes having white background-color and then setting
  //  background-image to none.png (otherwise partially transparent gradients look weird)
  const colorPicker = function (elem) {
    const picker = elem.attr('id') === 'stroke_color' ? 'stroke' : 'fill';
    // const opacity = (picker == 'stroke' ? $('#stroke_opacity') : $('#fill_opacity'));
    const title = (picker === 'stroke' ? 'Pick a Stroke Paint and Opacity' : 'Pick a Fill Paint and Opacity');
    // let wasNone = false; // Currently unused
    const pos = elem.offset();
    let {paint} = paintBox[picker];
    $('#color_picker')
      .draggable({cancel: '.jGraduate_tabs, .jGraduate_colPick, .jGraduate_gradPick, .jPicker', containment: 'window'})
      .css(curConfig.colorPickerCSS || {left: pos.left - 140, bottom: 40})
      .jGraduate(
        {
          paint,
          window: { pickerTitle: title },
          images: { clientPath: curConfig.jGraduatePath },
          newstop: 'inverse'
        },
        function (p) {
          paint = new $.jGraduate.Paint(p);
          paintBox[picker].setPaint(paint);
          svgCanvas.setPaint(picker, paint);
          $('#color_picker').hide();
        },
        function () {
          $('#color_picker').hide();
        }
      );
  };

  const PaintBox = function (container, type) {
    let paintColor, paintOpacity;
    const cur = curConfig[type === 'fill' ? 'initFill' : 'initStroke'];
    // set up gradients to be used for the buttons
    const svgdocbox = new DOMParser().parseFromString(
      '<svg xmlns="http://www.w3.org/2000/svg"><rect width="16.5" height="16.5"' +
'          fill="#' + cur.color + '" opacity="' + cur.opacity + '"/>' +
'          <defs><linearGradient id="gradbox_"/></defs></svg>', 'text/xml');

    let docElem = svgdocbox.documentElement;
    docElem = $(container)[0].appendChild(document.importNode(docElem, true));
    docElem.setAttribute('width', 16.5);

    this.rect = docElem.firstChild;
    this.defs = docElem.getElementsByTagName('defs')[0];
    this.grad = this.defs.firstChild;
    this.paint = new $.jGraduate.Paint({solidColor: cur.color});
    this.type = type;

    this.setPaint = function (paint, apply) {
      this.paint = paint;

      const ptype = paint.type;
      const opac = paint.alpha / 100;

      let fillAttr = 'none';
      switch (ptype) {
      case 'solidColor':
        fillAttr = (paint[ptype] !== 'none') ? '#' + paint[ptype] : paint[ptype];
        break;
      case 'linearGradient':
      case 'radialGradient':
        this.defs.removeChild(this.grad);
        this.grad = this.defs.appendChild(paint[ptype]);
        const id = this.grad.id = 'gradbox_' + this.type;
        fillAttr = 'url(#' + id + ')';
        break;
      }

      this.rect.setAttribute('fill', fillAttr);
      this.rect.setAttribute('opacity', opac);

      if (apply) {
        svgCanvas.setColor(this.type, paintColor, true);
        svgCanvas.setPaintOpacity(this.type, paintOpacity, true);
      }
    };

    this.update = function (apply) {
      if (!selectedElement) { return; }

      const {type} = this;
      switch (selectedElement.tagName) {
      case 'use':
      case 'image':
      case 'foreignObject':
        // These elements don't have fill or stroke, so don't change
        // the current value
        return;
      case 'g':
      case 'a': {
        const childs = selectedElement.getElementsByTagName('*');

        let gPaint = null;
        for (let i = 0, len = childs.length; i < len; i++) {
          const elem = childs[i];
          const p = elem.getAttribute(type);
          if (i === 0) {
            gPaint = p;
          } else if (gPaint !== p) {
            gPaint = null;
            break;
          }
        }

        if (gPaint === null) {
          // No common color, don't update anything
          paintColor = null;
          return;
        }
        paintColor = gPaint;
        paintOpacity = 1;
        break;
      } default:
        paintOpacity = parseFloat(selectedElement.getAttribute(type + '-opacity'));
        if (isNaN(paintOpacity)) {
          paintOpacity = 1.0;
        }

        const defColor = type === 'fill' ? 'black' : 'none';
        paintColor = selectedElement.getAttribute(type) || defColor;
      }

      if (apply) {
        svgCanvas.setColor(type, paintColor, true);
        svgCanvas.setPaintOpacity(type, paintOpacity, true);
      }

      paintOpacity *= 100;

      const paint = getPaint(paintColor, paintOpacity, type);
      // update the rect inside #fill_color/#stroke_color
      this.setPaint(paint);
    };

    this.prep = function () {
      const ptype = this.paint.type;

      switch (ptype) {
      case 'linearGradient':
      case 'radialGradient':
        const paint = new $.jGraduate.Paint({copy: this.paint});
        svgCanvas.setPaint(type, paint);
        break;
      }
    };
  };

  paintBox.fill = new PaintBox('#fill_color', 'fill');
  paintBox.stroke = new PaintBox('#stroke_color', 'stroke');

  $('#stroke_width').val(curConfig.initStroke.width);
  $('#group_opacity').val(curConfig.initOpacity * 100);

  // Use this SVG elem to test vectorEffect support
  const testEl = paintBox.fill.rect.cloneNode(false);
  testEl.setAttribute('style', 'vector-effect:non-scaling-stroke');
  const supportsNonSS = (testEl.style.vectorEffect === 'non-scaling-stroke');
  testEl.removeAttribute('style');
  const svgdocbox = paintBox.fill.rect.ownerDocument;
  // Use this to test support for blur element. Seems to work to test support in Webkit
  const blurTest = svgdocbox.createElementNS(NS.SVG, 'feGaussianBlur');
  if (blurTest.stdDeviationX === undefined) {
    $('#tool_blur').hide();
  }
  $(blurTest).remove();

  // Test for zoom icon support
  (function () {
    const pre = '-' + uaPrefix.toLowerCase() + '-zoom-';
    const zoom = pre + 'in';
    workarea.css('cursor', zoom);
    if (workarea.css('cursor') === zoom) {
      zoomInIcon = zoom;
      zoomOutIcon = pre + 'out';
    }
    workarea.css('cursor', 'auto');
  }());

  // Test for embedImage support (use timeout to not interfere with page load)
  setTimeout(function () {
    svgCanvas.embedImage('images/logo.png', function (datauri) {
      if (!datauri) {
        // Disable option
        $('#image_save_opts [value=embed]').attr('disabled', 'disabled');
        $('#image_save_opts input').val(['ref']);
        $.pref('img_save', 'ref');
        $('#image_opt_embed').css('color', '#666').attr('title', uiStrings.notification.featNotSupported);
      }
    });
  }, 1000);

  $('#fill_color, #tool_fill .icon_label').click(function () {
    colorPicker($('#fill_color'));
    updateToolButtonState();
  });

  $('#stroke_color, #tool_stroke .icon_label').click(function () {
    colorPicker($('#stroke_color'));
    updateToolButtonState();
  });

  $('#group_opacityLabel').click(function () {
    $('#opacity_dropdown button').mousedown();
    $(window).mouseup();
  });

  $('#zoomLabel').click(function () {
    $('#zoom_dropdown button').mousedown();
    $(window).mouseup();
  });

  $('#tool_move_top').mousedown(function (evt) {
    $('#tools_stacking').show();
    evt.preventDefault();
  });

  $('.layer_button').mousedown(function () {
    $(this).addClass('layer_buttonpressed');
  }).mouseout(function () {
    $(this).removeClass('layer_buttonpressed');
  }).mouseup(function () {
    $(this).removeClass('layer_buttonpressed');
  });

  $('.push_button').mousedown(function () {
    if (!$(this).hasClass('disabled')) {
      $(this).addClass('push_button_pressed').removeClass('push_button');
    }
  }).mouseout(function () {
    $(this).removeClass('push_button_pressed').addClass('push_button');
  }).mouseup(function () {
    $(this).removeClass('push_button_pressed').addClass('push_button');
  });

  // ask for a layer name
  $('#layer_new').click(function () {
    let uniqName,
      i = svgCanvas.getCurrentDrawing().getNumLayers();
    do {
      uniqName = uiStrings.layers.layer + ' ' + (++i);
    } while (svgCanvas.getCurrentDrawing().hasLayer(uniqName));

    $.prompt(uiStrings.notification.enterUniqueLayerName, uniqName, function (newName) {
      if (!newName) { return; }
      if (svgCanvas.getCurrentDrawing().hasLayer(newName)) {
        $.alert(uiStrings.notification.dupeLayerName);
        return;
      }
      svgCanvas.createLayer(newName);
      updateContextPanel();
      populateLayers();
    });
  });

  function deleteLayer () {
    if (svgCanvas.deleteCurrentLayer()) {
      updateContextPanel();
      populateLayers();
      // This matches what SvgCanvas does
      // TODO: make this behavior less brittle (svg-editor should get which
      // layer is selected from the canvas and then select that one in the UI)
      $('#layerlist tr.layer').removeClass('layersel');
      $('#layerlist tr.layer:first').addClass('layersel');
    }
  }

  function cloneLayer () {
    const name = svgCanvas.getCurrentDrawing().getCurrentLayerName() + ' copy';

    $.prompt(uiStrings.notification.enterUniqueLayerName, name, function (newName) {
      if (!newName) { return; }
      if (svgCanvas.getCurrentDrawing().hasLayer(newName)) {
        $.alert(uiStrings.notification.dupeLayerName);
        return;
      }
      svgCanvas.cloneLayer(newName);
      updateContextPanel();
      populateLayers();
    });
  }

  function mergeLayer () {
    if ($('#layerlist tr.layersel').index() === svgCanvas.getCurrentDrawing().getNumLayers() - 1) {
      return;
    }
    svgCanvas.mergeLayer();
    updateContextPanel();
    populateLayers();
  }

  function moveLayer (pos) {
    const total = svgCanvas.getCurrentDrawing().getNumLayers();

    let curIndex = $('#layerlist tr.layersel').index();
    if (curIndex > 0 || curIndex < total - 1) {
      curIndex += pos;
      svgCanvas.setCurrentLayerPosition(total - curIndex - 1);
      populateLayers();
    }
  }

  $('#layer_delete').click(deleteLayer);

  $('#layer_up').click(() => {
    moveLayer(-1);
  });

  $('#layer_down').click(() => {
    moveLayer(1);
  });

  $('#layer_rename').click(function () {
    // const curIndex = $('#layerlist tr.layersel').prevAll().length; // Currently unused
    const oldName = $('#layerlist tr.layersel td.layername').text();
    $.prompt(uiStrings.notification.enterNewLayerName, '', function (newName) {
      if (!newName) { return; }
      if (oldName === newName || svgCanvas.getCurrentDrawing().hasLayer(newName)) {
        $.alert(uiStrings.notification.layerHasThatName);
        return;
      }

      svgCanvas.renameCurrentLayer(newName);
      populateLayers();
    });
  });

  const SIDEPANEL_MAXWIDTH = 300;
  const SIDEPANEL_OPENWIDTH = 150;
  let sidedrag = -1, sidedragging = false, allowmove = false;

  const changeSidePanelWidth = function (delta) {
    const rulerX = $('#ruler_x');
    $('#sidepanels').width('+=' + delta);
    $('#layerpanel').width('+=' + delta);
    rulerX.css('right', parseInt(rulerX.css('right'), 10) + delta);
    workarea.css('right', parseInt(workarea.css('right'), 10) + delta);
    svgCanvas.runExtensions('workareaResized');
  };

  const resizeSidePanel = function (evt) {
    if (!allowmove) { return; }
    if (sidedrag === -1) { return; }
    sidedragging = true;
    let deltaX = sidedrag - evt.pageX;
    let sideWidth = $('#sidepanels').width();
    if (sideWidth + deltaX > SIDEPANEL_MAXWIDTH) {
      deltaX = SIDEPANEL_MAXWIDTH - sideWidth;
      sideWidth = SIDEPANEL_MAXWIDTH;
    } else if (sideWidth + deltaX < 2) {
      deltaX = 2 - sideWidth;
      sideWidth = 2;
    }
    if (deltaX === 0) { return; }
    sidedrag -= deltaX;
    changeSidePanelWidth(deltaX);
  };

  // if width is non-zero, then fully close it, otherwise fully open it
  // the optional close argument forces the side panel closed
  const toggleSidePanel = function (close) {
    const w = $('#sidepanels').width();
    const deltaX = (w > 2 || close ? 2 : SIDEPANEL_OPENWIDTH) - w;
    changeSidePanelWidth(deltaX);
  };

  $('#sidepanel_handle')
    .mousedown(function (evt) {
      sidedrag = evt.pageX;
      $(window).mousemove(resizeSidePanel);
      allowmove = false;
      // Silly hack for Chrome, which always runs mousemove right after mousedown
      setTimeout(function () {
        allowmove = true;
      }, 20);
    })
    .mouseup(function (evt) {
      if (!sidedragging) { toggleSidePanel(); }
      sidedrag = -1;
      sidedragging = false;
    });

  $(window).mouseup(function () {
    sidedrag = -1;
    sidedragging = false;
    $('#svg_editor').unbind('mousemove', resizeSidePanel);
  });

  populateLayers();

  // function changeResolution (x,y) {
  //   const {zoom} = svgCanvas.getResolution();
  //   setResolution(x * zoom, y * zoom);
  // }

  const centerCanvas = () => {
    // this centers the canvas vertically in the workarea (horizontal handled in CSS)
    workarea.css('line-height', workarea.height() + 'px');
  };

  $(window).bind('load resize', centerCanvas);

  function stepFontSize (elem, step) {
    const origVal = Number(elem.value);
    const sugVal = origVal + step;
    const increasing = sugVal >= origVal;
    if (step === 0) { return origVal; }

    if (origVal >= 24) {
      if (increasing) {
        return Math.round(origVal * 1.1);
      }
      return Math.round(origVal / 1.1);
    }
    if (origVal <= 1) {
      if (increasing) {
        return origVal * 2;
      }
      return origVal / 2;
    }
    return sugVal;
  }

  function stepZoom (elem, step) {
    const origVal = Number(elem.value);
    if (origVal === 0) { return 100; }
    const sugVal = origVal + step;
    if (step === 0) { return origVal; }

    if (origVal >= 100) {
      return sugVal;
    }
    if (sugVal >= origVal) {
      return origVal * 2;
    }
    return origVal / 2;
  }

  // function setResolution (w, h, center) {
  //   updateCanvas();
  //   // w -= 0; h -= 0;
  //   // $('#svgcanvas').css({width: w, height: h});
  //   // $('#canvas_width').val(w);
  //   // $('#canvas_height').val(h);
  //   //
  //   // if (center) {
  //   //   const wArea = workarea;
  //   //   const scrollY = h/2 - wArea.height()/2;
  //   //   const scrollX = w/2 - wArea.width()/2;
  //   //   wArea[0].scrollTop = scrollY;
  //   //   wArea[0].scrollLeft = scrollX;
  //   // }
  // }

  $('#resolution').change(function () {
    const wh = $('#canvas_width,#canvas_height');
    if (!this.selectedIndex) {
      if ($('#canvas_width').val() === 'fit') {
        wh.removeAttr('disabled').val(100);
      }
    } else if (this.value === 'content') {
      wh.val('fit').attr('disabled', 'disabled');
    } else {
      const dims = this.value.split('x');
      $('#canvas_width').val(dims[0]);
      $('#canvas_height').val(dims[1]);
      wh.removeAttr('disabled');
    }
  });

  // Prevent browser from erroneously repopulating fields
  $('input,select').attr('autocomplete', 'off');

  // Associate all button actions as well as non-button keyboard shortcuts
  const Actions = (function () {
    // sel:'selector', fn:function, evt:'event', key:[key, preventDefault, NoDisableInInput]
    const toolButtons = [
      {sel: '#tool_select', fn: clickSelect, evt: 'click', key: ['V', true]},
      {sel: '#tool_fhpath', fn: clickFHPath, evt: 'click', key: ['Q', true]},
      {sel: '#tool_line', fn: clickLine, evt: 'click', key: ['L', true]},
      {sel: '#tool_rect', fn: clickRect, evt: 'mouseup', key: ['R', true], parent: '#tools_rect', icon: 'rect'},
      {sel: '#tool_square', fn: clickSquare, evt: 'mouseup', parent: '#tools_rect', icon: 'square'},
      {sel: '#tool_fhrect', fn: clickFHRect, evt: 'mouseup', parent: '#tools_rect', icon: 'fh_rect'},
      {sel: '#tool_ellipse', fn: clickEllipse, evt: 'mouseup', key: ['E', true], parent: '#tools_ellipse', icon: 'ellipse'},
      {sel: '#tool_circle', fn: clickCircle, evt: 'mouseup', parent: '#tools_ellipse', icon: 'circle'},
      {sel: '#tool_fhellipse', fn: clickFHEllipse, evt: 'mouseup', parent: '#tools_ellipse', icon: 'fh_ellipse'},
      {sel: '#tool_path', fn: clickPath, evt: 'click', key: ['P', true]},
      {sel: '#tool_text', fn: clickText, evt: 'click', key: ['T', true]},
      {sel: '#tool_image', fn: clickImage, evt: 'mouseup'},
      {sel: '#tool_zoom', fn: clickZoom, evt: 'mouseup', key: ['Z', true]},
      {sel: '#tool_clear', fn: clickClear, evt: 'mouseup', key: ['N', true]},
      {sel: '#tool_save', fn () {
        if (editingsource) {
          saveSourceEditor();
        } else {
          clickSave();
        }
      }, evt: 'mouseup', key: ['S', true]},
      {sel: '#tool_export', fn: clickExport, evt: 'mouseup'},
      {sel: '#tool_open', fn: clickOpen, evt: 'mouseup', key: ['O', true]},
      {sel: '#tool_import', fn: clickImport, evt: 'mouseup'},
      {sel: '#tool_source', fn: showSourceEditor, evt: 'click', key: ['U', true]},
      {sel: '#tool_wireframe', fn: clickWireframe, evt: 'click', key: ['F', true]},
      {sel: '#tool_source_cancel,.overlay,#tool_docprops_cancel,#tool_prefs_cancel', fn: cancelOverlays, evt: 'click', key: ['esc', false, false], hidekey: true},
      {sel: '#tool_source_save', fn: saveSourceEditor, evt: 'click'},
      {sel: '#tool_docprops_save', fn: saveDocProperties, evt: 'click'},
      {sel: '#tool_docprops', fn: showDocProperties, evt: 'mouseup'},
      {sel: '#tool_prefs_save', fn: savePreferences, evt: 'click'},
      {sel: '#tool_prefs_option', fn () { showPreferences(); return false; }, evt: 'mouseup'},
      {sel: '#tool_delete,#tool_delete_multi', fn: deleteSelected, evt: 'click', key: ['del/backspace', true]},
      {sel: '#tool_reorient', fn: reorientPath, evt: 'click'},
      {sel: '#tool_node_link', fn: linkControlPoints, evt: 'click'},
      {sel: '#tool_node_clone', fn: clonePathNode, evt: 'click'},
      {sel: '#tool_node_delete', fn: deletePathNode, evt: 'click'},
      {sel: '#tool_openclose_path', fn: opencloseSubPath, evt: 'click'},
      {sel: '#tool_add_subpath', fn: addSubPath, evt: 'click'},
      {sel: '#tool_move_top', fn: moveToTopSelected, evt: 'click', key: 'ctrl+shift+]'},
      {sel: '#tool_move_bottom', fn: moveToBottomSelected, evt: 'click', key: 'ctrl+shift+['},
      {sel: '#tool_topath', fn: convertToPath, evt: 'click'},
      {sel: '#tool_make_link,#tool_make_link_multi', fn: makeHyperlink, evt: 'click'},
      {sel: '#tool_undo', fn: clickUndo, evt: 'click'},
      {sel: '#tool_redo', fn: clickRedo, evt: 'click'},
      {sel: '#tool_clone,#tool_clone_multi', fn: clickClone, evt: 'click', key: ['D', true]},
      {sel: '#tool_group_elements', fn: clickGroup, evt: 'click', key: ['G', true]},
      {sel: '#tool_ungroup', fn: clickGroup, evt: 'click'},
      {sel: '#tool_unlink_use', fn: clickGroup, evt: 'click'},
      {sel: '[id^=tool_align]', fn: clickAlign, evt: 'click'},
      // these two lines are required to make Opera work properly with the flyout mechanism
      // {sel: '#tools_rect_show', fn: clickRect, evt: 'click'},
      // {sel: '#tools_ellipse_show', fn: clickEllipse, evt: 'click'},
      {sel: '#tool_bold', fn: clickBold, evt: 'mousedown'},
      {sel: '#tool_italic', fn: clickItalic, evt: 'mousedown'},
      {sel: '#sidepanel_handle', fn: toggleSidePanel, key: ['X']},
      {sel: '#copy_save_done', fn: cancelOverlays, evt: 'click'},

      // Shortcuts not associated with buttons

      {key: 'ctrl+left', fn () { rotateSelected(0, 1); }},
      {key: 'ctrl+right', fn () { rotateSelected(1, 1); }},
      {key: 'ctrl+shift+left', fn () { rotateSelected(0, 5); }},
      {key: 'ctrl+shift+right', fn () { rotateSelected(1, 5); }},
      {key: 'shift+O', fn: selectPrev},
      {key: 'shift+P', fn: selectNext},
      {key: [modKey + 'up', true], fn () { zoomImage(2); }},
      {key: [modKey + 'down', true], fn () { zoomImage(0.5); }},
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
      {key: 'A', fn () { svgCanvas.selectAllInCurrentLayer(); }},

      // Standard shortcuts
      {key: modKey + 'z', fn: clickUndo},
      {key: modKey + 'shift+z', fn: clickRedo},
      {key: modKey + 'y', fn: clickRedo},

      {key: modKey + 'x', fn: cutSelected},
      {key: modKey + 'c', fn: copySelected},
      {key: modKey + 'v', fn: pasteInCenter}
    ];

    // Tooltips not directly associated with a single function
    const keyAssocs = {
      '4/Shift+4': '#tools_rect_show',
      '5/Shift+5': '#tools_ellipse_show'
    };

    return {
      setAll () {
        const flyouts = {};

        $.each(toolButtons, function (i, opts) {
          // Bind function to button
          let btn;
          if (opts.sel) {
            btn = $(opts.sel);
            if (!btn.length) { return true; } // Skip if markup does not exist
            if (opts.evt) {
              if (isTouch() && opts.evt === 'click') {
                opts.evt = 'mousedown';
              }
              btn[opts.evt](opts.fn);
            }

            // Add to parent flyout menu, if able to be displayed
            if (opts.parent && $(opts.parent + '_show').length) {
              let fH = $(opts.parent);
              if (!fH.length) {
                fH = makeFlyoutHolder(opts.parent.substr(1));
              }

              fH.append(btn);

              if (!Array.isArray(flyouts[opts.parent])) {
                flyouts[opts.parent] = [];
              }
              flyouts[opts.parent].push(opts);
            }
          }

          // Bind function to shortcut key
          if (opts.key) {
            // Set shortcut based on options
            let keyval,
              // disInInp = true,
              pd = false;
            if (Array.isArray(opts.key)) {
              keyval = opts.key[0];
              if (opts.key.length > 1) { pd = opts.key[1]; }
              // if (opts.key.length > 2) { disInInp = opts.key[2]; }
            } else {
              keyval = opts.key;
            }
            keyval += '';

            const {fn} = opts;
            $.each(keyval.split('/'), function (i, key) {
              $(document).bind('keydown', key, function (e) {
                fn();
                if (pd) {
                  e.preventDefault();
                }
                // Prevent default on ALL keys?
                return false;
              });
            });

            // Put shortcut in title
            if (opts.sel && !opts.hidekey && btn.attr('title')) {
              const newTitle = btn.attr('title').split('[')[0] + ' (' + keyval + ')';
              keyAssocs[keyval] = opts.sel;
              // Disregard for menu items
              if (!btn.parents('#main_menu').length) {
                btn.attr('title', newTitle);
              }
            }
          }
        });

        // Setup flyouts
        setupFlyouts(flyouts);

        // Misc additional actions

        // Make 'return' keypress trigger the change event
        $('.attr_changer, #image_url').bind('keydown', 'return',
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

        $('#tool_zoom').dblclick(dblclickZoom);
      },
      setTitles () {
        $.each(keyAssocs, function (keyval, sel) {
          const menu = ($(sel).parents('#main_menu').length);

          $(sel).each(function () {
            let t;
            if (menu) {
              t = $(this).text().split(' [')[0];
            } else {
              t = this.title.split(' [')[0];
            }
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
      getButtonData (sel) {
        let b;
        $.each(toolButtons, function (i, btn) {
          if (btn.sel === sel) { b = btn; }
        });
        return b;
      }
    };
  }());

  Actions.setAll();

  // Select given tool
  editor.ready(function () {
    let tool;
    const itool = curConfig.initTool,
      container = $('#tools_left, #svg_editor .tools_flyout'),
      preTool = container.find('#tool_' + itool),
      regTool = container.find('#' + itool);
    if (preTool.length) {
      tool = preTool;
    } else if (regTool.length) {
      tool = regTool;
    } else {
      tool = $('#tool_select');
    }
    tool.click().mouseup();

    if (curConfig.wireframe) {
      $('#tool_wireframe').click();
    }

    if (curConfig.showlayers) {
      toggleSidePanel();
    }

    $('#rulers').toggle(!!curConfig.showRulers);

    if (curConfig.showRulers) {
      $('#show_rulers')[0].checked = true;
    }

    if (curConfig.baseUnit) {
      $('#base_unit').val(curConfig.baseUnit);
    }

    if (curConfig.gridSnapping) {
      $('#grid_snapping_on')[0].checked = true;
    }

    if (curConfig.snappingStep) {
      $('#grid_snapping_step').val(curConfig.snappingStep);
    }

    if (curConfig.gridColor) {
      $('#grid_color').val(curConfig.gridColor);
    }
  });

  // init SpinButtons
  $('#rect_rx').SpinButton({min: 0, max: 1000, stateObj, callback: changeRectRadius});
  $('#stroke_width').SpinButton({min: 0, max: 99, smallStep: 0.1, stateObj, callback: changeStrokeWidth});
  $('#angle').SpinButton({min: -180, max: 180, step: 5, stateObj, callback: changeRotationAngle});
  $('#font_size').SpinButton({min: 0.001, stepfunc: stepFontSize, stateObj, callback: changeFontSize});
  $('#group_opacity').SpinButton({min: 0, max: 100, step: 5, stateObj, callback: changeOpacity});
  $('#blur').SpinButton({min: 0, max: 10, step: 0.1, stateObj, callback: changeBlur});
  $('#zoom').SpinButton({min: 0.001, max: 10000, step: 50, stepfunc: stepZoom, stateObj, callback: changeZoom})
    // Set default zoom
    .val(svgCanvas.getZoom() * 100);

  $('#workarea').contextMenu(
    {
      menu: 'cmenu_canvas',
      inSpeed: 0
    },
    function (action, el, pos) {
      switch (action) {
      case 'delete':
        deleteSelected();
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
        moveToTopSelected();
        break;
      case 'move_up':
        moveUpDownSelected('Up');
        break;
      case 'move_down':
        moveUpDownSelected('Down');
        break;
      case 'move_back':
        moveToBottomSelected();
        break;
      default:
        if (hasCustomHandler(action)) {
          getCustomHandler(action).call();
        }
        break;
      }
    }
  );

  const lmenuFunc = function (action, el, pos) {
    switch (action) {
    case 'dupe':
      cloneLayer();
      break;
    case 'delete':
      deleteLayer();
      break;
    case 'merge_down':
      mergeLayer();
      break;
    case 'merge_all':
      svgCanvas.mergeAllLayers();
      updateContextPanel();
      populateLayers();
      break;
    }
  };

  $('#layerlist').contextMenu(
    {
      menu: 'cmenu_layers',
      inSpeed: 0
    },
    lmenuFunc
  );

  $('#layer_moreopts').contextMenu(
    {
      menu: 'cmenu_layers',
      inSpeed: 0,
      allowLeft: true
    },
    lmenuFunc
  );

  $('.contextMenu li').mousedown(function (ev) {
    ev.preventDefault();
  });

  $('#cmenu_canvas li').disableContextMenu();
  canvMenu.enableContextMenuItems('#delete,#cut,#copy');

  canvMenu[(localStorage.getItem('svgedit_clipboard') ? 'en' : 'dis') + 'ableContextMenuItems'](
    '#paste,#paste_in_place'
  );
  window.addEventListener('storage', function (e) {
    if (e.key !== 'svgedit_clipboard') return;

    canvMenu[(localStorage.getItem('svgedit_clipboard') ? 'en' : 'dis') + 'ableContextMenuItems'](
      '#paste,#paste_in_place'
    );
  });

  window.addEventListener('beforeunload', function (e) {
    // Suppress warning if page is empty
    if (undoMgr.getUndoStackSize() === 0) {
      editor.showSaveWarning = false;
    }

    // showSaveWarning is set to 'false' when the page is saved.
    if (!curConfig.no_save_warning && editor.showSaveWarning) {
      // Browser already asks question about closing the page
      e.returnValue = uiStrings.notification.unsavedChanges; // Firefox needs this when beforeunload set by addEventListener (even though message is not used)
      return uiStrings.notification.unsavedChanges;
    }
  }, false);

  editor.canvas.getUIStrings = function () {
    return uiStrings;
  };

  editor.openPrep = function (func) {
    $('#main_menu').hide();
    if (undoMgr.getUndoStackSize() === 0) {
      func(true);
    } else {
      $.confirm(uiStrings.notification.QwantToOpen, func);
    }
  };

  function onDragEnter (e) {
    e.stopPropagation();
    e.preventDefault();
    // and indicator should be displayed here, such as "drop files here"
  }

  function onDragOver (e) {
    e.stopPropagation();
    e.preventDefault();
  }

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
    const importImage = function (e) {
      $.process_cancel(uiStrings.notification.loadingImage);
      e.stopPropagation();
      e.preventDefault();
      $('#workarea').removeAttr('style');
      $('#main_menu').hide();
      const file = (e.type === 'drop') ? e.dataTransfer.files[0] : this.files[0];
      if (!file) {
        $('#dialog_box').hide();
        return;
      }
      /* if (file.type === 'application/pdf') { // Todo: Handle PDF imports

      }
      else */
      if (file.type.includes('image')) {
        // Detected an image
        // svg handling
        let reader;
        if (file.type.includes('svg')) {
          reader = new FileReader();
          reader.onloadend = function (e) {
            const newElement = svgCanvas.importSvgString(e.target.result, true);
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
          reader.onloadend = function (e) {
            // let's insert the new image until we know its dimensions
            const insertNewImage = function (width, height) {
              const newImage = svgCanvas.addSvgElementFromJson({
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
              svgCanvas.setHref(newImage, e.target.result);
              svgCanvas.selectOnly([newImage]);
              svgCanvas.alignSelectedElements('m', 'page');
              svgCanvas.alignSelectedElements('c', 'page');
              updateContextPanel();
              $('#dialog_box').hide();
            };
            // create dummy img so we know the default dimensions
            let imgWidth = 100;
            let imgHeight = 100;
            const img = new Image();
            img.src = e.target.result;
            img.style.opacity = 0;
            img.onload = function () {
              imgWidth = img.offsetWidth;
              imgHeight = img.offsetHeight;
              insertNewImage(imgWidth, imgHeight);
            };
          };
          reader.readAsDataURL(file);
        }
      }
    };

    workarea[0].addEventListener('dragenter', onDragEnter, false);
    workarea[0].addEventListener('dragover', onDragOver, false);
    workarea[0].addEventListener('dragleave', onDragLeave, false);
    workarea[0].addEventListener('drop', importImage, false);

    const open = $('<input type="file">').change(function () {
      const f = this;
      editor.openPrep(function (ok) {
        if (!ok) { return; }
        svgCanvas.clear();
        if (f.files.length === 1) {
          $.process_cancel(uiStrings.notification.loadingImage);
          const reader = new FileReader();
          reader.onloadend = function (e) {
            loadSvgString(e.target.result);
            updateCanvas();
          };
          reader.readAsText(f.files[0]);
        }
      });
    });
    $('#tool_open').show().prepend(open);

    const imgImport = $('<input type="file">').change(importImage);
    $('#tool_import').show().prepend(imgImport);
  }

  // $(function () {
  updateCanvas(true);
  // });

  //  const revnums = "svg-editor.js ($Rev$) ";
  //  revnums += svgCanvas.getVersion();
  //  $('#copyright')[0].setAttribute('title', revnums);

  // For Compatibility with older extensions
  // $(function () {
  window.svgCanvas = svgCanvas;
  svgCanvas.ready = editor.ready;
  // });

  const setLang = editor.setLang = function (lang, allStrings) {
    editor.langChanged = true;
    $.pref('lang', lang);
    $('#lang_select').val(lang);
    if (!allStrings) {
      return;
    }
    $.extend(uiStrings, allStrings);

    // const notif = allStrings.notification; // Currently unused
    // $.extend will only replace the given strings
    const oldLayerName = $('#layerlist tr.layersel td.layername').text();
    const renameLayer = (oldLayerName === uiStrings.common.layer + ' 1');

    svgCanvas.setUiStrings(allStrings);
    Actions.setTitles();

    if (renameLayer) {
      svgCanvas.renameCurrentLayer(uiStrings.common.layer + ' 1');
      populateLayers();
    }

    // In case extensions loaded before the locale, now we execute a callback on them
    if (extsPreLang.length) {
      while (extsPreLang.length) {
        const ext = extsPreLang.shift();
        ext.langReady({lang, uiStrings});
      }
    } else {
      svgCanvas.runExtensions('langReady', {lang, uiStrings});
    }
    svgCanvas.runExtensions('langChanged', lang);

    // Update flyout tooltips
    setFlyoutTitles();

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
    $('#multiselected_panel div[id^=tool_align]').each(function () {
      $('#tool_pos' + this.id.substr(10))[0].title = this.title;
    });
  };
  localeInit({
    addLangData (langParam) {
      return editor.canvas.runExtensions('addlangData', langParam, true);
    },
    curConfig,
    setLang
  });
  // Load extensions
  // Bit of a hack to run extensions in local Opera/IE9
  if (document.location.protocol === 'file:') {
    setTimeout(extFunc, 100);
  } else {
    extFunc();
  }
};

editor.ready = function (cb) {
  if (!isReady) {
    callbacks.push(cb);
  } else {
    cb();
  }
};

editor.runCallbacks = function () {
  // Todo: See if there is any benefit to refactoring some
  //   of the existing `editor.ready()` calls to return Promises
  Promise.all(callbacks.map((cb) => {
    return cb();
  })).then(() => {
    isReady = true;
  });
};

editor.loadFromString = function (str) {
  editor.ready(function () {
    loadSvgString(str);
  });
};

editor.disableUI = function (featList) {
  // $(function () {
  //   $('#tool_wireframe, #tool_image, #main_button, #tool_source, #sidepanels').remove();
  //   $('#tools_top').css('left', 5);
  // });
};

editor.loadFromURL = function (url, opts) {
  if (!opts) { opts = {}; }

  const {cache, callback: cb} = opts;

  editor.ready(function () {
    $.ajax({
      url,
      dataType: 'text',
      cache: !!cache,
      beforeSend () {
        $.process_cancel(uiStrings.notification.loadingImage);
      },
      success (str) {
        loadSvgString(str, cb);
      },
      error (xhr, stat, err) {
        if (xhr.status !== 404 && xhr.responseText) {
          loadSvgString(xhr.responseText, cb);
        } else {
          $.alert(uiStrings.notification.URLloadFail + ': \n' + err, cb);
        }
      },
      complete () {
        $('#dialog_box').hide();
      }
    });
  });
};

editor.loadFromDataURI = function (str) {
  editor.ready(function () {
    let base64 = false;
    let pre = str.match(/^data:image\/svg\+xml;base64,/);
    if (pre) {
      base64 = true;
    } else {
      pre = str.match(/^data:image\/svg\+xml(?:;(?:utf8)?)?,/);
    }
    if (pre) {
      pre = pre[0];
    }
    const src = str.slice(pre.length);
    loadSvgString(base64 ? Utils.decode64(src) : decodeURIComponent(src));
  });
};

editor.addExtension = function () {
  const args = arguments;

  // Note that we don't want this on editor.ready since some extensions
  // may want to run before then (like server_opensave).
  // $(function () {
  if (svgCanvas) { svgCanvas.addExtension.apply(this, args); }
  // });
};

// Defer injection to wait out initial menu processing. This probably goes
//    away once all context menu behavior is brought to context menu.
editor.ready(() => {
  injectExtendedContextMenuItemsIntoDom();
});

// Run init once DOM is loaded
// jQuery(editor.init);
Promise.resolve().then(() => {
  // We wait a micro-task to let the svgEditor variable be defined for module checks
  editor.init();
});

export default editor;
