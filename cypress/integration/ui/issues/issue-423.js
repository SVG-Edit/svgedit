import {
  visitAndApproveStorage
} from '../../../support/ui-test-helper.js';

// See https://github.com/SVG-Edit/svgedit/issues/423
describe('Fix issue 423', function () {
  beforeEach(() => {
    visitAndApproveStorage();
  });

  it('should not throw when undoing the move', function () {
    cy.get('#tool_source').click();
    cy.get('#svg_source_textarea')
      .type('{selectall}', { force: true })
      .type(`<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg">
      <g class="layer">
       <title>Layer 1</title>
       <g class="layer" id="svg_1">
        <clipPath id="svg_2">
         <rect height="150" id="svg_3" width="50" x="50" y="50"/>
        </clipPath>
        <rect clip-path="url(#svg_2)" fill="#0033b5" height="174.9" id="TANK1" width="78" x="77.5" y="29"/>
       </g>
      </g>
     </svg>`, { parseSpecialCharSequences: false, force: true });
    cy.get('#tool_source_save').click({ force: true });
    cy.get('#TANK1')
      .trigger('mousedown', { force: true })
      .trigger('mousemove', 50, 0, { force: true })
      .trigger('mouseup', { force: true });
    cy.get('#tool_undo').click({ force: true });
  });
});
