/* eslint-env node */
import babel from 'rollup-plugin-babel';
import replace from 'rollup-plugin-re';
// import {minify} from 'uglify-es';
// import {uglify} from 'rollup-plugin-uglify';

export default [
  {
    input: 'svgedit-config-es.js',
    output: {
      format: 'iife',
      file: `svgedit-config-iife.js`
    },
    plugins: [
      replace({
        patterns: [
          {
            match: /svgedit-config-es\.js/,
            test: 'svgedit-config-es.js',
            replace: 'svgedit-config-iife.js'
          },
          {
            match: /svgedit-config-es\.js/,
            test: '// <CONDITIONAL-ADD>: ', // Sets `svgEditor` global for extensions/locales
            replace: ''
          }
        ]
      }),
      babel()
    ]
  }
];
