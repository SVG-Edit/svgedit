// eslint-disable-next-line node/no-unpublished-import
import AlertDialog from 'elix/define/AlertDialog.js';

const dialog = new AlertDialog();
const seSelect = async (text, choices) => {
  dialog.textContent = text;
  dialog.choices = choices;
  dialog.open();
  const response = await dialog.whenClosed();
  return response.choice;
};

window.seSelect = seSelect;
