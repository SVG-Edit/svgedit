module.exports = {
  extends: ["ash-nazg/sauron-node"],
  parserOptions: {
    sourceType: "module"
  },
  env: {
    browser: true
  },
  settings: {
    polyfills: [
      "Array.isArray",
      "Blob",
      "console",
      "Date.now",
      "document.body",
      "document.evaluate",
      "document.head",
      "document.importNode",
      "document.querySelector", "document.querySelectorAll",
      "DOMParser",
      "Error",
      "fetch",
      "FileReader",
      "history.pushState",
      "history.replaceState",
      "JSON",
      "location.href",
      "location.origin",
      "MutationObserver",
      "Object.assign", "Object.defineProperty", "Object.defineProperties",
      "Object.getOwnPropertyDescriptor",
      "Object.entries", "Object.keys", "Object.values",
      "Promise",
      "Set",
      "Uint8Array",
      "URL",
      "window.getComputedStyle",
      "window.postMessage",
      "window.scrollX", "window.scrollY",
      "XMLHttpRequest",
      "XMLSerializer"
    ],
    jsdoc: {
      additionalTagNames: {
        // In case we need to extend
        customTags: []
      },
      augmentsExtendsReplacesDocs: true,
      // Todo: Figure out why this is not working and why seem to have to
      //    disable for all Markdown:
      /*
      baseConfig: {
        rules: {
          "no-multi-spaces": "off"
        }
      }
      */
    }
  },
  overrides: [
    // Locales have no need for importing outside of SVG-Edit
    {
      files: [
        "editor/locale/lang.*.js", "editor/extensions/ext-locale/**",
        "docs/tutorials/ExtensionDocs.md"
      ],
      rules: {
        "import/no-anonymous-default-export": ["off"]
      }
    },
    // For extensions, `this` is generally assigned to be the more
    //   descriptive `svgEditor`; they also have no need for importing outside
    //   of SVG-Edit
    {
      files: ["editor/extensions/**/ext-*.js"],
      rules: {
        "consistent-this": ["error", "svgEditor"],
        "import/no-anonymous-default-export": ["off"]
      }
    },
    // These browser files don't do importing or requiring
    {
      files: [
        "editor/svgpathseg.js", "editor/touch.js", "editor/typedefs.js",
        "editor/redirect-on-no-module-support.js",
        "editor/extensions/imagelib/index.js",
        "editor/external/dom-polyfill/dom-polyfill.js",
        "screencasts/svgopen2010/script.js",
        "opera-widget/handlers.js",
        "firefox-extension/handlers.js",
        "firefox-extension/content/svg-edit-overlay.js"
      ],
      rules: {
        "import/unambiguous": ["off"]
      }
    },
    {
      files: ['**/*.html'],
      rules: {
        'import/unambiguous': 'off'
      }
    },
    // Our Markdown rules (and used for JSDoc examples as well, by way of
    //   our use of `matchingFileName` in conjunction with
    //   `jsdoc/check-examples` within `ash-nazg`)
    {
      files: ["**/*.md"],
      rules: {
        "eol-last": ["off"],
        "no-console": ["off"],
        "no-undef": ["off"],
        "no-unused-vars": ["warn"],
        "padded-blocks": ["off"],
        "import/unambiguous": ["off"],
        "import/no-unresolved": ["off"],
        "node/no-missing-import": ["off"],
        "no-multi-spaces": "off",
        "sonarjs/no-all-duplicated-branches": "off",
        'node/no-unpublished-import': ['error', {allowModules: ['@cypress/fiddle']}],
        "no-alert": "off",
        // Disable until may fix https://github.com/gajus/eslint-plugin-jsdoc/issues/211
        "indent": "off"
      }
    },
    // Dis-apply Node rules mistakenly giving errors with browser files,
    //  and treating Node global `root` as being present for shadowing
    {
      files: ["editor/**", "screencasts/**"],
      globals: {
        root: "off"
      },
      rules: {
        "node/no-unsupported-features/node-builtins": "off"
      }
    },
    {
      // Node files
      files: [
        "docs/jsdoc-config.js",
        "build-html.js",
        "rollup.config.js", "rollup-config.config.js"
      ],
      env: {
        node: true,
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
    },
    {
      // As consumed by jsdoc, cannot be expressed as ESM
      files: ["docs/jsdoc-config.js"],
      parserOptions: {
        sourceType: "script"
      },
      globals: {
        "module": false
      },
      rules: {
        "import/no-commonjs": "off",
        "strict": "off"
      }
    },
    {
      extends: ['plugin:node/recommended-script'],
      files: ['cypress/support/build-coverage-badge.js']
    },
    {
      files: ["cypress/**"],
      extends: ["plugin:cypress/recommended"],
      env: {
        node: true
      },
      rules: {
        'no-console': 0,
        'import/unambiguous': 0,
      }
    }
  ],
  rules: {
    // https://github.com/sindresorhus/eslint-plugin-unicorn/issues/453
    "unicorn/regex-shorthand": 0,
    // The Babel transform seems to have a problem converting these
    "prefer-named-capture-group": "off",
    // Override these `ash-nazg/sauron` rules which are difficult for us
    //   to apply at this time
    "unicorn/prefer-string-slice": "off",
    "default-case": "off",
    "require-unicode-regexp": "off",
    "max-len": ["off", {
      ignoreUrls: true,
      ignoreRegExpLiterals: true
    }],
    "unicorn/prefer-query-selector": "off",
    "unicorn/prefer-node-append": "off",
    "unicorn/no-zero-fractions": "off"
  }
};
