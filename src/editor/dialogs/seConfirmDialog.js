import SePlainAlertDialog from './SePlainAlertDialog.js'

const seConfirm = async (text, choices) => {
  const dialog = new SePlainAlertDialog()
  dialog.textContent = text
  dialog.choices = (choices === undefined) ? ['Ok', 'Cancel'] : choices
  dialog.open()
  const response = await dialog.whenClosed()
  return dialog.keyChoice ?? response.choice
}

window.seConfirm = seConfirm
