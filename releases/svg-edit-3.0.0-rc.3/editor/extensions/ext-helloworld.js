/* globals jQuery */
/**
 * ext-helloworld.js
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
export default {
  name: 'helloworld',
  async init ({importLocale}) {
    // See `/editor/extensions/ext-locale/helloworld/`
    const strings = await importLocale();
    const svgEditor = this;
    const $ = jQuery;
    const svgCanvas = svgEditor.canvas;
    return {
      name: strings.name,
      // For more notes on how to make an icon file, see the source of
      // the helloworld-icon.xml
      svgicons: svgEditor.curConfig.extIconsPath + 'helloworld-icon.xml',

      // Multiple buttons can be added in this array
      buttons: [{
        // Must match the icon ID in helloworld-icon.xml
        id: 'hello_world',

        // Fallback, e.g., for `file:///` access
        icon: svgEditor.curConfig.extIconsPath + 'helloworld.png',

        // This indicates that the button will be added to the "mode"
        // button panel on the left side
        type: 'mode',

        // Tooltip text
        title: strings.buttons[0].title,

        // Events
        events: {
          click () {
            // The action taken when the button is clicked on.
            // For "mode" buttons, any other button will
            // automatically be de-pressed.
            svgCanvas.setMode('hello_world');
          }
        }
      }],
      // This is triggered when the main mouse button is pressed down
      // on the editor canvas (not the tool panels)
      mouseDown () {
        // Check the mode on mousedown
        if (svgCanvas.getMode() === 'hello_world') {
          // The returned object must include "started" with
          // a value of true in order for mouseUp to be triggered
          return {started: true};
        }
      },

      // This is triggered from anywhere, but "started" must have been set
      // to true (see above). Note that "opts" is an object with event info
      mouseUp (opts) {
        // Check the mode on mouseup
        if (svgCanvas.getMode() === 'hello_world') {
          const zoom = svgCanvas.getZoom();

          // Get the actual coordinate by dividing by the zoom value
          const x = opts.mouse_x / zoom;
          const y = opts.mouse_y / zoom;

          // We do our own formatting
          let {text} = strings;
          [
            ['x', x],
            ['y', y]
          ].forEach(([prop, val]) => {
            text = text.replace('{' + prop + '}', val);
          });

          // Show the text using the custom alert function
          $.alert(text);
        }
      }
    };
  }
};
