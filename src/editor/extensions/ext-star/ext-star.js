/**
 * @file ext-star.js
 *
 *
 * @copyright 2010 CloudCanvas, Inc. All rights reserved
 *
 */

 import { loadExtensionTranslation } from '../../locale.js';

 const name = "star";

 export default {
   name,
  async init (_S) {
    const svgEditor = this;
    const { svgCanvas } = svgEditor;
    const { $id } = svgCanvas;
    let selElems;
    let started;
    let newFO;
    await loadExtensionTranslation(svgEditor, name);

    /**
     *
     * @param {boolean} on
     * @returns {void}
     */
    const showPanel = (on) => {
      $id('star_panel').style.display = (on) ? 'block' : 'none';
    };

    /**
     *
     * @param {string} attr
     * @param {string|Float} val
     * @returns {void}
     */
    const setAttr = (attr, val) => {
      svgCanvas.changeSelectedAttribute(attr, val);
      svgCanvas.call('changed', selElems);
    };

    return {
      name: svgEditor.i18next.t(`${name}:name`),
      // The callback should be used to load the DOM with the appropriate UI items
      callback () {
        // Add the button and its handler(s)
        // Note: the star extension needs to be loaded before the polygon extension
        const fbtitle = svgEditor.i18next.t(`${name}:title`);
        const title = svgEditor.i18next.t(`${name}:buttons.0.title`);
        const buttonTemplate = document.createElement("template");
        // eslint-disable-next-line no-unsanitized/property
        buttonTemplate.innerHTML = `
            <se-flyingbutton id="tools_polygon" title="${fbtitle}">
              <se-button id="tool_star" title="${title}" src="./images/star.svg">
              </se-button>
            </se-flyingbutton>
          `;
        $id('tools_left').append(buttonTemplate.content.cloneNode(true));
        // handler
        $id('tool_star').addEventListener("click", () => { showPanel(true);
          if (this.leftPanel.updateLeftPanel('tool_polygon')) {
            svgCanvas.setMode('star');
            showPanel(true);
          }
        });

        const label0 = svgEditor.i18next.t(`${name}:contextTools.0.label`);
        const title0 = svgEditor.i18next.t(`${name}:contextTools.0.title`);
        const label1 = svgEditor.i18next.t(`${name}:contextTools.1.label`);
        const title1 = svgEditor.i18next.t(`${name}:contextTools.1.title`);
        const label2 = svgEditor.i18next.t(`${name}:contextTools.2.label`);
        const title2 = svgEditor.i18next.t(`${name}:contextTools.2.title`);
        // Add the context panel and its handler(s)
        const panelTemplate = document.createElement("template");
        // eslint-disable-next-line no-unsanitized/property
        panelTemplate.innerHTML = `
          <div id="star_panel">
            <se-spin-input id="starNumPoints" label="${label0}" min=1 step=1 value=5 title="${title0}">
            </se-spin-input>
            <se-spin-input id="RadiusMultiplier" label="${label1}" min=1 step=2.5 value=5 title="${title1}">
            </se-spin-input>
            <se-spin-input id="radialShift" min=0 step=1 value=0 label="${label2}" title="${title2}">
            </se-spin-input>
          </div>
        `;
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
