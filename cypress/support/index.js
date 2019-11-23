// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands.js';

// Alternatively you can use CommonJS syntax:
// require('./commands')

/**
 * FIDDLE
 * Adds "cy.runExample()" custom command
 * Accets test object property (or array thereof):
 *    Required: `test`
 *    Optional: `html`, `name`, `description`
 *    With `testExamples` only: `skip` and `only`
 * @see https://github.com/cypress-io/cypress-fiddle
 * @example import {testExamples} from '@cypress/fiddle';
 */
import '@cypress/fiddle';

/**
 * COVERAGE
 * @see https://docs.cypress.io/guides/tooling/code-coverage.html#Install-the-plugin
 */
import '@cypress/code-coverage/support.js';

/**
 * ACCESSIBILITY
 * @see https://www.npmjs.com/package/cypress-axe
 */
import 'cypress-axe';
