import {
  visitAndApproveStorage
} from '../../../support/ui-test-helper.js';

// See https://github.com/SVG-Edit/svgedit/issues/660
describe('Fix issue 660', function () {
  beforeEach(() => {
    visitAndApproveStorage();
  });

  it('can resize text', function () {
    cy.get('#tool_source').click();
    cy.get('#svg_source_textarea')
      .type('{selectall}', { force: true })
      .type(`<svg width="640" height="480" xmlns="http://www.w3.org/2000/svg">
      <g class="layer">
       <title>Layer 1</title>
       <text fill="#000000" id="a_text" text-anchor="middle" x="260.5" xml:space="preserve" y="192.5" font-size="40">hello</text>
      </g>
     </svg>`, { force: true, parseSpecialCharSequences: false });
    cy.get('#tool_source_save').click({ force: true });
    cy.get('#a_text').should('exist');
    cy.get('#a_text')
      .trigger('mousedown', { which: 1, force: true })
      .trigger('mouseup', { force: true });
    cy.get('#selectorGrip_resize_s')
      .trigger('mousedown', { which: 1, force: true })

      .trigger('mousemove', 0, 100, { force: true })
      .trigger('mousemove', 0, 100, { force: true })
      .trigger('mousemove', 0, 100, { force: true })
      
      // // .trigger('mousemove', 0, 100, { force: true }) // did not produce it
      // // .trigger('mousemove', 0, 100, { force: true })

      // // .trigger('mousemove', 0, 200, { force: true }) // did not produce it
      .trigger('mouseup', { force: true });
    // svgedit use the #text text field to capture the text
    cy.get('#a_text').should('have.attr', 'transform')
      .and('equal', 'matrix(1 0 0 7.0625 0 -924.531)'); // Chrome 96 is matrix(1 0 0 4.17431 0 -325.367)
  });
});
