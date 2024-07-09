var storageDialogHTML = "<style>\n    #dialog_content {\n        margin: 10px 10px 5px 10px;\n        background: #DDD;\n        overflow: auto;\n        text-align: left;\n        border: 1px solid #5a6162;\n    }\n\n    #dialog_content p,\n    #dialog_content select,\n    #dialog_content label {\n        margin: 10px;\n        line-height: 1.3em;\n    }\n\n    #dialog_container {\n        font-family: Verdana;\n        text-align: center;\n        left: 50%;\n        top: 50%;\n        max-width: 440px;\n        z-index: 50001;\n        background: #5a6162;\n        border: 1px outset #777;\n        font-family: Verdana, Helvetica, sans-serif;\n        font-size: 0.8em;\n    }\n\n    #dialog_container,\n    #dialog_content {\n        border-radius: 5px;\n        -moz-border-radius: 5px;\n        -webkit-border-radius: 5px;\n    }\n\n    #dialog_buttons input[type=text] {\n        width: 90%;\n        display: block;\n        margin: 0 0 5px 11px;\n    }\n\n    #dialog_buttons input[type=button] {\n        margin: 0 1em;\n    }\n</style>\n<elix-dialog id=\"dialog_box\" aria-label=\"SVG-Edit storage preferences\" closed>\n    <div class=\"overlay\"></div>\n    <div id=\"dialog_container\">\n        <div id=\"dialog_content\">\n            <p id=\"notificationNote\"> </p>\n            <select id=\"se-storage-pref\">\n                <option value=\"prefsAndContent\" id=\"prefsAndContent\"></option>\n                <option value=\"prefsOnly\" id=\"prefsOnly\"></option>\n                <option value=\"noPrefsOrContent\" id=\"noPrefsOrContent\"></option>\n            </select>\n            <label title=\"\" id=\"se-remember-title\">\n                <input type=\"checkbox\" id=\"se-remember\" value=\"\" checked=\"checked\">\n            </label>\n        </div>\n        <div id=\"dialog_buttons\">\n            <button id=\"storage_ok\"></button>\n            <button id=\"storage_cancel\"></button>\n        </div>\n    </div>\n</elix-dialog>";

/* globals svgEditor */
const template = document.createElement('template');
template.innerHTML = storageDialogHTML;
/**
 * @class SeStorageDialog
 */
class SeStorageDialog extends HTMLElement {
  /**
    * @function constructor
    */
  constructor() {
    super();
    // create the shadowDom and insert the template
    this._shadowRoot = this.attachShadow({
      mode: 'open'
    });
    this._shadowRoot.append(template.content.cloneNode(true));
    this.$dialog = this._shadowRoot.querySelector('#dialog_box');
    this.$storage = this._shadowRoot.querySelector('#js-storage');
    this.$okBtn = this._shadowRoot.querySelector('#storage_ok');
    this.$cancelBtn = this._shadowRoot.querySelector('#storage_cancel');
    this.$storageInput = this._shadowRoot.querySelector('#se-storage-pref');
    this.$rememberInput = this._shadowRoot.querySelector('#se-remember');
  }

  /**
   * @function init
   * @param {any} name
   * @returns {void}
   */
  init(i18next) {
    this.setAttribute('common-ok', i18next.t('common.ok'));
    this.setAttribute('common-cancel', i18next.t('common.cancel'));
    this.setAttribute('notify-editor_pref_msg', i18next.t('notification.editorPreferencesMsg'));
    this.setAttribute('properties-prefs_and_content', i18next.t('properties.prefs_and_content'));
    this.setAttribute('properties-prefs_only', i18next.t('properties.prefs_only'));
    this.setAttribute('properties-no_prefs_or_content', i18next.t('properties.no_prefs_or_content'));
    this.setAttribute('tools-remember_this_choice', i18next.t('tools.remember_this_choice'));
    this.setAttribute('tools-remember_this_choice_title', i18next.t('tools.remember_this_choice_title'));
  }

  /**
   * @function observedAttributes
   * @returns {any} observed
   */
  static get observedAttributes() {
    return ['dialog', 'storage', 'common-ok', 'common-cancel', 'notify-editor_pref_msg', 'properties-prefs_and_content', 'tools-remember_this_choice', 'tools-remember_this_choice_title', 'properties-prefs_only', 'properties-no_prefs_or_content'];
  }

  /**
   * @function attributeChangedCallback
   * @param {string} name
   * @param {string} oldValue
   * @param {string} newValue
   * @returns {void}
   */
  attributeChangedCallback(name, oldValue, newValue) {
    let node;
    switch (name) {
      case 'dialog':
        if (newValue === 'open') {
          this.$dialog.open();
        } else {
          this.$dialog.close();
        }
        break;
      case 'storage':
        if (newValue === 'true') {
          this.$storageInput.options[0].disabled = false;
        } else {
          this.$storageInput.options[0].disabled = true;
        }
        break;
      case 'common-ok':
        this.$okBtn.textContent = newValue;
        break;
      case 'common-cancel':
        this.$cancelBtn.textContent = newValue;
        break;
      case 'notify-editor_pref_msg':
        node = this._shadowRoot.querySelector('#notificationNote');
        node.textContent = newValue;
        break;
      case 'properties-prefs_and_content':
        node = this._shadowRoot.querySelector('#prefsAndContent');
        node.textContent = newValue;
        break;
      case 'properties-prefs_only':
        node = this._shadowRoot.querySelector('#prefsOnly');
        node.textContent = newValue;
        break;
      case 'properties-no_prefs_or_content':
        node = this._shadowRoot.querySelector('#noPrefsOrContent');
        node.textContent = newValue;
        break;
      case 'tools-remember_this_choice':
        node = this._shadowRoot.querySelector('#se-remember-title');
        node.prepend(newValue);
        break;
      case 'tools-remember_this_choice_title':
        node = this._shadowRoot.querySelector('#se-remember-title');
        node.setAttribute('title', newValue);
        break;
    }
  }

  /**
   * @function get
   * @returns {any}
   */
  get dialog() {
    return this.getAttribute('dialog');
  }

  /**
   * @function set
   * @returns {void}
   */
  set dialog(value) {
    this.setAttribute('dialog', value);
  }

  /**
   * @function connectedCallback
   * @returns {void}
   */
  connectedCallback() {
    const onSubmitHandler = (e, action) => {
      const triggerEvent = new CustomEvent('change', {
        detail: {
          trigger: action,
          select: this.$storageInput.value,
          checkbox: this.$rememberInput.checked
        }
      });
      this.dispatchEvent(triggerEvent);
    };
    svgEditor.$click(this.$okBtn, evt => onSubmitHandler(evt, 'ok'));
    svgEditor.$click(this.$cancelBtn, evt => onSubmitHandler(evt, 'cancel'));
  }
}

// Register
customElements.define('se-storage-dialog', SeStorageDialog);

/**
 * @file ext-storage.js
 *
 * This extension allows automatic saving of the SVG canvas contents upon
 *  page unload (which can later be automatically retrieved upon future
 *  editor loads).
 *
 *  The functionality was originally part of the SVG Editor, but moved to a
 *  separate extension to make the setting behavior optional, and adapted
 *  to inform the user of its setting of local data.
 *
 * @license MIT
 *
 * @copyright 2010 Brett Zamir
 * @todo Revisit on whether to use `svgEditor.pref` over directly setting
 * `curConfig` in all extensions for a more public API (not only for `extPath`
 * and `imagePath`, but other currently used config in the extensions)
 * @todo We might provide control of storage settings through the UI besides the
 *   initial (or URL-forced) dialog. *
 */

/**
 * Expire the storage cookie.
 * @returns {void}
 */
const removeStoragePrefCookie = () => {
  expireCookie('svgeditstore');
};
/**
 * Set the cookie to expire.
 * @param {string} cookie
 * @returns {void}
 */
const expireCookie = cookie => {
  document.cookie = encodeURIComponent(cookie) + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
};

/**
 * Replace `storagePrompt` parameter within URL.
 * @param {string} val
 * @returns {void}
 * @todo Replace the string manipulation with `searchParams.set`
 */
const replaceStoragePrompt = val => {
  val = val ? 'storagePrompt=' + val : '';
  const loc = top.location; // Allow this to work with the embedded editor as well
  if (loc.href.includes('storagePrompt=')) {
    loc.href = loc.href.replace(/([&?])storagePrompt=[^&]*(&?)/, function (n0, n1, amp) {
      return (val ? n1 : '') + val + (!val && amp ? n1 : amp || '');
    });
  } else {
    loc.href += (loc.href.includes('?') ? '&' : '?') + val;
  }
};
var extStorage = {
  name: 'storage',
  init() {
    const svgEditor = this;
    const {
      svgCanvas,
      storage
    } = svgEditor;

    // We could empty any already-set data for users when they decline storage,
    //  but it would be a risk for users who wanted to store but accidentally
    // said "no"; instead, we'll let those who already set it, delete it themselves;
    // to change, set the "emptyStorageOnDecline" config setting to true
    // in svgedit-config-iife.js/svgedit-config-es.js.
    const {
      // When the code in svg-editor.js prevents local storage on load per
      //  user request, we also prevent storing on unload here so as to
      //  avoid third-party sites making XSRF requests or providing links
      // which would cause the user's local storage not to load and then
      // upon page unload (such as the user closing the window), the storage
      //  would thereby be set with an empty value, erasing any of the
      // user's prior work. To change this behavior so that no use of storage
      // or adding of new storage takes place regardless of settings, set
      // the "noStorageOnLoad" config setting to true in svgedit-config-*.js.
      noStorageOnLoad,
      forceStorage,
      canvasName
    } = svgEditor.configObj.curConfig;

    // LOAD STORAGE CONTENT IF ANY
    if (storage && (
    // Cookies do not have enough available memory to hold large documents
    forceStorage || !noStorageOnLoad && /(?:^|;\s*)svgeditstore=prefsAndContent/.test(document.cookie))) {
      const key = 'svgedit-' + canvasName;
      const cached = storage.getItem(key);
      if (cached) {
        svgEditor.loadFromString(cached);
        const name = storage.getItem(`title-${key}`) ?? 'untitled.svg';
        svgEditor.topPanel.updateTitle(name);
        svgEditor.layersPanel.populateLayers();
      }
    }

    // storageDialog added to DOM
    const storageBox = document.createElement('se-storage-dialog');
    storageBox.setAttribute('id', 'se-storage-dialog');
    svgEditor.$container.append(storageBox);
    storageBox.init(svgEditor.i18next);

    // manage the change in the storageDialog

    storageBox.addEventListener('change', e => {
      storageBox.setAttribute('dialog', 'close');
      if (e?.detail?.trigger === 'ok') {
        if (e?.detail?.select !== 'noPrefsOrContent') {
          const storagePrompt = new URL(top.location).searchParams.get('storagePrompt');
          document.cookie = 'svgeditstore=' + encodeURIComponent(e.detail.select) + '; expires=Fri, 31 Dec 9999 23:59:59 GMT';
          if (storagePrompt === 'true' && e?.detail?.checkbox) {
            replaceStoragePrompt();
            return;
          }
        } else {
          removeStoragePrefCookie();
          if (svgEditor.configObj.curConfig.emptyStorageOnDecline && e?.detail?.checkbox) {
            setSvgContentStorage('');
            Object.keys(svgEditor.curPrefs).forEach(name => {
              name = 'svg-edit-' + name;
              if (svgEditor.storage) {
                svgEditor.storage.removeItem(name);
              }
              expireCookie(name);
            });
          }
          if (e?.detail?.select && e?.detail?.checkbox) {
            replaceStoragePrompt('false');
            return;
          }
        }
      } else if (e?.detail?.trigger === 'cancel') {
        removeStoragePrefCookie();
      }
      setupBeforeUnloadListener();
      svgEditor.storagePromptState = 'closed';
      svgEditor.updateCanvas(true);
    });

    /**
     * Sets SVG content as a string with "svgedit-" and the current
     *   canvas name as namespace.
     * @param {string} svgString
     * @returns {void}
     */
    const setSvgContentStorage = svgString => {
      const name = `svgedit-${svgEditor.configObj.curConfig.canvasName}`;
      if (!svgString) {
        storage.removeItem(name);
        storage.removeItem(`${name}-title`);
      } else {
        storage.setItem(name, svgString);
        storage.setItem(`title-${name}`, svgEditor.title);
      }
    };

    /**
     * Listen for unloading: If and only if opted in by the user, set the content
     *   document and preferences into storage:
     * 1. Prevent save warnings (since we're automatically saving unsaved
     *       content into storage)
     * 2. Use localStorage to set SVG contents (potentially too large to allow in cookies)
     * 3. Use localStorage (where available) or cookies to set preferences.
     * @returns {void}
     */
    const setupBeforeUnloadListener = () => {
      window.addEventListener('beforeunload', function () {
        // Don't save anything unless the user opted in to storage
        if (!/(?:^|;\s*)svgeditstore=(?:prefsAndContent|prefsOnly)/.test(document.cookie)) {
          return;
        }
        if (/(?:^|;\s*)svgeditstore=prefsAndContent/.test(document.cookie)) {
          setSvgContentStorage(svgCanvas.getSvgString());
        }
        svgEditor.setConfig({
          no_save_warning: true
        }); // No need for explicit saving at all once storage is on

        const {
          curPrefs
        } = svgEditor.configObj;
        Object.entries(curPrefs).forEach(_ref => {
          let [key, val] = _ref;
          const store = val !== undefined;
          key = 'svg-edit-' + key;
          if (!store) {
            return;
          }
          if (storage) {
            storage.setItem(key, val);
          } else if (window.widget) {
            window.widget.setPreferenceForKey(val, key);
          } else {
            val = encodeURIComponent(val);
            document.cookie = encodeURIComponent(key) + '=' + val + '; expires=Fri, 31 Dec 9999 23:59:59 GMT';
          }
        });
      });
    };
    let loaded = false;
    return {
      name: 'storage',
      callback() {
        const storagePrompt = new URL(top.location).searchParams.get('storagePrompt');
        // No need to run this one-time dialog again just because the user
        //   changes the language
        if (loaded) {
          return;
        }
        loaded = true;

        // Note that the following can load even if "noStorageOnLoad" is
        //   set to false; to avoid any chance of storage, avoid this
        //   extension! (and to avoid using any prior storage, set the
        //   config option "noStorageOnLoad" to true).
        if (!forceStorage && (
        // If the URL has been explicitly set to always prompt the
        //  user (e.g., so one can be pointed to a URL where one
        // can alter one's settings, say to prevent future storage)...
        storagePrompt === 'true' ||
        // ...or...if the URL at least doesn't explicitly prevent a
        //  storage prompt (as we use for users who
        // don't want to set cookies at all but who don't want
        // continual prompts about it)...
        storagePrompt !== 'false' &&
        // ...and this user hasn't previously indicated a desire for storage
        !/(?:^|;\s*)svgeditstore=(?:prefsAndContent|prefsOnly)/.test(document.cookie))
        // ...then show the storage prompt.
        ) {
          const options = Boolean(storage);
          // Open select-with-checkbox dialog
          // From svg-editor.js
          svgEditor.storagePromptState = 'waiting';
          const $storageDialog = document.getElementById('se-storage-dialog');
          $storageDialog.setAttribute('dialog', 'open');
          $storageDialog.setAttribute('storage', options);
        } else if (!noStorageOnLoad || forceStorage) {
          setupBeforeUnloadListener();
        }
      }
    };
  }
};

export { extStorage as default };
//# sourceMappingURL=ext-storage.js.map
