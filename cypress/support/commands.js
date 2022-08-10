// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
Cypress.Commands.add('svgSnapshot', () => {
  cy.wait(300) // necessary for some animations to complete
  // console.log(Cypress.spec, Cypress.currentTest)
  cy.window().then((win) => { // access to the remote Window so we can get the svgEditor variable
    const svgString = win.svgEditor.svgCanvas.getSvgString()
    const filename = `cypress/__svgSnapshots__/${Cypress.spec.fileName}-${Cypress.currentTest.title}.svg`
    //
    // console.log(filename)
    cy.task('readFileMaybe', filename).then((text) => {
      if (text === null) {
        // file does not exist so we create it
        cy.writeFile(filename, svgString)
        cy.log('creating snapshot', filename)
      } else {
        expect(text).to.equal(svgString)
      }
    })
  })
})
