/**
 * @file ext-star.js
 *
 *
 * @copyright 2010 CloudCanvas, Inc. All rights reserved
 *
 */

const loadExtensionTranslation = async function (lang) {
  let translationModule;
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
  name: 'star',
  async init (_S) {
    const svgEditor = this;
    const {svgCanvas} = svgEditor;
    const {$id} = svgCanvas;
    let selElems;
    let started;
    let newFO;
    const strings = await loadExtensionTranslation(svgEditor.configObj.pref('lang'));

    /**
     *
     * @param {boolean} on
     * @returns {void}
     */
    const showPanel = (on) => {
      $id('star_panel').style.display = (on) ? 'block' : 'none';
    }

    /**
     *
     * @param {string} attr
     * @param {string|Float} val
     * @returns {void}
     */
    const setAttr = (attr, val) => {
      svgCanvas.changeSelectedAttribute(attr, val);
      svgCanvas.call('changed', selElems);
    }

    return {
      name: strings.name,
      // The callback should be used to load the DOM with the appropriate UI items
      callback () {
        // Add the button and its handler(s)
        // Note: the star extension may also add the same flying button so we check first
        if ($id('tools_polygon') === null) {
          const buttonTemplate = document.createElement("template");
          buttonTemplate.innerHTML = `
            <se-flyingbutton id="tools_polygon" title="Polygone/Star Tool">
              <se-button id="tool_polygon" title="Polygon Tool" src="./images/polygon.svg"></se-button>
              <se-button id="tool_star" title="Star Tool" src="./images/star.svg"></se-button>
            </se-flyingbutton>
          `
          $id('tools_left').append(buttonTemplate.content.cloneNode(true));
        }
        $id('tool_star').addEventListener("click", () => { showPanel(true);
          if (this.leftPanel.updateLeftPanel('tool_polygon')) {
            svgCanvas.setMode('star');
            showPanel(true);
          }   
        });

        // Add the context panel and its handler(s)
        const panelTemplate = document.createElement("template");
        panelTemplate.innerHTML = `
          <div id="star_panel">
            <se-spin-input id="starNumPoints" label="points" min=1 step=1 value=5 title="Change rotation angle">
            </se-spin-input>
            <se-spin-input id="RadiusMultiplier" label="Radis multiplier" min=1 step=2.5 value=5 title="Change rotation angle">
            </se-spin-input>
            <se-spin-input id="radialShift" min=0 step=1 value=0 label="radial shift" title="Change rotation angle">
            </se-spin-input>
          </div>
        `
        //add handlers for the panel
        $id('tools_top').appendChild(panelTemplate.content.cloneNode(true));
        $id("starNumPoints").addEventListener("change", (event) => {
          setAttr('point', event.target.value);
        });
        $id("RadiusMultiplier").addEventListener("change", (event) => {
          setAttr('starRadiusMultiplier', event.target.value);
        });
        $id("radialShift").addEventListener("change", (event) => {
          setAttr('radialshift', event.target.value);
        });
        // don't display the star panel on start
        $id("star_panel").style.display = 'none';
      },
      mouseDown (opts) {
        const rgb = svgCanvas.getColor('fill');
        const sRgb = svgCanvas.getColor('stroke');
        const sWidth = svgCanvas.getStrokeWidth();

        if (svgCanvas.getMode() === 'star') {
          started = true;

          newFO = svgCanvas.addSVGElementFromJson({
            element: 'polygon',
            attr: {
              cx: opts.start_x,
              cy: opts.start_y,
              id: svgCanvas.getNextId(),
              shape: 'star',
              point: document.getElementById('starNumPoints').value,
              r: 0,
              radialshift: document.getElementById('radialShift').value,
              r2: 0,
              orient: 'point',
              fill: rgb,
              strokecolor: sRgb,
              strokeWidth: sWidth
            }
          });
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
        if (svgCanvas.getMode() === 'star') {
          const cx = Number(newFO.getAttribute('cx'));
          const cy = Number(newFO.getAttribute('cy'));
          const point = Number(newFO.getAttribute('point'));
          const orient = newFO.getAttribute('orient');
          const fill = newFO.getAttribute('fill');
          const strokecolor = newFO.getAttribute('strokecolor');
          const strokeWidth = Number(newFO.getAttribute('strokeWidth'));
          const radialshift = Number(newFO.getAttribute('radialshift'));

          let x = opts.mouse_x;
          let y = opts.mouse_y;

          const circumradius = (Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy))) / 1.5;
          const inradius = circumradius / document.getElementById('RadiusMultiplier').value;
          newFO.setAttribute('r', circumradius);
          newFO.setAttribute('r2', inradius);

          let polyPoints = '';
          for (let s = 0; point >= s; s++) {
            let angle = 2.0 * Math.PI * (s / point);
            if (orient === 'point') {
              angle -= (Math.PI / 2);
            } else if (orient === 'edge') {
              angle = (angle + (Math.PI / point)) - (Math.PI / 2);
            }

            x = (circumradius * Math.cos(angle)) + cx;
            y = (circumradius * Math.sin(angle)) + cy;

            polyPoints += x + ',' + y + ' ';

            if (!isNaN(inradius)) {
              angle = (2.0 * Math.PI * (s / point)) + (Math.PI / point);
              if (orient === 'point') {
                angle -= (Math.PI / 2);
              } else if (orient === 'edge') {
                angle = (angle + (Math.PI / point)) - (Math.PI / 2);
              }
              angle += radialshift;

              x = (inradius * Math.cos(angle)) + cx;
              y = (inradius * Math.sin(angle)) + cy;

              polyPoints += x + ',' + y + ' ';
            }
          }
          newFO.setAttribute('points', polyPoints);
          newFO.setAttribute('fill', fill);
          newFO.setAttribute('stroke', strokecolor);
          newFO.setAttribute('stroke-width', strokeWidth);
          /* const shape = */ newFO.getAttribute('shape');

          return {
            started: true
          };
        }
        return undefined;
      },
      mouseUp () {
        if (svgCanvas.getMode() === 'star') {
          const r = newFO.getAttribute('r');
          return {
            keep: (r !== '0'),
            element: newFO
          };
        }
        return undefined;
      },
      selectedChanged (opts) {
        // Use this to update the current selected elements
        selElems = opts.elems;

        let i = selElems.length;
        while (i--) {
          const elem = selElems[i];
          if (elem && elem.getAttribute('shape') === 'star') {
            if (opts.selectedElement && !opts.multiselected) {
              $id('starNumPoints').value = elem.getAttribute('point');
              $id('radialShift').value = elem.getAttribute('radialshift');
              showPanel(true);
            } else {
              showPanel(false);
            }
          } else {
            showPanel(false);
          }
        }
      },
      elementChanged (_opts) {
        // const elem = opts.elems[0];
      }
    };
  }
};
