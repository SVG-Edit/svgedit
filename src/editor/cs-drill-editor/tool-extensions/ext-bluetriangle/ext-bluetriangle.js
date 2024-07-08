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

const name = 'bluetriangle'
const hasPosition = true

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

    let selElems, started, newFO, startX, startY;

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
      // svgicons: 'bluetriangle.svg',
      // buttons: strings.buttons.map((button, i) => {
      //   return Object.assign(buttons[i], button);
      // }),
      // context_tools: strings.contextTools.map((contextTool, i) => {
      //   return Object.assign(contextTools[i], contextTool);
      // }),

      callback() {
        const title = `${name}:buttons.0.title`
        const idButton = 'tool_' + name;
        const imgButton = name + '.svg';

        // Add the button and its handler(s)
        // const buttonTemplate = document.createElement('template')
        // buttonTemplate.innerHTML = `
        // <se-button id="${idButton}" title="${title}" src="${imgButton}"></se-button>
        // `

        // const buttonTemplate=`
        // <se-button id="${idButton}" title="${title}" src="${imgButton}"></se-button>
        // `
        // // $id('tools_left').appendChild(buttonTemplate.content.cloneNode(true))
        // svgCanvas.insertChildAtIndex($id('tools_left'), buttonTemplate, 7)

        $click($id(idButton), () => {
          if (this.leftPanel.updateLeftPanel(idButton)) {
            svgCanvas.setMode(name)
          }
        })

        const idPanel = `${name}_panel`
        const idPositionInput = `${name}_pos`;
        const label0 = `${name}:contextTools.0.label`
        const title0 = `${name}:contextTools.0.title`

        const panelTemplate = document.createElement('template')
        panelTemplate.innerHTML = `
          <div id="${idPanel}">
            <se-input id="${idPositionInput}" label="${label0}" title="${title0}" size="2">
            </se-input>
          </div>
           `
        $id('tools_top').appendChild(panelTemplate.content.cloneNode(true))
        showPanel(false, idPanel)
        $id(idPositionInput).addEventListener('change', (event) => {
          setAttr('position', event.target.value)
        })
      },
      // This is triggered when the main mouse button is pressed down
      // on the editor canvas (not the tool panels)
      mouseDown(opts) {
        // Check the mode on mousedown
        if (svgCanvas.getMode() !== this.name) {
          return undefined;
        }

        const zoom = svgCanvas.getZoom();
        // console.log("Zoom is "+ zoom);

        // //these are relative to the canvas
        // console.log("start at "+opts.start_x+","+opts.start_y);
        startX = opts.start_x * zoom;
        startY = opts.start_y * zoom;

        started = true;
        newFO = svgCanvas.addSVGElementsFromJson(
          {
            element: "g",
            attr: {
              id: svgCanvas.getNextId(),
              shape: this.name
            },
            children: [
              {
                element: "polygon",
                attr: {
                  id: svgCanvas.getNextId(),
                  points: "16.165,0 0,28 32.32,28 16.165,0 ",
                  fill: "#364fc7",
                  'marker-end': '',
                  'stroke-width': 0
                },
                children: []
              },
              {
                element: "text",
                attr: {
                  fill: "#ffffff",
                  "font-family": "Sans-serif",
                  "font-size": 24,
                  "text-anchor": "middle",
                  x: 16,
                  y: 27
                },
                children: [""]
              },
            ]
          }
        );

        svgCanvas.selectOnly([newFO]);
        svgCanvas.moveSelectedElements(startX, startY, false);

        return {
          started: true
        };
      },

      mouseMove(opts) {
        if (!started || svgCanvas.getMode() !== this.name) {
          return undefined;
        }
        const newX = opts.mouse_x;
        const newY = opts.mouse_y;
        svgCanvas.moveSelectedElements(newX - startX, newY - startY, false);
        startX = newX;
        startY = newY;

        return {
          started: true
        };
      },

      // This is triggered from anywhere, but "started" must have been set
      // to true (see above). Note that "opts" is an object with event info
      mouseUp(opts) {
        // Check the mode on mouseup
        if (svgCanvas.getMode() !== this.name) {
          return undefined;
        }
        // const attrs = $(newFO).attr('edge');
        // const keep = (attrs.edge !== '0');
        // // svgCanvas.addToSelection([newFO], true);
        return {
          keep: true,
          element: newFO
        };
      },

      selectedChanged(opts) {

        selElems = opts.elems
        let i = selElems.length
        // Hide panels if nothing is selected
        if (!i) {
          showPanel(false)
          return
        }

        const idPositionInput = `${name}_pos`;
        while (i--) {
          const elem = selElems[i]
          // console.log(elem);
          if (elem?.getAttribute('shape') === name) {
            if (opts.selectedElement && !opts.multiselected) {
              // console.log(">>>>>>>>>>>>>>>>> selectedChange:elem")
              // console.log(elem);
              const shapeValue = elem.lastChild ? elem.lastChild.textContent : ''
              $id(idPositionInput).value = shapeValue
              showPanel(true)
            } else {
              showPanel(false)
            }
          } else {
            showPanel(false)
          }
        }

        // if (svgCanvas.getMode() === name) {
        //   svgCanvas.setMode(name)
        // }
      },

      elementChanged(opts) {
        const elem = singleSelectedObject(opts);

        if (elem != null) {
          showPanel(true);
          const idPositionInput = `${name}_pos`;
          const position = $id(idPositionInput).value
          elem.lastChild.innerHTML = position || ''
        } else {
          showPanel(false);
        }
      }
    }
  }
}
