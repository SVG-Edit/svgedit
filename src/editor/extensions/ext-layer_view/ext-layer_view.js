/**
 * @file ext-layer_view.js
 *
 * @license MIT
 *
 *
 */

const name = 'layer_view'

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
  async init (_S) {
    const svgEditor = this
    const { svgCanvas } = svgEditor
    const { $id, $click } = svgCanvas
    await loadExtensionTranslation(svgEditor)

    const clickLayerView = (e) => {
      $id('tool_layerView').pressed = !$id('tool_layerView').pressed
      updateLayerView(e)
    }

    const updateLayerView = (e) => {
      const drawing = svgCanvas.getCurrentDrawing()
      const curLayer = drawing.getCurrentLayerName()
      let layer = drawing.getNumLayers()
      while (layer--) {
        const name = drawing.getLayerName(layer)
        if (name !== curLayer && $id('tool_layerView').pressed) {
          drawing.setLayerVisibility(name, false)
        } else {
          drawing.setLayerVisibility(name, true)
        }
      }
      $id('layerlist').querySelectorAll('tr.layer').forEach(
        function (el) {
          const layervis = el.querySelector('td.layervis')
          const vis = el.classList.contains('layersel') || !$id('tool_layerView').pressed ? 'layervis' : 'layerinvis layervis'
          layervis.setAttribute('class', vis)
        }
      )
    }

    return {
      name: svgEditor.i18next.t(`${name}:name`),
      // The callback should be used to load the DOM with the appropriate UI items
      layersChanged () {
        if ($id('tool_layerView').pressed) {
          updateLayerView()
        } if (svgEditor.configObj.curConfig.layerView) {
          svgEditor.configObj.curConfig.layerView = false
          $id('tool_layerView').pressed = true
          updateLayerView()
        }
      },
      layerVisChanged () {
        if ($id('tool_layerView').pressed) {
          $id('tool_layerView').pressed = !$id('tool_layerView').pressed
        }
      },
      callback () {
        const buttonTemplate = document.createElement('template')
        const title = `${name}:buttons.0.title`
        const key = `${name}:buttons.0.key`
        buttonTemplate.innerHTML = `
      <se-button id="tool_layerView" title="${title}" shortcut="${key}" src="layer_view.svg"></se-button>`
        $id('editor_panel').append(buttonTemplate.content.cloneNode(true))
        $click($id('tool_layerView'), clickLayerView.bind(this))
      }
    }
  }
}
