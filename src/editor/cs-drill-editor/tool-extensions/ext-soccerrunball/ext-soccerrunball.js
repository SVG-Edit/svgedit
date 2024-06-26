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

const name = 'soccerrunball'

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

    let selElems, started, newFO, startX, startY, endX, endY, zoom;

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

    const resetStartEnd = function(elem) {
      if (elem == null) {
        return;
      }
      // console.log("Start was (" + startX + "," + startY + ")  End was (" + endX + "," + endY + ")");
      let str = elem.getAttribute('d');
      if (str == null) {
        return;
      }
      //reset start and end based on shape and bounding box
      //console.log("d str is "+ str);
      let startIndex = str.indexOf("a");
      let startPointStr = str.substring(1,startIndex);
      let point = startPointStr.split(/,|\s/);
      startX = Number(point[0]);
      startY = Number(point[1]);
      // console.log("Start reset to (" + startX + "," + startY + ") based on path");
      let box = elem.getBBox();
      // console.log("BBox TL:" + box.x + "," + box.y + "  BR:" + (box.x + box.width) + "," + (box.y + box.height) + ")");
      //divide by 10 and truncate to avoid float comparison issues
      if (parseInt(box.x/10) == parseInt(startX/10)) {
        endX = startX + box.width;
      } else {
        endX = box.x;
      }
      if (parseInt(box.y/10) == parseInt(startY/10)) {
        endY = startY + box.height;
      } else {
        endY = box.y;
      }
      // console.log("Start is (" + startX + "," + startY + ")  End is (" + endX + "," + endY + ")");
    }

    const getCurvyPath = function(x1, y1, x2, y2) {
      let curveRadius = 20;
      let curveLength = 20;
      let pathStr = "M" + x1 + " " + y1;

      let length = (Math.abs(x2-x1)**2 + Math.abs(y2-y1)**2) ** 0.5;
      let angle = Math.atan2(x2-x1,y2-y1);

      let oddEven =0;
      for(var i = 0; i < length/curveLength - 1; i+=1) {
        pathStr += "a" + curveRadius + " " + curveRadius + ", 0, 0, " + oddEven + ", " + curveLength * Math.sin(angle) + " " + curveLength * Math.cos(angle);
        oddEven = (oddEven + 1 ) % 2;
      }
      pathStr += "L" + x2 + " " + y2;
      return pathStr;
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
        const buttonTemplate =`
        <se-button id="${idButton}" title="${title}" src="${imgButton}"></se-button>
        `
        //$id('tools_left').appendChild(buttonTemplate.content.cloneNode(true))
        svgCanvas.insertChildAtIndex($id('tools_left'), buttonTemplate, 5)

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

        startX = opts.start_x;
        endX = startX;
        startY = opts.start_y;
        endY = startY;

        started = true;
        newFO = svgCanvas.addSVGElementsFromJson(
          { element: "path",
            attr: {
              id: svgCanvas.getNextId(),
              shape: this.name,
              d: getCurvyPath(startX,startY,endX,endY),
              fill: "none",
              'marker-end': 'url(#se_arrow_fw)',
              'stroke': "#000",
              'stroke-width': 2
            },
            children: []}
        );

        svgCanvas.selectOnly([]);
        //svgCanvas.moveSelectedElements(startX * zoom, startY * zoom, false);

        return {
          started: true
        };
      },

      mouseMove(opts) {
        if (!started || svgCanvas.getMode() !== this.name) {
          return undefined;
        }

        endX = opts.mouse_x/zoom;
        endY = opts.mouse_y/zoom;
        newFO.setAttribute('d', getCurvyPath(startX,startY,endX,endY));
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


        endX = opts.mouse_x;
        endY = opts.mouse_y;
        const keep = ((startX !== endX) || (startY !== endX));

        return {
          keep: keep,
          element: newFO,
          started: false
        };
      },
      selectedChanged (opts) {
        // console.log('selectedChanged');
        const elem = singleSelectedObject(opts);
        resetStartEnd(elem);
      },
      elementChanged (opts) {
        // console.log('elementChanged');
        const elem = singleSelectedObject(opts);
        if (elem != null) {
          // console.log(elem);
          resetStartEnd(elem);
          elem.setAttribute('d', getCurvyPath(startX,startY,endX,endY));
        }
      }
    }
  }
}
