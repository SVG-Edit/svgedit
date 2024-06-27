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

const name = 'hockeypass'

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
  async init() {
    const svgEditor = this
    const {svgCanvas} = svgEditor
    const {$id, $click} = svgCanvas

    let selElems, started, newFO, zoom;

    //const strings = await loadExtensionTranslation(svgEditor.configObj.pref('lang'));
    await loadExtensionTranslation(svgEditor)

    const singleSelectedObject = function (opts) {
      selElems = opts.elems;
      if (selElems.length != 1) {
        return null;
      }
      const elem = selElems[0];
      if (elem && elem.getAttribute('shape') === name) {
        return elem;
      } else {
        return null;
      }
    }

    function showPanel(on) {
      if ($id(name + '_panel')) {
        $id(name + '_panel').style.display = (on) ? 'block' : 'none';
      }
    }

    function setAttr(attr, val) {
      svgCanvas.changeSelectedAttribute(attr, val);
      svgCanvas.call('changed', selElems);
    }

    return {
      name: svgEditor.i18next.t(`${name}:name`),

      callback() {
        const title = `${name}:buttons.0.title`
        const idButton = 'tool_' + name;
        const imgButton = name + '.svg';

        // Add the button and its handler(s)
        // const buttonTemplate = document.createElement('template')
        // buttonTemplate.innerHTML = `
        // <se-button id="${idButton}" title="${title}" src="${imgButton}"></se-button>
        // `
        const buttonTemplate = `
        <se-button id="${idButton}" title="${title}" src="${imgButton}"></se-button>
        `
        // $id('tools_left').appendChild(buttonTemplate.content.cloneNode(true))
        svgCanvas.insertChildAtIndex($id('tools_left'), buttonTemplate, 6)

        $click($id(idButton), () => {
          if (this.leftPanel.updateLeftPanel(idButton)) {
            svgCanvas.setMode(name)
          }
        })

      },
      // This is triggered when the main mouse button is pressed down
      // on the editor canvas (not the tool panels)
      mouseDown(opts) {
        // Check the mode on mousedown
        if (svgCanvas.getMode() !== this.name) {
          return undefined;
        }

        zoom = svgCanvas.getZoom();

        // //these are relative to the canvas
        // console.log("start at "+opts.start_x+","+opts.start_y);
        let startX = opts.start_x * zoom;
        let startY = opts.start_y * zoom;

        started = true;
        newFO = svgCanvas.addSVGElementsFromJson(
            { element: "line",
              attr: {
                id: svgCanvas.getNextId(),
                x1: startX,
                y1: startY,
                x2: startX,
                y2: startY,
                'marker-end': 'url(#se_arrow_fw)',
                'stroke-miterlimit': 10,
                'stroke-dasharray': "5,5",
                'stroke-width': 2,
                stroke: "#000",
                shape: this.name
              },
              children: []}
          );

        svgCanvas.selectOnly([newFO]);
        //svgCanvas.moveSelectedElements(startX * zoom, startY * zoom, false);

        return {
          started: true
        };
      },

      mouseMove(opts) {
        if (!started || svgCanvas.getMode() !== this.name) {
          return undefined;
        }

        let x = opts.mouse_x/zoom;
        let y = opts.mouse_y/zoom;
        // const {cx, cy, fill, strokecolor, strokeWidth, radialshift, point, orient} = c;
        newFO.setAttribute('x2', x);
        newFO.setAttribute('y2', y);
        return {
          started: true,
        }
      },

      // This is triggered from anywhere, but "started" must have been set
      // to true (see above). Note that "opts" is an object with event info
      mouseUp(opts) {
        // Check the mode on mouseup
        if (svgCanvas.getMode() !== this.name) {
          return undefined;
        }

        // console.log(opts);

        // const attrs = $(newFO).attr(['x1', 'y1', 'x2', 'y2']);
        // const keep = ((attrs.x1 !== attrs.x2) || (attrs.y1 !== attrs.y2));
        const attrs = {
          x1: newFO.getAttribute('x1'),
          y1: newFO.getAttribute('y1'),
          x2: newFO.getAttribute('x2'),
          y2: newFO.getAttribute('y2'),
        };
        const keep = ((attrs.x1 !== attrs.x2) || (attrs.y1 !== attrs.y2));
        return {
          keep: keep,
          element: newFO,
          started: false
        };
      },

    }
  }
}
