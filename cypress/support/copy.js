/* globals require */
/* eslint-disable import/no-commonjs */

const copyfiles = require('copyfiles');
const pkg = require('../../package.json');

copyfiles([
  ...pkg.nyc.exclude,
  'instrumented'
], {
  up: 1
}, () => {
  // eslint-disable-next-line no-console
  console.log('Done');
});
