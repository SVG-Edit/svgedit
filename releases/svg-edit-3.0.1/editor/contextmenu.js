/* globals jQuery */
/**
 * Adds context menu functionality
 * @module contextmenu
 * @license Apache-2.0
 * @author Adam Bender
 */
// Dependencies:
// 1) jQuery (for dom injection of context menus)

const $ = jQuery;

let contextMenuExtensions = {};

/**
 * Signature depends on what the user adds; in the case of our uses with
 * SVGEditor, no parameters are passed nor anything expected for a return.
 * @callback module:contextmenu.MenuItemAction
*/

/**
* @typedef {PlainObject} module:contextmenu.MenuItem
* @property {string} id
* @property {string} label
* @property {module:contextmenu.MenuItemAction} action
*/

/**
* @param {module:contextmenu.MenuItem} menuItem
* @returns {boolean}
*/
const menuItemIsValid = function (menuItem) {
  return menuItem && menuItem.id && menuItem.label && menuItem.action && typeof menuItem.action === 'function';
};

/**
* @function module:contextmenu.add
* @param {module:contextmenu.MenuItem} menuItem
* @returns {undefined}
*/
export const add = function (menuItem) {
  // menuItem: {id, label, shortcut, action}
  if (!menuItemIsValid(menuItem)) {
    console.error('Menu items must be defined and have at least properties: id, label, action, where action must be a function');
    return;
  }
  if (menuItem.id in contextMenuExtensions) {
    console.error('Cannot add extension "' + menuItem.id + '", an extension by that name already exists"');
    return;
  }
  // Register menuItem action, see below for deferred menu dom injection
  console.log('Registed contextmenu item: {id:' + menuItem.id + ', label:' + menuItem.label + '}');
  contextMenuExtensions[menuItem.id] = menuItem;
  // TODO: Need to consider how to handle custom enable/disable behavior
};

/**
* @function module:contextmenu.hasCustomHandler
* @param {string} handlerKey
* @returns {boolean}
*/
export const hasCustomHandler = function (handlerKey) {
  return Boolean(contextMenuExtensions[handlerKey]);
};

/**
* @function module:contextmenu.getCustomHandler
* @param {string} handlerKey
* @returns {module:contextmenu.MenuItemAction}
*/
export const getCustomHandler = function (handlerKey) {
  return contextMenuExtensions[handlerKey].action;
};

/**
* @param {module:contextmenu.MenuItem} menuItem
* @returns {undefined}
*/
const injectExtendedContextMenuItemIntoDom = function (menuItem) {
  if (!Object.keys(contextMenuExtensions).length) {
    // all menuItems appear at the bottom of the menu in their own container.
    // if this is the first extension menu we need to add the separator.
    $('#cmenu_canvas').append("<li class='separator'>");
  }
  const shortcut = menuItem.shortcut || '';
  $('#cmenu_canvas').append("<li class='disabled'><a href='#" + menuItem.id + "'>" +
    menuItem.label + "<span class='shortcut'>" +
    shortcut + '</span></a></li>');
};

/**
* @function module:contextmenu.injectExtendedContextMenuItemsIntoDom
* @returns {undefined}
*/
export const injectExtendedContextMenuItemsIntoDom = function () {
  for (const menuItem in contextMenuExtensions) {
    injectExtendedContextMenuItemIntoDom(contextMenuExtensions[menuItem]);
  }
};
/**
* @function module:contextmenu.resetCustomMenus
* @returns {undefined}
*/
export const resetCustomMenus = function () { contextMenuExtensions = {}; };
