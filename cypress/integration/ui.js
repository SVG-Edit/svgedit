import {
  approveStorage, openMainMenu,
  openEditorPreferences
} from '../support/ui-test-helper.js';

describe('UI tests', function () {
  beforeEach(() => {
    cy.visit('/instrumented/svg-editor-es.html');
    // Ensure we test against English regardless of the original locale
    approveStorage();
    openEditorPreferences();
    cy.get('#lang_select').select('en');
    cy.get('#tool_prefs_save').click();
  });

  it('Editor - No parameters: Has export button', () => {
    openMainMenu();
    cy.get('#tool_export');
  });

  it('Editor - No parameters: Export button clicking; dialog opens', () => {
    openMainMenu();
    cy.get('#tool_export').click();
    cy.get('#dialog_content select');
  });

  it('Editor - No parameters: Drag control point of arc path', () => {
    const randomOffset = () => 2 + Math.round(10 + Math.random() * 40);
    cy.get('#tool_source').click();

    cy.get('#svg_source_textarea')
      .type('{selectall}')
      .type(`<svg width="640" height="480" xmlns="http://www.w3.org/2000/svg">
   <g class="layer">
    <title>Layer 1</title>
    <path d="m187,194a114,62 0 1 0 219,2" fill="#FF0000" stroke="#000000" stroke-width="5"/>
   </g>
  </svg>`, {parseSpecialCharSequences: false});
    cy.get('#tool_source_save').click();
    cy.get('#svg_1').click().click();

    cy.get('#pathpointgrip_0').trigger('mousedown', {which: 1})
      .trigger('mousemove', randomOffset(), randomOffset(), {force: true})
      .trigger('mouseup', {force: true});
    cy.get('#pathpointgrip_1').trigger('mousedown', {which: 1})
      .trigger('mousemove', randomOffset(), randomOffset(), {force: true})
      .trigger('mouseup', {force: true});

    cy.get('#svg_1[d]').should('not.contain', 'NaN');
  });
});
