/**
 * @file ext-shapes.js
 *
 * @license MIT
 *
 * @copyright 2010 Christian Tzurcanu, 2010 Alexis Deveria
 *
 */
const name = 'cs_players'

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
    const modeId = 'cs_players'
    const startClientPos = {}
    const sport = svgEditor.configObj.curConfig.canvasName
    const extPath = svgEditor.configObj.curConfig.extPath
    let json
    let curShape
    let startX
    let startY
    let selElems
    let tool_id = 'tools_' + name;

    const singleSelectedObject = function (opts) {
      selElems = opts.elems;
      if (selElems.length != 1) {
        return null;
      }
      const elem = selElems[0].querySelectorAll('[data-field="label"]');
      if (elem.length > 0) {
        return elem[0];
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
      canv.changeSelectedAttribute(attr, val);
      canv.call('changed', selElems);
    }

    try {
      // const response = await fetch(`{extPath}/../cs-drill-editor/tool-extensions/ext-cs-players/index.json`)
      // json = await response.json()

      // const commonButtons = json["common"] || []
      // const sportFigures = json[`${sport}-figures`] || []
      // const sportPositions = json[`${sport}-positions`] || []
      // console.log(commonButtons); console.log(sportFigures); console.log(sportPositions);

    } catch (error) {
      console.error(error)
    }
    return {
      callback () {

        if ($id(tool_id) === null) {
          const extPath = svgEditor.configObj.curConfig.extPath
          const buttonTemplate = `
          <se-svgflyingbutton id="${tool_id}">
          </se-svgflyingbutton>
            `
          canv.insertChildAtIndex($id('tools_left'), buttonTemplate, 99)
        }

        const sportCap  = sport.charAt(0).toUpperCase() + sport.slice(1)
        //set sport specific attributes
        $id(tool_id).setAttribute("sport", sport);
        $id(tool_id).setAttribute("title", `${sportCap} Players`);
        $id(tool_id).setAttribute("src", `../cs-drill-editor/tool-extensions/ext-cs-players/tool_button_players.svg`);
        $id(tool_id).setAttribute("lib", `${extPath}/ext-cs-players/`);

        $click($id(tool_id), () => {
          if (this.leftPanel.updateLeftPanel(tool_id)) {
            canv.setMode(modeId)
          }
        })

        const idPanel = `${name}_panel`
        const idInput = `${name}_input`
        const label0 = `Label`
        const title0 = `Player Label`

        const panelTemplate = document.createElement('template')
        panelTemplate.innerHTML = `
          <div id="${idPanel}">
            <se-input id="${idInput}" label="${label0}" title="${title0}" size="10" class="fix_me">
            </se-input>
          </div>
           `
        $id('tools_top').appendChild(panelTemplate.content.cloneNode(true))
        showPanel(false, idPanel)
        $id(idInput).addEventListener('change', (event) => {
          setAttr('data-value', event.target.value)
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
        if (mode !== modeId) { return }

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
        };
      },

      mouseUp (opts) {
        const mode = canv.getMode()
        if (mode !== modeId) {
          return undefined
        }

        // // below is for drag/resize
        // const keepObject = (opts.event.clientX !== startClientPos.x && opts.event.clientY !== startClientPos.y)
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

      },

      selectedChanged(opts) {

        selElems = opts.elems
        let i = selElems.length
        // Hide panels if nothing is selected
        if (!i) {
          showPanel(false)
          return
        }

        const idInput = `${name}_input`;
        while (i--) {
          const elem = selElems[i]
          // console.log(elem);
          const label = elem.querySelectorAll('[data-field="label"]');
          // console.log(label);
          if (label.length > 0) {
            if (opts.selectedElement && !opts.multiselected) {
              const shapeValue = label[0].textContent
              $id(idInput).value = shapeValue
              showPanel(true)
            } else {
              showPanel(false)
            }
          } else {
            showPanel(false)
          }
        }

      },

      elementChanged(opts) {
        const elem = singleSelectedObject(opts);

        if (elem != null) {
          showPanel(true);
          const idInput = `${name}_input`;
          const labelValue = $id(idInput).value
          elem.textContent = labelValue || ''
        } else {
          showPanel(false);
        }
      }
    }
  }
}
