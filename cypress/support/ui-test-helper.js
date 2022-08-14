export const visitAndApproveStorage = () => {
  cy.visit('/instrumented/editor/index.html')
  cy.get('#storage_ok').click()
}

export const openMainMenu = () => {
  return cy.get('#main_button').click({ force: true })
}

export const openEditorPreferences = () => {
  openMainMenu()
  return cy.get('#tool_editor_prefs').click()
}

export const selectEnglish = () => {
  openEditorPreferences()
  cy.get('#lang_select').select('en')
  cy.get('#tool_prefs_save').click()
}
