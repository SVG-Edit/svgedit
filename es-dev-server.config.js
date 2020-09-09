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
    wrapRollupPlugin(commonjs({exclude: ['src/editor/system', 'dist/editor/system/**']})) // excluding transformation of the systemJS bundle
  ]
};
