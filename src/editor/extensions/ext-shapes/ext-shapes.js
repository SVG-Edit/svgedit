/**
 * @file ext-shapes.js
 *
 * @license MIT
 *
 * @copyright 2010 Christian Tzurcanu, 2010 Alexis Deveria
 *
 */
const name = "shapes";

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
  async init () {
    const svgEditor = this;
    const canv = svgEditor.svgCanvas;
    const { $id } = canv;
    const svgroot = canv.getRootElem();
    let lastBBox = {};
    await loadExtensionTranslation(svgEditor);

    const modeId = 'shapelib';
    const startClientPos = {};

    let curShape;
    let startX;
    let startY;

    return {
      callback () {
        if ($id('tool_shapelib') === null) {
          const buttonTemplate = document.createElement("template");
          // eslint-disable-next-line no-unsanitized/property
          buttonTemplate.innerHTML = `
          <se-explorerbutton id="tool_shapelib" title="${svgEditor.i18next.t(`${name}:buttons.0.title`)}" lib="./extensions/ext-shapes/shapelib/"
          src="./images/shapelib.svg"></se-explorerbutton>
          `;
          $id('tools_left').append(buttonTemplate.content.cloneNode(true));
          $id('tool_shapelib').addEventListener("click", () => {
            canv.setMode(modeId);
          });
        }
      },
      mouseDown (opts) {
        const mode = canv.getMode();
        if (mode !== modeId) { return undefined; }

        const currentD = document.getElementById('tool_shapelib').dataset.draw;
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

        /*
        // Make sure shape uses absolute values
        if ((/[a-z]/).test(currentD)) {
          currentD = curLib.data[curShapeId] = canv.pathActions.convertPath(curShape);
          curShape.setAttribute('d', currentD);
          canv.pathActions.fixEnd(curShape);
        }
        */
        curShape.setAttribute('transform', 'translate(' + x + ',' + y + ') scale(0.005) translate(' + -x + ',' + -y + ')');

        canv.recalculateDimensions(curShape);

        canv.getTransformList(curShape);

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

        const tlist = canv.getTransformList(curShape);
        const box = curShape.getBBox();
        const left = box.x; const top = box.y;

        const newbox = {
          x: Math.min(startX, x),
          y: Math.min(startY, y),
          width: Math.abs(x - startX),
          height: Math.abs(y - startY)
        };

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
        const translateOrigin = svgroot.createSVGTransform();
        const scale = svgroot.createSVGTransform();
        const translateBack = svgroot.createSVGTransform();

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
