import {
  visitAndApproveStorage
} from '../../../support/ui-test-helper.js'

// See https://github.com/SVG-Edit/svgedit/issues/752
describe('Fix issue 752', function () {
  beforeEach(() => {
    visitAndApproveStorage()
  })

  it('Moving an unsnapped shape will not cause selector box misalignment', function () {
    cy.get('#tool_rect')
      .click({ force: true })
    cy.get('#svgcontent')
      .trigger('mousedown', 12, 12, { force: true })
      .trigger('mousemove', 99, 99, { force: true })
      .trigger('mouseup', { force: true })
    cy.wait(300)
    cy.get('#svg_1')
      .click({ force: true })
    cy.get('#tool_editor_prefs')
      .click({ force: true })
    cy.get('#grid_snapping_step')
      .then(elem => {
        elem.val('35')
      })
    cy.wait(300)
    cy.get('#grid_snapping_on')
      .click({ force: true })
    cy.get('#tool_prefs_save')
      .click({ force: true })
    cy.get('#svg_1')
      .trigger('mousedown', 20, 20, { force: true })
      .trigger('mousemove', 203, 205, { force: true })
      .trigger('mouseup', { force: true })

    cy.get('#selectedBox0').should('have.attr', 'd', 'M174,174 L246,174 246,246 174,246z')
  })
})
