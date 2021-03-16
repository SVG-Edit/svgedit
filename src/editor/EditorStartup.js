/* globals $ seConfirm seAlert */
import './touch.js';
import {convertUnit} from '../common/units.js';
import {
  hasCustomHandler, getCustomHandler, injectExtendedContextMenuItemsIntoDom
} from './contextmenu.js';
import editorTemplate from './templates/editorTemplate.js';
import SvgCanvas from '../svgcanvas/svgcanvas.js';
import Rulers from './Rulers.js';

/**
   * @fires module:svgcanvas.SvgCanvas#event:svgEditorReady
   * @returns {void}
   */
const readySignal = () => {
  // let the opener know SVG Edit is ready (now that config is set up)
  const w = window.opener || window.parent;
  if (w) {
    try {
      /**
         * Triggered on a containing `document` (of `window.opener`
         * or `window.parent`) when the editor is loaded.
         * @event module:SVGEditor#event:svgEditorReadyEvent
         * @type {Event}
         * @property {true} bubbles
         * @property {true} cancelable
         */
      /**
         * @name module:SVGthis.svgEditorReadyEvent
         * @type {module:SVGEditor#event:svgEditorReadyEvent}
         */
      const svgEditorReadyEvent = new w.CustomEvent('svgEditorReady', {
        bubbles: true,
        cancelable: true
      });
      w.document.documentElement.dispatchEvent(svgEditorReadyEvent);
    } catch (e) {/* empty fn */}
  }
};

const {$id} = SvgCanvas;

/**
 *
 */
class EditorStartup {
  /**
   *
   */
  constructor () {
    this.extensionsAdded = false;
    this.messageQueue = [];
    this.$svgEditor = $id('svg_editor')
  }
  /**
  * Auto-run after a Promise microtask.
  * @function module:SVGthis.init
  * @returns {void}
  */
  async init () {
    // allow to prepare the dom without display
    this.$svgEditor.style.visibility = 'hidden';
    try {
      // add editor components to the DOM
      document.body.append(editorTemplate.content.cloneNode(true));
      // Image props dialog added to DOM
      const newSeImgPropDialog = document.createElement('se-img-prop-dialog');
      newSeImgPropDialog.setAttribute('id', 'se-img-prop');
      document.body.append(newSeImgPropDialog);
      // editor prefences dialoag added to DOM
      const newSeEditPrefsDialog = document.createElement('se-edit-prefs-dialog');
      newSeEditPrefsDialog.setAttribute('id', 'se-edit-prefs');
      document.body.append(newSeEditPrefsDialog);
      // canvas menu added to DOM
      const dialogBox = document.createElement('se-cmenu_canvas-dialog');
      dialogBox.setAttribute('id', 'se-cmenu_canvas');
      document.body.append(dialogBox);
      // alertDialog added to DOM
      const alertBox = document.createElement('se-alert-dialog');
      alertBox.setAttribute('id', 'se-alert-dialog');
      document.body.append(alertBox);
      // promptDialog added to DOM
      const promptBox = document.createElement('se-prompt-dialog');
      promptBox.setAttribute('id', 'se-prompt-dialog');
      document.body.append(promptBox);
      // Export dialog added to DOM
      const exportDialog = document.createElement('se-export-dialog');
      exportDialog.setAttribute('id', 'se-export-dialog');
      document.body.append(exportDialog);
    } catch (err) {
      console.error(err);
    }

    if ('localStorage' in window) { // && onWeb removed so Webkit works locally
      this.storage = window.localStorage;
    }

    this.configObj.load();

    /**
    * @name module:SVGthis.canvas
    * @type {module:svgcanvas.SvgCanvas}
    */
    this.svgCanvas = new SvgCanvas(
      $id('svgcanvas'),
      this.configObj.curConfig
    );

    this.leftPanel.init();
    this.bottomPanel.init();
    this.topPanel.init();
    this.layersPanel.init();
    this.mainMenu.init();

    const {undoMgr} = this.svgCanvas;
    this.workarea = document.getElementById('workarea');
    this.canvMenu = document.getElementById('se-cmenu_canvas');
    this.exportWindow = null;
    this.defaultImageURL = this.configObj.curConfig.imgPath + 'logo.svg';
    const zoomInIcon = 'crosshair';
    const zoomOutIcon = 'crosshair';
    this.uiContext = 'toolbars';

    // For external openers
    readySignal();

    this.rulers = new Rulers(this);

    this.layersPanel.populateLayers();
    this.selectedElement = null;
    this.multiselected = false;

    $('#cur_context_panel').delegate('a', 'click', (evt) => {
      const link = $(evt.currentTarget);
      if (link.attr('data-root')) {
        this.svgCanvas.leaveContext();
      } else {
        this.svgCanvas.setContext(link.text());
      }
      this.svgCanvas.clearSelection();
      return false;
    });
    // bind the selected event to our function that handles updates to the UI
    this.svgCanvas.bind('selected', this.selectedChanged.bind(this));
    this.svgCanvas.bind('transition', this.elementTransition.bind(this));
    this.svgCanvas.bind('changed', this.elementChanged.bind(this));
    this.svgCanvas.bind('exported', this.exportHandler.bind(this));
    this.svgCanvas.bind('exportedPDF', function (win, data) {
      if (!data.output) { // Ignore Chrome
        return;
      }
      const {exportWindowName} = data;
      if (exportWindowName) {
        this.exportWindow = window.open('', this.exportWindowName); // A hack to get the window via JSON-able name without opening a new one
      }
      if (!this.exportWindow || this.exportWindow.closed) {
        seAlert(this.uiStrings.notification.popupWindowBlocked);
        return;
      }
      this.exportWindow.location.href = data.output;
    }.bind(this));
    this.svgCanvas.bind('zoomed', this.zoomChanged.bind(this));
    this.svgCanvas.bind('zoomDone', this.zoomDone.bind(this));
    this.svgCanvas.bind(
      'updateCanvas',
      /**
     * @param {external:Window} win
     * @param {PlainObject} centerInfo
     * @param {false} centerInfo.center
     * @param {module:math.XYObject} centerInfo.newCtr
     * @listens module:svgcanvas.SvgCanvas#event:updateCanvas
     * @returns {void}
     */
      function (win, {center, newCtr}) {
        this.updateCanvas(center, newCtr);
      }.bind(this)
    );
    this.svgCanvas.bind('contextset', this.contextChanged.bind(this));
    this.svgCanvas.bind('extension_added', this.extAdded.bind(this));
    this.svgCanvas.textActions.setInputElem($('#text')[0]);

    this.setBackground(this.configObj.pref('bkgd_color'), this.configObj.pref('bkgd_url'));

    // update resolution option with actual resolution
    const res = this.svgCanvas.getResolution();
    if (this.configObj.curConfig.baseUnit !== 'px') {
      res.w = convertUnit(res.w) + this.configObj.curConfig.baseUnit;
      res.h = convertUnit(res.h) + this.configObj.curConfig.baseUnit;
    }
    $('#se-img-prop').attr('dialog', 'close');
    $('#se-img-prop').attr('title', this.svgCanvas.getDocumentTitle());
    $('#se-img-prop').attr('width', res.w);
    $('#se-img-prop').attr('height', res.h);
    $('#se-img-prop').attr('save', this.configObj.pref('img_save'));

    // Lose focus for select elements when changed (Allows keyboard shortcuts to work better)
    $('select').change((evt) => { $(evt.currentTarget).blur(); });

    // fired when user wants to move elements to another layer
    let promptMoveLayerOnce = false;
    $('#selLayerNames').change((evt) => {
      const destLayer = evt.currentTarget.options[evt.currentTarget.selectedIndex].value;
      const confirmStr = this.uiStrings.notification.Qmovethis.elemsToLayer.replace('%s', destLayer);
      /**
    * @param {boolean} ok
    * @returns {void}
    */
      const moveToLayer = (ok) => {
        if (!ok) { return; }
        promptMoveLayerOnce = true;
        this.svgCanvas.moveSelectedToLayer(destLayer);
        this.svgCanvas.clearSelection();
        this.layersPanel.populateLayers();
      };
      if (destLayer) {
        if (promptMoveLayerOnce) {
          moveToLayer(true);
        } else {
          const ok = seConfirm(confirmStr);
          if (!ok) {
            return;
          }
          moveToLayer(true);
        }
      }
    });

    $('#tool_font_family').change((evt) => {
      this.svgCanvas.setFontFamily(evt.originalEvent.detail.value);
    });

    $('#seg_type').change((evt) => {
      this.svgCanvas.setSegType($(evt.currentTarget).val());
    });

    $('#text').bind('keyup input', (evt) => {
      this.svgCanvas.setTextContent(evt.currentTarget.value);
    });

    $('#image_url').change((evt) => {
      this.setImageURL(evt.currentTarget.value);
    });

    $('#link_url').change((evt) => {
      if (evt.currentTarget.value.length) {
        this.svgCanvas.setLinkURL(evt.currentTarget.value);
      } else {
        this.svgCanvas.removeHyperlink();
      }
    });

    $('#g_title').change((evt) => {
      this.svgCanvas.setGroupTitle(evt.currentTarget.value);
    });

    const wArea = this.workarea;

    let lastX = null, lastY = null,
      panning = false, keypan = false;

    $('#svgcanvas').bind('mousemove mouseup', function (evt) {
      if (panning === false) { return true; }

      wArea.scrollLeft -= (evt.clientX - lastX);
      wArea.scrollTop -= (evt.clientY - lastY);

      lastX = evt.clientX;
      lastY = evt.clientY;

      if (evt.type === 'mouseup') { panning = false; }
      return false;
    }).mousedown(function (evt) {
      if (evt.button === 1 || keypan === true) {
        panning = true;
        lastX = evt.clientX;
        lastY = evt.clientY;
        return false;
      }
      return true;
    });

    $(window).mouseup(() => {
      panning = false;
    });

    document.addEventListener('keydown', (e) => {
      if (e.target.nodeName !== 'BODY') return;
      if(e.code.toLowerCase() === 'space'){
        this.svgCanvas.spaceKey = keypan = true;
        e.preventDefault();  
      } else if((e.key.toLowerCase() === 'shift') && (this.svgCanvas.getMode() === 'zoom')){
        this.workarea.style.cursor = zoomOutIcon;
        e.preventDefault();  
      } else {
        return;
      }
    });

    document.addEventListener('keyup', (e) => {
      if (e.target.nodeName !== 'BODY') return;
      if(e.code.toLowerCase() === 'space'){
        this.svgCanvas.spaceKey = keypan = false;
        e.preventDefault();  
      } else if((e.key.toLowerCase() === 'shift') && (this.svgCanvas.getMode() === 'zoom')){
        this.workarea.style.cursor = zoomInIcon;
        e.preventDefault();  
      } else {
        return;
      }
    });


    /**
     * @function module:SVGthis.setPanning
     * @param {boolean} active
     * @returns {void}
     */
    this.setPanning = (active) => {
      this.svgCanvas.spaceKey = keypan = active;
    };
    let inp;
    /**
      *
      * @returns {void}
      */
    const unfocus = () => {
      $(inp).blur();
    };

    $('#svg_editor').find('button, select, input:not(#text)').focus(() => {
      inp = this;
      this.uiContext = 'toolbars';
      this.workarea.addEventListener('mousedown', unfocus);
    }).blur(() => {
      this.uiContext = 'canvas';
      this.workarea.removeEventListener('mousedown', unfocus);
      // Go back to selecting text if in textedit mode
      if (this.svgCanvas.getMode() === 'textedit') {
        $('#text').focus();
      }
    });
    const winWh = {width: $(window).width(), height: $(window).height()};

    window.addEventListener('resize', (evt) => {
      Object.entries(winWh).forEach(([type, val]) => {
        const curval = $(window)[type]();
        this.workarea['scroll' + (type === 'width' ? 'Left' : 'Top')] -= (curval - val) / 2;
        winWh[type] = curval;
      });
    });

    this.workarea.addEventListener('scroll', () => {
    // TODO: jQuery's scrollLeft/Top() wouldn't require a null check
      this.rulers.manageScroll();
    });

    $('#url_notice').click(() => {
      seAlert(this.title);
    });

    $id('stroke_width').value = this.configObj.curConfig.initStroke.width;
    $id('opacity').value = this.configObj.curConfig.initOpacity * 100;

    $('.push_button').mousedown(() => {
      if (!$(this).hasClass('disabled')) {
        $(this).addClass('push_button_pressed').removeClass('push_button');
      }
    }).mouseout(() => {
      $(this).removeClass('push_button_pressed').addClass('push_button');
    }).mouseup(() => {
      $(this).removeClass('push_button_pressed').addClass('push_button');
    });

    this.layersPanel.populateLayers();

    const centerCanvas = () => {
      // this centers the canvas vertically in the this.workarea (horizontal handled in CSS)
      this.workarea.style.lineHeight = this.workarea.style.height;
    };

    $(window).bind('load resize', centerCanvas);

    // Prevent browser from erroneously repopulating fields
    $('input,select').attr('autocomplete', 'off');

    $id('se-svg-editor-dialog').addEventListener('change', function (e) {
      if (e?.detail?.copy === 'click') {
        this.cancelOverlays(e);
      } else if (e?.detail?.dialog === 'closed') {
        this.hideSourceEditor();
      } else {
        this.saveSourceEditor(e);
      }
    }.bind(this));
    $id('se-cmenu_canvas').addEventListener('change', function (e) {
      const action = e?.detail?.trigger;
      switch (action) {
      case 'delete':
        this.svgCanvas.deleteSelectedElements();
        break;
      case 'cut':
        this.cutSelected();
        break;
      case 'copy':
        this.copySelected();
        break;
      case 'paste':
        this.svgCanvas.pasteElements();
        break;
      case 'paste_in_place':
        this.svgCanvas.pasteElements('in_place');
        break;
      case 'group':
      case 'group_elements':
        this.svgCanvas.groupSelectedElements();
        break;
      case 'ungroup':
        this.svgCanvas.ungroupSelectedElement();
        break;
      case 'move_front':
        this.svgCanvas.moveToTopSelectedElement();
        break;
      case 'move_up':
        this.moveUpDownSelected('Up');
        break;
      case 'move_down':
        this.moveUpDownSelected('Down');
        break;
      case 'move_back':
        this.svgCanvas.moveToBottomSelected();
        break;
      default:
        if (hasCustomHandler(action)) {
          getCustomHandler(action).call();
        }
        break;
      }
    }.bind(this));

    // Select given tool
    this.ready(function () {
      const preTool = $id(`tool_${this.configObj.curConfig.initTool}`);
      const regTool = $id(this.configObj.curConfig.initTool);
      const selectTool = $id('tool_select');
      const $editDialog = $id('se-edit-prefs');

      if (preTool) {
        preTool.click();
      } else if (regTool) {
        regTool.click();
      } else {
        selectTool.click();
      }

      if (this.configObj.curConfig.wireframe) {
        $id('tool_wireframe').click();
      }

      $('#rulers').toggle(Boolean(this.configObj.curConfig.showRulers));

      if (this.configObj.curConfig.showRulers) {
        $editDialog.setAttribute('showrulers', true);
      }

      if (this.configObj.curConfig.baseUnit) {
        $editDialog.setAttribute('baseunit', this.configObj.curConfig.baseUnit);
      }

      if (this.configObj.curConfig.gridSnapping) {
        $editDialog.setAttribute('gridsnappingon', true);
      }

      if (this.configObj.curConfig.snappingStep) {
        $editDialog.setAttribute('gridsnappingstep', this.configObj.curConfig.snappingStep);
      }

      if (this.configObj.curConfig.gridColor) {
        $editDialog.setAttribute('gridcolor', this.configObj.curConfig.gridColor);
      }
    }.bind(this));

    // zoom
    $id('zoom').value = (this.svgCanvas.getZoom() * 100).toFixed(1);
    this.canvMenu.setAttribute('disableallmenu', true);
    this.canvMenu.setAttribute('enablemenuitems', '#delete,#cut,#copy');

    this.enableOrDisableClipboard();

    window.addEventListener('storage', function (e) {
      if (e.key !== 'svgedit_clipboard') { return; }

      this.enableOrDisableClipboard();
    }.bind(this));

    window.addEventListener('beforeunload', function (e) {
    // Suppress warning if page is empty
      if (undoMgr.getUndoStackSize() === 0) {
        this.showSaveWarning = false;
      }

      // showSaveWarning is set to 'false' when the page is saved.
      if (!this.configObj.curConfig.no_save_warning && this.showSaveWarning) {
      // Browser already asks question about closing the page
        e.returnValue = this.uiStrings.notification.unsavedChanges; // Firefox needs this when beforeunload set by addEventListener (even though message is not used)
        return this.uiStrings.notification.unsavedChanges;
      }
      return true;
    }.bind(this));

    // Use HTML5 File API: http://www.w3.org/TR/FileAPI/
    // if browser has HTML5 File API support, then we will show the open menu item
    // and provide a file input to click. When that change event fires, it will
    // get the text contents of the file and send it to the canvas
    if (window.FileReader) {
    /**
    * @param {Event} e
    * @returns {void}
    */
      const editorObj = this;
      const importImage = function (e) {
        document.getElementById('se-prompt-dialog').title = editorObj.uiStrings.notification.loadingImage;
        e.stopPropagation();
        e.preventDefault();
        const file = (e.type === 'drop') ? e.dataTransfer.files[0] : this.files[0];
        if (!file) {
          document.getElementById('se-prompt-dialog').setAttribute('close', true);
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
          reader.onloadend = function (ev) {
            const newElement = editorObj.svgCanvas.importSvgString(ev.target.result, true);
            editorObj.svgCanvas.ungroupSelectedElement();
            editorObj.svgCanvas.ungroupSelectedElement();
            editorObj.svgCanvas.groupSelectedElements();
            editorObj.svgCanvas.alignSelectedElements('m', 'page');
            editorObj.svgCanvas.alignSelectedElements('c', 'page');
            // highlight imported element, otherwise we get strange empty selectbox
            editorObj.svgCanvas.selectOnly([newElement]);
            document.getElementById('se-prompt-dialog').setAttribute('close', true);
          };
          reader.readAsText(file);
        } else {
        // bitmap handling
          reader = new FileReader();
          reader.onloadend = function ({target: {result}}) {
          /**
          * Insert the new image until we know its dimensions.
          * @param {Float} imageWidth
          * @param {Float} imageHeight
          * @returns {void}
          */
            const insertNewImage = function (imageWidth, imageHeight) {
              const newImage = editorObj.svgCanvas.addSVGElementFromJson({
                element: 'image',
                attr: {
                  x: 0,
                  y: 0,
                  width: imageWidth,
                  height: imageHeight,
                  id: editorObj.svgCanvas.getNextId(),
                  style: 'pointer-events:inherit'
                }
              });
              editorObj.svgCanvas.setHref(newImage, result);
              editorObj.svgCanvas.selectOnly([newImage]);
              editorObj.svgCanvas.alignSelectedElements('m', 'page');
              editorObj.svgCanvas.alignSelectedElements('c', 'page');
              editorObj.topPanelHandlers.updateContextPanel();
              document.getElementById('se-prompt-dialog').setAttribute('close', true);
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

      this.workarea.addEventListener('dragenter', this.onDragEnter);
      this.workarea.addEventListener('dragover', this.onDragOver);
      this.workarea.addEventListener('dragleave', this.onDragLeave);
      this.workarea.addEventListener('drop', importImage);
      const imgImport = $('<input type="file">').change(importImage);
      $(window).on('importImages', () => imgImport.click());
    }

    this.updateCanvas(true);
    // Load extensions
    this.extAndLocaleFunc();
    // Defer injection to wait out initial menu processing. This probably goes
    //    away once all context menu behavior is brought to context menu.
    this.ready(() => {
      injectExtendedContextMenuItemsIntoDom();
    });
    // run callbacks stored by this.ready
    await this.runCallbacks();
    window.addEventListener('message', this.messageListener.bind(this));
  }
  /**
   * @fires module:svgcanvas.SvgCanvas#event:ext_addLangData
   * @fires module:svgcanvas.SvgCanvas#event:ext_langReady
   * @fires module:svgcanvas.SvgCanvas#event:ext_langChanged
   * @fires module:svgcanvas.SvgCanvas#event:extensions_added
   * @returns {Promise<module:locale.LangAndData>} Resolves to result of {@link module:locale.readLang}
   */
  async extAndLocaleFunc () {
    const {langParam, langData} = await this.putLocale(this.configObj.pref('lang'), this.goodLangs);
    await this.setLang(langParam, langData);

    this.$svgEditor.style.visibility = 'visible';

    try {
      // load standard extensions
      await Promise.all(
        this.configObj.curConfig.extensions.map(async (extname) => {
          /**
           * @tutorial ExtensionDocs
           * @typedef {PlainObject} module:SVGthis.ExtensionObject
           * @property {string} [name] Name of the extension. Used internally; no need for i18n. Defaults to extension name without beginning "ext-" or ending ".js".
           * @property {module:svgcanvas.ExtensionInitCallback} [init]
           */
          try {
            /**
             * @type {module:SVGthis.ExtensionObject}
             */
            const imported = await import(`./extensions/${encodeURIComponent(extname)}/${encodeURIComponent(extname)}.js`);
            const {name = extname, init: initfn} = imported.default;
            return this.addExtension(name, (initfn && initfn.bind(this)), {$, langParam});
          } catch (err) {
            // Todo: Add config to alert any errors
            console.error('Extension failed to load: ' + extname + '; ', err);
            return undefined;
          }
        })
      );
      // load user extensions (given as pathNames)
      await Promise.all(
        this.configObj.curConfig.userExtensions.map(async (extPathName) => {
          /**
           * @tutorial ExtensionDocs
           * @typedef {PlainObject} module:SVGthis.ExtensionObject
           * @property {string} [name] Name of the extension. Used internally; no need for i18n. Defaults to extension name without beginning "ext-" or ending ".js".
           * @property {module:svgcanvas.ExtensionInitCallback} [init]
           */
          try {
            /**
             * @type {module:SVGthis.ExtensionObject}
             */
            const imported = await import(encodeURI(extPathName));
            const {name, init: initfn} = imported.default;
            return this.addExtension(name, (initfn && initfn.bind(this)), {$, langParam});
          } catch (err) {
            // Todo: Add config to alert any errors
            console.error('Extension failed to load: ' + extPathName + '; ', err);
            return undefined;
          }
        })
      );
      this.svgCanvas.bind(
        'extensions_added',
        /**
        * @param {external:Window} win
        * @param {module:svgcanvas.SvgCanvas#event:extensions_added} data
        * @listens module:SvgCanvas#event:extensions_added
        * @returns {void}
        */
        (win, data) => {
          this.extensionsAdded = true;
          this.setAll();

          if (this.storagePromptState === 'ignore') {
            this.updateCanvas(true);
          }

          this.messageQueue.forEach(
            /**
             * @param {module:svgcanvas.SvgCanvas#event:message} messageObj
             * @fires module:svgcanvas.SvgCanvas#event:message
             * @returns {void}
             */
            (messageObj) => {
              this.svgCanvas.call('message', messageObj);
            }
          );
        }
      );
      this.svgCanvas.call('extensions_added');
    } catch (err) {
      // Todo: Report errors through the UI
      console.log(err);
    }
  }

  /**
 * @param {PlainObject} info
 * @param {any} info.data
 * @param {string} info.origin
 * @fires module:svgcanvas.SvgCanvas#event:message
 * @returns {void}
 */
  messageListener ({data, origin}) {
  // console.log('data, origin, extensionsAdded', data, origin, extensionsAdded);
    const messageObj = {data, origin};
    if (!this.extensionsAdded) {
      this.messageQueue.push(messageObj);
    } else {
    // Extensions can handle messages at this stage with their own
    //  canvas `message` listeners
      this.svgCanvas.call('message', messageObj);
    }
  }
}

export default EditorStartup;
