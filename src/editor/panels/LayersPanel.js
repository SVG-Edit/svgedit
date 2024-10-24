import SvgCanvas from '@svgedit/svgcanvas'
import LayersPanelHtml from './LayersPanel.html'

const { $id, $click } = SvgCanvas

/**
 *
 */
class LayersPanel {
  /**
   * @param {PlainObject} editor
   */
  constructor (editor) {
    this.updateContextPanel = editor.topPanel.updateContextPanel.bind(editor.topPanel)
    this.editor = editor
  }

  /**
   * @param {PlainObject} e event
   * @returns {void}
   */
  lmenuFunc (e) {
    const action = e?.detail?.trigger
    switch (action) {
      case 'dupe':
        this.cloneLayer()
        break
      case 'delete':
        this.deleteLayer()
        break
      case 'merge_down':
        this.mergeLayer()
        break
      case 'merge_all':
        this.editor.svgCanvas.mergeAllLayers()
        this.updateContextPanel()
        this.populateLayers()
        break
    }
  }

  /**
   * @returns {void}
   */
  init () {
    const template = document.createElement('template')
    const { i18next } = this.editor

    template.innerHTML = LayersPanelHtml
    this.editor.$svgEditor.append(template.content.cloneNode(true))
    // layer menu added to DOM
    const menuMore = document.createElement('se-cmenu-layers')
    menuMore.setAttribute('id', 'se-cmenu-layers-more')
    menuMore.value = 'layer_moreopts'
    menuMore.setAttribute('leftclick', true)
    this.editor.$container.append(menuMore)
    menuMore.init(i18next)
    const menuLayerBox = document.createElement('se-cmenu-layers')
    menuLayerBox.setAttribute('id', 'se-cmenu-layers-list')
    menuLayerBox.value = 'layerlist'
    menuLayerBox.setAttribute('leftclick', false)
    this.editor.$container.append(menuLayerBox)
    menuLayerBox.init(i18next)
    $click($id('layer_new'), this.newLayer.bind(this))
    $click($id('layer_delete'), this.deleteLayer.bind(this))
    $click($id('layer_up'), () => this.moveLayer.bind(this)(-1))
    $click($id('layer_down'), () => this.moveLayer.bind(this)(1))
    $click($id('layer_rename'), this.layerRename.bind(this))
    $id('se-cmenu-layers-more').addEventListener('change', this.lmenuFunc.bind(this))
    $id('se-cmenu-layers-list').addEventListener('change', (e) => { this.lmenuFunc(e) })
    $click($id('sidepanel_handle'), () => this.toggleSidePanel())
    this.toggleSidePanel(this.editor.configObj.curConfig.showlayers)
  }

  toggleSidePanel (displayFlag) {
    if (displayFlag === undefined) {
      this.editor.$svgEditor.classList.toggle('open')
    } else if (displayFlag) {
      this.editor.$svgEditor.classList.add('open')
    } else {
      this.editor.$svgEditor.classList.remove('open')
    }
  }

  /**
   * @returns {void}
   */
  newLayer () {
    let uniqName
    let i = this.editor.svgCanvas.getCurrentDrawing().getNumLayers()
    do {
      uniqName = this.editor.i18next.t('layers.layer') + ' ' + ++i
    } while (this.editor.svgCanvas.getCurrentDrawing().hasLayer(uniqName))

    const newName = prompt(
      this.editor.i18next.t('notification.enterUniqueLayerName'),
      uniqName
    )
    if (!newName) {
      return
    }
    if (this.editor.svgCanvas.getCurrentDrawing().hasLayer(newName)) {
      alert(this.editor.i18next.t('notification.dupeLayerName'))
      return
    }
    this.editor.svgCanvas.createLayer(newName)
    this.updateContextPanel()
    this.populateLayers()
  }

  /**
   *
   * @returns {void}
   */
  deleteLayer () {
    if (this.editor.svgCanvas.deleteCurrentLayer()) {
      this.updateContextPanel()
      this.populateLayers()
      // This matches what this.editor.svgCanvas does
      // TODO: make this behavior less brittle (svg-editor should get which
      // layer is selected from the canvas and then select that one in the UI)
      const elements = document.querySelectorAll('#layerlist tr.layer')
      Array.prototype.forEach.call(elements, function (el) {
        el.classList.remove('layersel')
      })
      document.querySelector('#layerlist tr.layer').classList.add('layersel')
    }
  }

  /**
   *
   * @returns {void}
   */
  cloneLayer () {
    const name =
      this.editor.svgCanvas.getCurrentDrawing().getCurrentLayerName() + ' copy'

    const newName = prompt(
      this.editor.i18next.t('notification.enterUniqueLayerName'),
      name
    )
    if (!newName) {
      return
    }
    if (this.editor.svgCanvas.getCurrentDrawing().hasLayer(newName)) {
      alert(this.editor.i18next.t('notification.dupeLayerName'))
      return
    }
    this.editor.svgCanvas.cloneLayer(newName)
    this.updateContextPanel()
    this.populateLayers()
  }

  index (el) {
    if (!el) return -1
    return Array.from(document.querySelector('#layerlist tbody').children).indexOf(el)
  }

  /**
   *
   * @returns {void}
   */
  mergeLayer () {
    if (
      (this.index(document.querySelector('#layerlist tr.layersel')) - 1) ===
      this.editor.svgCanvas.getCurrentDrawing().getNumLayers() - 1
    ) {
      return
    }
    this.editor.svgCanvas.mergeLayer()
    this.updateContextPanel()
    this.populateLayers()
  }

  /**
   * @param {Integer} pos
   * @returns {void}
   */
  moveLayer (pos) {
    const curPos = this.editor.svgCanvas.indexCurrentLayer()
    if (curPos !== -1) {
      this.editor.svgCanvas.setCurrentLayerPosition(curPos - pos)
      this.populateLayers()
    }
  }

  /**
   * @returns {void}
   */
  layerRename () {
    const ele = document.querySelector('#layerlist tr.layersel td.layername')
    const oldName = (ele) ? ele.textContent : ''
    const newName = prompt(this.editor.i18next.t('notification.enterNewLayerName'), '')
    if (!newName) {
      return
    }
    if (
      oldName === newName ||
      this.editor.svgCanvas.getCurrentDrawing().hasLayer(newName)
    ) {
      alert(this.editor.i18next.t('notification.layerHasThatName'))
      return
    }
    this.editor.svgCanvas.renameCurrentLayer(newName)
    this.populateLayers()
  }

  /**
   * This function highlights the layer passed in (by fading out the other layers).
   * If no layer is passed in, this function restores the other layers.
   * @param {string} [layerNameToHighlight]
   * @returns {void}
   */
  toggleHighlightLayer (layerNameToHighlight) {
    let i
    const curNames = []
    const numLayers = this.editor.svgCanvas.getCurrentDrawing().getNumLayers()
    for (i = 0; i < numLayers; i++) {
      curNames[i] = this.editor.svgCanvas.getCurrentDrawing().getLayerName(i)
    }

    if (layerNameToHighlight) {
      curNames.forEach((curName) => {
        if (curName !== layerNameToHighlight) {
          this.editor.svgCanvas
            .getCurrentDrawing()
            .setLayerOpacity(curName, 0.5)
        }
      })
    } else {
      curNames.forEach((curName) => {
        this.editor.svgCanvas.getCurrentDrawing().setLayerOpacity(curName, 1.0)
      })
    }
  }

  /**
   * @returns {void}
   */
  populateLayers () {
    this.editor.svgCanvas.clearSelection()
    const self = this
    const layerlist = $id('layerlist').querySelector('tbody')
    while (layerlist.firstChild) { layerlist.removeChild(layerlist.firstChild) }

    $id('selLayerNames').setAttribute('options', '')
    const drawing = this.editor.svgCanvas.getCurrentDrawing()
    const currentLayerName = drawing.getCurrentLayerName()
    let layer = this.editor.svgCanvas.getCurrentDrawing().getNumLayers()
    // we get the layers in the reverse z-order (the layer rendered on top is listed first)
    let values = ''
    let text = ''
    while (layer--) {
      const name = drawing.getLayerName(layer)
      const layerTr = document.createElement('tr')
      layerTr.className = (name === currentLayerName) ? 'layer layersel' : 'layer'
      const layerVis = document.createElement('td')
      layerVis.className = (!drawing.getLayerVisibility(name)) ? 'layerinvis layervis' : 'layervis'

      // fix the eye icon lost at right layers
      const _eye = document.createElement('img')
      _eye.src = './images/eye.svg'
      _eye.style.width = '14px'
      _eye.style.width = '14px'
      layerVis.appendChild(_eye)

      const layerName = document.createElement('td')
      layerName.className = 'layername'
      layerName.textContent = name
      layerTr.appendChild(layerVis)
      layerTr.appendChild(layerName)
      layerlist.appendChild(layerTr)
      values = (values) ? values + '::' + name : name
      text = (text) ? text + ',' + name : name
    }
    $id('selLayerNames').setAttribute('options', text)
    $id('selLayerNames').setAttribute('values', values)
    // handle selection of layer
    const nelements = $id('layerlist').querySelectorAll('td.layername')
    Array.from(nelements).forEach(function (element) {
      element.addEventListener('mouseup', function (evt) {
        const trElements = $id('layerlist').querySelectorAll('tr.layer')
        Array.from(trElements).forEach(function (element) {
          element.classList.remove('layersel')
        })
        evt.currentTarget.parentNode.classList.add('layersel')
        self.editor.svgCanvas.setCurrentLayer(evt.currentTarget.textContent)
        // run extension when different layer is selected from listener
        self.editor.svgCanvas.runExtensions(
          'layersChanged'
        )
        evt.preventDefault()
      })
      element.addEventListener('mouseup', (evt) => {
        self.toggleHighlightLayer(evt.currentTarget.textContent)
      })
      element.addEventListener('mouseout', (_evt) => {
        self.toggleHighlightLayer()
      })
    })
    const elements = $id('layerlist').querySelectorAll('td.layervis')
    Array.from(elements).forEach(function (element) {
      $click(element, function (evt) {
        const ele = evt.currentTarget.parentNode.querySelector('td.layername')
        const name = (ele) ? ele.textContent : ''
        const vis = evt.currentTarget.classList.contains('layerinvis')
        self.editor.svgCanvas.setLayerVisibility(name, vis)
        evt.currentTarget.classList.toggle('layerinvis')
        // run extension if layer visibility is changed from listener
        self.editor.svgCanvas.runExtensions(
          'layerVisChanged'
        )
      })
    })

    // if there were too few rows, let's add a few to make it not so lonely
    let num = 5 - $id('layerlist').querySelectorAll('tr.layer').length
    while (num-- > 0) {
      // TODO: there must a better way to do this
      const tlayer = document.createElement('tr')
      tlayer.innerHTML = '<td style="color:white">_</td><td/>'
      layerlist.append(tlayer)
    }
    // run extension when layer panel is populated
    self.editor.svgCanvas.runExtensions(
      'layersChanged'
    )
  }
}

export default LayersPanel
