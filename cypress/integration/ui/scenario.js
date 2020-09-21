import {
  visitAndApproveStorage
} from '../../support/ui-test-helper.js';

const testSnapshot = () => {
  // cy.get('#tool_source').click({force: true});
  // cy.get('#svg_source_textarea').invoke('val').toMatchSnapshot();
  // cy.get('#tool_source_save').click({force: true});
  cy.get('#svgcontent').toMatchSnapshot();
};

describe('use various parts of svg-edit', function () {
  before(() => {
    visitAndApproveStorage();
  });

  it('check tool_source', function () {
    cy.get('#tool_source').click({force: true});
    cy.get('#svg_source_textarea')
      .type('{selectall}', {force: true})
      .type(`<svg width="640" height="480" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg">
      <g class="layer">
       <title>Layer 1</title>
        <rect id="rect" fill="#FF0000" height="70" stroke="#000000" stroke-width="5" width="94" x="69.5" y="51.5"/>
       </g>
     </svg>`, {parseSpecialCharSequences: false});
    cy.get('#tool_source_save').click({force: true});
    testSnapshot();
  });
  it('check tool_fhpath', function () {
    cy.get('#tool_fhpath')
      .click({force: true});
    cy.get('#rect')
      .trigger('mousemove', 200, 200, {force: true})
      .trigger('mousedown', 200, 200, {force: true})
      .trigger('mousemove', 20, 20, {force: true})
      .trigger('mouseup', {force: true});
    cy.get('#svgcontent').toMatchSnapshot();
  });
  it('check tool_text', function () {
    cy.get('#tool_text')
      .click({force: true});
    cy.get('#rect')
      .trigger('mousedown', 'center', {force: true})
      .trigger('mouseup', {force: true});
    // svgedit use the #text text field to capture the text
    // cy.get('#text').type('1234', {force: true});
    cy.get('#text').type('B', {force: true});
    testSnapshot();
  });

  it('check tool_clone', function () {
    cy.get('#svg_1').click({force: true});
    cy.get('#tool_clone')
      .click({force: true});
    testSnapshot();
  });
  it('check tool_italic', function () {
    cy.get('#svg_1').click({force: true});
    cy.get('#tool_italic')
      .click({force: true});
    testSnapshot();
  });
  it('check tool_bold', function () {
    cy.get('#svg_1').click({force: true});
    cy.get('#tool_bold')
      .click({force: true});
    testSnapshot();
  });
  it('check change color', function () {
    cy.get('#svg_1').click({force: true});
    cy.get('[data-rgb="#ffff00"]')
      .click({force: true});
    testSnapshot();
  });
});
