/* globals jQuery */
/**
 * ext-foreignobject.js
 *
 * @license Apache-2.0
 *
 * @copyright 2010 Jacques Distler, 2010 Alexis Deveria
 *
 */

export default {
  name: 'foreignobject',
  async init (S) {
    const svgEditor = this;
    const {text2xml, NS, importLocale} = S;
    const $ = jQuery;
    const svgCanvas = svgEditor.canvas;
    const
      // {svgcontent} = S,
      // addElem = svgCanvas.addSVGElementFromJson,
      svgdoc = S.svgroot.parentNode.ownerDocument;
    const strings = await importLocale();

    const properlySourceSizeTextArea = function () {
      // TODO: remove magic numbers here and get values from CSS
      const height = $('#svg_source_container').height() - 80;
      $('#svg_source_textarea').css('height', height);
    };

    function showPanel (on) {
      let fcRules = $('#fc_rules');
      if (!fcRules.length) {
        fcRules = $('<style id="fc_rules"></style>').appendTo('head');
      }
      fcRules.text(!on ? '' : ' #tool_topath { display: none !important; }');
      $('#foreignObject_panel').toggle(on);
    }

    function toggleSourceButtons (on) {
      $('#tool_source_save, #tool_source_cancel').toggle(!on);
      $('#foreign_save, #foreign_cancel').toggle(on);
    }

    let selElems,
      started,
      newFO,
      editingforeign = false;

    /**
    * This function sets the content of element elt to the input XML.
    * @param {string} xmlString - The XML text
    * @param {Element} elt - the parent element to append to
    * @returns {boolean} This function returns false if the set was unsuccessful, true otherwise.
    */
    function setForeignString (xmlString) {
      const elt = selElems[0];
      try {
        // convert string into XML document
        const newDoc = text2xml('<svg xmlns="' + NS.SVG + '" xmlns:xlink="' + NS.XLINK + '">' + xmlString + '</svg>');
        // run it through our sanitizer to remove anything we do not support
        svgCanvas.sanitizeSvg(newDoc.documentElement);
        elt.replaceWith(svgdoc.importNode(newDoc.documentElement.firstChild, true));
        svgCanvas.call('changed', [elt]);
        svgCanvas.clearSelection();
      } catch (e) {
        console.log(e);
        return false;
      }

      return true;
    }

    function showForeignEditor () {
      const elt = selElems[0];
      if (!elt || editingforeign) { return; }
      editingforeign = true;
      toggleSourceButtons(true);
      elt.removeAttribute('fill');

      const str = svgCanvas.svgToString(elt, 0);
      $('#svg_source_textarea').val(str);
      $('#svg_source_editor').fadeIn();
      properlySourceSizeTextArea();
      $('#svg_source_textarea').focus();
    }

    function setAttr (attr, val) {
      svgCanvas.changeSelectedAttribute(attr, val);
      svgCanvas.call('changed', selElems);
    }

    const buttons = [{
      id: 'tool_foreign',
      icon: svgEditor.curConfig.extIconsPath + 'foreignobject-tool.png',
      type: 'mode',
      events: {
        click () {
          svgCanvas.setMode('foreign');
        }
      }
    }, {
      id: 'edit_foreign',
      icon: svgEditor.curConfig.extIconsPath + 'foreignobject-edit.png',
      type: 'context',
      panel: 'foreignObject_panel',
      events: {
        click () {
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
      svgicons: svgEditor.curConfig.extIconsPath + 'foreignobject-icons.xml',
      buttons: strings.buttons.map((button, i) => {
        return Object.assign(buttons[i], button);
      }),
      context_tools: strings.contextTools.map((contextTool, i) => {
        return Object.assign(contextTools[i], contextTool);
      }),
      callback () {
        $('#foreignObject_panel').hide();

        const endChanges = function () {
          $('#svg_source_editor').hide();
          editingforeign = false;
          $('#svg_source_textarea').blur();
          toggleSourceButtons(false);
        };

        // TODO: Needs to be done after orig icon loads
        setTimeout(function () {
          // Create source save/cancel buttons
          /* const save = */ $('#tool_source_save').clone()
            .hide().attr('id', 'foreign_save').unbind()
            .appendTo('#tool_source_back').click(function () {
              if (!editingforeign) { return; }

              if (!setForeignString($('#svg_source_textarea').val())) {
                $.confirm('Errors found. Revert to original?', function (ok) {
                  if (!ok) { return false; }
                  endChanges();
                });
              } else {
                endChanges();
              }
              // setSelectMode();
            });

          /* const cancel = */ $('#tool_source_cancel').clone()
            .hide().attr('id', 'foreign_cancel').unbind()
            .appendTo('#tool_source_back').click(function () {
              endChanges();
            });
        }, 3000);
      },
      mouseDown (opts) {
        // const e = opts.event;

        if (svgCanvas.getMode() === 'foreign') {
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
        }
      },
      mouseUp (opts) {
        // const e = opts.event;
        if (svgCanvas.getMode() === 'foreign' && started) {
          const attrs = $(newFO).attr(['width', 'height']);
          const keep = (attrs.width !== '0' || attrs.height !== '0');
          svgCanvas.addToSelection([newFO], true);

          return {
            keep,
            element: newFO
          };
        }
      },
      selectedChanged (opts) {
        // Use this to update the current selected elements
        selElems = opts.elems;

        let i = selElems.length;
        while (i--) {
          const elem = selElems[i];
          if (elem && elem.tagName === 'foreignObject') {
            if (opts.selectedElement && !opts.multiselected) {
              $('#foreign_font_size').val(elem.getAttribute('font-size'));
              $('#foreign_width').val(elem.getAttribute('width'));
              $('#foreign_height').val(elem.getAttribute('height'));
              showPanel(true);
            } else {
              showPanel(false);
            }
          } else {
            showPanel(false);
          }
        }
      },
      elementChanged (opts) {
        // const elem = opts.elems[0];
      }
    };
  }
};
