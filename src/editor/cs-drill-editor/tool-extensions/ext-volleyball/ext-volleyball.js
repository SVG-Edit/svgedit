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

const name = 'volleyball'

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
                  cx: "8",
                  cy: "7.749967",
                  fill: "#fff",
                  r: "7",
                },
                children: []},
              { element:"path",
                attr: {
                  id: svgCanvas.getNextId(),
                  d: "m7.74998152 15.499963c4.27498368 0 7.74998148-3.4749978 7.74998148-7.74998148 0-4.2749837-3.4749978-7.74998152-7.74998148-7.74998152-4.2749837 0-7.74998152 3.47499782-7.74998152 7.74998152 0 4.27498368 3.47499782 7.74998148 7.74998152 7.74998148zm3.43123568-7.00309605c-1.0249914-.17501789-2.01562016-.53124873-2.94374905-1.05312859-.03124992-2.27498848-.80309867-4.44374551-2.2156014-6.21562239 1.2562531-.32812422 2.16561373-.21874948 2.55312501-.17187459 1.94686424 1.96563252 2.89373094 4.700001 2.60622544 7.44062557zm.9937416.1218564c.2718804-2.54998172-.4249868-5.09059455-1.9312393-7.13435189 1.8500017.73748604 4.631245 3.06874879 4.2187399 6.98124556-.7624799.14373745-1.528103.19998122-2.2875006.15310633zm-11.09683637.10000586c-.64062347-4.41249558 2.77187449-6.61561533 3.93749061-7.13435188.5031116.58749249.93749777 1.22185988 1.27499086 1.89998936-2.34060111 1.03750363-4.19374611 2.91249916-5.21248147 5.23436252zm1.88750771 3.78749709c-.60000468-.6062608-1.09063461-1.3218658-1.4281277-2.1187389.72811716-2.67186859 2.62499374-4.86250668 5.14372553-5.98436069.35937414.97497326.54687369 2.01247689.55938587 3.07497436-1.95626365 1.16250333-3.44686068 2.92186803-4.2749837 5.02812523zm2.41872592-2.1562449c.66561731-.80001638 1.4718898-1.48437143 2.3906193-2.02498904 2.63436264 1.47185928 4.99373194 1.40935943 6.48435954 1.18435386-.2281184.84374798-.6187424 1.62499618-1.1343662 2.30623838-2.6749814.7000106-5.51561184.1500241-7.74061264-1.4656032zm-1.60622786 2.846856c.25311219-.7250043.5874925-1.4125027 1.0031104-2.040614 1.48437146 1.0812352 3.92812174 2.2468819 7.140608 1.8906205-1.6406211 1.2937591-5.02186915 2.4343814-8.1437184.1499935z",
                  fill: "#000",
                  'fill-rule': "nonzero",
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
