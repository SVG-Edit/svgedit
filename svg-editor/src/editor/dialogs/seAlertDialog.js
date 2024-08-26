import SePlainAlertDialog from './SePlainAlertDialog.js'

const seAlert = (text) => {
  const dialog = new SePlainAlertDialog()
  dialog.textContent = text
  dialog.choices = ['Ok']
  dialog.open()
}

window.seAlert = seAlert
