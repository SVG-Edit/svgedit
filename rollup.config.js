/* eslint-env node */
import rimraf from 'rimraf';
import babel from '@rollup/plugin-babel';
import copy from 'rollup-plugin-copy';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import nodePolyfills from 'rollup-plugin-node-polyfills';

// eslint-disable-next-line no-console
rimraf('./dist', () => console.info('recreating dist'));

const config = [{
  input: 'src/editor/index.js',
  preserveEntrySignatures: false,
  output: [
    {
      format: 'es',
      file: 'dist/editor/index.js',
      inlineDynamicImports: true,
      sourcemap: true
      // dir: 'dist/editor'
    },
    {
      format: 'system',
      file: 'dist/editor/index-system.js',
      inlineDynamicImports: true,
      sourcemap: true
      // dir: 'dist/editor'
    },
    {
      format: 'iife',
      file: 'dist/editor/index-iife.js',
      inlineDynamicImports: true
    },
    {
      format: 'umd',
      file: 'dist/editor/index-umd.js',
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
          dest: 'dist/editor',
          rename: 'index-iife.html',
          transform: (contents) => contents.toString()
            .replace('<script type="module" src="index.js">', '<script defer="defer" src="index-iife.js">')
        },
        {
          src: 'src/editor/index.html',
          dest: 'dist/editor',
          rename: 'index-system.html',
          transform: (contents) => contents.toString()
            .replace('<script type="module" src="index.js">',
              `<script>
              if (!window.supportsDynamicImport) {
                const systemJsLoaderTag = document.createElement('script');
                systemJsLoaderTag.src = './s.min.js';
                systemJsLoaderTag.addEventListener('load', function () {
                  System.import('./index-system.js');
                });
                document.head.appendChild(systemJsLoaderTag);
              }`)
        },
        {
          src: ['node_modules/systemjs/dist/s.min.js', 'node_modules/systemjs/dist/s.min.js.map'],
          dest: 'dist/editor'
        },
        {
          src: 'src/editor/index.html',
          dest: 'dist/editor',
          rename: 'index-umd.html',
          transform: (contents) => contents.toString()
            .replace('<script type="module" src="index.js">', '<script src="index-umd.js">')
        },
        {src: 'src/editor/locale', dest: 'dist/editor'},
        {src: 'src/editor/extensions', dest: 'dist/editor'},
        {src: 'src/editor/images', dest: 'dist/editor'},
        {src: 'src/common', dest: 'dist'},
        {src: 'src/external', dest: 'dist'},
        {src: 'src/editor/jquery.min.js', dest: 'dist/editor'},
        {src: 'src/editor/jquery-ui', dest: 'dist/editor'},
        {src: 'src/editor/jgraduate', dest: 'dist/editor'},
        {src: 'src/editor/spinbtn', dest: 'dist/editor'},
        {src: 'src/editor/embedapi.html', dest: 'dist/editor'},
        {src: 'src/editor/embedapi.js', dest: 'dist/editor'},
        {src: 'src/editor/browser-not-supported.html', dest: 'dist/editor'},
        {src: 'src/editor/redirect-on-lacking-support.js', dest: 'dist/editor'},
        {src: 'src/editor/redirect-on-no-module-support.js', dest: 'dist/editor'},
        {src: 'src/editor/svgedit.css', dest: 'dist/editor'}
      ]
    }),
    nodeResolve({
      browser: true,
      preferBuiltins: true
    }),
    commonjs(),
    babel({babelHelpers: 'bundled'}),
    nodePolyfills()
  ]
}];

export default config;
