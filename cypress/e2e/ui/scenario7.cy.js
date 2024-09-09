import {
  visitAndApproveStorage
} from '../../support/ui-test-helper.js'

describe('use star tools of svg-edit', { testIsolation: false }, function () {
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
  it('check tool_star', function () {
    cy.get('#tool_star')
      .click({ force: true })
    cy.get('#svgcontent')
      .trigger('mousedown', 300, 150, { force: true })
      .trigger('mousemove', 300, 250, { force: true })
      .trigger('mouseup', { force: true })
    cy.svgSnapshot()
  })
  it('check tool_star_clone', function () {
    cy.get('#svg_1').click({ force: true })
    cy.get('#tool_clone').click({ force: true })
    cy.svgSnapshot()
  })
  it('check tool_star_change_class', function () {
    cy.get('#svg_2').click({ force: true })
    cy.get('#elem_class').shadow().find('elix-input').eq(0).shadow().find('#inner').eq(0)
      .type('svg_2_class{enter}', { force: true })
    cy.get('#svg_2')
      .should('satisfy', ($el) => {
        const classList = Array.from($el[0].classList)
        return classList.includes('svg_2_class')
      })
  })
  it('check tool_star_change_id', function () {
    cy.get('#svg_2').click({ force: true }).click({ force: true })
    cy.get('#elem_id').shadow().find('elix-input').eq(0).shadow().find('#inner').eq(0)
      .type('_id{enter}', { force: true })
    cy.get('#svg_2_id')
      .should('satisfy', ($el) => {
        const classList = Array.from($el[0].classList)
        return classList.includes('svg_2_class')
      })
  })
  it('check tool_star_change_rotation', function () {
    cy.get('#svg_2_id').click({ force: true })
    for (let n = 0; n < 5; n++) {
      cy.get('#angle').shadow().find('elix-number-spin-box').eq(0).shadow().find('#upButton').eq(0)
        .click({ force: true })
    }
    cy.svgSnapshot()
  })
  it('check tool_star_change_blur', function () {
    cy.get('#svg_2_id').click({ force: true })
    for (let n = 0; n < 10; n++) {
      cy.get('#blur').shadow().find('elix-number-spin-box').eq(0).shadow().find('#upButton').eq(0)
        .click({ force: true })
    }
    cy.svgSnapshot()
  })
  it('check tool_star_change_opacity', function () {
    cy.get('#svg_2_id').click({ force: true })
    for (let n = 0; n < 10; n++) {
      cy.get('#opacity').shadow().find('elix-number-spin-box').eq(0).shadow().find('#downButton').eq(0)
        .click({ force: true })
    }
    cy.svgSnapshot()
  })
  it('check tool_star_bring_to_back', function () {
    cy.get('#svg_2_id').click({ force: true })
    cy.get('#tool_move_bottom').click({ force: true })
    cy.svgSnapshot()
  })
  it('check tool_star_bring_to_front', function () {
    cy.get('#svg_2_id').click({ force: true })
    cy.get('#tool_move_top').click({ force: true })
    cy.svgSnapshot()
  })
  it('check tool_star_delete', function () {
    cy.get('#svg_2_id').click({ force: true })
    cy.get('#tool_delete').click({ force: true })
    cy.svgSnapshot()
  })
  it('check tool_star_align_to_page', function () {
    cy.get('#svg_1').click({ force: true })
    cy.get('#tool_position').shadow().find('#select-container').eq(0).click({ force: true })
    cy.get('#tool_position').find('se-list-item').eq(2).shadow().find('[aria-label="option"]').eq(0)
      .click({ force: true })
    cy.svgSnapshot()
  })
  it('check tool_star_change_stroke_width', function () {
    cy.get('#svg_1').click({ force: true })
    for (let n = 0; n < 10; n++) {
      cy.get('#stroke_width').shadow().find('elix-number-spin-box').eq(0).shadow().find('#upButton').eq(0)
        .click({ force: true })
    }
    cy.svgSnapshot()
  })
  it('check tool_star_change_stoke_fill_color', function () {
    cy.get('#svg_1').click({ force: true })
    cy.get('#stroke_color').shadow().find('#picker').eq(0).click({ force: true })
    cy.get('#stroke_color').shadow().find('#color_picker').eq(0)
      .find('#jGraduate_colPick').eq(0).find('#jPicker-table').eq(0)
      .find('.QuickColor').eq(51).click({ force: true })
    cy.get('#stroke_color').shadow().find('#color_picker').eq(0)
      .find('#jGraduate_colPick').eq(0).find('#jPicker-table').eq(0)
      .find('#Ok').eq(0).click({ force: true })
    cy.get('#fill_color').shadow().find('#picker').eq(0).click({ force: true })
    cy.get('#fill_color').shadow().find('#color_picker').eq(0)
      .find('#jGraduate_colPick').eq(0).find('#jPicker-table').eq(0)
      .find('.QuickColor').eq(3).click({ force: true })
    cy.get('#fill_color').shadow().find('#color_picker').eq(0)
      .find('#jGraduate_colPick').eq(0).find('#jPicker-table').eq(0)
      .find('#Ok').eq(0).click({ force: true })
    cy.svgSnapshot()
  })
  it('check tool_star_change_sides', function () {
    cy.get('#svg_1').click({ force: true })
    cy.get('#starNumPoints').shadow().find('elix-number-spin-box').eq(0).shadow().find('#upButton').eq(0)
      .click({ force: true })
    cy.svgSnapshot()
  })
})
