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
      .trigger('mousemove', 250, 250, { force: true })
      .trigger('mouseup', { force: true });
    cy.get('#svgcontent').toMatchSnapshot();
  });
  it('check tool_line_change_class', function () {
    cy.get('#svg_1').click({ force: true });
    cy.get('#elem_class').shadow().find('elix-input').eq(0).shadow().find('#inner').eq(0)
      .type('svg_1_class{enter}', { force: true });
    cy.get('#svg_1')
      .should('satisfy', ($el) => {
        const classList = Array.from($el[0].classList);
        return classList.includes('svg_1_class');
      });
  });
  it('check tool_line_change_id', function () {
    cy.get('#svg_1').click({ force: true }).click({ force: true });
    cy.get('#elem_id').shadow().find('elix-input').eq(0).shadow().find('#inner').eq(0)
      .type('_id{enter}', { force: true });
    cy.get('#svg_1_id')
      .should('satisfy', ($el) => {
        const classList = Array.from($el[0].classList);
        return classList.includes('svg_1_class');
      });
  });
  it('check tool_line_change_rotation', function () {
    cy.get('#svg_1_id').click({ force: true });
    for(let n = 0; n < 5; n ++){
      cy.get('#angle').shadow().find('elix-number-spin-box').eq(0).shadow().find('#upButton').eq(0)
        .click({ force: true });
    }
    cy.get('#svgcontent').toMatchSnapshot();
  });
  it('check tool_line_change_blur', function () {
    cy.get('#svg_1_id').click({ force: true });
    for(let n = 0; n < 10; n ++){
      cy.get('#blur').shadow().find('elix-number-spin-box').eq(0).shadow().find('#upButton').eq(0)
        .click({ force: true });
    }
    cy.get('#svgcontent').toMatchSnapshot();
  });
  it('check tool_line_change_opacity', function () {
    cy.get('#svg_1_id').click({ force: true });
    for(let n = 0; n < 10; n ++){
      cy.get('#opacity').shadow().find('elix-number-spin-box').eq(0).shadow().find('#downButton').eq(0)
        .click({ force: true });
    }
    cy.get('#svgcontent').toMatchSnapshot();
  });
  it('check tool_line_delete', function () {
    cy.get('#svg_1_id').click({ force: true });
    cy.get('#tool_delete').click({ force: true });
    cy.get('#svgcontent').toMatchSnapshot();
  });
  it('check tool_line_clone', function () {
    cy.get('#tool_line')
      .click({ force: true });
    cy.get('#svgcontent')
      .trigger('mousemove', 200, 200, { force: true })
      .trigger('mousedown', 200, 200, { force: true })
      .trigger('mousemove', 250, 250, { force: true })
      .trigger('mouseup', { force: true });
    cy.get('#svg_2').click({ force: true });
    cy.get('#tool_clone').click({ force: true });
    cy.get('#svgcontent').toMatchSnapshot();
  });
  it('check tool_fhrect_change_x_y_coordinate', function () {
    cy.get('#svg_2').click({ force: true });
    for(let n = 0; n < 25; n ++){
      cy.get('#line_x1').shadow().find('elix-number-spin-box').eq(0).shadow().find('#upButton').eq(0)
        .click({ force: true });
    }
    for(let n = 0; n < 25; n ++){
      cy.get('#line_y1').shadow().find('elix-number-spin-box').eq(0).shadow().find('#downButton').eq(0)
        .click({ force: true });
    }
    for(let n = 0; n < 25; n ++){
      cy.get('#line_x2').shadow().find('elix-number-spin-box').eq(0).shadow().find('#upButton').eq(0)
        .click({ force: true });
    }
    for(let n = 0; n < 25; n ++){
      cy.get('#line_y2').shadow().find('elix-number-spin-box').eq(0).shadow().find('#downButton').eq(0)
        .click({ force: true });
    }
    cy.get('#svgcontent').toMatchSnapshot();
  });
});
