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

const name = 'rugbyball'

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

    // const buttons = [{
    //   id: 'tool_' + name,
    //   type: 'mode',
    //   position: 8,
    //   key: 'U',
    //   events: {
    //     click () {
    //       svgCanvas.setMode(name);
    //       svgEditor.toolButtonClick('#tool_' + name);
    //       showPanel(true);
    //     }
    //   }
    // }];
    // const contextTools = [{
    //   type: 'input',
    //   panel: name + '_panel',
    //   id: name + '_pos',
    //   size: 2,
    //   defval: '',
    //   events: {
    //     change () {
    //       // console.log("position number changed to " + this.value);
    //       setAttr('position', this.value);
    //     }
    //   }
    // }];

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
        const buttonTemplate = `
        <se-button id="${idButton}" title="${title}" src="${imgButton}"></se-button>
        `
        // $id('tools_left').appendChild(buttonTemplate.content.cloneNode(true))
        svgCanvas.insertChildAtIndex($id('tools_left'), buttonTemplate, 11)

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
              shape: this.name,
              fill: "none",
              'fill-rule': "evenodd",
              stroke: "#000",
              transform: "matrix(.70710678 .70710678 -.70710678 .70710678 15.12132 2.393398)"
            },
            children: [
              { element:"ellipse",
                attr: {
                  id: svgCanvas.getNextId(),
                  cx: "6",
                  cy: "9",
                  fill: "#fff",
                  rx: "6",
                  ry: "9"
                },
                children: []},
                { element:"ellipse",
                attr: {
                  id: svgCanvas.getNextId(),
                  cx: "6",
                  cy: "9",
                  fill: "#fff",
                  rx: "3",
                  ry: "9"
                },
                children: []},
              { element:"path",
                attr: {
                  id: svgCanvas.getNextId(),
                  d: "m6.00105424 1.41575955c1.80356797 1.59948251 2.99894576 4.39857233 2.99894576 7.58424045 0 3.1856681-1.19537779 5.9847579-2.99894576 7.5842404-1.80523359-1.5984456-3.00105424-4.3979822-3.00105424-7.5842404 0-3.15439559 1.17202382-5.92976542 2.94600725-7.53678981z",
                },
                children: []},
              { element: "g",
                attr: {
                  id: svgCanvas.getNextId(),
                  'stroke-linejoin': "round"
                },
                children: [
                  { element: "path",
                    attr: {
                      id: svgCanvas.getNextId(),
                      d: "m8 3-2-3-2 3"
                    },
                    children: []},
                  { element: "path",
                    attr: {
                      id: svgCanvas.getNextId(),
                      d: "m8 18-2-3-2 3",
                      transform: "matrix(-1 0 0 -1 12 33)"
                    },
                    children: []},
                ]},
          ]}
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

    }
  }
}
