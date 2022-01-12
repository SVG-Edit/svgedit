import {
  visitAndApproveStorage
} from '../../../support/ui-test-helper.js'

// See https://github.com/SVG-Edit/svgedit/issues/699
describe('Fix issue 699', function () {
  beforeEach(() => {
    visitAndApproveStorage()
  })

  it('should not throw error when undoing and redoing convert to path for a rectangle', function () {
    cy.get('#tool_rect')
      .click({ force: true })
    cy.get('#svgcontent')
      .trigger('mousedown', 150, 150, { force: true })
      .trigger('mousemove', 250, 200, { force: true })
      .trigger('mouseup', { force: true })
    cy.get('#tool_topath') // Check if undo redo is correct for tool_topath with tool_rect
      .click({ force: true })
    cy.get('#tool_undo')
      .click({ force: true })
    cy.get('#tool_redo')
      .click({ force: true })
    cy.get('#tool_undo') // Do twice just to make sure
      .click({ force: true })
    cy.get('#tool_redo')
      .click({ force: true })
  })
})
