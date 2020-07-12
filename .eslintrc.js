'use strict';

module.exports = {
  extends: ['ash-nazg/sauron-node'],
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true
  },
  settings: {
    polyfills: [
    ],
    jsdoc: {
      additionalTagNames: {
        // In case we need to extend
        customTags: []
      },
      augmentsExtendsReplacesDocs: true
      // Todo: Figure out why this is not working and why seem to have to
      //    disable for all Markdown:
      /*
      baseConfig: {
        rules: {
          'no-multi-spaces': 'off'
        }
      }
      */
    }
  },
  overrides: [
    // Locales have no need for importing outside of SVG-Edit
    {
      files: [
        'editor/locale/lang.*.js', 'editor/extensions/ext-locale/**',
        'docs/tutorials/ExtensionDocs.md'
      ],
      rules: {
        'import/no-anonymous-default-export': ['off']
      }
    },
    // These browser files don't do importing or requiring
    {
      files: [
        'editor/svgpathseg.js', 'editor/touch.js', 'editor/typedefs.js',
        'editor/redirect-on-no-module-support.js',
        'editor/extensions/imagelib/index.js',
        'editor/external/dom-polyfill/dom-polyfill.js',
        'screencasts/svgopen2010/script.js'
      ],
      rules: {
        'import/unambiguous': ['off']
      }
    },
    {
      files: ['**/*.html', 'screencasts/**'],
      globals: {
        root: 'off'
      },
      settings: {
        polyfills: [
          'document.querySelector',
          'history',
          'history.pushState',
          'history.replaceState',
          'location.hash',
          'navigator',
          'Number.parseFloat',
          'Number.parseInt',
          'Number.isNaN'
        ]
      },
      rules: {
        'import/unambiguous': 'off'
      }
    },
    {
      files: ['.eslintrc.js', '.ncurc.js', 'tools/mochawesome-cli.js'],
      extends: [
        'ash-nazg/sauron-node-script'
      ]
    },
    // Our Markdown rules (and used for JSDoc examples as well, by way of
    //   our use of `jsdoc/check-examples` within `ash-nazg`)
    {
      files: ['**/*.md'],
      settings: {
        polyfills: [
          // Tutorials
          'console',
          'location.href'
        ]
      },
      rules: {
        // Todo: Figure out why this is not enough to disable warning
        //  for examples in my environment (but it is in others')
        // Used in examples of assert-close.js plugin
        'mocha-cleanup/no-assertions-outside-it': 'off',
        'eslint-comments/no-unused-disable': 'warn',

        'eol-last': ['off'],
        'no-console': ['off'],
        'no-undef': ['off'],
        'no-unused-vars': ['warn'],
        'padded-blocks': ['off'],
        'import/unambiguous': ['off'],
        'import/no-unresolved': ['off'],
        'node/no-missing-import': ['off'],
        'no-multi-spaces': 'off',
        'sonarjs/no-all-duplicated-branches': 'off',
        'node/no-unpublished-import': ['error', {
          allowModules: ['@cypress/fiddle']
        }],
        'no-alert': 'off',
        // Disable until may fix https://github.com/gajus/eslint-plugin-jsdoc/issues/211
        indent: 'off'
      }
    },
    // Dis-apply Node rules mistakenly giving errors with browser files,
    //  and treating Node global `root` as being present for shadowing
    {
      files: ['editor/**'],
      globals: {
        root: 'off'
      },
      settings: {
        polyfills: [
          // These are the primary polyfills needed by regular users if
          //  not present, e.g., with core-js-bundle; also those under
          //  extensions
          'Array.isArray',
          'Blob',
          'console',
          'CustomEvent',
          'document.body',
          'document.createElementNS',
          'document.evaluate',
          'document.head',
          'document.importNode',
          'document.querySelector',
          'document.querySelectorAll',
          'DOMParser',
          'Error',
          'FileReader',
          'JSON',
          'KeyboardEvent',
          'location.href',
          'location.origin',
          'MouseEvent',
          'MutationObserver',
          'navigator',
          'Number.isNaN',
          'Number.parseFloat',
          'Number.parseInt',
          'Object.assign',
          'Object.defineProperty',
          'Object.defineProperties',
          'Object.entries',
          'Object.getOwnPropertyDescriptor',
          'Object.keys',
          'Object.values',
          'Promise',
          'Promise.all',
          'Set',
          'Uint8Array',
          'URL',
          'URL.createObjectURL',
          'XMLSerializer',
          'XMLHttpRequest',
          'window.getComputedStyle',
          'window.parent',
          'window.scrollX',
          'window.scrollY'
        ]
      },
      rules: {
        // Should probably add this rule to ash-nazg as facilitates tree-shaking
        'import/no-namespace': ['error'],

        'node/no-unsupported-features/node-builtins': 'off'
      }
    },
    // For extensions, `this` is generally assigned to be the more
    //   descriptive `svgEditor`; they also have no need for importing outside
    //   of SVG-Edit
    {
      files: ['editor/extensions/**'],
      settings: {
        polyfills: [
          'console',
          'fetch',
          'location.origin',
          'Number.isNaN',
          'Number.parseFloat',
          'Number.parseInt',
          'window.postMessage'
        ]
      },
      rules: {
        'consistent-this': ['error', 'svgEditor'],
        'import/no-anonymous-default-export': ['off']
      }
    },
    {
      // Node files
      files: [
        'docs/jsdoc-config.js',
        'build/build-html.js',
        'rollup.config.js', 'rollup-config.config.js'
      ],
      env: {
        node: true
      },
      settings: {
        polyfills: [
          'console',
          'Promise.resolve'
        ]
      },
      globals: {
        require: true
      },
      rules: {
        // We can't put Rollup in npmignore or user can't get access,
        //  and we have too many modules to add to `peerDependencies`
        //  so this rule can know them to be available, so we instead
        //  disable
        'node/no-unpublished-import': 'off'
      }
    },
    {
      // As consumed by jsdoc, cannot be expressed as ESM
      files: ['docs/jsdoc-config.js'],
      parserOptions: {
        sourceType: 'script'
      },
      globals: {
        module: false
      },
      rules: {
        'import/no-commonjs': 'off',
        strict: 'off'
      }
    },
    {
      // Should probably have as external, but should still check
      files: ['canvg/rgbcolor.js'],
      settings: {
        polyfills: [
          'Number.isNaN',
          'Number.parseInt',
          'Object.assign',
          'Object.keys'
        ]
      }
    },
    {
      files: ['cypress/plugins/index.js'],
      extends: [
        'ash-nazg/sauron-node-script'
      ]
    },
    {
      files: ['cypress/**'],
      extends: [
        'plugin:cypress/recommended',
        'plugin:mocha/recommended',
        'plugin:mocha-cleanup/recommended-no-limits',
        'plugin:@fintechstudios/chai-as-promised/recommended',
        'plugin:chai-expect-keywords/recommended',
        'plugin:chai-expect/recommended',
        'plugin:chai-friendly/recommended'
      ],
      env: {
        node: true
      },
      settings: {
        polyfills: [
          'console',
          'Date.now',
          'document.body',
          'document.createElementNS',
          'document.head',
          'DOMParser',
          'Number.isNaN',
          'Object.keys',
          'Object.entries',
          'Promise'
        ]
      },
      rules: {
        // These errors are caused in Cypress files if user has not
        //  yet instrumented code; need to reinvestigate why we had to
        //  instrument separately from nyc mocha
        'import/no-unresolved': 'warn',
        'node/no-missing-import': 'warn',

        'chai-expect-keywords/no-unsupported-keywords': [
          'error', {
            allowChaiDOM: true
          }
        ],
        // Would be good but seems necessary due to some bugs in Cypress
        //  in detecting visibility
        // 'cypress/no-force': 0,
        // Good but would be difficult to enforce (and data-* may not be less
        //   brittle than IDs/classes anyways)
        // 'cypress/require-data-selectors': 0,
        'cypress/assertion-before-screenshot': 2,

        // Conflicts with Cypress `should`
        'mocha-cleanup/invalid-assertions': 0,

        // Might see about working around to avoid the option limitation,
        //  but convenient
        'mocha-cleanup/no-expressions-in-assertions': ['error', {
          replacementsOnly: true
        }],

        // Too oppressive when planning to extend a section
        'mocha/no-hooks-for-single-case': 0,

        // Would be good to enable but needs some refactoring
        'mocha/no-setup-in-describe': 0,
        'mocha-cleanup/no-outside-declaration': 0,

        // Useful to ensure allowing `this.timeout()`, etc., but a
        //  little oppressive
        'mocha/no-mocha-arrows': 0,
        // Useful if enabling the regular `prefer-arrow-callback`
        // 'mocha/prefer-arrow-callback': 2

        'jsdoc/require-jsdoc': 0,
        'no-console': 0,
        'import/unambiguous': 0
      }
    }
  ],
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
    // Override these `ash-nazg/sauron` rules which are difficult for us
    //   to apply at this time
    'unicorn/prefer-string-slice': 'off',
    'default-case': 'off',
    'require-unicode-regexp': 'off',
    'max-len': 'off', /* , {
      ignoreUrls: true,
      ignoreRegExpLiterals: true
    } */
    'unicorn/prefer-query-selector': 'off',
    'unicorn/prefer-node-append': 'off',
    'unicorn/no-zero-fractions': 'off',
    'unicorn/prefer-number-properties': 'off',
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

    // Disable for now
    'eslint-comments/require-description': 0
  }
};
