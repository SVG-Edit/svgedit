/**
 * Package: svedit.history
 *
 * Licensed under the Apache License, Version 2
 *
 * Copyright(c) 2010 Jeff Schiller
 */

// Dependencies:
// 1) jQuery
// 2) svgtransformlist.js
// 3) svgutils.js

(function() {

if (!window.svgedit) {
	window.svgedit = {};
}

if (!svgedit.history) {
	svgedit.history = {};
}

// Group: Undo/Redo history management


svgedit.history.HistoryEventTypes = {
	BEFORE_APPLY: 'before_apply',
	AFTER_APPLY: 'after_apply',
	BEFORE_UNAPPLY: 'before_unapply',
	AFTER_UNAPPLY: 'after_unapply'
};

var removedElements = {};

/**
 * Interface: svgedit.history.HistoryCommand
 * An interface that all command objects must implement.
 *
 * interface svgedit.history.HistoryCommand {
 *   void apply();
 *   void unapply();
 *   Element[] elements();
 *   String getText();
 *
 *   static String type();
 * }
 */

// Class: svgedit.history.MoveElementCommand
// implements svgedit.history.HistoryCommand
// History command for an element that had its DOM position changed
//
// Parameters:
// elem - The DOM element that was moved
// oldNextSibling - The element's next sibling before it was moved
// oldParent - The element's parent before it was moved
// text - An optional string visible to user related to this change
svgedit.history.MoveElementCommand = function(elem, oldNextSibling, oldParent, text) {
	this.elem = elem;
	this.text = text ? ("Move " + elem.tagName + " to " + text) : ("Move " + elem.tagName);
	this.oldNextSibling = oldNextSibling;
	this.oldParent = oldParent;
	this.newNextSibling = elem.nextSibling;
	this.newParent = elem.parentNode;
};
svgedit.history.MoveElementCommand.type = function() { return 'svgedit.history.MoveElementCommand'; }
svgedit.history.MoveElementCommand.prototype.type = svgedit.history.MoveElementCommand.type;

// Function: svgedit.history.MoveElementCommand.getText
svgedit.history.MoveElementCommand.prototype.getText = function() {
	return this.text;
};

// Function: svgedit.history.MoveElementCommand.apply
// Re-positions the element
svgedit.history.MoveElementCommand.prototype.apply = function() {
	this.elem = this.newParent.insertBefore(this.elem, this.newNextSibling);
};

// Function: svgedit.history.MoveElementCommand.unapply
// Positions the element back to its original location
svgedit.history.MoveElementCommand.prototype.unapply = function() {
	this.elem = this.oldParent.insertBefore(this.elem, this.oldNextSibling);
};

// Function: svgedit.history.MoveElementCommand.elements
// Returns array with element associated with this command
svgedit.history.MoveElementCommand.prototype.elements = function() {
	return [this.elem];
};


// Class: svgedit.history.InsertElementCommand
// implements svgedit.history.HistoryCommand
// History command for an element that was added to the DOM
//
// Parameters:
// elem - The newly added DOM element
// text - An optional string visible to user related to this change
svgedit.history.InsertElementCommand = function(elem, text) {
	this.elem = elem;
	this.text = text || ("Create " + elem.tagName);
	this.parent = elem.parentNode;
};
svgedit.history.InsertElementCommand.type = function() { return 'svgedit.history.InsertElementCommand'; }
svgedit.history.InsertElementCommand.prototype.type = svgedit.history.InsertElementCommand.type;

// Function: svgedit.history.InsertElementCommand.getText
svgedit.history.InsertElementCommand.prototype.getText = function() {
	return this.text;
};

// Function: svgedit.history.InsertElementCommand.apply
// Re-Inserts the new element
svgedit.history.InsertElementCommand.prototype.apply = function() { 
	this.elem = this.parent.insertBefore(this.elem, this.elem.nextSibling); 
};

// Function: svgedit.history.InsertElementCommand.unapply
// Removes the element
svgedit.history.InsertElementCommand.prototype.unapply = function() {
	this.parent = this.elem.parentNode;
	this.elem = this.elem.parentNode.removeChild(this.elem);
};

// Function: svgedit.history.InsertElementCommand.elements
// Returns array with element associated with this command
svgedit.history.InsertElementCommand.prototype.elements = function() {
	return [this.elem];
};


// Class: svgedit.history.RemoveElementCommand
// implements svgedit.history.HistoryCommand
// History command for an element removed from the DOM
//
// Parameters:
// elem - The removed DOM element
// parent - The DOM element's parent
// text - An optional string visible to user related to this change
svgedit.history.RemoveElementCommand = function(elem, parent, text) {
	this.elem = elem;
	this.text = text || ("Delete " + elem.tagName);
	this.parent = parent;

	// special hack for webkit: remove this element's entry in the svgTransformLists map
	svgedit.transformlist.removeElementFromListMap(elem);
};
svgedit.history.RemoveElementCommand.type = function() { return 'svgedit.history.RemoveElementCommand'; }
svgedit.history.RemoveElementCommand.prototype.type = svgedit.history.RemoveElementCommand.type;

// Function: svgedit.history.RemoveElementCommand.getText
svgedit.history.RemoveElementCommand.prototype.getText = function() {
	return this.text;
};

// Function: RemoveElementCommand.apply
// Re-removes the new element
svgedit.history.RemoveElementCommand.prototype.apply = function() {	
	svgedit.transformlist.removeElementFromListMap(this.elem);

	this.parent = this.elem.parentNode;
	this.elem = this.parent.removeChild(this.elem);
};

// Function: RemoveElementCommand.unapply
// Re-adds the new element
svgedit.history.RemoveElementCommand.prototype.unapply = function() { 
	svgedit.transformlist.removeElementFromListMap(this.elem);

	this.parent.insertBefore(this.elem, this.elem.nextSibling);
};

// Function: RemoveElementCommand.elements
// Returns array with element associated with this command
svgedit.history.RemoveElementCommand.prototype.elements = function() {
	return [this.elem];
};


// Class: svgedit.history.ChangeElementCommand
// implements svgedit.history.HistoryCommand
// History command to make a change to an element. 
// Usually an attribute change, but can also be textcontent.
//
// Parameters:
// elem - The DOM element that was changed
// attrs - An object with the attributes to be changed and the values they had *before* the change
// text - An optional string visible to user related to this change
svgedit.history.ChangeElementCommand = function(elem, attrs, text) {
	this.elem = elem;
	this.text = text ? ("Change " + elem.tagName + " " + text) : ("Change " + elem.tagName);
	this.newValues = {};
	this.oldValues = attrs;
	for (var attr in attrs) {
		if (attr == "#text") this.newValues[attr] = elem.textContent;
		else if (attr == "#href") this.newValues[attr] = svgedit.utilities.getHref(elem);
		else this.newValues[attr] = elem.getAttribute(attr);
	}
};
svgedit.history.ChangeElementCommand.type = function() { return 'svgedit.history.ChangeElementCommand'; }
svgedit.history.ChangeElementCommand.prototype.type = svgedit.history.ChangeElementCommand.type;

// Function: svgedit.history.ChangeElementCommand.getText
svgedit.history.ChangeElementCommand.prototype.getText = function() {
	return this.text;
};

// Function: svgedit.history.ChangeElementCommand.apply
// Performs the stored change action
svgedit.history.ChangeElementCommand.prototype.apply = function() {
	var bChangedTransform = false;
	for(var attr in this.newValues ) {
		if (this.newValues[attr]) {
			if (attr == "#text") this.elem.textContent = this.newValues[attr];
			else if (attr == "#href") svgedit.utilities.setHref(this.elem, this.newValues[attr])
			else this.elem.setAttribute(attr, this.newValues[attr]);
		}
		else {
			if (attr == "#text") this.elem.textContent = "";
			else {
				this.elem.setAttribute(attr, "");
				this.elem.removeAttribute(attr);
			}
		}

		if (attr == "transform") { bChangedTransform = true; }
	}

	// relocate rotational transform, if necessary
	if(!bChangedTransform) {
		var angle = svgedit.utilities.getRotationAngle(this.elem);
		if (angle) {
			var bbox = elem.getBBox();
			var cx = bbox.x + bbox.width/2,
				cy = bbox.y + bbox.height/2;
			var rotate = ["rotate(", angle, " ", cx, ",", cy, ")"].join('');
			if (rotate != elem.getAttribute("transform")) {
				elem.setAttribute("transform", rotate);
			}
		}
	}
	return true;
};

// Function: svgedit.history.ChangeElementCommand.unapply
// Reverses the stored change action
svgedit.history.ChangeElementCommand.prototype.unapply = function() {
	var bChangedTransform = false;
	for(var attr in this.oldValues ) {
		if (this.oldValues[attr]) {
			if (attr == "#text") this.elem.textContent = this.oldValues[attr];
			else if (attr == "#href") svgedit.utilities.setHref(this.elem, this.oldValues[attr]);
			else this.elem.setAttribute(attr, this.oldValues[attr]);
		}
		else {
			if (attr == "#text") this.elem.textContent = "";
			else this.elem.removeAttribute(attr);
		}
		if (attr == "transform") { bChangedTransform = true; }
	}
	// relocate rotational transform, if necessary
	if(!bChangedTransform) {
		var angle = svgedit.utilities.getRotationAngle(this.elem);
		if (angle) {
			var bbox = elem.getBBox();
			var cx = bbox.x + bbox.width/2,
				cy = bbox.y + bbox.height/2;
			var rotate = ["rotate(", angle, " ", cx, ",", cy, ")"].join('');
			if (rotate != elem.getAttribute("transform")) {
				elem.setAttribute("transform", rotate);
			}
		}
	}

	// Remove transformlist to prevent confusion that causes bugs like 575.
	svgedit.transformlist.removeElementFromListMap(this.elem);

	return true;
};

// Function: ChangeElementCommand.elements
// Returns array with element associated with this command
svgedit.history.ChangeElementCommand.prototype.elements = function() {
	return [this.elem];
};


// TODO: create a 'typing' command object that tracks changes in text
// if a new Typing command is created and the top command on the stack is also a Typing
// and they both affect the same element, then collapse the two commands into one


// Class: svgedit.history.BatchCommand
// implements svgedit.history.HistoryCommand
// History command that can contain/execute multiple other commands
//
// Parameters:
// text - An optional string visible to user related to this change
svgedit.history.BatchCommand = function(text) {
	this.text = text || "Batch Command";
	this.stack = [];
};
svgedit.history.BatchCommand.type = function() { return 'svgedit.history.BatchCommand'; }
svgedit.history.BatchCommand.prototype.type = svgedit.history.BatchCommand.type;

// Function: svgedit.history.BatchCommand.getText
svgedit.history.BatchCommand.prototype.getText = function() {
	return this.text;
};

// Function: svgedit.history.BatchCommand.apply
// Runs "apply" on all subcommands
svgedit.history.BatchCommand.prototype.apply = function() {
	var len = this.stack.length;
	for (var i = 0; i < len; ++i) {
		this.stack[i].apply();
	}
};

// Function: svgedit.history.BatchCommand.unapply
// Runs "unapply" on all subcommands
svgedit.history.BatchCommand.prototype.unapply = function() {
	for (var i = this.stack.length-1; i >= 0; i--) {
		this.stack[i].unapply();
	}
};

// Function: svgedit.history.BatchCommand.elements
// Iterate through all our subcommands and returns all the elements we are changing
svgedit.history.BatchCommand.prototype.elements = function() {
	var elems = [];
	var cmd = this.stack.length;
	while (cmd--) {
		var thisElems = this.stack[cmd].elements();
		var elem = thisElems.length;
		while (elem--) {
			if (elems.indexOf(thisElems[elem]) == -1) elems.push(thisElems[elem]);
		}
	}
	return elems;
};

// Function: svgedit.history.BatchCommand.addSubCommand
// Adds a given command to the history stack
//
// Parameters:
// cmd - The undo command object to add
svgedit.history.BatchCommand.prototype.addSubCommand = function(cmd) {
	this.stack.push(cmd);
};

// Function: svgedit.history.BatchCommand.isEmpty
// Returns a boolean indicating whether or not the batch command is empty
svgedit.history.BatchCommand.prototype.isEmpty = function() {
	return this.stack.length == 0;
};


/**
 * Interface: svgedit.history.HistoryEventHandler
 * An interface for objects that will handle history events.
 *
 * interface svgedit.history.HistoryEventHandler {
 *   void handleHistoryEvent(eventType, command);
 * }
 *
 * eventType is a string conforming to one of the HistoryEvent types (see above).
 * command is an object fulfilling the HistoryCommand interface (see above).
 */

// Class: svgedit.history.UndoManager
// Parameters:
// historyEventHandler - an object that conforms to the HistoryEventHandler interface
// (see above)
svgedit.history.UndoManager = function(historyEventHandler) {
	this.handler_ = historyEventHandler || null;
	this.undoStackPointer = 0;
	this.undoStack = [];

	// this is the stack that stores the original values, the elements and
	// the attribute name for begin/finish
	this.undoChangeStackPointer = -1;
	this.undoableChangeStack = [];
};
	
// Function: svgedit.history.UndoManager.resetUndoStack
// Resets the undo stack, effectively clearing the undo/redo history
svgedit.history.UndoManager.prototype.resetUndoStack = function() {
	this.undoStack = [];
	this.undoStackPointer = 0;
};

// Function: svgedit.history.UndoManager.getUndoStackSize
// Returns: 
// Integer with the current size of the undo history stack
svgedit.history.UndoManager.prototype.getUndoStackSize = function() {
	return this.undoStackPointer;
};

// Function: svgedit.history.UndoManager.getRedoStackSize
// Returns: 
// Integer with the current size of the redo history stack
svgedit.history.UndoManager.prototype.getRedoStackSize = function() {
	return this.undoStack.length - this.undoStackPointer;
};

// Function: svgedit.history.UndoManager.getNextUndoCommandText
// Returns: 
// String associated with the next undo command
svgedit.history.UndoManager.prototype.getNextUndoCommandText = function() { 
	return this.undoStackPointer > 0 ? this.undoStack[this.undoStackPointer-1].getText() : "";
};

// Function: svgedit.history.UndoManager.getNextRedoCommandText
// Returns: 
// String associated with the next redo command
svgedit.history.UndoManager.prototype.getNextRedoCommandText = function() { 
	return this.undoStackPointer < this.undoStack.length ? this.undoStack[this.undoStackPointer].getText() : "";
};

// Function: svgedit.history.UndoManager.undo
// Performs an undo step
svgedit.history.UndoManager.prototype.undo = function() {
	if (this.undoStackPointer > 0) {
		var cmd = this.undoStack[--this.undoStackPointer];
		
		if (this.handler_ != null) {
			this.handler_.handleHistoryEvent(svgedit.history.HistoryEventTypes.BEFORE_UNAPPLY, cmd);
		}
		
		cmd.unapply();
		
		if (this.handler_ != null) {
			this.handler_.handleHistoryEvent(svgedit.history.HistoryEventTypes.AFTER_UNAPPLY, cmd);
		}
	}
};

// Function: svgedit.history.UndoManager.redo		
// Performs a redo step
svgedit.history.UndoManager.prototype.redo = function() {
	if (this.undoStackPointer < this.undoStack.length && this.undoStack.length > 0) {
		var cmd = this.undoStack[this.undoStackPointer++];

		if (this.handler_ != null) {
			this.handler_.handleHistoryEvent(svgedit.history.HistoryEventTypes.BEFORE_APPLY, cmd);
		}

		cmd.apply();

		if (this.handler_ != null) {
			this.handler_.handleHistoryEvent(svgedit.history.HistoryEventTypes.AFTER_APPLY, cmd);
		}
	}
};
	
// Function: svgedit.history.UndoManager.addCommandToHistory
// Adds a command object to the undo history stack
//
// Parameters: 
// cmd - The command object to add
svgedit.history.UndoManager.prototype.addCommandToHistory = function(cmd) {
	// FIXME: we MUST compress consecutive text changes to the same element
	// (right now each keystroke is saved as a separate command that includes the
	// entire text contents of the text element)
	// TODO: consider limiting the history that we store here (need to do some slicing)
	
	// if our stack pointer is not at the end, then we have to remove
	// all commands after the pointer and insert the new command
	if (this.undoStackPointer < this.undoStack.length && this.undoStack.length > 0) {
		this.undoStack = this.undoStack.splice(0, this.undoStackPointer);
	}
	this.undoStack.push(cmd);
	this.undoStackPointer = this.undoStack.length;
};


// Function: svgedit.history.UndoManager.beginUndoableChange
// This function tells the canvas to remember the old values of the 
// attrName attribute for each element sent in.  The elements and values 
// are stored on a stack, so the next call to finishUndoableChange() will 
// pop the elements and old values off the stack, gets the current values
// from the DOM and uses all of these to construct the undo-able command.
//
// Parameters: 
// attrName - The name of the attribute being changed
// elems - Array of DOM elements being changed
svgedit.history.UndoManager.prototype.beginUndoableChange = function(attrName, elems) {
	var p = ++this.undoChangeStackPointer;
	var i = elems.length;
	var oldValues = new Array(i), elements = new Array(i);
	while (i--) {
		var elem = elems[i];
		if (elem == null) continue;
		elements[i] = elem;
		oldValues[i] = elem.getAttribute(attrName);
	}
	this.undoableChangeStack[p] = {'attrName': attrName,
							'oldValues': oldValues,
							'elements': elements};
};

// Function: svgedit.history.UndoManager.finishUndoableChange
// This function returns a BatchCommand object which summarizes the
// change since beginUndoableChange was called.  The command can then
// be added to the command history
//
// Returns: 
// Batch command object with resulting changes
svgedit.history.UndoManager.prototype.finishUndoableChange = function() {
	var p = this.undoChangeStackPointer--;
	var changeset = this.undoableChangeStack[p];
	var i = changeset['elements'].length;
	var attrName = changeset['attrName'];
	var batchCmd = new svgedit.history.BatchCommand("Change " + attrName);
	while (i--) {
		var elem = changeset['elements'][i];
		if (elem == null) continue;
		var changes = {};
		changes[attrName] = changeset['oldValues'][i];
		if (changes[attrName] != elem.getAttribute(attrName)) {
			batchCmd.addSubCommand(new svgedit.history.ChangeElementCommand(elem, changes, attrName));
		}
	}
	this.undoableChangeStack[p] = null;
	return batchCmd;
};


})();