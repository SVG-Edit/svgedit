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
  it('check tool_line', function () {
    cy.get('#tool_line')
      .click({ force: true });
    cy.get('#svgcontent')
      .trigger('mousemove', 200, 200, { force: true })
      .trigger('mousedown', 200, 200, { force: true })
      .trigger('mousemove', 20, 20, { force: true })
      .trigger('mouseup', { force: true });
    // cy.get('#angle').click({ force: true }).invoke('attr', 'value', '45');
    //.shadow().get('elix-number-spin-box').shadow().find('plain-repeat-button-0').click({ force: true });
    cy.get('#svgcontent').toMatchSnapshot();
  });
  it('check tool_shape', function () {
    cy.get('#tool_shapelib').shadow().find('.overall').eq(0).click({ force: true });
    cy.get('[data-shape="heart"]').click({ force: true });
    cy.get('#svgcontent')
      .trigger('mousemove', 200, 200, { force: true })
      .trigger('mousedown', 200, 200, { force: true })
      .trigger('mousemove', 20, 20, { force: true })
      .trigger('mouseup', { force: true });
    cy.get('#selectorGrip_rotate')
      .trigger('mousedown')
      .trigger('mousemove', 20, 20, { force: true })
      .trigger('mouseup', { force: true });
    cy.get('#svgcontent').toMatchSnapshot();
  });
  /*  it('check mode_connect', function () {
    cy.get('#tool_rect').click({ force: true });
    cy.get('#svgcontent')
      .trigger('mousedown', 100, -60, { force: true })
      .trigger('mousemove', 250, 60, { force: true })
      .trigger('mouseup', { force: true });
    cy.get('#tool_square').click({ force: true });
    cy.get('#svgcontent')
      .trigger('mousedown', 250, -60, { force: true })
      .trigger('mousemove', 430, 120, { force: true })
      .trigger('mouseup', { force: true });
    cy.get('#tool_select').click({ force: true });
    cy.get('#mode_connect').click({ force: true });

    cy.get('#svgcontent')
      .trigger('mousedown', -10, -10, { force: true })
      .trigger('mousemove', -180, -180, { force: true })
      .trigger('mouseup', { force: true });
    cy.get('#svgcontent').toMatchSnapshot();
  });
  it('check tool_image', function () {

    cy.get('#tool_image').click({ force: true });
    cy.get('#svgcontent')
      .trigger('mousemove', 100, 100, { force: true })
      .trigger('mousedown', 100, 100, { force: true })
      .trigger('mouseup', { force: true });
    cy.on('window:confirm', () => true);
    cy.get('#svgcontent').toMatchSnapshot();
  }); */

});
