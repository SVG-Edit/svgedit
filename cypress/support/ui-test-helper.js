export const approveStorage = () => {
  return cy.get('#dialog_buttons > input[type=button][data-ok]')
    .click();
};

export const openMainMenu = () => {
  return cy.get('#main_icon').click();
};

export const openEditorPreferences = () => {
  openMainMenu();
  return cy.get('#tool_prefs_option').click();
};
