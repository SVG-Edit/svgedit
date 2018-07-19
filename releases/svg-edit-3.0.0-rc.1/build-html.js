/* eslint-env node */
const fs = require('fs');
fs.readFile('editor/svg-editor-es.html', 'utf8', (err, data) => {
  if (err) {
    console.log('Error reading `svg-editor-es.html` file', err);
    return;
  }
  data = data
    .replace(
      '<!DOCTYPE html>',
      `<!DOCTYPE html>
<!-- AUTO-GENERATED FROM svg-editor-es.html; DO NOT EDIT; use build-html.js to build -->`
    ).replace(
      '<script type="module" src="redirect-on-lacking-support.js"></script>',
      '<script defer="defer" src="../dist/redirect-on-lacking-support.js"></script>'
    ).replace(
      '<script type="module" src="../svgedit-config-es.js"></script>',
      '<script defer="defer" src="../svgedit-config-iife.js"></script>'
    ).replace(
      '<script src="external/dom-polyfill/dom-polyfill.js"></script>',
      '<script src="../dist/dom-polyfill.js"></script>'
    );
  fs.writeFile('editor/svg-editor.html', data, (err) => {
    if (err) {
      console.log('Error writing file', err);
      return;
    }
    console.log('Completed file rewriting!');
  });
});
fs.readFile('editor/extensions/imagelib/index-es.html', 'utf8', (err, data) => {
  if (err) {
    console.log('Error reading `imagelib/index-es.html` file', err);
    return;
  }
  data = data
    .replace(
      '<!DOCTYPE html>',
      `<!DOCTYPE html>
<!-- AUTO-GENERATED FROM imagelib/index-es.html; DO NOT EDIT; use build-html.js to build -->`
    ).replace(
      '<script type="module" src="index.js"></script>',
      '<script defer="defer" src="../../../dist/extensions/imagelib/index.js"></script>'
    );
  fs.writeFile('editor/extensions/imagelib/index.html', data, (err) => {
    if (err) {
      console.log('Error writing file', err);
      return;
    }
    console.log('Completed file rewriting!');
  });
});
