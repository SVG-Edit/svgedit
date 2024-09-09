/**
 * @file ext-arrows.js
 *
 * @license MIT
 *
 * @copyright 2010 Alexis Deveria
 *
 */

const loadExtensionTranslation = async function (svgEditor) {
  let translationModule;
  const lang = svgEditor.configObj.pref('lang');
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
  name: 'arrows',
  async init (S) {
    const svgEditor = this;
    const strings = await loadExtensionTranslation(svgEditor);
    const { svgCanvas } = svgEditor;
    const { $id } = svgCanvas;
    const
      addElem = svgCanvas.addSVGElementFromJson;
    const { nonce } = S;
    const prefix = 'se_arrow_';

    let selElems; let arrowprefix; let randomizeIds = S.randomize_ids;

    /**
    * @param {Window} win
    * @param {!(string|Integer)} n
    * @returns {void}
    */
    function setArrowNonce (win, n) {
      randomizeIds = true;
      arrowprefix = prefix + n + '_';
      pathdata.fw.id = arrowprefix + 'fw';
      pathdata.bk.id = arrowprefix + 'bk';
    }

    /**
    * @param {Window} win
    * @returns {void}
    */
    function unsetArrowNonce (_win) {
      randomizeIds = false;
      arrowprefix = prefix;
      pathdata.fw.id = arrowprefix + 'fw';
      pathdata.bk.id = arrowprefix + 'bk';
    }

    svgCanvas.bind('setnonce', setArrowNonce);
    svgCanvas.bind('unsetnonce', unsetArrowNonce);

    arrowprefix = (randomizeIds) ? `${prefix}${nonce}_` : prefix;

    const pathdata = {
      fw: { d: 'm0,0l10,5l-10,5l5,-5l-5,-5z', refx: 8, id: arrowprefix + 'fw' },
      bk: { d: 'm10,0l-10,5l10,5l-5,-5l5,-5z', refx: 2, id: arrowprefix + 'bk' }
    };

    /**
     * Gets linked element.
     * @param {Element} elem
     * @param {string} attr
     * @returns {Element}
    */
    function getLinked (elem, attr) {
      const str = elem.getAttribute(attr);
      if (!str) { return null; }
      const m = str.match(/\(#(.*)\)/);
      // const m = str.match(/\(#(?<id>.+)\)/);
      // if (!m || !m.groups.id) {
      if (!m || m.length !== 2) {
        return null;
      }
      return svgCanvas.getElem(m[1]);
    }

    /**
    * @param {boolean} on
    * @returns {void}
    */
    function showPanel (on) {
      $id('arrow_panel').style.display = (on) ? 'block' : 'none';
      if (on) {
        const el = selElems[0];
        const end = el.getAttribute('marker-end');
        const start = el.getAttribute('marker-start');
        const mid = el.getAttribute('marker-mid');
        let val;
        if (end && start) {
          val = 'both';
        } else if (end) {
          val = 'end';
        } else if (start) {
          val = 'start';
        } else if (mid) {
          val = 'mid';
          if (mid.includes('bk')) {
            val = 'mid_bk';
          }
        }

        if (!start && !mid && !end) {
          val = 'none';
        }

        $id('arrow_list').value = val;
      }
    }

    /**
    *
    * @returns {void}
    */
    function resetMarker () {
      const el = selElems[0];
      el.removeAttribute('marker-start');
      el.removeAttribute('marker-mid');
      el.removeAttribute('marker-end');
    }

    /**
    * @param {"bk"|"fw"} dir
    * @param {"both"|"mid"|"end"|"start"} type
    * @param {string} id
    * @returns {Element}
    */
    function addMarker (dir, type, id) {
      // TODO: Make marker (or use?) per arrow type, since refX can be different
      id = id || arrowprefix + dir;

      const data = pathdata[dir];

      if (type === 'mid') {
        data.refx = 5;
      }

      let marker = svgCanvas.getElem(id);
      if (!marker) {
        marker = addElem({
          element: 'marker',
          attr: {
            viewBox: '0 0 10 10',
            id,
            refY: 5,
            markerUnits: 'strokeWidth',
            markerWidth: 5,
            markerHeight: 5,
            orient: 'auto',
            style: 'pointer-events:none' // Currently needed for Opera
          }
        });
        const arrow = addElem({
          element: 'path',
          attr: {
            d: data.d,
            fill: '#000000'
          }
        });
        marker.append(arrow);
        svgCanvas.findDefs().append(marker);
      }

      marker.setAttribute('refX', data.refx);

      return marker;
    }

    /**
    *
    * @returns {void}
    */
    function setArrow () {
      resetMarker();

      let type = this.value;
      if (type === 'none') {
        return;
      }

      // Set marker on element
      let dir = 'fw';
      if (type === 'mid_bk') {
        type = 'mid';
        dir = 'bk';
      } else if (type === 'both') {
        addMarker('bk', type);
        svgCanvas.changeSelectedAttribute('marker-start', 'url(#' + pathdata.bk.id + ')');
        type = 'end';
        dir = 'fw';
      } else if (type === 'start') {
        dir = 'bk';
      }

      addMarker(dir, type);
      svgCanvas.changeSelectedAttribute('marker-' + type, 'url(#' + pathdata[dir].id + ')');
      svgCanvas.call('changed', selElems);
    }

    /**
    * @param {Element} elem
    * @returns {void}
    */
    function colorChanged (elem) {
      const color = elem.getAttribute('stroke');
      const mtypes = [ 'start', 'mid', 'end' ];
      const defs = svgCanvas.findDefs();

      mtypes.forEach(function(type){
        const marker = getLinked(elem, 'marker-' + type);
        if (!marker) { return; }

        const curColor = marker.children.getAttribute('fill');
        const curD = marker.children.getAttribute('d');
        if (curColor === color) { return; }

        const allMarkers = defs.querySelectorAll('marker');
        let newMarker = null;
        // Different color, check if already made
        Array.from(allMarkers).forEach(function(marker) {
          const attrsFill = marker.children.getAttribute('fill');
          const attrsD = marker.children.getAttribute('d');
          if (attrsFill === color && attrsD === curD) {
            // Found another marker with this color and this path
            newMarker = marker;
          }
        });

        if (!newMarker) {
          // Create a new marker with this color
          const lastId = marker.id;
          const dir = lastId.includes('_fw') ? 'fw' : 'bk';

          newMarker = addMarker(dir, type, arrowprefix + dir + allMarkers.length);

          newMarker.children.setAttribute('fill', color);
        }

        elem.setAttribute('marker-' + type, 'url(#' + newMarker.id + ')');

        // Check if last marker can be removed
        let remove = true;
        const sElements = S.svgcontent.querySelectorAll('line, polyline, path, polygon');
        Array.prototype.forEach.call(sElements, function(element){
          mtypes.forEach(function(mtype){
            if (element.getAttribute('marker-' + mtype) === 'url(#' + marker.id + ')') {
              remove = false;
              return remove;
            }
            return undefined;
          });
          if (!remove) { return false; }
          return undefined;
        });

        // Not found, so can safely remove
        if (remove) {
          marker.remove();
        }
      });
    }

    const contextTools = [
      {
        type: 'select',
        panel: 'arrow_panel',
        id: 'arrow_list',
        defval: 'none',
        events: {
          change: setArrow
        }
      }
    ];

    return {
      name: strings.name,
      context_tools: strings.contextTools.map((contextTool, i) => {
        return Object.assign(contextTools[i], contextTool);
      }),
      callback () {
        $id("arrow_panel").style.display = 'none';

        // Set ID so it can be translated in locale file
        $id('arrow_list option').setAttribute('id', 'connector_no_arrow');
      },
      async addLangData ({ _lang, importLocale }) {
        const { langList } = await importLocale();
        return {
          data: langList
        };
      },
      selectedChanged (opts) {
        // Use this to update the current selected elements
        selElems = opts.elems;

        const markerElems = [ 'line', 'path', 'polyline', 'polygon' ];
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
        const elem = opts.elems[0];
        if (elem && (
          elem.getAttribute('marker-start') ||
          elem.getAttribute('marker-mid') ||
          elem.getAttribute('marker-end')
        )) {
          // const start = elem.getAttribute('marker-start');
          // const mid = elem.getAttribute('marker-mid');
          // const end = elem.getAttribute('marker-end');
          // Has marker, so see if it should match color
          colorChanged(elem);
        }
      }
    };
  }
};
