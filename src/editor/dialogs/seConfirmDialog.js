// eslint-disable-next-line node/no-unpublished-import
import AlertDialog from 'elix/define/AlertDialog.js';

const dialog = new AlertDialog();
const seConfirm = async (text, choices) => {
  dialog.textContent = text;
  dialog.choices = (choices === undefined) ? ['Ok', 'Cancel'] : choices;
  dialog.open();
  const response = await dialog.whenClosed();
  return response.choice;
};

window.seConfirm = seConfirm;
