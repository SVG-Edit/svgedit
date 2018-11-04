/* eslint-env node */
import babel from 'rollup-plugin-babel';
import replace from 'rollup-plugin-re';

const plugins = [
  replace({
    patterns: [
      {
        match: /svgedit-config-es\.js/,
        test: 'svgedit-config-es.js',
        replace: 'svgedit-config-iife.js'
      },
      {
        match: /svgedit-config-es\.js/,
        test: "import svgEditor from './editor/svg-editor.js';", // Sets `svgEditor` global for extensions/locales
        replace: `import svgEditor from './editor/svg-editor.js';
window.svgEditor = svgEditor;
window.svgEditor.modules = false;
        `
      },
      {
        match: /xdomain-svgedit-config-es\.js/,
        test: "import svgEditor from './svg-editor.js';",
        replace: `import svgEditor from './svg-editor.js';
window.svgEditor = svgEditor;
window.svgEditor.modules = false;
`
      }
    ]
  }),
  babel({
    plugins: ['transform-object-rest-spread']
  })
];

export default [
  {
    input: 'svgedit-config-es.js',
    output: {
      format: 'iife',
      file: `svgedit-config-iife.js`
    },
    plugins
  },
  {
    input: 'editor/xdomain-svgedit-config-es.js',
    output: {
      format: 'iife',
      file: `editor/xdomain-svgedit-config-iife.js`
    },
    plugins
  }
];
