#!/usr/bin/env node
const {copy} = require('fs-extra');
// ncp.limit = 16;
const {readFileSync} = require('fs');

const packageJSONString = readFileSync('../svgedit/package.json', {encoding: 'utf-8'});
const {version} = JSON.parse(packageJSONString);

const newDir = `svg-edit-${version}`;
const opts = {
  filter (name) {
      return !(/(\.git\/|node_modules\/|\.gitignore)/).test(name);
  },
  overwrite: true,
  dereference: false // Follow symlinks
};

(async () => {

const targets = [`./releases/${newDir}`, './releases/latest'];

try {
  await targets.reduce(async (prom, to) => {
    await prom;
    console.log(`Writing to ${to}`);
    return copy('../svgedit', to, opts).then(() => {
      console.log(`Copied to ${to}...`);
    })
  }, []);

} catch (err) {
  console.log(`Error copying`);
  return console.error(err);
}

console.log('Finished copying!');

})();
