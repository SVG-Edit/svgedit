/* eslint-env node */

// NOTE:
// See rollup-config.config.js instead for building the main (configurable)
//   user entrance file

import babel from 'rollup-plugin-babel';
import {uglify} from 'rollup-plugin-uglify';
import {minify} from 'uglify-es';
import replace from 'rollup-plugin-re';

const fs = require('fs');
const localeFiles = fs.readdirSync('editor/locale');
const extensionFiles = fs.readdirSync('editor/extensions');

function getRollupObject ({minifying, format = 'umd'} = {}) {
  const nonMinified = {
    input: 'editor/svg-editor.js',
    output: {
      format,
      sourcemap: minifying,
      file: `dist/index-${format}${minifying ? '.min' : ''}.js`,
      name: 'svgEditor'
    },
    plugins: [
      babel()
    ]
  };
  if (minifying) {
    nonMinified.plugins.push(uglify(null, minify));
  }
  return nonMinified;
}

// For debugging
// getRollupObject; // eslint-disable-line no-unused-expressions

export default [
  // The first four are for those not using our HTML (though
  //    not currently recommended)
  /**/
  getRollupObject(),
  getRollupObject({minifying: true}),
  getRollupObject({minifying: true, format: 'es'}),
  getRollupObject({minifying: false, format: 'es'}),
  // **/
  {
    input: 'editor/redirect-on-lacking-support.js',
    output: {
      format: 'iife',
      file: `dist/redirect-on-lacking-support.js`
    },
    plugins: [
      babel()
    ]
  },
  {
    input: 'editor/extensions/imagelib/index.js',
    output: {
      format: 'iife',
      file: 'dist/extensions/imagelib/index.js'
    },
    plugins: [
      babel({
        plugins: ['transform-object-rest-spread']
      })
    ]
  },
  ...localeFiles.map((localeFile) => {
    // lang.*.js
    if (!(/^lang\.[\w-]+?\.js$/).test(localeFile)) {
      return;
    }
    return {
      input: 'editor/locale/' + localeFile,
      output: {
        format: 'iife',
        file: 'dist/locale/' + localeFile
      },
      plugins: [
        replace({
          patterns: [
            {
              match: /editor\/locale/,
              test: `import svgEditor from '../svg-editor.js';`,
              replace: ''
            }
          ]
        }),
        babel() // Probably don't need here, but...
      ]
    };
  }),
  ...extensionFiles.map((extensionFile) => {
    // ext-*.js
    if (!(/^ext-[\w-]+?\.js$/).test(extensionFile)) {
      return;
    }
    return {
      input: 'editor/extensions/' + extensionFile,
      output: {
        format: 'iife',
        file: 'dist/extensions/' + extensionFile
      },
      plugins: [
        replace({
          patterns: [
            /*
            // In place of replacing imports with globals, we supply
            //  what we can to the extension callback in svgcanvas.js
            // (`addExtension` -> `getPrivateMethods`)
            {
              match: /editor\/extensions/,
              test: '// <CONDITIONAL-ADD>: ',
              replace: ''
            },
            */
            ...[
              // For now, we'll replace with globals
              // We'll still make at least one import: editor/ext-locale/storage.js
              `import svgEditor from '../svg-editor.js';`,
              `import '../pathseg.js';`
            ].map((test) => {
              return {
                match: /editor\/extensions/,
                test,
                replace: ''
              };
            })
          ]
        }),
        babel()
      ]
    };
  })
].filter((exp) => exp);
