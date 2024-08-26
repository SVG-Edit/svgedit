/* eslint-env node */
import { rimraf } from 'rimraf'
import babel from '@rollup/plugin-babel'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import replace from '@rollup/plugin-replace'

// remove existing distribution
// remove existing distribution
await rimraf('./dist')
console.info('recreating dist')

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/react-test.js',
    sourcemap: true
  },
  plugins: [
    replace({
      preventAssignment: true,
      'process.env.NODE_ENV': '"production"'
    }),
    nodeResolve({
      extensions: ['.js'],
      browser: true
    }),
    babel({
      babelHelpers: 'bundled',
      presets: [['@babel/preset-react', { runtime: 'automatic' }]],
      exclude: 'node_modules/**'
    }),
    commonjs({
      transformMixedEsModules: true
    })
  ]
}
