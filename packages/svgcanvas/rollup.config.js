/* eslint-env node */
// This rollup script is run by the command:
// 'npm run build'

import rimraf from 'rimraf'
import babel from '@rollup/plugin-babel'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
// import progress from 'rollup-plugin-progress';
import filesize from 'rollup-plugin-filesize'

// remove existing distribution
rimraf('./dist', () => console.info('recreating dist'))

// config for svgedit core module
const config = [{
  input: ['./svgcanvas.js'],
  output: [
    {
      format: 'es',
      inlineDynamicImports: true,
      sourcemap: true,
      file: 'dist/svgcanvas.js'
    }
  ],
  plugins: [
    nodeResolve({
      browser: true,
      preferBuiltins: false
    }),
    commonjs(),
    babel({ babelHelpers: 'bundled', exclude: [/\/core-js\//] }), // exclude core-js to avoid circular dependencies.
    filesize()
  ]
}]
export default config
