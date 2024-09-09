import {
  visitAndApproveStorage
} from '../../support/ui-test-helper.js'

describe('use text tools of svg-edit', { testIsolation: false }, function () {
  before(() => {
    visitAndApproveStorage()
  })

  it('check tool_source', function () {
    cy.get('#tool_source').click({ force: true })
    cy.get('#svg_source_textarea')
      .type('{selectall}', { force: true })
      .type(`<svg width="640" height="480" viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg">
      <g class="layer">
       <title>Layer 1</title>
       </g>
     </svg>`, { force: true, parseSpecialCharSequences: false })
    cy.get('#tool_source_save').click({ force: true })
    cy.svgSnapshot()
  })
  it('check tool_text', function () {
    cy.get('#tool_text')
      .click({ force: true })
    cy.get('#svgroot')
      .trigger('mousedown', { clientX: 400, clientY: 400, force: true })
      .trigger('mouseup', { force: true })
    // svgedit use the #text text field to capture the text
    cy.get('#text').type('AB', { force: true })
    // force text position for snapshot tests being consistent on CI/Interactive
    cy.get('#selected_x').shadow().find('elix-number-spin-box').eq(0).shadow().find('#inner').eq(0).type('{selectall}200', { force: true })
    cy.get('#selected_y').shadow().find('elix-number-spin-box').eq(0).shadow().find('#inner').eq(0).type('{selectall}200', { force: true })
    cy.svgSnapshot()
    // cy.get('#svg_1').should('exist')
  })
  it('check tool_clone', function () {
    cy.get('#svg_1').click({ force: true })
    cy.get('#tool_clone')
      .click({ force: true })
    cy.svgSnapshot()
  })
  it('check tool_italic', function () {
    cy.get('#svg_1').click({ force: true })
    cy.get('#tool_italic')
      .click({ force: true })
    cy.svgSnapshot()
  })
  it('check tool_bold', function () {
    cy.get('#svg_1').click({ force: true })
    cy.get('#tool_bold')
      .click({ force: true })
    cy.svgSnapshot()
  })
  it('check tool_text_change_x_y_coordinate', function () {
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
  it('check tool_text_change_font_size', function () {
    cy.get('#svg_1').click({ force: true })
    for (let n = 0; n < 10; n++) {
      cy.get('#font_size').shadow().find('elix-number-spin-box').eq(0).shadow().find('#upButton').eq(0)
        .click({ force: true })
    }
    cy.svgSnapshot()
  })
  it('check tool_text_change_stroke_width', function () {
    cy.get('#svg_1').click({ force: true })
    cy.get('#stroke_width').shadow().find('elix-number-spin-box').eq(0).shadow().find('#upButton').eq(0)
      .click({ force: true })
    cy.svgSnapshot()
  })
  it('check tool_text_change_stoke_fill_color', function () {
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
  it('check tool_text_change_blur', function () {
    cy.get('#svg_2').click({ force: true })
    for (let n = 0; n < 10; n++) {
      cy.get('#blur').shadow().find('elix-number-spin-box').eq(0).shadow().find('#upButton').eq(0)
        .click({ force: true })
    }
    cy.svgSnapshot()
  })
  it('check tool_text_change_opacity', function () {
    cy.get('#svg_2').click({ force: true })
    for (let n = 0; n < 10; n++) {
      cy.get('#opacity').shadow().find('elix-number-spin-box').eq(0).shadow().find('#downButton').eq(0)
        .click({ force: true })
    }
    cy.svgSnapshot()
  })
  it('check tool_text_align_to_page', function () {
    cy.get('#svg_2').click({ force: true })
    cy.get('#tool_position').shadow().find('#select-container').eq(0).click({ force: true })
    cy.get('#tool_position').find('se-list-item').eq(2).shadow().find('[aria-label="option"]').eq(0)
      .click({ force: true })
    cy.svgSnapshot()
  })
  it('check tool_text_change_class', function () {
    cy.get('#svg_2').click({ force: true })
    cy.get('#elem_class').shadow().find('elix-input').eq(0).shadow().find('#inner').eq(0)
      .type('svg_2_class{enter}', { force: true })
    cy.get('#svg_2')
      .should('satisfy', ($el) => {
        const classList = Array.from($el[0].classList)
        return classList.includes('svg_2_class')
      })
  })
  it('check tool_text_change_id', function () {
    cy.get('#svg_2').click({ force: true }).click({ force: true })
    cy.get('#elem_id').shadow().find('elix-input').eq(0).shadow().find('#inner').eq(0)
      .type('_id{enter}', { force: true })
    cy.get('#svg_2_id')
      .should('satisfy', ($el) => {
        const classList = Array.from($el[0].classList)
        return classList.includes('svg_2_class')
      })
  })
  it('check tool_text_delete', function () {
    cy.get('#svg_2_id').click({ force: true })
    cy.get('#tool_delete').click({ force: true })
    cy.svgSnapshot()
  })
  it('check tool_text_change_font_family', function () {
    cy.get('#svg_1').click({ force: true })
    cy.get('#tool_font_family').shadow().find('select').select('Serif', { force: true })
    cy.svgSnapshot()
  })
  it('check tool_text_decoration_underline', function () {
    cy.get('#svg_1').click({ force: true })
    cy.get('#tool_text_decoration_underline')
      .click({ force: true })
    cy.svgSnapshot()
  })
  it('check tool_text_decoration_linethrough', function () {
    cy.get('#svg_1').click({ force: true })
    cy.get('#tool_text_decoration_linethrough')
      .click({ force: true })
    cy.svgSnapshot()
  })
  it('check tool_text_decoration_overline', function () {
    cy.get('#svg_1').click({ force: true })
    cy.get('#tool_text_decoration_overline')
      .click({ force: true })
    cy.svgSnapshot()
  })
  it('check tool_letter_spacing', function () {
    cy.get('#svg_1').click({ force: true })
    for (let n = 0; n < 10; n++) {
      cy.get('#tool_letter_spacing').shadow().find('elix-number-spin-box').eq(0).shadow().find('#upButton').eq(0)
        .click({ force: true })
    }
    cy.svgSnapshot()
  })
  it('check tool_word_spacing', function () {
    cy.get('#svg_1').click({ force: true })
    for (let n = 0; n < 15; n++) {
      cy.get('#tool_word_spacing').shadow().find('elix-number-spin-box').eq(0).shadow().find('#upButton').eq(0)
        .click({ force: true })
    }
    cy.svgSnapshot()
  })
  it('check tool_text_length', function () {
    cy.get('#svg_1').click({ force: true })
    for (let n = 0; n < 20; n++) {
      cy.get('#tool_text_length').shadow().find('elix-number-spin-box').eq(0).shadow().find('#upButton').eq(0)
        .click({ force: true })
    }
    cy.svgSnapshot()
  })
  it('check tool_length_adjust', function () {
    cy.get('#svg_1').click({ force: true })
    cy.get('#tool_length_adjust').shadow().find('select').select(1, { force: true })
    cy.svgSnapshot()
  })
  it('check tool_text_change_rotation', function () {
    cy.get('#svg_1').click({ force: true })
    for (let n = 0; n < 6; n++) {
      cy.get('#angle').shadow().find('elix-number-spin-box').eq(0).shadow().find('#upButton').eq(0)
        .click({ force: true })
    }
    cy.get('#svg_1').should('have.attr', 'transform')
      .and('match', /rotate\(30/)
    // snapshot removed below for inconsistency between local and CI tests.
    // cy.svgSnapshot()
  })
})
