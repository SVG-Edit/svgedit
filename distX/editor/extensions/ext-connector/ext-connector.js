function __variableDynamicImportRuntime0__(path) {
  switch (path) {
    case './locale/en.js':
      return Promise.resolve().then(function () { return en$1; });
    case './locale/fr.js':
      return Promise.resolve().then(function () { return fr$1; });
    case './locale/zh-CN.js':
      return Promise.resolve().then(function () { return zhCN$1; });
    default:
      return new Promise(function (resolve, reject) {
        (typeof queueMicrotask === 'function' ? queueMicrotask : setTimeout)(reject.bind(null, new Error("Unknown variable dynamic import: " + path)));
      });
  }
}

/**
 * @file ext-connector.js
 *
 * @license MIT
 *
 * @copyright 2010 Alexis Deveria
 * @copyright 2023 Optimistik SAS
 *
 */

const name = 'connector';
const loadExtensionTranslation = async function (svgEditor) {
  let translationModule;
  const lang = svgEditor.configObj.pref('lang');
  try {
    translationModule = await __variableDynamicImportRuntime0__(`./locale/${lang}.js`);
  } catch (_error) {
    // eslint-disable-next-line no-console
    console.warn(`Missing translation (${lang}) for ${name} - using 'en'`);
    translationModule = await Promise.resolve().then(function () { return en$1; });
  }
  svgEditor.i18next.addResourceBundle(lang, name, translationModule.default);
};
var extConnector = {
  name,
  async init(S) {
    const svgEditor = this;
    const {
      svgCanvas
    } = svgEditor;
    const {
      getElement,
      $id,
      $click,
      addSVGElementsFromJson
    } = svgCanvas;
    const {
      svgroot,
      selectorManager
    } = S;
    const seNs = svgCanvas.getEditorNS();
    await loadExtensionTranslation(svgEditor);
    let startX;
    let startY;
    let curLine;
    let startElem;
    let endElem;
    let started = false;
    let connections = [];

    // Save the original groupSelectedElements method
    const originalGroupSelectedElements = svgCanvas.groupSelectedElements;

    // Override the original groupSelectedElements to exclude connectors
    svgCanvas.groupSelectedElements = function () {
      // Remove connectors from selection
      svgCanvas.removeFromSelection(document.querySelectorAll('[id^="conn_"]'));

      // Call the original method
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      return originalGroupSelectedElements.apply(this, args);
    };

    // Save the original moveSelectedElements method
    const originalMoveSelectedElements = svgCanvas.moveSelectedElements;

    // Override the original moveSelectedElements to handle connectors
    svgCanvas.moveSelectedElements = function () {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }
      // Call the original method and store its result
      const cmd = originalMoveSelectedElements.apply(this, args);

      // Update connectors
      updateConnectors(svgCanvas.getSelectedElements());

      // Return the result of the original method
      return cmd;
    };

    /**
     * getBBintersect
     * @param {Float} x
     * @param {Float} y
     * @param {module:utilities.BBoxObject} bb
     * @param {Float} offset
     * @returns {module:math.XYObject}
     */
    const getBBintersect = (x, y, bb, offset) => {
      // Adjust bounding box if offset is provided
      if (offset) {
        bb = {
          ...bb
        }; // Create a shallow copy
        bb.width += offset;
        bb.height += offset;
        bb.x -= offset / 2;
        bb.y -= offset / 2;
      }

      // Calculate center of bounding box
      const midX = bb.x + bb.width / 2;
      const midY = bb.y + bb.height / 2;

      // Calculate lengths from (x, y) to center
      const lenX = x - midX;
      const lenY = y - midY;

      // Calculate slope of line from (x, y) to center
      const slope = Math.abs(lenY / lenX);

      // Calculate ratio to find intersection point
      let ratio;
      if (slope < bb.height / bb.width) {
        ratio = bb.width / 2 / Math.abs(lenX);
      } else {
        ratio = lenY ? bb.height / 2 / Math.abs(lenY) : 0;
      }

      // Calculate intersection point
      return {
        x: midX + lenX * ratio,
        y: midY + lenY * ratio
      };
    };

    /**
     * getOffset
     * @param {"start"|"end"} side - The side of the line ("start" or "end") where the marker may be present.
     * @param {Element} line - The line element to check for a marker.
     * @returns {Float} - Returns the calculated offset if a marker is present, otherwise returns 0.
     */
    const getOffset = (side, line) => {
      // Check for marker attribute on the given side ("marker-start" or "marker-end")
      const hasMarker = line.getAttribute('marker-' + side);

      // Calculate size based on stroke-width, multiplied by a constant factor (here, 5)
      // TODO: This factor should ideally be based on the actual size of the marker.
      const size = line.getAttribute('stroke-width') * 5;

      // Return calculated size if marker is present, otherwise return 0.
      return hasMarker ? size : 0;
    };

    /**
     * showPanel
     * @param {boolean} on - Determines whether to show or hide the elements.
     * @returns {void}
     */
    const showPanel = on => {
      // Find the 'connector_rules' or create it if it doesn't exist.
      let connRules = $id('connector_rules');
      if (!connRules) {
        connRules = document.createElement('style');
        connRules.setAttribute('id', 'connector_rules');
        document.getElementsByTagName('head')[0].appendChild(connRules);
      }

      // Update the content of <style> element to either hide or show certain elements.
      connRules.textContent = !on ? '' : '#tool_clone, #tool_topath, #tool_angle, #xy_panel { display: none !important; }';

      // Update the display property of the <style> element itself based on the 'on' value.
      if ($id('connector_rules')) {
        $id('connector_rules').style.display = on ? 'block' : 'none';
      }
    };

    /**
     * setPoint
     * @param {Element} elem - The SVG element.
     * @param {Integer|"end"} pos - The position index or "end".
     * @param {Float} x - The x-coordinate.
     * @param {Float} y - The y-coordinate.
     * @param {boolean} [setMid] - Whether to set the midpoint.
     * @returns {void}
     */
    const setPoint = (elem, pos, x, y, setMid) => {
      // Create a new SVG point
      const pts = elem.points;
      const pt = svgroot.createSVGPoint();
      pt.x = x;
      pt.y = y;

      // If position is "end", set it to the last index
      if (pos === 'end') {
        pos = pts.numberOfItems - 1;
      }

      // Try replacing the point at the specified position
      pts.replaceItem(pt, pos);

      // Optionally, set the midpoint
      if (setMid) {
        const ptStart = pts.getItem(0);
        const ptEnd = pts.getItem(pts.numberOfItems - 1);
        setPoint(elem, 1, (ptEnd.x + ptStart.x) / 2, (ptEnd.y + ptStart.y) / 2);
      }
    };

    // Finds connectors associated with selected elements
    const findConnectors = function () {
      let elems = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      // Fetch data storage object from svgCanvas
      const dataStorage = svgCanvas.getDataStorage();

      // Query all connector elements (id startss with conn_)
      const connectors = document.querySelectorAll('[id^="conn_"]');
      // Reset connections array
      connections = [];

      // Loop through each connector
      for (const connector of connectors) {
        let addThis = false; // Flag to indicate whether to add this connector
        const parts = []; // To hold the starting and ending elements connected by the connector

        // Loop through the connector ends ("start" and "end")
        for (const [i, pos] of ['start', 'end'].entries()) {
          // Fetch connected element and its bounding box
          let part = dataStorage.get(connector, `c_${pos}`);

          // If part is null or undefined, fetch it and store it
          if (!part) {
            part = document.getElementById(connector.attributes['se:connector'].value.split(' ')[i]);
            dataStorage.put(connector, `c_${pos}`, part.id);
            dataStorage.put(connector, `${pos}_bb`, svgCanvas.getStrokedBBox([part]));
          } else {
            // If part is already stored, fetch it by ID
            part = document.getElementById(part);
          }

          // Add the part to the parts array
          parts.push(part);
        }

        // Loop through the starting and ending elements connected by the connector
        for (let i = 0; i < 2; i++) {
          const cElem = parts[i];
          const parents = svgCanvas.getParents(cElem?.parentNode);

          // Check if the element is part of a selected group
          for (const el of parents) {
            if (elems.includes(el)) {
              addThis = true;
              break;
            }
          }

          // If element is missing or parent is null, remove the connector
          if (!cElem || !cElem.parentNode) {
            connector.remove();
            continue;
          }

          // If element is in the selection or part of a selected group
          if (elems.includes(cElem) || addThis) {
            const bb = svgCanvas.getStrokedBBox([cElem]);

            // Add connection information to the connections array
            connections.push({
              elem: cElem,
              connector,
              is_start: i === 0,
              start_x: bb.x,
              start_y: bb.y
            });
          }
        }
      }
    };

    /**
     * Updates the connectors based on selected elements.
     * @param {Element[]} [elems] - Optional array of selected elements.
     * @returns {void}
     */
    const updateConnectors = elems => {
      const dataStorage = svgCanvas.getDataStorage();

      // Find connectors associated with selected elements
      findConnectors(elems);
      if (connections.length) {
        // Iterate through each connection to update its state
        for (const conn of connections) {
          const {
            elem,
            connector: line,
            is_start: isStart,
            start_x: startX,
            start_y: startY
          } = conn;

          // Determine whether the connection starts or ends with this element
          const pre = isStart ? 'start' : 'end';

          // Update the bounding box for this element
          const bb = svgCanvas.getStrokedBBox([elem]);
          bb.x = startX;
          bb.y = startY;
          dataStorage.put(line, `${pre}_bb`, bb);

          // Determine the opposite end ('start' or 'end') of the connection
          const altPre = isStart ? 'end' : 'start';

          // Retrieve the bounding box for the connected element at the opposite end
          const bb2 = dataStorage.get(line, `${altPre}_bb`);

          // Calculate the center point of the connected element
          const srcX = bb2?.x + bb2?.width / 2;
          const srcY = bb2?.y + bb2?.height / 2;

          // Update the point of the element being moved
          const pt = getBBintersect(srcX, srcY, bb, getOffset(pre, line));
          setPoint(line, isStart ? 0 : 'end', pt.x, pt.y, true);

          // Update the point of the connected element at the opposite end
          const pt2 = getBBintersect(pt.x, pt.y, dataStorage.get(line, `${altPre}_bb`), getOffset(altPre, line));
          setPoint(line, isStart ? 'end' : 0, pt2.x, pt2.y, true);
        }
      }
    };

    /**
     * Do on reset.
     * @returns {void}
     */
    const reset = () => {
      const dataStorage = svgCanvas.getDataStorage();
      // Make sure all connectors have data set
      const svgContent = svgCanvas.getSvgContent();
      const elements = svgContent.querySelectorAll('*');
      elements.forEach(element => {
        const conn = element.getAttributeNS(seNs, 'connector');
        if (conn) {
          const connData = conn.split(' ');
          const sbb = svgCanvas.getStrokedBBox([getElement(connData[0])]);
          const ebb = svgCanvas.getStrokedBBox([getElement(connData[1])]);
          dataStorage.put(element, 'c_start', connData[0]);
          dataStorage.put(element, 'c_end', connData[1]);
          dataStorage.put(element, 'start_bb', sbb);
          dataStorage.put(element, 'end_bb', ebb);
          svgCanvas.getEditorNS(true);
        }
      });
    };
    reset();
    return {
      name: svgEditor.i18next.t(`${name}:name`),
      callback() {
        // Add the button and its handler(s)
        const buttonTemplate = document.createElement('template');
        const title = `${name}:buttons.0.title`;
        buttonTemplate.innerHTML = `
         <se-button id="tool_connect" title="${title}" src="conn.svg"></se-button>
         `;
        $id('tools_left').append(buttonTemplate.content.cloneNode(true));
        $click($id('tool_connect'), () => {
          if (this.leftPanel.updateLeftPanel('tool_connect')) {
            svgCanvas.setMode('connector');
          }
        });
      },
      mouseDown(opts) {
        // Retrieve necessary data from the SVG canvas and the event object
        const dataStorage = svgCanvas.getDataStorage();
        const svgContent = svgCanvas.getSvgContent();
        const {
          event: e,
          start_x: startX,
          start_y: startY
        } = opts;
        const mode = svgCanvas.getMode();
        const {
          curConfig: {
            initStroke
          }
        } = svgEditor.configObj;
        if (mode === 'connector') {
          // Return if the line is already started
          if (started) return undefined;
          const mouseTarget = e.target;
          const parents = svgCanvas.getParents(mouseTarget.parentNode);

          // Check if the target is a child of the main SVG content
          if (parents.includes(svgContent)) {
            // Identify the connectable element, considering foreignObject elements
            const fo = svgCanvas.getClosest(mouseTarget.parentNode, 'foreignObject');
            startElem = fo || mouseTarget;

            // Retrieve the bounding box and calculate the center of the start element
            const bb = svgCanvas.getStrokedBBox([startElem]);
            const x = bb.x + bb.width / 2;
            const y = bb.y + bb.height / 2;

            // Set the flag to indicate the line has started
            started = true;

            // Create a new polyline element
            curLine = addSVGElementsFromJson({
              element: 'polyline',
              attr: {
                id: 'conn_' + svgCanvas.getNextId(),
                points: `${x},${y} ${x},${y} ${startX},${startY}`,
                stroke: `#${initStroke.color}`,
                'stroke-width': !startElem.stroke_width || startElem.stroke_width === 0 ? initStroke.width : startElem.stroke_width,
                fill: 'none',
                opacity: initStroke.opacity,
                style: 'pointer-events:none'
              }
            });

            // Store the bounding box of the start element
            dataStorage.put(curLine, 'start_bb', bb);
          }
          return {
            started: true
          };
        }
        if (mode === 'select') {
          // Find connectors if the mode is 'select'
          findConnectors(opts.selectedElements);
        }
        return undefined;
      },
      mouseMove(opts) {
        // Exit early if there are no connectors
        if (connections.length === 0) return;
        svgCanvas.getDataStorage();
        const zoom = svgCanvas.getZoom();
        // const e = opts.event;
        opts.mouse_x / zoom;
        opts.mouse_y / zoom;
        /** @todo  We have a concern if startX or startY are undefined */
        return;
      },
      mouseUp(opts) {
        // Get necessary data and initial setups
        const dataStorage = svgCanvas.getDataStorage();
        const svgContent = svgCanvas.getSvgContent();
        const {
          event: e
        } = opts;
        let mouseTarget = e.target;

        // Early exit if not in connector mode
        if (svgCanvas.getMode() !== 'connector') return undefined;

        // Check for a foreignObject parent and update mouseTarget if found
        const fo = svgCanvas.getClosest(mouseTarget.parentNode, 'foreignObject');
        if (fo) mouseTarget = fo;

        // Check if the target is a child of the main SVG content
        const parents = svgCanvas.getParents(mouseTarget.parentNode);
        const isInSvgContent = parents.includes(svgContent);
        if (mouseTarget === startElem) {
          // Case: Started drawing line via click
          started = true;
          return {
            keep: true,
            element: null,
            started
          };
        }
        if (!isInSvgContent) {
          // Case: Invalid target element; remove the line
          curLine?.remove();
          started = false;
          return {
            keep: false,
            element: null,
            started
          };
        }

        // Valid target element for the end of the line
        endElem = mouseTarget;
        const startId = startElem?.id || '';
        const endId = endElem?.id || '';
        const connStr = `${startId} ${endId}`;
        const altStr = `${endId} ${startId}`;

        // Prevent duplicate connectors
        const dupe = Array.from(document.querySelectorAll('[id^="conn_"]')).filter(conn => conn.getAttributeNS(seNs, 'connector') === connStr || conn.getAttributeNS(seNs, 'connector') === altStr);
        if (dupe.length) {
          curLine.remove();
          return {
            keep: false,
            element: null,
            started: false
          };
        }

        // Update the end point of the connector
        const bb = svgCanvas.getStrokedBBox([endElem]);
        const pt = getBBintersect(startX, startY, bb, getOffset('start', curLine));
        setPoint(curLine, 'end', pt.x, pt.y, true);

        // Save metadata to the connector
        dataStorage.put(curLine, 'c_start', startId);
        dataStorage.put(curLine, 'c_end', endId);
        dataStorage.put(curLine, 'end_bb', bb);
        curLine.setAttributeNS(seNs, 'se:connector', connStr);
        curLine.setAttribute('opacity', 1);

        // Finalize the connector
        svgCanvas.addToSelection([curLine]);
        svgCanvas.moveToBottomSelectedElement();
        selectorManager.requestSelector(curLine).showGrips(false);
        started = false;
        return {
          keep: true,
          element: curLine,
          started
        };
      },
      selectedChanged(opts) {
        // Get necessary data storage and SVG content
        const dataStorage = svgCanvas.getDataStorage();
        const svgContent = svgCanvas.getSvgContent();

        // Exit early if there are no connectors
        if (!svgContent.querySelectorAll('[id^="conn_"]').length) return;

        // If the current mode is 'connector', switch to 'select'
        if (svgCanvas.getMode() === 'connector') {
          svgCanvas.setMode('select');
        }

        // Get currently selected elements
        const {
          elems: selElems
        } = opts;

        // Iterate through selected elements
        for (const elem of selElems) {
          // If the element has a connector start, handle it
          if (elem && dataStorage.has(elem, 'c_start')) {
            selectorManager.requestSelector(elem).showGrips(false);

            // Show panel depending on selection state
            showPanel(opts.selectedElement && !opts.multiselected);
          } else {
            // Hide panel if no connector start
            showPanel(false);
          }
        }

        // Update connectors based on selected elements
        updateConnectors(svgCanvas.getSelectedElements());
      },
      elementChanged(opts) {
        // Get the necessary data storage
        const dataStorage = svgCanvas.getDataStorage();

        // Get the first element from the options; exit early if it's null
        let [elem] = opts.elems;
        if (!elem) return;

        // Reinitialize if it's the main SVG content
        if (elem.tagName === 'svg' && elem.id === 'svgcontent') {
          reset();
        }

        // Check for marker attributes and update offsets
        const {
          markerStart,
          markerMid,
          markerEnd
        } = elem.attributes;
        if (markerStart || markerMid || markerEnd) {
          curLine = elem;
          dataStorage.put(elem, 'start_off', Boolean(markerStart));
          dataStorage.put(elem, 'end_off', Boolean(markerEnd));

          // Convert lines to polyline if there's a mid-marker
          if (elem.tagName === 'line' && markerMid) {
            const {
              x1,
              x2,
              y1,
              y2,
              id
            } = elem.attributes;
            const midPt = `${(Number(x1.value) + Number(x2.value)) / 2},${(Number(y1.value) + Number(y2.value)) / 2}`;
            const pline = addSVGElementsFromJson({
              element: 'polyline',
              attr: {
                points: `${x1.value},${y1.value} ${midPt} ${x2.value},${y2.value}`,
                stroke: elem.getAttribute('stroke'),
                'stroke-width': elem.getAttribute('stroke-width'),
                'marker-mid': markerMid.value,
                fill: 'none',
                opacity: elem.getAttribute('opacity') || 1
              }
            });
            elem.insertAdjacentElement('afterend', pline);
            elem.remove();
            svgCanvas.clearSelection();
            pline.id = id.value;
            svgCanvas.addToSelection([pline]);
            elem = pline;
          }
        }

        // Update connectors based on the current element
        if (elem?.id.startsWith('conn_')) {
          const start = getElement(dataStorage.get(elem, 'c_start'));
          updateConnectors([start]);
        } else {
          updateConnectors(svgCanvas.getSelectedElements());
        }
      },
      IDsUpdated(input) {
        const remove = [];
        input.elems.forEach(function (elem) {
          if ('se:connector' in elem.attr) {
            elem.attr['se:connector'] = elem.attr['se:connector'].split(' ').map(function (oldID) {
              return input.changes[oldID];
            }).join(' ');

            // Check validity - the field would be something like 'svg_21 svg_22', but
            // if one end is missing, it would be 'svg_21' and therefore fail this test
            if (!/. ./.test(elem.attr['se:connector'])) {
              remove.push(elem.attr.id);
            }
          }
        });
        return {
          remove
        };
      },
      toolButtonStateUpdate(opts) {
        const button = document.getElementById('tool_connect');
        if (opts.nostroke && button.pressed === true) {
          svgEditor.clickSelect();
        }
        button.disabled = opts.nostroke;
      }
    };
  }
};

var en = {
  name: 'Connector',
  langListTitle: 'Connect two objects',
  langList: [{
    id: 'mode_connect',
    title: 'Connect two objects'
  }],
  buttons: [{
    title: 'Connect two objects'
  }]
};

var en$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: en
});

var fr = {
  name: 'Connecteur',
  langListTitle: 'Connecter deux objets',
  langList: [{
    id: 'mode_connect',
    title: 'Connecter deux objets'
  }],
  buttons: [{
    title: 'Connecter deux objets'
  }]
};

var fr$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: fr
});

var zhCN = {
  name: '连接器',
  langListTitle: '连接两个对象',
  langList: [{
    id: 'mode_connect',
    title: '连接两个对象'
  }],
  buttons: [{
    title: '连接两个对象'
  }]
};

var zhCN$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: zhCN
});

export { extConnector as default };
//# sourceMappingURL=ext-connector.js.map
