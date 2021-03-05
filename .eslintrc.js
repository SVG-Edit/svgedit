"use strict";

module.exports = {
  extends: [
    "plugin:compat/recommended",
    "plugin:node/recommended",
    "plugin:no-unsanitized/DOM",
    "plugin:promise/recommended",
    "plugin:import/errors",
    "plugin:markdown/recommended",
    "plugin:sonarjs/recommended"
  ],
  plugins: ["jsdoc", "promise", "html", "import", "sonarjs"],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module"
  },
  env: {
    browser: true,
    es6: true
  },
  settings: {
    polyfills: [
      // These are the primary polyfills needed by regular users if
      //  not present, e.g., with core-js-bundle; also those under
      //  extensions
      "fetch",
      "Promise",
      "Promise.all",
      // 'Set',
      "Uint8Array",
      "URL"
    ]
  },
  rules: {
    // check-examples is not picking up eslint config properly in some
    //  environments; see also discussion above
    //  `mocha-cleanup/no-assertions-outside-it`
   "sonarjs/cognitive-complexity": 0,
   "sonarjs/no-duplicate-string": 0,
   "sonarjs/no-collapsible-if": 0,
   "sonarjs/no-small-switch": 0,
   "sonarjs/no-identical-functions": 0,
   "sonarjs/no-duplicated-branches": 0,

    "jsdoc/check-examples": [
      "warn",
      {
        rejectExampleCodeRegex: "^`",
        checkDefaults: true,
        checkParams: true,
        checkProperties: true
      }
    ],
    // The Babel transform seems to have a problem converting these
    "prefer-named-capture-group": "off",
    "jsdoc/require-file-overview": [
      "error",
      {
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
      }
    ],
    // Warning or Off for now but should be reviewed
    // Override these rules which are difficult for us
    //   to apply at this time
    "default-case": "off",
    "require-unicode-regexp": "off",
    "max-len": ["warn", { ignoreComments: true, code: 130 }], // 130 is too much but too many occurences
    "eslint-comments/require-description": "off",
    "compat/compat": "error",
    "consistent-this": "off",
    "import/no-anonymous-default-export": "off",
    "node/no-unsupported-features/node-builtins": "warn",
    "prefer-exponentiation-operator": "warn",
    "node/no-unsupported-features/es-syntax": "off",
    "no-unsanitized/method": [
      "error",
      {
        escape: {
          methods: ["encodeURIComponent", "encodeURI"]
        }
      }
    ]
  },
  overrides: [
    // Locales have no need for importing outside of SVG-Edit
    // and translations may need a longer line length
    {
      files: [
        'src/editor/locale/lang.*.js', 
        'src/editor/extensions/*/locale/**',
        'docs/tutorials/ExtensionDocs.md/*.js'
      ],
      rules: {
        "import/no-anonymous-default-export": "off",
        "max-len": "off",
        "node/no-missing-import": "off",
        "import/no-unresolved": "off"
      }
    },
    // These browser files don't do importing or requiring
    {
      files: [
        "src/editor/touch.js",
        "src/editor/typedefs.js",
        "src/editor/redirect-on-no-module-support.js",
        "src/editor/extensions/ext-imagelib/index.js",
        "screencasts/svgopen2010/script.js"
      ],
      rules: {
        "import/unambiguous": ["off"]
      }
    },
    {
      files: ["**/*.html", "screencasts/**"],
      globals: {
        root: "off"
      },
      settings: {
        polyfills: [
          "document.querySelector",
          "history",
          "history.pushState",
          "history.replaceState",
          "location.hash",
          "navigator",
          "Number.parseFloat",
          "Number.parseInt",
          "Number.isNaN"
        ]
      },
      rules: {
        "import/unambiguous": "off"
      }
    },
    {
      // As consumed by jsdoc, cannot be expressed as ESM
      files: ["docs/jsdoc-config.js"],
      parserOptions: {
        sourceType: "script"
      },
      globals: {
        module: false
      },
      rules: {
        "import/no-commonjs": "off",
        strict: "off"
      }
    },
    {
      files: ["cypress/**"],
      extends: [
        "plugin:cypress/recommended",
        "plugin:mocha/recommended",
        "plugin:mocha-cleanup/recommended-no-limits",
        "plugin:@fintechstudios/chai-as-promised/recommended",
        "plugin:chai-expect-keywords/recommended",
        "plugin:chai-expect/recommended",
        "plugin:chai-friendly/recommended"
      ],
      env: {
        node: true
      },
      settings: {
        polyfills: [
          "console",
          "Date.now",
          "document.body",
          "document.createElementNS",
          "document.head",
          "DOMParser",
          "Number.isNaN",
          "Object.keys",
          "Object.entries",
          "Promise"
        ]
      },
      rules: {
        // These errors are caused in Cypress files if user has not
        //  yet instrumented code; need to reinvestigate why we had to
        //  instrument separately from nyc mocha
        "import/no-unresolved": ["error", { ignore: ["/instrumented/"] }],
        "node/no-missing-import": "off",
        "jsdoc/check-examples": "off",
        "chai-expect-keywords/no-unsupported-keywords": [
          "error",
          {
            allowChaiDOM: true
          }
        ],
        // Would be good but seems necessary due to some bugs in Cypress
        //  in detecting visibility
        // 'cypress/no-force': 0,
        // Good but would be difficult to enforce (and data-* may not be less
        //   brittle than IDs/classes anyways)
        // 'cypress/require-data-selectors': 0,
        "cypress/assertion-before-screenshot": 2,

        // Conflicts with Cypress `should`
        "mocha-cleanup/invalid-assertions": 0,

        // Might see about working around to avoid the option limitation,
        //  but convenient
        "mocha-cleanup/no-expressions-in-assertions": [
          "error",
          {
            replacementsOnly: true
          }
        ],

        // Too oppressive when planning to extend a section
        "mocha/no-hooks-for-single-case": 0,

        // Would be good to enable but needs some refactoring
        "mocha/no-setup-in-describe": 0,
        "mocha-cleanup/no-outside-declaration": 0,

        // Useful to ensure allowing `this.timeout()`, etc., but a
        //  little oppressive
        "mocha/no-mocha-arrows": 0,
        // Useful if enabling the regular `prefer-arrow-callback`
        // 'mocha/prefer-arrow-callback': 2

        "jsdoc/require-jsdoc": 0,
        "no-console": 0,
        "import/unambiguous": 0
      }
    },
    {
      // Node files
      files: [
        "docs/jsdoc-config.js",
        "build/build-html.js",
        "rollup.config.js",
        "rollup-config.config.js"
      ],
      env: {
        node: true
      },
      settings: {
        polyfills: ["console", "Promise.resolve"]
      },
      globals: {
        require: true
      },
      rules: {
        // We can't put Rollup in npmignore or user can't get access,
        //  and we have too many modules to add to `peerDependencies`
        //  so this rule can know them to be available, so we instead
        //  disable
        "node/no-unpublished-import": "off"
      }
    }
  ]
};