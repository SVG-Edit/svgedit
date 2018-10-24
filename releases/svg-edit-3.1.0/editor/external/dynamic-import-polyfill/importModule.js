// MIT License
// From: https://github.com/uupaa/dynamic-import-polyfill/blob/master/importModule.js

/**
 * @module importModule
 */

function toAbsoluteURL (url) {
  const a = document.createElement('a');
  a.setAttribute('href', url); // <a href="hoge.html">
  return a.cloneNode(false).href; // -> "http://example.com/hoge.html"
}

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
* @param {string} url
* @param {module:importModule.ImportConfig} config
* @returns {*} The return depends on the export of the targeted module.
*/
export async function importSetGlobalDefault (url, config) {
  return importSetGlobal(url, {...config, returnDefault: true});
}
/**
* @function module:importModule.importSetGlobal
* @param {string} url
* @param {module:importModule.ImportConfig} config
* @returns {ArbitraryModule|*} The return depends on the export of the targeted module.
*/
export async function importSetGlobal (url, {global, returnDefault}) {
  // Todo: Replace calls to this function with `import()` when supported
  const modularVersion = !('svgEditor' in window) ||
    !window.svgEditor ||
    window.svgEditor.modules !== false;
  if (modularVersion) {
    return importModule(url, undefined, {returnDefault});
  }
  await importScript(url);
  return window[global];
}
// Addition by Brett
export function importScript (url, atts = {}) {
  if (Array.isArray(url)) {
    return Promise.all(url.map((u) => {
      return importScript(u, atts);
    }));
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const destructor = () => {
      script.onerror = null;
      script.onload = null;
      script.remove();
      script.src = '';
    };
    script.defer = 'defer';
    addScriptAtts(script, atts);
    script.onerror = () => {
      reject(new Error(`Failed to import: ${url}`));
      destructor();
    };
    script.onload = () => {
      resolve();
      destructor();
    };
    script.src = url;

    document.head.append(script);
  });
}

export function importModule (url, atts = {}, {returnDefault = false} = {}) {
  if (Array.isArray(url)) {
    return Promise.all(url.map((u) => {
      return importModule(u, atts);
    }));
  }
  return new Promise((resolve, reject) => {
    const vector = '$importModule$' + Math.random().toString(32).slice(2);
    const script = document.createElement('script');
    const destructor = () => {
      delete window[vector];
      script.onerror = null;
      script.onload = null;
      script.remove();
      URL.revokeObjectURL(script.src);
      script.src = '';
    };
    addScriptAtts(script, atts);
    script.defer = 'defer';
    script.type = 'module';
    script.onerror = () => {
      reject(new Error(`Failed to import: ${url}`));
      destructor();
    };
    script.onload = () => {
      resolve(window[vector]);
      destructor();
    };
    const absURL = toAbsoluteURL(url);
    const loader = `import * as m from '${absURL.replace(/'/g, "\\'")}'; window.${vector} = ${returnDefault ? 'm.default || ' : ''}m;`; // export Module
    const blob = new Blob([loader], {type: 'text/javascript'});
    script.src = URL.createObjectURL(blob);

    document.head.append(script);
  });
}

export default importModule;
