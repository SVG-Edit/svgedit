const commonjs = require('@rollup/plugin-commonjs');
const {wrapRollupPlugin} = require('es-dev-server-rollup');

module.exports = {
  port: 8000,
  // open: './src/editor/index.html',
  // watch: true,
  nodeResolve: true,
  moduleDirs: ['./node_modules'],
  compatibility: 'none',
  plugins: [
    wrapRollupPlugin(commonjs({exclude: ['src', 'dist', 'instrumented']})) // excluding transformation on ES6 code
  ]
};
