export const approveStorage = (t) => {
  return t
    .click('#dialog_buttons > input[type=button][data-ok]');
};

export const openMainMenu = (t) => {
  return t.click('#main_icon');
};

export const openEditorPreferences = (t) => {
  return openMainMenu(t).click('#tool_prefs_option');
};
