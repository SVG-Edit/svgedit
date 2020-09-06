/* eslint-env node */
// This rollup script is run by the command:
// 'npm run build'
// For developers, it's advised to run the command in watch mode:
// 'npm run build -- -w"

import {join, basename} from 'path';
import {lstatSync, readdirSync} from 'fs';
import rimraf from 'rimraf';
import babel from '@rollup/plugin-babel';
import copy from 'rollup-plugin-copy';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import nodePolyfills from 'rollup-plugin-node-polyfills';
import url from '@rollup/plugin-url'; // for XML/SVG files
import dynamicImportVars from '@rollup/plugin-dynamic-import-vars';
import {terser} from 'rollup-plugin-terser';

// utility function
const getDirectories = (source) => {
  const isDirectory = (dir) => {
    return lstatSync(dir).isDirectory();
  };
  return readdirSync(source).map((nme) => join(source, nme)).filter((i) => isDirectory(i));
};

// capture the list of files to build for extensions and ext-locales
const extensionDirs = getDirectories('src/editor/extensions');

// remove existing distribution
// eslint-disable-next-line no-console
rimraf('./dist', () => console.info('recreating dist'));

// config for svgedit core module
const config = [{
  input: 'src/editor/index.js',
  output: [
    {
      format: 'es',
      inlineDynamicImports: true,
      sourcemap: true,
      dir: 'dist/editor'
    },
    {
      format: 'system',
      dir: 'dist/editor/system',
      inlineDynamicImports: true
    }
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
          dest: 'dist/editor/system',
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
        {src: 'src/editor/images', dest: ['dist/editor', 'dist/editor/system']},
        {src: 'src/editor/jquery.min.js', dest: ['dist/editor', 'dist/editor/system']},
        {src: 'src/editor/jquery-ui', dest: ['dist/editor', 'dist/editor/system']},
        {src: 'src/editor/jgraduate', dest: ['dist/editor', 'dist/editor/system']},
        {src: 'src/editor/spinbtn', dest: ['dist/editor', 'dist/editor/system']},
        {src: 'src/editor/embedapi.html', dest: ['dist/editor', 'dist/editor/system']},
        {src: 'src/editor/embedapi.js', dest: ['dist/editor', 'dist/editor/system']},
        {src: 'src/editor/browser-not-supported.html', dest: ['dist/editor', 'dist/editor/system']},
        {src: 'src/editor/redirect-on-lacking-support.js', dest: ['dist/editor', 'dist/editor/system']},
        {src: 'src/editor/redirect-on-no-module-support.js', dest: ['dist/editor', 'dist/editor/system']},
        {src: 'src/editor/svgedit.css', dest: ['dist/editor', 'dist/editor/system']}
      ]
    }),
    nodeResolve({
      browser: true,
      preferBuiltins: true
    }),
    commonjs(),
    dynamicImportVars({include: './src/editor/locale.js'}),
    babel({babelHelpers: 'bundled'}),
    nodePolyfills(),
    terser({keep_fnames: true})
  ]
}];

extensionDirs.forEach((extensionDir) => {
  const extensionName = basename(extensionDir);
  extensionName && config.push(
    {
      input: `./src/editor/extensions/${extensionName}/${extensionName}.js`,
      output: [
        {
          format: 'es',
          dir: `dist/editor/extensions/${extensionName}`,
          inlineDynamicImports: true,
          sourcemap: true
        },
        {
          format: 'system',
          dir: `dist/editor/system/extensions/${extensionName}`,
          inlineDynamicImports: true
        }
      ],
      plugins: [
        url({
          include: ['**/*.svg', '**/*.png', '**/*.jpg', '**/*.gif', '**/*.xml'],
          limit: 0,
          fileName: '[name][extname]'
        }),
        nodeResolve({
          browser: true,
          preferBuiltins: true
        }),
        commonjs(),
        dynamicImportVars({include: `dist/editor/system/extensions/${extensionName}${extensionName}.js`}),
        babel({babelHelpers: 'bundled'}),
        nodePolyfills(),
        terser({keep_fnames: true})
      ]
    }
  );
});

export default config;
