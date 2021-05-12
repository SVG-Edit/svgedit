import {
  visitAndApproveStorage
} from '../../support/ui-test-helper.js';

describe('UI - Tool selection', function () {
  beforeEach(() => {
    visitAndApproveStorage();
  });

  it('should set rectangle selection by click', function () {
    cy.get('#tools_rect')
      .should('not.have.attr', 'pressed');
    cy.get('#tools_rect')
      .trigger('click', { force: true })
      .should('have.attr', 'pressed');
  });
});
