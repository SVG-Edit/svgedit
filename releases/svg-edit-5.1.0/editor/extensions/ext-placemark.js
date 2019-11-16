/**
 * ext-placemark.js
 *
 *
 * @copyright 2010 CloudCanvas, Inc. All rights reserved
 *
 */
export default {
  name: 'placemark',
  async init (S) {
    const svgEditor = this;
    const svgCanvas = svgEditor.canvas;
    const addElem = svgCanvas.addSVGElementFromJson;
    const {$, importLocale} = S; // {svgcontent},
    let
      selElems,
      // editingitex = false,
      // svgdoc = S.svgroot.parentNode.ownerDocument,
      started,
      newPM;
      // edg = 0,
      // newFOG, newFOGParent, newDef, newImageName, newMaskID,
      // undoCommand = 'Not image',
      // modeChangeG, ccZoom, wEl, hEl, wOffset, hOffset, ccRgbEl, brushW, brushH;
    const strings = await importLocale();
    const markerTypes = {
      nomarker: {},
      forwardslash:
        {element: 'path', attr: {d: 'M30,100 L70,0'}},
      reverseslash:
        {element: 'path', attr: {d: 'M30,0 L70,100'}},
      verticalslash:
        {element: 'path', attr: {d: 'M50,0 L50,100'}},
      xmark:
        {element: 'path', attr: {d: 'M20,80 L80,20 M80,80 L20,20'}},
      leftarrow:
        {element: 'path', attr: {d: 'M0,50 L100,90 L70,50 L100,10 Z'}},
      rightarrow:
        {element: 'path', attr: {d: 'M100,50 L0,90 L30,50 L0,10 Z'}},
      box:
        {element: 'path', attr: {d: 'M20,20 L20,80 L80,80 L80,20 Z'}},
      star:
        {element: 'path', attr: {d: 'M10,30 L90,30 L20,90 L50,10 L80,90 Z'}},
      mcircle:
        {element: 'circle', attr: {r: 30, cx: 50, cy: 50}},
      triangle:
        {element: 'path', attr: {d: 'M10,80 L50,20 L80,80 Z'}}
    };

    // duplicate shapes to support unfilled (open) marker types with an _o suffix
    ['leftarrow', 'rightarrow', 'box', 'star', 'mcircle', 'triangle'].forEach((v) => {
      markerTypes[v + '_o'] = markerTypes[v];
    });

    /**
     *
     * @param {boolean} on
     * @returns {void}
     */
    function showPanel (on) {
      $('#placemark_panel').toggle(on);
    }

    /**
    * @param {Element} elem - A graphic element will have an attribute like marker-start
    * @param {"marker-start"|"marker-mid"|"marker-end"} attr
    * @returns {Element} The marker element that is linked to the graphic element
    */
    function getLinked (elem, attr) {
      if (!elem) { return null; }
      const str = elem.getAttribute(attr);
      if (!str) { return null; }

      // const m = str.match(/\(#(?<id>.+)\)/);
      // if (!m || !m.groups.id) {
      const m = str.match(/\(#(.*)\)/);
      if (!m || m.length !== 2) {
        return null;
      }
      return svgCanvas.getElem(m[1]);
      // return svgCanvas.getElem(m.groups.id);
    }

    /**
     * Called when text is changed.
     * @param {string} txt
     * @returns {void}
     */
    function updateText (txt) {
      const items = txt.split(';');
      selElems.forEach((elem) => {
        if (elem && elem.getAttribute('class').includes('placemark')) {
          $(elem).children().each((_, i) => {
            const [, , type, n] = i.id.split('_');
            if (type === 'txt') {
              $(i).text(items[n]);
            }
          });
        }
      });
    }
    /**
     * Called when font is changed.
     * @param {string} font
     * @returns {void}
     */
    function updateFont (font) {
      font = font.split(' ');
      const fontSize = parseInt(font.pop());
      font = font.join(' ');
      selElems.forEach((elem) => {
        if (elem && elem.getAttribute('class').includes('placemark')) {
          $(elem).children().each((_, i) => {
            const [, , type] = i.id.split('_');
            if (type === 'txt') {
              $(i).attr({'font-family': font, 'font-size': fontSize});
            }
          });
        }
      });
    }
    /**
    * @param {string} id
    * @param {""|"\\nomarker"|"nomarker"|"leftarrow"|"rightarrow"|"textmarker"|"textmarker_top"|"textmarker_bottom"|"forwardslash"|"reverseslash"|"verticalslash"|"box"|"star"|"xmark"|"triangle"|"mcircle"} val
    * @returns {SVGMarkerElement}
    */
    function addMarker (id, val) {
      let marker = svgCanvas.getElem(id);
      if (marker) { return undefined; }
      // console.log(id);
      if (val === '' || val === 'nomarker') { return undefined; }
      const color = svgCanvas.getColor('stroke');
      // NOTE: Safari didn't like a negative value in viewBox
      // so we use a standardized 0 0 100 100
      // with 50 50 being mapped to the marker position
      const scale = 2;// parseFloat($('#marker_size').val());
      const strokeWidth = 10;
      let refX = 50;
      const refY = 50;
      const viewBox = '0 0 100 100';
      const markerWidth = 5 * scale;
      const markerHeight = 5 * scale;
      const seType = val;

      if (!markerTypes[seType]) { return undefined; } // an unknown type!
      // positional markers(arrows) at end of line
      if (seType.includes('left')) refX = 0;
      if (seType.includes('right')) refX = 100;

      // create a generic marker
      marker = addElem({
        element: 'marker',
        attr: {
          id,
          markerUnits: 'strokeWidth',
          orient: 'auto',
          style: 'pointer-events:none',
          class: seType
        }
      });

      const mel = addElem(markerTypes[seType]);
      const fillcolor = (seType.substr(-2) === '_o')
        ? 'none'
        : color;

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
    }
    /**
    * @param {Element} el
    * @param {string} val
    * @returns {void}
    */
    function setMarker (el, val) {
      const markerName = 'marker-start';
      const marker = getLinked(el, markerName);
      if (marker) { $(marker).remove(); }
      el.removeAttribute(markerName);
      if (val === 'nomarker') {
        svgCanvas.call('changed', [el]);
        return;
      }
      // Set marker on element
      const id = 'placemark_marker_' + el.id;
      addMarker(id, val);
      el.setAttribute(markerName, 'url(#' + id + ')');
      svgCanvas.call('changed', [el]);
    }

    /**
     * Called when the main system modifies an object. This routine changes
     *   the associated markers to be the same color.
     * @param {Element} el
     * @returns {void}
    */
    function colorChanged (el) {
      const color = el.getAttribute('stroke');
      const marker = getLinked(el, 'marker-start');
      // console.log(marker);
      if (!marker) { return; }
      if (!marker.attributes.class) { return; } // not created by this extension
      const ch = marker.lastElementChild;
      if (!ch) { return; }
      const curfill = ch.getAttribute('fill');
      const curstroke = ch.getAttribute('stroke');
      if (curfill && curfill !== 'none') { ch.setAttribute('fill', color); }
      if (curstroke && curstroke !== 'none') { ch.setAttribute('stroke', color); }
    }

    /**
    * Called when the main system creates or modifies an object.
    * Its primary purpose is to create new markers for cloned objects.
    * @param {Element} el
    * @returns {void}
    */
    function updateReferences (el) {
      const id = 'placemark_marker_' + el.id;
      const markerName = 'marker-start';
      const marker = getLinked(el, markerName);
      if (!marker || !marker.attributes.class) { return; } // not created by this extension
      const url = el.getAttribute(markerName);
      if (url) {
        const len = el.id.length;
        const linkid = url.substr(-len - 1, len);
        if (el.id !== linkid) {
          const val = $('#placemark_marker').attr('value') || 'leftarrow';
          addMarker(id, val);
          svgCanvas.changeSelectedAttribute(markerName, 'url(#' + id + ')');
          svgCanvas.call('changed', selElems);
        }
      }
    }
    /**
    * @param {Event} ev
    * @returns {void}
    */
    function setArrowFromButton (ev) {
      const parts = this.id.split('_');
      let val = parts[2];
      if (parts[3]) { val += '_' + parts[3]; }
      $('#placemark_marker').attr('value', val);
    }

    /**
    * @param {"nomarker"|"leftarrow"|"rightarrow"|"textmarker"|"forwardslash"|"reverseslash"|"verticalslash"|"box"|"star"|"xmark"|"triangle"|"mcircle"} id
    * @returns {string}
    */
    function getTitle (id) {
      const {langList} = strings;
      const item = langList.find((itm) => {
        return itm.id === id;
      });
      return item ? item.title : id;
    }

    /**
    * Build the toolbar button array from the marker definitions.
    * @param {module:SVGEditor.Button[]} buttons
    * @returns {module:SVGEditor.Button[]}
    */
    function addMarkerButtons (buttons) {
      Object.keys(markerTypes).forEach(function (id) {
        const title = getTitle(String(id));
        buttons.push({
          id: 'placemark_marker_' + id,
          svgicon: id,
          icon: svgEditor.curConfig.extIconsPath + 'markers-' + id + '.png',
          title,
          type: 'context',
          events: {click: setArrowFromButton},
          panel: 'placemark_panel',
          list: 'placemark_marker',
          isDefault: id === 'leftarrow'
        });
      });
      return buttons;
    }

    const buttons = [{
      id: 'tool_placemark',
      icon: svgEditor.curConfig.extIconsPath + 'placemark.png',
      type: 'mode',
      position: 12,
      events: {
        click () {
          showPanel(true);
          svgCanvas.setMode('placemark');
        }
      }
    }];
    const contextTools = [
      {
        type: 'button-select',
        panel: 'placemark_panel',
        id: 'placemark_marker',
        colnum: 3,
        events: {change: setArrowFromButton}
      },
      {
        type: 'input',
        panel: 'placemark_panel',
        id: 'placemarkText',
        size: 20,
        defval: '',
        events: {
          change () {
            updateText(this.value);
          }
        }
      }, {
        type: 'input',
        panel: 'placemark_panel',
        id: 'placemarkFont',
        size: 7,
        defval: 'Arial 10',
        events: {
          change () {
            updateFont(this.value);
          }
        }
      }
    ];

    return {
      name: strings.name,
      svgicons: svgEditor.curConfig.extIconsPath + 'placemark-icons.xml',
      buttons: addMarkerButtons(strings.buttons.map((button, i) => {
        return Object.assign(buttons[i], button);
      })),
      context_tools: strings.contextTools.map((contextTool, i) => {
        return Object.assign(contextTools[i], contextTool);
      }),
      callback () {
        $('#placemark_panel').hide();
        // const endChanges = function(){};
      },
      mouseDown (opts) {
        // const rgb = svgCanvas.getColor('fill');
        const sRgb = svgCanvas.getColor('stroke');
        const sWidth = svgCanvas.getStrokeWidth();

        if (svgCanvas.getMode() === 'placemark') {
          started = true;
          const id = svgCanvas.getNextId();
          const items = $('#placemarkText').val().split(';');
          let font = $('#placemarkFont').val().split(' ');
          const fontSize = parseInt(font.pop());
          font = font.join(' ');
          const x0 = opts.start_x + 10, y0 = opts.start_y + 10;
          let maxlen = 0;
          const children = [{
            element: 'line',
            attr: {
              id: id + '_pline_0',
              fill: 'none',
              stroke: sRgb,
              'stroke-width': sWidth,
              'stroke-linecap': 'round',
              x1: opts.start_x,
              y1: opts.start_y,
              x2: x0,
              y2: y0
            }
          }];
          items.forEach((i, n) => {
            maxlen = Math.max(maxlen, i.length);
            children.push({
              element: 'line',
              attr: {
                id: id + '_tline_' + n,
                fill: 'none',
                stroke: sRgb,
                'stroke-width': sWidth,
                'stroke-linecap': 'round',
                x1: x0,
                y1: y0 + (fontSize + 6) * n,
                x2: x0 + i.length * fontSize * 0.5 + fontSize,
                y2: y0 + (fontSize + 6) * n
              }
            });
            children.push({
              element: 'text',
              attr: {
                id: id + '_txt_' + n,
                fill: sRgb,
                stroke: 'none',
                'stroke-width': 0,
                x: x0 + 3,
                y: y0 - 3 + (fontSize + 6) * n,
                'font-family': font,
                'font-size': fontSize,
                'text-anchor': 'start'
              },
              children: [i]
            });
          });
          if (items.length > 0) {
            children.push({
              element: 'line',
              attr: {
                id: id + '_vline_0',
                fill: 'none',
                stroke: sRgb,
                'stroke-width': sWidth,
                'stroke-linecap': 'round',
                x1: x0,
                y1: y0,
                x2: x0,
                y2: y0 + (fontSize + 6) * (items.length - 1)
              }
            });
          }
          newPM = svgCanvas.addSVGElementFromJson({
            element: 'g',
            attr: {
              id,
              class: 'placemark',
              fontSize,
              maxlen,
              lines: items.length,
              x: opts.start_x,
              y: opts.start_y,
              px: opts.start_x,
              py: opts.start_y
            },
            children
          });
          setMarker(
            newPM.firstElementChild,
            $('#placemark_marker').attr('value') || 'leftarrow'
          );
          return {
            started: true
          };
        }
        return undefined;
      },
      mouseMove (opts) {
        if (!started) {
          return undefined;
        }
        if (svgCanvas.getMode() === 'placemark') {
          const x = opts.mouse_x / svgCanvas.getZoom();
          const y = opts.mouse_y / svgCanvas.getZoom();
          const {fontSize, maxlen, lines, px, py} = $(newPM).attr(
            ['fontSize', 'maxlen', 'lines', 'px', 'py']
          );
          $(newPM).attr({x, y});
          $(newPM).children().each((_, i) => {
            const [, , type, n] = i.id.split('_');
            const y0 = y + (fontSize + 6) * n,
              x0 = x + maxlen * fontSize * 0.5 + fontSize;
            const nx = (x + (x0 - x) / 2 < px) ? x0 : x;
            const ny = (y + ((fontSize + 6) * (lines - 1)) / 2 < py)
              ? y + (fontSize + 6) * (lines - 1)
              : y;
            if (type === 'pline') {
              i.setAttribute('x2', nx);
              i.setAttribute('y2', ny);
            }
            if (type === 'tline') {
              i.setAttribute('x1', x);
              i.setAttribute('y1', y0);
              i.setAttribute('x2', x0);
              i.setAttribute('y2', y0);
            }
            if (type === 'vline') {
              i.setAttribute('x1', nx);
              i.setAttribute('y1', y);
              i.setAttribute('x2', nx);
              i.setAttribute('y2', y + (fontSize + 6) * (lines - 1));
            }
            if (type === 'txt') {
              i.setAttribute('x', x + fontSize / 2);
              i.setAttribute('y', y0 - 3);
            }
          });
          return {
            started: true
          };
        }
        return undefined;
      },
      mouseUp () {
        if (svgCanvas.getMode() === 'placemark') {
          const {x, y, px, py} = $(newPM).attr(['x', 'y', 'px', 'py']);
          return {
            keep: (x != px && y != py), // eslint-disable-line eqeqeq
            element: newPM
          };
        }
        return undefined;
      },
      selectedChanged (opts) {
        // Use this to update the current selected elements
        selElems = opts.elems;
        selElems.forEach((elem) => {
          if (elem && elem.getAttribute('class').includes('placemark')) {
            const txt = [];
            $(elem).children().each((n, i) => {
              const [, , type] = i.id.split('_');
              if (type === 'txt') {
                $('#placemarkFont').val(
                  i.getAttribute('font-family') + ' ' + i.getAttribute('font-size')
                );
                txt.push($(i).text());
              }
            });
            $('#placemarkText').val(txt.join(';'));
            showPanel(true);
          } else {
            showPanel(false);
          }
        });
      },
      elementChanged (opts) {
        opts.elems.forEach((elem) => {
          if (elem.id.includes('pline_0')) { // need update marker of pline_0
            colorChanged(elem);
            updateReferences(elem);
          }
        });
      }
    };
  }
};
