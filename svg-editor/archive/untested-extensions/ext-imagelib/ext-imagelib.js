/* globals seConfirm */
/**
 * @file ext-imagelib.js
 *
 * @license MIT
 *
 * @copyright 2010 Alexis Deveria
 *
 */

const name = 'imagelib'

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
  async init ({ decode64, dropXMLInternalSubset }) {
    const svgEditor = this
    const { $id, $click } = svgEditor.svgCanvas
    const { $svgEditor } = svgEditor
    const { imgPath } = svgEditor.configObj.curConfig

    await loadExtensionTranslation(svgEditor)

    const { svgCanvas } = svgEditor

    const imgLibs = [
      {
        name: svgEditor.i18next.t(`${name}:imgLibs_0_name`),
        url: 'extensions/ext-imagelib/index.html',
        description: svgEditor.i18next.t(`${name}:imgLibs_0_description`)
      }
    ]

    const allowedImageLibOrigins = imgLibs.map(({ url }) => {
      try {
        return new URL(url).origin
      } catch (err) {
        return location.origin
      }
    })

    /**
    *
    * @returns {void}
    */
    const closeBrowser = () => {
      $id('imgbrowse_holder').style.display = 'none'
      document.activeElement.blur() // make sure focus is the body to correct issue #417
    }

    /**
    * @param {string} url
    * @returns {void}
    */
    const importImage = (url) => {
      const newImage = svgCanvas.addSVGElementsFromJson({
        element: 'image',
        attr: {
          x: 0,
          y: 0,
          width: 0,
          height: 0,
          id: svgCanvas.getNextId(),
          style: 'pointer-events:inherit'
        }
      })
      svgCanvas.clearSelection()
      svgCanvas.addToSelection([newImage])
      svgCanvas.setImageURL(url)
    }

    const pending = {}

    let mode = 's'
    let multiArr = []
    let transferStopped = false
    let preview; let submit

    /**
     * Contains the SVG to insert.
     * @typedef {PlainObject} ImageLibMessage
     * @property {"imagelib"} namespace Required to distinguish from any other messages of app.
     * @property {string} href Set to same value as previous `ImageLibMetaMessage` `id`.
     * @property {string} data The response (as an SVG string or URL)
    */

    /**
     * Used for setting meta-data before images are retrieved.
     * @typedef {PlainObject} ImageLibMetaMessage
     * @property {"imagelib"} namespace Required to distinguish from any other messages of app.
     * @property {string} name If the subsequent response is an SVG string or if `preview_url`
     *   is present, will be used as the title for the preview image. When an
     *   SVG string is present, will default to the first `<title>`'s contents or
     *   "(SVG #<Length of response>)" if none is present. Otherwise, if `preview_url`
     *   is present, will default to the empty string. Though `name` may be falsy,
     *   it is always expected to be present for meta messages.
     * @property {string} id Identifier (the expected `href` for a subsequent response message);
     * used for ensuring the subsequent response can be tied to this `ImageLibMetaMessage` object.
     * @property {string} [preview_url] When import mode is multiple, used to set an image
     * source along with the name/title. If the subsequent response is an SVG string
     * and there is no `preview_url`, the default will just be to show the
     * name/title. If the response is not an SVG string, the default will be to
     * show that response (i.e., the URL).
     * @property {string} entry Set automatically with div holding retrieving
     * message (until ready to delete)
     * @todo Should use a separate Map instead of `entry`
    */

    /**
     * @param {PlainObject} cfg
     * @param {string} cfg.origin
     * @param {ImageLibMetaMessage|ImageLibMessage|string} cfg.data String is deprecated when parsed to JSON `ImageLibMessage`
     * @returns {void}
     */
    async function onMessage ({ origin, data }) {
      let response = data
      if (!response || !['string', 'object'].includes(typeof response)) {
        // Do nothing
        return
      }
      let id
      let type
      try {
        // Todo: This block can be removed (and the above check changed to
        //   insist on an object) if embedAPI moves away from a string to
        //   an object (if IE9 support not needed)
        response = typeof response === 'object' ? response : JSON.parse(response)
        if (response.namespace !== 'imagelib') {
          return
        }
        if (!allowedImageLibOrigins.includes('*') && !allowedImageLibOrigins.includes(origin)) {
          // Todo: Surface this error to user?
          console.error(`Origin ${origin} not whitelisted for posting to ${window.origin}`)
          return
        }
        const hasName = 'name' in response
        const hasHref = 'href' in response

        if (!hasName && transferStopped) {
          transferStopped = false
          return
        }

        if (hasHref) {
          id = response.href
          response = response.data
        }

        // Hide possible transfer dialog box
        if (document.querySelector('se-elix-alert-dialog')) {
          document.querySelector('se-elix-alert-dialog').remove()
        }
        type = hasName
          ? 'meta'
          : response.charAt(0)
      } catch (e) {
        // This block is for backward compatibility (for IAN and Openclipart);
        //   should otherwise return
        if (typeof response === 'string') {
          const char1 = response.charAt(0)

          if (char1 !== '{' && transferStopped) {
            transferStopped = false
            return
          }

          if (char1 === '|') {
            const secondpos = response.indexOf('|', 1)
            id = response.substr(1, secondpos - 1)
            response = response.substr(secondpos + 1)
            type = response.charAt(0)
          }
        }
      }

      let entry; let curMeta; let svgStr; let imgStr
      switch (type) {
        case 'meta': {
        // Metadata
          transferStopped = false
          curMeta = response

          // Should be safe to add dynamic property as passed metadata
          pending[curMeta.id] = curMeta // lgtm [js/remote-property-injection]

          const name = (curMeta.name || 'file')

          const message = svgEditor.i18next.t('notification.retrieving').replace('%s', name)

          if (mode !== 'm') {
            await seConfirm(message)
            transferStopped = true
          } else {
            entry = document.createElement('div')
            entry.textContent = message
            entry.dataset.id = curMeta.id
            preview.appendChild(entry)
            curMeta.entry = entry
          }

          return
        }
        case '<':
          svgStr = true
          break
        case 'd': {
          if (response.startsWith('data:image/svg+xml')) {
            const pre = 'data:image/svg+xml;base64,'
            const src = response.substring(pre.length)
            response = decode64(src)
            svgStr = true
            break
          } else if (response.startsWith('data:image/')) {
            imgStr = true
            break
          }
        }
        // Else fall through
        default:
          // TODO: See if there's a way to base64 encode the binary data stream
          // Assume it's raw image data
          // importImage(str);

          // Don't give warning as postMessage may have been used by something else
          if (mode !== 'm') {
            closeBrowser()
          } else {
            pending[id].entry.remove()
          }
          // await alert('Unexpected data was returned: ' + response, function() {
          //   if (mode !== 'm') {
          //     closeBrowser();
          //   } else {
          //     pending[id].entry.remove();
          //   }
          // });
          return
      }

      switch (mode) {
        case 's':
        // Import one
          if (svgStr) {
            svgEditor.svgCanvas.importSvgString(response)
          } else if (imgStr) {
            importImage(response)
          }
          closeBrowser()
          break
        case 'm': {
        // Import multiple
          multiArr.push([(svgStr ? 'svg' : 'img'), response])
          curMeta = pending[id]
          let title
          if (svgStr) {
            if (curMeta?.name) {
              title = curMeta.name
            } else {
            // Try to find a title
            // `dropXMLInternalSubset` is to help prevent the billion laughs attack
              const xml = new DOMParser().parseFromString(dropXMLInternalSubset(response), 'text/xml').documentElement // lgtm [js/xml-bomb]
              title = xml.querySelector('title').textContent || '(SVG #' + response.length + ')'
            }
            if (curMeta) {
              Array.from(preview.children).forEach(function (element) {
                if (element.dataset.id === id) {
                  if (curMeta.preview_url) {
                    const img = document.createElement('img')
                    img.src = curMeta.preview_url
                    const span = document.createElement('span')
                    span.appendChild(img)
                    element.append(span)
                  } else {
                    element.textContent = title
                  }
                  submit.removeAttribute('disabled')
                }
              })
            } else {
              const div = document.createElement('div')
              div.textContent = title
              preview.appendChild(div)
              submit.removeAttribute('disabled')
            }
          } else {
            if (curMeta?.preview_url) {
              title = curMeta.name || ''
              entry = document.createElement('span')
              const img = document.createElement('img')
              img.src = curMeta.preview_url
              entry.appendChild(img)
              entry.appendChild(document.createTextNode(title))
            } else {
              entry = document.createElement('img')
              entry.src = response
            }

            if (curMeta) {
              Array.from(preview.children).forEach(function (element) {
                if (element.dataset.id === id) {
                  element.appendChild(entry)
                  submit.removeAttribute('disabled')
                }
              })
            } else {
              const div = document.createElement('div')
              div.appendChild(entry)
              preview.appendChild(div)
              submit.removeAttribute('disabled')
            }
          }
          break
        } case 'o': {
        // Open
          if (!svgStr) { break }
          closeBrowser()
          const ok = await svgEditor.openPrep()
          if (!ok) { return }
          svgCanvas.clear()
          svgCanvas.setSvgString(response)
          // updateCanvas();
          break
        }
      }
    }

    // Receive `postMessage` data
    window.addEventListener('message', onMessage, true)

    const insertAfter = (referenceNode, newNode) => {
      referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling)
    }

    const toggleMultiLoop = () => {
      multiArr.forEach(function (item, i) {
        const type = item[0]
        const data = item[1]
        if (type === 'svg') {
          svgCanvas.importSvgString(data)
        } else {
          importImage(data)
        }
        svgCanvas.moveSelectedElements(i * 20, i * 20, false)
      })
      while (preview.firstChild) { preview.removeChild(preview.firstChild) }
      multiArr = []
      $id('imgbrowse_holder').style.display = 'none'
    }

    /**
    * @param {boolean} show
    * @returns {void}
    */
    const toggleMulti = (show) => {
      $id('lib_framewrap').style.right = (show ? 200 : 10)
      $id('imglib_opts').style.right = (show ? 200 : 10)
      if (!preview) {
        preview = document.createElement('div')
        preview.setAttribute('id', 'imglib_preview')
        preview.setAttribute('style', 'position: absolute;top: 45px;right: 10px;width: 180px;bottom: 45px;background: #fff;overflow: auto;')
        insertAfter($id('lib_framewrap'), preview)

        submit = document.createElement('button')
        submit.setAttribute('content', 'Import selected')
        submit.setAttribute('disabled', true)
        submit.textContent = 'Import selected'
        submit.setAttribute('style', 'position: absolute;bottom: 10px;right: -10px;')
        $id('imgbrowse').appendChild(submit)
        $click(submit, toggleMultiLoop)
      }
      submit.style.display = (show) ? 'block' : 'none'
      preview.style.display = (show) ? 'block' : 'none'
    }

    /**
    *
    * @returns {void}
    */
    const showBrowser = () => {
      let browser = $id('imgbrowse')
      if (!browser) {
        const div = document.createElement('div')
        div.id = 'imgbrowse_holder'
        div.innerHTML = '<div id=imgbrowse class=toolbar_button></div>'
        insertAfter($svgEditor, div)
        browser = $id('imgbrowse')

        const allLibs = svgEditor.i18next.t(`${name}:select_lib`)

        const divFrameWrap = document.createElement('div')
        divFrameWrap.id = 'lib_framewrap'

        const libOpts = document.createElement('ul')
        libOpts.id = 'imglib_opts'
        browser.append(libOpts)
        const frame = document.createElement('iframe')
        frame.src = 'javascript:0'
        frame.style.display = 'none'
        divFrameWrap.append(frame)
        browser.prepend(divFrameWrap)

        const header = document.createElement('h1')
        browser.prepend(header)
        header.textContent = allLibs
        header.setAttribute('style', 'position: absolute;top: 0px;left: 0px;width: 100%;')

        const button = document.createElement('button')
        button.innerHTML = svgEditor.i18next.t('common.cancel')
        browser.appendChild(button)
        $click(button, function () {
          $id('imgbrowse_holder').style.display = 'none'
        })
        button.setAttribute('style', 'position: absolute;top: 5px;right: 10px;')

        const leftBlock = document.createElement('span')
        leftBlock.setAttribute('style', 'position: absolute;top: 5px;left: 10px;display: inline-flex;')
        browser.appendChild(leftBlock)

        const back = document.createElement('button')
        back.style.visibility = 'hidden'
        back.innerHTML = `<img class="svg_icon" src="${imgPath}/library.svg" alt="icon" width="16" height="16" />` + svgEditor.i18next.t(`${name}:show_list`)
        leftBlock.appendChild(back)
        $click(back, function () {
          frame.setAttribute('src', 'about:blank')
          frame.style.display = 'none'
          libOpts.style.display = 'block'
          header.textContent = allLibs
          back.style.display = 'none'
        })
        back.setAttribute('style', 'margin-right: 5px;')
        back.style.display = 'none'

        const select = document.createElement('select')
        select.innerHTML = '<select><option value=s>' +
          svgEditor.i18next.t(`${name}:import_single`) + '</option><option value=m>' +
          svgEditor.i18next.t(`${name}:import_multi`) + '</option><option value=o>' +
          svgEditor.i18next.t(`${name}:open`) + '</option>'
        leftBlock.appendChild(select)
        select.addEventListener('change', function () {
          mode = this.value
          switch (mode) {
            case 's':
            case 'o':
              toggleMulti(false)
              break

            case 'm':
            // Import multiple
              toggleMulti(true)
              break
          }
        })
        select.setAttribute('style', 'margin-top: 10px;')

        imgLibs.forEach(function ({ name, url, description }) {
          const li = document.createElement('li')
          libOpts.appendChild(li)
          li.textContent = name
          $click(li, function () {
            frame.setAttribute('src', url)
            frame.style.display = 'block'
            header.textContent = name
            libOpts.style.display = 'none'
            back.style.display = 'block'
          })
          const span = document.createElement('span')
          span.textContent = description
          li.appendChild(span)
        })
      } else {
        $id('imgbrowse_holder').style.display = 'block'
      }
    }

    return {
      svgicons: 'ext-imagelib.xml',
      callback () {
        // Add the button and its handler(s)
        const buttonTemplate = document.createElement('template')
        const key = name + ':buttons.0.title'
        buttonTemplate.innerHTML = `
        <se-menu-item id="tool_imagelib" label="${key}" src="library.svg"></se-menu-item>
        `
        insertAfter($id('tool_export'), buttonTemplate.content.cloneNode(true))
        $click($id('tool_imagelib'), () => {
          showBrowser()
        })

        const style = document.createElement('style')
        style.textContent = '#imgbrowse_holder {' +
          'position: absolute;' +
          'top: 0;' +
          'left: 0;' +
          'width: 100%;' +
          'height: 100%;' +
          'background-color: rgba(0, 0, 0, .5);' +
          'z-index: 5;' +
          '}' +
          '#imgbrowse {' +
          'position: absolute;' +
          'top: 25px;' +
          'left: 25px;' +
          'right: 25px;' +
          'bottom: 25px;' +
          'min-width: 300px;' +
          'min-height: 200px;' +
          'background: #5a6162;' +
          'border: 1px outset #777;' +
          '}' +
          '#imgbrowse h1 {' +
          'font-size: 20px;' +
          'margin: .4em;' +
          'text-align: center;' +
          '}' +
          '#lib_framewrap,' +
          '#imgbrowse > ul {' +
          'position: absolute;' +
          'top: 45px;' +
          'left: 10px;' +
          'right: 10px;' +
          'bottom: 10px;' +
          'background: white;' +
          'margin: 0;' +
          'padding: 0;' +
          '}' +
          '#imgbrowse > ul {' +
          'overflow: auto;' +
          '}' +
          '#imgbrowse > div {' +
          'border: 1px solid #666;' +
          '}' +
          '#imglib_preview > div {' +
          'padding: 5px;' +
          'font-size: 12px;' +
          '}' +
          '#imglib_preview img {' +
          'display: block;' +
          'margin: 0 auto;' +
          'max-height: 100px;' +
          '}' +
          '#imgbrowse li {' +
          'list-style: none;' +
          'padding: .5em;' +
          'background: #E8E8E8;' +
          'border-bottom: 1px solid #5a6162;' +
          'line-height: 1.2em;' +
          'font-style: sans-serif;' +
          '}' +
          '#imgbrowse li > span {' +
          'color: #666;' +
          'font-size: 15px;' +
          'display: block;' +
          '}' +
          '#imgbrowse li:hover {' +
          'background: #FFC;' +
          'cursor: pointer;' +
          '}' +
          '#imgbrowse iframe {' +
          'width: 100%;' +
          'height: 100%;' +
          'border: 0;' +
          '}'
        document.head.appendChild(style)
      }
    }
  }
}
