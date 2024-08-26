/** A storage solution aimed at replacing jQuerys data function.
* Implementation Note: Elements are stored in a (WeakMap)[https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap].
* This makes sure the data is garbage collected when the node is removed.
*/
const dataStorage = {
  _storage: new WeakMap(),
  put: function (element, key, obj) {
    if (!this._storage.has(element)) {
      this._storage.set(element, new Map())
    }
    this._storage.get(element).set(key, obj)
  },
  get: function (element, key) {
    return this._storage.get(element)?.get(key)
  },
  has: function (element, key) {
    return this._storage.has(element) && this._storage.get(element).has(key)
  },
  remove: function (element, key) {
    const ret = this._storage.get(element).delete(key)
    if (this._storage.get(element).size === 0) {
      this._storage.delete(element)
    }
    return ret
  }
}

export default dataStorage
