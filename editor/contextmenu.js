/*globals $, svgEditor*/
/*jslint vars: true, eqeq: true*/
/**
 * Package: svgedit.contextmenu
 * 
 * Licensed under the Apache License, Version 2
 * 
 * Author: Adam Bender
 */
// Dependencies:
// 1) jQuery (for dom injection of context menus)
var svgedit = svgedit || {};
(function() {
	var self = this;
	if (!svgedit.contextmenu) {
		svgedit.contextmenu = {};
	}
	self.contextMenuExtensions = {};
	var menuItemIsValid = function(menuItem) {
		return menuItem && menuItem.id && menuItem.label && menuItem.action && typeof menuItem.action == 'function';
	};
	var addContextMenuItem = function(menuItem) {
		// menuItem: {id, label, shortcut, action}
		if (!menuItemIsValid(menuItem)) {
			console.error("Menu items must be defined and have at least properties: id, label, action, where action must be a function");
			return;
		}
		if (menuItem.id in self.contextMenuExtensions) {
			console.error('Cannot add extension "' + menuItem.id + '", an extension by that name already exists"');
			return;
		}
		// Register menuItem action, see below for deferred menu dom injection
		console.log("Registed contextmenu item: {id:"+ menuItem.id+", label:"+menuItem.label+"}");
		self.contextMenuExtensions[menuItem.id] = menuItem;
		//TODO: Need to consider how to handle custom enable/disable behavior
	};
	var hasCustomHandler = function(handlerKey) {
		return self.contextMenuExtensions[handlerKey] && true;
	};
	var getCustomHandler = function(handlerKey) {
		return self.contextMenuExtensions[handlerKey].action;
	};
	var injectExtendedContextMenuItemIntoDom = function(menuItem) {
		if (Object.keys(self.contextMenuExtensions).length === 0) {
			// all menuItems appear at the bottom of the menu in their own container.
			// if this is the first extension menu we need to add the separator.
			$("#cmenu_canvas").append("<li class='separator'>");
		}
		var shortcut = menuItem.shortcut || "";
		$("#cmenu_canvas").append("<li class='disabled'><a href='#" + menuItem.id + "'>"
									+ menuItem.label + "<span class='shortcut'>"
									+ shortcut + "</span></a></li>");
	};
	// Defer injection to wait out initial menu processing. This probably goes away once all context
	// menu behavior is brought here.
	svgEditor.ready(function() {
		var menuItem;
		for (menuItem in contextMenuExtensions) {
			injectExtendedContextMenuItemIntoDom(contextMenuExtensions[menuItem]);
		}
	});
	svgedit.contextmenu.resetCustomMenus = function(){self.contextMenuExtensions = {};};
	svgedit.contextmenu.add = addContextMenuItem;
	svgedit.contextmenu.hasCustomHandler = hasCustomHandler;
	svgedit.contextmenu.getCustomHandler = getCustomHandler;
}());
