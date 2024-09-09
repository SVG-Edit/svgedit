export const visitAndApproveStorage = () => {
  cy.clearLocalStorage()
  cy.clearCookies()
  cy.visit('/src/editor/index.html')
  cy.get('#storage_ok').click({ force: true })
  // move to English and snap mode (to correct potential differences between CI and local tests )
  selectEnglishAndSnap()
}

export const openMainMenu = () => {
  return cy.get('#main_button').click({ force: true })
}

export const openEditorPreferences = () => {
  openMainMenu()
  return cy.get('#tool_editor_prefs').click({ force: true })
}

export const selectEnglishAndSnap = () => {
  openEditorPreferences()
  cy.get('#lang_select').select('en', { force: true })
  cy.get('#grid_snapping_on').click({ force: true })
  cy.get('#tool_prefs_save').click({ force: true })
}
