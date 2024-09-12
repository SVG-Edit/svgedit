import {
  visitAndApproveStorage
} from '../../support/ui-test-helper.js'

describe('use path tools of svg-edit', { testIsolation: false }, function () {
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
  it('check tool_path', function () {
    cy.get('#tool_path')
      .click({ force: true })
    cy.get('#svgcontent')
      .trigger('mousedown', 50, 50, { force: true })
      .trigger('mouseup', { force: true })
      .trigger('mousemove', 100, 50, { force: true })
      .trigger('mousedown', 100, 50, { force: true })
      .trigger('mouseup', { force: true })
      .trigger('mousemove', 75, 150, { force: true })
      .trigger('mousedown', 75, 150, { force: true })
      .trigger('mouseup', { force: true })
      .trigger('mousemove', 0, 0, { force: true })
      .trigger('mousedown', 0, 0, { force: true })
      .trigger('mouseup', { force: true })
    cy.svgSnapshot()
  })
  it('check tool_path_change_node_xy', function () {
    cy.get('#svg_1').click({ force: true })
    cy.get('#svg_1').dblclick({ force: true })
    for (let n = 0; n < 25; n++) {
      cy.get('#path_node_x').shadow().find('elix-number-spin-box').eq(0).shadow().find('#upButton').eq(0)
        .click({ force: true })
    }
    for (let n = 0; n < 25; n++) {
      cy.get('#path_node_y').shadow().find('elix-number-spin-box').eq(0).shadow().find('#upButton').eq(0)
        .click({ force: true })
    }
    cy.svgSnapshot()
  })
  it('check tool_path_change_seg_type', function () {
    // cy.get('#svg_1').click({ force: true })
    cy.get('#svg_1').dblclick({ force: true })
    cy.get('#seg_type').shadow().find('select').select('6', { force: true }).should('have.value', '6')
    cy.get('#ctrlpointgrip_3c1')
      .trigger('mousedown', { force: true })
      .trigger('mousemove', 130, 175, { force: true })
      .trigger('mouseup', { force: true })
    cy.svgSnapshot()
  })
  it('check tool_path_change_clone_node', function () {
    // cy.get('#svg_1').click({ force: true })
    cy.get('#svg_1').dblclick({ force: true })
    cy.get('#tool_node_clone').click({ force: true })
    cy.get('#pathpointgrip_4')
      .trigger('mousedown', { force: true })
      .trigger('mousemove', 130, 175, { force: true })
      .trigger('mouseup', { force: true })
    cy.svgSnapshot()
  })
  it('check tool_path_openclose', function () {
    cy.get('#tool_select').click({ force: true })
    cy.get('#svg_1').click({ force: true })
    cy.get('#svg_1').dblclick({ force: true })
    cy.get('#tool_openclose_path').click({ force: true })
    cy.svgSnapshot()
  })
  /* it('check tool_path_add_subpath', function () {
    cy.get('#tool_add_subpath').click({ force: true });
    cy.get('#svgcontent')
      .trigger('mousedown', 0, 0, { force: true })
      .trigger('mouseup', { force: true })
      .trigger('mousemove', 100, 50, { force: true })
      .trigger('mousedown', 100, 50, { force: true })
      .trigger('mouseup', { force: true })
      .trigger('mousemove', 75, 150, { force: true })
      .trigger('mousedown', 75, 150, { force: true })
      .trigger('mouseup', { force: true })
      .trigger('mousemove', 0, 0, { force: true })
      .trigger('mousedown', 0, 0, { force: true })
      .trigger('mouseup', { force: true });
    cy.get('#tool_select').click({ force: true });
    cy.svgSnapshot();
  }); */
})
