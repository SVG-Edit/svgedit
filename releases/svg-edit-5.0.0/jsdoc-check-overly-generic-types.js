/* eslint-env node */
/**
 * @todo Fork find-in-files to get ignore pattern support
 */
import fif from 'find-in-files';

(async () => {
/**
 * @typedef {PlainObject} FileResult
 * @property {string[]} matches
 * @property {Integer} count
 * @property {string[]} line
 */
const fileMatchPatterns = ['editor'];
/**
 * Keys are file name strings
 * @type {Object.<string, FileResult>}
 */
let results = await Promise.all(fileMatchPatterns.map((fileMatchPattern) => {
  return fif.find(
    {
      // We grab to the end of the line as the `line` result for `find-in-files`
      //  only grabs from the beginning of the file to the end of the match.
      term: `(@[^{\\n]*{[^}\\n]*(\\bobject|\\barray\\b|[^.]function|\\bnumber|\\*)[^}\\n]*}|@.*{} ).*`,
      flags: 'gi'
    },
    fileMatchPattern,
    '([^n]|[^i]n|[^m]in|[^.]min).js$'
  );
}));
results = Object.assign(...results);
let total = 0;
let output = '';
Object.entries(results).forEach(([file, res]) => {
  reduceFalseMatches(file, res);
  if (!res.line.length) {
    return;
  }
  output += `\nFound ${res.count} potentially overly generic JSDoc expression${res.count === 1 ? '' : 's'} in file ${file}:\n`;
  res.line.forEach((line) => {
    output += line + '\n';
  });
  total += res.line.length;
  /*
  res.matches.forEach((match) => {
    console.log(match);
  });
  */
});
console.log(`${output}\nTotal failures found: ${total}.\n`); // eslint-disable-line no-console

/**
 * @external FindInFilesResult
 * @type {PlainObject}
 * @property {string[]} matches The matched strings
 * @property {Integer} count The number of matches
 * @property {string[]} line The lines that were matched. The docs mistakenly indicate the property is named `lines`; see {@link https://github.com/kaesetoast/find-in-files/pull/19}.
 */

/**
 * Eliminates known false matches against overly generic types.
 * @param {string} file
 * @param {external:FindInFilesResult} res
 * @returns {void}
 */
function reduceFalseMatches (file, res) {
  switch (file) {
  case 'editor/external/core-js-bundle/minified.js':
  case 'editor/external/jamilih/jml-es.js':
  case 'editor/xdomain-svgedit-config-iife.js': // Ignore
    res.line = [];
    break;
  case 'editor/embedapi.js':
    res.line = res.line.filter((line) => {
      return ![
        '* @param {...*} args Signature dependent on the function'
      ].includes(line);
    });
    break;
  case 'editor/external/dynamic-import-polyfill/importModule.js':
    res.line = res.line.filter((line) => {
      return ![
        '* @returns {Promise<*>} The value to which it resolves depends on the export of the targeted module.',
        '* @returns {Promise<*>} Resolves to value of loading module or rejects with'
      ].includes(line);
    });
    break;
  case 'editor/typedefs.js':
    res.line = res.line.filter((line) => {
      return ![
        '* @typedef {number} Float',
        '* @typedef {*} ArbitraryCallbackResult',
        '* @typedef {Object} ArbitraryObject',
        '* @typedef {Object} ArbitraryModule',
        '* @typedef {Array} GenericArray',
        '* @typedef {*} Any',
        '* @param {...*} args Signature dependent on the function'
      ].includes(line);
    });
    break;
  }
  res.count = res.line.length;
}
})();
