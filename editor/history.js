/**
 * SVG-edit History Commands
 *
 * Licensed under the Apache License, Version 2
 *
 * Copyright(c) 2010 Jeff Schiller
 */

// Dependencies:
// 1) jQuery

(function() {

if (!window.svgedit) {
	window.svgedit = {};
}

if (!svgedit.history) {
	svgedit.history = {};
}

// TODO: create a 'typing' command object that tracks changes in text
// if a new Typing command is created and the top command on the stack is also a Typing
// and they both affect the same element, then collapse the two commands into one

// Group: Undo/Redo history management

// Class: svgedit.history.ChangeElementCommand
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
		else if (attr == "#href") this.newValues[attr] = getHref(elem);
		else this.newValues[attr] = elem.getAttribute(attr);
	}

	// Function: ChangeElementCommand.apply
	// Performs the stored change action
	this.apply = function() {
		var bChangedTransform = false;
		for(var attr in this.newValues ) {
			if (this.newValues[attr]) {
				if (attr == "#text") this.elem.textContent = this.newValues[attr];
				else if (attr == "#href") setHref(this.elem, this.newValues[attr])
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
			else if (attr == "stdDeviation") { canvas.setBlurOffsets(this.elem.parentNode, this.newValues[attr]); }
			
		}
		// relocate rotational transform, if necessary
		if(!bChangedTransform) {
			var angle = getRotationAngle(elem);
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
		// if we are changing layer names, re-identify all layers
		if (this.elem.tagName == "title" && this.elem.parentNode.parentNode == svgcontent) {
			identifyLayers();
		}		
		return true;
	};

	// Function: ChangeElementCommand.unapply
	// Reverses the stored change action
	this.unapply = function() {
		var bChangedTransform = false;
		for(var attr in this.oldValues ) {
			if (this.oldValues[attr]) {
				if (attr == "#text") this.elem.textContent = this.oldValues[attr];
				else if (attr == "#href") setHref(this.elem, this.oldValues[attr]);
				else this.elem.setAttribute(attr, this.oldValues[attr]);
				
				if (attr == "stdDeviation") canvas.setBlurOffsets(this.elem.parentNode, this.oldValues[attr]);
			}
			else {
				if (attr == "#text") this.elem.textContent = "";
				else this.elem.removeAttribute(attr);
			}
			if (attr == "transform") { bChangedTransform = true; }
		}
		// relocate rotational transform, if necessary
		if(!bChangedTransform) {
			var angle = getRotationAngle(elem);
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
		// if we are changing layer names, re-identify all layers
		if (this.elem.tagName == "title" && this.elem.parentNode.parentNode == svgcontent) {
			identifyLayers();
		}		
		
		// Remove transformlist to prevent confusion that causes bugs like 575.
		if (svgTransformLists[this.elem.id]) {
			delete svgTransformLists[this.elem.id];
		}	
		
		return true;
	};

	// Function: ChangeElementCommand.elements
	// Returns array with element associated with this command
	this.elements = function() { return [this.elem]; }
};

// Class: svgedit.history.InsertElementCommand
// History command for an element that was added to the DOM
//
// Parameters:
// elem - The newly added DOM element
// text - An optional string visible to user related to this change
svgedit.history.InsertElementCommand = function(elem, text) {
	this.elem = elem;
	this.text = text || ("Create " + elem.tagName);
	this.parent = elem.parentNode;
	
	// Function: InsertElementCommand.apply
	// Re-Inserts the new element
	this.apply = function() { 
		this.elem = this.parent.insertBefore(this.elem, this.elem.nextSibling); 
		
		restoreRefElems(this.elem);
		
		if (this.parent == svgcontent) {
			identifyLayers();
		}		
	};

	// Function: InsertElementCommand.unapply
	// Removes the element
	this.unapply = function() {
		this.parent = this.elem.parentNode;
		this.elem = this.elem.parentNode.removeChild(this.elem);
		if (this.parent == svgcontent) {
			identifyLayers();
		}		
	};

	// Function: InsertElementCommand.elements
	// Returns array with element associated with this command
	this.elements = function() { return [this.elem]; };
};

// Class: svgedit.history.RemoveElementCommand
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

	// Function: RemoveElementCommand.apply
	// Re-removes the new element
	this.apply = function() {	
		if (svgTransformLists[this.elem.id]) {
			delete svgTransformLists[this.elem.id];
		}	
	
		this.parent = this.elem.parentNode;
		this.elem = this.parent.removeChild(this.elem);
		if (this.parent == svgcontent) {
			identifyLayers();
		}		
	};

	// Function: RemoveElementCommand.unapply
	// Re-adds the new element
	this.unapply = function() { 
		if (svgTransformLists[this.elem.id]) {
			delete svgTransformLists[this.elem.id];
		}

		this.parent.insertBefore(this.elem, this.elem.nextSibling);
		
		restoreRefElems(this.elem);
		
		if (this.parent === svgcontent) {
			identifyLayers();
		}		
	};

	// Function: RemoveElementCommand.elements
	// Returns array with element associated with this command
	this.elements = function() { return [this.elem]; };
	
	// special hack for webkit: remove this element's entry in the svgTransformLists map
	if (svgTransformLists[elem.id]) {
		delete svgTransformLists[elem.id];
	}
};

// Class: svgedit.history.MoveElementCommand
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

	// Function: MoveElementCommand.unapply
	// Re-positions the element
	this.apply = function() {
		this.elem = this.newParent.insertBefore(this.elem, this.newNextSibling);
		if (this.newParent == svgcontent) {
			identifyLayers();
		}
	};

	// Function: MoveElementCommand.unapply
	// Positions the element back to its original location
	this.unapply = function() {
		this.elem = this.oldParent.insertBefore(this.elem, this.oldNextSibling);
		if (this.oldParent == svgcontent) {
			identifyLayers();
		}
	};

	// Function: MoveElementCommand.elements
	// Returns array with element associated with this command
	this.elements = function() { return [this.elem]; };
};


// Class: svgedit.history.BatchCommand
// History command that can contain/execute multiple other commands
//
// Parameters:
// text - An optional string visible to user related to this change
svgedit.history.BatchCommand = function(text) {
	this.text = text || "Batch Command";
	this.stack = [];

	// Function: BatchCommand.apply
	// Runs "apply" on all subcommands
	this.apply = function() {
		var len = this.stack.length;
		for (var i = 0; i < len; ++i) {
			this.stack[i].apply();
		}
	};

	// Function: BatchCommand.unapply
	// Runs "unapply" on all subcommands
	this.unapply = function() {
		for (var i = this.stack.length-1; i >= 0; i--) {
			this.stack[i].unapply();
		}
	};

	// Function: BatchCommand.elements
	// Iterate through all our subcommands and returns all the elements we are changing
	this.elements = function() {
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

	// Function: BatchCommand.addSubCommand
	// Adds a given command to the history stack
	//
	// Parameters:
	// cmd - The undo command object to add
	this.addSubCommand = function(cmd) { this.stack.push(cmd); };

	// Function: BatchCommand.isEmpty
	// Returns a boolean indicating whether or not the batch command is empty
	this.isEmpty = function() { return this.stack.length == 0; };
};

})();
