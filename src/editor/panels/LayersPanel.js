/* eslint-disable no-alert */
/* globals $ */
import SvgCanvas from '../../svgcanvas/svgcanvas.js';

const {$id} = SvgCanvas;

/**
 *
 */
class LayersPanel {
  /**
   * @param {PlainObject} editor
   */
  constructor (editor) {
    this.svgCanvas = editor.svgCanvas;
    this.uiStrings = editor.uiStrings;
    this.updateContextPanel = editor.topPanelHandlers.updateContextPanel;
    this.editor = editor;
  }

  /**
   * @param {PlainObject} e event
   * @returns {void}
   */
  lmenuFunc (e) {
    const action = e?.detail?.trigger;
    switch (action) {
    case 'dupe':
      this.cloneLayer();
      break;
    case 'delete':
      this.deleteLayer();
      break;
    case 'merge_down':
      this.mergeLayer();
      break;
    case 'merge_all':
      this.svgCanvas.mergeAllLayers();
      this.updateContextPanel();
      this.populateLayers();
      break;
    }
  }
  /**
   * @returns {void}
   */
  init () {
    // layer menu added to DOM
    const menuMore = document.createElement('se-cmenu-layers');
    menuMore.setAttribute('id', 'se-cmenu-layers-more');
    menuMore.value = 'layer_moreopts';
    menuMore.setAttribute('leftclick', true);
    document.body.append(menuMore);
    const menuLayerBox = document.createElement('se-cmenu-layers');
    menuLayerBox.setAttribute('id', 'se-cmenu-layers-list');
    menuLayerBox.value = 'layerlist';
    menuLayerBox.setAttribute('leftclick', false);
    document.body.append(menuLayerBox);
    document.getElementById('layer_new').addEventListener('click', this.newLayer.bind(this));
    document.getElementById('layer_delete').addEventListener('click', this.deleteLayer.bind(this));
    document.getElementById('layer_up').addEventListener('click', () => this.moveLayer.bind(this)(-1));
    document.getElementById('layer_down').addEventListener('click', () => this.moveLayer.bind(this)(1));
    document.getElementById('layer_rename').addEventListener('click', this.layerRename.bind(this));
    $id('se-cmenu-layers-more').addEventListener('change', this.lmenuFunc.bind(this));
    $id('se-cmenu-layers-list').addEventListener('change', (e) => {
      this.lmenuFunc.bind(this)(e?.detail?.trigger, e?.detail?.source);
    });
  }
  /**
   * @returns {void}
   */
  newLayer () {
    let uniqName;
    let i = this.svgCanvas.getCurrentDrawing().getNumLayers();
    do {
      uniqName = this.uiStrings.layers.layer + ' ' + (++i);
    } while (this.svgCanvas.getCurrentDrawing().hasLayer(uniqName));

    const newName = prompt(this.uiStrings.notification.enterUniqueLayerName, uniqName);
    if (!newName) { return; }
    if (this.svgCanvas.getCurrentDrawing().hasLayer(newName)) {
      alert(this.uiStrings.notification.dupeLayerName);
      return;
    }
    this.svgCanvas.createLayer(newName);
    this.updateContextPanel();
    this.populateLayers();
  }

  /**
   *
   * @returns {void}
   */
  deleteLayer () {
    if (this.svgCanvas.deleteCurrentLayer()) {
      this.updateContextPanel();
      this.populateLayers();
      // This matches what this.svgCanvas does
      // TODO: make this behavior less brittle (svg-editor should get which
      // layer is selected from the canvas and then select that one in the UI)
      $('#layerlist tr.layer').removeClass('layersel');
      $('#layerlist tr.layer:first').addClass('layersel');
    }
  }

  /**
   *
   * @returns {void}
   */
  cloneLayer () {
    const name = this.svgCanvas.getCurrentDrawing().getCurrentLayerName() + ' copy';

    const newName = prompt(this.uiStrings.notification.enterUniqueLayerName, name);
    if (!newName) { return; }
    if (this.svgCanvas.getCurrentDrawing().hasLayer(newName)) {
      alert(this.uiStrings.notification.dupeLayerName);
      return;
    }
    this.svgCanvas.cloneLayer(newName);
    this.updateContextPanel();
    this.populateLayers();
  }

  /**
   *
   * @returns {void}
   */
  mergeLayer () {
    if ($('#layerlist tr.layersel').index() === this.svgCanvas.getCurrentDrawing().getNumLayers() - 1) {
      return;
    }
    this.svgCanvas.mergeLayer();
    this.updateContextPanel();
    this.populateLayers();
  }

  /**
   * @param {Integer} pos
   * @returns {void}
   */
  moveLayer (pos) {
    const total = this.svgCanvas.getCurrentDrawing().getNumLayers();

    let curIndex = $('#layerlist tr.layersel').index();
    if (curIndex > 0 || curIndex < total - 1) {
      curIndex += pos;
      this.svgCanvas.setCurrentLayerPosition(total - curIndex - 1);
      this.populateLayers();
    }
  }

  /**
   * @returns {void}
   */
  layerRename () {
  // const curIndex = $('#layerlist tr.layersel').prevAll().length; // Currently unused
    const oldName = $('#layerlist tr.layersel td.layername').text();
    const newName = prompt(this.uiStrings.notification.enterNewLayerName, '');
    if (!newName) { return; }
    if (oldName === newName || this.svgCanvas.getCurrentDrawing().hasLayer(newName)) {
      alert(this.uiStrings.notification.layerHasThatName);
      return;
    }
    this.svgCanvas.renameCurrentLayer(newName);
    this.populateLayers();
  }

  /**
   * This function highlights the layer passed in (by fading out the other layers).
   * If no layer is passed in, this function restores the other layers.
   * @param {string} [layerNameToHighlight]
   * @returns {void}
  */
  toggleHighlightLayer (layerNameToHighlight) {
    let i;
    const curNames = [], numLayers = this.svgCanvas.getCurrentDrawing().getNumLayers();
    for (i = 0; i < numLayers; i++) {
      curNames[i] = this.svgCanvas.getCurrentDrawing().getLayerName(i);
    }

    if (layerNameToHighlight) {
      curNames.forEach((curName) => {
        if (curName !== layerNameToHighlight) {
          this.svgCanvas.getCurrentDrawing().setLayerOpacity(curName, 0.5);
        }
      });
    } else {
      curNames.forEach((curName) => {
        this.svgCanvas.getCurrentDrawing().setLayerOpacity(curName, 1.0);
      });
    }
  }

  /**
  * @returns {void}
  */
  populateLayers () {
    this.svgCanvas.clearSelection();
    const layerlist = $('#layerlist tbody').empty();
    const selLayerNames = $('#selLayerNames').empty();
    const drawing = this.svgCanvas.getCurrentDrawing();
    const currentLayerName = drawing.getCurrentLayerName();
    let layer = this.svgCanvas.getCurrentDrawing().getNumLayers();
    // we get the layers in the reverse z-order (the layer rendered on top is listed first)
    while (layer--) {
      const name = drawing.getLayerName(layer);
      const layerTr = $('<tr class="layer">').toggleClass('layersel', name === currentLayerName);
      const layerVis = $('<td class="layervis">').toggleClass('layerinvis', !drawing.getLayerVisibility(name));
      const layerName = $('<td class="layername">' + name + '</td>');
      layerlist.append(layerTr.append(layerVis, layerName));
      selLayerNames.append('<option value="' + name + '">' + name + '</option>');
    }
    // handle selection of layer
    $('#layerlist td.layername')
      .mouseup((evt) => {
        $('#layerlist tr.layer').removeClass('layersel');
        $(evt.currentTarget.parentNode).addClass('layersel');
        this.svgCanvas.setCurrentLayer(evt.currentTarget.textContent);
        this.populateObjects();
        evt.preventDefault();
      })
      .mouseover((evt) => {
        this.toggleHighlightLayer(evt.currentTarget.textContent);
      })
      .mouseout(() => {
        this.toggleHighlightLayer('');
      });
    $('#layerlist td.layervis').click((evt) => {
      const row = $(evt.currentTarget.parentNode).prevAll().length;
      const name = $('#layerlist tr.layer:eq(' + row + ') td.layername').text();
      const vis = $(evt.currentTarget).hasClass('layerinvis');
      this.svgCanvas.setLayerVisibility(name, vis);
      $(evt.currentTarget).toggleClass('layerinvis');
    });

    // if there were too few rows, let's add a few to make it not so lonely
    let num = 5 - $('#layerlist tr.layer').size();
    while (num-- > 0) {
    // TODO: there must a better way to do this
      layerlist.append('<tr><td style="color:white">_</td><td/></tr>');
    }
  }

  populateObjects () {
    const objectlist = $('#objectlist tbody').empty();
    const selectedElementId = this.editor.selectedElement ? this.editor.selectedElement.id : null;

    const drawing = this.svgCanvas.getCurrentDrawing();
    const currentElements = drawing.getCurrentLayerChildren();
    for (const currentElement of currentElements) {
      const elementId = currentElement.id;

      const objectTr = $('<tr class="object">').toggleClass('objectsel', elementId === selectedElementId);
      const objectVis = $('<td class="objectvis">').toggleClass('objectinvis', !drawing.isLayerChildrenVisible(elementId));
      const objectName = $('<td class="objectname" title="' + elementId + '">' + elementId + '</td>');
      const objectSelect = $('<td class="objectselect">');
      objectlist.append(objectTr.append(objectVis, objectName, objectSelect));
    }

    // Change visibility of object
    $('#objectlist td.objectvis').click((evt) => {
      const row = $(evt.currentTarget.parentNode).prevAll().length;
      const id = $('#objectlist tr.object:eq(' + row + ') td.objectname').text();
      const vis = $(evt.currentTarget).hasClass('objectinvis');
      drawing.setLayerChildrenVisible(id, vis);
      $(evt.currentTarget).toggleClass('objectinvis');
      if (!vis) this.svgCanvas.clearSelection();
    });

    // Handle selection of object
    $('#objectlist td.objectselect').click((evt) => {
      $('#objectlist tr.object').removeClass('objectsel');
      const row = $(evt.currentTarget.parentNode).prevAll().length;
      const vis = $('#objectlist tr.object:eq(' + row + ') td.objectvis').hasClass('objectinvis');

      if (!vis) {
        const id = $('#objectlist tr.object:eq(' + row + ') td.objectname').text();
        this.svgCanvas.clearSelection();
        this.svgCanvas.addToSelection([$('[id="' + id + '"]')[0]], true);
        $(evt.currentTarget.parentNode).toggleClass('objectsel');
      }
    });

    // if there were too few rows, let's add a few to make it not so lonely
    let num = 5 - $('#objectlist tr.object').size();
    while (num-- > 0) {
      objectlist.append('<tr><td style="color:white">_</td><td/><td/></tr>');
    }
  }
}

export default LayersPanel;
