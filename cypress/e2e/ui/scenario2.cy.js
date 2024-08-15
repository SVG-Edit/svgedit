import {
  visitAndApproveStorage
} from '../../support/ui-test-helper.js'

describe('use ellipse and circle of svg-edit', { testIsolation: false }, function () {
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
  it('check tool_circle', function () {
    cy.get('#tool_circle')
      .click({ force: true })
    cy.get('#svgcontent')
      .trigger('mousedown', 200, 200, { force: true })
      .trigger('mousemove', 300, 200, { force: true })
      .trigger('mouseup', { force: true })
    cy.svgSnapshot()
  })
  it('check tool_fhellipse', function () {
    cy.get('#tool_fhellipse')
      .click({ force: true })
    cy.get('#svgcontent')
      .trigger('mousedown', 400, 200, { force: true }).wait(100)
      .trigger('mousemove', { force: true, pageX: 400, pageY: 200 }).wait(100)
      .trigger('mousemove', { force: true, pageX: 400, pageY: 300 }).wait(100)
      .trigger('mousemove', { force: true, pageX: 300, pageY: 400 }).wait(100)
      .trigger('mousemove', { force: true, pageX: 200, pageY: 200 }).wait(100)
      .trigger('mouseup', 200, 100, { force: true })
    cy.svgSnapshot()
  })
  it('check tool_ellipse', function () {
    cy.get('#tool_ellipse').click({ force: true })
    cy.get('#svgcontent')
      .trigger('mousedown', 100, 300, { force: true })
      .trigger('mousemove', 200, 200, { force: true })
      .trigger('mouseup', { force: true })
    cy.svgSnapshot()
  })
  it('check tool_circle_change_fill_color', function () {
    cy.get('#svg_2').click({ force: true })
    cy.get('#js-se-palette').find('.square').eq(8)
      .click({ force: true })
    cy.svgSnapshot()
  })
  it('check tool_circle_change_opacity', function () {
    cy.get('#svg_2').click({ force: true })
    for (let n = 0; n < 10; n++) {
      cy.get('#opacity').shadow().find('elix-number-spin-box').eq(0).shadow().find('#downButton').eq(0)
        .click({ force: true })
    }
    cy.svgSnapshot()
  })
  it('check tool_ellipse_change_rotation', function () {
    cy.get('#svg_3').click({ force: true })
    for (let n = 0; n < 5; n++) {
      cy.get('#angle').shadow().find('elix-number-spin-box').eq(0).shadow().find('#upButton').eq(0)
        .click({ force: true })
    }
    cy.svgSnapshot()
  })
  it('check tool_ellipse_change_blur', function () {
    cy.get('#svg_3').click({ force: true })
    for (let n = 0; n < 10; n++) {
      cy.get('#blur').shadow().find('elix-number-spin-box').eq(0).shadow().find('#upButton').eq(0)
        .click({ force: true })
    }
    cy.svgSnapshot()
  })
  it('check tool_ellipse_change_cx_cy_coordinate', function () {
    cy.get('#svg_3').click({ force: true })
    for (let n = 0; n < 20; n++) {
      cy.get('#ellipse_cx').shadow().find('elix-number-spin-box').eq(0).shadow().find('#upButton').eq(0)
        .click({ force: true })
    }
    for (let n = 0; n < 20; n++) {
      cy.get('#ellipse_cy').shadow().find('elix-number-spin-box').eq(0).shadow().find('#upButton').eq(0)
        .click({ force: true })
    }
    cy.svgSnapshot()
  })
  it('check tool_ellipse_change_rx_ry_radius', function () {
    cy.get('#svg_3').click({ force: true })
    for (let n = 0; n < 20; n++) {
      cy.get('#ellipse_rx').shadow().find('elix-number-spin-box').eq(0).shadow().find('#upButton').eq(0)
        .click({ force: true })
    }
    for (let n = 0; n < 20; n++) {
      cy.get('#ellipse_ry').shadow().find('elix-number-spin-box').eq(0).shadow().find('#upButton').eq(0)
        .click({ force: true })
    }
    cy.svgSnapshot()
  })
  it('check tool_ellipse_bring_to_back', function () {
    cy.get('#svg_2').click({ force: true })
    cy.get('#tool_move_bottom').click({ force: true })
    cy.svgSnapshot()
  })
  it('check tool_ellipse_bring_to_front', function () {
    cy.get('#svg_2').click({ force: true })
    cy.get('#tool_move_top').click({ force: true })
    cy.svgSnapshot()
  })
  it('check tool_ellipse_clone', function () {
    cy.get('#svg_2').click({ force: true })
    cy.get('#tool_clone').click({ force: true })
    cy.svgSnapshot()
  })
})
