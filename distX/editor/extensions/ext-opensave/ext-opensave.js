const e = (() => {
    if ("undefined" == typeof self) return !1;
    if ("top" in self && self !== top) try {
      top.window.document._ = 0;
    } catch (e) {
      return !1;
    }
    return "showOpenFilePicker" in self;
  })(),
  t = e ? Promise.resolve().then(function () {
    return l;
  }) : Promise.resolve().then(function () {
    return v;
  });
async function n() {
  return (await t).default(...arguments);
}
e ? Promise.resolve().then(function () {
  return y;
}) : Promise.resolve().then(function () {
  return b;
});
const a = e ? Promise.resolve().then(function () {
  return m;
}) : Promise.resolve().then(function () {
  return k;
});
async function o() {
  return (await a).default(...arguments);
}
const s = async e => {
  const t = await e.getFile();
  return t.handle = e, t;
};
var c = async function () {
    let e = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [{}];
    Array.isArray(e) || (e = [e]);
    const t = [];
    e.forEach((e, n) => {
      t[n] = {
        description: e.description || "Files",
        accept: {}
      }, e.mimeTypes ? e.mimeTypes.map(r => {
        t[n].accept[r] = e.extensions || [];
      }) : t[n].accept["*/*"] = e.extensions || [];
    });
    const n = await window.showOpenFilePicker({
        id: e[0].id,
        startIn: e[0].startIn,
        types: t,
        multiple: e[0].multiple || !1,
        excludeAcceptAllOption: e[0].excludeAcceptAllOption || !1
      }),
      r = await Promise.all(n.map(s));
    return e[0].multiple ? r : r[0];
  },
  l = {
    __proto__: null,
    default: c
  };
function u(e) {
  function t(e) {
    if (Object(e) !== e) return Promise.reject(new TypeError(e + " is not an object."));
    var t = e.done;
    return Promise.resolve(e.value).then(function (e) {
      return {
        value: e,
        done: t
      };
    });
  }
  return u = function (e) {
    this.s = e, this.n = e.next;
  }, u.prototype = {
    s: null,
    n: null,
    next: function () {
      return t(this.n.apply(this.s, arguments));
    },
    return: function (e) {
      var n = this.s.return;
      return void 0 === n ? Promise.resolve({
        value: e,
        done: !0
      }) : t(n.apply(this.s, arguments));
    },
    throw: function (e) {
      var n = this.s.return;
      return void 0 === n ? Promise.reject(e) : t(n.apply(this.s, arguments));
    }
  }, new u(e);
}
const p = async function (e, t) {
  let n = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : e.name;
  let r = arguments.length > 3 ? arguments[3] : undefined;
  const i = [],
    a = [];
  var o,
    s = !1,
    c = !1;
  try {
    for (var l, d = function (e) {
        var t,
          n,
          r,
          i = 2;
        for ("undefined" != typeof Symbol && (n = Symbol.asyncIterator, r = Symbol.iterator); i--;) {
          if (n && null != (t = e[n])) return t.call(e);
          if (r && null != (t = e[r])) return new u(t.call(e));
          n = "@@asyncIterator", r = "@@iterator";
        }
        throw new TypeError("Object is not async iterable");
      }(e.values()); s = !(l = await d.next()).done; s = !1) {
      const o = l.value,
        s = `${n}/${o.name}`;
      "file" === o.kind ? a.push(o.getFile().then(t => (t.directoryHandle = e, t.handle = o, Object.defineProperty(t, "webkitRelativePath", {
        configurable: !0,
        enumerable: !0,
        get: () => s
      })))) : "directory" !== o.kind || !t || r && r(o) || i.push(p(o, t, s, r));
    }
  } catch (e) {
    c = !0, o = e;
  } finally {
    try {
      s && null != d.return && (await d.return());
    } finally {
      if (c) throw o;
    }
  }
  return [...(await Promise.all(i)).flat(), ...(await Promise.all(a))];
};
var d = async function () {
    let e = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    e.recursive = e.recursive || !1, e.mode = e.mode || "read";
    const t = await window.showDirectoryPicker({
      id: e.id,
      startIn: e.startIn,
      mode: e.mode
    });
    return (await (await t.values()).next()).done ? [t] : p(t, e.recursive, void 0, e.skipDirectory);
  },
  y = {
    __proto__: null,
    default: d
  },
  f = async function (e) {
    let t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [{}];
    let n = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    let r = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : !1;
    let i = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
    Array.isArray(t) || (t = [t]), t[0].fileName = t[0].fileName || "Untitled";
    const a = [];
    let o = null;
    if (e instanceof Blob && e.type ? o = e.type : e.headers && e.headers.get("content-type") && (o = e.headers.get("content-type")), t.forEach((e, t) => {
      a[t] = {
        description: e.description || "Files",
        accept: {}
      }, e.mimeTypes ? (0 === t && o && e.mimeTypes.push(o), e.mimeTypes.map(n => {
        a[t].accept[n] = e.extensions || [];
      })) : o ? a[t].accept[o] = e.extensions || [] : a[t].accept["*/*"] = e.extensions || [];
    }), n) try {
      await n.getFile();
    } catch (e) {
      if (n = null, r) throw e;
    }
    const s = n || (await window.showSaveFilePicker({
      suggestedName: t[0].fileName,
      id: t[0].id,
      startIn: t[0].startIn,
      types: a,
      excludeAcceptAllOption: t[0].excludeAcceptAllOption || !1
    }));
    !n && i && i(s);
    const c = await s.createWritable();
    if ("stream" in e) {
      const t = e.stream();
      return await t.pipeTo(c), s;
    }
    return "body" in e ? (await e.body.pipeTo(c), s) : (await c.write(await e), await c.close(), s);
  },
  m = {
    __proto__: null,
    default: f
  },
  w = async function () {
    let e = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [{}];
    return Array.isArray(e) || (e = [e]), new Promise((t, n) => {
      const r = document.createElement("input");
      r.type = "file";
      const i = [...e.map(e => e.mimeTypes || []), ...e.map(e => e.extensions || [])].join();
      r.multiple = e[0].multiple || !1, r.accept = i || "", r.style.display = "none", document.body.append(r);
      const a = e => {
          "function" == typeof o && o(), t(e);
        },
        o = e[0].legacySetup && e[0].legacySetup(a, () => o(n), r),
        s = () => {
          window.removeEventListener("focus", s), r.remove();
        };
      r.addEventListener("click", () => {
        window.addEventListener("focus", s);
      }), r.addEventListener("change", () => {
        window.removeEventListener("focus", s), r.remove(), a(r.multiple ? Array.from(r.files) : r.files[0]);
      }), "showPicker" in HTMLInputElement.prototype ? r.showPicker() : r.click();
    });
  },
  v = {
    __proto__: null,
    default: w
  },
  h = async function () {
    let e = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [{}];
    return Array.isArray(e) || (e = [e]), e[0].recursive = e[0].recursive || !1, new Promise((t, n) => {
      const r = document.createElement("input");
      r.type = "file", r.webkitdirectory = !0;
      const i = e => {
          "function" == typeof a && a(), t(e);
        },
        a = e[0].legacySetup && e[0].legacySetup(i, () => a(n), r);
      r.addEventListener("change", () => {
        let t = Array.from(r.files);
        e[0].recursive ? e[0].recursive && e[0].skipDirectory && (t = t.filter(t => t.webkitRelativePath.split("/").every(t => !e[0].skipDirectory({
          name: t,
          kind: "directory"
        })))) : t = t.filter(e => 2 === e.webkitRelativePath.split("/").length), i(t);
      }), "showPicker" in HTMLInputElement.prototype ? r.showPicker() : r.click();
    });
  },
  b = {
    __proto__: null,
    default: h
  },
  P = async function (e) {
    let t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    Array.isArray(t) && (t = t[0]);
    const n = document.createElement("a");
    let r = e;
    "body" in e && (r = await async function (e, t) {
      const n = e.getReader(),
        r = new ReadableStream({
          start: e => async function t() {
            return n.read().then(_ref => {
              let {
                done: n,
                value: r
              } = _ref;
              if (!n) return e.enqueue(r), t();
              e.close();
            });
          }()
        }),
        i = new Response(r),
        a = await i.blob();
      return n.releaseLock(), new Blob([a], {
        type: t
      });
    }(e.body, e.headers.get("content-type"))), n.download = t.fileName || "Untitled", n.href = URL.createObjectURL(await r);
    const i = () => {
        "function" == typeof a && a();
      },
      a = t.legacySetup && t.legacySetup(i, () => a(), n);
    return n.addEventListener("click", () => {
      setTimeout(() => URL.revokeObjectURL(n.href), 3e4), i();
    }), n.click(), null;
  },
  k = {
    __proto__: null,
    default: P
  };

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
const name = 'opensave';
let handle = null;
const loadExtensionTranslation = async function (svgEditor) {
  let translationModule;
  const lang = svgEditor.configObj.pref('lang');
  try {
    translationModule = await __variableDynamicImportRuntime0__(`./locale/${lang}.js`);
  } catch (_error) {
    console.warn(`Missing translation (${lang}) for ${name} - using 'en'`);
    translationModule = await Promise.resolve().then(function () { return en$1; });
  }
  svgEditor.i18next.addResourceBundle(lang, 'translation', translationModule.default, true, true);
};
var extOpensave = {
  name,
  async init(_S) {
    const svgEditor = this;
    const {
      svgCanvas
    } = svgEditor;
    const {
      $id,
      $click
    } = svgCanvas;
    await loadExtensionTranslation(svgEditor);
    /**
    * @param {Event} e
    * @returns {void}
    */
    const importImage = e => {
      $id('se-prompt-dialog').title = this.i18next.t('notification.loadingImage');
      $id('se-prompt-dialog').setAttribute('close', false);
      e.stopPropagation();
      e.preventDefault();
      const file = e.type === 'drop' ? e.dataTransfer.files[0] : e.currentTarget.files[0];
      if (!file) {
        $id('se-prompt-dialog').setAttribute('close', true);
        return;
      }
      if (!file.type.includes('image')) {
        return;
      }
      // Detected an image
      // svg handling
      let reader;
      if (file.type.includes('svg')) {
        reader = new FileReader();
        reader.onloadend = ev => {
          // imgImport.shiftKey (shift key pressed or not) will determine if import should preserve dimension)
          const newElement = this.svgCanvas.importSvgString(ev.target.result, imgImport.shiftKey);
          this.svgCanvas.alignSelectedElements('m', 'page');
          this.svgCanvas.alignSelectedElements('c', 'page');
          // highlight imported element, otherwise we get strange empty selectbox
          this.svgCanvas.selectOnly([newElement]);
          $id('se-prompt-dialog').setAttribute('close', true);
        };
        reader.readAsText(file);
      } else {
        // bitmap handling
        reader = new FileReader();
        reader.onloadend = _ref => {
          let {
            target: {
              result
            }
          } = _ref;
          /**
              * Insert the new image until we know its dimensions.
              * @param {Float} imageWidth
              * @param {Float} imageHeight
              * @returns {void}
              */
          const insertNewImage = (imageWidth, imageHeight) => {
            const newImage = this.svgCanvas.addSVGElementsFromJson({
              element: 'image',
              attr: {
                x: 0,
                y: 0,
                width: imageWidth,
                height: imageHeight,
                id: this.svgCanvas.getNextId(),
                style: 'pointer-events:inherit'
              }
            });
            this.svgCanvas.setHref(newImage, result);
            this.svgCanvas.selectOnly([newImage]);
            this.svgCanvas.alignSelectedElements('m', 'page');
            this.svgCanvas.alignSelectedElements('c', 'page');
            this.topPanel.updateContextPanel();
            $id('se-prompt-dialog').setAttribute('close', true);
          };
          // create dummy img so we know the default dimensions
          let imgWidth = 100;
          let imgHeight = 100;
          const img = new Image();
          img.style.opacity = 0;
          img.addEventListener('load', () => {
            imgWidth = img.offsetWidth || img.naturalWidth || img.width;
            imgHeight = img.offsetHeight || img.naturalHeight || img.height;
            insertNewImage(imgWidth, imgHeight);
          });
          img.src = result;
        };
        reader.readAsDataURL(file);
      }
    };
    // create an input with type file to open the filesystem dialog
    const imgImport = document.createElement('input');
    imgImport.type = 'file';
    imgImport.addEventListener('change', importImage);
    // dropping a svg file will import it in the svg as well
    this.workarea.addEventListener('drop', importImage);
    const clickClear = async function () {
      const [x, y] = svgEditor.configObj.curConfig.dimensions;
      const ok = await seConfirm(svgEditor.i18next.t('notification.QwantToClear'));
      if (ok === 'Cancel') {
        return;
      }
      svgEditor.leftPanel.clickSelect();
      svgEditor.svgCanvas.clear();
      svgEditor.svgCanvas.setResolution(x, y);
      svgEditor.updateCanvas(true);
      svgEditor.zoomImage();
      svgEditor.layersPanel.populateLayers();
      svgEditor.topPanel.updateContextPanel();
      svgEditor.topPanel.updateTitle('untitled.svg');
    };

    /**
     * By default,  this.editor.svgCanvas.open() is a no-op. It is up to an extension
     *  mechanism (opera widget, etc.) to call `setCustomHandlers()` which
     *  will make it do something.
     * @returns {void}
     */
    const clickOpen = async function () {
      // ask user before clearing an unsaved SVG
      const response = await svgEditor.openPrep();
      if (response === 'Cancel') {
        return;
      }
      svgCanvas.clear();
      try {
        const blob = await n({
          mimeTypes: ['image/*']
        });
        const svgContent = await blob.text();
        await svgEditor.loadSvgString(svgContent);
        svgEditor.updateCanvas();
        handle = blob.handle;
        svgEditor.topPanel.updateTitle(blob.name);
        svgEditor.svgCanvas.runExtensions('onOpenedDocument', {
          name: blob.name,
          lastModified: blob.lastModified,
          size: blob.size,
          type: blob.type
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          return console.error(err);
        }
      }
    };
    const b64toBlob = function (b64Data) {
      let contentType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
      let sliceSize = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 512;
      const byteCharacters = atob(b64Data);
      const byteArrays = [];
      for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
      const blob = new Blob(byteArrays, {
        type: contentType
      });
      return blob;
    };

    /**
     *
     * @returns {void}
     */
    const clickSave = async function (type) {
      const $editorDialog = $id('se-svg-editor-dialog');
      const editingsource = $editorDialog.getAttribute('dialog') === 'open';
      if (editingsource) {
        svgEditor.saveSourceEditor();
      } else {
        // In the future, more options can be provided here
        const saveOpts = {
          images: svgEditor.configObj.pref('img_save'),
          round_digits: 2
        };
        // remove the selected outline before serializing
        svgCanvas.clearSelection();
        // Update save options if provided
        if (saveOpts) {
          const saveOptions = svgCanvas.mergeDeep(svgCanvas.getSvgOption(), saveOpts);
          for (const [key, value] of Object.entries(saveOptions)) {
            svgCanvas.setSvgOption(key, value);
          }
        }
        svgCanvas.setSvgOption('apply', true);

        // no need for doctype, see https://jwatt.org/svg/authoring/#doctype-declaration
        const svg = '<?xml version="1.0"?>\n' + svgCanvas.svgCanvasToString();
        const b64Data = svgCanvas.encode64(svg);
        const blob = b64toBlob(b64Data, 'image/svg+xml');
        try {
          if (type === 'save' && handle !== null) {
            const throwIfExistingHandleNotGood = false;
            handle = await o(blob, {
              fileName: 'untitled.svg',
              extensions: ['.svg']
            }, handle, throwIfExistingHandleNotGood);
          } else {
            handle = await o(blob, {
              fileName: svgEditor.title,
              extensions: ['.svg']
            });
          }
          svgEditor.topPanel.updateTitle(handle.name);
          svgCanvas.runExtensions('onSavedDocument', {
            name: handle.name,
            kind: handle.kind
          });
        } catch (err) {
          if (err.name !== 'AbortError') {
            return console.error(err);
          }
        }
      }
    };
    return {
      name: svgEditor.i18next.t(`${name}:name`),
      // The callback should be used to load the DOM with the appropriate UI items
      callback() {
        const buttonTemplate = `
        <se-menu-item id="tool_clear" label="opensave.new_doc" shortcut="N" src="new.svg"></se-menu-item>`;
        svgCanvas.insertChildAtIndex($id('main_button'), buttonTemplate, 0);
        const openButtonTemplate = '<se-menu-item id="tool_open" label="opensave.open_image_doc" src="open.svg"></se-menu-item>';
        svgCanvas.insertChildAtIndex($id('main_button'), openButtonTemplate, 1);
        const saveButtonTemplate = '<se-menu-item id="tool_save" label="opensave.save_doc" shortcut="S" src="saveImg.svg"></se-menu-item>';
        svgCanvas.insertChildAtIndex($id('main_button'), saveButtonTemplate, 2);
        const saveAsButtonTemplate = '<se-menu-item id="tool_save_as" label="opensave.save_as_doc" src="saveImg.svg"></se-menu-item>';
        svgCanvas.insertChildAtIndex($id('main_button'), saveAsButtonTemplate, 3);
        const importButtonTemplate = '<se-menu-item id="tool_import" label="tools.import_doc" src="importImg.svg"></se-menu-item>';
        svgCanvas.insertChildAtIndex($id('main_button'), importButtonTemplate, 4);

        // handler
        $click($id('tool_clear'), clickClear.bind(this));
        $click($id('tool_open'), clickOpen.bind(this));
        $click($id('tool_save'), clickSave.bind(this, 'save'));
        $click($id('tool_save_as'), clickSave.bind(this, 'saveas'));
        // tool_import pressed with shiftKey will not scale the SVG
        $click($id('tool_import'), ev => {
          imgImport.shiftKey = ev.shiftKey;
          imgImport.click();
        });
      }
    };
  }
};

var en = {
  opensave: {
    new_doc: 'New Image',
    open_image_doc: 'Open SVG',
    save_doc: 'Save SVG',
    save_as_doc: 'Save as SVG'
  }
};

var en$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: en
});

var fr = {
  opensave: {
    new_doc: 'Nouvelle image',
    open_image_doc: 'Ouvrir le SVG',
    save_doc: 'Enregistrer l\'image',
    save_as_doc: 'Enregistrer en tant qu\'image'
  }
};

var fr$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: fr
});

var sv = {
  opensave: {
    new_doc: 'Ny bild',
    open_image_doc: 'Öppna SVG',
    save_doc: 'Spara SVG',
    save_as_doc: 'Spara som SVG'
  }
};

var sv$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: sv
});

var tr = {
  opensave: {
    new_doc: 'Yeni Resim',
    open_image_doc: 'SVG Aç',
    save_doc: 'SVG Kaydet',
    save_as_doc: 'SVG olarak Kaydet'
  }
};

var tr$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: tr
});

var uk = {
  opensave: {
    new_doc: 'Нове Зображення',
    open_image_doc: 'Відкрити SVG',
    save_doc: 'Зберегти SVG',
    save_as_doc: 'Зберегти SVG як'
  }
};

var uk$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: uk
});

var zhCN = {
  opensave: {
    new_doc: '新图片',
    open_image_doc: '打开 SVG',
    save_doc: '保存图像',
    save_as_doc: '另存为图像'
  }
};

var zhCN$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: zhCN
});

export { extOpensave as default };
//# sourceMappingURL=ext-opensave.js.map
