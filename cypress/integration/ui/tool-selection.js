import {
  visitAndApproveStorage
} from '../../support/ui-test-helper.js';

describe('UI - Tool selection', function () {
  beforeEach(() => {
    visitAndApproveStorage();
  });

  it('should set rectangle selection by click', function () {
    cy.get('#tools_rect_show')
      .trigger('mousedown', {force: true})
      .trigger('mouseup', {force: true, timeout: 10000})
      .should((button) => {
        expect(button).to.have.class('tool_button_current');
      });
  });
});
