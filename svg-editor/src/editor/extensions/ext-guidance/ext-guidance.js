/**
 * @file ext-guidance.js
 *
 * @license MIT
 *
 * @copyright 2010 Jeff Schiller
 * @copyright 2021 OptimistikSAS
 *
 */

const name = 'guidance'


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
      },
      mouseDown (opts) {
        const mode = svgCanvas.getMode()
        if (mode === "guidance") { 
        startX = opts.start_x
        const x = startX
        startY = opts.start_y
        const y = startY
        const curStyle = svgCanvas.getStyle()

        startClientPos.x = opts.event.clientX
        startClientPos.y = opts.event.clientY

        curShape = svgCanvas.addSVGElementsFromJson({
          element: 'circle',
          curStyles: true,
          attr: {
            cx: x,
            cy: y,
            r: 0,
            id: svgCanvas.getNextId(),
            opacity: curStyle.opacity / 2
          }
        }) 
        return {
          started: true
        }
      }
    
      },
      mouseMove (opts) {
        const mode = svgCanvas.getMode()
        if (mode === 'guidance') { 

          const zoom = svgCanvas.getZoom()
          const evt = opts.event
  
          const x = opts.mouse_x / zoom
          const y = opts.mouse_y / zoom
  
          let cx = Number(curShape.getAttribute('cx'))
          let cy = Number(curShape.getAttribute('cy'))
          let rad = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy))
          if (svgCanvas.getCurConfig().gridSnapping) {
            rad = snapToGrid(rad)
          }
          curShape.setAttribute('r', rad)
      }
      },
      mouseUp (opts) {
        const mode = svgCanvas.getMode()
        if (mode === 'guidance') { 

        const keepObject = (opts.event.clientX !== startClientPos.x && opts.event.clientY !== startClientPos.y)

        if (keepObject)
          curShape.setAttribute('data-image-target', ++targetId)
        return {
          keep: keepObject,
          element: curShape,
          started: false
        }
      }}
    }
  }
}

