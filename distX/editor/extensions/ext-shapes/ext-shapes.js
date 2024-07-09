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
 * @file ext-shapes.js
 *
 * @license MIT
 *
 * @copyright 2010 Christian Tzurcanu, 2010 Alexis Deveria
 *
 */
const name = 'shapes';
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
var extShapes = {
  name,
  async init() {
    const svgEditor = this;
    const canv = svgEditor.svgCanvas;
    const {
      $id,
      $click
    } = canv;
    const svgroot = canv.getSvgRoot();
    let lastBBox = {};
    await loadExtensionTranslation(svgEditor);
    const modeId = 'shapelib';
    const startClientPos = {};
    let curShape;
    let startX;
    let startY;
    return {
      callback() {
        if ($id('tool_shapelib') === null) {
          const extPath = svgEditor.configObj.curConfig.extPath;
          const buttonTemplate = `
          <se-explorerbutton id="tool_shapelib" title="${svgEditor.i18next.t(`${name}:buttons.0.title`)}" lib="${extPath}/ext-shapes/shapelib/"
          src="shapelib.svg"></se-explorerbutton>
          `;
          canv.insertChildAtIndex($id('tools_left'), buttonTemplate, 9);
          $click($id('tool_shapelib'), () => {
            if (this.leftPanel.updateLeftPanel('tool_shapelib')) {
              canv.setMode(modeId);
            }
          });
        }
      },
      mouseDown(opts) {
        const mode = canv.getMode();
        if (mode !== modeId) {
          return undefined;
        }
        const currentD = document.getElementById('tool_shapelib').dataset.draw;
        startX = opts.start_x;
        const x = startX;
        startY = opts.start_y;
        const y = startY;
        const curStyle = canv.getStyle();
        startClientPos.x = opts.event.clientX;
        startClientPos.y = opts.event.clientY;
        curShape = canv.addSVGElementsFromJson({
          element: 'path',
          curStyles: true,
          attr: {
            d: currentD,
            id: canv.getNextId(),
            opacity: curStyle.opacity / 2,
            style: 'pointer-events:none'
          }
        });
        curShape.setAttribute('transform', 'translate(' + x + ',' + y + ') scale(0.005) translate(' + -x + ',' + -y + ')');
        canv.recalculateDimensions(curShape);
        lastBBox = curShape.getBBox();
        return {
          started: true
        };
      },
      mouseMove(opts) {
        const mode = canv.getMode();
        if (mode !== modeId) {
          return;
        }
        const zoom = canv.getZoom();
        const evt = opts.event;
        const x = opts.mouse_x / zoom;
        const y = opts.mouse_y / zoom;
        const tlist = curShape.transform.baseVal;
        const box = curShape.getBBox();
        const left = box.x;
        const top = box.y;
        const newbox = {
          x: Math.min(startX, x),
          y: Math.min(startY, y),
          width: Math.abs(x - startX),
          height: Math.abs(y - startY)
        };
        let sx = newbox.width / lastBBox.width || 1;
        let sy = newbox.height / lastBBox.height || 1;

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
      mouseUp(opts) {
        const mode = canv.getMode();
        if (mode !== modeId) {
          return undefined;
        }
        const keepObject = opts.event.clientX !== startClientPos.x && opts.event.clientY !== startClientPos.y;
        return {
          keep: keepObject,
          element: curShape,
          started: false
        };
      }
    };
  }
};

var en = {
  loading: 'Loading...',
  categories: {
    basic: 'Basic',
    object: 'Objects',
    symbol: 'Symbols',
    arrow: 'Arrows',
    flowchart: 'Flowchart',
    animal: 'Animals',
    game: 'Cards & Chess',
    dialog_balloon: 'Dialog balloons',
    electronics: 'Electronics',
    math: 'Mathematical',
    music: 'Music',
    misc: 'Miscellaneous',
    raphael_1: 'raphaeljs.com set 1',
    raphael_2: 'raphaeljs.com set 2'
  },
  buttons: [{
    title: 'Shape library'
  }]
};

var en$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: en
});

var fr = {
  loading: 'Chargement...',
  categories: {
    basic: 'Basique',
    object: 'Objets',
    symbol: 'Symboles',
    arrow: 'Flèches',
    flowchart: 'Flowchart',
    animal: 'Animaux',
    game: 'Cartes & Echecs',
    dialog_balloon: 'Dialog balloons',
    electronics: 'Electronique',
    math: 'Mathematiques',
    music: 'Musique',
    misc: 'Divers',
    raphael_1: 'raphaeljs.com set 1',
    raphael_2: 'raphaeljs.com set 2'
  },
  buttons: [{
    title: "Bibliothèque d'images"
  }]
};

var fr$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: fr
});

var sv = {
  loading: 'Läser in...',
  categories: {
    basic: 'Grundläggande',
    object: 'Objekt',
    symbol: 'Symboler',
    arrow: 'Pilar',
    flowchart: 'Flödesschema',
    animal: 'Djur',
    game: 'Kort & schack',
    dialog_balloon: 'Dialogballonger',
    electronics: 'Elektronik',
    math: 'Matematisk',
    music: 'Musik',
    misc: 'Diverse',
    raphael_1: 'raphaeljs.com uppsättning 1',
    raphael_2: 'raphaeljs.com uppsättning 2'
  },
  buttons: [{
    title: 'Formbibliotek'
  }]
};

var sv$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: sv
});

var tr = {
  loading: 'Yükleniyor...',
  categories: {
    basic: 'Temel',
    object: 'Nesneler',
    symbol: 'Semboller',
    arrow: 'Oklar',
    flowchart: 'Akış Şemaları',
    animal: 'Hayvanlar',
    game: 'Kartlar & Satranç',
    dialog_balloon: 'Diyalog baloncukları',
    electronics: 'Elektronikler',
    math: 'Matematikseller',
    music: 'Müzik',
    misc: 'Diğerleri',
    raphael_1: 'raphaeljs.com set 1',
    raphael_2: 'raphaeljs.com set 2'
  },
  buttons: [{
    title: 'Şekil kütüphanesi'
  }]
};

var tr$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: tr
});

var uk = {
  loading: 'Завантаження...',
  categories: {
    basic: 'Основні',
    object: 'Об’єкти',
    symbol: 'Символи',
    arrow: 'Стрілки',
    flowchart: 'Блок-схеми',
    animal: 'Тварини',
    game: 'Карти та Шахи',
    dialog_balloon: 'Хмаринки діалогів',
    electronics: 'Електроніка',
    math: 'Математичні',
    music: 'Музика',
    misc: 'Різне',
    raphael_1: 'raphaeljs.com набір 1',
    raphael_2: 'raphaeljs.com набір 2'
  },
  buttons: [{
    title: 'Спільна Бібліотека'
  }]
};

var uk$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: uk
});

var zhCN = {
  loading: '正在加载...',
  categories: {
    basic: '基本',
    object: '对象',
    symbol: '符号',
    arrow: '箭头',
    flowchart: '工作流',
    animal: '动物',
    game: '棋牌',
    dialog_balloon: '会话框',
    electronics: '电子',
    math: '数学',
    music: '音乐',
    misc: '其他',
    raphael_1: 'raphaeljs.com 集合 1',
    raphael_2: 'raphaeljs.com 集合 2'
  },
  buttons: [{
    title: '图元库'
  }]
};

var zhCN$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: zhCN
});

export { extShapes as default };
//# sourceMappingURL=ext-shapes.js.map
