/**
 * @file ext-shapes.js
 *
 * @license MIT
 *
 * @copyright 2010 Christian Tzurcanu, 2010 Alexis Deveria
 *
 */
const name = 'cs_actions'

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

function convertDomToJson(dom) {
  const result = {};
  if (dom.tagName == "svg") {
    return convertDomToJson(dom.firstChild);
  } else if (dom.tagName == "title") {
    console.log("ERROR: title tag not supported, please remove from svg shapel definition");
    return {};
  } else {
    result['element']=dom.tagName
    const attr = {};
    for(let i=0;i< dom.attributes.length; i++) {
      let pair = dom.attributes[i];
      if (pair.name == "style") {
        pair.value.split(";").forEach(function(sty) {
          let set = sty.split(":");
          attr[set[0]] = set[1];
        });
      } else {
        attr[pair.name] = pair.value;
      }
    }
    result['attr'] = attr;
    const children = [];
    for(let i=0;i< dom.children.length; i++) {
      let child = dom.children[i];
      children.push(convertDomToJson(child));
    }
    if ((dom.tagName == 'text') && (dom.textContent.length > 0)) {
      // console.log("node " + dom.tagName + " has text content " + dom.textContent);
      children.push(dom.textContent);
    }
    result['children'] = children;
  }
  return result;
}

export default {
  name,
  async init () {
    const svgEditor = this
    const svgCanvas = svgEditor.svgCanvas
    const { $id, $click } = svgCanvas
    const svgroot = svgCanvas.getSvgRoot()
    let lastBBox = {}
    await loadExtensionTranslation(svgEditor)
    const sport = svgEditor.configObj.curConfig.canvasName

    const modeId = 'cs_actions'
    let selElems, started, newFO, zoom, curShape, startX, startY, endX, endY;


    let tool_id = 'tools_' + name;

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

    return {
      callback () {
        const extPath = svgEditor.configObj.curConfig.extPath
        if ($id(tool_id) === null) {
          const buttonTemplate = `
          <se-svgexplorerbutton id="${tool_id}">
          </se-svgexplorerbutton>
          `
          svgCanvas.insertChildAtIndex($id('tools_left'), buttonTemplate, 99)
        }

        const sportCap  = sport.charAt(0).toUpperCase() + sport.slice(1)
        //set sport specific attributes
        $id(tool_id).setAttribute("sport", sport); //should be dataset "data-"?
        $id(tool_id).setAttribute("title", `${sportCap} Actions`);
        $id(tool_id).setAttribute("src", `../cs-drill-editor/tool-extensions/ext-cs-actions/tool_button_actions.svg`);
        $id(tool_id).setAttribute("lib", `${extPath}/ext-cs-actions/`);

        $click($id(tool_id), () => {
          if (this.leftPanel.updateLeftPanel(tool_id)) {
            svgCanvas.setMode(modeId)
          }
        })
      },

      // This is triggered when the main mouse button is pressed down
      // on the editor canvas (not the tool panels)
      mouseDown(opts) {
        // Check the mode on mousedown
        if (svgCanvas.getMode() !== modeId) {
          return undefined;
        }

        zoom = svgCanvas.getZoom();

        // //these are relative to the canvas
        startX = opts.start_x; // * zoom;
        startY = opts.start_y; // * zoom;

        started = true;
        const currentD = document.getElementById(tool_id).dataset.draw

        try {
          const shape = new DOMParser().parseFromString(currentD,"image/svg+xml");
          const newShape = convertDomToJson(shape.documentElement);
          curShape = svgCanvas.addSVGElementsFromJson(newShape);
          curShape.setAttribute("id", svgCanvas.getNextId())
          curShape.setAttribute('x1', startX);
          curShape.setAttribute('y1', startY);
          curShape.setAttribute('x2', startX);
          curShape.setAttribute('y2', startY);
          const action = curShape.dataset.csAction;
          if (action === 'run_with_ball') {
            curShape.setAttribute('d', getCurvyPath(startX, startY, startX, startY));
          }
          svgCanvas.selectOnly([curShape]);

          return {
            started: true
          };
        }
        catch (error) {
          console.error("error adding object")
          console.error(error)
          console.error(currentD)
        }
        return {
          started: false
        };
      },

      mouseMove(opts) {
        if (!started || svgCanvas.getMode() !== modeId) {
          return undefined;
        }

        endX = opts.mouse_x/zoom;
        endY = opts.mouse_y/zoom;
        // const {cx, cy, fill, strokecolor, strokeWidth, radialshift, point, orient} = c;

        const action = curShape.dataset.csAction;
        if (action === 'run_with_ball') {
          curShape.setAttribute('d', getCurvyPath(startX,startY,endX,endY));
        } else {
          curShape.setAttribute('x2', endX);
          curShape.setAttribute('y2', endY);
        }

        return {
          started: true,
        }
      },

      // This is triggered from anywhere, but "started" must have been set
      // to true (see above). Note that "opts" is an object with event info
      mouseUp(opts) {
        // Check the mode on mouseup
        if (svgCanvas.getMode() !== modeId) {
          return undefined;
        }

        // const attrs = $(newFO).attr(['x1', 'y1', 'x2', 'y2']);
        // const keep = ((attrs.x1 !== attrs.x2) || (attrs.y1 !== attrs.y2));
        // const attrs = {
        //   x1: curShape.getAttribute('x1'),
        //   y1: curShape.getAttribute('y1'),
        //   x2: curShape.getAttribute('x2'),
        //   y2: curShape.getAttribute('y2'),
        // };
        // const keep = ((attrs.x1 !== attrs.x2) || (attrs.y1 !== attrs.y2));

        endX = opts.mouse_x;
        endY = opts.mouse_y;

        const keep = ((startX !== endX) || (startY !== endX));
        //svgCanvas.clearSelection()

        return {
          keep: keep,
          element: curShape,
          started: false
        };
      },

      selectedChanged (opts) {
        const action = curShape?.dataset?.csAction;
        if (action === 'run_with_ball') {
          const elem = singleSelectedObject(opts);
          if (elem != null) {
            resetStartEnd(elem);
          }
        }
      },

      elementChanged (opts) {
        // console.log('elementChanged');

        const action = curShape?.dataset?.csAction;
        if (action === 'run_with_ball') {
          const elem = singleSelectedObject(opts);
          if (elem != null) {
            // console.log(elem);
            resetStartEnd(elem);
            elem.setAttribute('d', getCurvyPath(startX, startY, endX, endY));
          }
        }
      }

      }
    }

}
