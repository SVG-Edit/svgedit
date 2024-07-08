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

const name = 'basketball'

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
              { element:"circle",
                attr: {
                  id: svgCanvas.getNextId(),
                  cx: 8.5,
                  cy: 8,
                  r: 8,
                  fill: "white",
                  'marker-end': '',
                  'stroke-width': 0
                },
                children: []},
              { element:"path",
                attr: {
                  id: svgCanvas.getNextId(),
                  d: "M2.45084 2.76465C1.23541 4.16797 0.5 5.99805 0.5 8C0.5 10.002 1.23541 11.832 2.45084 13.2354C2.67407 13.4932 2.91333 13.7363 3.16736 13.9639C4.58261 15.23 6.45148 16 8.5 16C10.5485 16 12.4174 15.23 13.8326 13.9639C13.9851 13.8276 14.1323 13.6851 14.2738 13.5376L14.3516 13.4556C15.6844 12.0264 16.5 10.1084 16.5 8C16.5 5.99805 15.7646 4.16797 14.5492 2.76465C14.3259 2.50684 14.0867 2.26367 13.8326 2.03613C12.4174 0.77002 10.5485 0 8.5 0C6.45148 0 4.58261 0.77002 3.16736 2.03613C3.15179 2.05029 3.13641 2.06396 3.12097 2.07812C2.88419 2.29346 2.6604 2.52295 2.45084 2.76465ZM8 8.5V14.9824C6.4819 14.8755 5.09744 14.2842 4.00006 13.3623C5.40912 12.1782 6.34485 10.4497 6.48242 8.5H8ZM5.47946 8.5C5.34103 10.1777 4.51215 11.6602 3.27765 12.6616C2.27588 11.54 1.63004 10.0938 1.51758 8.5H5.47946ZM6.48242 7.5H8V1.01758C6.4819 1.12451 5.09744 1.71582 4.00006 2.6377C5.40912 3.82178 6.34485 5.55029 6.48242 7.5ZM3.27765 3.33838C4.51215 4.33984 5.34103 5.82227 5.47946 7.5H1.51758C1.63004 5.90625 2.27588 4.45996 3.27765 3.33838ZM9 8.5V14.9824C10.5181 14.8755 11.9026 14.2842 12.9999 13.3623C11.5909 12.1782 10.6552 10.4497 10.5176 8.5H9ZM9 1.01758C10.5181 1.12451 11.9026 1.71582 12.9999 2.6377C11.5909 3.82178 10.6552 5.55029 10.5176 7.5H9V1.01758ZM13.7224 3.33838C12.4879 4.33984 11.659 5.82227 11.5205 7.5H15.4824C15.37 5.90625 14.7241 4.45996 13.7224 3.33838ZM15.4824 8.5H11.5205C11.659 10.1777 12.4879 11.6602 13.7224 12.6616C14.7241 11.54 15.37 10.0938 15.4824 8.5Z",
                  'fill-rule': 'evenodd',
                  'clip-rule': 'evenodd',
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
