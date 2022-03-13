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
import './storageDialog.js'

/**
 * Expire the storage cookie.
 * @returns {void}
 */
const removeStoragePrefCookie = () => {
  expireCookie('svgeditstore')
}
/**
 * Set the cookie to expire.
 * @param {string} cookie
 * @returns {void}
 */
const expireCookie = cookie => {
  document.cookie =
    encodeURIComponent(cookie) + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT'
}

/**
 * Replace `storagePrompt` parameter within URL.
 * @param {string} val
 * @returns {void}
 * @todo Replace the string manipulation with `searchParams.set`
 */
const replaceStoragePrompt = val => {
  val = val ? 'storagePrompt=' + val : ''
  const loc = top.location // Allow this to work with the embedded editor as well
  if (loc.href.includes('storagePrompt=')) {
    loc.href = loc.href.replace(/([&?])storagePrompt=[^&]*(&?)/, function (
      n0,
      n1,
      amp
    ) {
      return (val ? n1 : '') + val + (!val && amp ? n1 : amp || '')
    })
  } else {
    loc.href += (loc.href.includes('?') ? '&' : '?') + val
  }
}

export default {
  name: 'storage',
  init () {
    const svgEditor = this
    const { svgCanvas, storage } = svgEditor

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
    } = svgEditor.configObj.curConfig

    // LOAD STORAGE CONTENT IF ANY
    if (
      storage && // Cookies do not have enough available memory to hold large documents
      (forceStorage ||
        (!noStorageOnLoad &&
          /(?:^|;\s*)svgeditstore=prefsAndContent/.test(document.cookie)))
    ) {
      const key = 'svgedit-' + canvasName
      const cached = storage.getItem(key)
      if (cached) {
        svgEditor.loadFromString(cached)
        const name = storage.getItem(`title-${key}`) ?? 'untitled.svg'
        svgEditor.topPanel.updateTitle(name)
        svgEditor.layersPanel.populateLayers()
      }
    }

    // storageDialog added to DOM
    const storageBox = document.createElement('se-storage-dialog')
    storageBox.setAttribute('id', 'se-storage-dialog')
    svgEditor.$container.append(storageBox)
    storageBox.init(svgEditor.i18next)

    // manage the change in the storageDialog

    storageBox.addEventListener('change', e => {
      storageBox.setAttribute('dialog', 'close')
      if (e?.detail?.trigger === 'ok') {
        if (e?.detail?.select !== 'noPrefsOrContent') {
          const storagePrompt = new URL(top.location).searchParams.get(
            'storagePrompt'
          )
          document.cookie =
            'svgeditstore=' +
            encodeURIComponent(e.detail.select) +
            '; expires=Fri, 31 Dec 9999 23:59:59 GMT'
          if (storagePrompt === 'true' && e?.detail?.checkbox) {
            replaceStoragePrompt()
            return
          }
        } else {
          removeStoragePrefCookie()
          if (
            svgEditor.configObj.curConfig.emptyStorageOnDecline &&
            e?.detail?.checkbox
          ) {
            setSvgContentStorage('')
            Object.keys(svgEditor.curPrefs).forEach(name => {
              name = 'svg-edit-' + name
              if (svgEditor.storage) {
                svgEditor.storage.removeItem(name)
              }
              expireCookie(name)
            })
          }
          if (e?.detail?.select && e?.detail?.checkbox) {
            replaceStoragePrompt('false')
            return
          }
        }
      } else if (e?.detail?.trigger === 'cancel') {
        removeStoragePrefCookie()
      }
      setupBeforeUnloadListener()
      svgEditor.storagePromptState = 'closed'
      svgEditor.updateCanvas(true)
    })

    /**
     * Sets SVG content as a string with "svgedit-" and the current
     *   canvas name as namespace.
     * @param {string} svgString
     * @returns {void}
     */
    const setSvgContentStorage = svgString => {
      const name = `svgedit-${svgEditor.configObj.curConfig.canvasName}`
      if (!svgString) {
        storage.removeItem(name)
        storage.removeItem(`${name}-title`)
      } else {
        storage.setItem(name, svgString)
        storage.setItem(`title-${name}`, svgEditor.title)
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
    const setupBeforeUnloadListener = () => {
      window.addEventListener('beforeunload', function () {
        // Don't save anything unless the user opted in to storage
        if (
          !/(?:^|;\s*)svgeditstore=(?:prefsAndContent|prefsOnly)/.test(
            document.cookie
          )
        ) {
          return
        }
        if (/(?:^|;\s*)svgeditstore=prefsAndContent/.test(document.cookie)) {
          setSvgContentStorage(svgCanvas.getSvgString())
        }

        svgEditor.setConfig({ no_save_warning: true }) // No need for explicit saving at all once storage is on

        const { curPrefs } = svgEditor.configObj

        Object.entries(curPrefs).forEach(([key, val]) => {
          const store = val !== undefined
          key = 'svg-edit-' + key
          if (!store) {
            return
          }
          if (storage) {
            storage.setItem(key, val)
          } else if (window.widget) {
            window.widget.setPreferenceForKey(val, key)
          } else {
            val = encodeURIComponent(val)
            document.cookie =
              encodeURIComponent(key) +
              '=' +
              val +
              '; expires=Fri, 31 Dec 9999 23:59:59 GMT'
          }
        })
      })
    }

    let loaded = false
    return {
      name: 'storage',
      callback () {
        const storagePrompt = new URL(top.location).searchParams.get(
          'storagePrompt'
        )
        // No need to run this one-time dialog again just because the user
        //   changes the language
        if (loaded) {
          return
        }
        loaded = true

        // Note that the following can load even if "noStorageOnLoad" is
        //   set to false; to avoid any chance of storage, avoid this
        //   extension! (and to avoid using any prior storage, set the
        //   config option "noStorageOnLoad" to true).
        if (
          !forceStorage &&
          // If the URL has been explicitly set to always prompt the
          //  user (e.g., so one can be pointed to a URL where one
          // can alter one's settings, say to prevent future storage)...
          (storagePrompt === 'true' ||
            // ...or...if the URL at least doesn't explicitly prevent a
            //  storage prompt (as we use for users who
            // don't want to set cookies at all but who don't want
            // continual prompts about it)...
            (storagePrompt !== 'false' &&
              // ...and this user hasn't previously indicated a desire for storage
              !/(?:^|;\s*)svgeditstore=(?:prefsAndContent|prefsOnly)/.test(
                document.cookie
              )))
          // ...then show the storage prompt.
        ) {
          const options = Boolean(storage)
          // Open select-with-checkbox dialog
          // From svg-editor.js
          svgEditor.storagePromptState = 'waiting'
          const $storageDialog = document.getElementById('se-storage-dialog')
          $storageDialog.setAttribute('dialog', 'open')
          $storageDialog.setAttribute('storage', options)
        } else if (!noStorageOnLoad || forceStorage) {
          setupBeforeUnloadListener()
        }
      }
    }
  }
}
