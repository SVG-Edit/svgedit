import { visitAndApproveStorage } from '../../../support/ui-test-helper.js'

// See https://github.com/SVG-Edit/svgedit/issues/359
describe('Fix issue 359', function () {
  beforeEach(() => {
    visitAndApproveStorage()
  })

  it('can undo without throwing', function () {
    cy.get('#tool_source').click({ force: true })
    cy.get('#svg_source_textarea')
      .type('{selectall}', { force: true })
      .type(
        `<svg width="640" height="480" xmlns="http://www.w3.org/2000/svg">
      <g class="layer">
       <title>Layer 1</title>
        <rect fill="#ffff00" height="70" width="165" x="179.5" y="146.5"/>
      </g>
     </svg>`,
        { parseSpecialCharSequences: false, force: true }
      )

    // Apply changes to the SVG source
    cy.get('#tool_source_save').click({ force: true })

    // Wait for the changes to be applied
    cy.wait(500)

    // Attempt to perform an undo operation
    cy.get('#tool_undo').click({ force: true })

    // Assert that the application hasn't crashed
    // We can verify by checking if a basic element is still visible
    cy.get('#svgroot').should('be.visible')

    // Additional assertion to ensure the UI is still functional
    cy.get('#tool_select').should('be.visible').click({ force: true })
  })
})
