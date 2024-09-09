import {
  visitAndApproveStorage
} from '../../support/ui-test-helper.js'

describe('use rect/square tools of svg-edit', { testIsolation: false }, function () {
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
  it('check tool_rect', function () {
    cy.get('#tool_rect')
      .click({ force: true })
    cy.get('#svgcontent')
      .trigger('mousedown', 150, 150, { force: true })
      .trigger('mousemove', 250, 200, { force: true })
      .trigger('mouseup', { force: true })
    cy.svgSnapshot()
  })
  it('check tool_fhrect', function () {
    cy.get('#tool_fhrect')
      .click({ force: true })
    cy.get('#svgcontent')
      .trigger('mousedown', 200, 80, { force: true })
      .trigger('mousemove', 320, 80, { force: true })
      .trigger('mousemove', 320, 180, { force: true })
      .trigger('mousemove', 200, 180, { force: true })
      .trigger('mousemove', 200, 80, { force: true })
      .trigger('mouseup', 200, 80, { force: true })
    cy.svgSnapshot()
  })
  it('check tool_square', function () {
    cy.get('#tool_square').click({ force: true })
    cy.get('#svgcontent')
      .trigger('mousedown', 75, 150, { force: true })
      .trigger('mousemove', 125, 200, { force: true })
      .trigger('mouseup', { force: true })
    cy.svgSnapshot()
  })
  it('check tool_rect_change_fill_color', function () {
    cy.get('#svg_1').click({ force: true })
    cy.get('#js-se-palette').find('.square').eq(8)
      .click({ force: true })
    cy.svgSnapshot()
  })
  it('check tool_rect_change_rotation', function () {
    cy.get('#svg_1').click({ force: true })
    for (let n = 0; n < 5; n++) {
      cy.get('#angle').shadow().find('elix-number-spin-box').eq(0).shadow().find('#upButton').eq(0)
        .click({ force: true })
    }
    cy.svgSnapshot()
  })
  it('check tool_rect_change_blur', function () {
    cy.get('#svg_1').click({ force: true })
    for (let n = 0; n < 10; n++) {
      cy.get('#blur').shadow().find('elix-number-spin-box').eq(0).shadow().find('#upButton').eq(0)
        .click({ force: true })
    }
    cy.svgSnapshot()
  })
  it('check tool_rect_change_opacity', function () {
    cy.get('#svg_1').click({ force: true })
    for (let n = 0; n < 10; n++) {
      cy.get('#opacity').shadow().find('elix-number-spin-box').eq(0).shadow().find('#downButton').eq(0)
        .click({ force: true })
    }
    cy.svgSnapshot()
  })
  it('check tool_fhrect_change_x_y_coordinate', function () {
    cy.get('#svg_2').click({ force: true })
    for (let n = 0; n < 25; n++) {
      cy.get('#selected_x').shadow().find('elix-number-spin-box').eq(0).shadow().find('#upButton').eq(0)
        .click({ force: true })
    }
    for (let n = 0; n < 25; n++) {
      cy.get('#selected_y').shadow().find('elix-number-spin-box').eq(0).shadow().find('#upButton').eq(0)
        .click({ force: true })
    }
    cy.svgSnapshot()
  })
  it('check tool_fhrect_change_width_height', function () {
    cy.get('#svg_2').click({ force: true })
    for (let n = 0; n < 25; n++) {
      cy.get('#rect_width').shadow().find('elix-number-spin-box').eq(0).shadow().find('#upButton').eq(0)
        .click({ force: true })
    }
    for (let n = 0; n < 25; n++) {
      cy.get('#rect_height').shadow().find('elix-number-spin-box').eq(0).shadow().find('#upButton').eq(0)
        .click({ force: true })
    }
    cy.svgSnapshot()
  })
  it('check tool_square_clone', function () {
    cy.get('#svg_3').click({ force: true })
    cy.get('#tool_clone').click({ force: true })
    cy.svgSnapshot()
  })
  it('check tool_square_bring_to_back', function () {
    cy.get('#svg_3').click({ force: true })
    cy.get('#tool_move_bottom').click({ force: true })
    cy.svgSnapshot()
  })
  it('check tool_square_bring_to_front', function () {
    cy.get('#svg_3').click({ force: true })
    cy.get('#tool_move_top').click({ force: true })
    cy.svgSnapshot()
  })
  it('check tool_square_change_corner_radius', function () {
    cy.get('#svg_4').click({ force: true })
    for (let n = 0; n < 25; n++) {
      cy.get('#rect_rx').shadow().find('elix-number-spin-box').eq(0).shadow().find('#upButton').eq(0)
        .click({ force: true })
    }
    cy.svgSnapshot()
  })
  it('check tool_rect_change_to_path', function () {
    cy.get('#svg_2').click({ force: true })
    cy.get('#tool_topath').click({ force: true })
    cy.svgSnapshot()
  })
  it('check tool_rect_delete', function () {
    cy.get('#svg_1').click({ force: true })
    cy.get('#tool_delete').click({ force: true })
    cy.get('#svg_3').click({ force: true })
    cy.get('#tool_delete').click({ force: true })
    cy.svgSnapshot()
  })
  it('check tool_rect_change_class', function () {
    cy.get('#svg_2').click({ force: true })
    cy.get('#elem_class').shadow().find('elix-input').eq(0).shadow().find('#inner').eq(0)
      .type('svg_2_class{enter}', { force: true })
    cy.get('#svg_2')
      .should('satisfy', ($el) => {
        const classList = Array.from($el[0].classList)
        return classList.includes('svg_2_class')
      })
  })
  it('check tool_rect_change_id', function () {
    cy.get('#svg_2').click({ force: true }).click({ force: true })
    cy.get('#elem_id').shadow().find('elix-input').eq(0).shadow().find('#inner').eq(0)
      .type('_id{enter}', { force: true })
    cy.get('#svg_2_id')
      .should('satisfy', ($el) => {
        const classList = Array.from($el[0].classList)
        return classList.includes('svg_2_class')
      })
  })
})
