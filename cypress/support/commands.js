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

// remove the style attributes that is causing differences in snapshots
const ngAttributes = [ 'style' ];

Cypress.Commands.add(
  'cleanSnapshot',
  {
    prevSubject: true
  },
  (subject, _snapshotOptions) => {
    let html = subject[0].outerHTML;

    for (const attribute of ngAttributes) {
      const expression = new RegExp(`${attribute}[^= ]*="[^"]*"`, 'g');
      html = html.replace(expression, '');
    }
    html = html.replace(/<!--[\s\S]*?-->/g, '');

    const sanitisedBody = new DOMParser().parseFromString(html, 'text/html').querySelector('body');

    return cy.wrap(sanitisedBody.firstChild).toMatchSnapshot();
  }
);
