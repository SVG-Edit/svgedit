// http://ross.posterous.com/2008/08/19/iphone-touch-events-in-javascript/
/**
 *
 * @param {Event} ev
 * @returns {void}
 */
const touchHandler = (ev) => {
  ev.preventDefault()
  const { changedTouches } = ev
  const first = changedTouches[0]

  let type = ''
  switch (ev.type) {
    case 'touchstart': type = 'mousedown'; break
    case 'touchmove': type = 'mousemove'; break
    case 'touchend': type = 'mouseup'; break
    default: return
  }

  const { screenX, screenY, clientX, clientY } = first
  const simulatedEvent = new MouseEvent(type, {
    // Event interface
    bubbles: true,
    cancelable: true,
    // UIEvent interface
    view: window,
    detail: 1, // click count
    // MouseEvent interface (customized)
    screenX,
    screenY,
    clientX,
    clientY,
    // MouseEvent interface (defaults) - these could be removed
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    button: 0, // main button (usually left)
    relatedTarget: null
  })
  if (changedTouches.length < 2) {
    first.target.dispatchEvent(simulatedEvent)
  }
}

export const init = (svgCanvas) => {
  svgCanvas.svgroot.addEventListener('touchstart', touchHandler)
  svgCanvas.svgroot.addEventListener('touchmove', touchHandler)
  svgCanvas.svgroot.addEventListener('touchend', touchHandler)
  svgCanvas.svgroot.addEventListener('touchcancel', touchHandler)
}
