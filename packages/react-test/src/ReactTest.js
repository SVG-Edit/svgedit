import React, { useEffect } from 'react'

const ReactTest = ({ svgEdit }) => {
  const { svgCanvas } = svgEdit
  const handleSvgEditEvent = (ev) => {
    const { vars } = ev.detail
    switch (ev.detail.action) {
      case 'mouseDown':
        // This is triggered when the main mouse button is pressed down
        // on the editor canvas (not the tool panels)
        // Check the mode on mousedown
        if (svgCanvas.getMode() === 'hello_world') {
          // event based extensions must set the start themselves
          // to a value of true in order for mouseUp to be triggered
          svgCanvas.setStarted(true)
        }
        break
      case 'mouseUp':
        // This is triggered from anywhere, but "started" must have been set
        // to true (see above). Note that "opts" is an object with event info
        // Check the mode on mouseup
        if (svgCanvas.getMode() === 'hello_world') {
          const zoom = svgCanvas.getZoom()
          // Get the actual coordinate by dividing by the zoom value
          const x = vars.mouse_x / zoom
          const y = vars.mouse_y / zoom
          // Show the text using the custom alert function
          alert(`hello world ${x},${y})`)
        }
        break
      default:
        break
    }
  }
  useEffect(() => {
    document.addEventListener('svgedit', handleSvgEditEvent)
    return () => {
      // Clean up the subscription
      document.removeEventListener('svgedit', handleSvgEditEvent)
    }
  })
  const onClick = () => {
    svgCanvas.setMode('hello_world')
  }

  return <se-button id='hello_world' title='Hello World' src='hello_world.svg' onClick={onClick} />
}
export default ReactTest
