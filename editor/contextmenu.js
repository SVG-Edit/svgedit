/* globals jQuery */
/**
 * Package: svgedit.contextmenu
 *
 * Licensed under the Apache License, Version 2
 *
 * Author: Adam Bender
 */
// Dependencies:
// 1) jQuery (for dom injection of context menus)

const $ = jQuery;

let contextMenuExtensions = {};

const menuItemIsValid = function (menuItem) {
  return menuItem && menuItem.id && menuItem.label && menuItem.action && typeof menuItem.action === 'function';
};
export const addContextMenuItem = function (menuItem) {
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
export const hasCustomMenuItemHandler = function (handlerKey) {
  return Boolean(contextMenuExtensions[handlerKey]);
};
export const getCustomMenuItemHandler = function (handlerKey) {
  return contextMenuExtensions[handlerKey].action;
};
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

export const injectExtendedContextMenuItemsIntoDom = function () {
  for (const menuItem in contextMenuExtensions) {
    injectExtendedContextMenuItemIntoDom(contextMenuExtensions[menuItem]);
  }
};
export const resetCustomMenus = function () { contextMenuExtensions = {}; };
