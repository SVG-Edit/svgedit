/**
 * @file ext-tactile.js
 *
 * @license MIT
 *
 * @copyright 2010 Jeff Schiller
 * @copyright 2021 OptimistikSAS
 *
 */

const name = 'tactile'

const loadExtensionTranslation = async function (svgEditor) {
  let translationModule
  const lang = svgEditor.configObj.pref('lang')
  try {
    translationModule = await import(`./locale/${lang}.js`)
  } catch (_error) {
    console.warn(`Missing translation (${lang}) for ${name} - using 'en'`)
    translationModule = await import('../ext-tactile/locale/en.js')
  }
  svgEditor.i18next.addResourceBundle(lang, name, translationModule.default)
}

export default {
  name,
  async init () {
    const svgEditor = this
    const { svgCanvas } = svgEditor
    const svgroot = svgCanvas.getSvgRoot()
    await loadExtensionTranslation(svgEditor)
    const { ChangeElementCommand } = svgCanvas.history
    // svgdoc = S.svgroot.parentNode.ownerDocument,
    const addToHistory = (cmd) => { svgCanvas.undoMgr.addCommandToHistory(cmd) }
    const { $id, $click } = svgCanvas

    return {
      name: svgEditor.i18next.t(`${name}:name`),
      callback () {
        // Add the button and its handler(s)
        const title = `${name}:buttons.0.main_title`
        const guidance_title = `${name}:buttons.0.guidance_title`
        const zoomLvl_title = `${name}:buttons.0.zoomLvl_title`
        const label_title = `${name}:buttons.0.label_title`
        const buttonTemplate = `
        <se-flyingbutton id="tools_guidance" title="${title}">
          <se-button id="tool_guidance" title="${guidance_title}" src="guide.svg"></se-button>
          <se-button id="tool_setZoomLvl" title="${zoomLvl_title}" src="zoomLvl.svg"></se-button>
          <se-button id="tool_label" title="${label_title}" src="label.svg"></se-button>
        </se-flyingbutton>
        `
        svgCanvas.insertChildAtIndex($id('tools_left'), buttonTemplate, 12)
        
        $click($id('tool_guidance'), () => {
          if (this.leftPanel.updateLeftPanel('tool_guidance')) {
            svgCanvas.setMode('guidance')
          }
        })
        $click($id('tool_setZoomLvl'), () => {
          if (this.leftPanel.updateLeftPanel('tool_setZoomLvl')) {
            svgCanvas.setMode('zoomLvl')
          }
        })
        $click($id('tool_label'), () => {
          if (this.leftPanel.updateLeftPanel('tool_label')) {
            svgCanvas.setMode('label')
          }
        })
      }
    }
  }
}

