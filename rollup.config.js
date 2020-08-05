/* eslint-env node */
import babel from '@rollup/plugin-babel';
import copy from 'rollup-plugin-copy';
import { nodeResolve } from '@rollup/plugin-node-resolve';

const config = {
  input: 'src/editor/index.js',
  output: {
    dir: 'dist',
    format: 'esm'
  },
  plugins: [
    copy({
      targets: [
        {src: 'src/editor/locale', dest: 'dist/'},
        {src: 'src/editor/extensions', dest: 'dist/'},
        {src: 'src/editor/images', dest: 'dist/'}
      ]
    }),
    nodeResolve(),
    babel({babelHelpers: 'bundled'})
  ]
};

export default config;
