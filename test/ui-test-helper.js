export const approveStorage = (t) => {
  return t
    .click('#dialog_buttons > input[type=button][value=OK]');
};

export const approveStorageAndOpenMainMenu = (t) => {
  return approveStorage(t).click('#main_icon');
};

export const approveStorageAndOpenEditorPreferences = (t) => {
  return approveStorageAndOpenMainMenu(t).click('#tool_prefs_option');
};
