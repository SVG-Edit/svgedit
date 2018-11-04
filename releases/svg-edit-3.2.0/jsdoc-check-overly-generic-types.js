/* eslint-env node */
/**
 * @todo Fork find-in-files to get ignore pattern support
 */
const fif = require('find-in-files');
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
let results = await Promise.all(fileMatchPatterns.map(async (fileMatchPattern) => {
  return fif.find(
    {
      // We grab to the end of the line as the `line` result for `find-in-files`
      //  only grabs from the beginning of the file to the end of the match.
      term: `(@[^{\\n]*{[^}\\n]*(\\bobject|\\barray\\b|[^.]function|\\bnumber|\\*)[^}\\n]*}|@.*{}).*`,
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
console.log(`${output}\nTotal failures found: ${total}.\n`);

function reduceFalseMatches (file, res) {
  switch (file) {
  case 'editor/external/jamilih/jml-es.js':
  case 'editor/xdomain-svgedit-config-iife.js': // Ignore
    res.line = [];
    break;
  case 'editor/external/dynamic-import-polyfill/importModule.js':
    res.line = res.line.filter((line) => {
      return ![
        '* @returns {*} The return depends on the export of the targeted module.',
        '* @returns {ArbitraryModule|*} The return depends on the export of the targeted module.'
      ].includes(line);
    });
    break;
  case 'editor/embedapi.js':
    res.line = res.line.filter((line) => {
      return ![
        '* @param {...*} args Signature dependent on the function'
      ].includes(line);
    });
    break;
  case 'editor/typedefs.js':
    res.line = res.line.filter((line) => {
      return ![
        '* @typedef {number} Float',
        '* @typedef {Object} ArbitraryObject',
        '* @typedef {Object} ArbitraryModule',
        '* @typedef {Array} GenericArray',
        '* @typedef {*} Any',
        '* @param {...*} args Signature dependent on the function',
        '* @returns {*} Return dependent on the function'
      ].includes(line);
    });
    break;
  }
  res.count = res.line.length;
}
})();
