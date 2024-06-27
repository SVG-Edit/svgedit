/**
* @file ext-helloworld.js
*
* @license MIT
*
* @copyright 2010 Alexis Deveria
*
*/

/**
* This is a very basic SVG-Edit extension. It adds a "Hello World" button in
*  the left ("mode") panel. Clicking on the button, and then the canvas
*  will show the user the point on the canvas that was clicked on.
*/

const name = 'basketballnet'

const loadExtensionTranslation = async function (svgEditor) {
 let translationModule
 const lang = svgEditor.configObj.pref('lang')
 try {
   translationModule = await import(`./locale/${lang}.js`)
 } catch (_error) {
   console.warn(`Missing translation (${lang}) for ${name} - using 'en'`)
   translationModule = await import('./locale/en.js')
 }
 svgEditor.i18next.addResourceBundle(lang, name, translationModule.default)
}


export default {
 name,
 async init() {
   const svgEditor = this
   const {svgCanvas} = svgEditor
   const {$id, $click} = svgCanvas

   let selElems, started, newFO, startX2, startY2, lastBBox;

   //const strings = await loadExtensionTranslation(svgEditor.configObj.pref('lang'));
   await loadExtensionTranslation(svgEditor)
   const singleSelectedObject = function(opts) {
     selElems = opts.elems;
     if (selElems.length != 1) {
       return null;
     }
     const elem = selElems[0];
     if (elem && elem.getAttribute('shape') === name) {
       return elem;
     } else {
       return null;
     }
   }

   function showPanel(on) {
     if ($id(name + '_panel')) {
       $id(name + '_panel').style.display = (on) ? 'block' : 'none';
     }
   }

   function setAttr(attr, val) {
     svgCanvas.changeSelectedAttribute(attr, val);
     svgCanvas.call('changed', selElems);
   }

   // const buttons = [{
   //   id: 'tool_' + name,
   //   type: 'mode',
   //   position: 13,
   //   //key: '',
   //   events: {
   //     click () {
   //       svgCanvas.setMode(name);
   //       svgEditor.toolButtonClick('#tool_' + name);
   //     }
   //   }
   // }];
   return {
     name: svgEditor.i18next.t(`${name}:name`),
     // svgicons: svgEditor.curConfig.extIconsPath + 'soccer-icons.xml',
     // buttons: strings.buttons.map((button, i) => {
     //   return Object.assign(buttons[i], button);
     // }),
     callback () {
       const title = `${name}:buttons.0.title`
       const idButton = 'tool_' + name;
       const imgButton = name + '.svg';

       // Add the button and its handler(s)
       // const buttonTemplate = document.createElement('template')
       // buttonTemplate.innerHTML = `
       // <se-button id="${idButton}" title="${title}" src="${imgButton}"></se-button>
       // `

       const buttonTemplate = `
       <se-button id="${idButton}" title="${title}" src="${imgButton}"></se-button>
       `
       // $id('tools_left').appendChild(buttonTemplate.content.cloneNode(true))
       svgCanvas.insertChildAtIndex($id('tools_left'), buttonTemplate, 13)

       $click($id(idButton), () => {
         if (this.leftPanel.updateLeftPanel(idButton)) {
           svgCanvas.setMode(name)
         }
       })

     },
     mouseDown (opts) {
       if (svgCanvas.getMode() !== this.name) {
         return undefined;
       }
       const zoom = svgCanvas.getZoom();

       // //these are relative to the canvas
       let startX = opts.start_x * zoom;
       let startY = opts.start_y * zoom;

       started = true;
       newFO = svgCanvas.addSVGElementsFromJson(
         {
           element: "g",
           attr: {
             id: svgCanvas.getNextId(),
             shape: this.name,
             fill: "none",
             stroke: "#fff",
             class: 'outline',
             'stroke-linecap': "round",
             'stroke-width': 2
           },
           children: [
             { element: "path",
               attr: {
                 id: svgCanvas.getNextId(),
                 d: "M0 1C0 1.55228 0.447715 2 1 2H75C75.5523 2 76 1.55228 76 1C76 0.447715 75.5523 1.19209e-07 75 1.19209e-07H1C0.447716 1.19209e-07 0 0.447715 0 1Z",
                 fill: "#665647"
               },
               children: []},
               { element: "path",
               attr: {
                 id: svgCanvas.getNextId(),
                 d: "M34 7H42V0H34V7Z",
                 fill: "#665647"
               },
               children: []},
               { element:"circle",
                attr: {
                  id: svgCanvas.getNextId(),
                  r: 12,
                  transform: "matrix(1 0 0 -1 38 18)",
                  stroke: "#665647",
                  'stroke-width': 2
                },
                children: []},
           ]}
       );
       svgCanvas.selectOnly([newFO]);
       svgCanvas.moveSelectedElements(startX, startY, false);
       svgCanvas.recalculateDimensions(newFO);
       lastBBox = newFO.getBBox();
       startX2 = (lastBBox.x + lastBBox.width);
       startY2 = (lastBBox.y + lastBBox.height);

       return {
         started: true
       };
     },
     mouseMove (opts) {
       if (!started || svgCanvas.getMode() !== this.name) {
         return undefined;
       }
       const zoom = svgCanvas.getZoom();
       const evt = opts.event;

       const x = opts.mouse_x / zoom;
       const y = opts.mouse_y / zoom;

       const tlist = svgCanvas.getTransformList(newFO)

       let sx = (Math.abs(startX2 - x) / lastBBox.width) || 1;
       let sy = (Math.abs(startY2 - y) / lastBBox.height) || 1;

       // update the transform list with translate,scale,translate
       const translateOrigin = svgroot.createSVGTransform(),
         scale = svgroot.createSVGTransform(),
         translateBack = svgroot.createSVGTransform();

       // Not perfect, but mostly works...
       let tx = 0;
       if (x > startX2) {
         tx = lastBBox.width;
       }
       let ty = 0;
       if (y > startY2) {
         ty = lastBBox.height;
       }

       translateOrigin.setTranslate(-(lastBBox.x+lastBBox.width-tx), -(lastBBox.y+lastBBox.height-ty));

       if (evt.shiftKey) {
         const max = Math.min(Math.abs(sx), Math.abs(sy));

         sx = max * (sx < 0 ? -1 : 1);
         sy = max * (sy < 0 ? -1 : 1);
       }
       scale.setScale(sx, sy);

       translateBack.setTranslate(x+tx,y+tx);// * sx,y * sy);

       tlist.appendItem(translateBack);
       tlist.appendItem(scale);
       tlist.appendItem(translateOrigin);

       svgCanvas.recalculateDimensions(newFO);

       lastBBox = newFO.getBBox();
     },
     mouseUp (opts) {
       if (svgCanvas.getMode() !== this.name) {
         return undefined;
       }
       return {
         keep: true,
         element: newFO
       };
     }
   };
 }
};
