import {
  visitAndApproveStorage
} from '../../support/ui-test-helper.js';

describe('UI - Accessibility', function () {
  beforeEach(() => {
    visitAndApproveStorage();
    cy.injectAxe();
  });
  // https://www.npmjs.com/package/cypress-axe
  it.skip('Has no detectable a11y violations on load', () => {
    // Configure aXe and test the page at initial load
    cy.configureAxe({
      // Todo: Reenable when have time to fix
      // See https://www.deque.com/axe/axe-for-web/documentation/api-documentation/#user-content-parameters-1
      rules: [ {
        id: 'meta-viewport',
        enabled: false
      } ]
      /*
      branding: {
        brand: String,
        application: String
      },
      reporter: 'option',
      checks: [Object],
      rules: [Object],
      locale: Object
      */
    });
    cy.checkA11y(
      {},
      {
        rules: {
          'label-title-only': { enabled: false },
          'page-has-heading-one': { enabled: false },
          region: { enabled: false },
          'scrollable-region-focusable': { enabled: false }
        }
      }
    );
  });
});
