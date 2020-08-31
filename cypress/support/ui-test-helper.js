export const approveStorage = () => {
  return cy.get('#dialog_buttons > input[type=button][data-ok]')
    .click();
};

export const visitAndApproveStorage = () => {
  cy.visit('/instrumented/editor/index.html');
  approveStorage();
};

export const openMainMenu = () => {
  return cy.get('#main_icon').click();
};

export const openEditorPreferences = () => {
  openMainMenu();
  return cy.get('#tool_editor_prefs').click();
};

export const selectEnglish = () => {
  openEditorPreferences();
  cy.get('#lang_select').select('en');
  cy.get('#tool_prefs_save').click();
};
