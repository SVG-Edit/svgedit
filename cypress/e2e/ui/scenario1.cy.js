import {
  visitAndApproveStorage
} from '../../support/ui-test-helper.js'

describe('check tool shape and image of svg-edit', { testIsolation: false }, function () {
  before(() => {
    visitAndApproveStorage()
  })

  it('check tool_source_set', function () {
    cy.get('#tool_source').click({ force: true })
    cy.get('#svg_source_textarea')
      .type('{selectall}', { force: true })
      .type(`<svg width="640" height="480" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg">
      <g class="layer">
       <title>Layer 1</title>
       </g>
     </svg>`, { force: true, parseSpecialCharSequences: false })
    cy.get('#tool_source_save').click({ force: true })
    cy.svgSnapshot()
  })
  it('check tool_shape', function () {
    cy.get('#tool_shapelib').shadow().find('.overall').eq(0).click({ force: true })
    cy.get('[data-shape="heart"]').click({ force: true })
    cy.get('#svgroot')
      .trigger('mousemove', { clientX: 400, clientY: 400, force: true })
      .trigger('mousedown', { clientX: 400, clientY: 400, force: true })
      .trigger('mousemove', { clientX: 20, clientY: 20, force: true })
      .trigger('mouseup', { force: true })
    cy.get('#selectorGrip_rotate')
      .trigger('mousedown', { force: true })
      .trigger('mousemove', { clientX: 20, clientY: 20, force: true })
      .trigger('mouseup', { force: true })
    // issue with snapshot not being consistent on CI/Interactive
    // cy.svgSnapshot()
    // so we use typical DOM tests to validate
    cy.get('#svg_1').should('have.attr', 'd')

    // cy.get('#a_text').should('have.attr', 'transform')
    //  .and('equal', 'matrix(1 0 0 4.54639 0 -540.825)') // Chrome 96 is matrix(1 0 0 4.17431 0 -325.367)
  })
  it('check tool_image', function () {
    cy.get('#tool_image').click({ force: true })
    cy.get('#svgroot')
      .trigger('mousedown', { clientX: 100, clientY: 100, force: true })
      .trigger('mousemove', { clientX: 120, clientY: 120, force: true })
      .trigger('mouseup', { force: true })
    // eslint-disable-next-line promise/catch-or-return
    cy.window()
      // eslint-disable-next-line promise/always-return
      .then(($win) => {
        cy.stub($win, 'prompt').returns('./images/logo.svg')
        cy.contains('OK')
      })
    // issue with snapshot not being consistent on CI/Interactive
    // cy.svgSnapshot()
    // so we use typical DOM tests to validate
    cy.get('#svg_2').should('have.attr', 'href').and('equal', './images/logo.svg')
  })
})
