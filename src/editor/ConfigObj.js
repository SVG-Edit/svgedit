import { mergeDeep } from '@svgedit/svgcanvas/common/util.js'

/**
* Escapes special characters in a regular expression.
* @function regexEscape
* @param {string} str
* @returns {string}
*/
export const regexEscape = function (str) {
  // Originally from: http://phpjs.org/functions
  return String(str).replace(/[.\\+*?[^\]$(){}=!<>|:-]/g, '\\$&')
}
/**
 * @class configObj
 */
export default class ConfigObj {
  /**
   * @param {PlainObject} editor
   */
  constructor (editor) {
    /**
      * Preferences.
      * @interface module:SVGEditor.Prefs
      * @property {string} [lang="en"] Two-letter language code. The language must exist in the Editor Preferences language list. Defaults to "en" if `locale.js` detection does not detect another language.
      * @property {string} [bkgd_color="#FFF"] Color hex for canvas background color. Defaults to white.
      * @property {string} [bkgd_url=""] Background raster image URL. This image will fill the background of the document; useful for tracing purposes.
      * @property {"embed"|"ref"} [img_save="embed"] Defines whether included raster images should be saved as Data URIs when possible, or as URL references. Settable in the Document Properties dialog.
      * @property {boolean} [save_notice_done=false] Used to track alert status
      * @property {boolean} [export_notice_done=false] Used to track alert status
      * @todo `save_notice_done` and `export_notice_done` should be changed to flags rather than preferences
    */
    this.defaultPrefs = {
      // EDITOR OPTIONS (DIALOG)
      /**
        * Default to "en" if locale.js detection does not detect another language.
        */
      lang: 'en',
      /**
        * Will default to 's' if the window height is smaller than the minimum
        * height and 'm' otherwise.
        */
      bkgd_color: '#FFF',
      bkgd_url: '',
      // DOCUMENT PROPERTIES (DIALOG)
      img_save: 'embed',
      // ALERT NOTICES
      // Only shows in UI as far as alert notices, but useful to remember, so keeping as pref
      save_notice_done: false,
      export_notice_done: false
    }
    /**
      * @tutorial ConfigOptions
      * @interface module:SVGEditor.Config
      * @property {string} [canvasName="default"] Used to namespace storage provided via `ext-storage.js`; you can use this if you wish to have multiple independent instances of SVG Edit on the same domain
      * @property {boolean} [no_save_warning=false] If `true`, prevents the warning dialog box from appearing when closing/reloading the page. Mostly useful for testing.
      * @property {string} [imgPath="images/"] The path where the SVG icons are located, with trailing slash. Note that as of version 2.7, this is not configurable by URL for security reasons.
      * @property {boolean} [preventAllURLConfig=false] Set to `true` to override the ability for URLs to set non-content configuration (including extension config).
      *   Must be set early, i.e., in `svgedit-config-iife.js`; extension loading is too late!
      * @property {boolean} [preventURLContentLoading=false] Set to `true` to override the ability for URLs to set URL-based SVG content.
      *   Must be set early, i.e., in `svgedit-config-iife.js`; extension loading is too late!
      * @property {boolean} [lockExtensions=false] Set to `true` to override the ability for URLs to set their own extensions; disallowed in URL setting. There is no need for this when `preventAllURLConfig` is used.
      *   Must be set early, i.e., in `svgedit-config-iife.js`; extension loading is too late!
      * @property {boolean} [noDefaultExtensions=false] If set to `true`, prohibits automatic inclusion of default extensions (though "extensions" can still be used to add back any desired default extensions along with any other extensions).
      *   This can only be meaningfully used in `svgedit-config-iife.js` or in the URL
      * @property {boolean} [noStorageOnLoad=false] Some interaction with `ext-storage.js`; prevent even the loading of previously saved local storage.
      * @property {boolean} [forceStorage=false] Some interaction with `ext-storage.js`; strongly discouraged from modification as it bypasses user privacy by preventing them
      *   from choosing whether to keep local storage or not (and may be required by law in some regions)
      * @property {boolean} [emptyStorageOnDecline=false] Used by `ext-storage.js`; empty any prior storage if the user declines to store
      * @property {boolean} [avoidClientSide=false] DEPRECATED (use `avoidClientSideDownload` instead); Used by `ext-server_opensave.js`; set to `true` if you wish to always save to server and not only as fallback when client support is lacking
      * @property {boolean} [avoidClientSideDownload=false] Used by `ext-server_opensave.js`; set to `true` if you wish to always save to server and not only as fallback when client support is lacking
      * @property {boolean} [avoidClientSideOpen=false] Used by `ext-server_opensave.js`; set to `true` if you wish to always open from the server and not only as fallback when FileReader client support is lacking
      * @property {string[]} [extensions=[]] Extensions to load on startup. Use an array in `setConfig` and comma separated file names in the URL.Extension names must begin with "ext-".
      *   Note that as of version 2.7, paths containing "/", "\", or ":", are disallowed for security reasons.
      *   Although previous versions of this list would entirely override the default list, as of version 2.7, the defaults will always be added to this explicit list unless the configuration `noDefaultExtensions` is included.
      *   See {@link module:SVGEditor~defaultExtensions}.
      * @property {string[]} [allowedOrigins=[]] Used by `ext-xdomain-messaging.js` to indicate which origins are permitted for cross-domain messaging (e.g., between the embedded editor and main editor code).
      *   Besides explicit domains, one might add '*' to allow all domains (not recommended for privacy/data integrity of your user's content!),
      *   `window.location.origin` for allowing the same origin (should be safe if you trust all apps on your domain), 'null' to allow `file:///` URL usage
      * @property {string} [paramurl] This was available via URL only. Allowed an un-encoded URL within the query string (use "url" or "source" with a data: URI instead)
      * @property {Float} [canvas_expansion=3] The minimum area visible outside the canvas, as a multiple of the image dimensions. The larger the number, the more one can scroll outside the canvas.
      * @property {PlainObject} [initFill] Init fill properties
      * @property {string} [initFill.color="FF0000"] The initial fill color. Must be a hex code string. Defaults to solid red.
      * @property {Float} [initFill.opacity=1] The initial fill opacity. Must be a number between 0 and 1
      * @property {PlainObject} [initStroke] Init stroke properties
      * @property {Float} [initStroke.width=5] The initial stroke width. Must be a positive number.
      * @property {string} [initStroke.color="000000"] The initial stroke color. Must be a hex code. Defaults to solid black.
      * @property {Float} [initStroke.opacity=1] The initial stroke opacity. Must be a number between 0 and 1.
      * @property {PlainObject} text Text style properties
      * @property {Float} [text.stroke_width=0] Text stroke width
      * @property {Float} [text.font_size=24] Text font size
      * @property {string} [text.font_family="serif"] Text font family
      * @property {Float} [initOpacity=1] Initial opacity (multiplied by 100)
      * @property {module:SVGEditor.XYDimensions} [dimensions=[640, 480]] The default width/height of a new document. Use an array in `setConfig` (e.g., `[800, 600]`) and comma separated numbers in the URL.
      * @property {boolean} [gridSnapping=false] Enable snap to grid by default. Set in Editor Options.
      * @property {string} [gridColor="#000"] Accepts hex, e.g., '#000'. Set in Editor Options. Defaults to black.
      * @property {string} [baseUnit="px"] Set in Editor Options.
      * @property {Float} [snappingStep=10] Set the default grid snapping value. Set in Editor Options.
      * @property {boolean} [showRulers=true] Initial state of ruler display (v2.6). Set in Editor Options.
      * @property {string} [initTool="select"] The initially selected tool. Must be either the ID of the button for the tool, or the ID without `tool_` prefix (e.g., "select").
      * @property {boolean} [wireframe=false] Start in wireframe mode
      * @property {boolean} [showlayers=false] Open the layers side-panel by default.
      * @property {"new"|"same"} [exportWindowType="new"] Can be "new" or "same" to indicate whether new windows will be generated for each export;
      *   the `window.name` of the export window is namespaced based on the `canvasName` (and incremented if "new" is selected as the type). Introduced 2.8.
      * @property {boolean} [showGrid=false] Set by `ext-grid.js`; determines whether or not to show the grid by default
      * @property {boolean} [show_outside_canvas=true] Defines whether or not elements outside the canvas should be visible. Set and used in `svgcanvas.js`.
      * @property {boolean} [selectNew=true] If true, will replace the selection with the current element and automatically select element objects (when not in "path" mode) after they are created, showing their grips (v2.6).
      * @property {boolean} [layerView=false] Set for 'ext-layer_view.js'; determines whether or not only current layer is shown by default
      *   Set and used in `svgcanvas.js` (`mouseUp`).
     */
    this.defaultConfig = {
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
        font_family: 'Serif'
      },
      initOpacity: 1,
      initTool: 'select',
      exportWindowType: 'new', // 'same' (todo: also support 'download')
      wireframe: false,
      showlayers: false,
      no_save_warning: false,
      // PATH CONFIGURATION
      // The following path configuration items are disallowed in the URL (as should any future path configurations)
      imgPath: './images',
      extPath: './extensions',
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
      // SOURCE OUTPUT BEHAVIOR
      dynamicOutput: false,
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
      emptyStorageOnDecline: false, // Used by ext-storage.js; empty any prior storage if the user declines to store
      // EXTENSION (CLIENT VS. SERVER SAVING/OPENING)
      avoidClientSide: false, // Deprecated in favor of `avoidClientSideDownload`
      avoidClientSideDownload: false,
      avoidClientSideOpen: false,
      layerView: false
    }

    this.curPrefs = {}
    // Note: The difference between Prefs and Config is that Prefs
    //   can be changed in the UI and are stored in the browser,
    //   while config cannot
    this.urldata = {}
    /**
      * @name module:SVGEditor~defaultExtensions
      * @type {string[]}
    */
    this.defaultExtensions = [
      'ext-connector',
      'ext-eyedropper',
      'ext-grid',
      // 'ext-imagelib',
      // 'ext-arrows',
      'ext-markers',
      // 'ext-overview_window', disabled until we fix performance issue
      'ext-panning',
      'ext-shapes',
      'ext-polystar',
      'ext-storage',
      'ext-opensave',
      'ext-layer_view'
    ]
    this.curConfig = {
      // We do not put on defaultConfig to simplify object copying
      //   procedures (we obtain instead from defaultExtensions)
      extensions: [],
      userExtensions: [],
      /**
      * Can use `location.origin` to indicate the current
      * origin. Can contain a '*' to allow all domains or 'null' (as
      * a string) to support all `file:///` URLs. Cannot be set by
      * URL for security reasons (not safe, at least for
      * privacy or data integrity of SVG content).
      * Might have been fairly safe to allow
      *   `new URL(location.href).origin` by default but
      *   avoiding it ensures some more security that even third
      *   party apps on the same domain also cannot communicate
      *   with this app by default.
      * For use with `ext-xdomain-messaging.js`
      * @todo We might instead make as a user-facing preference.
      */
      allowedOrigins: []
    }
    this.editor = editor
  }

  /**
   * @function setupCurPrefs
   * @returns {void}
   */
  setupCurPrefs () {
    const curPrefs = { ...this.defaultPrefs, ...this.curPrefs } // Now safe to merge with priority for curPrefs in the event any are already set
    // Export updated prefs
    this.curPrefs = curPrefs
  }

  /**
   * Sets up current config based on defaults.
   * @returns {void}
   */
  setupCurConfig () {
    const curConfig = { ...this.defaultConfig, ...this.curConfig } // Now safe to merge with priority for curConfig in the event any are already set

    // Now deal with extensions and other array config
    if (!curConfig.noDefaultExtensions) {
      curConfig.extensions = [...this.defaultExtensions]
    }
    // Export updated config
    this.curConfig = curConfig
  }

  /**
   * @function loadFromURL Load config/data from URL if given
   * @returns {void}
   */
  loadFromURL () {
    const self = this
    const { search, searchParams } = new URL(location)
    if (search) {
      this.urldata = {}
      const entries = searchParams.entries()
      for (const entry of entries) {
        this.urldata[entry[0]] = entry[1]
      }

      ['initStroke', 'initFill'].forEach((prop) => {
        if (searchParams.has(`${prop}[color]`)) {
          // Restore back to original non-deparamed value to avoid color
          //  strings being converted to numbers
          if (this.urldata[prop] === undefined) { this.urldata[prop] = {} }
          this.urldata[prop].color = searchParams.get(`${prop}[color]`)
        }
      })

      if (searchParams.has('bkgd_color')) {
        this.urldata.bkgd_color = '#' + searchParams.get('bkgd_color')
      }

      if (this.urldata.dimensions) {
        this.urldata.dimensions = this.urldata.dimensions.split(',')
      }

      if (this.urldata.extensions) {
        // For security reasons, disallow cross-domain or cross-folder
        //  extensions via URL
        this.urldata.extensions = (/[:/\\]/).test(this.urldata.extensions)
          ? ''
          : this.urldata.extensions.split(',')
      }

      // Disallowing extension paths via URL for
      // security reasons, even for same-domain
      // ones given potential to interact in undesirable
      // ways with other script resources
      ['userExtensions', 'imgPath']
        .forEach(function (pathConfig) {
          if (self.urldata[pathConfig]) {
            delete self.urldata[pathConfig]
          }
        })

      // Note: `source` and `url` (as with `storagePrompt` later) are not
      //  set on config but are used below
      this.setConfig(this.urldata, { overwrite: false })
      this.setupCurConfig()

      if (!this.curConfig.preventURLContentLoading) {
        let { source } = this.urldata
        if (!source) { // urldata.source may have been null if it ended with '='
          const src = searchParams.get('source')
          if (src?.startsWith('data:')) {
            source = src
          }
        }
        if (source) {
          if (source.startsWith('data:')) {
            this.editor.loadFromDataURI(source)
          } else {
            this.editor.loadFromString(source)
          }
          return
        }
        if (this.urldata.url) {
          this.editor.loadFromURL(this.urldata.url)
          return
        }
      }
      if (!this.urldata.noStorageOnLoad || this.curConfig.forceStorage) {
        this.loadContentAndPrefs()
      }
    } else {
      this.setupCurConfig()
      this.loadContentAndPrefs()
    }
  }

  /**
    * Where permitted, sets canvas and/or `configObj.defaultPrefs` based on previous
    *  storage. This will override URL settings (for security reasons) but
    *  not `svgedit-config-iife.js` configuration (unless initial user
    *  overriding is explicitly permitted there via `allowInitialUserOverride`).
    * @function module:SVGEditor.loadContentAndPrefs
    * @todo Split `allowInitialUserOverride` into `allowOverrideByURL` and
    *  `allowOverrideByUserStorage` so `svgedit-config-iife.js` can disallow some
    *  individual items for URL setting but allow for user storage AND/OR
    *  change URL setting so that it always uses a different namespace,
    *  so it won't affect pre-existing user storage (but then if users saves
    *  that, it will then be subject to tampering
    * @returns {void}
  */
  loadContentAndPrefs () {
    if (!this.curConfig.forceStorage &&
      (this.curConfig.noStorageOnLoad ||
          !(/(?:^|;\s*)svgeditstore=(?:prefsAndContent|prefsOnly)/).test(document.cookie)
      )
    ) {
      return
    }

    // LOAD PREFS
    Object.keys(this.defaultPrefs).forEach((key) => {
      const storeKey = 'svg-edit-' + key
      if (this.editor.storage) {
        const val = this.editor.storage.getItem(storeKey)
        if (val) {
          this.defaultPrefs[key] = String(val) // Convert to string for FF (.value fails in Webkit)
        }
      } else if (window.widget) {
        this.defaultPrefs[key] = window.widget.preferenceForKey(storeKey)
      } else {
        const result = document.cookie.match(
          new RegExp('(?:^|;\\s*)' + regexEscape(
            encodeURIComponent(storeKey)
          ) + '=([^;]+)')
        )
        this.defaultPrefs[key] = result ? decodeURIComponent(result[1]) : ''
      }
    })
  }

  /**
  * Allows setting of preferences or configuration (including extensions).
  * @function module:SVGEditor.setConfig
  * @param {module:SVGEditor.Config|module:SVGEditor.Prefs} opts The preferences or configuration (including extensions). See the tutorial on {@tutorial ConfigOptions} for info on config and preferences.
  * @param {PlainObject} [cfgCfg] Describes configuration which applies to the
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
  * @returns {void}
*/
  setConfig (opts, cfgCfg = {}) {
    /**
     *
     * @param {module:SVGEditor.Config|module:SVGEditor.Prefs} cfgObj
     * @param {string} key
     * @param {any} val See {@link module:SVGEditor.Config} or {@link module:SVGEditor.Prefs}
     * @returns {void}
     */
    const extendOrAdd = (cfgObj, key, val) => {
      if (cfgObj[key] && typeof cfgObj[key] === 'object' && !Array.isArray(cfgObj[key])) {
        cfgObj[key] = mergeDeep(cfgObj[key], val)
      } else {
        cfgObj[key] = val
      }
    }
    Object.entries(opts).forEach(([key, val]) => {
      // Only allow prefs defined in configObj.defaultPrefs or...
      if (this.defaultPrefs[key]) {
        if (cfgCfg.overwrite === false && (
          this.curConfig.preventAllURLConfig ||
          this.curPrefs[key])
        ) {
          return
        }
        if (cfgCfg.allowInitialUserOverride === true) {
          this.defaultPrefs[key] = val
        } else {
          this.pref(key, val)
        }
      } else if (['extensions', 'userExtensions', 'allowedOrigins'].includes(key)) {
        if (cfgCfg.overwrite === false &&
          (
            this.curConfig.preventAllURLConfig ||
            ['allowedOrigins'].includes(key) ||
            (key === 'extensions' && this.curConfig.lockExtensions)
          )
        ) {
          return
        }
        this.curConfig[key] = this.curConfig[key].concat(val) // We will handle any dupes later
      // Only allow other configObj.curConfig if defined in configObj.defaultConfig
      } else if ({}.hasOwnProperty.call(this.defaultConfig, key)) {
        if (cfgCfg.overwrite === false && (
          this.curConfig.preventAllURLConfig ||
          {}.hasOwnProperty.call(this.curConfig, key)
        )) {
          return
        }
        // Potentially overwriting of previously set config
        if ({}.hasOwnProperty.call(this.curConfig, key)) {
          if (cfgCfg.overwrite === false) {
            return
          }
          extendOrAdd(this.curConfig, key, val)
        } else if (cfgCfg.allowInitialUserOverride === true) {
          extendOrAdd(this.defaultConfig, key, val)
        } else if (this.defaultConfig[key] && typeof this.defaultConfig[key] === 'object' && !Array.isArray(this.defaultConfig[key])) {
          this.curConfig[key] = {}
          this.curConfig[key] = mergeDeep(this.curConfig[key], val)
        } else {
          this.curConfig[key] = val
        }
      }
    })
  }

  /**
  * Store and retrieve preferences.
  * @function pref
  * @param {string} key The preference name to be retrieved or set
  * @param {string} [val] The value. If the value supplied is missing or falsey, no change to the preference will
  * be made unless `mayBeEmpty` is set.
  * @param {boolean} [mayBeEmpty] If value may be falsey.
  * @returns {string|void} If val is missing or falsey and `mayBeEmpty` is not set, the
  * value of the previously stored preference will be returned.
  * @todo Review whether any remaining existing direct references to
  *  getting `curPrefs` can be changed to use `svgEditor.configObj.pref()` getting to ensure
  *  `defaultPrefs` fallback (also for sake of `allowInitialUserOverride`);
  *  specifically, `bkgd_color` could be changed so that the pref dialog has a
  *  button to auto-calculate background, but otherwise uses `svgEditor.configObj.pref()` to
  *  be able to get default prefs or overridable settings
  */
  pref (key, val, mayBeEmpty) {
    if (mayBeEmpty || val) {
      this.curPrefs[key] = val
      return undefined
    }
    return (key in this.curPrefs) ? this.curPrefs[key] : this.defaultPrefs[key]
  }

  /**
   * @function load load Config
   * @returns {void}
   */
  load () {
    this.loadFromURL(this.editor)
    this.setupCurPrefs(this.editor)
  }
}
