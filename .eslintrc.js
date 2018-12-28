module.exports = {
  extends: [
    "ash-nazg/sauron-node",
    "plugin:qunit/recommended", "plugin:testcafe/recommended"
  ],
  parserOptions: {
    sourceType: "module"
  },
  // Need to make explicit here for processing by jsdoc/check-examples
  plugins: ["qunit"],
  env: {
    browser: true
  },
  settings: {
    polyfills: ["url", "promises", "fetch", "queryselector"],
    jsdoc: {
      additionalTagNames: {
        // In case we need to extend
        customTags: []
      },
      tagNamePreference: {
        arg: "param",
        return: "returns"
      },
      allowOverrideWithoutParam: true,
      allowImplementsWithoutParam: true,
      allowAugmentsExtendsWithoutParam: true,
      // For `jsdoc/check-examples` in `ash-nazg`
      matchingFileName: "dummy.md",
      rejectExampleCodeRegex: "^`",
    }
  },
  overrides: [
    // These would otherwise currently break because of these issues:
    //  1. `event:` https://github.com/eslint/doctrine/issues/221 and https://github.com/Kuniwak/jsdoctypeparser/pull/49 with https://github.com/Kuniwak/jsdoctypeparser/issues/47
    //  1. `@implements`/`@augments`/`@extends`/`@override`: https://github.com/eslint/doctrine/issues/222
    {
      files: [
        "test/utilities_test.js", "editor/svg-editor.js", "editor/svgcanvas.js",
        "editor/coords.js",
        "editor/extensions/ext-eyedropper.js", "editor/extensions/ext-webappfind.js"
      ],
      rules: {
        "jsdoc/valid-types": "off",
        "valid-jsdoc": "off"
      }
    },
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
        "test/all_tests.js", "screencasts/svgopen2010/script.js",
        "opera-widget/handlers.js",
        "firefox-extension/handlers.js",
        "firefox-extension/content/svg-edit-overlay.js"
      ],
      rules: {
        "import/unambiguous": ["off"]
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
        "node/no-missing-import": ["off"]
      }
    },
    // Dis-apply Node rules mistakenly giving errors with browser files
    {
      files: ["editor/**", "test/**"],
      rules: {
        "node/no-unsupported-features/node-builtins": ["off"]
      }
    },
    // We want console in tests!
    {
      files: ["test/**"],
      rules: {
        "no-console": ["off"]
      }
    },
    {
      // Node files
      files: [
        "docs/jsdoc-config.js",
        "build-html.js", "jsdoc-check-overly-generic-types.js",
        "rollup.config.js", "rollup-config.config.js"
      ],
      env: {
        node: true,
      },
      rules: {
        "node/no-unpublished-import": ["off"],
        "node/no-unsupported-features/es-syntax": ["off"]
      }
    },
    {
      // As consumed by jsdoc, cannot be expressed as ESM
      files: ["docs/jsdoc-config.js"],
      parserOptions: {
        sourceType: "script"
      },
      rules: {
        "import/no-commonjs": "off"
      }
    }
  ],
  rules: {
    // Override these `ash-nazg/sauron` rules which are difficult for us
    //   to apply at this time
    "default-case": ["off"],
    "require-unicode-regexp": ["off"],
    "max-len": ["off", {
      ignoreUrls: true,
      ignoreRegExpLiterals: true
    }]
  }
};
