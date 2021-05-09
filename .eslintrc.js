"use strict";

module.exports = {
  extends: [
    "plugin:compat/recommended",
    "plugin:node/recommended",
    "plugin:no-unsanitized/DOM",
    "plugin:promise/recommended",
    "plugin:import/errors",
    "plugin:markdown/recommended",
    "plugin:sonarjs/recommended",
    "eslint:recommended"
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
  rules: {
    "node/no-unsupported-features/es-syntax": 0,
    "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "sonarjs/cognitive-complexity": ["warn", 40],
    "sonarjs/no-duplicate-string": 0,
  },
  overrides: [
    {
      files: [ 'cypress/**/*'],
      extends: [ 
        "plugin:cypress/recommended"
      ],
      env: {
        mocha: true,
        node: true
      },
      globals: {
        "assert": true
      },
      rules: {
        // with ci, instrumented is not created before linter
        "import/no-unresolved": [2, { ignore: ['instrumented'] }],
        "node/no-missing-import": 0
      }
    },
    {
      files: [ 'docs/**/*'],
      rules: { // md files have example that don't need a strict checking
        "no-undef": 0,
        "import/no-unresolved": 0,
        "node/no-missing-import": 0,
        "jsdoc/check-examples": [
          "warn",
          {
            rejectExampleCodeRegex: "^`",
            checkDefaults: true,
            checkParams: true,
            checkProperties: true
          }
        ]
      }
    }
  ]
};
