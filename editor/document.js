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
 - migrate svgcanvas to using a Document object for its calls to getNextId() and getId()
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
	// always increment the obj_num every time we call getNextId()
	this.obj_num++;

	// ensure the ID does not exist
	var id = this.getId();
	while (this.getElem_(id)) {
		this.obj_num++;
		id = this.getId();
	}
	return id;
};

})();
