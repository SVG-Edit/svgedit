/**
 * Package: svgedit.document
 *
 * Licensed under the Apache License, Version 2
 *
 * Copyright(c) 2010 Jeff Schiller
 */

/*
 TODOs:

 Phase 1:
 - migrate usages of randomizeIds() to proxy into the Document

 Phase 2:
 - migrate uniquifyElems into this module
 - migrate as many usages of svgcontent in svgcanvas to using a Document instance as possible

 */
// Dependencies:
// 1) jQuery

(function() {
if (!window.svgedit) {
	window.svgedit = {};
}

if (!svgedit.document) {
	svgedit.document = {};
}

var svg_ns = "http://www.w3.org/2000/svg";
var se_ns = "http://svg-edit.googlecode.com";

/**
 * This class encapsulates the concept of a SVG-edit document.
 *
 * @param svgElem {SVGSVGElement} The SVG DOM Element that this JS object
 *     encapsulates.  If the svgElem has a se:nonce attribute on it, then
 *     IDs will use the nonce as they are generated.
 * @param opt_idPrefix {String} The ID prefix to use.  Defaults to "svg_"
 *     if not specified.
 */
svgedit.document.Document = function(svgElem, opt_idPrefix) {
	if (!svgElem || !svgElem.tagName || !svgElem.namespaceURI ||
		svgElem.tagName != 'svg' || svgElem.namespaceURI != svg_ns) {
		throw "Error: svgedit.document.Document instance initialized without a <svg> element";
	}

	this.svgElem_ = svgElem;
	this.obj_num = 0;
	this.idPrefix = opt_idPrefix || "svg_";
	this.releasedNums = [];

	// Determine if the <svg> element has a nonce on it
	this.nonce_ = this.svgElem_.getAttributeNS(se_ns, 'nonce') || "";
};

svgedit.document.Document.prototype.getElem_ = function(id) {
	if(this.svgElem_.querySelector) {
		// querySelector lookup
		return this.svgElem_.querySelector('#'+id);
	} else {
		// jQuery lookup: twice as slow as xpath in FF
		return $(this.svgElem_).find('[id=' + id + ']')[0];
	}
};

svgedit.document.Document.prototype.getSvgElem = function() {
	return this.svgElem_;
}

svgedit.document.Document.prototype.getNonce = function() {
	return this.nonce_;
};

/**
 * Returns the latest object id as a string.
 * @return {String} The latest object Id.
 */
svgedit.document.Document.prototype.getId = function() {
	return this.nonce_ ?
		this.idPrefix + this.nonce_ +'_' + this.obj_num :
 		this.idPrefix + this.obj_num;
};

/**
 * Returns the next object Id as a string.
 * @return {String} The next object Id to use.
 */
svgedit.document.Document.prototype.getNextId = function() {
	var oldObjNum = this.obj_num;
	var restoreOldObjNum = false;

	// If there are any released numbers in the release stack, 
	// use the last one instead of the next obj_num.
	// We need to temporarily use obj_num as that is what getId() depends on.
	if (this.releasedNums.length > 0) {
		this.obj_num = this.releasedNums.pop();
		restoreOldObjNum = true;
	} else {
		// If we are not using a released id, then increment the obj_num.
		this.obj_num++;
	}

	// Ensure the ID does not exist.
	var id = this.getId();
	while (this.getElem_(id)) {
		if (restoreOldObjNum) {
			this.obj_num = oldObjNum;
			restoreOldObjNum = false;
		}
		this.obj_num++;
		id = this.getId();
	}
	// Restore the old object number if required.
	if (restoreOldObjNum) {
		this.obj_num = oldObjNum;
	}
	return id;
};

/**
 * Releases the object Id, letting it be used as the next id in getNextId().
 * This method DOES NOT remove any elements from the DOM, it is expected
 * that client code will do this.
 *
 * @param {String} The id to release.
 * @return {boolean} Returns true if the id was valid to be released,
 *   false otherwise.
 */
svgedit.document.Document.prototype.releaseId = function(id) {
	// confirm if this is a valid id for this Document, else return false
	var front = this.idPrefix + (this.nonce_ ? this.nonce_ +'_' : '');
	if (typeof id != typeof '' || id.indexOf(front) != 0) {
		return false;
	}
	// extract the obj_num of this id
	var num = parseInt(id.substr(front.length));

	// if we didn't get a positive number or we already released this number
	// then return false.
	if (typeof num != typeof 1 || num <= 0 || this.releasedNums.indexOf(num) != -1) {
		return false;
	}
	
	// push the released number into the released queue
	this.releasedNums.push(num);

	return true;
};

})();
