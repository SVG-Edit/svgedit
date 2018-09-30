/* globals jQuery */
/**
 * ext-connector.js
 *
 * @license MIT
 *
 * @copyright 2010 Alexis Deveria
 *
 */

export default {
  name: 'connector',
  async init (S) {
    const $ = jQuery;
    const svgEditor = this;
    const svgCanvas = svgEditor.canvas;
    const {getElem} = svgCanvas;
    const {svgroot, importLocale} = S,
      addElem = svgCanvas.addSVGElementFromJson,
      selManager = S.selectorManager,
      connSel = '.se_connector',
      // connect_str = '-SE_CONNECT-',
      elData = $.data;
    const strings = await importLocale();

    let startX,
      startY,
      curLine,
      startElem,
      endElem,
      seNs,
      {svgcontent} = S,
      started = false,
      connections = [],
      selElems = [];

    function getBBintersect (x, y, bb, offset) {
      if (offset) {
        offset -= 0;
        bb = $.extend({}, bb);
        bb.width += offset;
        bb.height += offset;
        bb.x -= offset / 2;
        bb.y -= offset / 2;
      }

      const midX = bb.x + bb.width / 2;
      const midY = bb.y + bb.height / 2;
      const lenX = x - midX;
      const lenY = y - midY;

      const slope = Math.abs(lenY / lenX);

      let ratio;
      if (slope < bb.height / bb.width) {
        ratio = (bb.width / 2) / Math.abs(lenX);
      } else {
        ratio = lenY
          ? (bb.height / 2) / Math.abs(lenY)
          : 0;
      }

      return {
        x: midX + lenX * ratio,
        y: midY + lenY * ratio
      };
    }

    function getOffset (side, line) {
      const giveOffset = !!line.getAttribute('marker-' + side);
      // const giveOffset = $(line).data(side+'_off');

      // TODO: Make this number (5) be based on marker width/height
      const size = line.getAttribute('stroke-width') * 5;
      return giveOffset ? size : 0;
    }

    function showPanel (on) {
      let connRules = $('#connector_rules');
      if (!connRules.length) {
        connRules = $('<style id="connector_rules"></style>').appendTo('head');
      }
      connRules.text(!on ? '' : '#tool_clone, #tool_topath, #tool_angle, #xy_panel { display: none !important; }');
      $('#connector_panel').toggle(on);
    }

    function setPoint (elem, pos, x, y, setMid) {
      const pts = elem.points;
      const pt = svgroot.createSVGPoint();
      pt.x = x;
      pt.y = y;
      if (pos === 'end') { pos = pts.numberOfItems - 1; }
      // TODO: Test for this on init, then use alt only if needed
      try {
        pts.replaceItem(pt, pos);
      } catch (err) {
        // Should only occur in FF which formats points attr as "n,n n,n", so just split
        const ptArr = elem.getAttribute('points').split(' ');
        for (let i = 0; i < ptArr.length; i++) {
          if (i === pos) {
            ptArr[i] = x + ',' + y;
          }
        }
        elem.setAttribute('points', ptArr.join(' '));
      }

      if (setMid) {
        // Add center point
        const ptStart = pts.getItem(0);
        const ptEnd = pts.getItem(pts.numberOfItems - 1);
        setPoint(elem, 1, (ptEnd.x + ptStart.x) / 2, (ptEnd.y + ptStart.y) / 2);
      }
    }

    function updateLine (diffX, diffY) {
      // Update line with element
      let i = connections.length;
      while (i--) {
        const conn = connections[i];
        const line = conn.connector;
        // const {elem} = conn;

        const pre = conn.is_start ? 'start' : 'end';
        // const sw = line.getAttribute('stroke-width') * 5;

        // Update bbox for this element
        const bb = elData(line, pre + '_bb');
        bb.x = conn.start_x + diffX;
        bb.y = conn.start_y + diffY;
        elData(line, pre + '_bb', bb);

        const altPre = conn.is_start ? 'end' : 'start';

        // Get center pt of connected element
        const bb2 = elData(line, altPre + '_bb');
        const srcX = bb2.x + bb2.width / 2;
        const srcY = bb2.y + bb2.height / 2;

        // Set point of element being moved
        const pt = getBBintersect(srcX, srcY, bb, getOffset(pre, line)); // $(line).data(pre+'_off')?sw:0
        setPoint(line, conn.is_start ? 0 : 'end', pt.x, pt.y, true);

        // Set point of connected element
        const pt2 = getBBintersect(pt.x, pt.y, elData(line, altPre + '_bb'), getOffset(altPre, line));
        setPoint(line, conn.is_start ? 'end' : 0, pt2.x, pt2.y, true);
      }
    }

    /**
    *
    * @param {Element[]} [elem=selElems] Array of elements
    */
    function findConnectors (elems = selElems) {
      const connectors = $(svgcontent).find(connSel);
      connections = [];

      // Loop through connectors to see if one is connected to the element
      connectors.each(function () {
        let addThis;
        function add () {
          if (elems.includes(this)) {
            // Pretend this element is selected
            addThis = true;
          }
        }

        // Grab the ends
        const parts = [];
        ['start', 'end'].forEach(function (pos, i) {
          const key = 'c_' + pos;
          let part = elData(this, key);
          if (part == null) {
            part = document.getElementById(
              this.attributes['se:connector'].value.split(' ')[i]
            );
            elData(this, 'c_' + pos, part.id);
            elData(this, pos + '_bb', svgCanvas.getStrokedBBox([part]));
          } else part = document.getElementById(part);
          parts.push(part);
        }.bind(this));

        for (let i = 0; i < 2; i++) {
          const cElem = parts[i];

          addThis = false;
          // The connected element might be part of a selected group
          $(cElem).parents().each(add);

          if (!cElem || !cElem.parentNode) {
            $(this).remove();
            continue;
          }
          if (elems.includes(cElem) || addThis) {
            const bb = svgCanvas.getStrokedBBox([cElem]);
            connections.push({
              elem: cElem,
              connector: this,
              is_start: (i === 0),
              start_x: bb.x,
              start_y: bb.y
            });
          }
        }
      });
    }

    function updateConnectors (elems) {
      // Updates connector lines based on selected elements
      // Is not used on mousemove, as it runs getStrokedBBox every time,
      // which isn't necessary there.
      findConnectors(elems);
      if (connections.length) {
        // Update line with element
        let i = connections.length;
        while (i--) {
          const conn = connections[i];
          const line = conn.connector;
          const {elem} = conn;

          // const sw = line.getAttribute('stroke-width') * 5;
          const pre = conn.is_start ? 'start' : 'end';

          // Update bbox for this element
          const bb = svgCanvas.getStrokedBBox([elem]);
          bb.x = conn.start_x;
          bb.y = conn.start_y;
          elData(line, pre + '_bb', bb);
          /* const addOffset = */ elData(line, pre + '_off');

          const altPre = conn.is_start ? 'end' : 'start';

          // Get center pt of connected element
          const bb2 = elData(line, altPre + '_bb');
          const srcX = bb2.x + bb2.width / 2;
          const srcY = bb2.y + bb2.height / 2;

          // Set point of element being moved
          let pt = getBBintersect(srcX, srcY, bb, getOffset(pre, line));
          setPoint(line, conn.is_start ? 0 : 'end', pt.x, pt.y, true);

          // Set point of connected element
          const pt2 = getBBintersect(pt.x, pt.y, elData(line, altPre + '_bb'), getOffset(altPre, line));
          setPoint(line, conn.is_start ? 'end' : 0, pt2.x, pt2.y, true);

          // Update points attribute manually for webkit
          if (navigator.userAgent.includes('AppleWebKit')) {
            const pts = line.points;
            const len = pts.numberOfItems;
            const ptArr = [];
            for (let j = 0; j < len; j++) {
              pt = pts.getItem(j);
              ptArr[j] = pt.x + ',' + pt.y;
            }
            line.setAttribute('points', ptArr.join(' '));
          }
        }
      }
    }

    // Do once
    (function () {
      const gse = svgCanvas.groupSelectedElements;

      svgCanvas.groupSelectedElements = function () {
        svgCanvas.removeFromSelection($(connSel).toArray());
        return gse.apply(this, arguments);
      };

      const mse = svgCanvas.moveSelectedElements;

      svgCanvas.moveSelectedElements = function () {
        const cmd = mse.apply(this, arguments);
        updateConnectors();
        return cmd;
      };

      seNs = svgCanvas.getEditorNS();
    }());

    // Do on reset
    function init () {
      // Make sure all connectors have data set
      $(svgcontent).find('*').each(function () {
        const conn = this.getAttributeNS(seNs, 'connector');
        if (conn) {
          this.setAttribute('class', connSel.substr(1));
          const connData = conn.split(' ');
          const sbb = svgCanvas.getStrokedBBox([getElem(connData[0])]);
          const ebb = svgCanvas.getStrokedBBox([getElem(connData[1])]);
          $(this).data('c_start', connData[0])
            .data('c_end', connData[1])
            .data('start_bb', sbb)
            .data('end_bb', ebb);
          svgCanvas.getEditorNS(true);
        }
      });
      // updateConnectors();
    }

    // $(svgroot).parent().mousemove(function (e) {
    // // if (started
    // //   || svgCanvas.getMode() !== 'connector'
    // //  || e.target.parentNode.parentNode !== svgcontent) return;
    //
    // console.log('y')
    // // if (e.target.parentNode.parentNode === svgcontent) {
    // //
    // // }
    // });

    const buttons = [{
      id: 'mode_connect',
      type: 'mode',
      icon: svgEditor.curConfig.imgPath + 'cut.png',
      includeWith: {
        button: '#tool_line',
        isDefault: false,
        position: 1
      },
      events: {
        click () {
          svgCanvas.setMode('connector');
        }
      }
    }];

    return {
      name: strings.name,
      svgicons: svgEditor.curConfig.imgPath + 'conn.svg',
      buttons: strings.buttons.map((button, i) => {
        return Object.assign(buttons[i], button);
      }),
      async addLangData ({lang, importLocale}) {
        return {
          data: strings.langList
        };
      },
      mouseDown (opts) {
        const e = opts.event;
        startX = opts.start_x;
        startY = opts.start_y;
        const mode = svgCanvas.getMode();
        const {curConfig: {initStroke}} = svgEditor;

        if (mode === 'connector') {
          if (started) { return; }

          const mouseTarget = e.target;

          const parents = $(mouseTarget).parents();

          if ($.inArray(svgcontent, parents) !== -1) {
            // Connectable element

            // If child of foreignObject, use parent
            const fo = $(mouseTarget).closest('foreignObject');
            startElem = fo.length ? fo[0] : mouseTarget;

            // Get center of source element
            const bb = svgCanvas.getStrokedBBox([startElem]);
            const x = bb.x + bb.width / 2;
            const y = bb.y + bb.height / 2;

            started = true;
            curLine = addElem({
              element: 'polyline',
              attr: {
                id: svgCanvas.getNextId(),
                points: (x + ',' + y + ' ' + x + ',' + y + ' ' + startX + ',' + startY),
                stroke: '#' + initStroke.color,
                'stroke-width': (!startElem.stroke_width || startElem.stroke_width === 0)
                  ? initStroke.width
                  : startElem.stroke_width,
                fill: 'none',
                opacity: initStroke.opacity,
                style: 'pointer-events:none'
              }
            });
            elData(curLine, 'start_bb', bb);
          }
          return {
            started: true
          };
        }
        if (mode === 'select') {
          findConnectors();
        }
      },
      mouseMove (opts) {
        const zoom = svgCanvas.getZoom();
        // const e = opts.event;
        const x = opts.mouse_x / zoom;
        const y = opts.mouse_y / zoom;

        const diffX = x - startX,
          diffY = y - startY;

        const mode = svgCanvas.getMode();

        if (mode === 'connector' && started) {
          // const sw = curLine.getAttribute('stroke-width') * 3;
          // Set start point (adjusts based on bb)
          const pt = getBBintersect(x, y, elData(curLine, 'start_bb'), getOffset('start', curLine));
          startX = pt.x;
          startY = pt.y;

          setPoint(curLine, 0, pt.x, pt.y, true);

          // Set end point
          setPoint(curLine, 'end', x, y, true);
        } else if (mode === 'select') {
          let slen = selElems.length;
          while (slen--) {
            const elem = selElems[slen];
            // Look for selected connector elements
            if (elem && elData(elem, 'c_start')) {
              // Remove the "translate" transform given to move
              svgCanvas.removeFromSelection([elem]);
              svgCanvas.getTransformList(elem).clear();
            }
          }
          if (connections.length) {
            updateLine(diffX, diffY);
          }
        }
      },
      mouseUp (opts) {
        // const zoom = svgCanvas.getZoom();
        const e = opts.event;
        // , x = opts.mouse_x / zoom,
        // , y = opts.mouse_y / zoom,
        let mouseTarget = e.target;

        if (svgCanvas.getMode() !== 'connector') {
          return;
        }
        const fo = $(mouseTarget).closest('foreignObject');
        if (fo.length) { mouseTarget = fo[0]; }

        const parents = $(mouseTarget).parents();

        if (mouseTarget === startElem) {
          // Start line through click
          started = true;
          return {
            keep: true,
            element: null,
            started
          };
        }
        if ($.inArray(svgcontent, parents) === -1) {
          // Not a valid target element, so remove line
          $(curLine).remove();
          started = false;
          return {
            keep: false,
            element: null,
            started
          };
        }
        // Valid end element
        endElem = mouseTarget;

        const startId = startElem.id, endId = endElem.id;
        const connStr = startId + ' ' + endId;
        const altStr = endId + ' ' + startId;
        // Don't create connector if one already exists
        const dupe = $(svgcontent).find(connSel).filter(function () {
          const conn = this.getAttributeNS(seNs, 'connector');
          if (conn === connStr || conn === altStr) { return true; }
        });
        if (dupe.length) {
          $(curLine).remove();
          return {
            keep: false,
            element: null,
            started: false
          };
        }

        const bb = svgCanvas.getStrokedBBox([endElem]);

        const pt = getBBintersect(startX, startY, bb, getOffset('start', curLine));
        setPoint(curLine, 'end', pt.x, pt.y, true);
        $(curLine)
          .data('c_start', startId)
          .data('c_end', endId)
          .data('end_bb', bb);
        seNs = svgCanvas.getEditorNS(true);
        curLine.setAttributeNS(seNs, 'se:connector', connStr);
        curLine.setAttribute('class', connSel.substr(1));
        curLine.setAttribute('opacity', 1);
        svgCanvas.addToSelection([curLine]);
        svgCanvas.moveToBottomSelectedElement();
        selManager.requestSelector(curLine).showGrips(false);
        started = false;
        return {
          keep: true,
          element: curLine,
          started
        };
      },
      selectedChanged (opts) {
        // TODO: Find better way to skip operations if no connectors are in use
        if (!$(svgcontent).find(connSel).length) { return; }

        if (svgCanvas.getMode() === 'connector') {
          svgCanvas.setMode('select');
        }

        // Use this to update the current selected elements
        selElems = opts.elems;

        let i = selElems.length;
        while (i--) {
          const elem = selElems[i];
          if (elem && elData(elem, 'c_start')) {
            selManager.requestSelector(elem).showGrips(false);
            if (opts.selectedElement && !opts.multiselected) {
              // TODO: Set up context tools and hide most regular line tools
              showPanel(true);
            } else {
              showPanel(false);
            }
          } else {
            showPanel(false);
          }
        }
        updateConnectors();
      },
      elementChanged (opts) {
        let elem = opts.elems[0];
        if (elem && elem.tagName === 'svg' && elem.id === 'svgcontent') {
          // Update svgcontent (can change on import)
          svgcontent = elem;
          init();
        }

        // Has marker, so change offset
        if (elem && (
          elem.getAttribute('marker-start') ||
          elem.getAttribute('marker-mid') ||
          elem.getAttribute('marker-end')
        )) {
          const start = elem.getAttribute('marker-start');
          const mid = elem.getAttribute('marker-mid');
          const end = elem.getAttribute('marker-end');
          curLine = elem;
          $(elem)
            .data('start_off', !!start)
            .data('end_off', !!end);

          if (elem.tagName === 'line' && mid) {
            // Convert to polyline to accept mid-arrow

            const x1 = Number(elem.getAttribute('x1'));
            const x2 = Number(elem.getAttribute('x2'));
            const y1 = Number(elem.getAttribute('y1'));
            const y2 = Number(elem.getAttribute('y2'));
            const {id} = elem;

            const midPt = (' ' + ((x1 + x2) / 2) + ',' + ((y1 + y2) / 2) + ' ');
            const pline = addElem({
              element: 'polyline',
              attr: {
                points: (x1 + ',' + y1 + midPt + x2 + ',' + y2),
                stroke: elem.getAttribute('stroke'),
                'stroke-width': elem.getAttribute('stroke-width'),
                'marker-mid': mid,
                fill: 'none',
                opacity: elem.getAttribute('opacity') || 1
              }
            });
            $(elem).after(pline).remove();
            svgCanvas.clearSelection();
            pline.id = id;
            svgCanvas.addToSelection([pline]);
            elem = pline;
          }
        }
        // Update line if it's a connector
        if (elem.getAttribute('class') === connSel.substr(1)) {
          const start = getElem(elData(elem, 'c_start'));
          updateConnectors([start]);
        } else {
          updateConnectors();
        }
      },
      IDsUpdated (input) {
        const remove = [];
        input.elems.forEach(function (elem) {
          if ('se:connector' in elem.attr) {
            elem.attr['se:connector'] = elem.attr['se:connector'].split(' ')
              .map(function (oldID) { return input.changes[oldID]; }).join(' ');

            // Check validity - the field would be something like 'svg_21 svg_22', but
            // if one end is missing, it would be 'svg_21' and therefore fail this test
            if (!/. ./.test(elem.attr['se:connector'])) {
              remove.push(elem.attr.id);
            }
          }
        });
        return {remove};
      },
      toolButtonStateUpdate (opts) {
        if (opts.nostroke) {
          if ($('#mode_connect').hasClass('tool_button_current')) {
            svgEditor.clickSelect();
          }
        }
        $('#mode_connect')
          .toggleClass('disabled', opts.nostroke);
      }
    };
  }
};
