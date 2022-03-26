/* globals  seConfirm */
/**
 * @file ext-foreignobject.js
 * @license Apache-2.0
 * @copyright 2010 Jacques Distler, 2010 Alexis Deveria, 2022 Optimistik SAS
 */

const name = 'foreignobject'

const loadExtensionTranslation = async function (svgEditor) {
  let translationModule
  const lang = svgEditor.configObj.pref('lang')
  try {
    translationModule = await import(`./locale/${lang}.js`)
  } catch (_error) {
    console.warn(`Missing translation (${lang}) for ${name} - using 'en'`)
    translationModule = await import('./locale/en.js')
  }
  svgEditor.i18next.addResourceBundle(lang, 'translation', translationModule.default, true, true)
}

export default {
  name,
  async init(_S) {
    const svgEditor = this
    const { svgCanvas } = svgEditor
    const { $id, $click } = svgCanvas
    await loadExtensionTranslation(svgEditor)
    const svgdoc = S.svgroot.parentNode.ownerDocument

    const properlySourceSizeTextArea = () => {
      // TODO: remove magic numbers here and get values from CSS
      const height = parseFloat(getComputedStyle($id('svg_source_container'), null).height.replace("px", "")) - 80
      $id('svg_source_textarea').style.height = height + "px"
    }

    /**
     * @param {boolean} on true=display
     * @returns {void}
     */
    const showPanel = (on) => {
      let fcRules = $id('fc_rules')
      if (!fcRules) {
        fcRules = document.createElement('style')
        fcRules.setAttribute('id', 'fc_rules')
        document.getElementsByTagName("head")[0].appendChild(fcRules)
      }
      fcRules.textContent = !on ? '' : ' #tool_topath { display: none !important; }'
      $id('foreignObject_panel').style.display = (on) ? 'block' : 'none'
    }

    /**
    * @param {boolean} on
    * @returns {void}
    */
    const toggleSourceButtons = (on) => {
      $id('tool_source_save').style.display = (!on) ? 'block' : 'none'
      $id('tool_source_cancel').style.display = (!on) ? 'block' : 'none'
      $id('foreign_save').style.display = (on) ? 'block' : 'none'
      $id('foreign_cancel').style.display = (on) ? 'block' : 'none'
    }

    let selElems
    let started
    let newFO
    let editingforeign = false

    /**
    * This function sets the content of element elt to the input XML.
    * @param {string} xmlString - The XML text
    * @returns {boolean} This function returns false if the set was unsuccessful, true otherwise.
    */
    const setForeignString = (xmlString) => {
      const elt = selElems[0] // The parent `Element` to append to
      try {
        // convert string into XML document
        const oi = (xmlString.indexOf('xmlns:oi') !== -1) ? ' xmlns:oi="' + NS.OI + '"' : ''
        const newDoc = text2xml('<svg xmlns="' + NS.SVG + '" xmlns:xlink="' + NS.XLINK + '" ' + oi + '>' + xmlString + '</svg>')
        // run it through our sanitizer to remove anything we do not support
        svgCanvas.sanitizeSvg(newDoc.documentElement)
        elt.replaceWith(svgdoc.importNode(newDoc.documentElement.firstChild, true))
        svgCanvas.call('changed', [elt])
        svgCanvas.clearSelection()
      } catch (e) {
        // Todo: Surface error to user
        console.error(e)
        return false
      }
      return true
    }

    /**
    *
    * @returns {void}
    */
    const showForeignEditor = () => {
      const elt = selElems[0]
      if (!elt || editingforeign) { return }
      editingforeign = true
      toggleSourceButtons(true)
      elt.removeAttribute('fill')

      const str = svgCanvas.svgToString(elt, 0)
      $id('svg_source_textarea').value = str
      $id('#svg_source_editor').style.display = 'block'
      properlySourceSizeTextArea()
      $id('svg_source_textarea').focus()
    }

    /**
    * @param {string} attr
    * @param {string|Float} val
    * @returns {void}
    */
    const setAttr = (attr, val) => {
      svgCanvas.changeSelectedAttribute(attr, val)
      svgCanvas.call('changed', selElems)
    }

    const buttons = [{
      id: 'tool_foreign',
      icon: 'foreignobject-tool.png',
      type: 'mode',
      events: {
        click() {
          ;
        }
      }
    }, {
      id: 'edit_foreign',
      icon: 'foreignobject-edit.png',
      type: 'context',
      panel: 'foreignObject_panel',
      events: {
        click() {
          showForeignEditor();
        }
      }
    }];

    const contextTools = [
      {
        type: 'input',
        panel: 'foreignObject_panel',
        id: 'foreign_width',
        size: 3,
        events: {
          change() {
            setAttr('width', this.value);
          }
        }
      }, {
        type: 'input',
        panel: 'foreignObject_panel',
        id: 'foreign_height',
        events: {
          change() {
            setAttr('height', this.value);
          }
        }
      }, {
        type: 'input',
        panel: 'foreignObject_panel',
        id: 'foreign_font_size',
        size: 2,
        defval: 16,
        events: {
          change() {
            setAttr('font-size', this.value)
          }
        }
      }
    ];

    return {
      name: strings.name,
      callback() {
        const buttonTemplate = `
            <se-button id="tool_foreignobject" title="tool_foreignobject" src="tool_foreignobject.svg">
            </se-button>
          `
        svgCanvas.insertChildAtIndex($id('tools_left'), buttonTemplate, 10)
        $click($id("tool_foreignobject", () => svgCanvas.setMode('foreign')))
        $id("foreignObject_panel").style.display = 'none'

        const endChanges = () => {
          $id("svg_source_editor").style.display = 'none'
          editingforeign = false
          $id('svg_source_textarea').blur()
          toggleSourceButtons(false)
        };


        // Create source save/cancel buttons
        const toolSourceSave = $id('tool_source_save').cloneNode(true)
        toolSourceSave.style.display = 'none'
        toolSourceSave.id = 'foreign_save'
        $id('tool_source_back').append(toolSourceSave)
        toolSourceSave.addEventListener('click', () => {
          if (!editingforeign) { return }

          if (!setForeignString($id('svg_source_textarea').value)) {
            const ok = seConfirm('Errors found. Revert to original?')
            if (!ok) { return }
            endChanges()
          } else {
            endChanges()
          }
        })

        const oldToolSourceCancel = $id('tool_source_cancel')
        const toolSourceCancel = oldToolSourceCancel.cloneNode(true)
        toolSourceCancel.style.display = 'none'
        toolSourceCancel.id = 'foreign_cancel'
        $id('tool_source_back').append(toolSourceCancel)
        toolSourceCancel.addEventListener('click', () => {
          endChanges()
        })
        const handleSvgEditEvent = (ev) => {
          const { vars } = ev.detail
          switch (ev.detail.action) {
            case selectedChanged: {
              // Use this to update the current selected elements
              selElems = opts.elems;

              let i = selElems.length;
              while (i--) {
                const elem = selElems[i];
                if (elem && elem.tagName === 'foreignObject') {
                  if (opts.selectedElement && !opts.multiselected) {
                    $id('foreign_font_size').value = elem.getAttribute('font-size');
                    $id('foreign_width').value = elem.getAttribute('width');
                    $id('foreign_height').value = elem.getAttribute('height');
                    showPanel(true);
                  } else {
                    showPanel(false);
                  }
                } else {
                  showPanel(false);
                }
              }
            }
            case 'mouseDown': {
              // const e = opts.event;
              if (svgCanvas.getMode() !== 'foreign') {
                return undefined;
              }
              started = true;
              newFO = svgCanvas.addSVGElementFromJson({
                element: 'foreignObject',
                attr: {
                  x: opts.start_x,
                  y: opts.start_y,
                  id: svgCanvas.getNextId(),
                  'font-size': 16, // cur_text.font_size,
                  width: '48',
                  height: '20',
                  style: 'pointer-events:inherit'
                }
              });
              const m = svgdoc.createElementNS(NS.MATH, 'math');
              m.setAttributeNS(NS.XMLNS, 'xmlns', NS.MATH);
              m.setAttribute('display', 'inline');
              const mi = svgdoc.createElementNS(NS.MATH, 'mi');
              mi.setAttribute('mathvariant', 'normal');
              mi.textContent = '\u03A6';
              const mo = svgdoc.createElementNS(NS.MATH, 'mo');
              mo.textContent = '\u222A';
              const mi2 = svgdoc.createElementNS(NS.MATH, 'mi');
              mi2.textContent = '\u2133';
              m.append(mi, mo, mi2);
              newFO.append(m);
              svgCanvas.setStarted(true)
            }
              break
            case 'mouseUp':
              // const e = opts.event;
              if (svgCanvas.getMode() !== 'foreign' || !started) {
                return undefined;
              }
              const attrs = {
                width: newFO.getAttribute('width'),
                height: newFO.getAttribute('height')
              };
              const keep = (attrs.width !== '0' || attrs.height !== '0');
              svgCanvas.addToSelection([newFO], true);

              return {
                keep,
                element: newFO
              };
              break
            default:
              break
          }
        }
        document.addEventListener('svgedit', handleSvgEditEvent)
      }
    }
  }
}
