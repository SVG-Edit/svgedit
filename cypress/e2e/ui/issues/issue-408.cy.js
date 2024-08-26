import {
  visitAndApproveStorage
} from '../../../support/ui-test-helper.js'

// See https://github.com/SVG-Edit/svgedit/issues/408
describe('Fix issue 408', function () {
  beforeEach(() => {
    visitAndApproveStorage()
  })

  it('should not throw when showing/saving svg content', function () {
    cy.get('#tool_source').click({ force: true })
    cy.get('#svg_source_textarea')
      .type('{selectall}', { force: true })
      .type(`<svg width="640" height="480" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg">
      <g class="layer">
       <title>Layer 1</title>
       <g id="svg_6">
        <rect fill="#FF0000" height="71" stroke="#000000" stroke-width="5" width="94" x="69.5" y="51.5"/>
        <circle cx="117.5" cy="87.5" fill="#ffff00" r="19.84943" stroke="#000000" />
       </g>
      </g>
     </svg>`, { force: true, parseSpecialCharSequences: false })
    cy.get('#tool_source_save').click({ force: true })
    cy.get('#svg_6').click({ force: true }).dblclick({ force: true }) // change context
    cy.get('#tool_source').click({ force: true }) // reopen tool_source
    cy.get('#tool_source_save').should('exist') // The save button should be here if it does not throw
  })
})
