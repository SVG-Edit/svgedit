import {
  visitAndApproveStorage
} from '../../support/ui-test-helper.js';

describe('UI - Tool selection', function () {
  beforeEach(() => {
    visitAndApproveStorage();
  });

  it('should set rectangle selection by click', function () {
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get('#tools_rect_show')
      .trigger('mousedown', {force: true})
      .wait(100) // this delay seems necessary
      .trigger('mouseup', {force: true})
      .should((button) => {
        expect(button).to.have.class('tool_button_current');
      });
  });
});
