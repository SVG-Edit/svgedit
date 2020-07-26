'use strict';

module.exports = {
  extends: ['eslint:recommended', 'ash-nazg/sauron-node'],
  parserOptions: {
    "ecmaVersion": 10,
    sourceType: 'module'
  },
  env: {
    browser: true,
    es6: true
  },
  rules: {
    // check-examples is not picking up eslint config properly in some
    //  environments; see also discussion above
    //  `mocha-cleanup/no-assertions-outside-it`
    'jsdoc/check-examples': ['warn', {
      rejectExampleCodeRegex: '^`'
    }],

    // https://github.com/sindresorhus/eslint-plugin-unicorn/issues/453
    'unicorn/regex-shorthand': 0,
    // The Babel transform seems to have a problem converting these
    'prefer-named-capture-group': 'off',
    'jsdoc/require-file-overview': ['error', {
      tags: {
        file: {
          initialCommentsOnly: true,
          preventDuplicates: true
        },
        license: {
          initialCommentsOnly: true,
          preventDuplicates: true
        },
        copyright: {
          initialCommentsOnly: true,
          preventDuplicates: true
        },
        author: {
          initialCommentsOnly: true,
          preventDuplicates: true
        },
        module: {
          initialCommentsOnly: true,
          preventDuplicates: true
        },
        exports: {
          initialCommentsOnly: true,
          preventDuplicates: true
        }
      }
    }],
    // Warning or Off for now but should be reviewed
    // Override these rules which are difficult for us
    //   to apply at this time
    'unicorn/prefer-string-slice': 'off',
    'default-case': 'off',
    'require-unicode-regexp': 'off',
    'max-len': ['warn', { 'ignoreComments': true, 'code': 130 }], // 130 is too much but too many occurences
    'unicorn/prefer-query-selector': 'off',
    'unicorn/no-fn-reference-in-iterator': 'off',
    'unicorn/prefer-node-append': 'off',
    'unicorn/no-zero-fractions': 'off',
    'unicorn/prefer-number-properties': 'off',
    'eslint-comments/require-description': 'off',
    'compat/compat': 'warn',
    'consistent-this': 'off',
    'import/no-anonymous-default-export': 'off',
     'node/no-unsupported-features/node-builtins': 'warn',
     'prefer-exponentiation-operator': 'warn'
  },
  overrides: [
    // Locales have no need for importing outside of SVG-Edit
    // and translations may need a longer line length
    {
      files: [
        'src/editor/locale/lang.*.js', 'src/editor/extensions/ext-locale/**',
        'docs/tutorials/ExtensionDocs.md'
      ],
      rules: {
        'import/no-anonymous-default-export': 'off',
        'max-len': 'off'
      }
    }
  ]
};
