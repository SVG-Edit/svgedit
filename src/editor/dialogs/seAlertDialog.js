// eslint-disable-next-line node/no-unpublished-import
import AlertDialog from 'elix/define/AlertDialog.js';

const dialog = new AlertDialog();
const seAlert = (text) => {
  dialog.textContent = text;
  dialog.choices = ['Ok'];
  dialog.open();
};

window.seAlert = seAlert;
