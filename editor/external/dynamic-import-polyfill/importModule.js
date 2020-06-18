/* eslint-disable jsdoc/require-file-overview */
/**
 * Adapted from {@link https://github.com/uupaa/dynamic-import-polyfill/blob/master/importModule.js}.
 * @module importModule
 * @license MIT
 */

/**
 * Converts a possible relative URL into an absolute one.
 * @param {string} url
 * @returns {string}
 */
function toAbsoluteURL (url) {
  const a = document.createElement('a');
  a.setAttribute('href', url); // <a href="hoge.html">
  return a.cloneNode(false).href; // -> "http://example.com/hoge.html"
}

/**
 * Add any of the whitelisted attributes to the script tag.
 * @param {HTMLScriptElement} script
 * @param {PlainObject<string, string>} atts
 * @returns {void}
 */
function addScriptAtts (script, atts) {
  ['id', 'class', 'type'].forEach((prop) => {
    if (prop in atts) {
      script[prop] = atts[prop];
    }
  });
}

// Additions by Brett
/**
* @typedef {PlainObject} module:importModule.ImportConfig
* @property {string} global The variable name to set on `window` (when not using the modular version)
* @property {boolean} [returnDefault=false]
*/

/**
* @function module:importModule.importSetGlobalDefault
* @param {string|GenericArray<any>} url
* @param {module:importModule.ImportConfig} config
* @returns {Promise<any>} The value to which it resolves depends on the export of the targeted module.
*/
export function importSetGlobalDefault (url, config) {
  return importSetGlobal(url, {...config, returnDefault: true});
}
/**
* @function module:importModule.importSetGlobal
* @param {string|string[]} url
* @param {module:importModule.ImportConfig} config
* @returns {Promise<ArbitraryModule>} The promise resolves to either an `ArbitraryModule` or
*   any other value depends on the export of the targeted module.
*/
export async function importSetGlobal (url, {global: glob, returnDefault}) {
  // Todo: Replace calls to this function with `import()` when supported
  const modularVersion = !('svgEditor' in window) ||
    !window.svgEditor ||
    window.svgEditor.modules !== false;
  if (modularVersion) {
    return importModule(url, undefined, {returnDefault});
  }
  await importScript(url);
  return window[glob];
}

/**
 *
 * @author Brett Zamir (other items are from `dynamic-import-polyfill`)
 * @param {string|string[]} url
 * @param {PlainObject} [atts={}]
 * @returns {Promise<void|Error>} Resolves to `undefined` or rejects with an `Error` upon a
 *   script loading error
 */
export function importScript (url, atts = {}) {
  if (Array.isArray(url)) {
    return Promise.all(url.map((u) => {
      return importScript(u, atts);
    }));
  }
  return new Promise((resolve, reject) => { // eslint-disable-line promise/avoid-new
    const script = document.createElement('script');
    /**
     *
     * @returns {void}
     */
    function scriptOnError () {
      reject(new Error(`Failed to import: ${url}`));
      destructor();
    }
    /**
     *
     * @returns {void}
     */
    function scriptOnLoad () {
      resolve();
      destructor();
    }
    const destructor = () => {
      script.removeEventListener('error', scriptOnError);
      script.removeEventListener('load', scriptOnLoad);
      script.remove();
      script.src = '';
    };
    script.defer = 'defer';
    addScriptAtts(script, atts);
    script.addEventListener('error', scriptOnError);
    script.addEventListener('load', scriptOnLoad);
    script.src = url;

    document.head.append(script);
  });
}

/**
*
* @param {string|string[]} url
* @param {PlainObject} [atts={}]
* @param {PlainObject} opts
* @param {boolean} [opts.returnDefault=false} = {}]
* @returns {Promise<any>} Resolves to value of loading module or rejects with
*   `Error` upon a script loading error.
*/
export function importModule (url, atts = {}, {returnDefault = false} = {}) {
  if (Array.isArray(url)) {
    return Promise.all(url.map((u) => {
      return importModule(u, atts);
    }));
  }
  return new Promise((resolve, reject) => { // eslint-disable-line promise/avoid-new
    const vector = '$importModule$' + Math.random().toString(32).slice(2);
    const script = document.createElement('script');
    /**
     *
     * @returns {void}
     */
    function scriptOnError () {
      reject(new Error(`Failed to import: ${url}`));
      destructor();
    }
    /**
     *
     * @returns {void}
     */
    function scriptOnLoad () {
      resolve(window[vector]);
      destructor();
    }
    const destructor = () => {
      delete window[vector];
      script.removeEventListener('error', scriptOnError);
      script.removeEventListener('load', scriptOnLoad);
      script.remove();
      URL.revokeObjectURL(script.src);
      script.src = '';
    };
    addScriptAtts(script, atts);
    script.defer = 'defer';
    script.type = 'module';
    script.addEventListener('error', scriptOnError);
    script.addEventListener('load', scriptOnLoad);
    const absURL = toAbsoluteURL(url);
    const loader = `import * as m from '${absURL.replace(/'/g, "\\'")}'; window.${vector} = ${returnDefault ? 'm.default || ' : ''}m;`; // export Module
    const blob = new Blob([loader], {type: 'text/javascript'});
    script.src = URL.createObjectURL(blob);

    document.head.append(script);
  });
}

export default importModule;
