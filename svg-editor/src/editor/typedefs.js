/**
* @typedef {number} Float
*/

/**
* @typedef {Float} Integer
*/

/**
* @typedef {null|boolean|Float|string|GenericArray|PlainObject} JSON
*/

/**
* This should only be used when the return result from a callback
*  is not known as to type.
* @typedef {any} ArbitraryCallbackResult
*/

/**
* @callback GenericCallback
* @param {...any} args Signature dependent on the function
* @returns {ArbitraryCallbackResult} Return dependent on the function
*/

/**
* This should only be used for objects known to be potentially arbitrary in form.
* For those whose determination has not yet been made, simply use type `object`
* (or type `?` if it may also be a primitive).
* @typedef {object} ArbitraryObject
*/
/**
* @typedef {object} ArbitraryModule
*/

/**
* This should only be used for objects known to be potentially arbitrary in form,
* but not of a special type.
* For those whose determination has not yet been made, simply use type `object`.
* @typedef {ArbitraryObject} PlainObject
*/

/**
* This should only be used for arrays known to be potentially arbitrary in form.
* For those whose determination has not yet been made, simply use type `Array`.
* @typedef {Array} GenericArray
*/

/**
* This should only be used for arrays known to be potentially arbitrary in form and
* representing arguments for passing around.
* @typedef {GenericArray} ArgumentsArray
*/

/**
* The `Any` type should only be used for items known to be wholly arbitrary.
*/

/**
* @external Window
*/

/**
 * @external JamilihArray
 * @type {GenericArray}
 * @property {string} 0 Element name
 * @property {PlainObject<string, string>|JamilihArray} [1] Generally a map from an attribute name to attribute value, but also adds event handlers, etc.
 * @property {JamilihArray} [2] Children
 * @see {@link https://github.com/brettz9/jamilih/}
 */
