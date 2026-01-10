/**
 *
 */
export default class Paint {
  static #normalizeAlpha (alpha) {
    const numeric = Number(alpha)
    if (!Number.isFinite(numeric)) return 100
    return Math.min(100, Math.max(0, numeric))
  }

  static #normalizeSolidColor (color) {
    if (color === null || color === undefined) return null
    const str = String(color).trim()
    if (!str) return null
    if (str === 'none') return 'none'
    return str.startsWith('#') ? str.slice(1) : str
  }

  static #extractHrefId (hrefAttr) {
    if (!hrefAttr) return null
    const href = String(hrefAttr).trim()
    if (!href) return null
    if (href.startsWith('#')) return href.slice(1)
    const urlMatch = href.match(/url\(\s*['"]?#([^'")\s]+)['"]?\s*\)/)
    if (urlMatch?.[1]) return urlMatch[1]
    const hashIndex = href.lastIndexOf('#')
    if (hashIndex >= 0 && hashIndex < href.length - 1) {
      return href.slice(hashIndex + 1)
    }
    return null
  }

  static #resolveGradient (gradient) {
    if (!gradient?.cloneNode) return null
    const doc = gradient.ownerDocument || document
    const visited = new Set()
    const clone = gradient.cloneNode(true)

    let refId = Paint.#extractHrefId(
      clone.getAttribute('href') || clone.getAttribute('xlink:href')
    )

    while (refId && !visited.has(refId)) {
      visited.add(refId)

      const referenced = doc.getElementById(refId)
      if (!referenced?.getAttribute) break

      const cloneTag = String(clone.tagName || '').toLowerCase()
      const referencedTag = String(referenced.tagName || '').toLowerCase()
      if (
        !['lineargradient', 'radialgradient'].includes(referencedTag) ||
        referencedTag !== cloneTag
      ) {
        break
      }

      // Copy missing attributes from referenced gradient (matches SVG href inheritance).
      for (const attr of referenced.attributes || []) {
        const name = attr.name
        if (name === 'id' || name === 'href' || name === 'xlink:href') continue
        const current = clone.getAttribute(name)
        if (current === null || current === '') {
          clone.setAttribute(name, attr.value)
        }
      }

      // If the referencing gradient has no stops, inherit stops from the referenced gradient.
      if (clone.querySelectorAll('stop').length === 0) {
        for (const stop of referenced.querySelectorAll?.('stop') || []) {
          clone.append(stop.cloneNode(true))
        }
      }

      // Prepare to continue resolving deeper links if present.
      refId = Paint.#extractHrefId(
        referenced.getAttribute('href') || referenced.getAttribute('xlink:href')
      )
    }

    // The clone is now self-contained; remove any href.
    clone.removeAttribute('href')
    clone.removeAttribute('xlink:href')

    return clone
  }

  /**
   * @param {module:jGraduate.jGraduatePaintOptions} [opt]
   */
  constructor (opt) {
    const options = opt || {}
    this.alpha = Paint.#normalizeAlpha(options.alpha)
    // copy paint object
    if (options.copy) {
      /**
       * @name module:jGraduate~Paint#type
       * @type {"none"|"solidColor"|"linearGradient"|"radialGradient"}
       */
      this.type = options.copy.type
      /**
       * Represents opacity (0-100).
       * @name module:jGraduate~Paint#alpha
       * @type {Float}
       */
      this.alpha = Paint.#normalizeAlpha(options.copy.alpha)
      /**
       * Represents #RRGGBB hex of color.
       * @name module:jGraduate~Paint#solidColor
       * @type {string}
       */
      this.solidColor = null
      /**
       * @name module:jGraduate~Paint#linearGradient
       * @type {SVGLinearGradientElement}
       */
      this.linearGradient = null
      /**
       * @name module:jGraduate~Paint#radialGradient
       * @type {SVGRadialGradientElement}
       */
      this.radialGradient = null

      switch (this.type) {
        case 'none':
          break
        case 'solidColor':
          this.solidColor = Paint.#normalizeSolidColor(options.copy.solidColor)
          break
        case 'linearGradient':
          this.linearGradient = options.copy.linearGradient?.cloneNode
            ? options.copy.linearGradient.cloneNode(true)
            : null
          break
        case 'radialGradient':
          this.radialGradient = options.copy.radialGradient?.cloneNode
            ? options.copy.radialGradient.cloneNode(true)
            : null
          break
      }
      // create linear gradient paint
    } else if (options.linearGradient) {
      this.type = 'linearGradient'
      this.solidColor = null
      this.radialGradient = null
      this.linearGradient = Paint.#resolveGradient(options.linearGradient)
      // create linear gradient paint
    } else if (options.radialGradient) {
      this.type = 'radialGradient'
      this.solidColor = null
      this.linearGradient = null
      this.radialGradient = Paint.#resolveGradient(options.radialGradient)
      // create solid color paint
    } else if (options.solidColor) {
      this.type = 'solidColor'
      this.solidColor = Paint.#normalizeSolidColor(options.solidColor)
      // create empty paint
    } else {
      this.type = 'none'
      this.solidColor = null
      this.linearGradient = null
      this.radialGradient = null
    }
  }
}
