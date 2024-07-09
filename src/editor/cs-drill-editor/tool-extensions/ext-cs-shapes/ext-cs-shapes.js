/**
 * @file ext-shapes.js
 *
 * @license MIT
 *
 * @copyright 2010 Christian Tzurcanu, 2010 Alexis Deveria
 *
 */
const name = 'cs_shapes'

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
    const canv = svgEditor.svgCanvas
    const { $id, $click } = canv
    const svgroot = canv.getSvgRoot()
    let lastBBox = {}
    await loadExtensionTranslation(svgEditor)

    const extPath = svgEditor.configObj.curConfig.extPath
    const sport = svgEditor.configObj.curConfig.canvasName

    const modeId = 'cs_shapes'
    const startClientPos = {}

    let curShape
    let startX
    let startY

    let tool_id = 'tools_' + name;
    let shapes = []

    return {
      callback () {
        if ($id(tool_id) === null) {
          const buttonTemplate = `
          <se-svgexplorerbutton id="${tool_id}">
          </se-svgexplorerbutton>
          `
          canv.insertChildAtIndex($id('tools_left'), buttonTemplate, 99)
        }

        const sportCap  = sport.charAt(0).toUpperCase() + sport.slice(1)

        //set sport specific attributes
        $id(tool_id).setAttribute("sport", sport);
        $id(tool_id).setAttribute("title", `${sportCap} Shapes`);
        $id(tool_id).setAttribute("src", `../cs-drill-editor/tool-extensions/ext-cs-shapes/${sport}/tool_button_shapes.svg`);
        $id(tool_id).setAttribute("lib", `${extPath}/ext-cs-shapes/`);

        $click($id(tool_id), () => {
          if (this.leftPanel.updateLeftPanel(tool_id)) {
            canv.setMode(modeId)
          }
        })

      },

      mouseDown (opts) {
        const mode = canv.getMode()
        if (mode !== modeId) {
          return undefined
        }

        const zoom = canv.getZoom()
        startX = opts.start_x * zoom
        startY = opts.start_y * zoom

        startClientPos.x = opts.event.clientX
        startClientPos.y = opts.event.clientY

        // startX = opts.start_x
        // const x = startX
        // startY = opts.start_y
        // const y = startY
        //const curStyle = canv.getStyle()

        const currentD = document.getElementById(tool_id).dataset.draw

        try {
          const shape = new DOMParser().parseFromString(currentD,"image/svg+xml");
          const newShape = convertDomToJson(shape.documentElement);
          curShape = canv.addSVGElementsFromJson(newShape);
          curShape.setAttribute("id", canv.getNextId())

          // // below is for drag/size
          // curShape.setAttribute('transform', 'translate(' + x + ',' + y + ') scale(0.005) translate(' + -x + ',' + -y + ')')
          // canv.recalculateDimensions(curShape)
          // lastBBox = curShape.getBBox()

          //below is for drop only
          canv.selectOnly([curShape]);
          canv.moveSelectedElements(startX, startY, false);

          return {
            started: true
          }
        }
        catch (error) {
          console.error("error adding object")
          console.error(error)
          console.error(currentD)
        }

        return {
          started: false
        }
      },

      mouseMove (opts) {
        const mode = canv.getMode()
        if (mode !== modeId) {
          return undefined
        }
        //
        // const zoom = canv.getZoom()
        // const evt = opts.event
        //
        // const x = opts.mouse_x / zoom
        // const y = opts.mouse_y / zoom
        //
        // const tlist = curShape.transform.baseVal
        // const box = curShape.getBBox()
        // const left = box.x; const top = box.y
        //
        // const newbox = {
        //   x: Math.min(startX, x),
        //   y: Math.min(startY, y),
        //   width: Math.abs(x - startX),
        //   height: Math.abs(y - startY)
        // }
        //
        // let sx = (newbox.width / lastBBox.width) || 1
        // let sy = (newbox.height / lastBBox.height) || 1
        //
        // // Not perfect, but mostly works...
        // let tx = 0
        // if (x < startX) {
        //   tx = lastBBox.width
        // }
        // let ty = 0
        // if (y < startY) {
        //   ty = lastBBox.height
        // }
        //
        // // update the transform list with translate,scale,translate
        // const translateOrigin = svgroot.createSVGTransform()
        // const scale = svgroot.createSVGTransform()
        // const translateBack = svgroot.createSVGTransform()
        //
        // translateOrigin.setTranslate(-(left + tx), -(top + ty))
        // if (!evt.shiftKey) {
        //   const max = Math.min(Math.abs(sx), Math.abs(sy))
        //
        //   sx = max * (sx < 0 ? -1 : 1)
        //   sy = max * (sy < 0 ? -1 : 1)
        // }
        // scale.setScale(sx, sy)
        //
        // translateBack.setTranslate(left + tx, top + ty)
        // tlist.appendItem(translateBack)
        // tlist.appendItem(scale)
        // tlist.appendItem(translateOrigin)
        //
        // canv.recalculateDimensions(curShape)
        //
        // lastBBox = curShape.getBBox()

        const newX = opts.mouse_x;
        const newY = opts.mouse_y;
        canv.moveSelectedElements(newX - startX, newY - startY, false);
        startX = newX;
        startY = newY;

        return {
          started: true
        }
      },

      mouseUp (opts) {
        const mode = canv.getMode()
        if (mode !== modeId) {
          return undefined
        }

        // const keepObject = (opts.event.clientX !== startClientPos.x && opts.event.clientY !== startClientPos.y)

        // // below is for drag/resize
        // return {
        //   keep: keepObject,
        //   element: curShape,
        //   started: false
        // }

        //below if for drop
        return {
          keep: true,
          element: curShape,
        }
      }
    }
  }
}
