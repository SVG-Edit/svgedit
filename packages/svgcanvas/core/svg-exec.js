/**
 * Tools for svg.
 * @module svg
 * @license MIT
 * @copyright 2011 Jeff Schiller
 */

import { jsPDF as JsPDF } from 'jspdf/dist/jspdf.es.min.js'
import 'svg2pdf.js/dist/svg2pdf.es.js'
import html2canvas from 'html2canvas'
import * as hstry from './history.js'
import {
  text2xml,
  cleanupElement,
  findDefs,
  getHref,
  preventClickDefault,
  toXml,
  getStrokedBBoxDefaultVisible,
  createObjectURL,
  dataURLToObjectURL,
  walkTree,
  getBBox as utilsGetBBox,
  hashCode
} from './utilities.js'
import { transformPoint, transformListToTransform } from './math.js'
import { convertUnit, shortFloat, convertToNum } from './units.js'
import { isGecko, isChrome, isWebkit } from '../common/browser.js'
import * as pathModule from './path.js'
import { NS } from './namespaces.js'
import * as draw from './draw.js'
import { recalculateDimensions } from './recalculate.js'
import { getParents, getClosest } from '../common/util.js'

const {
  InsertElementCommand,
  RemoveElementCommand,
  ChangeElementCommand,
  BatchCommand
} = hstry

let svgCanvas = null

/**
 * @function module:svg-exec.init
 * @param {module:svg-exec.SvgCanvas#init} svgContext
 * @returns {void}
 */
export const init = canvas => {
  svgCanvas = canvas
  svgCanvas.setSvgString = setSvgString
  svgCanvas.importSvgString = importSvgString
  svgCanvas.uniquifyElems = uniquifyElemsMethod
  svgCanvas.setUseData = setUseDataMethod
  svgCanvas.convertGradients = convertGradientsMethod
  svgCanvas.removeUnusedDefElems = removeUnusedDefElemsMethod // remove DOM elements inside the `<defs>` if they are notreferred to,
  svgCanvas.svgCanvasToString = svgCanvasToString // Main function to set up the SVG content for output.
  svgCanvas.svgToString = svgToString // Sub function ran on each SVG element to convert it to a string as desired.
  svgCanvas.embedImage = embedImage // Converts a given image file to a data URL when possibl
  svgCanvas.rasterExport = rasterExport // Generates a PNG (or JPG, BMP, WEBP) Data URL based on the current image
  svgCanvas.exportPDF = exportPDF // Generates a PDF based on the current image, then calls "exportedPDF"
}

/**
 * Main function to set up the SVG content for output.
 * @function module:svgcanvas.SvgCanvas#svgCanvasToString
 * @returns {string} The SVG image for output
 */
const svgCanvasToString = () => {
  // keep calling it until there are none to remove
  while (svgCanvas.removeUnusedDefElems() > 0) {} // eslint-disable-line no-empty

  svgCanvas.pathActions.clear(true)

  // Keep SVG-Edit comment on top
  const childNodesElems = svgCanvas.getSvgContent().childNodes
  childNodesElems.forEach((node, i) => {
    if (i && node.nodeType === 8 && node.data.includes('Created with')) {
      svgCanvas.getSvgContent().firstChild.before(node)
    }
  })

  // Move out of in-group editing mode
  if (svgCanvas.getCurrentGroup()) {
    draw.leaveContext()
    svgCanvas.selectOnly([svgCanvas.getCurrentGroup()])
  }

  const nakedSvgs = []

  // Unwrap gsvg if it has no special attributes (only id and style)
  const gsvgElems = svgCanvas.getSvgContent().querySelectorAll('g[data-gsvg]')
  Array.prototype.forEach.call(gsvgElems, (element) => {
    const attrs = element.attributes
    let len = attrs.length
    for (let i = 0; i < len; i++) {
      if (attrs[i].nodeName === 'id' || attrs[i].nodeName === 'style') {
        len--
      }
    }
    // No significant attributes, so ungroup
    if (len <= 0) {
      const svg = element.firstChild
      nakedSvgs.push(svg)
      element.replaceWith(svg)
    }
  })
  const output = svgCanvas.svgToString(svgCanvas.getSvgContent(), 0)

  // Rewrap gsvg
  if (nakedSvgs.length) {
    Array.prototype.forEach.call(nakedSvgs, (el) => {
      svgCanvas.groupSvgElem(el)
    })
  }

  return output
}

/**
 * Sub function ran on each SVG element to convert it to a string as desired.
 * @function module:svgcanvas.SvgCanvas#svgToString
 * @param {Element} elem - The SVG element to convert
 * @param {Integer} indent - Number of spaces to indent this tag
 * @returns {string} The given element as an SVG tag
 */
const svgToString = (elem, indent) => {
  const curConfig = svgCanvas.getCurConfig()
  const nsMap = svgCanvas.getNsMap()
  const out = []
  const unit = curConfig.baseUnit
  const unitRe = new RegExp('^-?[\\d\\.]+' + unit + '$')

  if (elem) {
    cleanupElement(elem)
    const attrs = [...elem.attributes]
    const childs = elem.childNodes
    attrs.sort((a, b) => {
      return a.name > b.name ? -1 : 1
    })

    for (let i = 0; i < indent; i++) {
      out.push(' ')
    }
    out.push('<')
    out.push(elem.nodeName)
    if (elem.id === 'svgcontent') {
      // Process root element separately
      const res = svgCanvas.getResolution()

      let vb = ''
      // TODO: Allow this by dividing all values by current baseVal
      // Note that this also means we should properly deal with this on import
      // if (curConfig.baseUnit !== 'px') {
      //   const unit = curConfig.baseUnit;
      //   const unitM = getTypeMap()[unit];
      //   res.w = shortFloat(res.w / unitM);
      //   res.h = shortFloat(res.h / unitM);
      //   vb = ' viewBox="' + [0, 0, res.w, res.h].join(' ') + '"';
      //   res.w += unit;
      //   res.h += unit;
      // }
      if (curConfig.dynamicOutput) {
        vb = elem.getAttribute('viewBox')
        out.push(
          ' viewBox="' +
            vb +
            '" xmlns="' +
            NS.SVG +
            '"'
        )
      } else {
        if (unit !== 'px') {
          res.w = convertUnit(res.w, unit) + unit
          res.h = convertUnit(res.h, unit) + unit
        }
        out.push(
          ' width="' +
            res.w +
            '" height="' +
            res.h +
            '" xmlns="' +
            NS.SVG +
            '"'
        )
      }

      const nsuris = {}

      // Check elements for namespaces, add if found
      const csElements = elem.querySelectorAll('*')
      const cElements = Array.prototype.slice.call(csElements)
      cElements.push(elem)
      Array.prototype.forEach.call(cElements, (el) => {
        // const el = this;
        // for some elements have no attribute
        const uri = el.namespaceURI
        if (
          uri &&
          !nsuris[uri] &&
          nsMap[uri] &&
          nsMap[uri] !== 'xmlns' &&
          nsMap[uri] !== 'xml'
        ) {
          nsuris[uri] = true
          out.push(' xmlns:' + nsMap[uri] + '="' + uri + '"')
        }
        if (el.attributes.length > 0) {
          for (const [, attr] of Object.entries(el.attributes)) {
            const u = attr.namespaceURI
            if (u && !nsuris[u] && nsMap[u] !== 'xmlns' && nsMap[u] !== 'xml') {
              nsuris[u] = true
              out.push(' xmlns:' + nsMap[u] + '="' + u + '"')
            }
          }
        }
      })

      let i = attrs.length
      const attrNames = [
        'width',
        'height',
        'xmlns',
        'x',
        'y',
        'viewBox',
        'id',
        'overflow'
      ]
      while (i--) {
        const attr = attrs[i]
        const attrVal = toXml(attr.value)

        // Namespaces have already been dealt with, so skip
        if (attr.nodeName.startsWith('xmlns:')) {
          continue
        }

        // only serialize attributes we don't use internally
        if (
          attrVal !== '' &&
          !attrNames.includes(attr.localName) &&
          (!attr.namespaceURI || nsMap[attr.namespaceURI])
        ) {
          out.push(' ')
          out.push(attr.nodeName)
          out.push('="')
          out.push(attrVal)
          out.push('"')
        }
      }
    } else {
      // Skip empty defs
      if (elem.nodeName === 'defs' && !elem.firstChild) {
        return ''
      }

      const mozAttrs = ['-moz-math-font-style', '_moz-math-font-style']
      for (let i = attrs.length - 1; i >= 0; i--) {
        const attr = attrs[i]
        let attrVal = toXml(attr.value)
        // remove bogus attributes added by Gecko
        if (mozAttrs.includes(attr.localName)) {
          continue
        }
        if (attrVal === 'null') {
          const styleName = attr.localName.replace(/-[a-z]/g, s =>
            s[1].toUpperCase()
          )
          if (Object.prototype.hasOwnProperty.call(elem.style, styleName)) {
            continue
          }
        }
        if (attrVal !== '') {
          if (attrVal.startsWith('pointer-events')) {
            continue
          }
          if (attr.localName === 'class' && attrVal.startsWith('se_')) {
            continue
          }
          out.push(' ')
          if (attr.localName === 'd') {
            attrVal = svgCanvas.pathActions.convertPath(elem, true)
          }
          if (!isNaN(attrVal)) {
            attrVal = shortFloat(attrVal)
          } else if (unitRe.test(attrVal)) {
            attrVal = shortFloat(attrVal) + unit
          }

          // Embed images when saving
          if (
            svgCanvas.getSvgOptionApply() &&
            elem.nodeName === 'image' &&
            attr.localName === 'href' &&
            svgCanvas.getSvgOptionImages() &&
            svgCanvas.getSvgOptionImages() === 'embed'
          ) {
            const img = svgCanvas.getEncodableImages(attrVal)
            if (img) {
              attrVal = img
            }
          }

          // map various namespaces to our fixed namespace prefixes
          // (the default xmlns attribute itself does not get a prefix)
          if (
            !attr.namespaceURI ||
            attr.namespaceURI === NS.SVG ||
            nsMap[attr.namespaceURI]
          ) {
            out.push(attr.nodeName)
            out.push('="')
            out.push(attrVal)
            out.push('"')
          }
        }
      }
    }

    if (elem.hasChildNodes()) {
      out.push('>')
      indent++
      let bOneLine = false

      for (let i = 0; i < childs.length; i++) {
        const child = childs.item(i)
        switch (child.nodeType) {
          case 1: // element node
            out.push('\n')
            out.push(svgCanvas.svgToString(child, indent))
            break
          case 3: {
            // text node
            const str = child.nodeValue.replace(/^\s+|\s+$/g, '')
            if (str !== '') {
              bOneLine = true
              out.push(String(toXml(str)))
            }
            break
          }
          case 4: // cdata node
            out.push('\n')
            out.push(new Array(indent + 1).join(' '))
            out.push('<![CDATA[')
            out.push(child.nodeValue)
            out.push(']]>')
            break
          case 8: // comment
            out.push('\n')
            out.push(new Array(indent + 1).join(' '))
            out.push('<!--')
            out.push(child.data)
            out.push('-->')
            break
        } // switch on node type
      }
      indent--
      if (!bOneLine) {
        out.push('\n')
        for (let i = 0; i < indent; i++) {
          out.push(' ')
        }
      }
      out.push('</')
      out.push(elem.nodeName)
      out.push('>')
    } else {
      out.push('/>')
    }
  }
  return out.join('')
} // end svgToString()

/**
 * This function sets the current drawing as the input SVG XML.
 * @function module:svgcanvas.SvgCanvas#setSvgString
 * @param {string} xmlString - The SVG as XML text.
 * @param {boolean} [preventUndo=false] - Indicates if we want to do the
 * changes without adding them to the undo stack - e.g. for initializing a
 * drawing on page load.
 * @fires module:svgcanvas.SvgCanvas#event:setnonce
 * @fires module:svgcanvas.SvgCanvas#event:unsetnonce
 * @fires module:svgcanvas.SvgCanvas#event:changed
 * @returns {boolean} This function returns `false` if the set was
 *     unsuccessful, `true` otherwise.
 */
const setSvgString = (xmlString, preventUndo) => {
  const curConfig = svgCanvas.getCurConfig()
  const dataStorage = svgCanvas.getDataStorage()
  try {
    // convert string into XML document
    const newDoc = text2xml(xmlString)
    if (
      newDoc.firstElementChild &&
      newDoc.firstElementChild.namespaceURI !== NS.SVG
    ) {
      return false
    }

    svgCanvas.prepareSvg(newDoc)

    const batchCmd = new BatchCommand('Change Source')

    // remove old svg document
    const { nextSibling } = svgCanvas.getSvgContent()

    svgCanvas.getSvgContent().remove()
    const oldzoom = svgCanvas.getSvgContent()
    batchCmd.addSubCommand(
      new RemoveElementCommand(oldzoom, nextSibling, svgCanvas.getSvgRoot())
    )

    // set new svg document
    // If DOM3 adoptNode() available, use it. Otherwise fall back to DOM2 importNode()
    if (svgCanvas.getDOMDocument().adoptNode) {
      svgCanvas.setSvgContent(
        svgCanvas.getDOMDocument().adoptNode(newDoc.documentElement)
      )
    } else {
      svgCanvas.setSvgContent(
        svgCanvas.getDOMDocument().importNode(newDoc.documentElement, true)
      )
    }

    svgCanvas.getSvgRoot().append(svgCanvas.getSvgContent())
    const content = svgCanvas.getSvgContent()

    svgCanvas.current_drawing_ = new draw.Drawing(
      svgCanvas.getSvgContent(),
      svgCanvas.getIdPrefix()
    )

    // retrieve or set the nonce
    const nonce = svgCanvas.getCurrentDrawing().getNonce()
    if (nonce) {
      svgCanvas.call('setnonce', nonce)
    } else {
      svgCanvas.call('unsetnonce')
    }

    // change image href vals if possible
    const elements = content.querySelectorAll('image')
    Array.prototype.forEach.call(elements, (image) => {
      preventClickDefault(image)
      const val = svgCanvas.getHref(image)
      if (val) {
        if (val.startsWith('data:')) {
          // Check if an SVG-edit data URI
          const m = val.match(/svgedit_url=(.*?);/)
          // const m = val.match(/svgedit_url=(?<url>.*?);/);
          if (m) {
            const url = decodeURIComponent(m[1])
            // const url = decodeURIComponent(m.groups.url);
            const iimg = new Image()
            iimg.addEventListener('load', () => {
              image.setAttributeNS(NS.XLINK, 'xlink:href', url)
            })
            iimg.src = url
          }
        }
        // Add to encodableImages if it loads
        svgCanvas.embedImage(val)
      }
    })
    // Duplicate id replace changes
    const nodes = content.querySelectorAll('[id]')
    const ids = {}
    const totalNodes = nodes.length

    for (let i = 0; i < totalNodes; i++) {
      const currentId = nodes[i].id ? nodes[i].id : 'undefined'
      if (isNaN(ids[currentId])) {
        ids[currentId] = 0
      }
      ids[currentId]++
    }

    Object.entries(ids).forEach(([key, value]) => {
      if (value > 1) {
        const nodes = content.querySelectorAll('[id="' + key + '"]')
        for (let i = 1; i < nodes.length; i++) {
          nodes[i].setAttribute('id', svgCanvas.getNextId())
        }
      }
    })

    // Wrap child SVGs in group elements
    const svgElements = content.querySelectorAll('svg')
    Array.prototype.forEach.call(svgElements, (element) => {
      // Skip if it's in a <defs>
      if (getClosest(element.parentNode, 'defs')) {
        return
      }

      svgCanvas.uniquifyElems(element)

      // Check if it already has a gsvg group
      const pa = element.parentNode
      if (pa.childNodes.length === 1 && pa.nodeName === 'g') {
        dataStorage.put(pa, 'gsvg', element)
        pa.id = pa.id || svgCanvas.getNextId()
      } else {
        svgCanvas.groupSvgElem(element)
      }
    })

    // For Firefox: Put all paint elems in defs
    if (isGecko()) {
      const svgDefs = findDefs()
      const findElems = content.querySelectorAll(
        'linearGradient, radialGradient, pattern'
      )
      Array.prototype.forEach.call(findElems, (ele) => {
        svgDefs.appendChild(ele)
      })
    }

    // Set ref element for <use> elements

    // TODO: This should also be done if the object is re-added through "redo"
    svgCanvas.setUseData(content)

    svgCanvas.convertGradients(content)

    const attrs = {
      id: 'svgcontent',
      overflow: curConfig.show_outside_canvas ? 'visible' : 'hidden'
    }

    let percs = false

    // determine proper size
    if (content.getAttribute('viewBox')) {
      const viBox = content.getAttribute('viewBox')
      const vb = viBox.split(' ')
      attrs.width = vb[2]
      attrs.height = vb[3]
      // handle content that doesn't have a viewBox
    } else {
      ;['width', 'height'].forEach((dim) => {
        // Set to 100 if not given
        const val = content.getAttribute(dim) || '100%'
        if (String(val).substr(-1) === '%') {
          // Use user units if percentage given
          percs = true
        } else {
          attrs[dim] = convertToNum(dim, val)
        }
      })
    }

    // identify layers
    draw.identifyLayers()

    // Give ID for any visible layer children missing one
    const chiElems = content.children
    Array.prototype.forEach.call(chiElems, (chiElem) => {
      const visElems = chiElem.querySelectorAll(svgCanvas.getVisElems())
      Array.prototype.forEach.call(visElems, (elem) => {
        if (!elem.id) {
          elem.id = svgCanvas.getNextId()
        }
      })
    })

    // Percentage width/height, so let's base it on visible elements
    if (percs) {
      const bb = getStrokedBBoxDefaultVisible()
      attrs.width = bb.width + bb.x
      attrs.height = bb.height + bb.y
    }

    // Just in case negative numbers are given or
    // result from the percs calculation
    if (attrs.width <= 0) {
      attrs.width = 100
    }
    if (attrs.height <= 0) {
      attrs.height = 100
    }

    for (const [key, value] of Object.entries(attrs)) {
      content.setAttribute(key, value)
    }
    svgCanvas.contentW = attrs.width
    svgCanvas.contentH = attrs.height

    batchCmd.addSubCommand(new InsertElementCommand(svgCanvas.getSvgContent()))
    // update root to the correct size
    const width = content.getAttribute('width')
    const height = content.getAttribute('height')
    const changes = { width, height }
    batchCmd.addSubCommand(
      new ChangeElementCommand(svgCanvas.getSvgRoot(), changes)
    )

    // reset zoom
    svgCanvas.setZoom(1)

    svgCanvas.clearSelection()
    pathModule.clearData()
    svgCanvas.getSvgRoot().append(svgCanvas.selectorManager.selectorParentGroup)

    if (!preventUndo) svgCanvas.addCommandToHistory(batchCmd)
    svgCanvas.call('sourcechanged', [svgCanvas.getSvgContent()])
  } catch (e) {
    console.error(e)
    return false
  }

  return true
}

/**
 * This function imports the input SVG XML as a `<symbol>` in the `<defs>`, then adds a
 * `<use>` to the current layer.
 * @function module:svgcanvas.SvgCanvas#importSvgString
 * @param {string} xmlString - The SVG as XML text.
 * @param {boolean} preserveDimension - A boolean to force to preserve initial dimension of the imported svg (force svgEdit don't apply a transformation on the imported svg)
 * @fires module:svgcanvas.SvgCanvas#event:changed
 * @returns {null|Element} This function returns null if the import was unsuccessful, or the element otherwise.
 * @todo
 * - properly handle if namespace is introduced by imported content (must add to svgcontent
 * and update all prefixes in the imported node)
 * - properly handle recalculating dimensions, `recalculateDimensions()` doesn't handle
 * arbitrary transform lists, but makes some assumptions about how the transform list
 * was obtained
 */
const importSvgString = (xmlString, preserveDimension) => {
  const dataStorage = svgCanvas.getDataStorage()
  let j
  let ts
  let useEl
  try {
    // Get unique ID
    const uid = hashCode(xmlString)

    let useExisting = false
    // Look for symbol and make sure symbol exists in image
    if (svgCanvas.getImportIds(uid) && svgCanvas.getImportIds(uid).symbol) {
      const parents = getParents(svgCanvas.getImportIds(uid).symbol, '#svgroot')
      if (parents?.length) {
        useExisting = true
      }
    }

    const batchCmd = new BatchCommand('Import Image')
    let symbol
    if (useExisting) {
      symbol = svgCanvas.getImportIds(uid).symbol
      ts = svgCanvas.getImportIds(uid).xform
    } else {
      // convert string into XML document
      const newDoc = text2xml(xmlString)

      svgCanvas.prepareSvg(newDoc)

      // import new svg document into our document
      // If DOM3 adoptNode() available, use it. Otherwise fall back to DOM2 importNode()
      const svg = svgCanvas.getDOMDocument().adoptNode
        ? svgCanvas.getDOMDocument().adoptNode(newDoc.documentElement)
        : svgCanvas.getDOMDocument().importNode(newDoc.documentElement, true)

      svgCanvas.uniquifyElems(svg)

      const innerw = convertToNum('width', svg.getAttribute('width'))
      const innerh = convertToNum('height', svg.getAttribute('height'))
      const innervb = svg.getAttribute('viewBox')
      // if no explicit viewbox, create one out of the width and height
      const vb = innervb ? innervb.split(' ') : [0, 0, innerw, innerh]
      for (j = 0; j < 4; ++j) {
        vb[j] = Number(vb[j])
      }

      // TODO: properly handle preserveAspectRatio
      const // canvasw = +svgContent.getAttribute('width'),
        canvash = Number(svgCanvas.getSvgContent().getAttribute('height'))
      // imported content should be 1/3 of the canvas on its largest dimension

      ts =
        innerh > innerw
          ? 'scale(' + canvash / 3 / vb[3] + ')'
          : 'scale(' + canvash / 3 / vb[2] + ')'

      // Hack to make recalculateDimensions understand how to scale
      ts = 'translate(0) ' + ts + ' translate(0)'

      symbol = svgCanvas.getDOMDocument().createElementNS(NS.SVG, 'symbol')
      const defs = findDefs()

      if (isGecko()) {
        // Move all gradients into root for Firefox, workaround for this bug:
        // https://bugzilla.mozilla.org/show_bug.cgi?id=353575
        // TODO: Make this properly undo-able.
        const elements = svg.querySelectorAll(
          'linearGradient, radialGradient, pattern'
        )
        Array.prototype.forEach.call(elements, (el) => {
          defs.appendChild(el)
        })
      }

      while (svg.firstChild) {
        const first = svg.firstChild
        symbol.append(first)
      }
      const attrs = svg.attributes
      for (const attr of attrs) {
        // Ok for `NamedNodeMap`
        symbol.setAttribute(attr.nodeName, attr.value)
      }
      symbol.id = svgCanvas.getNextId()

      // Store data
      svgCanvas.setImportIds(uid, {
        symbol,
        xform: ts
      })

      findDefs().append(symbol)
      batchCmd.addSubCommand(new InsertElementCommand(symbol))
    }

    useEl = svgCanvas.getDOMDocument().createElementNS(NS.SVG, 'use')
    useEl.id = svgCanvas.getNextId()
    svgCanvas.setHref(useEl, '#' + symbol.id)
    ;(
      svgCanvas.getCurrentGroup() ||
      svgCanvas.getCurrentDrawing().getCurrentLayer()
    ).append(useEl)
    batchCmd.addSubCommand(new InsertElementCommand(useEl))
    svgCanvas.clearSelection()

    if (!preserveDimension) {
      useEl.setAttribute('transform', ts)
      recalculateDimensions(useEl)
    }
    dataStorage.put(useEl, 'symbol', symbol)
    dataStorage.put(useEl, 'ref', symbol)
    svgCanvas.addToSelection([useEl])

    // TODO: Find way to add this in a recalculateDimensions-parsable way
    // if (vb[0] !== 0 || vb[1] !== 0) {
    //   ts = 'translate(' + (-vb[0]) + ',' + (-vb[1]) + ') ' + ts;
    // }
    svgCanvas.addCommandToHistory(batchCmd)
    svgCanvas.call('changed', [svgCanvas.getSvgContent()])
  } catch (e) {
    console.error(e)
    return null
  }

  // we want to return the element so we can automatically select it
  return useEl
}
/**
 * Function to run when image data is found.
 * @callback module:svgcanvas.ImageEmbeddedCallback
 * @param {string|false} result Data URL
 * @returns {void}
 */
/**
 * Converts a given image file to a data URL when possible, then runs a given callback.
 * @function module:svgcanvas.SvgCanvas#embedImage
 * @param {string} src - The path/URL of the image
 * @returns {Promise<string|false>} Resolves to a Data URL (string|false)
 */
const embedImage = (src) => {
  // Todo: Remove this Promise in favor of making an async/await `Image.load` utility
  return new Promise((resolve, reject) => {
    // load in the image and once it's loaded, get the dimensions
    const imgI = new Image()
    imgI.addEventListener('load', e => {
      // create a canvas the same size as the raster image
      const cvs = document.createElement('canvas')
      cvs.width = e.currentTarget.width
      cvs.height = e.currentTarget.height
      // load the raster image into the canvas
      cvs.getContext('2d').drawImage(e.currentTarget, 0, 0)
      // retrieve the data: URL
      try {
        let urldata = ';svgedit_url=' + encodeURIComponent(src)
        urldata = cvs.toDataURL().replace(';base64', urldata + ';base64')
        svgCanvas.setEncodableImages(src, urldata)
      } catch (e) {
        svgCanvas.setEncodableImages(src, false)
      }
      svgCanvas.setGoodImage(src)
      resolve(svgCanvas.getEncodableImages(src))
    })
    imgI.addEventListener('error', e => {
      reject(
        new Error(
          `error loading image: ${e.currentTarget.attributes.src.value}`
        )
      )
    })
    imgI.setAttribute('src', src)
  })
}

/**
 * @typedef {PlainObject} module:svgcanvas.IssuesAndCodes
 * @property {string[]} issueCodes The locale-independent code names
 * @property {string[]} issues The localized descriptions
 */

/**
 * Codes only is useful for locale-independent detection.
 * @returns {module:svgcanvas.IssuesAndCodes}
 */
const getIssues = () => {
  const uiStrings = svgCanvas.getUIStrings()
  // remove the selected outline before serializing
  svgCanvas.clearSelection()

  // Check for known CanVG issues
  const issues = []
  const issueCodes = []

  // Selector and notice
  const issueList = {
    feGaussianBlur: uiStrings.NoBlur,
    foreignObject: uiStrings.NoforeignObject,
    '[stroke-dasharray]': uiStrings.NoDashArray
  }
  const content = svgCanvas.getSvgContent()

  // Add font/text check if Canvas Text API is not implemented
  if (!('font' in document.querySelector('CANVAS').getContext('2d'))) {
    issueList.text = uiStrings.NoText
  }

  for (const [sel, descr] of Object.entries(issueList)) {
    if (content.querySelectorAll(sel).length) {
      issueCodes.push(sel)
      issues.push(descr)
    }
  }
  return { issues, issueCodes }
}
/**
 * @typedef {PlainObject} module:svgcanvas.ImageedResults
 * @property {string} datauri Contents as a Data URL
 * @property {string} bloburl May be the empty string
 * @property {string} svg The SVG contents as a string
 * @property {string[]} issues The localization messages of `issueCodes`
 * @property {module:svgcanvas.IssueCode[]} issueCodes CanVG issues found with the SVG
 * @property {"PNG"|"JPEG"|"BMP"|"WEBP"|"ICO"} type The chosen image type
 * @property {"image/png"|"image/jpeg"|"image/bmp"|"image/webp"} mimeType The image MIME type
 * @property {Float} quality A decimal between 0 and 1 (for use with JPEG or WEBP)
 * @property {string} WindowName A convenience for passing along a `window.name` to target a window on which the  could be added
 */

/**
 * Generates a PNG (or JPG, BMP, WEBP) Data URL based on the current image,
 * then calls "ed" with an object including the string, image
 * information, and any issues found.
 * @function module:svgcanvas.SvgCanvas#raster
 * @param {"PNG"|"JPEG"|"BMP"|"WEBP"|"ICO"} [imgType="PNG"]
 * @param {Float} [quality] Between 0 and 1
 * @param {string} [WindowName]
 * @param {PlainObject} [opts]
 * @param {boolean} [opts.avoidEvent]
 * @fires module:svgcanvas.SvgCanvas#event:ed
 * @todo Confirm/fix ICO type
 * @returns {Promise<module:svgcanvas.ImageedResults>} Resolves to {@link module:svgcanvas.ImageedResults}
 */
const rasterExport = async (imgType, quality, WindowName, opts = {}) => {
  const type = imgType === 'ICO' ? 'BMP' : imgType || 'PNG'
  const mimeType = 'image/' + type.toLowerCase()
  const { issues, issueCodes } = getIssues()
  const svg = svgCanvas.svgCanvasToString()

  const iframe = document.createElement('iframe')
  iframe.onload = () => {
    const iframedoc = iframe.contentDocument || iframe.contentWindow.document
    const ele = svgCanvas.getSvgContent()
    const cln = ele.cloneNode(true)
    iframedoc.body.appendChild(cln)
    setTimeout(() => {
      // eslint-disable-next-line promise/catch-or-return
      html2canvas(iframedoc.body, { useCORS: true, allowTaint: true }).then(
        canvas => {
          return new Promise(resolve => {
            const dataURLType = type.toLowerCase()
            const datauri = quality
              ? canvas.toDataURL('image/' + dataURLType, quality)
              : canvas.toDataURL('image/' + dataURLType)
            iframe.parentNode.removeChild(iframe)
            let bloburl

            const done = () => {
              const obj = {
                datauri,
                bloburl,
                svg,
                issues,
                issueCodes,
                type: imgType,
                mimeType,
                quality,
                WindowName
              }
              if (!opts.avoidEvent) {
                svgCanvas.call('ed', obj)
              }
              resolve(obj)
            }
            if (canvas.toBlob) {
              canvas.toBlob(
                blob => {
                  bloburl = createObjectURL(blob)
                  done()
                },
                mimeType,
                quality
              )
              return
            }
            bloburl = dataURLToObjectURL(datauri)
            done()
          })
        }
      )
    }, 1000)
  }
  document.body.appendChild(iframe)
}

/**
 * @typedef {void|"save"|"arraybuffer"|"blob"|"datauristring"|"dataurlstring"|"dataurlnewwindow"|"datauri"|"dataurl"} external:jsPDF.OutputType
 * @todo Newer version to add also allows these `outputType` values "bloburi"|"bloburl" which return strings, so document here and for `outputType` of `module:svgcanvas.PDFedResults` below if added
 */
/**
 * @typedef {PlainObject} module:svgcanvas.PDFedResults
 * @property {string} svg The SVG PDF output
 * @property {string|ArrayBuffer|Blob|window} output The output based on the `outputType`;
 * if `undefined`, "datauristring", "dataurlstring", "datauri",
 * or "dataurl", will be a string (`undefined` gives a document, while the others
 * build as Data URLs; "datauri" and "dataurl" change the location of the current page); if
 * "arraybuffer", will return `ArrayBuffer`; if "blob", returns a `Blob`;
 * if "dataurlnewwindow", will change the current page's location and return a string
 * if in Safari and no window object is found; otherwise opens in, and returns, a new `window`
 * object; if "save", will have the same return as "dataurlnewwindow" if
 * `navigator.getUserMedia` support is found without `URL.createObjectURL` support; otherwise
 * returns `undefined` but attempts to save
 * @property {external:jsPDF.OutputType} outputType
 * @property {string[]} issues The human-readable localization messages of corresponding `issueCodes`
 * @property {module:svgcanvas.IssueCode[]} issueCodes
 * @property {string} WindowName
 */

/**
 * Generates a PDF based on the current image, then calls "edPDF" with
 * an object including the string, the data URL, and any issues found.
 * @function module:svgcanvas.SvgCanvas#PDF
 * @param {string} [WindowName] Will also be used for the download file name here
 * @param {external:jsPDF.OutputType} [outputType="dataurlstring"]
 * @fires module:svgcanvas.SvgCanvas#event:edPDF
 * @returns {Promise<module:svgcanvas.PDFedResults>} Resolves to {@link module:svgcanvas.PDFedResults}
 */
const exportPDF = async (
  WindowName,
  outputType = isChrome() ? 'save' : undefined
) => {
  const res = svgCanvas.getResolution()
  const orientation = res.w > res.h ? 'landscape' : 'portrait'
  const unit = 'pt' // curConfig.baseUnit; // We could use baseUnit, but that is presumably not intended for  purposes
  const iframe = document.createElement('iframe')
  iframe.onload = () => {
    const iframedoc = iframe.contentDocument || iframe.contentWindow.document
    const ele = svgCanvas.getSvgContent()
    const cln = ele.cloneNode(true)
    iframedoc.body.appendChild(cln)
    setTimeout(() => {
      // eslint-disable-next-line promise/catch-or-return
      html2canvas(iframedoc.body, { useCORS: true, allowTaint: true }).then(
        canvas => {
          const imgData = canvas.toDataURL('image/png')
          const doc = new JsPDF({
            orientation,
            unit,
            format: [res.w, res.h]
          })
          const docTitle = svgCanvas.getDocumentTitle()
          doc.setProperties({
            title: docTitle
          })
          doc.addImage(imgData, 'PNG', 0, 0, res.w, res.h)
          iframe.parentNode.removeChild(iframe)
          const { issues, issueCodes } = getIssues()
          outputType = outputType || 'dataurlstring'
          const obj = { issues, issueCodes, WindowName, outputType }
          obj.output = doc.output(
            outputType,
            outputType === 'save' ? WindowName || 'svg.pdf' : undefined
          )
          svgCanvas.call('edPDF', obj)
          return obj
        }
      )
    }, 1000)
  }
  document.body.appendChild(iframe)
}
/**
 * Ensure each element has a unique ID.
 * @function module:svgcanvas.SvgCanvas#uniquifyElems
 * @param {Element} g - The parent element of the tree to give unique IDs
 * @returns {void}
 */
const uniquifyElemsMethod = (g) => {
  const ids = {}
  // TODO: Handle markers and connectors. These are not yet re-identified properly
  // as their referring elements do not get remapped.
  //
  // <marker id='se_marker_end_svg_7'/>
  // <polyline id='svg_7' se:connector='svg_1 svg_6' marker-end='url(#se_marker_end_svg_7)'/>
  //
  // Problem #1: if svg_1 gets renamed, we do not update the polyline's se:connector attribute
  // Problem #2: if the polyline svg_7 gets renamed, we do not update the marker id nor the polyline's marker-end attribute
  const refElems = [
    'filter',
    'linearGradient',
    'pattern',
    'radialGradient',
    'symbol',
    'textPath',
    'use'
  ]

  walkTree(g, (n) => {
    // if it's an element node
    if (n.nodeType === 1) {
      // and the element has an ID
      if (n.id) {
        // and we haven't tracked this ID yet
        if (!(n.id in ids)) {
          // add this id to our map
          ids[n.id] = { elem: null, attrs: [], hrefs: [] }
        }
        ids[n.id].elem = n
      }

      // now search for all attributes on this element that might refer
      // to other elements
      svgCanvas.getrefAttrs().forEach((attr) => {
        const attrnode = n.getAttributeNode(attr)
        if (attrnode) {
          // the incoming file has been sanitized, so we should be able to safely just strip off the leading #
          const url = svgCanvas.getUrlFromAttr(attrnode.value)
          const refid = url ? url.substr(1) : null
          if (refid) {
            if (!(refid in ids)) {
              // add this id to our map
              ids[refid] = { elem: null, attrs: [], hrefs: [] }
            }
            ids[refid].attrs.push(attrnode)
          }
        }
      })

      // check xlink:href now
      const href = svgCanvas.getHref(n)
      // TODO: what if an <image> or <a> element refers to an element internally?
      if (href && refElems.includes(n.nodeName)) {
        const refid = href.substr(1)
        if (refid) {
          if (!(refid in ids)) {
            // add this id to our map
            ids[refid] = { elem: null, attrs: [], hrefs: [] }
          }
          ids[refid].hrefs.push(n)
        }
      }
    }
  })

  // in ids, we now have a map of ids, elements and attributes, let's re-identify
  for (const oldid in ids) {
    if (!oldid) {
      continue
    }
    const { elem } = ids[oldid]
    if (elem) {
      const newid = svgCanvas.getNextId()

      // assign element its new id
      elem.id = newid

      // remap all url() attributes
      const { attrs } = ids[oldid]
      let j = attrs.length
      while (j--) {
        const attr = attrs[j]
        attr.ownerElement.setAttribute(attr.name, 'url(#' + newid + ')')
      }

      // remap all href attributes
      const hreffers = ids[oldid].hrefs
      let k = hreffers.length
      while (k--) {
        const hreffer = hreffers[k]
        svgCanvas.setHref(hreffer, '#' + newid)
      }
    }
  }
}

/**
 * Assigns reference data for each use element.
 * @function module:svgcanvas.SvgCanvas#setUseData
 * @param {Element} parent
 * @returns {void}
 */
const setUseDataMethod = (parent) => {
  let elems = parent

  if (parent.tagName !== 'use') {
    // elems = elems.find('use');
    elems = elems.querySelectorAll('use')
  }

  Array.prototype.forEach.call(elems, (el, _) => {
    const dataStorage = svgCanvas.getDataStorage()
    const id = svgCanvas.getHref(el).substr(1)
    const refElem = svgCanvas.getElement(id)
    if (!refElem) {
      return
    }
    dataStorage.put(el, 'ref', refElem)
    if (refElem.tagName === 'symbol' || refElem.tagName === 'svg') {
      dataStorage.put(el, 'symbol', refElem)
      dataStorage.put(el, 'ref', refElem)
    }
  })
}

/**
 * Looks at DOM elements inside the `<defs>` to see if they are referred to,
 * removes them from the DOM if they are not.
 * @function module:svgcanvas.SvgCanvas#removeUnusedDefElems
 * @returns {Integer} The number of elements that were removed
 */
const removeUnusedDefElemsMethod = () => {
  const defs = svgCanvas.getSvgContent().getElementsByTagNameNS(NS.SVG, 'defs')
  if (!defs || !defs.length) {
    return 0
  }

  // if (!defs.firstChild) { return; }

  const defelemUses = []
  let numRemoved = 0
  const attrs = [
    'fill',
    'stroke',
    'filter',
    'marker-start',
    'marker-mid',
    'marker-end'
  ]
  const alen = attrs.length

  const allEls = svgCanvas.getSvgContent().getElementsByTagNameNS(NS.SVG, '*')
  const allLen = allEls.length

  let i
  let j
  for (i = 0; i < allLen; i++) {
    const el = allEls[i]
    for (j = 0; j < alen; j++) {
      const ref = svgCanvas.getUrlFromAttr(el.getAttribute(attrs[j]))
      if (ref) {
        defelemUses.push(ref.substr(1))
      }
    }

    // gradients can refer to other gradients
    const href = getHref(el)
    if (href && href.startsWith('#')) {
      defelemUses.push(href.substr(1))
    }
  }

  Array.prototype.forEach.call(defs, (def, i) => {
    const defelems = def.querySelectorAll(
      'linearGradient, radialGradient, filter, marker, svg, symbol'
    )
    i = defelems.length
    while (i--) {
      const defelem = defelems[i]
      const { id } = defelem
      if (!defelemUses.includes(id)) {
        // Not found, so remove (but remember)
        svgCanvas.setRemovedElements(id, defelem)
        defelem.remove()
        numRemoved++
      }
    }
  })

  return numRemoved
}
/**
 * Converts gradients from userSpaceOnUse to objectBoundingBox.
 * @function module:svgcanvas.SvgCanvas#convertGradients
 * @param {Element} elem
 * @returns {void}
 */
const convertGradientsMethod = (elem) => {
  let elems = elem.querySelectorAll('linearGradient, radialGradient')
  if (!elems.length && isWebkit()) {
    // Bug in webkit prevents regular *Gradient selector search
    elems = Array.prototype.filter.call(elem.querySelectorAll('*'), (
      curThis
    ) => {
      return curThis.tagName.includes('Gradient')
    })
  }
  Array.prototype.forEach.call(elems, (grad) => {
    if (grad.getAttribute('gradientUnits') === 'userSpaceOnUse') {
      const svgContent = svgCanvas.getSvgContent()
      // TODO: Support more than one element with this ref by duplicating parent grad
      let fillStrokeElems = svgContent.querySelectorAll(
        '[fill="url(#' + grad.id + ')"],[stroke="url(#' + grad.id + ')"]'
      )
      if (!fillStrokeElems.length) {
        const tmpFillStrokeElems = svgContent.querySelectorAll(
          '[*|href="#' + grad.id + '"]'
        )
        if (!tmpFillStrokeElems.length) {
          return
        } else {
          if (
            (tmpFillStrokeElems[0].tagName === 'linearGradient' ||
              tmpFillStrokeElems[0].tagName === 'radialGradient') &&
            tmpFillStrokeElems[0].getAttribute('gradientUnits') ===
              'userSpaceOnUse'
          ) {
            fillStrokeElems = svgContent.querySelectorAll(
              '[fill="url(#' +
                tmpFillStrokeElems[0].id +
                ')"],[stroke="url(#' +
                tmpFillStrokeElems[0].id +
                ')"]'
            )
          } else {
            return
          }
        }
      }
      // get object's bounding box
      const bb = utilsGetBBox(fillStrokeElems[0])

      // This will occur if the element is inside a <defs> or a <symbol>,
      // in which we shouldn't need to convert anyway.
      if (!bb) {
        return
      }
      if (grad.tagName === 'linearGradient') {
        const gCoords = {
          x1: grad.getAttribute('x1'),
          y1: grad.getAttribute('y1'),
          x2: grad.getAttribute('x2'),
          y2: grad.getAttribute('y2')
        }

        // If has transform, convert
        const tlist = grad.gradientTransform.baseVal
        if (tlist?.numberOfItems > 0) {
          const m = transformListToTransform(tlist).matrix
          const pt1 = transformPoint(gCoords.x1, gCoords.y1, m)
          const pt2 = transformPoint(gCoords.x2, gCoords.y2, m)

          gCoords.x1 = pt1.x
          gCoords.y1 = pt1.y
          gCoords.x2 = pt2.x
          gCoords.y2 = pt2.y
          grad.removeAttribute('gradientTransform')
        }
        grad.setAttribute('x1', (gCoords.x1 - bb.x) / bb.width)
        grad.setAttribute('y1', (gCoords.y1 - bb.y) / bb.height)
        grad.setAttribute('x2', (gCoords.x2 - bb.x) / bb.width)
        grad.setAttribute('y2', (gCoords.y2 - bb.y) / bb.height)
        grad.removeAttribute('gradientUnits')
      }
    }
  })
}
