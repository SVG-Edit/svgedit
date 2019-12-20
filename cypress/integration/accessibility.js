describe('Accessibility', function () {
  beforeEach(() => {
    cy.visit('/instrumented/svg-editor-es.html');
    cy.injectAxe();
  });

  // https://www.npmjs.com/package/cypress-axe
  it('Has no detectable a11y violations on load', () => {
    // Configure aXe and test the page at initial load
    cy.configureAxe({
      // Todo: Reenable when have time to fix
      // See https://www.deque.com/axe/axe-for-web/documentation/api-documentation/#user-content-parameters-1
      rules: [{
        id: 'meta-viewport',
        enabled: false
      }]
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
    cy.checkA11y();
  });
});
