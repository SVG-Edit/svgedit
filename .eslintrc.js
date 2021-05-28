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
  plugins: [ "jsdoc", "promise", "html", "import", "sonarjs" ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module"
  },
  env: {
    browser: true,
    es6: true
  },
  rules: {
    /** @todo len should probably more 120-150 */
    "max-len": [ "warn", { "code": 250 } ],
    "indent": [ "error", 2 ],
    "no-var": "error",
    /** @todo jsdoc should be made warn or error */
    "valid-jsdoc": "off",
    /** @todo cognitive complexity should be much lower (25-50?) */
    "sonarjs/cognitive-complexity": [ "warn", 200 ],
    /** @todo no param reassign creates too many warnings but should be a warning */
    "no-param-reassign": "off",
    "node/no-unsupported-features/es-syntax": 0,
    "no-unused-vars": [ "error", { "argsIgnorePattern": "^_" } ],
    "sonarjs/no-duplicate-string": 0,
    "semi" : "error",
    "no-trailing-spaces": "error",
    "array-bracket-spacing": [ "error", "always" ],
    "comma-spacing": "error",
    "object-curly-spacing": [ "error", "always" ],
    "no-console": [
      "warn",
      { "allow": [ "warn", "error", "info", "table" ] }
    ],
    "arrow-parens": [ "error", "always" ],
  },
  overrides: [
    {
      files: [ 'cypress/**/*' ],
      extends: [
        "plugin:cypress/recommended"
      ],
      env: {
        mocha: true,
        node: true
      },
      globals: { "assert": true },
      rules: {
        // with ci, instrumented is not created before linter
        "import/no-unresolved": [ 2, { ignore: [ 'instrumented' ] } ],
        "node/no-missing-import": 0
      }
    },
    {
      files: [ 'docs/**/*' ],
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
    },
    {
      files: [ 'src/editor/locale/*.js' ],
      rules: { // lang files may have long length
        "max-len": "off",
      }
    }
  ]
};
