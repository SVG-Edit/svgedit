/* eslint-env node */

// NOTE:
// See rollup-config.config.js instead for building the main (configurable)
//   user entrance file
import {join, basename} from 'path';
import {lstatSync, readdirSync, copyFileSync} from 'fs';

import babel from 'rollup-plugin-babel';
import {terser} from 'rollup-plugin-terser';
import replace from 'rollup-plugin-re';

const localeFiles = readdirSync('editor/locale');
const extensionFiles = readdirSync('editor/extensions');

const isDirectory = (source) => {
  return lstatSync(source).isDirectory();
};
const getDirectories = (source) => {
  return readdirSync(source).map((nme) => join(source, nme)).filter((i) => isDirectory(i));
};
const extensionLocaleDirs = getDirectories('editor/extensions/ext-locale');
const extensionLocaleFiles = [];
extensionLocaleDirs.forEach((dir) => {
  readdirSync(dir).forEach((file) => {
    extensionLocaleFiles.push([dir, file]);
  });
});

/**
 * @external RollupConfig
 * @type {PlainObject}
 * @see {@link https://rollupjs.org/guide/en#big-list-of-options}
 */

/**
 * @param {PlainObject} [config={}]
 * @param {boolean} [config.minifying]
 * @param {string} [config.format='umd']
 * @returns {external:RollupConfig}
 */
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
        plugins: [
          'transform-object-rest-spread',
          '@babel/plugin-transform-named-capturing-groups-regex'
        ]
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
  ...[true, false].map((min) => {
    return {
      input: 'editor/svgcanvas.js',
      output: {
        format: 'iife',
        sourcemap: min,
        name: 'SvgCanvas',
        file: `dist/svgcanvas-iife${min ? '.min' : ''}.js`
      },
      plugins: [
        babel({
          plugins: ['transform-object-rest-spread']
        }),
        min ? terser() : null
      ]
    };
  }),
  ...extensionLocaleFiles.map(([dir, file]) => {
    const lang = file.replace(/\.js$/, '').replace(/-/g, '_');
    return {
      input: join(dir, file),
      output: {
        format: 'iife',
        name: `svgEditorExtensionLocale_${basename(dir)}_${lang}`,
        file: `dist/extensions/ext-locale/${basename(dir)}/${file}`
      },
      plugins: [babel()]
    };
  }),
  {
    input: 'editor/redirect-on-lacking-support.js',
    output: {
      format: 'iife',
      file: 'dist/redirect-on-lacking-support.js'
    },
    plugins: [babel()]
  },
  {
    input: 'editor/jspdf/jspdf.plugin.svgToPdf.js',
    output: {
      format: 'iife',
      file: 'dist/jspdf.plugin.svgToPdf.js'
    },
    plugins: [babel()]
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
    plugins: [babel()]
  },
  {
    input: 'editor/canvg/canvg.js',
    output: {
      format: 'iife',
      name: 'canvg',
      file: 'dist/canvg.js'
    },
    plugins: [babel()]
  },
  ...localeFiles.map((localeFile) => {
    // lang.*.js
    const localeRegex = /^lang\.([\w-]+?)\.js$/;
    const lang = localeFile.match(localeRegex);
    if (!lang) {
      return undefined;
    }
    return {
      input: 'editor/locale/' + localeFile,
      output: {
        format: 'iife',
        name: 'svgEditorLang_' + lang[1].replace(/-/g, '_'),
        file: 'dist/locale/' + localeFile
      },
      plugins: [
        // Probably don't need here, but...
        babel()
      ]
    };
  }),
  ...extensionFiles.map((extensionFile) => {
    if (extensionFile.match(/\.php$/)) {
      copyFileSync(
        join('editor/extensions', extensionFile),
        join('dist/extensions', extensionFile)
      );
      return undefined;
    }
    // ext-*.js
    const extensionName = extensionFile.match(/^ext-(.+?)\.js$/);
    if (!extensionName) {
      return undefined;
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
            ].map((tst) => {
              return {
                match: /editor\/extensions/,
                test: tst,
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
