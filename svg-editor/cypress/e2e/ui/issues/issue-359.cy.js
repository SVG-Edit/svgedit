import {
  visitAndApproveStorage
} from '../../../support/ui-test-helper.js'

// See https://github.com/SVG-Edit/svgedit/issues/359
describe('Fix issue 359', function () {
  beforeEach(() => {
    visitAndApproveStorage()
  })

  it('can undo without throwing', function () {
    cy.get('#tool_source').click({ force: true })
    cy.get('#svg_source_textarea')
      .type('{selectall}', { force: true })
      .type(`<svg width="640" height="480" xmlns="http://www.w3.org/2000/svg">
      <g class="layer">
       <title>Layer 1</title>
        <rect fill="#ffff00" height="70" width="165" x="179.5" y="146.5"/>
      </g>
     </svg>`, { parseSpecialCharSequences: false, force: true })
    cy.get('#tool_source_save').click({ force: true })
    cy.get('#tool_undo').click({ force: true })
    cy.get('#tool_redo').click({ force: true }) // test also redo to make the test more comprehensive
    // if the undo throws an error to the console, the test will fail
  })
})
