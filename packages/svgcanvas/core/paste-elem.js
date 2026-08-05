import {
  getStrokedBBoxDefaultVisible,
  getUrlFromAttr
} from './utilities.js'
import * as hstry from './history.js'
import {
  areJsonElementsEquivalent,
  getClipboardDocumentId,
  getJsonNodesById,
  getJsonReferences,
  normalizeClipboardData,
  remapJsonElementIds,
  remapJsonReferences,
  walkJsonElements
} from './clipboard.js'

const {
  InsertElementCommand,
  RemoveElementCommand,
  BatchCommand
} = hstry

const conflictPolicies = new Set([
  'use-existing',
  'replace-existing',
  'keep-both',
  'cancel'
])

let svgCanvas = null

/**
 * @function module:paste-elem.init
 * @param {module:paste-elem.pasteContext} pasteContext
 * @returns {void}
 */
export const init = (canvas) => {
  svgCanvas = canvas
}

/**
 * Returns every target-document element indexed by ID.
 * @returns {Map<string, Element>}
 */
const getTargetElementsById = () => {
  const svgContent = svgCanvas.getSvgContent()
  const elements = new Map()

  if (svgContent.id) elements.set(svgContent.id, svgContent)
  svgContent.querySelectorAll('[id]').forEach((element) => {
    if (!elements.has(element.id)) elements.set(element.id, element)
  })

  return elements
}

/**
 * Creates unique IDs while also reserving not-yet-inserted clipboard IDs.
 * @param {Set<string>} reservedIds
 * @returns {() => string}
 */
const createIdGenerator = (reservedIds) => {
  return () => {
    let id
    do {
      id = svgCanvas.getNextId()
    } while (reservedIds.has(id))
    reservedIds.add(id)
    return id
  }
}

/**
 * Records fresh IDs for every serialized element ID.
 * @param {module:svgcanvas.SVGAsJSON[]} elements
 * @param {() => string} getNextId
 * @returns {Map<string, string>}
 */
const createFreshIdMap = (elements, getNextId) => {
  const idMap = new Map()
  elements.forEach((element) => {
    walkJsonElements(element, (node) => {
      const id = node.attr?.id
      if (typeof id === 'string' && id && !idMap.has(id)) {
        idMap.set(id, getNextId())
      }
    })
  })
  return idMap
}

/**
 * Converts an ID map to the legacy extension event shape.
 * @param {Map<string, string>} idMap
 * @returns {module:svgcanvas.ChangedIDs}
 */
const toChangedIds = (idMap) => Object.fromEntries(idMap)

/**
 * Gives extensions a chance to update IDs or discard pasted top-level nodes.
 * @param {module:svgcanvas.SVGAsJSON[]} elements
 * @param {module:svgcanvas.ChangedIDs} changedIDs
 * @returns {module:svgcanvas.SVGAsJSON[]}
 */
const runIdUpdatedExtensions = (elements, changedIDs) => {
  let filtered = elements

  svgCanvas.runExtensions(
    'IDsUpdated',
    /** @type {module:svgcanvas.SvgCanvas#event:ext_IDsUpdated} */
    { elems: filtered, changes: changedIDs },
    true
  ).forEach((extChanges) => {
    if (!extChanges || !('remove' in extChanges)) return

    extChanges.remove.forEach((removeID) => {
      filtered = filtered.filter((clipboardItem) => (
        clipboardItem?.attr?.id !== removeID
      ))
    })
  })

  return filtered
}

/**
 * Adds serialized visible elements to the current layer.
 * @param {module:svgcanvas.SVGAsJSON[]} elements
 * @param {module:history.BatchCommand} batchCmd
 * @returns {Element[]}
 */
const insertVisibleElements = (elements, batchCmd) => {
  const pasted = []
  let index = elements.length

  while (index--) {
    const element = elements[index]
    if (!element) continue

    const copy = svgCanvas.addSVGElementsFromJson(element)
    if (!copy) continue

    pasted.push(copy)
    batchCmd.addSubCommand(new InsertElementCommand(copy))
    svgCanvas.restoreRefElements(copy)
  }

  return pasted
}

/**
 * Positions pasted elements, records history, and announces the change.
 * @param {Element[]} pasted
 * @param {module:history.BatchCommand} batchCmd
 * @param {'in_place'|'point'|void} type
 * @param {Integer|void} x
 * @param {Integer|void} y
 * @returns {void}
 */
const finishPaste = (pasted, batchCmd, type, x, y) => {
  if (!pasted.length) return
  svgCanvas.selectOnly(pasted)

  if (type !== 'in_place') {
    let ctrX
    let ctrY

    if (!type) {
      ctrX = svgCanvas.getLastClickPoint('x')
      ctrY = svgCanvas.getLastClickPoint('y')
    } else if (type === 'point') {
      ctrX = x
      ctrY = y
    }

    const bbox = getStrokedBBoxDefaultVisible(pasted)
    if (bbox && Number.isFinite(ctrX) && Number.isFinite(ctrY)) {
      const cx = ctrX - (bbox.x + bbox.width / 2)
      const cy = ctrY - (bbox.y + bbox.height / 2)
      const dx = pasted.map(() => cx)
      const dy = pasted.map(() => cy)
      const cmd = svgCanvas.moveSelectedElements(dx, dy, false)
      if (cmd) batchCmd.addSubCommand(cmd)
    }
  }

  svgCanvas.addCommandToHistory(batchCmd)
  svgCanvas.call('changed', pasted)
}

/**
 * Preserves the established same-document and legacy clipboard behavior.
 * @param {module:svgcanvas.SVGAsJSON[]} clipboardElements
 * @param {'in_place'|'point'|void} type
 * @param {Integer|void} x
 * @param {Integer|void} y
 * @returns {void}
 */
const pasteInSameDocument = (clipboardElements, type, x, y) => {
  let elements = clipboardElements
  const batchCmd = new BatchCommand('Paste elements')
  /** @type {module:svgcanvas.ChangedIDs} */
  const changedIDs = {}

  const checkIDs = (element) => {
    if (element.attr?.id) {
      changedIDs[element.attr.id] = svgCanvas.getNextId()
      element.attr.id = changedIDs[element.attr.id]
    }
    element.children?.forEach((child) => checkIDs(child))
  }
  elements.forEach((element) => checkIDs(element))

  const remapReferences = (element) => {
    const attrs = element?.attr
    if (attrs) {
      Object.entries(attrs).forEach(([attrName, attrValue]) => {
        if (typeof attrValue !== 'string' || !attrValue) return
        if (
          (attrName === 'href' || attrName === 'xlink:href') &&
          attrValue.startsWith('#')
        ) {
          const refId = attrValue.slice(1)
          if (refId in changedIDs) attrs[attrName] = `#${changedIDs[refId]}`
        }
        const url = getUrlFromAttr(attrValue)
        if (url) {
          const refId = url.slice(1)
          if (refId in changedIDs) {
            attrs[attrName] = attrValue.replace(url, `#${changedIDs[refId]}`)
          }
        }
      })
    }
    element.children?.forEach((child) => remapReferences(child))
  }
  elements.forEach((element) => remapReferences(element))

  elements = runIdUpdatedExtensions(elements, changedIDs)
  if (!elements.length) return

  const pasted = insertVisibleElements(elements, batchCmd)
  svgCanvas.setUseData(svgCanvas.getSvgContent())
  finishPaste(pasted, batchCmd, type, x, y)
}

/**
 * Builds dependency indexes for conflict detection and insertion.
 * @param {module:svgcanvas.SVGAsJSON[]} dependencyRoots
 * @returns {{nodesById: Map<string, module:svgcanvas.SVGAsJSON>, rootById: Map<string, module:svgcanvas.SVGAsJSON>, idsByRoot: Map<module:svgcanvas.SVGAsJSON, Set<string>>, referencesByRoot: Map<module:svgcanvas.SVGAsJSON, Map<string, 'use'|'visual'>>}}
 */
const indexDependencies = (dependencyRoots) => {
  const nodesById = getJsonNodesById(dependencyRoots)
  const rootById = new Map()
  const idsByRoot = new Map()
  const referencesByRoot = new Map()

  dependencyRoots.forEach((root) => {
    const ids = new Set(getJsonNodesById([root]).keys())
    idsByRoot.set(root, ids)
    referencesByRoot.set(root, getJsonReferences(root))
    ids.forEach((id) => rootById.set(id, root))
  })

  return { nodesById, rootById, idsByRoot, referencesByRoot }
}

/**
 * Collects dependency roots reachable from the visible clipboard nodes.
 * @param {module:svgcanvas.SVGAsJSON[]} elements
 * @param {ReturnType<indexDependencies>} dependencyIndex
 * @param {(id: string) => boolean} shouldReuse
 * @returns {Set<module:svgcanvas.SVGAsJSON>}
 */
const collectReachableRoots = (elements, dependencyIndex, shouldReuse) => {
  const { nodesById, rootById, idsByRoot, referencesByRoot } = dependencyIndex
  const roots = new Set()
  const visitedIds = new Set()

  const visit = (id) => {
    if (visitedIds.has(id) || !nodesById.has(id)) return
    visitedIds.add(id)
    if (shouldReuse(id)) return

    const root = rootById.get(id)
    if (!root || roots.has(root)) return
    roots.add(root)

    const internalIds = idsByRoot.get(root)
    referencesByRoot.get(root)?.forEach((_kind, referencedId) => {
      if (!internalIds.has(referencedId)) visit(referencedId)
    })
  }

  elements.forEach((element) => {
    getJsonReferences(element).forEach((_kind, id) => visit(id))
  })

  return roots
}

/**
 * Creates a graph-aware equivalence checker for incoming dependencies.
 * @param {ReturnType<indexDependencies>} dependencyIndex
 * @param {Map<string, Element>} targetElementsById
 * @returns {(id: string) => boolean}
 */
const createEquivalenceChecker = (dependencyIndex, targetElementsById) => {
  const { nodesById } = dependencyIndex
  const memo = new Map()
  const visiting = new Set()
  const targetJson = new Map()

  const isEquivalent = (id) => {
    if (memo.has(id)) return memo.get(id)
    if (visiting.has(id)) return true

    const incoming = nodesById.get(id)
    const target = targetElementsById.get(id)
    if (!incoming || !target) {
      memo.set(id, false)
      return false
    }

    let targetNode = targetJson.get(id)
    if (!targetNode) {
      targetNode = svgCanvas.getJsonFromSvgElements(target)
      targetJson.set(id, targetNode)
    }
    if (!areJsonElementsEquivalent(incoming, targetNode)) {
      memo.set(id, false)
      return false
    }

    visiting.add(id)
    const internalIds = new Set(getJsonNodesById([incoming]).keys())
    let equivalent = true
    getJsonReferences(incoming).forEach((_kind, referencedId) => {
      if (
        equivalent &&
        !internalIds.has(referencedId) &&
        nodesById.has(referencedId) &&
        !isEquivalent(referencedId)
      ) {
        equivalent = false
      }
    })
    visiting.delete(id)
    memo.set(id, equivalent)
    return equivalent
  }

  return isEquivalent
}

/**
 * Resolves direct use-target conflicts through the host editor.
 * @param {string[]} conflicts
 * @returns {Promise<'use-existing'|'replace-existing'|'keep-both'|'cancel'>}
 */
const resolveUseConflicts = async (conflicts) => {
  if (!conflicts.length) return 'keep-both'

  const response = await svgCanvas.call('resolveClipboardConflicts', { conflicts })
  return conflictPolicies.has(response) ? response : 'keep-both'
}

/**
 * Pastes elements and the minimal dependency closure into another document.
 * @param {{elements: module:svgcanvas.SVGAsJSON[], dependencies: module:svgcanvas.SVGAsJSON[], useTargetIds: string[]}} clipboard
 * @param {'in_place'|'point'|void} type
 * @param {Integer|void} x
 * @param {Integer|void} y
 * @returns {Promise<void>}
 */
const pasteAcrossDocuments = async (clipboard, type, x, y) => {
  let elements = clipboard.elements
  const dependencyRoots = clipboard.dependencies.filter((root) => (
    root && typeof root === 'object'
  ))
  const dependencyIndex = indexDependencies(dependencyRoots)
  const targetElementsById = getTargetElementsById()
  const allIncomingIds = new Set([
    ...getJsonNodesById(elements).keys(),
    ...dependencyIndex.nodesById.keys()
  ])
  const reservedIds = new Set([
    ...targetElementsById.keys(),
    ...allIncomingIds
  ])
  const getNextId = createIdGenerator(reservedIds)

  const selectedIdMap = createFreshIdMap(elements, getNextId)
  remapJsonReferences(elements, selectedIdMap)
  remapJsonElementIds(elements, selectedIdMap)
  elements = runIdUpdatedExtensions(elements, toChangedIds(selectedIdMap))
  if (!elements.length) return

  const isEquivalent = createEquivalenceChecker(
    dependencyIndex,
    targetElementsById
  )
  const allReachableRoots = collectReachableRoots(
    elements,
    dependencyIndex,
    () => false
  )
  const reachableRootIds = new Set()
  allReachableRoots.forEach((root) => {
    dependencyIndex.idsByRoot.get(root)?.forEach((id) => reachableRootIds.add(id))
  })

  const useTargetIds = new Set(clipboard.useTargetIds)
  const conflicts = [...useTargetIds].filter((id) => (
    reachableRootIds.has(id) &&
    targetElementsById.has(id) &&
    !isEquivalent(id)
  )).sort()
  const policy = await resolveUseConflicts(conflicts)
  if (policy === 'cancel') return

  const conflictIds = new Set(conflicts)
  const getDependencyAction = (id) => {
    if (!targetElementsById.has(id)) return 'import'
    if (isEquivalent(id)) return 'reuse'
    if (!conflictIds.has(id)) return 'keep-both'
    if (policy === 'use-existing') return 'reuse'
    if (policy === 'replace-existing') return 'replace-existing'
    return 'keep-both'
  }

  const rootsToImport = collectReachableRoots(
    elements,
    dependencyIndex,
    (id) => getDependencyAction(id) === 'reuse'
  )
  const importedIds = new Set()
  rootsToImport.forEach((root) => {
    dependencyIndex.idsByRoot.get(root)?.forEach((id) => importedIds.add(id))
  })

  const dependencyElementIdMap = new Map()
  importedIds.forEach((id) => {
    const action = getDependencyAction(id)
    if (!targetElementsById.has(id) || action === 'replace-existing') {
      dependencyElementIdMap.set(id, id)
    } else {
      dependencyElementIdMap.set(id, getNextId())
    }
  })

  const dependencyReferenceIdMap = new Map()
  dependencyIndex.nodesById.forEach((_node, id) => {
    const action = getDependencyAction(id)
    if (
      !targetElementsById.has(id) ||
      action === 'reuse' ||
      action === 'replace-existing'
    ) {
      dependencyReferenceIdMap.set(id, id)
    } else {
      dependencyReferenceIdMap.set(
        id,
        dependencyElementIdMap.get(id) || id
      )
    }
  })

  const roots = dependencyRoots.filter((root) => rootsToImport.has(root))
  const rootReplacementPositions = new Map()
  roots.forEach((root) => {
    const rootId = root.attr?.id
    if (getDependencyAction(rootId) !== 'replace-existing') return
    const target = targetElementsById.get(rootId)
    if (target?.parentNode) {
      rootReplacementPositions.set(root, {
        parent: target.parentNode,
        nextSibling: target.nextSibling
      })
    }
  })

  const replacementElements = [...importedIds]
    .filter((id) => getDependencyAction(id) === 'replace-existing')
    .map((id) => targetElementsById.get(id))
    .filter(Boolean)
    .filter((element, _index, all) => !all.some((candidate) => (
      candidate !== element && candidate.contains(element)
    )))

  remapJsonReferences(roots, dependencyReferenceIdMap)
  remapJsonElementIds(roots, dependencyElementIdMap)

  const visibleReferenceIdMap = new Map(dependencyReferenceIdMap)
  selectedIdMap.forEach((newId, oldId) => visibleReferenceIdMap.set(oldId, newId))
  remapJsonReferences(elements, visibleReferenceIdMap)

  const batchCmd = new BatchCommand('Paste elements')
  if (replacementElements.length) batchCmd.refreshUseData = true

  replacementElements.forEach((element) => {
    const parent = element.parentNode
    if (!parent) return
    const nextSibling = element.nextSibling
    batchCmd.addSubCommand(
      new RemoveElementCommand(element, nextSibling, parent)
    )
    element.remove()
  })

  const defs = svgCanvas.findDefs()
  const insertedDependencies = []
  roots.forEach((root) => {
    const copy = svgCanvas.addSVGElementsFromJson(root)
    if (!copy) return

    const replacementPosition = rootReplacementPositions.get(root)
    const parent = replacementPosition?.parent?.isConnected
      ? replacementPosition.parent
      : defs
    const nextSibling = replacementPosition?.nextSibling?.parentNode === parent
      ? replacementPosition.nextSibling
      : null
    parent.insertBefore(copy, nextSibling)
    insertedDependencies.push(copy)
    batchCmd.addSubCommand(new InsertElementCommand(copy))
  })

  insertedDependencies.forEach((element) => {
    svgCanvas.restoreRefElements(element)
    svgCanvas.setUseData(element)
  })

  const pasted = insertVisibleElements(elements, batchCmd)
  svgCanvas.setUseData(svgCanvas.getSvgContent())
  finishPaste(pasted, batchCmd, type, x, y)
}

/**
 * Pastes clipboard elements and, across documents, their required defs.
 * @function module:svgcanvas.SvgCanvas#pasteElements
 * @param {'in_place'|'point'|void} type
 * @param {Integer|void} x Expected if type is "point"
 * @param {Integer|void} y Expected if type is "point"
 * @fires module:svgcanvas.SvgCanvas#event:changed
 * @fires module:svgcanvas.SvgCanvas#event:ext_IDsUpdated
 * @returns {Promise<void>}
 */
export const pasteElementsMethod = async (type, x, y) => {
  const rawClipboard = sessionStorage.getItem(svgCanvas.getClipboardID())
  let parsed
  try {
    parsed = JSON.parse(rawClipboard)
  } catch {
    return
  }

  const clipboard = normalizeClipboardData(parsed)
  if (!clipboard?.elements.length) return

  const isSameDocument = clipboard.version === 2 &&
    clipboard.sourceDocumentId === getClipboardDocumentId(svgCanvas.getSvgContent())

  if (
    clipboard.version === 1 ||
    isSameDocument ||
    !clipboard.dependencies.length
  ) {
    pasteInSameDocument(clipboard.elements, type, x, y)
    return
  }

  await pasteAcrossDocuments(clipboard, type, x, y)
}
