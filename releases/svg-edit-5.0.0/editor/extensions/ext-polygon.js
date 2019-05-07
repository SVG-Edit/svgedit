/**
 * ext-polygon.js
 *
 *
 * @copyright 2010 CloudCanvas, Inc. All rights reserved
 *
 */
export default {
  name: 'polygon',
  async init (S) {
    const svgEditor = this;
    const svgCanvas = svgEditor.canvas;
    const {$, importLocale} = S, // {svgcontent}
      // addElem = svgCanvas.addSVGElementFromJson,
      editingitex = false;
    const strings = await importLocale();
    let selElems,
      // svgdoc = S.svgroot.parentNode.ownerDocument,
      // newFOG, newFOGParent, newDef, newImageName, newMaskID, modeChangeG,
      // edg = 0,
      // undoCommand = 'Not image';
      started, newFO;

    // const ccZoom;
    // const wEl, hEl;
    // const wOffset, hOffset;
    // const ccRBG;
    // const ccOpacity;
    // const brushW, brushH;

    // const ccDebug = document.getElementById('debugpanel');

    /* const properlySourceSizeTextArea = function(){
     // TODO: remove magic numbers here and get values from CSS
     const height = $('#svg_source_container').height() - 80;
     $('#svg_source_textarea').css('height', height);
     }; */

    /**
    * @param {boolean} on
    * @returns {void}
    */
    function showPanel (on) {
      let fcRules = $('#fc_rules');
      if (!fcRules.length) {
        fcRules = $('<style id="fc_rules"></style>').appendTo('head');
      }
      fcRules.text(!on ? '' : ' #tool_topath { display: none !important; }');
      $('#polygon_panel').toggle(on);
    }

    /*
    function toggleSourceButtons(on){
      $('#tool_source_save, #tool_source_cancel').toggle(!on);
      $('#polygon_save, #polygon_cancel').toggle(on);
    }
    */

    /**
    * @param {string} attr
    * @param {string|Float} val
    * @returns {void}
    */
    function setAttr (attr, val) {
      svgCanvas.changeSelectedAttribute(attr, val);
      svgCanvas.call('changed', selElems);
    }

    /**
    * @param {Float} n
    * @returns {Float}
    */
    function cot (n) {
      return 1 / Math.tan(n);
    }

    /**
    * @param {Float} n
    * @returns {Float}
    */
    function sec (n) {
      return 1 / Math.cos(n);
    }

    /**
    * Obtained from http://code.google.com/p/passenger-top/source/browse/instiki/public/svg-edit/editor/extensions/ext-itex.js?r=3
    * This function sets the content of of the currently-selected foreignObject element,
    *   based on the itex contained in string.
    * @param {string} tex The itex text.
    * @returns {boolean} This function returns false if the set was unsuccessful, true otherwise.
    */
    /*
    function setItexString(tex) {
      const mathns = 'http://www.w3.org/1998/Math/MathML',
        xmlnsns = 'http://www.w3.org/2000/xmlns/',
        ajaxEndpoint = '../../itex';
      const elt = selElems[0];
      try {
        const math = svgdoc.createElementNS(mathns, 'math');
        math.setAttributeNS(xmlnsns, 'xmlns', mathns);
        math.setAttribute('display', 'inline');
        const semantics = document.createElementNS(mathns, 'semantics');
        const annotation = document.createElementNS(mathns, 'annotation');
        annotation.setAttribute('encoding', 'application/x-tex');
        annotation.textContent = tex;
        const mrow = document.createElementNS(mathns, 'mrow');
        semantics.append(mrow, annotation);
        math.append(semantics);
        // make an AJAX request to the server, to get the MathML
        $.post(ajaxEndpoint, {tex, display: 'inline'}, function(data){
          const children = data.documentElement.childNodes;
          while (children.length > 0) {
             mrow.append(svgdoc.adoptNode(children[0], true));
          }
          svgCanvas.sanitizeSvg(math);
          svgCanvas.call('changed', [elt]);
        });
        elt.firstChild.replaceWith(math);
        svgCanvas.call('changed', [elt]);
        svgCanvas.clearSelection();
      } catch(e) {
        console.log(e);
        return false;
      }

      return true;
    }
    */
    const buttons = [{
      id: 'tool_polygon',
      icon: svgEditor.curConfig.extIconsPath + 'polygon.png',
      type: 'mode',
      position: 11,
      events: {
        click () {
          svgCanvas.setMode('polygon');
          showPanel(true);
        }
      }
    }];
    const contextTools = [{
      type: 'input',
      panel: 'polygon_panel',
      id: 'polySides',
      size: 3,
      defval: 5,
      events: {
        change () {
          setAttr('sides', this.value);
        }
      }
    }];
    return {
      name: strings.name,
      svgicons: svgEditor.curConfig.extIconsPath + 'polygon-icons.svg',
      buttons: strings.buttons.map((button, i) => {
        return Object.assign(buttons[i], button);
      }),
      context_tools: strings.contextTools.map((contextTool, i) => {
        return Object.assign(contextTools[i], contextTool);
      }),

      callback () {
        $('#polygon_panel').hide();

        const endChanges = function () {
          // Todo: Missing?
        };

        // TODO: Needs to be done after orig icon loads
        setTimeout(function () {
          // Create source save/cancel buttons
          /* const save = */ $('#tool_source_save').clone().hide().attr('id', 'polygon_save').unbind().appendTo('#tool_source_back').click(function () {
            if (!editingitex) {
              return;
            }
            // Todo: Uncomment the setItexString() function above and handle ajaxEndpoint?
            /*
            if (!setItexString($('#svg_source_textarea').val())) {
              const ok = await $.confirm('Errors found. Revert to original?', function (ok) {
              if (!ok) {
                return false;
              }
              endChanges();
            } else { */
            endChanges();
            // }
            // setSelectMode();
          });

          /* const cancel = */ $('#tool_source_cancel').clone().hide().attr('id', 'polygon_cancel').unbind().appendTo('#tool_source_back').click(function () {
            endChanges();
          });
        }, 3000);
      },
      mouseDown (opts) {
        if (svgCanvas.getMode() !== 'polygon') {
          return undefined;
        }
        // const e = opts.event;
        const rgb = svgCanvas.getColor('fill');
        // const ccRgbEl = rgb.substring(1, rgb.length);
        const sRgb = svgCanvas.getColor('stroke');
        // ccSRgbEl = sRgb.substring(1, rgb.length);
        const sWidth = svgCanvas.getStrokeWidth();

        started = true;

        newFO = svgCanvas.addSVGElementFromJson({
          element: 'polygon',
          attr: {
            cx: opts.start_x,
            cy: opts.start_y,
            id: svgCanvas.getNextId(),
            shape: 'regularPoly',
            sides: document.getElementById('polySides').value,
            orient: 'x',
            edge: 0,
            fill: rgb,
            strokecolor: sRgb,
            strokeWidth: sWidth
          }
        });

        return {
          started: true
        };
      },
      mouseMove (opts) {
        if (!started || svgCanvas.getMode() !== 'polygon') {
          return undefined;
        }
        // const e = opts.event;
        const c = $(newFO).attr(['cx', 'cy', 'sides', 'orient', 'fill', 'strokecolor', 'strokeWidth']);
        let x = opts.mouse_x;
        let y = opts.mouse_y;
        const {cx, cy, fill, strokecolor, strokeWidth, sides} = c, // {orient} = c,
          edg = (Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy))) / 1.5;
        newFO.setAttribute('edge', edg);

        const inradius = (edg / 2) * cot(Math.PI / sides);
        const circumradius = inradius * sec(Math.PI / sides);
        let points = '';
        for (let s = 0; sides >= s; s++) {
          const angle = 2.0 * Math.PI * s / sides;
          x = (circumradius * Math.cos(angle)) + cx;
          y = (circumradius * Math.sin(angle)) + cy;

          points += x + ',' + y + ' ';
        }

        // const poly = newFO.createElementNS(NS.SVG, 'polygon');
        newFO.setAttribute('points', points);
        newFO.setAttribute('fill', fill);
        newFO.setAttribute('stroke', strokecolor);
        newFO.setAttribute('stroke-width', strokeWidth);
        // newFO.setAttribute('transform', 'rotate(-90)');
        // const shape = newFO.getAttribute('shape');
        // newFO.append(poly);
        // DrawPoly(cx, cy, sides, edg, orient);
        return {
          started: true
        };
      },

      mouseUp (opts) {
        if (svgCanvas.getMode() !== 'polygon') {
          return undefined;
        }
        const attrs = $(newFO).attr('edge');
        const keep = (attrs.edge !== '0');
        // svgCanvas.addToSelection([newFO], true);
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
          if (elem && elem.getAttribute('shape') === 'regularPoly') {
            if (opts.selectedElement && !opts.multiselected) {
              $('#polySides').val(elem.getAttribute('sides'));

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
