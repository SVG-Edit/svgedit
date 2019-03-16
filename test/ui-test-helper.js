export const approveStorage = (t) => {
  return t
    .click('#dialog_buttons > input[type=button][value=OK]');
};

export const approveStorageAndOpenMainMenu = (t) => {
  return approveStorage(t).click('#main_icon');
};
