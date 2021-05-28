import { isWebkit } from '../common/browser.js';
import { convertPath } from './path.js';
import { preventClickDefault } from './utilities.js';

/**
 * Create a clone of an element, updating its ID and its children's IDs when needed.
 * @function module:utilities.copyElem
 * @param {Element} el - DOM element to clone
 * @param {module:utilities.GetNextID} getNextId - The getter of the next unique ID.
 * @returns {Element} The cloned element
 */
export const copyElem = function (el, getNextId) {
  // manually create a copy of the element
  const newEl = document.createElementNS(el.namespaceURI, el.nodeName);
  Object.values(el.attributes).forEach((attr) => {
    newEl.setAttributeNS(attr.namespaceURI, attr.nodeName, attr.value);
  });
  // set the copied element's new id
  newEl.removeAttribute('id');
  newEl.id = getNextId();

  // Opera's "d" value needs to be reset for Opera/Win/non-EN
  // Also needed for webkit (else does not keep curved segments on clone)
  if (isWebkit() && el.nodeName === 'path') {
    const fixedD = convertPath(el);
    newEl.setAttribute('d', fixedD);
  }

  // now create copies of all children
  el.childNodes.forEach(function(child){
    switch (child.nodeType) {
    case 1: // element node
      newEl.append(copyElem(child, getNextId));
      break;
    case 3: // text node
      newEl.textContent = child.nodeValue;
      break;
    default:
      break;
    }
  });

  if (el.dataset.gsvg) {
    newEl.dataset.gsvg = newEl.firstChild;
  } else if (el.dataset.symbol) {
    const ref = el.dataset.symbol;
    newEl.dataset.ref =  ref;
    newEl.dataset.symbol =  ref;
  } else if (newEl.tagName === 'image') {
    preventClickDefault(newEl);
  }

  return newEl;
};
