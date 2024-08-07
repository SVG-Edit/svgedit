import {
  visitAndApproveStorage
} from '../../../support/ui-test-helper.js'

// See https://github.com/SVG-Edit/svgedit/issues/726
describe('Fix issue 726', function () {
  beforeEach(() => {
    visitAndApproveStorage()
  })

  it('Send forward and send backward should move one layer at a time', function () {
    cy.get('#tool_rect')
      .click({ force: true })
    cy.get('#svgcontent')
      .trigger('mousedown', 250, 250, { force: true })
      .trigger('mousemove', 350, 350, { force: true })
      .trigger('mouseup', { force: true })
    cy.wait(300)
    cy.get('#tool_rect')
      .click({ force: true })
    cy.get('#svgcontent')
      .trigger('mousedown', 10, 0, { force: true })
      .trigger('mousemove', 100, 100, { force: true })
      .trigger('mouseup', { force: true })
    cy.wait(300)
    cy.get('#tool_rect')
      .click({ force: true })
    cy.get('#svgcontent')
      .trigger('mousedown', 10, 10, { force: true })
      .trigger('mousemove', 100, 100, { force: true })
      .trigger('mouseup', { force: true })
    cy.wait(300)
    cy.get('#svg_3')
      .rightclick(0, 0, { force: true })
    cy.get('a:contains("Send Backward")').click({ force: true })
    cy.get('#svg_2').should(($div) => {
      const id = $div[0].previousElementSibling.id
      assert.equal(id, 'svg_3')
    })
  })
})
