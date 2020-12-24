/* globals $ */

/**
 *
 */
class LayersPanel {
  /**
   * @param {PlainObject} svgCanvas svgCanvas
   * @param {PlainObject} uiStrings uiStrings
   * @param {GenericCallBack} updateContextPanel updateContextPanel
   */
  constructor (svgCanvas, uiStrings, updateContextPanel) {
    this.svgCanvas = svgCanvas;
    this.uiStrings = uiStrings;
    this.updateContextPanel = updateContextPanel;
  }
  /**
   * @returns {void}
   */
  addEvents () {
    document.getElementById('layer_new').addEventListener('click', this.newLayer.bind(this));
    document.getElementById('layer_delete').addEventListener('click', this.deleteLayer.bind(this));
    document.getElementById('layer_up').addEventListener('click', () => this.moveLayer.bind(this)(-1));
    document.getElementById('layer_down').addEventListener('click', () => this.moveLayer.bind(this)(1));
    document.getElementById('layer_rename').addEventListener('click', this.layerRename.bind(this));
  }
  /**
   * @returns {void}
   */
  async newLayer () {
    let uniqName;
    let i = this.svgCanvas.getCurrentDrawing().getNumLayers();
    do {
      uniqName = this.uiStrings.layers.layer + ' ' + (++i);
    } while (this.svgCanvas.getCurrentDrawing().hasLayer(uniqName));

    const newName = await $.prompt(this.uiStrings.notification.enterUniqueLayerName, uniqName);
    if (!newName) { return; }
    if (this.svgCanvas.getCurrentDrawing().hasLayer(newName)) {
    /* await */ $.alert(this.uiStrings.notification.dupeLayerName);
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
   * @returns {Promise<void>}
   */
  async cloneLayer () {
    const name = this.svgCanvas.getCurrentDrawing().getCurrentLayerName() + ' copy';

    const newName = await $.prompt(this.uiStrings.notification.enterUniqueLayerName, name);
    if (!newName) { return; }
    if (this.svgCanvas.getCurrentDrawing().hasLayer(newName)) {
    /* await */ $.alert(this.uiStrings.notification.dupeLayerName);
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
  async layerRename () {
  // const curIndex = $('#layerlist tr.layersel').prevAll().length; // Currently unused
    const oldName = $('#layerlist tr.layersel td.layername').text();
    const newName = await $.prompt(this.uiStrings.notification.enterNewLayerName, '');
    if (!newName) { return; }
    if (oldName === newName || this.svgCanvas.getCurrentDrawing().hasLayer(newName)) {
    /* await */ $.alert(this.uiStrings.notification.layerHasThatName);
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
        evt.preventDefault();
      })
      .mouseover((evt) => {
        this.toggleHighlightLayer(this.svgCanvas, evt.currentTarget.textContent);
      })
      .mouseout(() => {
        this.toggleHighlightLayer(this.svgCanvas);
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
}

export default LayersPanel;
