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

const loadExtensionTranslation = async function (lang) {
  let translationModule;
  try {
    translationModule = await import(`./locale/${encodeURIComponent(lang)}.js`);
  } catch (_error) {
    // eslint-disable-next-line no-console
    console.error(`Missing translation (${lang}) - using 'en'`);
    translationModule = await import(`./locale/en.js`);
  }
  return translationModule.default;
};

export default {
  name: 'storage',
  init ({$}) {
    const svgEditor = this;
    const {svgCanvas} = svgEditor;

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
      forceStorage
    } = svgEditor.curConfig;
    const {storage} = svgEditor;

    /**
     * Sets SVG content as a string with "svgedit-" and the current
     *   canvas name as namespace.
     * @param {string} val
     * @returns {void}
     */
    function setSVGContentStorage (val) {
      if (storage) {
        const name = 'svgedit-' + svgEditor.configObj.curConfig.canvasName;
        if (!val) {
          storage.removeItem(name);
        } else {
          storage.setItem(name, val);
        }
      }
    }

    /**
    * Listen for unloading: If and only if opted in by the user, set the content
    *   document and preferences into storage:
    * 1. Prevent save warnings (since we're automatically saving unsaved
    *       content into storage)
    * 2. Use localStorage to set SVG contents (potentially too large to allow in cookies)
    * 3. Use localStorage (where available) or cookies to set preferences.
    * @returns {void}
    */
    function setupBeforeUnloadListener () {
      window.addEventListener('beforeunload', function (e) {
        // Don't save anything unless the user opted in to storage
        if (!document.cookie.match(/(?:^|;\s*)svgeditstore=(?:prefsAndContent|prefsOnly)/)) {
          return;
        }
        if (document.cookie.match(/(?:^|;\s*)svgeditstore=prefsAndContent/)) {
          setSVGContentStorage(svgCanvas.getSvgString());
        }

        svgEditor.setConfig({no_save_warning: true}); // No need for explicit saving at all once storage is on
        // svgEditor.showSaveWarning = false;

        const {curPrefs} = svgEditor;

        Object.entries(curPrefs).forEach(([key, val]) => {
          const store = (val !== undefined);
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
    }

    let loaded = false;
    return {
      name: 'storage',
      async langReady ({lang}) {
        const storagePrompt = new URL(top.location).searchParams.get('storagePrompt');
        // eslint-disable-next-line no-unused-vars
        const strings = await loadExtensionTranslation(svgEditor.pref('lang'));
        /*
        const {
          message, storagePrefsAndContent, storagePrefsOnly,
          storagePrefs, storageNoPrefsOrContent, storageNoPrefs,
          rememberLabel, rememberTooltip
        } = strings;
        */

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
          (
            // ...or...if the URL at least doesn't explicitly prevent a
            //  storage prompt (as we use for users who
            // don't want to set cookies at all but who don't want
            // continual prompts about it)...
            storagePrompt !== 'false' &&
            // ...and this user hasn't previously indicated a desire for storage
            !document.cookie.match(/(?:^|;\s*)svgeditstore=(?:prefsAndContent|prefsOnly)/)
          )
          // ...then show the storage prompt.
        )) {
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
