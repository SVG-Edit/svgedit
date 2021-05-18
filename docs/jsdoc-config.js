/* eslint-env node */
'use strict';

module.exports = {
  plugins: [ 'plugins/markdown' ],
  markdown: {},
  recurseDepth: 10,
  source: {
    exclude: [
      'cypress',
      'node_modules',
      'dist',
      'external',
      'screencasts',
      'test'
    ],
    // eslint-disable-next-line max-len
    excludePattern: 'svgedit-config-*|build-html.js|rollup*|external/babel-polyfill|extensions/mathjax|imagelib/jquery.min.js|jspdf/jspdf.min.js|jspdf/underscore-min.js|jquery-ui|jquery.min.js|js-hotkeys'
  },
  sourceType: 'module',
  tags: {
    allowUnknownTags: false
  },
  templates: {
    cleverLinks: true,
    monospaceLinks: false /* ,
    default: {
      layoutFile: 'docs/layout.tmpl'
    } */
  },
  opts: {
    recurse: true,
    verbose: true,
    destination: 'docs/jsdoc',
    tutorials: 'docs/tutorials'
  }
};
