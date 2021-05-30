/* globals  seConfirm */
/**
 * @file ext-foreignobject.js
 *
 * @license Apache-2.0
 *
 * @copyright 2010 Jacques Distler, 2010 Alexis Deveria
 *
 */
const loadExtensionTranslation = async function (lang) {
  let translationModule;
  try {
    // eslint-disable-next-line no-unsanitized/method
    translationModule = await import(`./locale/${encodeURIComponent(lang)}.js`);
  } catch (_error) {
    // eslint-disable-next-line no-console
    console.error(`Missing translation (${lang}) - using 'en'`);
    translationModule = await import(`./locale/en.js`);
  }
  return translationModule.default;
};

export default {
  name: 'foreignobject',
  async init (S) {
    const svgEditor = this;
    const { text2xml, NS } = S;
    const { svgCanvas } = svgEditor;
    const { $id } = svgCanvas;
    const
      // {svgcontent} = S,
      // addElem = svgCanvas.addSVGElementFromJson,
      svgdoc = S.svgroot.parentNode.ownerDocument;

    const strings = await loadExtensionTranslation(svgEditor.configObj.pref('lang'));

    const properlySourceSizeTextArea = function () {
      // TODO: remove magic numbers here and get values from CSS
      const height = parseFloat(getComputedStyle($id('svg_source_container'), null).height.replace("px", "")) - 80;
      $id('svg_source_textarea').style.height = height + "px";
    };

    /**
    * @param {boolean} on
    * @returns {void}
    */
    function showPanel (on) {
      let fcRules = $id('fc_rules');
      if (!fcRules) {
        fcRules = document.createElement('style');
        fcRules.setAttribute('id', 'fc_rules');
        document.getElementsByTagName("head")[0].appendChild(fcRules);
      }
      fcRules.textContent = !on ? '' : ' #tool_topath { display: none !important; }';
      $id('foreignObject_panel').style.display = (on) ? 'block' : 'none';
    }

    /**
    * @param {boolean} on
    * @returns {void}
    */
    function toggleSourceButtons (on) {
      $id('tool_source_save').style.display = (!on) ? 'block' : 'none';
      $id('tool_source_cancel').style.display = (!on) ? 'block' : 'none';
      $id('foreign_save').style.display = (on) ? 'block' : 'none';
      $id('foreign_cancel').style.display = (on) ? 'block' : 'none';
    }

    let selElems;
    let started;
    let newFO;
    let editingforeign = false;

    /**
    * This function sets the content of element elt to the input XML.
    * @param {string} xmlString - The XML text
    * @returns {boolean} This function returns false if the set was unsuccessful, true otherwise.
    */
    function setForeignString (xmlString) {
      const elt = selElems[0]; // The parent `Element` to append to
      try {
        // convert string into XML document
        const oi = (xmlString.indexOf('xmlns:oi') !== -1) ? ' xmlns:oi="' + NS.OI + '"' : '';
        const newDoc = text2xml('<svg xmlns="' + NS.SVG + '" xmlns:xlink="' + NS.XLINK + '" '+ oi +'>' + xmlString + '</svg>');
        // run it through our sanitizer to remove anything we do not support
        svgCanvas.sanitizeSvg(newDoc.documentElement);
        elt.replaceWith(svgdoc.importNode(newDoc.documentElement.firstChild, true));
        svgCanvas.call('changed', [ elt ]);
        svgCanvas.clearSelection();
      } catch (e) {
        // Todo: Surface error to user
        console.error(e);
        return false;
      }

      return true;
    }

    /**
    *
    * @returns {void}
    */
    function showForeignEditor () {
      const elt = selElems[0];
      if (!elt || editingforeign) { return; }
      editingforeign = true;
      toggleSourceButtons(true);
      elt.removeAttribute('fill');

      const str = svgCanvas.svgToString(elt, 0);
      $id('svg_source_textarea').value = str;
      $id('#svg_source_editor').style.display = 'block';
      properlySourceSizeTextArea();
      $id('svg_source_textarea').focus();
    }

    /**
    * @param {string} attr
    * @param {string|Float} val
    * @returns {void}
    */
    function setAttr (attr, val) {
      svgCanvas.changeSelectedAttribute(attr, val);
      svgCanvas.call('changed', selElems);
    }

    const buttons = [ {
      id: 'tool_foreign',
      icon: 'foreignobject-tool.png',
      type: 'mode',
      events: {
        click () {
          svgCanvas.setMode('foreign');
        }
      }
    }, {
      id: 'edit_foreign',
      icon: 'foreignobject-edit.png',
      type: 'context',
      panel: 'foreignObject_panel',
      events: {
        click () {
          showForeignEditor();
        }
      }
    } ];

    const contextTools = [
      {
        type: 'input',
        panel: 'foreignObject_panel',
        id: 'foreign_width',
        size: 3,
        events: {
          change () {
            setAttr('width', this.value);
          }
        }
      }, {
        type: 'input',
        panel: 'foreignObject_panel',
        id: 'foreign_height',
        events: {
          change () {
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
          change () {
            setAttr('font-size', this.value);
          }
        }
      }
    ];

    return {
      name: strings.name,
      svgicons: 'foreignobject-icons.xml',
      buttons: strings.buttons.map((button, i) => {
        return Object.assign(buttons[i], button);
      }),
      context_tools: strings.contextTools.map((contextTool, i) => {
        return Object.assign(contextTools[i], contextTool);
      }),
      callback () {
        $id("foreignObject_panel").style.display = 'none';

        const endChanges = function () {
          $id("svg_source_editor").style.display = 'none';
          editingforeign = false;
          $id('svg_source_textarea').blur();
          toggleSourceButtons(false);
        };

        // TODO: Needs to be done after orig icon loads
        setTimeout(function () {
          // Create source save/cancel buttons
          const toolSourceSave = $id('tool_source_save').cloneNode(true);
          toolSourceSave.style.display = 'none';
          toolSourceSave.id = 'foreign_save';
          // unbind()
          // const oldElement = $id('tool_source_save');
          // oldElement.parentNode.replaceChild(toolSourceSave, oldElement);
          $id('tool_source_back').append(toolSourceSave);
          toolSourceSave.addEventListener('click', () => function () {
            if (!editingforeign) { return; }

            if (!setForeignString($id('svg_source_textarea').value)) {
              const ok = seConfirm('Errors found. Revert to original?');
              if (!ok) { return; }
              endChanges();
            } else {
              endChanges();
            }
            // setSelectMode();
          });

          const oldToolSourceCancel = $id('tool_source_cancel');
          const toolSourceCancel = oldToolSourceCancel.cloneNode(true);
          toolSourceCancel.style.display = 'none';
          toolSourceCancel.id = 'foreign_cancel';
          $id('tool_source_back').append(toolSourceCancel);
          toolSourceCancel.addEventListener('click', () => function () {
            endChanges();
          });
          // unbind()
          // var oldToolSourceCancel = $id('tool_source_cancel');
          // oldToolSourceCancel.parentNode.replaceChild(toolSourceCancel, oldToolSourceCancel);

        }, 3000);
      },
      mouseDown (opts) {
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
        return {
          started: true
        };
      },
      mouseUp (_opts) {
        // const e = opts.event;
        if (svgCanvas.getMode() !== 'foreign' || !started) {
          return undefined;
        }
        const attrs = {
          width: newFO.getAttribute('width'),
          height: newFO.getAttribute('height')
        };
        const keep = (attrs.width !== '0' || attrs.height !== '0');
        svgCanvas.addToSelection([ newFO ], true);

        return {
          keep,
          element: newFO
        };
      },
      selectedChanged (opts) {
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
      },
      elementChanged (_opts) {
        // const elem = opts.elems[0];
      }
    };
  }
};
