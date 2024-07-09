/**
 * @file ext-markers.js
 *
 * @license Apache-2.0
 *
 * @copyright 2010 Will Schleter based on ext-arrows.js by Copyright(c) 2010 Alexis Deveria
 * @copyright 2021 OptimistikSAS
 *
 * This extension provides for the addition of markers to the either end
 * or the middle of a line, polyline, path, polygon.
 *
 * Markers are graphics
 *
 * to simplify the coding and make the implementation as robust as possible,
 * markers are not shared - every object has its own set of markers.
 * this relationship is maintained by a naming convention between the
 * ids of the markers and the ids of the object
 *
 * The following restrictions exist for simplicty of use and programming
 *    objects and their markers to have the same color
 *    marker size is fixed
 *    an application specific attribute - se_type - is added to each marker element
 *        to store the type of marker
 *
 * @todo
 *    remove some of the restrictions above
 *
*/

var extMarkers = {
  name: 'markers',
  async init() {
    const svgEditor = this;
    const {
      svgCanvas
    } = svgEditor;
    const {
      BatchCommand,
      RemoveElementCommand,
      InsertElementCommand
    } = svgCanvas.history;
    const {
      $id,
      addSVGElementsFromJson: addElem
    } = svgCanvas;
    const mtypes = ['start', 'mid', 'end'];
    const markerElems = ['line', 'path', 'polyline', 'polygon'];

    // note - to add additional marker types add them below with a unique id
    // and add the associated icon(s) to marker-icons.svg
    // the geometry is normalized to a 100x100 box with the origin at lower left
    // Safari did not like negative values for low left of viewBox
    // remember that the coordinate system has +y downward
    const markerTypes = {
      nomarker: {},
      leftarrow: {
        element: 'path',
        attr: {
          d: 'M0,50 L100,90 L70,50 L100,10 Z'
        }
      },
      rightarrow: {
        element: 'path',
        attr: {
          d: 'M100,50 L0,90 L30,50 L0,10 Z'
        }
      },
      box: {
        element: 'path',
        attr: {
          d: 'M20,20 L20,80 L80,80 L80,20 Z'
        }
      },
      mcircle: {
        element: 'circle',
        attr: {
          r: 30,
          cx: 50,
          cy: 50
        }
      }
    };

    // duplicate shapes to support unfilled (open) marker types with an _o suffix
    ['leftarrow', 'rightarrow', 'box', 'mcircle'].forEach(v => {
      markerTypes[v + '_o'] = markerTypes[v];
    });

    /**
    * @param {Element} elem - A graphic element will have an attribute like marker-start
    * @param {"marker-start"|"marker-mid"|"marker-end"} attr
    * @returns {Element} The marker element that is linked to the graphic element
    */
    const getLinked = (elem, attr) => {
      const str = elem.getAttribute(attr);
      if (!str) {
        return null;
      }
      const m = str.match(/\(#(.*)\)/);
      // "url(#mkr_end_svg_1)" would give m[1] = "mkr_end_svg_1"
      if (!m || m.length !== 2) {
        return null;
      }
      return svgCanvas.getElement(m[1]);
    };

    /**
     * Toggles context tool panel off/on.
     * @param {boolean} on
     * @returns {void}
    */
    const showPanel = (on, elem) => {
      $id('marker_panel').style.display = on ? 'block' : 'none';
      if (on && elem) {
        mtypes.forEach(pos => {
          const marker = getLinked(elem, 'marker-' + pos);
          if (marker?.attributes?.se_type) {
            $id(`${pos}_marker_list_opts`).setAttribute('value', marker.attributes.se_type.value);
          } else {
            $id(`${pos}_marker_list_opts`).setAttribute('value', 'nomarker');
          }
        });
      }
    };

    /**
    * @param {string} id
    * @param {""|"nomarker"|"nomarker"|"leftarrow"|"rightarrow"|"textmarker"|"forwardslash"|"reverseslash"|"verticalslash"|"box"|"star"|"xmark"|"triangle"|"mcircle"} seType
    * @returns {SVGMarkerElement}
    */
    const addMarker = (id, seType) => {
      const selElems = svgCanvas.getSelectedElements();
      let marker = svgCanvas.getElement(id);
      if (marker) {
        return undefined;
      }
      if (seType === '' || seType === 'nomarker') {
        return undefined;
      }
      const el = selElems[0];
      const color = el.getAttribute('stroke');
      const strokeWidth = 10;
      const refX = 50;
      const refY = 50;
      const viewBox = '0 0 100 100';
      const markerWidth = 5;
      const markerHeight = 5;
      if (!markerTypes[seType]) {
        console.error(`unknown marker type: ${seType}`);
        return undefined;
      }

      // create a generic marker
      marker = addElem({
        element: 'marker',
        attr: {
          id,
          markerUnits: 'strokeWidth',
          orient: 'auto',
          style: 'pointer-events:none',
          se_type: seType
        }
      });
      const mel = addElem(markerTypes[seType]);
      const fillcolor = seType.substr(-2) === '_o' ? 'none' : color;
      mel.setAttribute('fill', fillcolor);
      mel.setAttribute('stroke', color);
      mel.setAttribute('stroke-width', strokeWidth);
      marker.append(mel);
      marker.setAttribute('viewBox', viewBox);
      marker.setAttribute('markerWidth', markerWidth);
      marker.setAttribute('markerHeight', markerHeight);
      marker.setAttribute('refX', refX);
      marker.setAttribute('refY', refY);
      svgCanvas.findDefs().append(marker);
      return marker;
    };

    /**
    * @param {Element} elem
    * @returns {SVGPolylineElement}
    */
    const convertline = elem => {
      // this routine came from the connectors extension
      // it is needed because midpoint markers don't work with line elements
      if (elem.tagName !== 'line') {
        return elem;
      }

      // Convert to polyline to accept mid-arrow
      const x1 = Number(elem.getAttribute('x1'));
      const x2 = Number(elem.getAttribute('x2'));
      const y1 = Number(elem.getAttribute('y1'));
      const y2 = Number(elem.getAttribute('y2'));
      const {
        id
      } = elem;
      const midPt = ' ' + (x1 + x2) / 2 + ',' + (y1 + y2) / 2 + ' ';
      const pline = addElem({
        element: 'polyline',
        attr: {
          points: x1 + ',' + y1 + midPt + x2 + ',' + y2,
          stroke: elem.getAttribute('stroke'),
          'stroke-width': elem.getAttribute('stroke-width'),
          fill: 'none',
          opacity: elem.getAttribute('opacity') || 1
        }
      });
      mtypes.forEach(pos => {
        // get any existing marker definitions
        const nam = 'marker-' + pos;
        const m = elem.getAttribute(nam);
        if (m) {
          pline.setAttribute(nam, elem.getAttribute(nam));
        }
      });
      const batchCmd = new BatchCommand();
      batchCmd.addSubCommand(new RemoveElementCommand(elem, elem.parentNode));
      batchCmd.addSubCommand(new InsertElementCommand(pline));
      elem.insertAdjacentElement('afterend', pline);
      elem.remove();
      svgCanvas.clearSelection();
      pline.id = id;
      svgCanvas.addToSelection([pline]);
      svgCanvas.addCommandToHistory(batchCmd);
      return pline;
    };

    /**
    *
    * @returns {void}
    */
    const setMarker = (pos, markerType) => {
      const selElems = svgCanvas.getSelectedElements();
      if (selElems.length === 0) return;
      const markerName = 'marker-' + pos;
      const el = selElems[0];
      const marker = getLinked(el, markerName);
      if (marker) {
        marker.remove();
      }
      el.removeAttribute(markerName);
      let val = markerType;
      if (val === '') {
        val = 'nomarker';
      }
      if (val === 'nomarker') {
        svgCanvas.call('changed', selElems);
        return;
      }
      // Set marker on element
      const id = 'mkr_' + pos + '_' + el.id;
      addMarker(id, val);
      svgCanvas.changeSelectedAttribute(markerName, 'url(#' + id + ')');
      if (el.tagName === 'line' && pos === 'mid') {
        convertline(el);
      }
      svgCanvas.call('changed', selElems);
    };

    /**
     * Called when the main system modifies an object. This routine changes
     *   the associated markers to be the same color.
     * @param {Element} elem
     * @returns {void}
    */
    const colorChanged = elem => {
      const color = elem.getAttribute('stroke');
      mtypes.forEach(pos => {
        const marker = getLinked(elem, 'marker-' + pos);
        if (!marker) {
          return;
        }
        if (!marker.attributes.se_type) {
          return;
        } // not created by this extension
        const ch = marker.lastElementChild;
        if (!ch) {
          return;
        }
        const curfill = ch.getAttribute('fill');
        const curstroke = ch.getAttribute('stroke');
        if (curfill && curfill !== 'none') {
          ch.setAttribute('fill', color);
        }
        if (curstroke && curstroke !== 'none') {
          ch.setAttribute('stroke', color);
        }
      });
    };

    /**
    * Called when the main system creates or modifies an object.
    * Its primary purpose is to create new markers for cloned objects.
    * @param {Element} el
    * @returns {void}
    */
    const updateReferences = el => {
      const selElems = svgCanvas.getSelectedElements();
      mtypes.forEach(pos => {
        const markerName = 'marker-' + pos;
        const marker = getLinked(el, markerName);
        if (!marker || !marker.attributes.se_type) {
          return;
        } // not created by this extension
        const url = el.getAttribute(markerName);
        if (url) {
          const len = el.id.length;
          const linkid = url.substr(-len - 1, len);
          if (el.id !== linkid) {
            const newMarkerId = 'mkr_' + pos + '_' + el.id;
            addMarker(newMarkerId, marker.attributes.se_type.value);
            svgCanvas.changeSelectedAttribute(markerName, 'url(#' + newMarkerId + ')');
            svgCanvas.call('changed', selElems);
          }
        }
      });
    };
    return {
      name: svgEditor.i18next.t(`${name}:name`),
      // The callback should be used to load the DOM with the appropriate UI items
      callback() {
        // Add the context panel and its handler(s)
        const panelTemplate = document.createElement('template');
        // create the marker panel
        let innerHTML = '<div id="marker_panel">';
        mtypes.forEach(pos => {
          innerHTML += `<se-list id="${pos}_marker_list_opts" title="tools.${pos}_marker_list_opts" label="" width="22px" height="22px">`;
          Object.entries(markerTypes).forEach(_ref => {
            let [marker, _mkr] = _ref;
            innerHTML += `<se-list-item id="mkr_${pos}_${marker}" value="${marker}" title="tools.mkr_${marker}" src="${marker}.svg" img-height="22px"></se-list-item>`;
          });
          innerHTML += '</se-list>';
        });
        innerHTML += '</div>';
        panelTemplate.innerHTML = innerHTML;
        $id('tools_top').appendChild(panelTemplate.content.cloneNode(true));
        // don't display the panels on start
        showPanel(false);
        mtypes.forEach(pos => {
          $id(`${pos}_marker_list_opts`).addEventListener('change', evt => {
            setMarker(pos, evt.detail.value);
          });
        });
      },
      selectedChanged(opts) {
        // Use this to update the current selected elements
        if (opts.elems.length === 0) showPanel(false);
        opts.elems.forEach(elem => {
          if (elem && markerElems.includes(elem.tagName)) {
            if (opts.selectedElement && !opts.multiselected) {
              showPanel(true, elem);
            } else {
              showPanel(false);
            }
          } else {
            showPanel(false);
          }
        });
      },
      elementChanged(opts) {
        const elem = opts.elems[0];
        if (elem && (elem.getAttribute('marker-start') || elem.getAttribute('marker-mid') || elem.getAttribute('marker-end'))) {
          colorChanged(elem);
          updateReferences(elem);
        }
      }
    };
  }
};

export { extMarkers as default };
//# sourceMappingURL=ext-markers.js.map
