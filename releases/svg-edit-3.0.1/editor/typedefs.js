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
* representing arguments for passing around
* @typedef {GenericArray} ArgumentsArray
*/
/**
* This should only be used for items known to be wholly arbitrary
* @typedef {*} Any
*/

/**
* @external Window
*/
