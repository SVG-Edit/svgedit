/**
 * @file ext-shapes.js
 *
 * @license MIT
 *
 * @copyright 2010 Christian Tzurcanu, 2010 Alexis Deveria
 *
 */

const loadExtensionTranslation = async function (lang) {
  let translationModule;
  try {
    translationModule = await import(`./locale/${encodeURIComponent(lang)}.js`);
  } catch (_error) {
    // eslint-disable-next-line no-console
    console.error(`Missing translation (${lang}) - using 'en'`);
    translationModule = await import(`./locale/en.js`);
  }
  return translationModule.default;
};

export default {
  name: 'shapes',
  async init ({$}) {
    const svgEditor = this;
    const strings = await loadExtensionTranslation(svgEditor.curPrefs.lang);
    const canv = svgEditor.canvas;
    const svgroot = canv.getRootElem();
    let lastBBox = {};

    // This populates the category list
    const {categories} = strings;
    const library = {
      basic: {
        buttons: []
      }
    };
    const modeId = 'shapelib';
    const startClientPos = {};

    let currentD, curShapeId, curShape, startX, startY;
    let curLib = library.basic;

    /**
    *
    * @returns {void}
    */
    function loadIcons () {
      $('#shape_buttons').empty().append(curLib.buttons);
    }

    /**
    * @typedef {PlainObject} module:Extension.Shapes.Shapes
    * @property {PlainObject<string, string>} data
    * @property {Integer} [size]
    * @property {boolean} [fill]
    */

    /**
    * @param {string|"basic"} cat Category ID
    * @param {module:Extension.Shapes.Shapes} shapes
    * @returns {void}
    */
    function makeButtons (cat, shapes) {
      const size = curLib.size || 300;
      const fill = curLib.fill || false;
      const off = size * 0.05;
      const vb = [-off, -off, size + off * 2, size + off * 2].join(' ');
      const stroke = fill ? 0 : (size / 30);
      const shapeIcon = new DOMParser().parseFromString(
        '<svg xmlns="http://www.w3.org/2000/svg">' +
          '<svg viewBox="' + vb + '">' +
            '<path fill="' + (fill ? '#333' : 'none') +
              '" stroke="#000" stroke-width="' + stroke + '" /></svg></svg>',
        'text/xml'
      );

      const width = 24;
      const height = 24;
      shapeIcon.documentElement.setAttribute('width', width);
      shapeIcon.documentElement.setAttribute('height', height);
      const svgElem = $(document.importNode(shapeIcon.documentElement, true));

      const {data} = shapes;

      curLib.buttons = Object.entries(data).map(([id, pathD]) => {
        const icon = svgElem.clone();
        icon.find('path').attr('d', pathD);

        const iconBtn = icon.wrap('<div class="tool_button">').parent().attr({
          id: modeId + '_' + id,
          title: id
        });
        // Store for later use
        return iconBtn[0];
      });
    }

    /**
    * @param {string|"basic"} catId
    * @returns {void}
    */
    function loadLibrary (catId) {
      const lib = library[catId];

      if (!lib) {
        $('#shape_buttons').html(strings.loading);
        $.getJSON('./shapelib/' + catId + '.json', function (result) {
          curLib = library[catId] = {
            data: result.data,
            size: result.size,
            fill: result.fill
          };
          makeButtons(catId, result);
          loadIcons();
        });
        return;
      }
      curLib = lib;
      if (!lib.buttons.length) { makeButtons(catId, lib); }
      loadIcons();
    }
    const buttons = [{
      id: 'tool_shapelib_show',
      type: 'mode_flyout',
      events: {
        click () {
          canv.setMode(modeId);
        }
      }
    }];

    return {
      newUI: true,
      buttons: strings.buttons.map((button, i) => {
        return Object.assign(buttons[i], button);
      }),
      callback () {
        $('<style>').text(`
          #shape_buttons {
            overflow: auto;
            width: 180px;
            max-height: 300px;
            display: table-cell;
            vertical-align: middle;
          }
          #shape_cats {
            min-width: 110px;
            display: table-cell;
            vertical-align: middle;
            height: 300px;
          }
          #shape_cats > div {
            line-height: 1em;
            padding: .5em;
            border:1px solid #B0B0B0;
            background: #E8E8E8;
            margin-bottom: -1px;
          }
          #shape_cats div:hover {
            background: #FFFFCC;
          }
          #shape_cats div.current {
            font-weight: bold;
          }
        `).appendTo('head');

        const btnDiv = $('<div id="shape_buttons">');
        $('#tools_shapelib > *').wrapAll(btnDiv);

        const shower = $('#tools_shapelib_show');

        loadLibrary('basic');

        // Do mouseup on parent element rather than each button
        $('#shape_buttons').mouseup(function (evt) {
          const btn = $(evt.target).closest('div.tool_button');

          if (!btn.length) { return; }

          const copy = btn.children().clone();
          shower
            .append(copy)
            .attr('data-curopt', '#' + btn[0].id) // This sets the current mode
            .mouseup();
          canv.setMode(modeId);

          curShapeId = btn[0].id.substr((modeId + '_').length);
          currentD = curLib.data[curShapeId];
        });

        const shapeCats = $('<div id="shape_cats">');

        let catStr = '';
        $.each(categories, function (id, label) {
          catStr += '<div data-cat=' + id + '>' + label + '</div>';
        });

        shapeCats.html(catStr).children().bind('mouseup', function () {
          const catlink = $(this);
          catlink.siblings().removeClass('current');
          catlink.addClass('current');

          loadLibrary(catlink.attr('data-cat'));
          // Get stuff
          return false;
        });

        shapeCats.children().eq(0).addClass('current');

        $('#tools_shapelib').append(shapeCats);

        shower.mouseup(function () {
          canv.setMode(currentD ? modeId : 'select');
        });
        $('#tool_shapelib').remove();

        const h = $('#tools_shapelib').height();
        $('#tools_shapelib').css({
          'margin-top': -(h / 2 - 15),
          'margin-left': 3
        });
        // Now add shape categories from locale
        const cats = {};
        Object.entries(categories).forEach(([o, categoryName]) => {
          cats['#shape_cats [data-cat="' + o + '"]'] = categoryName;
        });
        this.setStrings('content', cats);
      },
      mouseDown (opts) {
        const mode = canv.getMode();
        if (mode !== modeId) { return undefined; }

        startX = opts.start_x;
        const x = startX;
        startY = opts.start_y;
        const y = startY;
        const curStyle = canv.getStyle();

        startClientPos.x = opts.event.clientX;
        startClientPos.y = opts.event.clientY;

        curShape = canv.addSVGElementFromJson({
          element: 'path',
          curStyles: true,
          attr: {
            d: currentD,
            id: canv.getNextId(),
            opacity: curStyle.opacity / 2,
            style: 'pointer-events:none'
          }
        });

        // Make sure shape uses absolute values
        if ((/[a-z]/).test(currentD)) {
          currentD = curLib.data[curShapeId] = canv.pathActions.convertPath(curShape);
          curShape.setAttribute('d', currentD);
          canv.pathActions.fixEnd(curShape);
        }
        curShape.setAttribute('transform', 'translate(' + x + ',' + y + ') scale(0.005) translate(' + -x + ',' + -y + ')');

        canv.recalculateDimensions(curShape);

        /* const tlist = */ canv.getTransformList(curShape);

        lastBBox = curShape.getBBox();

        return {
          started: true
        };
      },
      mouseMove (opts) {
        const mode = canv.getMode();
        if (mode !== modeId) { return; }

        const zoom = canv.getZoom();
        const evt = opts.event;

        const x = opts.mouse_x / zoom;
        const y = opts.mouse_y / zoom;

        const tlist = canv.getTransformList(curShape),
          box = curShape.getBBox(),
          left = box.x, top = box.y;
          // {width, height} = box,
        // const dx = (x - startX), dy = (y - startY);

        const newbox = {
          x: Math.min(startX, x),
          y: Math.min(startY, y),
          width: Math.abs(x - startX),
          height: Math.abs(y - startY)
        };

        /*
        // This is currently serving no purpose, so commenting out
        let sy = height ? (height + dy) / height : 1,
          sx = width ? (width + dx) / width : 1;
        */

        let sx = (newbox.width / lastBBox.width) || 1;
        let sy = (newbox.height / lastBBox.height) || 1;

        // Not perfect, but mostly works...
        let tx = 0;
        if (x < startX) {
          tx = lastBBox.width;
        }
        let ty = 0;
        if (y < startY) {
          ty = lastBBox.height;
        }

        // update the transform list with translate,scale,translate
        const translateOrigin = svgroot.createSVGTransform(),
          scale = svgroot.createSVGTransform(),
          translateBack = svgroot.createSVGTransform();

        translateOrigin.setTranslate(-(left + tx), -(top + ty));
        if (!evt.shiftKey) {
          const max = Math.min(Math.abs(sx), Math.abs(sy));

          sx = max * (sx < 0 ? -1 : 1);
          sy = max * (sy < 0 ? -1 : 1);
        }
        scale.setScale(sx, sy);

        translateBack.setTranslate(left + tx, top + ty);
        tlist.appendItem(translateBack);
        tlist.appendItem(scale);
        tlist.appendItem(translateOrigin);

        canv.recalculateDimensions(curShape);

        lastBBox = curShape.getBBox();
      },
      mouseUp (opts) {
        const mode = canv.getMode();
        if (mode !== modeId) { return undefined; }

        const keepObject = (opts.event.clientX !== startClientPos.x && opts.event.clientY !== startClientPos.y);

        return {
          keep: keepObject,
          element: curShape,
          started: false
        };
      }
    };
  }
};
