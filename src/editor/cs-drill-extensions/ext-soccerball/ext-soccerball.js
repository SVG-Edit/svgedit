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

const name = 'soccerball'

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
              { element:"path",
                attr: {
                  id: svgCanvas.getNextId(),
                  d: "m6.621088,11.912862l-1.0324,-3.1772l-2.5276,-0.636l-1.8964,1.5844c0.0038,0.0448 0.0024,0.0896 0.0068,0.1342c0.16,1.561 0.784,3.0272 1.8038,4.239c0.033,0.0392 0.0692,0.0752 0.1028,0.1138l2.0856,-0.0806l1.4574,-2.1776l0,0.00001l0,-0.00001z",
                  fill: "#fff",
                  'marker-end': 'none',
                  'stroke-width': 1
                },
                children: []},
              { element:"path",
                attr: {
                  id: svgCanvas.getNextId(),
                  d: "m10.745288,12.399652l-3.5286,0l-1.4164,2.1166l0.7162,1.9454c0.0478,0.0158 0.0942,0.035 0.1424,0.05c1.4994,0.4648 3.1418,0.466 4.6442,-0.0004c0.0482,-0.015 0.0946,-0.034 0.1424,-0.0498l0.716,-1.9448l-1.4162,-2.117l-0.00001,0l0.00001,0z",
                  fill: "#fff",
                  'marker-end': 'none',
                  'stroke-width': 1
                },
                children: []},
              { element:"path",
                attr: {
                  id: svgCanvas.getNextId(),
                  d: "m9.364088,5.901062l2.8644,2.0812l2.4858,-0.6254l0.968,-2.4104c-0.0246,-0.0402 -0.046,-0.082 -0.0714,-0.122c-0.8988,-1.4172 -2.2526,-2.53 -3.8134,-3.1328c-0.0398,-0.0154 -0.0806,-0.0258 -0.1206,-0.0404l-2.313,1.6804l0,2.5694l0.0002,0l-0.00001,0l0.00001,0z",
                  fill: "#fff",
                  'marker-end': 'none',
                  'stroke-width': 1
                },
                children: []},
              { element:"path",
                attr: {
                  id: svgCanvas.getNextId(),
                  d: "m12.373488,8.735462l-1.0324,3.1774l1.457,2.1776l2.0858,0.0806c0.0338,-0.0386 0.0698,-0.0746 0.1028,-0.1138c1.0202,-1.2122 1.6442,-2.6778 1.8042,-4.239c0.0046,-0.0446 0.003,-0.0892 0.0068,-0.1338l-1.8966,-1.5848l-2.5276,0.6358l-0.00001,0l0.00001,0z",
                  fill: "#fff",
                  'marker-end': 'none',
                  'stroke-width': 1
                },
                children: []},
              { element:"path",
                attr: {
                  id: svgCanvas.getNextId(),
                  d: "m5.733688,7.982262l2.8644,-2.0812l0,-2.5694l-2.313,-1.6806c-0.04,0.0148 -0.081,0.0252 -0.121,0.0406c-1.5604,0.6028 -2.9144,1.7156 -3.8128,3.1328c-0.0254,0.04 -0.047,0.0818 -0.0716,0.122l0.968,2.4104l2.486,0.6254l-0.00001,-0.00001l0.00001,0.00001z",
                  fill: "#fff",
                  'marker-end': 'none',
                  'stroke-width': 1
                },
                children: []},
              { element:"path",
                attr: {
                  id: svgCanvas.getNextId(),
                  d: "m16.495488,4.065862c-1.0656,-1.6138 -2.648,-2.8634 -4.4554,-3.5188c-1.9632,-0.7116 -4.1556,-0.711 -6.1182,0.0002c-1.8074,0.655 -3.3896,1.9048 -4.4554,3.5186c-0.9718,1.472 -1.4854,3.1822 -1.4854,4.9454c0,0.4028 0.0294,0.819 0.0872,1.2372c0.203,1.4702 0.7766,2.882 1.6588,4.0822c1.2632,1.7182 3.094,2.9366 5.1548,3.4312c0.6902,0.1656 1.3966,0.2494 2.099,0.2494c0.7024,0 1.4084,-0.0838 2.099,-0.2494c2.0612,-0.4944 3.8918,-1.713 5.1552,-3.4312c0.8818,-1.1998 1.4556,-2.6116 1.6588,-4.0822c0.058,-0.4196 0.0872,-0.836 0.0872,-1.2372c0,-1.763 -0.5136,-3.473 -1.4856,-4.9454l-0.00001,-0.00001l0.00001,0.00001zm-4.8184,-2.4148c0.04,0.0148 0.0808,0.025 0.1206,0.0404c1.5608,0.6028 2.9146,1.7156 3.8134,3.1328c0.0252,0.04 0.0468,0.0816 0.0714,0.122l-0.968,2.4104l-2.4858,0.6254l-2.8646,-2.081l0,-2.5694l2.313,-1.6806zm-3.079,1.6806l0,2.5694l-2.8644,2.0812l-2.4858,-0.6254l-0.968,-2.4104c0.0246,-0.0404 0.0462,-0.0822 0.0716,-0.122c0.8984,-1.4172 2.2524,-2.53 3.8128,-3.1328c0.04,-0.0154 0.0808,-0.0258 0.121,-0.0406l2.3128,1.6806l0.00001,0.00001l-0.00001,-0.00001zm-5.537,4.768l2.5276,0.6358l1.0324,3.1774l-1.4572,2.1776l-2.0856,0.0806c-0.0338,-0.0386 -0.0698,-0.0746 -0.1028,-0.1138c-1.02,-1.2118 -1.6438,-2.6778 -1.8038,-4.239c-0.0046,-0.0446 -0.003,-0.0894 -0.0068,-0.1342l1.8962,-1.5844l0.00001,0l-0.00001,0zm2.7392,6.4166l1.4164,-2.1166l3.5286,0l1.4164,2.1168l-0.716,1.9448c-0.0478,0.0158 -0.0942,0.035 -0.1424,0.0498c-1.5024,0.4664 -3.1448,0.4652 -4.6442,0.0004c-0.0482,-0.015 -0.0946,-0.034 -0.1424,-0.05l-0.7164,-1.9452l0.00002,0l-0.00002,0zm6.9978,-0.4258l-1.457,-2.1776l1.0324,-3.1774l2.5276,-0.6358l1.8966,1.5848c-0.0038,0.0448 -0.0022,0.0892 -0.0068,0.1338c-0.16,1.561 -0.784,3.0268 -1.8042,4.239c-0.033,0.0392 -0.0692,0.0752 -0.1028,0.1138l-2.0858,-0.0806l0.00001,0l-0.00001,0z",
                  fill: "#000",
                  'marker-end': 'none',
                  'stroke-width': 1
                },
                children: []}
            ]}
        );

        svgCanvas.selectOnly([newFO]);
        //svgCanvas.moveSelectedElements(startX, startY, false);

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
