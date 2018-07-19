#!/usr/bin/env node
const {ncp} = require('ncp');
// ncp.limit = 16;
const {readFileSync} = require('fs');
const packageJSONString = readFileSync('../svgedit/package.json', {encoding: 'utf-8'});
const {version} = JSON.parse(packageJSONString);

const newDir = `svg-edit-${version}`;
const opts = {
  filter (name) {
      return !(/(\.git\/|node_modules\/|\.gitignore)/).test(name);
  },
  // filter: /copyOnlyThese/ or (name) => true/false
  // transform: (read, write) => { read.pipe(write); }
  clobber: true, // Overwrites
  dereference: false, // Follow symlinks
  stopOnErr: true,
  // errs: streamInstance // `stopOnErr` must be `false`
};
ncp('../svgedit', `./releases/${newDir}`, opts, (err) => {
  if (err) {
    return console.error(err);
  }
  console.log('Copied to releases...');
  ncp('../svgedit', './releases/latest', opts, (err) => {
      if (err) {
          return console.error(err);
      }
      console.log('Copied to latest...Done!');
  });
});
