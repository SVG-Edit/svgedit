/** A storage solution aimed at replacing jQuerys data function.
* Implementation Note: Elements are stored in a (WeakMap)[https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap].
* This makes sure the data is garbage collected when the node is removed.
*/
const dataStorage = {
  _storage: new WeakMap(),
  _isValidKey: function (element) {
    return element !== null && (typeof element === 'object' || typeof element === 'function')
  },
  put: function (element, key, obj) {
    if (!this._isValidKey(element)) {
      return
    }
    let elementMap = this._storage.get(element)
    if (!elementMap) {
      elementMap = new Map()
      this._storage.set(element, elementMap)
    }
    elementMap.set(key, obj)
  },
  get: function (element, key) {
    if (!this._isValidKey(element)) {
      return undefined
    }
    return this._storage.get(element)?.get(key)
  },
  has: function (element, key) {
    if (!this._isValidKey(element)) {
      return false
    }
    return this._storage.get(element)?.has(key) === true
  },
  remove: function (element, key) {
    if (!this._isValidKey(element)) {
      return false
    }
    const elementMap = this._storage.get(element)
    if (!elementMap) {
      return false
    }
    const ret = elementMap.delete(key)
    if (elementMap.size === 0) {
      this._storage.delete(element)
    }
    return ret
  }
}

export default dataStorage
