// Allow outer document to request the SVG so it can save as needed

const name = 'push_message_save'

export default {
  async init() {
    const svgEditor = this
    const {svgCanvas} = svgEditor
    // const {$id, $click} = svgCanvas
    // message event handler (e is event object)
    window.handleMessage = function(e) {
      // Check origin
      // if ( e.origin === window.location.origin ) {
          // Send reply to source of message
      if (e.data === 'getSvgString') {
        e.source.postMessage(svgCanvas.getSvgString(), e.origin);
      }
      // }
    }

    if ( window.addEventListener ) {
      window.addEventListener('message', handleMessage, false);
    } else if ( window.attachEvent ) { // ie8
      window.attachEvent('onmessage', handleMessage);
    }

    return {
      name: svgEditor.i18next.t(`${name}:name`),

      callback() {
      },

    }

}};
