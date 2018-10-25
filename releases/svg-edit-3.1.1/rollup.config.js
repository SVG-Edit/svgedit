/* eslint-env node */

// NOTE:
// See rollup-config.config.js instead for building the main (configurable)
//   user entrance file

import babel from 'rollup-plugin-babel';
import {terser} from 'rollup-plugin-terser';
import replace from 'rollup-plugin-re';

const {lstatSync, readdirSync} = require('fs');
const localeFiles = readdirSync('editor/locale');
const extensionFiles = readdirSync('editor/extensions');
const {join, basename} = require('path');

const isDirectory = (source) => {
  return lstatSync(source).isDirectory();
};
const getDirectories = (source) => {
  return readdirSync(source).map(name => join(source, name)).filter(isDirectory);
};
const extensionLocaleDirs = getDirectories('editor/extensions/ext-locale');
const extensionLocaleFiles = [];
extensionLocaleDirs.forEach((dir) => {
  readdirSync(dir).forEach((file) => {
    extensionLocaleFiles.push([dir, file]);
  });
});

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
      babel({
        plugins: ['transform-object-rest-spread']
      })
    ]
  };
  if (minifying) {
    nonMinified.plugins.push(terser());
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
  ...extensionLocaleFiles.map(([dir, file]) => {
    const lang = file.replace(/\.js$/, '').replace(/-/g, '_');
    return {
      input: join(dir, file),
      output: {
        format: 'iife',
        name: `svgEditorExtensionLocale_${basename(dir)}_${lang}`,
        file: `dist/extensions/ext-locale/${basename(dir)}/${file}`
      },
      plugins: [
        babel()
      ]
    };
  }),
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
    input: 'editor/jspdf/jspdf.plugin.svgToPdf.js',
    output: {
      format: 'iife',
      file: `dist/jspdf.plugin.svgToPdf.js`
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
  {
    input: 'editor/extensions/imagelib/openclipart.js',
    output: {
      format: 'iife',
      file: 'dist/extensions/imagelib/openclipart.js'
    },
    plugins: [
      babel({
        plugins: ['transform-object-rest-spread']
      })
    ]
  },
  {
    input: 'editor/external/dom-polyfill/dom-polyfill.js',
    output: {
      format: 'iife',
      file: 'dist/dom-polyfill.js'
    },
    plugins: [
      babel()
    ]
  },
  {
    input: 'editor/canvg/canvg.js',
    output: {
      format: 'iife',
      name: 'canvg',
      file: 'dist/canvg.js'
    },
    plugins: [
      babel()
    ]
  },
  ...localeFiles.map((localeFile) => {
    // lang.*.js
    const localeRegex = /^lang\.([\w-]+?)\.js$/;
    const lang = localeFile.match(localeRegex);
    if (!lang) {
      return;
    }
    return {
      input: 'editor/locale/' + localeFile,
      output: {
        format: 'iife',
        name: 'svgEditorLang_' + lang[1].replace(/-/g, '_'),
        file: 'dist/locale/' + localeFile
      },
      plugins: [
        babel() // Probably don't need here, but...
      ]
    };
  }),
  ...extensionFiles.map((extensionFile) => {
    // ext-*.js
    const extensionName = extensionFile.match(/^ext-(.+?)\.js$/);
    if (!extensionName) {
      return;
    }
    return {
      input: 'editor/extensions/' + extensionFile,
      output: {
        format: 'iife',
        name: 'svgEditorExtension_' + extensionName[1].replace(/-/g, '_'),
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
              // We'll still make at least one import: editor/ext-locale/storage/
              `import '../svgpathseg.js';`
            ].map((test) => {
              return {
                match: /editor\/extensions/,
                test,
                replace: ''
              };
            })
          ]
        }),
        babel({
          plugins: ['transform-object-rest-spread']
        })
      ]
    };
  })
].filter((exp) => exp);
