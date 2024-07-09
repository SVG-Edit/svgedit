function __variableDynamicImportRuntime0__(path) {
  switch (path) {
    case './locale/en.js':
      return Promise.resolve().then(function () { return en$1; });
    case './locale/fr.js':
      return Promise.resolve().then(function () { return fr$1; });
    case './locale/sv.js':
      return Promise.resolve().then(function () { return sv$1; });
    case './locale/tr.js':
      return Promise.resolve().then(function () { return tr$1; });
    case './locale/uk.js':
      return Promise.resolve().then(function () { return uk$1; });
    case './locale/zh-CN.js':
      return Promise.resolve().then(function () { return zhCN$1; });
    default:
      return new Promise(function (resolve, reject) {
        (typeof queueMicrotask === 'function' ? queueMicrotask : setTimeout)(reject.bind(null, new Error("Unknown variable dynamic import: " + path)));
      });
  }
}

/**
 * @file ext-polystar.js
 *
 *
 * @copyright 2010 CloudCanvas, Inc. All rights reserved
 * @copyright 2021 Optimistik SAS, Inc. All rights reserved
 * @license MIT
 *
 */

const name = 'polystar';
const loadExtensionTranslation = async function (svgEditor) {
  let translationModule;
  const lang = svgEditor.configObj.pref('lang');
  try {
    translationModule = await __variableDynamicImportRuntime0__(`./locale/${lang}.js`);
  } catch (_error) {
    console.warn(`Missing translation (${lang}) for ${name} - using 'en'`);
    translationModule = await Promise.resolve().then(function () { return en$1; });
  }
  svgEditor.i18next.addResourceBundle(lang, name, translationModule.default);
};
var extPolystar = {
  name,
  async init() {
    const svgEditor = this;
    const {
      svgCanvas
    } = svgEditor;
    const {
      ChangeElementCommand
    } = svgCanvas.history;
    const addToHistory = cmd => {
      svgCanvas.undoMgr.addCommandToHistory(cmd);
    };
    const {
      $id,
      $click
    } = svgCanvas;
    let selElems;
    let started;
    let newFO;
    await loadExtensionTranslation(svgEditor);

    /**
     * @param {boolean} on true=display
     * @param {string} tool "star" or "polygone"
     * @returns {void}
     */
    const showPanel = (on, tool) => {
      if (on) {
        $id(`${tool}_panel`).style.removeProperty('display');
      } else {
        $id(`${tool}_panel`).style.display = 'none';
      }
    };

    /**
     *
     * @param {string} attr attribute to change
     * @param {string|Float} val new value
     * @returns {void}
     */
    const setAttr = (attr, val) => {
      svgCanvas.changeSelectedAttribute(attr, val);
      svgCanvas.call('changed', selElems);
    };

    /**
     * @param {Float} n angle
     * @return {Float} cotangeante
     */
    const cot = n => 1 / Math.tan(n);

    /**
     * @param {Float} n angle
     * @returns {Float} sec
     */
    const sec = n => 1 / Math.cos(n);
    return {
      name: svgEditor.i18next.t(`${name}:name`),
      // The callback should be used to load the DOM with the appropriate UI items
      callback() {
        // Add the button and its handler(s)
        // Note: the star extension needs to be loaded before the polygon extension
        const fbtitle = `${name}:title`;
        const titleStar = `${name}:buttons.0.title`;
        const titlePolygon = `${name}:buttons.1.title`;
        const buttonTemplate = `
            <se-flyingbutton id="tools_polygon" title="${fbtitle}">
              <se-button id="tool_star" title="${titleStar}" src="star.svg">
              </se-button>
              <se-button id="tool_polygon" title="${titlePolygon}" src="polygon.svg">
              </se-button>
            </se-flyingbutton>
          `;
        svgCanvas.insertChildAtIndex($id('tools_left'), buttonTemplate, 10);
        // handler
        $click($id('tool_star'), () => {
          if (this.leftPanel.updateLeftPanel('tool_star')) {
            svgCanvas.setMode('star');
            showPanel(true, 'star');
            showPanel(false, 'polygon');
          }
        });
        $click($id('tool_polygon'), () => {
          if (this.leftPanel.updateLeftPanel('tool_polygon')) {
            svgCanvas.setMode('polygon');
            showPanel(true, 'polygon');
            showPanel(false, 'star');
          }
        });
        const label0 = `${name}:contextTools.0.label`;
        const title0 = `${name}:contextTools.0.title`;
        const label1 = `${name}:contextTools.1.label`;
        const title1 = `${name}:contextTools.1.title`;
        const label2 = `${name}:contextTools.2.label`;
        const title2 = `${name}:contextTools.2.title`;
        const label3 = `${name}:contextTools.3.label`;
        const title3 = `${name}:contextTools.3.title`;
        // Add the context panel and its handler(s)
        const panelTemplate = document.createElement('template');
        panelTemplate.innerHTML = `
          <div id="star_panel">
            <se-spin-input id="starNumPoints" label="${label0}" min=1 step=1 value=5 title="${title0}">
            </se-spin-input>
            <se-spin-input id="RadiusMultiplier" label="${label1}" min=1 step=2.5 value=3 title="${title1}">
            </se-spin-input>
            <se-spin-input id="radialShift" min=0 step=1 value=0 label="${label2}" title="${title2}">
            </se-spin-input>
          </div>
          <div id="polygon_panel">
            <se-spin-input size="3" id="polySides" min=1 step=1 value=5 label="${label3}" title="${title3}">
            </se-spin-input>
          </div>
        `;
        // add handlers for the panel
        $id('tools_top').appendChild(panelTemplate.content.cloneNode(true));
        // don't display the panels on start
        showPanel(false, 'star');
        showPanel(false, 'polygon');
        $id('starNumPoints').addEventListener('change', event => {
          setAttr('point', event.target.value);
          const point = event.target.value;
          let i = selElems.length;
          while (i--) {
            const elem = selElems[i];
            if (elem.hasAttribute('r')) {
              const oldPoint = elem.getAttribute('point');
              const oldPoints = elem.getAttribute('points');
              const radialshift = elem.getAttribute('radialshift');
              let xpos = 0;
              let ypos = 0;
              if (elem.points) {
                const list = elem.points;
                const len = list.numberOfItems;
                for (let i = 0; i < len; ++i) {
                  const pt = list.getItem(i);
                  xpos += parseFloat(pt.x);
                  ypos += parseFloat(pt.y);
                }
                const cx = xpos / len;
                const cy = ypos / len;
                const circumradius = Number(elem.getAttribute('r'));
                const inradius = circumradius / elem.getAttribute('starRadiusMultiplier');
                let polyPoints = '';
                for (let s = 0; point >= s; s++) {
                  let angle = 2.0 * Math.PI * (s / point);
                  {
                    angle -= Math.PI / 2;
                  }
                  let x = circumradius * Math.cos(angle) + cx;
                  let y = circumradius * Math.sin(angle) + cy;
                  polyPoints += x + ',' + y + ' ';
                  if (!isNaN(inradius)) {
                    angle = 2.0 * Math.PI * (s / point) + Math.PI / point;
                    {
                      angle -= Math.PI / 2;
                    }
                    angle += radialshift;
                    x = inradius * Math.cos(angle) + cx;
                    y = inradius * Math.sin(angle) + cy;
                    polyPoints += x + ',' + y + ' ';
                  }
                }
                elem.setAttribute('points', polyPoints);
                addToHistory(new ChangeElementCommand(elem, {
                  point: oldPoint,
                  points: oldPoints
                }));
              }
            }
          }
        });
        $id('RadiusMultiplier').addEventListener('change', event => {
          setAttr('starRadiusMultiplier', event.target.value);
        });
        $id('radialShift').addEventListener('change', event => {
          setAttr('radialshift', event.target.value);
        });
        $id('polySides').addEventListener('change', event => {
          setAttr('sides', event.target.value);
          const sides = event.target.value;
          let i = selElems.length;
          while (i--) {
            const elem = selElems[i];
            if (elem.hasAttribute('edge')) {
              const oldSides = elem.getAttribute('sides');
              const oldPoints = elem.getAttribute('points');
              let xpos = 0;
              let ypos = 0;
              if (elem.points) {
                const list = elem.points;
                const len = list.numberOfItems;
                for (let i = 0; i < len; ++i) {
                  const pt = list.getItem(i);
                  xpos += parseFloat(pt.x);
                  ypos += parseFloat(pt.y);
                }
                const cx = xpos / len;
                const cy = ypos / len;
                const edg = elem.getAttribute('edge');
                const inradius = edg / 2 * cot(Math.PI / sides);
                const circumradius = inradius * sec(Math.PI / sides);
                let points = '';
                for (let s = 0; sides >= s; s++) {
                  const angle = 2.0 * Math.PI * s / sides;
                  const x = circumradius * Math.cos(angle) + cx;
                  const y = circumradius * Math.sin(angle) + cy;
                  points += x + ',' + y + ' ';
                }
                elem.setAttribute('points', points);
                addToHistory(new ChangeElementCommand(elem, {
                  sides: oldSides,
                  points: oldPoints
                }));
              }
            }
          }
        });
      },
      mouseDown(opts) {
        if (svgCanvas.getMode() === 'star') {
          const fill = svgCanvas.getColor('fill');
          const stroke = svgCanvas.getColor('stroke');
          const strokeWidth = svgCanvas.getStrokeWidth();
          started = true;
          newFO = svgCanvas.addSVGElementsFromJson({
            element: 'polygon',
            attr: {
              cx: opts.start_x,
              cy: opts.start_y,
              id: svgCanvas.getNextId(),
              shape: 'star',
              point: $id('starNumPoints').value,
              r: 0,
              radialshift: $id('radialShift').value,
              r2: 0,
              orient: 'point',
              fill,
              stroke,
              'stroke-width': strokeWidth
            }
          });
          return {
            started: true
          };
        }
        if (svgCanvas.getMode() === 'polygon') {
          const fill = svgCanvas.getColor('fill');
          const stroke = svgCanvas.getColor('stroke');
          const strokeWidth = svgCanvas.getStrokeWidth();
          started = true;
          newFO = svgCanvas.addSVGElementsFromJson({
            element: 'polygon',
            attr: {
              cx: opts.start_x,
              cy: opts.start_y,
              id: svgCanvas.getNextId(),
              shape: 'regularPoly',
              sides: $id('polySides').value,
              orient: 'x',
              edge: 0,
              fill,
              stroke,
              'stroke-width': strokeWidth
            }
          });
          return {
            started: true
          };
        }
        return undefined;
      },
      mouseMove(opts) {
        if (!started) {
          return undefined;
        }
        if (svgCanvas.getMode() === 'star') {
          const cx = Number(newFO.getAttribute('cx'));
          const cy = Number(newFO.getAttribute('cy'));
          const point = Number(newFO.getAttribute('point'));
          const orient = newFO.getAttribute('orient');
          const fill = newFO.getAttribute('fill');
          const stroke = newFO.getAttribute('stroke');
          const strokeWidth = Number(newFO.getAttribute('stroke-width'));
          const radialshift = Number(newFO.getAttribute('radialshift'));
          let x = opts.mouse_x;
          let y = opts.mouse_y;
          const circumradius = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy)) / 1.5;
          const RadiusMultiplier = document.getElementById('RadiusMultiplier').value;
          const inradius = circumradius / RadiusMultiplier;
          newFO.setAttribute('r', circumradius);
          newFO.setAttribute('r2', inradius);
          newFO.setAttribute('starRadiusMultiplier', RadiusMultiplier);
          let polyPoints = '';
          for (let s = 0; point >= s; s++) {
            let angle = 2.0 * Math.PI * (s / point);
            if (orient === 'point') {
              angle -= Math.PI / 2;
            } else if (orient === 'edge') {
              angle = angle + Math.PI / point - Math.PI / 2;
            }
            x = circumradius * Math.cos(angle) + cx;
            y = circumradius * Math.sin(angle) + cy;
            polyPoints += x + ',' + y + ' ';
            if (!isNaN(inradius)) {
              angle = 2.0 * Math.PI * (s / point) + Math.PI / point;
              if (orient === 'point') {
                angle -= Math.PI / 2;
              } else if (orient === 'edge') {
                angle = angle + Math.PI / point - Math.PI / 2;
              }
              angle += radialshift;
              x = inradius * Math.cos(angle) + cx;
              y = inradius * Math.sin(angle) + cy;
              polyPoints += x + ',' + y + ' ';
            }
          }
          newFO.setAttribute('points', polyPoints);
          newFO.setAttribute('fill', fill);
          newFO.setAttribute('stroke', stroke);
          newFO.setAttribute('stroke-width', strokeWidth);
          /* const shape = */
          newFO.getAttribute('shape');
          return {
            started: true
          };
        }
        if (svgCanvas.getMode() === 'polygon') {
          const cx = Number(newFO.getAttribute('cx'));
          const cy = Number(newFO.getAttribute('cy'));
          const sides = Number(newFO.getAttribute('sides'));
          // const orient = newFO.getAttribute('orient');
          const fill = newFO.getAttribute('fill');
          const stroke = newFO.getAttribute('stroke');
          const strokeWidth = Number(newFO.getAttribute('stroke-width'));
          let x = opts.mouse_x;
          let y = opts.mouse_y;
          const edg = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy)) / 1.5;
          newFO.setAttribute('edge', edg);
          const inradius = edg / 2 * cot(Math.PI / sides);
          const circumradius = inradius * sec(Math.PI / sides);
          let points = '';
          for (let s = 0; sides >= s; s++) {
            const angle = 2.0 * Math.PI * s / sides;
            x = circumradius * Math.cos(angle) + cx;
            y = circumradius * Math.sin(angle) + cy;
            points += x + ',' + y + ' ';
          }

          // const poly = newFO.createElementNS(NS.SVG, 'polygon');
          newFO.setAttribute('points', points);
          newFO.setAttribute('fill', fill);
          newFO.setAttribute('stroke', stroke);
          newFO.setAttribute('stroke-width', strokeWidth);
          return {
            started: true
          };
        }
        return undefined;
      },
      mouseUp() {
        if (svgCanvas.getMode() === 'star') {
          const r = newFO.getAttribute('r');
          return {
            keep: r !== '0',
            element: newFO
          };
        }
        if (svgCanvas.getMode() === 'polygon') {
          const edge = newFO.getAttribute('edge');
          const keep = edge !== '0';
          // svgCanvas.addToSelection([newFO], true);
          return {
            keep,
            element: newFO
          };
        }
        return undefined;
      },
      selectedChanged(opts) {
        // Use this to update the current selected elements
        selElems = opts.elems;
        let i = selElems.length;
        // Hide panels if nothing is selected
        if (!i) {
          showPanel(false, 'star');
          showPanel(false, 'polygon');
          return;
        }
        while (i--) {
          const elem = selElems[i];
          if (elem?.getAttribute('shape') === 'star') {
            if (opts.selectedElement && !opts.multiselected) {
              $id('starNumPoints').value = elem.getAttribute('point');
              $id('radialShift').value = elem.getAttribute('radialshift');
              showPanel(true, 'star');
            } else {
              showPanel(false, 'star');
            }
          } else if (elem?.getAttribute('shape') === 'regularPoly') {
            if (opts.selectedElement && !opts.multiselected) {
              $id('polySides').value = elem.getAttribute('sides');
              showPanel(true, 'polygon');
            } else {
              showPanel(false, 'polygon');
            }
          } else {
            showPanel(false, 'star');
            showPanel(false, 'polygon');
          }
        }
      }
    };
  }
};

var en = {
  name: 'star',
  title: 'Polygone/Star Tool',
  buttons: [{
    title: 'Star Tool'
  }, {
    title: 'Polygon Tool'
  }],
  contextTools: [{
    title: 'Number of Sides',
    label: 'points'
  }, {
    title: 'Pointiness',
    label: 'Pointiness'
  }, {
    title: 'Twists the star',
    label: 'Radial Shift'
  }, {
    title: 'Number of Sides',
    label: 'sides'
  }]
};

var en$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: en
});

var fr = {
  name: 'etoile',
  title: 'Outil Polygone/Etoile',
  buttons: [{
    title: 'Outil Etoile'
  }, {
    title: 'Outil Polygone'
  }],
  contextTools: [{
    title: 'Nombre de côtés',
    label: 'points'
  }, {
    title: 'Précision',
    label: 'Précision'
  }, {
    title: 'Torsion Etoile',
    label: 'Décalage Radial'
  }, {
    title: 'Nombre de côtés',
    label: 'côtés'
  }]
};

var fr$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: fr
});

var sv = {
  name: 'stjärna',
  title: 'Polygon/stjärnverktyg',
  buttons: [{
    title: 'Stjärnverktyg'
  }, {
    title: 'Polygonverktyg'
  }],
  contextTools: [{
    title: 'Antal sidor',
    label: 'poäng'
  }, {
    title: 'Pointiness',
    label: 'Pointiness'
  }, {
    title: 'Vrider stjärnan',
    label: 'Radiell förskjutning'
  }, {
    title: 'Antal sidor',
    label: 'sidor'
  }]
};

var sv$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: sv
});

var tr = {
  name: 'yıldız',
  title: 'Çokgen/Yıldız Aracı',
  buttons: [{
    title: 'Yıldız Aracı'
  }, {
    title: 'Çokgen Aracı'
  }],
  contextTools: [{
    title: 'Kenar Sayısı',
    label: 'noktalar'
  }, {
    title: 'Sivrilik',
    label: 'Sivrilik'
  }, {
    title: 'Yıldızı Kıvır',
    label: 'Döngüsel Kaydırma'
  }, {
    title: 'Kenar Sayısı',
    label: 'kenarlar'
  }]
};

var tr$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: tr
});

var uk = {
  name: 'зірка',
  title: 'Полігон/Зірка',
  buttons: [{
    title: 'Зірка'
  }, {
    title: 'Полігон'
  }],
  contextTools: [{
    title: 'Кількість Сторін',
    label: 'точки'
  }, {
    title: 'Без точок',
    label: 'Без точок'
  }, {
    title: 'Закручення зірки',
    label: 'Радіальне Зміщення'
  }, {
    title: 'Кількість Сторін',
    label: 'сторони'
  }]
};

var uk$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: uk
});

var zhCN = {
  name: '星形',
  title: 'Polygone/Star Tool',
  buttons: [{
    title: '星形工具'
  }, {
    title: '多边形工具'
  }],
  contextTools: [{
    title: '顶点',
    label: '顶点'
  }, {
    title: '钝度',
    label: '钝度'
  }, {
    title: '径向',
    label: '径向'
  }, {
    title: '边数',
    label: '边数'
  }]
};

var zhCN$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: zhCN
});

export { extPolystar as default };
//# sourceMappingURL=ext-polystar.js.map
