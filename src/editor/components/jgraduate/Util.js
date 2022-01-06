/**
 * @param {any} obj
 * @returns {any}
 */
export function findPos (obj) {
  let curleft = 0
  let curtop = 0
  if (obj.offsetParent) {
    do {
      curleft += obj.offsetLeft
      curtop += obj.offsetTop
    // eslint-disable-next-line no-cond-assign
    } while (obj = obj.offsetParent)
    return { left: curleft, top: curtop }
  }
  return { left: curleft, top: curtop }
}

export function isObject (item) {
  return (item && typeof item === 'object' && !Array.isArray(item))
}

export function mergeDeep (target, source) {
  const output = Object.assign({}, target)
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) { Object.assign(output, { [key]: source[key] }) } else { output[key] = mergeDeep(target[key], source[key]) }
      } else {
        Object.assign(output, { [key]: source[key] })
      }
    })
  }
  return output
}

/**
 * Get the closest matching element up the DOM tree.
 * @param  {Element} elem     Starting element
 * @param  {String}  selector Selector to match against (class, ID, data attribute, or tag)
 * @return {Boolean|Element}  Returns null if not match found
 */
export function getClosest (elem, selector) {
  const firstChar = selector.charAt(0)
  const supports = 'classList' in document.documentElement
  let attribute; let value
  // If selector is a data attribute, split attribute from value
  if (firstChar === '[') {
    selector = selector.substr(1, selector.length - 2)
    attribute = selector.split('=')
    if (attribute.length > 1) {
      value = true
      attribute[1] = attribute[1].replace(/"/g, '').replace(/'/g, '')
    }
  }
  // Get closest match
  for (; elem && elem !== document && elem.nodeType === 1; elem = elem.parentNode) {
    // If selector is a class
    if (firstChar === '.') {
      if (supports) {
        if (elem.classList.contains(selector.substr(1))) {
          return elem
        }
      } else {
        if (new RegExp('(^|\\s)' + selector.substr(1) + '(\\s|$)').test(elem.className)) {
          return elem
        }
      }
    }
    // If selector is an ID
    if (firstChar === '#') {
      if (elem.id === selector.substr(1)) {
        return elem
      }
    }
    // If selector is a data attribute
    if (firstChar === '[') {
      if (elem.hasAttribute(attribute[0])) {
        if (value) {
          if (elem.getAttribute(attribute[0]) === attribute[1]) {
            return elem
          }
        } else {
          return elem
        }
      }
    }
    // If selector is a tag
    if (elem.tagName.toLowerCase() === selector) {
      return elem
    }
  }
  return null
}

/**
 * Get all DOM element up the tree that contain a class, ID, or data attribute
 * @param  {Node} elem The base element
 * @param  {String} selector The class, id, data attribute, or tag to look for
 * @return {Array} Null if no match
 */
export function getParents (elem, selector) {
  const parents = []
  const firstChar = selector?.charAt(0)
  // Get matches
  for (; elem && elem !== document; elem = elem.parentNode) {
    if (selector) {
      // If selector is a class
      if (firstChar === '.') {
        if (elem.classList.contains(selector.substr(1))) {
          parents.push(elem)
        }
      }
      // If selector is an ID
      if (firstChar === '#') {
        if (elem.id === selector.substr(1)) {
          parents.push(elem)
        }
      }
      // If selector is a data attribute
      if (firstChar === '[') {
        if (elem.hasAttribute(selector.substr(1, selector.length - 1))) {
          parents.push(elem)
        }
      }
      // If selector is a tag
      if (elem.tagName.toLowerCase() === selector) {
        parents.push(elem)
      }
    } else {
      parents.push(elem)
    }
  }
  // Return parents if any exist
  return parents.length ? parents : null
}

export function getParentsUntil (elem, parent, selector) {
  const parents = []
  const parentType = parent?.charAt(0)
  const selectorType = selector?.selector.charAt(0)
  // Get matches
  for (; elem && elem !== document; elem = elem.parentNode) {
    // Check if parent has been reached
    if (parent) {
      // If parent is a class
      if (parentType === '.') {
        if (elem.classList.contains(parent.substr(1))) {
          break
        }
      }
      // If parent is an ID
      if (parentType === '#') {
        if (elem.id === parent.substr(1)) {
          break
        }
      }
      // If parent is a data attribute
      if (parentType === '[') {
        if (elem.hasAttribute(parent.substr(1, parent.length - 1))) {
          break
        }
      }
      // If parent is a tag
      if (elem.tagName.toLowerCase() === parent) {
        break
      }
    }
    if (selector) {
      // If selector is a class
      if (selectorType === '.') {
        if (elem.classList.contains(selector.substr(1))) {
          parents.push(elem)
        }
      }
      // If selector is an ID
      if (selectorType === '#') {
        if (elem.id === selector.substr(1)) {
          parents.push(elem)
        }
      }
      // If selector is a data attribute
      if (selectorType === '[') {
        if (elem.hasAttribute(selector.substr(1, selector.length - 1))) {
          parents.push(elem)
        }
      }
      // If selector is a tag
      if (elem.tagName.toLowerCase() === selector) {
        parents.push(elem)
      }
    } else {
      parents.push(elem)
    }
  }
  // Return parents if any exist
  return parents.length ? parents : null
}
