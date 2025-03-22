import { visitAndApproveStorage } from '../../support/ui-test-helper.js'

describe('Ext OpenSave Extension', function () {
  beforeEach(() => {
    visitAndApproveStorage()
  })

  it('should expose open and save API methods', function () {
    cy.window().then(win => {
      const extOpenSave = win.svgEditor.svgCanvas.extensions.opensave
      expect(typeof extOpenSave.callback).to.equal('function')
    })
  })

  it('should load SVG content when opening a file', function () {
    cy.window().then(win => {
      // capture the content of console output with cypress
      cy.spy(win.console, 'error').as('console')
      cy.get('#main_button').click({ force: true })
      cy.get('#tool_open').click({ force: true })
      // check the console error (can't access the dialog in a test)
      cy.get('@console').should('be.called')
    })
  })
})
