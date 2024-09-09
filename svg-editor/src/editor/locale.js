/**
 * Localizing script for SVG-edit UI.
 * @module locale
 * @license MIT
 *
 * @copyright 2010 Narendra Sisodya
 * @copyright 2010 Alexis Deveria
 *
 */

import i18next from 'i18next'

/**
 * The string keys of the object are two-letter language codes.
 * @tutorial LocaleDocs
 * @typedef {PlainObject<string, string|module:locale.LocaleStrings|module:locale.LocaleArray>} module:locale.LocaleStrings
 */
// keyed to an array of objects with "id" and "title" or "textContent" properties
/**
 * @typedef {PlainObject<string, string>} module:locale.LocaleSelectorValue
 */

let langParam

/**
* The "data" property is generally set to an an array of objects with
*   "id" and "title" or "textContent" properties.
* @typedef {PlainObject} module:locale.AddLangExtensionLocaleData
* @property {module:locale.LocaleStrings[]} data See {@tutorial LocaleDocs}
*/

/**
* @interface module:locale.LocaleEditorInit
*/
/**
 * @function module:locale.LocaleEditorInit#addLangData
 * @param {string} langParam
 * @returns {module:locale.AddLangExtensionLocaleData}
*/
/**
* @typedef {PlainObject} module:locale.LangAndData
* @property {string} langParam
* @property {module:locale.LocaleStrings} langData
*/

/**
 *
 * @function module:locale.putLocale
 * @param {string} givenParam
 * @param {string[]} goodLangs
 * @fires module:svgcanvas.SvgCanvas#event:ext_addLangData
 * @fires module:svgcanvas.SvgCanvas#event:ext_langReady
 * @fires module:svgcanvas.SvgCanvas#event:ext_langChanged
 * @returns {Promise<module:locale.LangAndData>} Resolves to result of {@link module:locale.readLang}
*/

export const putLocale = async function (givenParam, goodLangs) {
  if (givenParam) {
    langParam = givenParam
  } else if (navigator.userLanguage) { // Explorer
    langParam = navigator.userLanguage
  } else if (navigator.language) { // FF, Opera, ...
    langParam = navigator.language
  }

  // Set to English if language is not in list of good langs
  if (!goodLangs.includes(langParam) && langParam !== 'test') {
    langParam = 'en'
  }
  const module = await import(`./locale/lang.${encodeURIComponent(langParam)}.js`)
  i18next.init({
    lng: langParam,
    debug: false,
    resources: {
      [langParam]: {
        translation: module.default
      }
    }
  })
  return { langParam, i18next }
}

export const t = function (key) {
  return i18next.t(key)
}
