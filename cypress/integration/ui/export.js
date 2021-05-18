import {
  visitAndApproveStorage, openMainMenu
} from '../../support/ui-test-helper.js';

describe('UI - Export tests', function () {
  beforeEach(() => {
    visitAndApproveStorage();
  });

  it('Editor - No parameters: Has export button', () => {
    openMainMenu();
    cy.get('#tool_export');
  });

  it('Editor - No parameters: Export button clicking; dialog opens', () => {
    openMainMenu();
    cy.get('#tool_export').click({ force: true });
    cy.get('#dialog_content select');
  });
});
