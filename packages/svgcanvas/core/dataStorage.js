/**
 * A storage solution aimed at replacing jQuery's data function.
 * Implementation Note: Elements are stored in a [WeakMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap).
 * This makes sure the data is garbage collected when the node is removed.
 *
 * @module dataStorage
 * @license MIT
 */
class DataStorage {
  #storage = new WeakMap()

  /**
   * Checks if the provided element is a valid WeakMap key.
   * @param {any} element - The element to validate
   * @returns {boolean} True if the element can be used as a WeakMap key
   * @private
   */
  #isValidKey = (element) => {
    return element !== null && (typeof element === 'object' || typeof element === 'function')
  }

  /**
   * Stores data associated with an element.
   * @param {Object|Function} element - The element to store data for
   * @param {string} key - The key to store the data under
   * @param {any} obj - The data to store
   * @returns {void}
   */
  put (element, key, obj) {
    if (!this.#isValidKey(element)) {
      return
    }
    let elementMap = this.#storage.get(element)
    if (!elementMap) {
      elementMap = new Map()
      this.#storage.set(element, elementMap)
    }
    elementMap.set(key, obj)
  }

  /**
   * Retrieves data associated with an element.
   * @param {Object|Function} element - The element to retrieve data for
   * @param {string} key - The key the data was stored under
   * @returns {any|undefined} The stored data, or undefined if not found
   */
  get (element, key) {
    if (!this.#isValidKey(element)) {
      return undefined
    }
    return this.#storage.get(element)?.get(key)
  }

  /**
   * Checks if an element has data stored under a specific key.
   * @param {Object|Function} element - The element to check
   * @param {string} key - The key to check for
   * @returns {boolean} True if the element has data stored under the key
   */
  has (element, key) {
    if (!this.#isValidKey(element)) {
      return false
    }
    return this.#storage.get(element)?.has(key) === true
  }

  /**
   * Removes data associated with an element.
   * @param {Object|Function} element - The element to remove data from
   * @param {string} key - The key the data was stored under
   * @returns {boolean} True if the data was removed, false otherwise
   */
  remove (element, key) {
    if (!this.#isValidKey(element)) {
      return false
    }
    const elementMap = this.#storage.get(element)
    if (!elementMap) {
      return false
    }
    const ret = elementMap.delete(key)
    if (elementMap.size === 0) {
      this.#storage.delete(element)
    }
    return ret
  }
}

// Export singleton instance for backward compatibility
const dataStorage = new DataStorage()
export default dataStorage
