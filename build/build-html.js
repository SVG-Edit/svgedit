/* eslint-env node */
import fs from 'promise-fs';

const filesAndReplacements = [
  {
    input: 'editor/svg-editor-es.html',
    output: 'editor/xdomain-svg-editor-es.html',
    replacements: [
      [
        '<script type="module" src="../svgedit-config-es.js"></script>',
        '<script type="module" src="xdomain-svgedit-config-es.js"></script>'
      ]
    ]
  },
  {
    input: 'editor/xdomain-svg-editor-es.html',
    output: 'editor/xdomain-svg-editor.html',
    replacements: [
      [
        '<!DOCTYPE html>',
        `<!DOCTYPE html>
<!-- AUTO-GENERATED FROM xdomain-svg-editor-es.html; DO NOT EDIT; use build/build-html.js to build -->`
      ],
      [
        '<script type="module" src="redirect-on-lacking-support.js"></script>',
        '<script defer="defer" src="../dist/redirect-on-lacking-support.js"></script>'
      ],
      [
        '<script type="module" src="xdomain-svgedit-config-es.js"></script>',
        '<script defer="defer" src="xdomain-svgedit-config-iife.js"></script>'
      ],
      [
        '<script src="external/dom-polyfill/dom-polyfill.js"></script>',
        '<script src="../dist/dom-polyfill.js"></script>'
      ],
      [
        '<script nomodule="" src="redirect-on-no-module-support.js"></script>',
        ''
      ]
    ]
  },
  // Now that file has copied, we can replace the DOCTYPE in xdomain
  {
    input: 'editor/xdomain-svg-editor-es.html',
    output: 'editor/xdomain-svg-editor-es.html',
    replacements: [
      [
        '<!DOCTYPE html>',
        `<!DOCTYPE html>
<!-- AUTO-GENERATED FROM svg-editor-es.html; DO NOT EDIT; use build/build-html.js to build -->`
      ]
    ]
  },
  {
    input: 'editor/svg-editor-es.html',
    output: 'editor/svg-editor.html',
    replacements: [
      [
        '<!DOCTYPE html>',
        `<!DOCTYPE html>
<!-- AUTO-GENERATED FROM svg-editor-es.html; DO NOT EDIT; use build/build-html.js to build -->`
      ],
      [
        '<script type="module" src="redirect-on-lacking-support.js"></script>',
        '<script defer="defer" src="../dist/redirect-on-lacking-support.js"></script>'
      ],
      [
        '<script type="module" src="../svgedit-config-es.js"></script>',
        '<script defer="defer" src="../svgedit-config-iife.js"></script>'
      ],
      [
        '<script src="external/dom-polyfill/dom-polyfill.js"></script>',
        '<script src="../dist/dom-polyfill.js"></script>'
      ],
      [
        '<script nomodule="" src="redirect-on-no-module-support.js"></script>',
        ''
      ]
    ]
  },
  {
    input: 'editor/extensions/imagelib/openclipart-es.html',
    output: 'editor/extensions/imagelib/openclipart.html',
    replacements: [
      [
        '<!DOCTYPE html>',
        `<!DOCTYPE html>
<!-- AUTO-GENERATED FROM imagelib/openclipart-es.html; DO NOT EDIT; use build/build-html.js to build -->`
      ],
      [
        '<script src="../../external/dom-polyfill/dom-polyfill.js"></script>',
        '<script src="../../../dist/dom-polyfill.js"></script>'
      ],
      [
        '<script type="module" src="openclipart.js"></script>',
        '<script defer="defer" src="../../../dist/extensions/imagelib/openclipart.js"></script>'
      ],
      [
        '<script nomodule="" src="redirect-on-no-module-support.js"></script>',
        ''
      ]
    ]
  },
  {
    input: 'editor/extensions/imagelib/index-es.html',
    output: 'editor/extensions/imagelib/index.html',
    replacements: [
      [
        '<!DOCTYPE html>',
        `<!DOCTYPE html>
<!-- AUTO-GENERATED FROM imagelib/index-es.html; DO NOT EDIT; use build/build-html.js to build -->`
      ],
      [
        '<script type="module" src="index.js"></script>',
        '<script defer="defer" src="../../../dist/extensions/imagelib/index.js"></script>'
      ],
      [
        '<script nomodule="" src="redirect-on-no-module-support.js"></script>',
        ''
      ]
    ]
  }
];

(async () => {
await filesAndReplacements.reduce(async (p, {input, output, replacements}) => {
  await p;
  let data;
  try {
    data = await fs.readFile(input, 'utf8');
  } catch (err) {
    console.log(`Error reading ${input} file`, err); // eslint-disable-line no-console
  }

  data = replacements.reduce((s, [fnd, replacement]) => {
    return s.replace(fnd, replacement);
  }, data);

  try {
    await fs.writeFile(output, data);
  } catch (err) {
    console.log(`Error writing file: ${err}`, err); // eslint-disable-line no-console
    return;
  }
  console.log(`Completed file ${input} rewriting!`); // eslint-disable-line no-console
}, Promise.resolve());
console.log('Finished!'); // eslint-disable-line no-console
})();
