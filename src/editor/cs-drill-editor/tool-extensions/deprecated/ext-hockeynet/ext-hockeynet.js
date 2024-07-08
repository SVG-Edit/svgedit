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

const name = 'hockeynet'

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

    let selElems, started, newFO, startX2, startY2, lastBBox;

    //const strings = await loadExtensionTranslation(svgEditor.configObj.pref('lang'));
    await loadExtensionTranslation(svgEditor)
    const singleSelectedObject = function(opts) {
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
    //   position: 13,
    //   //key: '',
    //   events: {
    //     click () {
    //       svgCanvas.setMode(name);
    //       svgEditor.toolButtonClick('#tool_' + name);
    //     }
    //   }
    // }];
    return {
      name: svgEditor.i18next.t(`${name}:name`),
      // svgicons: svgEditor.curConfig.extIconsPath + 'soccer-icons.xml',
      // buttons: strings.buttons.map((button, i) => {
      //   return Object.assign(buttons[i], button);
      // }),
      callback () {
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
        svgCanvas.insertChildAtIndex($id('tools_left'), buttonTemplate, 13)

        $click($id(idButton), () => {
          if (this.leftPanel.updateLeftPanel(idButton)) {
            svgCanvas.setMode(name)
          }
        })

      },
      mouseDown (opts) {
        if (svgCanvas.getMode() !== this.name) {
          return undefined;
        }
        const zoom = svgCanvas.getZoom();

        // //these are relative to the canvas
        let startX = opts.start_x * zoom;
        let startY = opts.start_y * zoom;

        started = true;
        newFO = svgCanvas.addSVGElementsFromJson(
          {
            element: "g",
            attr: {
              id: svgCanvas.getNextId(),
              shape: this.name,
            },
            children: [
              { element: "g",
                attr: {
                  id: svgCanvas.getNextId(),
                  stroke: "#c7c9cb",
                  "stroke-width" : "1"
                },
                children: [
                  { element: "line",
                    attr: {
                      id: svgCanvas.getNextId(),
                      x1: "31",
                      y1: "0",
                      x2: "31",
                      y2: "15",
                    },
                    children: []},
                  { element: "line",
                    attr: {
                      id: svgCanvas.getNextId(),
                      x1: "23",
                      y1: "0",
                      x2: "23",
                      y2: "15",
                    },
                    children: []},
                  { element: "line",
                    attr: {
                      id: svgCanvas.getNextId(),
                      x1: "7",
                      y1: "2",
                      x2: "7",
                      y2: "15",
                    },
                    children: []},
                  { element: "line",
                    attr: {
                      id: svgCanvas.getNextId(),
                      x1: "39",
                      y1: "0",
                      x2: "39",
                      y2: "15",
                    },
                    children: []},
                  { element: "line",
                    attr: {
                      id: svgCanvas.getNextId(),
                      x1: "47",
                      y1: "0",
                      x2: "47",
                      y2: "15",
                    },
                    children: []},
                  { element: "line",
                    attr: {
                      id: svgCanvas.getNextId(),
                      x1: "55",
                      y1: "2",
                      x2: "55",
                      y2: "15",
                    },
                    children: []},
                  { element: "line",
                    attr: {
                      id: svgCanvas.getNextId(),
                      x1: "15",
                      y1: "0",
                      x2: "15",
                      y2: "15",
                    },
                    children: []},
                  { element: "line",
                    attr: {
                      id: svgCanvas.getNextId(),
                      x1: "2",
                      y1: "8",
                      x2: "60",
                      y2: "8",
                    },
                    children: []},
                ]},
              // { element: "path",
              //   attr: {
              //     id: svgCanvas.getNextId(),
              //     d: "m15 0 h33 c8.2842712 0 15 6.71572875 15 15 h-63 c0-8.28427125 6.71572875-15 15-15z",
              //     stroke: "#ff3860",
              //     'stroke-linejoin': "round",
                  
              //   },
              //   children: []},
              {
                element: "path", //left arc
                attr: {
                  id: svgCanvas.getNextId(),
                  d: "m15 0 a 15 15 0 0 0 -15 15",
                  fill: "none",
                  stroke: "",
                  stroke: "#ff3860",
                  "stroke-width" : "2"
                }
              },
              {
                element: "path", //right arc
                attr: {
                  id: svgCanvas.getNextId(),
                  d: "m47 0 a 15 15 0 0 1 15 15",
                  fill: "none",
                  stroke: "#ff3860",
                  "stroke-width" : "2"
                }
              },
              {
                element: "line", //top line
                attr: {
                  id: svgCanvas.getNextId(),
                  x1: "15",
                  y1: "0",
                  x2: "47",
                  y2: "0",
                  stroke: "#ff3860",
                  "stroke-width" : "2"
                }
              },
              {
                element: "line", //bottom line
                attr: {
                  id: svgCanvas.getNextId(),
                  x1: "0",
                  y1: "15",
                  x2: "62",
                  y2: "15",
                  stroke: "#ff3860",
                  "stroke-width" : "2"
                }
              }
          ]}
        );
        svgCanvas.selectOnly([newFO]);
        svgCanvas.moveSelectedElements(startX, startY, false);
        svgCanvas.recalculateDimensions(newFO);
        lastBBox = newFO.getBBox();
        startX2 = (lastBBox.x + lastBBox.width);
        startY2 = (lastBBox.y + lastBBox.height);

        return {
          started: true
        };
      },
      mouseMove (opts) {
        if (!started || svgCanvas.getMode() !== this.name) {
          return undefined;
        }
        const zoom = svgCanvas.getZoom();
        const evt = opts.event;

        const x = opts.mouse_x / zoom;
        const y = opts.mouse_y / zoom;

        const tlist = svgCanvas.getTransformList(newFO)

        let sx = (Math.abs(startX2 - x) / lastBBox.width) || 1;
        let sy = (Math.abs(startY2 - y) / lastBBox.height) || 1;

        // update the transform list with translate,scale,translate
        const translateOrigin = svgroot.createSVGTransform(),
          scale = svgroot.createSVGTransform(),
          translateBack = svgroot.createSVGTransform();

        // Not perfect, but mostly works...
        let tx = 0;
        if (x > startX2) {
          tx = lastBBox.width;
        }
        let ty = 0;
        if (y > startY2) {
          ty = lastBBox.height;
        }

        translateOrigin.setTranslate(-(lastBBox.x+lastBBox.width-tx), -(lastBBox.y+lastBBox.height-ty));

        if (evt.shiftKey) {
          const max = Math.min(Math.abs(sx), Math.abs(sy));

          sx = max * (sx < 0 ? -1 : 1);
          sy = max * (sy < 0 ? -1 : 1);
        }
        scale.setScale(sx, sy);

        translateBack.setTranslate(x+tx,y+tx);// * sx,y * sy);

        tlist.appendItem(translateBack);
        tlist.appendItem(scale);
        tlist.appendItem(translateOrigin);

        svgCanvas.recalculateDimensions(newFO);

        lastBBox = newFO.getBBox();
      },
      mouseUp (opts) {
        if (svgCanvas.getMode() !== this.name) {
          return undefined;
        }
        return {
          keep: true,
          element: newFO
        };
      }
    };
  }
};
