import {
  visitAndApproveStorage
} from '../../support/ui-test-helper.js';

const testSnapshot = () => {
  cy.get('#svgcontent').cleanSnapshot();
};

describe('use all parts of svg-edit', function () {
  before(() => {
    visitAndApproveStorage();
  });

  it('check tool_source_set', function () {
    cy.get('#tool_source').click({ force: true });
    cy.get('#svg_source_textarea')
      .type('{selectall}', { force: true })
      .type(`<svg width="640" height="480" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg">
      <g class="layer">
       <title>Layer 1</title>
       </g>
     </svg>`, { force: true, parseSpecialCharSequences: false });
    cy.get('#tool_source_save').click({ force: true });
    testSnapshot();
  });
  it('check tool_path', function () {
    cy.get('#tool_path')
      .click({ force: true });
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
      .trigger('mouseup', { force: true });
    cy.get('#svgcontent').toMatchSnapshot();
  });
  it('check tool_fhellipse', function () {
    cy.get('#tool_fhellipse')
      .click({ force: true });
    cy.get('#svgcontent')
      .trigger('mousedown', 200, 80, { force: true })
      .trigger('mousemove', 320, 80, { force: true })
      .trigger('mousemove', 320, 180, { force: true })
      .trigger('mousemove', 200, 180, { force: true })
      .trigger('mousemove', 200, 80, { force: true })
      .trigger('mouseup', 200, 80, { force: true });
    cy.get('#svgcontent').toMatchSnapshot();
  });
  it('check tool_ellipse_circle', function () {
    cy.get('#tool_ellipse').click({ force: true });
    cy.get('#svgcontent')
      .trigger('mousedown', 75, 150, { force: true })
      .trigger('mousemove', 130, 175, { force: true })
      .trigger('mouseup', { force: true });
    cy.get('#tool_circle').click({ force: true });
    cy.get('#svgcontent')
      .trigger('mousedown', 150, 50, { force: true })
      .trigger('mousemove', 150, 80, { force: true })
      .trigger('mouseup', { force: true });
    cy.get('#svgcontent').toMatchSnapshot();
  });
  it('check tool_circle_change_fill_color', function () {
    cy.get('#svg_2').click({ force: true });
    cy.get('#js-se-palette').find('.square').eq(8)
      .click({ force: true });
    cy.get('#svgcontent').toMatchSnapshot();
  });
  it('check tool_circle_change_opacity', function () {
    cy.get('#svg_2').click({ force: true });
    // cy.get('#opacity').trigger('click', 'bottomRight');
    for(let n = 0; n < 10; n ++){
      cy.get('#opacity').shadow().find('elix-number-spin-box').eq(0).shadow().find('#downButton').eq(0)
        .click({ force: true });
    }
    cy.get('#svgcontent').toMatchSnapshot();
  });
  it('check tool_ellipse_change_rotation', function () {
    cy.get('#svg_3').click({ force: true });
    // cy.get('#opacity').trigger('click', 'bottomRight');
    for(let n = 0; n < 5; n ++){
      cy.get('#angle').shadow().find('elix-number-spin-box').eq(0).shadow().find('#upButton').eq(0)
        .click({ force: true });
    }
    cy.get('#svgcontent').toMatchSnapshot();
  });

});
