/* eslint-env node */
'use strict';

module.exports = {
  plugins: ['plugins/markdown'],
  markdown: {
    // tags: ['examples']
    /*
    // "The highlighter function should escape the code block's contents and wrap them in <pre><code> tags"
    highlight (code, language) {
      function ret () {
        // Default:
        return '<pre><code>' + code + ' in this language: ' + language + '</code></pre>';
      }
      if (language !== 'js') { // E.g., we have one URL in some tutorial Markdown
        // Seems to be only for full triple-backticked fences
        // console.log('lll', code);
        return ret();
      }

      // Programmatic ESLint API: https://eslint.org/docs/developer-guide/nodejs-api
      const {CLIEngine} = require('eslint');
      const cli = new CLIEngine({
        useEslintrc: true,
        rules: {
          'no-undef': 0, // Many variables in examples will be undefined
          'padded-blocks': 0 // Can look nicer
        }
      });

      // Undo escaping done by node_modules/jsdoc/lib/jsdoc/util/markdown.js
      code = code
        .replace(/\s+$/, '')
        .replace(/&#39;/g, "'")
        .replace(/(https?):\\\/\\\//g, '$1://')
        .replace(/\{@[^}\r\n]+\}/g, function (wholeMatch) {
          return wholeMatch.replace(/&quot;/g, '"');
        });

      // lint the supplied text and optionally set
      // a filename that is displayed in the report
      const report = cli.executeOnText(code + '\n');
      if (!report.errorCount && !report.warningCount) {
        return ret();
      }

      // Although we don't get the file, at least we can report the source code
      const {messages} = report.results[0];
      messages.forEach(({message, line, column, severity, ruleId}) => {
        console.log(`${ruleId}: ${message} (Severity: ${severity}; ${line}:${column})`);
      });
      console.log('\n' + code);

      return ret();
    }
    */
  },
  recurseDepth: 10,
  source: {
    exclude: [
      'node_modules',
      'dist',
      'editor/external',
      'firefox-extension',
      'opera-widget',
      'screencasts',
      'test'
    ],
    excludePattern: 'svgedit-config-*|build-html.js|rollup*|external/babel-polyfill|extensions/mathjax|imagelib/jquery.min.js|jspdf/jspdf.min.js|jspdf/underscore-min.js|jquery-ui|jquery.min.js|jquerybbq|js-hotkeys'
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
