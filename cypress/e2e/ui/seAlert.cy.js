import { visitAndApproveStorage } from '../../support/ui-test-helper.js'

describe('SEAlert Component', function () {
  beforeEach(() => {
    visitAndApproveStorage()
  })

  it('should display and dismiss an alert', function () {
    cy.window().then(win => {
      // Call to show alert
      win.seAlert('This is a test alert message')

      // Verify alert is shown
      cy.get('se-elix-alert-dialog').should('have.attr', 'opened')
      cy.get('se-elix-alert-dialog').should(
        'have.text',
        'This is a test alert message'
      )
    })
  })
})
