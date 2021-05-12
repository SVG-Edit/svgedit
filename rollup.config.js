/* eslint-disable node/no-unpublished-import */
/* eslint-env node */
// This rollup script is run by the command:
// 'npm run build'

import path from 'path';
import { lstatSync, readdirSync } from 'fs';
import rimraf from 'rimraf';
import babel from '@rollup/plugin-babel';
import copy from 'rollup-plugin-copy';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import nodePolyfills from 'rollup-plugin-node-polyfills';
import url from '@rollup/plugin-url'; // for XML/SVG files
import dynamicImportVars from '@rollup/plugin-dynamic-import-vars';
import { terser } from 'rollup-plugin-terser';
// import progress from 'rollup-plugin-progress';
import filesize from 'rollup-plugin-filesize';

// utility function
const getDirectories = (source) => {
  const isDirectory = (dir) => {
    return lstatSync(dir).isDirectory();
  };
  return readdirSync(source).map((nme) => path.join(source, nme)).filter((i) => isDirectory(i));
};

// capture the list of files to build for extensions and ext-locales
const extensionDirs = getDirectories('src/editor/extensions');

/** @todo should we support systemjs? */
const dest = [ 'dist/editor' ];

// remove existing distribution
// eslint-disable-next-line no-console
rimraf('./dist', () => console.info('recreating dist'));

// config for svgedit core module
const config = [ {
  input: [ 'src/editor/index.js' ],
  output: [
    {
      format: 'es',
      inlineDynamicImports: true,
      sourcemap: true,
      file: 'dist/editor/index.js'
    },
    {
      format: 'es',
      inlineDynamicImports: true,
      sourcemap: true,
      file: 'dist/editor/xdomain-index.js',
      intro: 'const XDOMAIN = true;'
    }
    /*
    {
      format: 'system',
      dir: 'dist/editor/system',
      inlineDynamicImports: true
    }
    */
  ],
  plugins: [
    copy({
      targets: [
        {
          src: 'src/editor/index.html',
          dest: 'dist/editor'
        },
        {
          src: 'src/editor/index.html',
          dest: 'dist/editor',
          rename: 'xdomain-index.html',
          transform: (contents) => contents.toString()
            .replace('<script type="module" src="index.js">', '<script type="module" src="xdomain-index.js">')
        },
        /*
        {
          src: 'src/editor/index.html',
          dest: ['dist/editor/system'],
          rename: 'index.html',
          transform: (contents) => contents.toString()
            .replace('<script type="module" src="index.js">',
              `<script>
              const systemJsLoaderTag = document.createElement('script');
              systemJsLoaderTag.src = './s.min.js';
              systemJsLoaderTag.addEventListener('load', function () {
                System.import('./index.js');
                });
              document.head.appendChild(systemJsLoaderTag);
              `)
        },
        {
          src: ['node_modules/systemjs/dist/s.min.js', 'node_modules/systemjs/dist/s.min.js.map'],
          dest: 'dist/editor/system'
        },
        */
        { src: 'src/editor/images', dest },
        { src: 'src/editor/extensions/ext-shapes/shapelib', dest: dest.map((d) => `${d}/extensions/ext-shapes`) },
        { src: 'src/editor/embedapi.html', dest },
        { src: 'src/editor/embedapi.js', dest },
        { src: 'src/editor/browser-not-supported.html', dest },
        { src: 'src/editor/browser-not-supported.js', dest },
        { src: 'src/editor/svgedit.css', dest }
      ]
    }),
    nodeResolve({
      browser: true,
      preferBuiltins: false
    }),
    commonjs(),
    dynamicImportVars({ include: `src/editor/locale.js` }),
    babel({ babelHelpers: 'bundled', exclude: [ /\/core-js\// ] }), // exclude core-js to avoid circular dependencies.
    nodePolyfills(),
    terser({ keep_fnames: true }), // keep_fnames is needed to avoid an error when calling extensions.
    filesize()
  ]
} ];

// config for dynamic extensions
extensionDirs.forEach((extensionDir) => {
  const extensionName = path.basename(extensionDir);
  extensionName && config.push(
    {
      input: `./src/editor/extensions/${extensionName}/${extensionName}.js`,
      output: [
        {
          format: 'es',
          dir: `dist/editor/extensions/${extensionName}`,
          inlineDynamicImports: true,
          sourcemap: true
        }
        /*
        ,
        {
          format: 'system',
          dir: `dist/editor/system/extensions/${extensionName}`,
          inlineDynamicImports: true
        }
        */
      ],
      plugins: [
        url({
          include: [ '**/*.svg', '**/*.png', '**/*.jpg', '**/*.gif', '**/*.xml' ],
          limit: 0,
          fileName: '[name][extname]'
        }),
        nodeResolve({
          browser: true,
          preferBuiltins: true
        }),
        commonjs({ exclude: `src/editor/extensions/${extensionName}/${extensionName}.js` }),
        dynamicImportVars({ include: `src/editor/extensions/${extensionName}/${extensionName}.js` }),
        babel({ babelHelpers: 'bundled', exclude: [ /\/core-js\// ] }),
        nodePolyfills(),
        terser({ keep_fnames: true })
      ]
    }
  );
});

export default config;
