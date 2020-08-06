/* eslint-env node */
import rimraf from 'rimraf';
import babel from '@rollup/plugin-babel';
import copy from 'rollup-plugin-copy';
import {nodeResolve} from '@rollup/plugin-node-resolve';

// eslint-disable-next-line no-console
rimraf('./dist', () => console.info('recreating dist'));

const config = {
  input: 'src/editor/index.js',
  output: [
    {
      format: 'es',
      file: 'dist/editor/index.js'
    },
    {
      format: 'iife',
      file: 'dist/editor/index-iife.js'
    },
    {
      format: 'umd',
      file: 'dist/editor/index-umd.js'
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
          transform: (contents) => contents.toString().replace('index.js', 'index-iife.js')
        },
        {
          src: 'src/editor/index.html',
          dest: 'dist/editor',
          rename: 'index-umd.html',
          transform: (contents) => contents.toString().replace('index.js', 'index-umd.js')
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
    nodeResolve(),
    babel({babelHelpers: 'bundled'})
  ]
};

export default config;
