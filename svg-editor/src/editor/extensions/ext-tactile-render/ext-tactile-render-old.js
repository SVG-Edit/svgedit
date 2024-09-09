/**
 * @file ext-tactile-render.js
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
    const { $id, $click } = svgCanvas


    return {
      name: svgEditor.i18next.t(`${name}:name`),
      callback () {
        // Add the button and its handler(s)
        const title = `${name}:buttons.0.title`
        const key = `${name}:buttons.0.key`
        const buttonTemplate = `
        <se-button id="tool_tactile" title="${title}" src="tactile.svg" shortcut=${key}></se-button>
        `
        svgCanvas.insertChildAtIndex($id('tools_left'), buttonTemplate, 12)
        $click($id('tool_tactile'), () => {
          if (this.leftPanel.updateLeftPanel('tool_tactile')) {
            svgCanvas.setMode('tactile')
            $id('tool_tactile').pressed = !$id('tool_tactile').pressed
            let xhr = new XMLHttpRequest();
            xhr.open("POST", "http://ven1998.pythonanywhere.com/render");
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.setRequestHeader("Access-Control-Allow-Origin", '*');
            xhr.setRequestHeader("Access-Control-Allow-Methods", "DELETE, POST, GET, OPTIONS");
            xhr.setRequestHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
            xhr.setRequestHeader('Access-Control-Allow-Credentials', 'true')
            xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
              console.warn(xhr.status);
              console.warn(xhr.responseText);
            }};
            let svgString= svgCanvas.getSvgString().replaceAll("data-image-label", "aria-label").replaceAll("data-image-description", "aria-description");
            xhr.send(JSON.stringify({"data": "data:image/svg+xml;base64,"+window.btoa(svgString)}));
          }
        })
      }
    }
  }
}

