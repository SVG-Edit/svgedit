/**
 * @file ext-label.js
 *
 * @license MIT
 *
 * @copyright 2010 Jeff Schiller
 * @copyright 2021 OptimistikSAS
 *
 */

const name = 'label'

export default {
  name,
  async init () {
    const svgEditor = this
    const { svgCanvas } = svgEditor
    const svgroot = svgCanvas.getSvgRoot()
    const { ChangeElementCommand } = svgCanvas.history
    // svgdoc = S.svgroot.parentNode.ownerDocument,
    const addToHistory = (cmd) => { svgCanvas.undoMgr.addCommandToHistory(cmd) }
    const { $id, $click } = svgCanvas
    const startClientPos = {}

    let targetId=0
    let curShape
    let startX
    let startY

    return {
      name: svgEditor.i18next.t(`${name}:name`),
      callback () {
        const labelDialog = document.createElement('se-label-dialog')
        labelDialog.setAttribute('id', 'se-label-dialog')
        document.getElementById('container').append(labelDialog)
        labelDialog.init(svgEditor.i18next)
      },
      mouseDown(opts){
        const mode = svgCanvas.getMode()
        if (mode === "label") {
          svgCanvas.clearSelection()
          const e = opts.event
          const { target } = e
          if (!['svg', 'use'].includes(target.nodeName)){
            svgCanvas.addToSelection([target])
            document.getElementById('se-label-dialog').setAttribute('dialog', 'open')
          }
        }
      }
  }
}
}

