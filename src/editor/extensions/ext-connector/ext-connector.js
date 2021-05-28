/**
 * @file ext-connector.js
 *
 * @license MIT
 *
 * @copyright 2010 Alexis Deveria
 *
 */

const name = "connector";

const loadExtensionTranslation = async function (svgEditor) {
  let translationModule;
  const lang = svgEditor.configObj.pref('lang');
  try {
    // eslint-disable-next-line no-unsanitized/method
    translationModule = await import(`./locale/${lang}.js`);
  } catch (_error) {
    // eslint-disable-next-line no-console
    console.warn(`Missing translation (${lang}) for ${name} - using 'en'`);
    // eslint-disable-next-line no-unsanitized/method
    translationModule = await import(`./locale/en.js`);
  }
  svgEditor.i18next.addResourceBundle(lang, name, translationModule.default);
};

export default {
  name,
  async init(S) {
    const svgEditor = this;
    const { svgCanvas } = svgEditor;
    const { getElem, $id, mergeDeep } = svgCanvas;
    const { svgroot } = S;
    const addElem = svgCanvas.addSVGElementFromJson;
    const selManager = S.selectorManager;
    await loadExtensionTranslation(svgEditor);

    let startX;
    let startY;
    let curLine;
    let startElem;
    let endElem;
    let seNs;
    let { svgcontent } = S;
    let started = false;
    let connections = [];
    let selElems = [];

    /**
     *
     * @param {Float} x
     * @param {Float} y
     * @param {module:utilities.BBoxObject} bb
     * @param {Float} offset
     * @returns {module:math.XYObject}
     */
    const getBBintersect = (x, y, bb, offset) => {
      if (offset) {
        offset -= 0;
        bb = mergeDeep({}, bb);
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
    };

    /**
    * @param {"start"|"end"} side
    * @param {Element} line
    * @returns {Float}
    */
    const getOffset = (side, line) => {
      const giveOffset = line.getAttribute('marker-' + side);

      // TODO: Make this number (5) be based on marker width/height
      const size = line.getAttribute('stroke-width') * 5;
      return giveOffset ? size : 0;
    };

    /**
    * @param {boolean} on
    * @returns {void}
    */
    const showPanel = (on) => {
      let connRules = $id('connector_rules');
      if (!connRules) {
        connRules = document.createElement('style');
        connRules.setAttribute('id', 'connector_rules');
        document.getElementsByTagName("head")[0].appendChild(connRules);
      }
      connRules.textContent = (!on ? '' : '#tool_clone, #tool_topath, #tool_angle, #xy_panel { display: none !important; }');
      if ($id('connector_panel'))
        $id('connector_panel').style.display = (on) ? 'block' : 'none';
    };

    /**
     * @param {Element} elem
     * @param {Integer|"end"} pos
     * @param {Float} x
     * @param {Float} y
     * @param {boolean} [setMid]
     * @returns {void}
    */
    const setPoint = (elem, pos, x, y, setMid) => {
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
    };

    /**
    * @param {Float} diffX
    * @param {Float} diffY
    * @returns {void}
    */
    const updateLine = (diffX, diffY) => {
      const dataStorage = svgCanvas.getDataStorage();
      // Update line with element
      let i = connections.length;
      while (i--) {
        const conn = connections[i];
        const line = conn.connector;
        // const {elem} = conn;

        const pre = conn.is_start ? 'start' : 'end';
        // const sw = line.getAttribute('stroke-width') * 5;

        // Update bbox for this element
        const bb = dataStorage.get(line, pre + '_bb');
        bb.x = conn.start_x + diffX;
        bb.y = conn.start_y + diffY;
        dataStorage.put(line, pre + '_bb', bb);

        const altPre = conn.is_start ? 'end' : 'start';

        // Get center pt of connected element
        const bb2 = dataStorage.get(line, altPre + '_bb');
        const srcX = bb2.x + bb2.width / 2;
        const srcY = bb2.y + bb2.height / 2;

        // Set point of element being moved
        const pt = getBBintersect(srcX, srcY, bb, getOffset(pre, line));
        setPoint(line, conn.is_start ? 0 : 'end', pt.x, pt.y, true);

        // Set point of connected element
        const pt2 = getBBintersect(pt.x, pt.y, dataStorage.get(line, altPre + '_bb'), getOffset(altPre, line));
        setPoint(line, conn.is_start ? 'end' : 0, pt2.x, pt2.y, true);
      }
    };

    /**
    *
    * @param {Element[]} [elems=selElems] Array of elements
    * @returns {void}
    */
    const findConnectors = (elems = selElems) => {
      const dataStorage = svgCanvas.getDataStorage();
      // const connectors = svgcontent.querySelectorAll('.se_connector');
      const connectors = svgcontent.querySelectorAll('.se_connector');
      connections = [];

      // Loop through connectors to see if one is connected to the element
      Array.prototype.forEach.call(connectors, function (ethis) {
        let addThis;
        // Grab the ends
        const parts = [];
        [ 'start', 'end' ].forEach(function (pos, i) {
          const key = 'c_' + pos;
          let part = dataStorage.get(ethis, key);
          if (part === null || part === undefined) { // Does this ever return nullish values?
            part = document.getElementById(
              ethis.attributes['se:connector'].value.split(' ')[i]
            );
            dataStorage.put(ethis, 'c_' + pos, part.id);
            dataStorage.put(ethis, pos + '_bb', svgCanvas.getStrokedBBox([ part ]));
          } else part = document.getElementById(part);
          parts.push(part);
        }, ethis);

        for (let i = 0; i < 2; i++) {
          const cElem = parts[i];

          addThis = false;
          // The connected element might be part of a selected group
          const parents = svgCanvas.getParents(cElem.parentNode);
          Array.prototype.forEach.call(parents, function (el) {
            if (elems.includes(el)) {
              // Pretend this element is selected
              addThis = true;
            }
          });

          if (!cElem || !cElem.parentNode) {
            ethis.remove();
            continue;
          }
          if (elems.includes(cElem) || addThis) {
            const bb = svgCanvas.getStrokedBBox([ cElem ]);
            connections.push({
              elem: cElem,
              connector: ethis,
              is_start: (i === 0),
              start_x: bb.x,
              start_y: bb.y
            });
          }
        }
      });
    };

    /**
    * @param {Element[]} [elems=selElems]
    * @returns {void}
    */
    const updateConnectors = (elems) => {
      const dataStorage = svgCanvas.getDataStorage();
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
          const { elem } = conn;

          // const sw = line.getAttribute('stroke-width') * 5;
          const pre = conn.is_start ? 'start' : 'end';

          // Update bbox for this element
          const bb = svgCanvas.getStrokedBBox([ elem ]);
          bb.x = conn.start_x;
          bb.y = conn.start_y;
          dataStorage.put(line, pre + '_bb', bb);
          /* const addOffset = */ dataStorage.get(line, pre + '_off');

          const altPre = conn.is_start ? 'end' : 'start';

          // Get center pt of connected element
          const bb2 = dataStorage.get(line, altPre + '_bb');
          const srcX = bb2.x + bb2.width / 2;
          const srcY = bb2.y + bb2.height / 2;

          // Set point of element being moved
          let pt = getBBintersect(srcX, srcY, bb, getOffset(pre, line));
          setPoint(line, conn.is_start ? 0 : 'end', pt.x, pt.y, true);

          // Set point of connected element
          const pt2 = getBBintersect(pt.x, pt.y, dataStorage.get(line, altPre + '_bb'), getOffset(altPre, line));
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
    };

    // Do once
    (function () {
      const gse = svgCanvas.groupSelectedElements;

      svgCanvas.groupSelectedElements = function (...args) {

        svgCanvas.removeFromSelection(document.querySelectorAll('.se_connector'));
        return gse.apply(this, args);
      };

      const mse = svgCanvas.moveSelectedElements;

      svgCanvas.moveSelectedElements = function (...args) {
        const cmd = mse.apply(this, args);
        updateConnectors();
        return cmd;
      };

      seNs = svgCanvas.getEditorNS();
    }());

    /**
    * Do on reset.
    * @returns {void}
    */
    const init = () => {
      const dataStorage = svgCanvas.getDataStorage();
      // Make sure all connectors have data set
      const elements = svgcontent.querySelectorAll('*');
      elements.forEach(function (curthis) {
        const conn = curthis.getAttributeNS(seNs, 'connector');
        if (conn) {
          curthis.setAttribute('class', 'se_connector');
          const connData = conn.split(' ');
          const sbb = svgCanvas.getStrokedBBox([ getElem(connData[0]) ]);
          const ebb = svgCanvas.getStrokedBBox([ getElem(connData[1]) ]);
          dataStorage.put(curthis, 'c_start', connData[0]);
          dataStorage.put(curthis, 'c_end', connData[1]);
          dataStorage.put(curthis, 'start_bb', sbb);
          dataStorage.put(curthis, 'end_bb', ebb);
          svgCanvas.getEditorNS(true);
        }
      });
    };

    return {
      /** @todo JFH special flag */
      newUI: true,
      name: svgEditor.i18next.t(`${name}:name`),
      callback() {
        const btitle = svgEditor.i18next.t(`${name}:langListTitle`);
        // Add the button and its handler(s)
        const buttonTemplate = document.createElement("template");
        // eslint-disable-next-line no-unsanitized/property
        buttonTemplate.innerHTML = `
        <se-button id="mode_connect" title="${btitle}" src="./images/conn.svg"></se-button>
        `;
        $id('tools_left').append(buttonTemplate.content.cloneNode(true));
        $id('mode_connect').addEventListener("click", () => {
          svgCanvas.setMode('connector');
        });
      },
      /* async */ addLangData({ _lang }) { // , importLocale: importLoc
        return {
          data: [
            { id: 'mode_connect', title: svgEditor.i18next.t(`${name}:langListTitle`) }
          ]
        };
      },
      mouseDown(opts) {
        const dataStorage = svgCanvas.getDataStorage();
        const e = opts.event;
        startX = opts.start_x;
        startY = opts.start_y;
        const mode = svgCanvas.getMode();
        const { curConfig: { initStroke } } = svgEditor.configObj;

        if (mode === 'connector') {
          if (started) { return undefined; }

          const mouseTarget = e.target;

          const parents = svgCanvas.getParents(mouseTarget.parentNode);
          if (parents.includes(svgcontent)) {
            // Connectable element

            // If child of foreignObject, use parent
            const fo = svgCanvas.getClosest(mouseTarget.parentNode, 'foreignObject');
            startElem = fo ? fo : mouseTarget;

            // Get center of source element
            const bb = svgCanvas.getStrokedBBox([ startElem ]);
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
            dataStorage.put(curLine, 'start_bb', bb);
          }
          return {
            started: true
          };
        }
        if (mode === 'select') {
          findConnectors();
        }
        return undefined;
      },
      mouseMove(opts) {
        const dataStorage = svgCanvas.getDataStorage();
        const zoom = svgCanvas.getZoom();
        // const e = opts.event;
        const x = opts.mouse_x / zoom;
        const y = opts.mouse_y / zoom;

        const diffX = x - startX;
        const diffY = y - startY;

        const mode = svgCanvas.getMode();

        if (mode === 'connector' && started) {
          // const sw = curLine.getAttribute('stroke-width') * 3;
          // Set start point (adjusts based on bb)
          const pt = getBBintersect(x, y, dataStorage.get(curLine, 'start_bb'), getOffset('start', curLine));
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
            if (elem && dataStorage.has(elem, 'c_start')) {
              // Remove the "translate" transform given to move
              svgCanvas.removeFromSelection([ elem ]);
              svgCanvas.getTransformList(elem).clear();
            }
          }
          if (connections.length) {
            updateLine(diffX, diffY);
          }
        }
      },
      mouseUp(opts) {
        const dataStorage = svgCanvas.getDataStorage();
        // const zoom = svgCanvas.getZoom();
        const e = opts.event;
        // , x = opts.mouse_x / zoom,
        // , y = opts.mouse_y / zoom,
        let mouseTarget = e.target;

        if (svgCanvas.getMode() !== 'connector') {
          return undefined;
        }
        const fo = svgCanvas.getClosest(mouseTarget.parentNode, 'foreignObject');
        if (fo) { mouseTarget = fo; }

        const parents = svgCanvas.getParents(mouseTarget.parentNode);

        if (mouseTarget === startElem) {
          // Start line through click
          started = true;
          return {
            keep: true,
            element: null,
            started
          };
        }
        if (parents.indexOf(svgcontent) === -1) {
          // Not a valid target element, so remove line
          if (curLine)
            curLine.remove();
          started = false;
          return {
            keep: false,
            element: null,
            started
          };
        }
        // Valid end element
        endElem = mouseTarget;

        const startId = (startElem) ? startElem.id : '';
        const endId = (endElem) ? endElem.id : '';
        const connStr = startId + ' ' + endId;
        const altStr = endId + ' ' + startId;
        // Don't create connector if one already exists
        const dupe = Array.prototype.filter.call(svgcontent.querySelectorAll('.se_connector'), function (aThis) {
          const conn = aThis.getAttributeNS(seNs, 'connector');
          if (conn === connStr || conn === altStr) { return true; }
          return false;
        });
        if (dupe.length) {
          curLine.remove();
          return {
            keep: false,
            element: null,
            started: false
          };
        }

        const bb = svgCanvas.getStrokedBBox([ endElem ]);

        const pt = getBBintersect(startX, startY, bb, getOffset('start', curLine));
        setPoint(curLine, 'end', pt.x, pt.y, true);
        dataStorage.put(curLine, 'c_start', startId);
        dataStorage.put(curLine, 'c_end', endId);
        dataStorage.put(curLine, 'end_bb', bb);
        seNs = svgCanvas.getEditorNS(true);
        curLine.setAttributeNS(seNs, 'se:connector', connStr);
        curLine.setAttribute('class', 'se_connector');
        curLine.setAttribute('opacity', 1);
        svgCanvas.addToSelection([ curLine ]);
        svgCanvas.moveToBottomSelectedElement();
        selManager.requestSelector(curLine).showGrips(false);
        started = false;
        return {
          keep: true,
          element: curLine,
          started
        };
      },
      selectedChanged(opts) {
        const dataStorage = svgCanvas.getDataStorage();
        // TODO: Find better way to skip operations if no connectors are in use
        if (!svgcontent.querySelectorAll('.se_connector').length) { return; }

        if (svgCanvas.getMode() === 'connector') {
          svgCanvas.setMode('select');
        }

        // Use this to update the current selected elements
        selElems = opts.elems;

        let i = selElems.length;
        while (i--) {
          const elem = selElems[i];
          if (elem && dataStorage.has(elem, 'c_start')) {
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
      elementChanged(opts) {
        const dataStorage = svgCanvas.getDataStorage();
        let elem = opts.elems[0];
        if (!elem) return;
        if (elem.tagName === 'svg' && elem.id === 'svgcontent') {
          // Update svgcontent (can change on import)
          svgcontent = elem;
          init();
        }

        // Has marker, so change offset
        if (
          elem.getAttribute('marker-start') ||
          elem.getAttribute('marker-mid') ||
          elem.getAttribute('marker-end')
        ) {
          const start = elem.getAttribute('marker-start');
          const mid = elem.getAttribute('marker-mid');
          const end = elem.getAttribute('marker-end');
          curLine = elem;
          dataStorage.put(elem, 'start_off', Boolean(start));
          dataStorage.put(elem, 'end_off', Boolean(end));

          if (elem.tagName === 'line' && mid) {
            // Convert to polyline to accept mid-arrow

            const x1 = Number(elem.getAttribute('x1'));
            const x2 = Number(elem.getAttribute('x2'));
            const y1 = Number(elem.getAttribute('y1'));
            const y2 = Number(elem.getAttribute('y2'));
            const { id } = elem;

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
            elem.insertAdjacentElement('afterend', pline);
            elem.remove();
            svgCanvas.clearSelection();
            pline.id = id;
            svgCanvas.addToSelection([ pline ]);
            elem = pline;
          }
        }
        // Update line if it's a connector
        if (elem.getAttribute('class') === 'se_connector') {
          const start = getElem(dataStorage.get(elem, 'c_start'));
          updateConnectors([ start ]);
        } else {
          updateConnectors();
        }
      },
      IDsUpdated(input) {
        const remove = [];
        input.elems.forEach(function (elem) {
          if ('se:connector' in elem.attr) {
            elem.attr['se:connector'] = elem.attr['se:connector'].split(' ')
              .map(function (oldID) { return input.changes[oldID]; }).join(' ');

            // Check validity - the field would be something like 'svg_21 svg_22', but
            // if one end is missing, it would be 'svg_21' and therefore fail this test
            if (!(/. ./).test(elem.attr['se:connector'])) {
              remove.push(elem.attr.id);
            }
          }
        });
        return { remove };
      },
      toolButtonStateUpdate(opts) {
        const button = document.getElementById('mode_connect');
        if (opts.nostroke && button.pressed === true) {
          svgEditor.clickSelect();
        }
        button.disabled = opts.nostroke;
      }
    };
  }
};
