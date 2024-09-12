/**
 * @file ext-helloworld.js
 *
 * @license MIT
 *
 * @copyright 2010 Alexis Deveria
 *
 */

/**
* This is a very basic SVG-Edit extension. It adds a "Hello World" button in
*  the left ("mode") panel. Clicking on the button, and then the canvas
*  will show the user the point on the canvas that was clicked on.
*/

const name = 'helloworld'

const loadExtensionTranslation = async function (svgEditor) {
  let translationModule
  const lang = svgEditor.configObj.pref('lang')
  try {
    translationModule = await import(`./locale/${lang}.js`)
  } catch (_error) {
    console.warn(`Missing translation (${lang}) for ${name} - using 'en'`)
    translationModule = await import('./locale/en.js')
  }
  svgEditor.i18next.addResourceBundle(lang, name, translationModule.default)
}

export default {
  name,
  async init ({ _importLocale }) {
    const svgEditor = this
    await loadExtensionTranslation(svgEditor)
    const { svgCanvas } = svgEditor
    const { $id, $click } = svgCanvas
    return {
      name: svgEditor.i18next.t(`${name}:name`),
      callback () {
        // Add the button and its handler(s)
        const buttonTemplate = document.createElement('template')
        const title = `${name}:buttons.0.title`
        buttonTemplate.innerHTML = `
        <se-button id="hello_world" title="${title}" src="hello_world.svg"></se-button>
        `
        $id('tools_left').append(buttonTemplate.content.cloneNode(true))
        $click($id('hello_world'), () => {
          svgCanvas.setMode('hello_world')
        })
      },
      // This is triggered when the main mouse button is pressed down
      // on the editor canvas (not the tool panels)
      mouseDown () {
        // Check the mode on mousedown
        if (svgCanvas.getMode() === 'hello_world') {
          // The returned object must include "started" with
          // a value of true in order for mouseUp to be triggered
          return { started: true }
        }
        return undefined
      },

      // This is triggered from anywhere, but "started" must have been set
      // to true (see above). Note that "opts" is an object with event info
      mouseUp (opts) {
        // Check the mode on mouseup
        if (svgCanvas.getMode() === 'hello_world') {
          const zoom = svgCanvas.getZoom()

          // Get the actual coordinate by dividing by the zoom value
          const x = opts.mouse_x / zoom
          const y = opts.mouse_y / zoom

          // We do our own formatting
          const text = svgEditor.i18next.t(`${name}:text`, { x, y })
          // Show the text using the custom alert function
          alert(text)
        }
      }
    }
  }
}
