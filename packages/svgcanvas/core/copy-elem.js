import { preventClickDefault } from './utilities.js'
import dataStorage from './dataStorage.js'

/**
 * Create a clone of an element, updating its ID and its children's IDs when needed.
 * @function module:utilities.copyElem
 * @param {Element} el - DOM element to clone
 * @param {module:utilities.GetNextID} getNextId - The getter of the next unique ID.
 * @returns {Element} The cloned element
 */
export const copyElem = (el, getNextId) => {
  const ownerDocument = el?.ownerDocument || document
  // manually create a copy of the element
  const newEl = ownerDocument.createElementNS(el.namespaceURI, el.nodeName)
  Array.from(el.attributes).forEach((attr) => {
    if (attr.namespaceURI) {
      newEl.setAttributeNS(attr.namespaceURI, attr.name, attr.value)
    } else {
      newEl.setAttribute(attr.name, attr.value)
    }
  })
  // set the copied element's new id
  newEl.removeAttribute('id')
  newEl.id = getNextId()

  // now create copies of all children
  el.childNodes.forEach((child) => {
    switch (child.nodeType) {
      case 1: // element node
        newEl.append(copyElem(child, getNextId))
        break
      case 3: // text node
      case 4: // cdata section node
        newEl.append(ownerDocument.createTextNode(child.nodeValue ?? ''))
        break
      default:
        break
    }
  })

  if (dataStorage.has(el, 'gsvg')) {
    const firstChild = newEl.firstElementChild || newEl.firstChild
    if (firstChild) {
      dataStorage.put(newEl, 'gsvg', firstChild)
    }
  }
  if (dataStorage.has(el, 'symbol')) {
    dataStorage.put(newEl, 'symbol', dataStorage.get(el, 'symbol'))
  }
  if (dataStorage.has(el, 'ref')) {
    dataStorage.put(newEl, 'ref', dataStorage.get(el, 'ref'))
  }

  if (newEl.tagName === 'image') {
    preventClickDefault(newEl)
  }

  return newEl
}
