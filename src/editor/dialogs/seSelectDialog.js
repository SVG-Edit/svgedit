import SePlainAlertDialog from './SePlainAlertDialog.js'

const seSelect = async (text, choices) => {
  const dialog = new SePlainAlertDialog()
  dialog.textContent = text
  dialog.choices = choices
  dialog.open()
  const response = await dialog.whenClosed()
  return response.choice
}

window.seSelect = seSelect
