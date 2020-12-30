// eslint-disable-next-line node/no-unpublished-import
import AlertDialog from 'elix/define/AlertDialog.js';

const dialog = new AlertDialog();
const seAlert = (type, text) => {
  dialog.textContent = text;
  dialog.choices = (type === 'alert') ? ['Ok'] : ['Cancel'];
  dialog.open();
};

window.seAlert = seAlert;
