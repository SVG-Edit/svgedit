/**
 * @file ext-polystar.js
 *
 *
 * @copyright 2010 CloudCanvas, Inc. All rights reserved
 * @copyright 2021 Optimistik SAS, Inc. All rights reserved
 * @license MIT
 *
 */

const name = "polystar";

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
  async init(_S) {
    const svgEditor = this;
    const { svgCanvas } = svgEditor;
    const { $id } = svgCanvas;
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
      $id(`${tool}_panel`).style.display = on ? "block" : "none";
    };

    /**
     *
     * @param {string} attr attribute to change
     * @param {string|Float} val new value
     * @returns {void}
     */
    const setAttr = (attr, val) => {
      svgCanvas.changeSelectedAttribute(attr, val);
      svgCanvas.call("changed", selElems);
    };

    /**
     * @param {Float} n angle
     * @return {Float} cotangeante
     */
    const cot = (n) => 1 / Math.tan(n);

    /**
     * @param {Float} n angle
     * @returns {Float} sec
     */
    const sec = (n) => 1 / Math.cos(n);

    return {
      name: svgEditor.i18next.t(`${name}:name`),
      // The callback should be used to load the DOM with the appropriate UI items
      callback() {
        // Add the button and its handler(s)
        // Note: the star extension needs to be loaded before the polygon extension
        const fbtitle = svgEditor.i18next.t(`${name}:title`);
        const title_star = svgEditor.i18next.t(`${name}:buttons.0.title`);
        const title_polygon = svgEditor.i18next.t(`${name}:buttons.1.title`);
        const buttonTemplate = document.createElement("template");
        // eslint-disable-next-line no-unsanitized/property
        buttonTemplate.innerHTML = `
            <se-flyingbutton id="tools_polygon" title="${fbtitle}">
              <se-button id="tool_star" title="${title_star}" src="./images/star.svg">
              </se-button>
              <se-button id="tool_polygon" title="${title_polygon}" src="./images/polygon.svg">
              </se-button>
            </se-flyingbutton>
          `;
        $id("tools_left").append(buttonTemplate.content.cloneNode(true));
        // handler
        $id("tool_star").addEventListener("click", () => {
          if (this.leftPanel.updateLeftPanel("tool_star")) {
            svgCanvas.setMode("star");
            showPanel(true, "star");
            showPanel(false, "polygon");
          }
        });
        $id("tool_polygon").addEventListener("click", () => {
          if (this.leftPanel.updateLeftPanel("tool_polygon")) {
            svgCanvas.setMode("polygon");
            showPanel(true, "polygon");
            showPanel(false, "star");
          }
        });

        const label0 = svgEditor.i18next.t(`${name}:contextTools.0.label`);
        const title0 = svgEditor.i18next.t(`${name}:contextTools.0.title`);
        const label1 = svgEditor.i18next.t(`${name}:contextTools.1.label`);
        const title1 = svgEditor.i18next.t(`${name}:contextTools.1.title`);
        const label2 = svgEditor.i18next.t(`${name}:contextTools.2.label`);
        const title2 = svgEditor.i18next.t(`${name}:contextTools.2.title`);
        const label3 = svgEditor.i18next.t(`${name}:contextTools.3.label`);
        const title3 = svgEditor.i18next.t(`${name}:contextTools.3.title`);
        // Add the context panel and its handler(s)
        const panelTemplate = document.createElement("template");
        // eslint-disable-next-line no-unsanitized/property
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
        //add handlers for the panel
        $id("tools_top").appendChild(panelTemplate.content.cloneNode(true));
        // don't display the panels on start
        showPanel(false, "star");
        showPanel(false, "polygon");
        $id("starNumPoints").addEventListener("change", (event) => {
          setAttr("point", event.target.value);
        });
        $id("RadiusMultiplier").addEventListener("change", (event) => {
          setAttr("starRadiusMultiplier", event.target.value);
        });
        $id("radialShift").addEventListener("change", (event) => {
          setAttr("radialshift", event.target.value);
        });
        $id("polySides").addEventListener("change", (event) => {
          setAttr("sides", event.target.value);
        });
      },
      mouseDown(opts) {
        if (svgCanvas.getMode() === "star") {
          const rgb = svgCanvas.getColor("fill");
          const sRgb = svgCanvas.getColor("stroke");
          const sWidth = svgCanvas.getStrokeWidth();
          started = true;
          newFO = svgCanvas.addSVGElementFromJson({
            element: "polygon",
            attr: {
              cx: opts.start_x,
              cy: opts.start_y,
              id: svgCanvas.getNextId(),
              shape: "star",
              point: document.getElementById("starNumPoints").value,
              r: 0,
              radialshift: document.getElementById("radialShift").value,
              r2: 0,
              orient: "point",
              fill: rgb,
              strokecolor: sRgb,
              strokeWidth: sWidth
            }
          });
          return {
            started: true
          };
        }
        if (svgCanvas.getMode() === "polygon") {
          // const e = opts.event;
          const rgb = svgCanvas.getColor("fill");
          // const ccRgbEl = rgb.substring(1, rgb.length);
          const sRgb = svgCanvas.getColor("stroke");
          // ccSRgbEl = sRgb.substring(1, rgb.length);
          const sWidth = svgCanvas.getStrokeWidth();
          started = true;
          newFO = svgCanvas.addSVGElementFromJson({
            element: "polygon",
            attr: {
              cx: opts.start_x,
              cy: opts.start_y,
              id: svgCanvas.getNextId(),
              shape: "regularPoly",
              sides: document.getElementById("polySides").value,
              orient: "x",
              edge: 0,
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
      mouseMove(opts) {
        if (!started) {
          return undefined;
        }
        if (svgCanvas.getMode() === "star") {
          const cx = Number(newFO.getAttribute("cx"));
          const cy = Number(newFO.getAttribute("cy"));
          const point = Number(newFO.getAttribute("point"));
          const orient = newFO.getAttribute("orient");
          const fill = newFO.getAttribute("fill");
          const strokecolor = newFO.getAttribute("strokecolor");
          const strokeWidth = Number(newFO.getAttribute("strokeWidth"));
          const radialshift = Number(newFO.getAttribute("radialshift"));

          let x = opts.mouse_x;
          let y = opts.mouse_y;

          const circumradius =
            Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy)) / 1.5;
          const inradius =
            circumradius / document.getElementById("RadiusMultiplier").value;
          newFO.setAttribute("r", circumradius);
          newFO.setAttribute("r2", inradius);

          let polyPoints = "";
          for (let s = 0; point >= s; s++) {
            let angle = 2.0 * Math.PI * (s / point);
            if (orient === "point") {
              angle -= Math.PI / 2;
            } else if (orient === "edge") {
              angle = angle + Math.PI / point - Math.PI / 2;
            }

            x = circumradius * Math.cos(angle) + cx;
            y = circumradius * Math.sin(angle) + cy;

            polyPoints += x + "," + y + " ";

            if (!isNaN(inradius)) {
              angle = 2.0 * Math.PI * (s / point) + Math.PI / point;
              if (orient === "point") {
                angle -= Math.PI / 2;
              } else if (orient === "edge") {
                angle = angle + Math.PI / point - Math.PI / 2;
              }
              angle += radialshift;

              x = inradius * Math.cos(angle) + cx;
              y = inradius * Math.sin(angle) + cy;

              polyPoints += x + "," + y + " ";
            }
          }
          newFO.setAttribute("points", polyPoints);
          newFO.setAttribute("fill", fill);
          newFO.setAttribute("stroke", strokecolor);
          newFO.setAttribute("stroke-width", strokeWidth);
          /* const shape = */ newFO.getAttribute("shape");

          return {
            started: true
          };
        }
        if (svgCanvas.getMode() === "polygon") {
          const cx = Number(newFO.getAttribute("cx"));
          const cy = Number(newFO.getAttribute("cy"));
          const sides = Number(newFO.getAttribute("sides"));
          // const orient = newFO.getAttribute('orient');
          const fill = newFO.getAttribute("fill");
          const strokecolor = newFO.getAttribute("strokecolor");
          const strokeWidth = Number(newFO.getAttribute("strokeWidth"));

          let x = opts.mouse_x;
          let y = opts.mouse_y;

          const edg =
            Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy)) / 1.5;
          newFO.setAttribute("edge", edg);

          const inradius = (edg / 2) * cot(Math.PI / sides);
          const circumradius = inradius * sec(Math.PI / sides);
          let points = "";
          for (let s = 0; sides >= s; s++) {
            const angle = (2.0 * Math.PI * s) / sides;
            x = circumradius * Math.cos(angle) + cx;
            y = circumradius * Math.sin(angle) + cy;

            points += x + "," + y + " ";
          }

          // const poly = newFO.createElementNS(NS.SVG, 'polygon');
          newFO.setAttribute("points", points);
          newFO.setAttribute("fill", fill);
          newFO.setAttribute("stroke", strokecolor);
          newFO.setAttribute("stroke-width", strokeWidth);
          return {
            started: true
          };
        }
        return undefined;
      },
      mouseUp() {
        if (svgCanvas.getMode() === "star") {
          const r = newFO.getAttribute("r");
          return {
            keep: r !== "0",
            element: newFO
          };
        }
        if (svgCanvas.getMode() === "polygon") {
          const edge = newFO.getAttribute("edge");
          const keep = edge !== "0";
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
        while (i--) {
          const elem = selElems[i];
          if (elem && elem.getAttribute("shape") === "star") {
            if (opts.selectedElement && !opts.multiselected) {
              $id("starNumPoints").value = elem.getAttribute("point");
              $id("radialShift").value = elem.getAttribute("radialshift");
              showPanel(true, "star");
            } else {
              showPanel(false, "star");
            }
          } else if (elem && elem.getAttribute("shape") === "regularPoly") {
            if (opts.selectedElement && !opts.multiselected) {
              $id("polySides").value = elem.getAttribute("sides");
              showPanel(true, "polygon");
            } else {
              showPanel(false, "polygon");
            }
          } else {
            showPanel(false, "star");
            showPanel(false, "polygon");
          }
        }
      },
      elementChanged(_opts) {
        // const elem = opts.elems[0];
      }
    };
  }
};
