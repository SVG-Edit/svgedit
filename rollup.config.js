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

// utilities functions
const isDirectory = (source) => {
  return lstatSync(source).isDirectory();
};
const getDirectories = (source) => {
  return readdirSync(source).map((nme) => join(source, nme)).filter((i) => isDirectory(i));
};

// capture the list of files to build for extensions and ext-locales
const extensionFiles = readdirSync('src/editor/extensions');

const extensionLocaleDirs = getDirectories('src/editor/extensions/ext-locale');
const extensionLocaleFiles = [];
extensionLocaleDirs.forEach((dir) => {
  readdirSync(dir).forEach((file) => {
    extensionLocaleFiles.push([dir, file]);
  });
});

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

extensionFiles.forEach((extensionFile) => {
  const extensionName = extensionFile.match(/^ext-(.+?)\.js$/);
  extensionName && config.push(
    {
      input: `./src/editor/extensions/${extensionFile}`,
      treeshake: false,
      output: [
        {
          format: 'es',
          dir: 'dist/editor/extensions',
          inlineDynamicImports: true,
          sourcemap: true
        },
        {
          format: 'system',
          dir: 'dist/editor/system/extensions',
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
        babel({babelHelpers: 'bundled'}),
        nodePolyfills(),
        terser({keep_fnames: true})
      ]
    }
  );
});

extensionLocaleFiles.forEach(([dir, file]) => {
  const lang = file.replace(/\.js$/, '').replace(/-/g, '_');
  config.push(
    {
      input: join(dir, file),
      treeshake: false,
      output: [
        {
          format: 'es',
          file: `dist/editor/extensions/ext-locale/${basename(dir)}/${lang}.js`,
          inlineDynamicImports: true
        },
        {
          format: 'system',
          file: `dist/editor/system/extensions/ext-locale/${basename(dir)}/${lang}.js`,
          inlineDynamicImports: true
        }
      ],
      plugins: [terser({keep_fnames: true})]
    }
  );
});

export default config;
