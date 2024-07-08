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

const name = 'lacrosseball'

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
              shape: this.name
            },
            children: [
              { element:"polyline",
                attr: {
                  id: svgCanvas.getNextId(),
                  points: "0.933515625 7.49601562 7.49601562 0.933515625 6.72273438 0.160234375 0.160234375 6.72273438 0.933515625 7.49601562",
                  stroke: "none",
                  fill: "#F1F3F5",
                  'fill-rule': "evenodd"
                },
                children: []},
              { element:"polyline",
                attr: {
                  id: svgCanvas.getNextId(),
                  points: "2.57414062 9.13664062 9.13664062 2.57414062 8.36335938 1.80085938 1.80085938 8.36335938 2.57414062 9.13664062",
                  stroke: "none",
                  fill: "#F1F3F5",
                  'fill-rule': "evenodd"
                },
                children: []},
              { element:"polyline",
                attr: {
                  id: svgCanvas.getNextId(),
                  points: "4.21476562 10.7772656 10.7772656 4.21476562 10.0039844 3.44148438 3.44148438 10.0039844 4.21476562 10.7772656",
                  stroke: "none",
                  fill: "#F1F3F5",
                  'fill-rule': "evenodd"
                },
                children: []},
              { element:"polyline",
                attr: {
                  id: svgCanvas.getNextId(),
                  points: "7.49601562 10.7772656 10.7772656 7.49601562 10.0039844 6.72273438 6.72273438 10.0039844 7.49601562 10.7772656",
                  stroke: "none",
                  fill: "#F1F3F5",
                  'fill-rule': "evenodd"
                },
                children: []},
              { element:"polyline",
                attr: {
                  id: svgCanvas.getNextId(),
                  points: "9.13664062 12.4178906 12.4178906 9.13664062 11.6446094 8.36335938 8.36335938 11.6446094 9.13664062 12.4178906",
                  stroke: "none",
                  fill: "#F1F3F5",
                  'fill-rule': "evenodd"
                },
                children: []},
              { element:"polyline",
                attr: {
                  id: svgCanvas.getNextId(),
                  points: "12.1914844 12.9647656 12.9647656 12.1914844 2.57414062 1.80085938 1.80085938 2.57414062 12.1914844 12.9647656",
                  stroke: "none",
                  fill: "#F1F3F5",
                  'fill-rule': "evenodd"
                },
                children: []},
              { element:"polyline",
                attr: {
                  id: svgCanvas.getNextId(),
                  points: "8.36335938 5.85539062 9.13664062 5.08210938 5.85539062 1.80085938 5.08210938 2.57414062 8.36335938 5.85539062",
                  stroke: "none",
                  fill: "#F1F3F5",
                  'fill-rule': "evenodd"
                },
                children: []},
              { element:"polyline",
                attr: {
                  id: svgCanvas.getNextId(),
                  points: "5.08210938 9.13664062 5.85539062 8.36335938 2.57414062 5.08210938 1.80085938 5.85539062 5.08210938 9.13664062",
                  stroke: "none",
                  fill: "#F1F3F5",
                  'fill-rule': "evenodd"
                },
                children: []},
              { element:"polyline",
                attr: {
                  id: svgCanvas.getNextId(),
                  points: "31.171875 32.7187109 32.7187109 31.171875 13.125 11.5781641 11.5781641 13.125 31.171875 32.7187109",
                  stroke: "none",
                  fill: "#343A40",
                  'fill-rule': "evenodd"
                },
                children: []},
                // <path />
        // <g fill-rule="evenodd" fill="none" stroke="none" stroke-width="1">
              { element:"path",
                attr: {
                  id: svgCanvas.getNextId(),
                  d: "M5.46875,1.09375 C3.05648437,1.09375 1.09375,3.05648437 1.09375,5.46875 C1.09375,7.88101563 3.05648437,9.84375 5.46875,9.84375 C5.54503906,9.84375 7.35027344,9.85796875 8.58976562,11.0977344 C9.13226563,11.6785156 10.2342188,12.578125 10.9375,12.578125 C11.8423047,12.578125 12.578125,11.8423047 12.578125,10.9375 C12.578125,10.145625 11.4923047,8.95753906 11.1122266,8.6034375 L11.0977344,8.58976562 C9.85824219,7.35027344 9.84375,5.54503906 9.84375,5.46875 C9.84375,3.05648437 7.88101563,1.09375 5.46875,1.09375 Z M10.9375,13.671875 C9.53175781,13.671875 7.975625,12.0427344 7.80253906,11.8567969 C6.89363281,10.9481641 5.48269531,10.9375 5.46875,10.9375 C2.45355469,10.9375 0,8.48421875 0,5.46875 C0,2.45328125 2.45355469,0 5.46875,0 C8.48394531,0 10.9375,2.45328125 10.9375,5.46875 C10.9375,5.48132812 10.9571875,6.89609375 11.8647266,7.80992188 C12.0840234,8.01554687 13.671875,9.55007812 13.671875,10.9375 C13.671875,12.4452344 12.4452344,13.671875 10.9375,13.671875 L10.9375,13.671875 Z",
                  fill: "#343A40",
                  'fill-rule': "evenodd",
                  'stroke-width': 1
                },
                children: []},
              { element:"path",
                attr: {
                  id: svgCanvas.getNextId(),
                  d: "M19.6875,4.921875 C19.6875,6.12992188 18.7080469,7.109375 17.5,7.109375 C16.2919531,7.109375 15.3125,6.12992188 15.3125,4.921875 C15.3125,3.71382812 16.2919531,2.734375 17.5,2.734375 C18.7080469,2.734375 19.6875,3.71382812 19.6875,4.921875",
                  fill: "#FFFFFE",
                  'fill-rule': "evenodd",
                  'stroke-width': 1
                },
                children: []},
              { element:"path",
                attr: {
                  id: svgCanvas.getNextId(),
                  d: "M17.5,3.28125 C16.5951953,3.28125 15.859375,4.01707031 15.859375,4.921875 C15.859375,5.82667969 16.5951953,6.5625 17.5,6.5625 C18.4048047,6.5625 19.140625,5.82667969 19.140625,4.921875 C19.140625,4.01707031 18.4048047,3.28125 17.5,3.28125 Z M17.5,7.65625 C15.9922656,7.65625 14.765625,6.42960938 14.765625,4.921875 C14.765625,3.41414062 15.9922656,2.1875 17.5,2.1875 C19.0077344,2.1875 20.234375,3.41414062 20.234375,4.921875 C20.234375,6.42960938 19.0077344,7.65625 17.5,7.65625 L17.5,7.65625 Z",
                  fill: "#343A40",
                  'fill-rule': "evenodd",
                  'stroke-width': 1
                },
                children: []},
              { element:"path",
                attr: {
                  id: svgCanvas.getNextId(),
                  d: "M30.625,32.8125 C30.625,34.0205469 31.6044531,35 32.8125,35 C34.0205469,35 35,34.0205469 35,32.8125 C35,31.6044531 34.0205469,30.625 32.8125,30.625 C31.6044531,30.625 30.625,31.6044531 30.625,32.8125",
                  fill: "#343A40",
                  'fill-rule': "evenodd",
                  'stroke-width': 1
                },
                children: []},
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
