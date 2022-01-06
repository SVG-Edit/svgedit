/**
 * @file ext-eyedropper.js
 *
 * @license MIT
 *
 * @copyright 2010 Jeff Schiller
 * @copyright 2021 OptimistikSAS
 *
 */

const name = 'eyedropper'

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
  async init () {
    const svgEditor = this
    const { svgCanvas } = svgEditor
    await loadExtensionTranslation(svgEditor)
    const { ChangeElementCommand } = svgCanvas.history
    // svgdoc = S.svgroot.parentNode.ownerDocument,
    const addToHistory = (cmd) => { svgCanvas.undoMgr.addCommandToHistory(cmd) }
    const currentStyle = {
      fillPaint: 'red',
      fillOpacity: 1.0,
      strokePaint: 'black',
      strokeOpacity: 1.0,
      strokeWidth: 5,
      strokeDashArray: null,
      opacity: 1.0,
      strokeLinecap: 'butt',
      strokeLinejoin: 'miter'
    }
    const { $id, $click } = svgCanvas

    /**
     *
     * @param {module:svgcanvas.SvgCanvas#event:ext_selectedChanged|module:svgcanvas.SvgCanvas#event:ext_elementChanged} opts
     * @returns {void}
     */
    const getStyle = (opts) => {
      // if we are in eyedropper mode, we don't want to disable the eye-dropper tool
      const mode = svgCanvas.getMode()
      if (mode === 'eyedropper') { return }

      const tool = $id('tool_eyedropper')
      // enable-eye-dropper if one element is selected
      let elem = null
      if (!opts.multiselected && opts.elems[0] &&
        !['svg', 'g', 'use'].includes(opts.elems[0].nodeName)
      ) {
        elem = opts.elems[0]
        tool.classList.remove('disabled')
        // grab the current style
        currentStyle.fillPaint = elem.getAttribute('fill') || 'black'
        currentStyle.fillOpacity = elem.getAttribute('fill-opacity') || 1.0
        currentStyle.strokePaint = elem.getAttribute('stroke')
        currentStyle.strokeOpacity = elem.getAttribute('stroke-opacity') || 1.0
        currentStyle.strokeWidth = elem.getAttribute('stroke-width')
        currentStyle.strokeDashArray = elem.getAttribute('stroke-dasharray')
        currentStyle.strokeLinecap = elem.getAttribute('stroke-linecap')
        currentStyle.strokeLinejoin = elem.getAttribute('stroke-linejoin')
        currentStyle.opacity = elem.getAttribute('opacity') || 1.0
        // disable eye-dropper tool
      } else {
        tool.classList.add('disabled')
      }
    }

    return {
      name: svgEditor.i18next.t(`${name}:name`),
      callback () {
        // Add the button and its handler(s)
        const title = `${name}:buttons.0.title`
        const key = `${name}:buttons.0.key`
        const buttonTemplate = `
        <se-button id="tool_eyedropper" title="${title}" src="eye_dropper.svg" shortcut=${key}></se-button>
        `
        svgCanvas.insertChildAtIndex($id('tools_left'), buttonTemplate, 12)
        $click($id('tool_eyedropper'), () => {
          if (this.leftPanel.updateLeftPanel('tool_eyedropper')) {
            svgCanvas.setMode('eyedropper')
          }
        })
      },
      // if we have selected an element, grab its paint and enable the eye dropper button
      selectedChanged: getStyle,
      elementChanged: getStyle,
      mouseDown (opts) {
        const mode = svgCanvas.getMode()
        if (mode === 'eyedropper') {
          const e = opts.event
          const { target } = e
          if (!['svg', 'g', 'use'].includes(target.nodeName)) {
            const changes = {}

            const change = function (elem, attrname, newvalue) {
              changes[attrname] = elem.getAttribute(attrname)
              elem.setAttribute(attrname, newvalue)
            }

            if (currentStyle.fillPaint) { change(target, 'fill', currentStyle.fillPaint) }
            if (currentStyle.fillOpacity) { change(target, 'fill-opacity', currentStyle.fillOpacity) }
            if (currentStyle.strokePaint) { change(target, 'stroke', currentStyle.strokePaint) }
            if (currentStyle.strokeOpacity) { change(target, 'stroke-opacity', currentStyle.strokeOpacity) }
            if (currentStyle.strokeWidth) { change(target, 'stroke-width', currentStyle.strokeWidth) }
            if (currentStyle.strokeDashArray) { change(target, 'stroke-dasharray', currentStyle.strokeDashArray) }
            if (currentStyle.opacity) { change(target, 'opacity', currentStyle.opacity) }
            if (currentStyle.strokeLinecap) { change(target, 'stroke-linecap', currentStyle.strokeLinecap) }
            if (currentStyle.strokeLinejoin) { change(target, 'stroke-linejoin', currentStyle.strokeLinejoin) }

            addToHistory(new ChangeElementCommand(target, changes))
          }
        }
      }
    }
  }
}
