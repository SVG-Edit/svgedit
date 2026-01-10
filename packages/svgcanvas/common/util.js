/**
 * @param {any} obj
 * @returns {any}
 */
export const findPos = (obj) => {
  let left = 0
  let top = 0

  if (obj?.offsetParent) {
    let current = obj
    do {
      left += current.offsetLeft
      top += current.offsetTop
      current = current.offsetParent
    } while (current)
  }

  return { left, top }
}

export const isObject = (item) =>
  item && typeof item === 'object' && !Array.isArray(item)

export const mergeDeep = (target, source) => {
  const output = { ...target }

  if (isObject(target) && isObject(source)) {
    for (const key of Object.keys(source)) {
      if (isObject(source[key])) {
        output[key] = key in target
          ? mergeDeep(target[key], source[key])
          : source[key]
      } else {
        output[key] = source[key]
      }
    }
  }

  return output
}

/**
 * Get the closest matching element up the DOM tree.
 * Uses native Element.closest() when possible for better performance.
 * @param  {Element} elem     Starting element
 * @param  {String}  selector Selector to match against (class, ID, data attribute, or tag)
 * @return {Element|null}     Returns null if no match found
 */
export const getClosest = (elem, selector) => {
  // Use native closest for standard CSS selectors
  if (elem?.closest) {
    try {
      return elem.closest(selector)
    } catch (e) {
      // Fallback for invalid selectors
    }
  }

  // Fallback implementation for edge cases
  const selectorMatcher = {
    '.': (el, sel) => el.classList?.contains(sel.slice(1)),
    '#': (el, sel) => el.id === sel.slice(1),
    '[': (el, sel) => {
      const [attr, val] = sel.slice(1, -1).split('=').map(s => s.replace(/["']/g, ''))
      return val ? el.getAttribute(attr) === val : el.hasAttribute(attr)
    },
    tag: (el, sel) => el.tagName?.toLowerCase() === sel
  }

  const firstChar = selector.charAt(0)
  const matcher = selectorMatcher[firstChar] || selectorMatcher.tag

  for (let current = elem; current && current !== document && current.nodeType === 1; current = current.parentNode) {
    if (matcher(current, selector)) return current
  }

  return null
}

/**
 * Get all DOM elements up the tree that match a selector
 * @param  {Node} elem The base element
 * @param  {String} selector The class, id, data attribute, or tag to look for
 * @return {Array|null} Array of matching elements or null if no match
 */
export const getParents = (elem, selector) => {
  const parents = []
  const matchers = {
    '.': (el, sel) => el.classList?.contains(sel.slice(1)),
    '#': (el, sel) => el.id === sel.slice(1),
    '[': (el, sel) => el.hasAttribute(sel.slice(1, -1)),
    tag: (el, sel) => el.tagName?.toLowerCase() === sel
  }

  const firstChar = selector?.charAt(0)
  const matcher = selector ? (matchers[firstChar] || matchers.tag) : null

  for (let current = elem; current && current !== document; current = current.parentNode) {
    if (!selector || matcher(current, selector)) {
      parents.push(current)
    }
  }

  return parents.length > 0 ? parents : null
}

export const getParentsUntil = (elem, parent, selector) => {
  const parents = []

  const matchers = {
    '.': (el, sel) => el.classList?.contains(sel.slice(1)),
    '#': (el, sel) => el.id === sel.slice(1),
    '[': (el, sel) => el.hasAttribute(sel.slice(1, -1)),
    tag: (el, sel) => el.tagName?.toLowerCase() === sel
  }

  const getMatcherFn = (selectorStr) => {
    if (!selectorStr) return null
    const firstChar = selectorStr.charAt(0)
    return matchers[firstChar] || matchers.tag
  }

  const parentMatcher = getMatcherFn(parent)
  const selectorMatcher = getMatcherFn(selector)

  for (let current = elem; current && current !== document; current = current.parentNode) {
    // Check if we've reached the parent boundary
    if (parent && parentMatcher?.(current, parent)) {
      break
    }

    // Add to results if matches selector (or no selector specified)
    if (!selector || selectorMatcher?.(current, selector)) {
      parents.push(current)
    }
  }

  return parents.length > 0 ? parents : null
}
