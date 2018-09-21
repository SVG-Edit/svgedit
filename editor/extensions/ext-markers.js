/* globals jQuery */
/**
 * ext-markers.js
 *
 * @license Apache-2.0
 *
 * @copyright 2010 Will Schleter based on ext-arrows.js by Copyright(c) 2010 Alexis Deveria
 *
 * This extension provides for the addition of markers to the either end
 * or the middle of a line, polyline, path, polygon.
 *
 * Markers may be either a graphic or arbitary text
 *
 * to simplify the coding and make the implementation as robust as possible,
 * markers are not shared - every object has its own set of markers.
 * this relationship is maintained by a naming convention between the
 * ids of the markers and the ids of the object
 *
 * The following restrictions exist for simplicty of use and programming
 *    objects and their markers to have the same color
 *    marker size is fixed
 *    text marker font, size, and attributes are fixed
 *    an application specific attribute - se_type - is added to each marker element
 *        to store the type of marker
 *
 * @todo
 *    remove some of the restrictions above
 *    add option for keeping text aligned to horizontal
 *    add support for dimension extension lines
 *
*/
export default {
  name: 'markers',
  async init (S) {
    const strings = await S.importLocale();
    const svgEditor = this;
    const $ = jQuery;
    const svgCanvas = svgEditor.canvas;
    const // {svgcontent} = S,
      addElem = svgCanvas.addSVGElementFromJson;
    const mtypes = ['start', 'mid', 'end'];
    const markerPrefix = 'se_marker_';
    const idPrefix = 'mkr_';

    // note - to add additional marker types add them below with a unique id
    // and add the associated icon(s) to marker-icons.svg
    // the geometry is normalized to a 100x100 box with the origin at lower left
    // Safari did not like negative values for low left of viewBox
    // remember that the coordinate system has +y downward
    const markerTypes = {
      nomarker: {},
      leftarrow:
        {element: 'path', attr: {d: 'M0,50 L100,90 L70,50 L100,10 Z'}},
      rightarrow:
        {element: 'path', attr: {d: 'M100,50 L0,90 L30,50 L0,10 Z'}},
      textmarker:
        {element: 'text', attr: {x: 0, y: 0, 'stroke-width': 0, stroke: 'none', 'font-size': 75, 'font-family': 'serif', 'text-anchor': 'left',
          'xml:space': 'preserve'}},
      forwardslash:
        {element: 'path', attr: {d: 'M30,100 L70,0'}},
      reverseslash:
        {element: 'path', attr: {d: 'M30,0 L70,100'}},
      verticalslash:
        {element: 'path', attr: {d: 'M50,0 L50,100'}},
      box:
        {element: 'path', attr: {d: 'M20,20 L20,80 L80,80 L80,20 Z'}},
      star:
        {element: 'path', attr: {d: 'M10,30 L90,30 L20,90 L50,10 L80,90 Z'}},
      xmark:
        {element: 'path', attr: {d: 'M20,80 L80,20 M80,80 L20,20'}},
      triangle:
        {element: 'path', attr: {d: 'M10,80 L50,20 L80,80 Z'}},
      mcircle:
        {element: 'circle', attr: {r: 30, cx: 50, cy: 50}}
    };

    // duplicate shapes to support unfilled (open) marker types with an _o suffix
    ['leftarrow', 'rightarrow', 'box', 'star', 'mcircle', 'triangle'].forEach((v) => {
      markerTypes[v + '_o'] = markerTypes[v];
    });

    /**
    * @param {Element} elem - A graphic element will have an attribute like marker-start
    * @param {"marker-start"|"marker-mid"|"marker-end"} attr
    * @returns {Element} The marker element that is linked to the graphic element
    */
    function getLinked (elem, attr) {
      const str = elem.getAttribute(attr);
      if (!str) { return null; }
      const m = str.match(/\(#(.*)\)/);
      if (!m || m.length !== 2) {
        return null;
      }
      return svgCanvas.getElem(m[1]);
    }

    function setIcon (pos, id) {
      if (id.substr(0, 1) !== '\\') { id = '\\textmarker'; }
      const ci = '#' + idPrefix + pos + '_' + id.substr(1);
      svgEditor.setIcon('#cur_' + pos + '_marker_list', $(ci).children());
      $(ci).addClass('current').siblings().removeClass('current');
    }

    let selElems;
    // toggles context tool panel off/on
    // sets the controls with the selected element's settings
    function showPanel (on) {
      $('#marker_panel').toggle(on);

      if (on) {
        const el = selElems[0];

        let val, ci;
        $.each(mtypes, function (i, pos) {
          const m = getLinked(el, 'marker-' + pos);
          const txtbox = $('#' + pos + '_marker');
          if (!m) {
            val = '\\nomarker';
            ci = val;
            txtbox.hide(); // hide text box
          } else {
            if (!m.attributes.se_type) { return; } // not created by this extension
            val = '\\' + m.attributes.se_type.textContent;
            ci = val;
            if (val === '\\textmarker') {
              val = m.lastChild.textContent;
              // txtbox.show(); // show text box
            } else {
              txtbox.hide(); // hide text box
            }
          }
          txtbox.val(val);
          setIcon(pos, ci);
        });
      }
    }

    function addMarker (id, val) {
      const txtBoxBg = '#ffffff';
      const txtBoxBorder = 'none';
      const txtBoxStrokeWidth = 0;

      let marker = svgCanvas.getElem(id);
      if (marker) { return; }

      if (val === '' || val === '\\nomarker') { return; }

      const el = selElems[0];
      const color = el.getAttribute('stroke');
      // NOTE: Safari didn't like a negative value in viewBox
      // so we use a standardized 0 0 100 100
      // with 50 50 being mapped to the marker position
      const strokeWidth = 10;
      let refX = 50;
      let refY = 50;
      let viewBox = '0 0 100 100';
      let markerWidth = 5;
      let markerHeight = 5;
      let seType;
      if (val.substr(0, 1) === '\\') {
        seType = val.substr(1);
      } else { seType = 'textmarker'; }

      if (!markerTypes[seType]) { return; } // an unknown type!

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

      if (seType !== 'textmarker') {
        const mel = addElem(markerTypes[seType]);
        const fillcolor = (seType.substr(-2) === '_o')
          ? 'none'
          : color;

        mel.setAttribute('fill', fillcolor);
        mel.setAttribute('stroke', color);
        mel.setAttribute('stroke-width', strokeWidth);
        marker.append(mel);
      } else {
        const text = addElem(markerTypes[seType]);
        // have to add text to get bounding box
        text.textContent = val;
        const tb = text.getBBox();
        // alert(tb.x + ' ' + tb.y + ' ' + tb.width + ' ' + tb.height);
        const pad = 1;
        const bb = tb;
        bb.x = 0;
        bb.y = 0;
        bb.width += pad * 2;
        bb.height += pad * 2;
        // shift text according to its size
        text.setAttribute('x', pad);
        text.setAttribute('y', bb.height - pad - tb.height / 4); // kludge?
        text.setAttribute('fill', color);
        refX = bb.width / 2 + pad;
        refY = bb.height / 2 + pad;
        viewBox = bb.x + ' ' + bb.y + ' ' + bb.width + ' ' + bb.height;
        markerWidth = bb.width / 10;
        markerHeight = bb.height / 10;

        const box = addElem({
          element: 'rect',
          attr: {
            x: bb.x,
            y: bb.y,
            width: bb.width,
            height: bb.height,
            fill: txtBoxBg,
            stroke: txtBoxBorder,
            'stroke-width': txtBoxStrokeWidth
          }
        });
        marker.setAttribute('orient', 0);
        marker.append(box, text);
      }

      marker.setAttribute('viewBox', viewBox);
      marker.setAttribute('markerWidth', markerWidth);
      marker.setAttribute('markerHeight', markerHeight);
      marker.setAttribute('refX', refX);
      marker.setAttribute('refY', refY);
      svgCanvas.findDefs().append(marker);

      return marker;
    }

    function convertline (elem) {
      // this routine came from the connectors extension
      // it is needed because midpoint markers don't work with line elements
      if (!(elem.tagName === 'line')) { return elem; }

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
          fill: 'none',
          opacity: elem.getAttribute('opacity') || 1
        }
      });
      $.each(mtypes, function (i, pos) { // get any existing marker definitions
        const nam = 'marker-' + pos;
        const m = elem.getAttribute(nam);
        if (m) { pline.setAttribute(nam, elem.getAttribute(nam)); }
      });

      const batchCmd = new S.BatchCommand();
      batchCmd.addSubCommand(new S.RemoveElementCommand(elem, elem.parentNode));
      batchCmd.addSubCommand(new S.InsertElementCommand(pline));

      $(elem).after(pline).remove();
      svgCanvas.clearSelection();
      pline.id = id;
      svgCanvas.addToSelection([pline]);
      S.addCommandToHistory(batchCmd);
      return pline;
    }

    function setMarker () {
      const poslist = {start_marker: 'start', mid_marker: 'mid', end_marker: 'end'};
      const pos = poslist[this.id];
      const markerName = 'marker-' + pos;
      const el = selElems[0];
      const marker = getLinked(el, markerName);
      if (marker) { $(marker).remove(); }
      el.removeAttribute(markerName);
      let val = this.value;
      if (val === '') { val = '\\nomarker'; }
      if (val === '\\nomarker') {
        setIcon(pos, val);
        svgCanvas.call('changed', selElems);
        return;
      }
      // Set marker on element
      const id = markerPrefix + pos + '_' + el.id;
      addMarker(id, val);
      svgCanvas.changeSelectedAttribute(markerName, 'url(#' + id + ')');
      if (el.tagName === 'line' && pos === 'mid') {
        convertline(el);
      }
      svgCanvas.call('changed', selElems);
      setIcon(pos, val);
    }

    // called when the main system modifies an object
    // this routine changes the associated markers to be the same color
    function colorChanged (elem) {
      const color = elem.getAttribute('stroke');

      $.each(mtypes, function (i, pos) {
        const marker = getLinked(elem, 'marker-' + pos);
        if (!marker) { return; }
        if (!marker.attributes.se_type) { return; } // not created by this extension
        const ch = marker.lastElementChild;
        if (!ch) { return; }
        const curfill = ch.getAttribute('fill');
        const curstroke = ch.getAttribute('stroke');
        if (curfill && curfill !== 'none') { ch.setAttribute('fill', color); }
        if (curstroke && curstroke !== 'none') { ch.setAttribute('stroke', color); }
      });
    }

    // called when the main system creates or modifies an object
    // primary purpose is create new markers for cloned objects
    function updateReferences (el) {
      $.each(mtypes, function (i, pos) {
        const id = markerPrefix + pos + '_' + el.id;
        const markerName = 'marker-' + pos;
        const marker = getLinked(el, markerName);
        if (!marker || !marker.attributes.se_type) { return; } // not created by this extension
        const url = el.getAttribute(markerName);
        if (url) {
          const len = el.id.length;
          const linkid = url.substr(-len - 1, len);
          if (el.id !== linkid) {
            const val = $('#' + pos + '_marker').attr('value');
            addMarker(id, val);
            svgCanvas.changeSelectedAttribute(markerName, 'url(#' + id + ')');
            if (el.tagName === 'line' && pos === 'mid') { el = convertline(el); }
            svgCanvas.call('changed', selElems);
          }
        }
      });
    }

    // simulate a change event a text box that stores the current element's marker type
    function triggerTextEntry (pos, val) {
      $('#' + pos + '_marker').val(val);
      $('#' + pos + '_marker').change();
      // const txtbox = $('#'+pos+'_marker');
      // if (val.substr(0,1)=='\\') {txtbox.hide();}
      // else {txtbox.show();}
    }

    function showTextPrompt (pos) {
      let def = $('#' + pos + '_marker').val();
      if (def.substr(0, 1) === '\\') { def = ''; }
      $.prompt('Enter text for ' + pos + ' marker', def, function (txt) {
        if (txt) { triggerTextEntry(pos, txt); }
      });
    }

    /*
    function setMarkerSet(obj) {
      const parts = this.id.split('_');
      const set = parts[2];
      switch (set) {
      case 'off':
        triggerTextEntry('start','\\nomarker');
        triggerTextEntry('mid','\\nomarker');
        triggerTextEntry('end','\\nomarker');
        break;
      case 'dimension':
        triggerTextEntry('start','\\leftarrow');
        triggerTextEntry('end','\\rightarrow');
        showTextPrompt('mid');
        break;
      case 'label':
        triggerTextEntry('mid','\\nomarker');
        triggerTextEntry('end','\\rightarrow');
        showTextPrompt('start');
        break;
      }
    }
    */
    // callback function for a toolbar button click
    function setArrowFromButton (obj) {
      const parts = this.id.split('_');
      const pos = parts[1];
      let val = parts[2];
      if (parts[3]) { val += '_' + parts[3]; }

      if (val !== 'textmarker') {
        triggerTextEntry(pos, '\\' + val);
      } else {
        showTextPrompt(pos);
      }
    }

    function getTitle (id) {
      const {langList} = strings;
      const item = langList.find((item) => {
        return item.id === id;
      });
      return item ? item.title : id;
    }

    // build the toolbar button array from the marker definitions
    function buildButtonList (lang) {
      const buttons = [];
      // const i = 0;
      /*
      buttons.push({
        id: idPrefix + 'markers_off',
        title: 'Turn off all markers',
        type: 'context',
        events: { click: setMarkerSet },
        panel: 'marker_panel'
      });
      buttons.push({
        id: idPrefix + 'markers_dimension',
        title: 'Dimension',
        type: 'context',
        events: { click: setMarkerSet },
        panel: 'marker_panel'
      });
      buttons.push({
        id: idPrefix + 'markers_label',
        title: 'Label',
        type: 'context',
        events: { click: setMarkerSet },
        panel: 'marker_panel'
      });
  */
      $.each(mtypes, function (k, pos) {
        const listname = pos + '_marker_list';
        let def = true;
        Object.keys(markerTypes).forEach(function (id) {
          const title = getTitle(String(id));
          buttons.push({
            id: idPrefix + pos + '_' + id,
            svgicon: id,
            icon: svgEditor.curConfig.extIconsPath + 'markers-' + id + '.png',
            title,
            type: 'context',
            events: {click: setArrowFromButton},
            panel: 'marker_panel',
            list: listname,
            isDefault: def
          });
          def = false;
        });
      });
      return buttons;
    }

    const contextTools = [
      {
        type: 'input',
        panel: 'marker_panel',
        id: 'start_marker',
        size: 3,
        events: {change: setMarker}
      }, {
        type: 'button-select',
        panel: 'marker_panel',
        id: 'start_marker_list',
        colnum: 3,
        events: {change: setArrowFromButton}
      }, {
        type: 'input',
        panel: 'marker_panel',
        id: 'mid_marker',
        defval: '',
        size: 3,
        events: {change: setMarker}
      }, {
        type: 'button-select',
        panel: 'marker_panel',
        id: 'mid_marker_list',
        colnum: 3,
        events: {change: setArrowFromButton}
      }, {
        type: 'input',
        panel: 'marker_panel',
        id: 'end_marker',
        size: 3,
        events: {change: setMarker}
      }, {
        type: 'button-select',
        panel: 'marker_panel',
        id: 'end_marker_list',
        colnum: 3,
        events: {change: setArrowFromButton}
      }
    ];

    return {
      name: strings.name,
      svgicons: svgEditor.curConfig.extIconsPath + 'markers-icons.xml',
      callback () {
        $('#marker_panel').addClass('toolset').hide();
      },
      async addLangData ({importLocale, lang}) {
        return {data: strings.langList};
      },
      selectedChanged (opts) {
        // Use this to update the current selected elements
        // console.log('selectChanged',opts);
        selElems = opts.elems;

        const markerElems = ['line', 'path', 'polyline', 'polygon'];

        let i = selElems.length;
        while (i--) {
          const elem = selElems[i];
          if (elem && markerElems.includes(elem.tagName)) {
            if (opts.selectedElement && !opts.multiselected) {
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
        // console.log('elementChanged',opts);
        const elem = opts.elems[0];
        if (elem && (
          elem.getAttribute('marker-start') ||
          elem.getAttribute('marker-mid') ||
          elem.getAttribute('marker-end')
        )) {
          colorChanged(elem);
          updateReferences(elem);
        }
        // changing_flag = false; // Not apparently in use
      },
      buttons: buildButtonList(),
      context_tools: strings.contextTools.map((contextTool, i) => {
        return Object.assign(contextTools[i], contextTool);
      })
    };
  }
};
