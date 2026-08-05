const CLIPBOARD_DATA_VERSION = 2
const documentIds = new WeakMap()
let documentSequence = 0

const hrefAttributeNames = new Set(['href', 'xlink:href'])
const localUrlReference = /url\(\s*(["']?)#([^"'()\s]+)\1\s*\)/gi

/**
 * Creates an identifier that is stable for the lifetime of one SVG document.
 * @returns {string}
 */
const createDocumentId = () => {
  const uuid = globalThis.crypto?.randomUUID?.()
  if (uuid) return uuid

  documentSequence++
  return `svg-document-${Date.now().toString(36)}-${documentSequence}-${Math.random().toString(36).slice(2)}`
}

/**
 * Returns the clipboard identity of an SVG document.
 * @param {Element} svgContent
 * @returns {string}
 */
export const getClipboardDocumentId = (svgContent) => {
  let id = documentIds.get(svgContent)
  if (!id) {
    id = createDocumentId()
    documentIds.set(svgContent, id)
  }
  return id
}

/**
 * Starts a new clipboard identity for an SVG root that is reused after clear.
 * @param {Element} svgContent
 * @returns {string}
 */
export const resetClipboardDocumentId = (svgContent) => {
  const id = createDocumentId()
  documentIds.set(svgContent, id)
  return id
}

/**
 * Normalizes both the legacy array clipboard and the versioned clipboard.
 * @param {unknown} data
 * @returns {{version: number, sourceDocumentId: string|null, elements: module:svgcanvas.SVGAsJSON[], dependencies: module:svgcanvas.SVGAsJSON[], useTargetIds: string[]}|null}
 */
export const normalizeClipboardData = (data) => {
  if (Array.isArray(data)) {
    return {
      version: 1,
      sourceDocumentId: null,
      elements: data,
      dependencies: [],
      useTargetIds: []
    }
  }

  if (
    !data ||
    typeof data !== 'object' ||
    data.version !== CLIPBOARD_DATA_VERSION ||
    !Array.isArray(data.elements)
  ) {
    return null
  }

  return {
    version: CLIPBOARD_DATA_VERSION,
    sourceDocumentId: typeof data.sourceDocumentId === 'string'
      ? data.sourceDocumentId
      : null,
    elements: data.elements,
    dependencies: Array.isArray(data.dependencies) ? data.dependencies : [],
    useTargetIds: Array.isArray(data.useTargetIds)
      ? data.useTargetIds.filter((id) => typeof id === 'string' && id)
      : []
  }
}

/**
 * Reports whether parsed clipboard data contains pasteable elements.
 * @param {unknown} data
 * @returns {boolean}
 */
export const hasClipboardElements = (data) => {
  const clipboard = normalizeClipboardData(data)
  return Boolean(clipboard?.elements.length)
}

/**
 * Adds all local url(#id) references found in a string.
 * @param {unknown} value
 * @param {Map<string, 'use'|'visual'>} references
 * @param {'use'|'visual'} kind
 * @returns {void}
 */
const addUrlReferences = (value, references, kind = 'visual') => {
  if (typeof value !== 'string' || !value) return

  localUrlReference.lastIndex = 0
  let match
  while ((match = localUrlReference.exec(value))) {
    const id = match[2]
    if (id) addReference(references, id, kind)
  }
}

/**
 * Adds or promotes a reference. A direct use target has stronger semantics.
 * @param {Map<string, 'use'|'visual'>} references
 * @param {string} id
 * @param {'use'|'visual'} kind
 * @returns {void}
 */
const addReference = (references, id, kind) => {
  if (!id) return
  if (kind === 'use' || !references.has(id)) references.set(id, kind)
}

/**
 * Collects local ID references from one DOM subtree.
 * @param {Element} root
 * @returns {Map<string, 'use'|'visual'>}
 */
export const getElementReferences = (root) => {
  const references = new Map()
  const elements = [root, ...root.querySelectorAll('*')]

  elements.forEach((element) => {
    Array.from(element.attributes || []).forEach((attr) => {
      const value = attr.value
      if (hrefAttributeNames.has(attr.name) && value?.startsWith('#')) {
        addReference(
          references,
          value.slice(1),
          element.localName === 'use' ? 'use' : 'visual'
        )
      }
      addUrlReferences(value, references)
    })

    if (element.localName === 'style') {
      addUrlReferences(element.textContent, references)
    }
  })

  return references
}

/**
 * Walks JSON element nodes.
 * @param {module:svgcanvas.SVGAsJSON|string|null} node
 * @param {(node: module:svgcanvas.SVGAsJSON) => void} visit
 * @returns {void}
 */
export const walkJsonElements = (node, visit) => {
  if (!node || typeof node !== 'object') return
  visit(node)
  node.children?.forEach((child) => walkJsonElements(child, visit))
}

/**
 * Collects local ID references from one serialized SVG subtree.
 * @param {module:svgcanvas.SVGAsJSON} root
 * @returns {Map<string, 'use'|'visual'>}
 */
export const getJsonReferences = (root) => {
  const references = new Map()

  walkJsonElements(root, (node) => {
    Object.entries(node.attr || {}).forEach(([attrName, attrValue]) => {
      if (
        hrefAttributeNames.has(attrName) &&
        typeof attrValue === 'string' &&
        attrValue.startsWith('#')
      ) {
        addReference(
          references,
          attrValue.slice(1),
          node.element === 'use' ? 'use' : 'visual'
        )
      }
      addUrlReferences(attrValue, references)
    })

    if (node.element === 'style') {
      node.children?.forEach((child) => addUrlReferences(child, references))
    }
  })

  return references
}

/**
 * Returns all serialized element nodes indexed by ID.
 * @param {module:svgcanvas.SVGAsJSON[]} roots
 * @returns {Map<string, module:svgcanvas.SVGAsJSON>}
 */
export const getJsonNodesById = (roots) => {
  const nodes = new Map()
  roots.forEach((root) => {
    walkJsonElements(root, (node) => {
      const id = node.attr?.id
      if (typeof id === 'string' && id && !nodes.has(id)) nodes.set(id, node)
    })
  })
  return nodes
}

/**
 * Replaces local references in one attribute or CSS value.
 * @param {string} value
 * @param {Map<string, string>} idMap
 * @returns {string}
 */
const remapUrlReferences = (value, idMap) => {
  localUrlReference.lastIndex = 0
  return value.replace(localUrlReference, (match, quote, id) => {
    const replacement = idMap.get(id)
    return replacement ? match.replace(`#${id}`, `#${replacement}`) : match
  })
}

/**
 * Remaps element IDs in serialized SVG subtrees.
 * @param {module:svgcanvas.SVGAsJSON[]} roots
 * @param {Map<string, string>} idMap
 * @returns {void}
 */
export const remapJsonElementIds = (roots, idMap) => {
  roots.forEach((root) => {
    walkJsonElements(root, (node) => {
      const id = node.attr?.id
      if (typeof id === 'string' && idMap.has(id)) {
        node.attr.id = idMap.get(id)
      }
    })
  })
}

/**
 * Remaps href and url(#id) references in serialized SVG subtrees.
 * @param {module:svgcanvas.SVGAsJSON[]} roots
 * @param {Map<string, string>} idMap
 * @returns {void}
 */
export const remapJsonReferences = (roots, idMap) => {
  roots.forEach((root) => {
    walkJsonElements(root, (node) => {
      Object.entries(node.attr || {}).forEach(([attrName, attrValue]) => {
        if (typeof attrValue !== 'string' || !attrValue) return

        if (hrefAttributeNames.has(attrName) && attrValue.startsWith('#')) {
          const replacement = idMap.get(attrValue.slice(1))
          if (replacement) node.attr[attrName] = `#${replacement}`
        }

        node.attr[attrName] = remapUrlReferences(node.attr[attrName], idMap)
      })

      if (node.element === 'style' && Array.isArray(node.children)) {
        node.children = node.children.map((child) => (
          typeof child === 'string' ? remapUrlReferences(child, idMap) : child
        ))
      }
    })
  })
}

/**
 * Produces a stable representation for structural comparison.
 * @param {module:svgcanvas.SVGAsJSON|string|null} node
 * @returns {unknown}
 */
const canonicalizeJson = (node) => {
  if (!node || typeof node !== 'object') return node

  const attr = {}
  Object.keys(node.attr || {}).sort().forEach((name) => {
    attr[name] = node.attr[name]
  })

  return {
    element: node.element,
    attr,
    children: (node.children || []).map(canonicalizeJson)
  }
}

/**
 * Compares serialized SVG elements without depending on attribute order.
 * @param {module:svgcanvas.SVGAsJSON} first
 * @param {module:svgcanvas.SVGAsJSON} second
 * @returns {boolean}
 */
export const areJsonElementsEquivalent = (first, second) => {
  return JSON.stringify(canonicalizeJson(first)) === JSON.stringify(canonicalizeJson(second))
}

/**
 * Creates the versioned clipboard payload and its recursive defs closure.
 * @param {module:svgcanvas.SvgCanvas} svgCanvas
 * @param {Element[]} selectedElements
 * @returns {{version: number, sourceDocumentId: string, elements: module:svgcanvas.SVGAsJSON[], dependencies: module:svgcanvas.SVGAsJSON[], useTargetIds: string[]}}
 */
export const createClipboardPayload = (svgCanvas, selectedElements) => {
  const svgContent = svgCanvas.getSvgContent()
  const elements = selectedElements
    .map((element) => svgCanvas.getJsonFromSvgElements(element))
    .filter(Boolean)
  const sourceElementsById = new Map()
  const dependencyRoots = []
  const scannedRoots = new Set()
  const pendingReferences = []
  const useTargetIds = new Set()

  if (svgContent.id) sourceElementsById.set(svgContent.id, svgContent)
  svgContent.querySelectorAll('[id]').forEach((element) => {
    if (!sourceElementsById.has(element.id)) sourceElementsById.set(element.id, element)
  })

  const isInsideSelection = (element) => selectedElements.some((selected) => (
    selected === element || selected.contains(element)
  ))

  const enqueueReferences = (root) => {
    getElementReferences(root).forEach((kind, id) => {
      pendingReferences.push({ id, kind })
    })
  }

  selectedElements.forEach(enqueueReferences)

  while (pendingReferences.length) {
    const { id, kind } = pendingReferences.shift()
    const target = sourceElementsById.get(id)
    if (!target || isInsideSelection(target)) continue

    if (kind === 'use') useTargetIds.add(id)

    const containingRoot = dependencyRoots.find((root) => (
      root === target || root.contains(target)
    ))
    if (containingRoot) continue

    for (let index = dependencyRoots.length - 1; index >= 0; index--) {
      if (target.contains(dependencyRoots[index])) dependencyRoots.splice(index, 1)
    }
    dependencyRoots.push(target)

    if (!scannedRoots.has(target)) {
      scannedRoots.add(target)
      enqueueReferences(target)
    }
  }

  const dependencies = dependencyRoots
    .map((element) => svgCanvas.getJsonFromSvgElements(element))
    .filter(Boolean)
  const dependencyIds = getJsonNodesById(dependencies)

  return {
    version: CLIPBOARD_DATA_VERSION,
    sourceDocumentId: getClipboardDocumentId(svgContent),
    elements,
    dependencies,
    useTargetIds: [...useTargetIds].filter((id) => dependencyIds.has(id))
  }
}
