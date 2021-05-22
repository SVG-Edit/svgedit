import {
  visitAndApproveStorage
} from '../../support/ui-test-helper.js';

describe('UI - Clipboard', function () {
  beforeEach(() => {
    visitAndApproveStorage();
  });

  it('Editor - Copy and paste', () => {
    cy.get('#tool_source').click();

    cy.get('#svg_source_textarea')
      .type('{selectall}', { force: true })
      .type(`<svg width="640" height="480" xmlns="http://www.w3.org/2000/svg">
   <g class="layer">
    <title>Layer 1</title>
    <circle cx="100" cy="100" r="50" fill="#FF0000" id="testCircle" stroke="#000000" stroke-width="5"/>
   </g>
  </svg>`, { force: true, parseSpecialCharSequences: false });
    cy.get('#tool_source_save').click();
    cy.get('#testCircle').should('exist');
    cy.get('#svg_1').should('not.exist');
    cy.get('#svg_2').should('not.exist');

    // Copy.
    cy.get('#testCircle').click().rightclick();
    cy.get('#cmenu_canvas a[href="#copy"]').click({ force: true });

    // Paste.
    // Scrollbars fail to recenter in Cypress test.  Works fine in reality.
    // Thus forcing click is needed since workspace is mostly offscreen.
    cy.get('#svgroot').rightclick({ force: true });
    cy.get('#cmenu_canvas a[href="#paste"]').click({ force: true });
    cy.get('#testCircle').should('exist');
    cy.get('#svg_1').should('exist');
    cy.get('#svg_2').should('not.exist');

    // Cut.
    cy.get('#testCircle').click().rightclick();
    cy.get('#cmenu_canvas a[href="#cut"]').click({ force: true });
    cy.get('#testCircle').should('not.exist');
    cy.get('#svg_1').should('exist');
    cy.get('#svg_2').should('not.exist');

    // Paste.
    // Scrollbars fail to recenter in Cypress test.  Works fine in reality.
    // Thus forcing click is needed since workspace is mostly offscreen.
    cy.get('#svgroot').rightclick({ force: true });
    cy.get('#cmenu_canvas a[href="#paste"]').click({ force: true });
    cy.get('#testCircle').should('not.exist');
    cy.get('#svg_1').should('exist');
    cy.get('#svg_2').should('exist');

    // Delete.
    cy.get('#svg_2').click().rightclick();
    cy.get('#cmenu_canvas a[href="#delete"]').click({ force: true });
    cy.get('#svg_1').click().rightclick();
    cy.get('#cmenu_canvas a[href="#delete"]').click({ force: true });
    cy.get('#svg_1').should('not.exist');
    cy.get('#svg_2').should('not.exist');
  });
});
