# SvgCanvas

The main SvgCanvas class that manages all SVG-related functions

##Parameters

* `container` The container HTML element that should hold the SVG root element
* `config` An object that contains configuration data

##Summary

###SvgCanvas - The main SvgCanvas class that manages all SVG-related functions 

Function | Description
---------|------------
[`Utils.toXml`](#utilstoxml) | Converts characters in a string to XML-friendly entities.       
[`Utils.fromXml`](#utilsfromxml) | Converts XML entities in a string to single characters.
[`Utils.encode64`](#utilsfromxml) | Converts a string to base64
[`Utils.decode64`](#utilsdecode64) | Converts a string from base64
[`Utils.convertToXMLReferences`](#utilsconverttoxmlreferences) | Converts a string to use XML references
[`rectsIntersect`](#rectsintersect) | Check if two rectangles (BBoxes objects) intersect each other
[`snapToAngle`](#snaptoangle) | Returns a 45 degree angle coordinate associated with the two given coordinates
[`text2xml`](#text2xml) | Cross-browser compatible method of converting a string to an XML tree found this function [here](http://groups.google.com/group/jquery-dev/browse_thread/thread/c6d11387c580a77f)

###Unit conversion functions

Function | Descrption
---------|-----------
[`convertToNum`](#converttonum) | Converts given values to numbers.
[`setUnitAttr`](#setunitattr) | Sets an element’s attribute based on the unit in its current value.
[`isValidUnit`](#isvalidunit) | Check if an attribute’s value is in a valid format

###Undo/Redo history management

Function | Description
---------|------------
[`ChangeElementCommand`](#changeelementcommand) | History command to make a change to an element.
[`ChangeElementCommand.apply`](#changeelementcommandapply) | Performs the stored change action
[`ChangeElementCommand.unapply`](#changeelementcommandunapply) | Reverses the stored change action
[`ChangeElementCommand.elements`](#changeelementcommandelements) |Returns array with element associated with this command
[`InsertElementCommand`](#insertelementcommand) | History command for an element that was added to the DOM
[`InsertElementCommand.apply`](#insertelementcommandapply) | Re-Inserts the new element
[`InsertElementCommand.unapply`](#insertelementcommandunapply) | Removes the element
[`InsertElementCommand.elements`](#insertelementcommandelements) |Returns array with element associated with this command
[`RemoveElementCommand`](#removeelementcommand) | History command for an element removed from the DOM
[`RemoveElementCommand.apply`](#removeelementcommandapply) | Re-removes the new element
[`RemoveElementCommand.unapply`](#removeelementcommandunapply) | Re-adds the new element
[`RemoveElementCommand.elements`](#removeelementcommandelements) | Returns array with element associated with this command
[`MoveElementCommand`](#moveelementcommand) | History command for an element that had its DOM position changed
[`MoveElementCommand.unapply`](#moveelementcommandunapply) | Re-positions the element
[`MoveElementCommand.unapply`](#moveelementcommandunapply) | Positions the element back to its original location
[`MoveElementCommand.elements`](#moveelementcommandelements) | Returns array with element associated with this command
[`BatchCommand`](#batchcommand) | History command that can contain/execute multiple other commands
[`BatchCommand.apply`](#batchcommandapply) | Runs "apply" on all subcommands
[`BatchCommand.unapply`](#batchcommandunapply) | Runs "unapply" on all subcommands
[`BatchCommand.elements`](#batchcommandelements) | Iterate through all our subcommands and returns all the elements we are changing
[`BatchCommand.addSubCommand`](#batchcommandaddsubcommand) | Adds a given command to the history stack
[`BatchCommand.isEmpty`](#batchcommandisempty	) | Returns a boolean indicating whether or not the batch command is empty
[`resetUndoStack`](#resetundostack) | Resets the undo stack, effectively clearing the undo/redo history
[`undoMgr.getUndoStackSize`](#undomgrgetundostacksize) | Integer with the current size of the undo history stack
[`undoMgr.getRedoStackSize`](#undomgrgetredostacksize) | Integer with the current size of the redo history stack
[`undoMgr.getNextUndoCommandText`](#undomgrgetnextundocommandtext) | String associated with the next undo command
[`undoMgr.getNextRedoCommandText`](#undomgrgetnextredocommandtext) | String associated with the next redo command
[`undoMgr.undo`](#undomgrundo) | Performs an undo step
[`undoMgr.redo`](#undomgrredo) | Performs a redo step
[`addCommandToHistory`](#resetundostack) | Adds a command object to the undo history stack
[`beginUndoableChange`](#beginundoablechange) | This function tells the canvas to remember the old values of the attrName attribute for each element sent in.
[`finishUndoableChange`](#finishundoablechange) | This function returns a BatchCommand object which summarizes the change since `beginUndoableChange` was called.

###[`Selector`](#selector) - Private class for DOM element selection boxes

Function | Description
---------|------------
[`Selector.reset`](#selectorreset) | Used to reset the id and element that the selector is attached to
[`Selector.showGrips`](#selectorshowgrips) | Show the resize grips of this selector
[`Selector.updateGripCursors`](selectorupdategripcursors) | Updates cursors for corner grips on rotation so arrows point the right way
[`Selector.resize`](#selectorresize) | Updates the selector to match the element’s size

###[`SelectorManager`](#selectormanager) - Public class to manage all selector objects (selection boxes)

Function | Description
---------|------------
[`SelectorManager.initGroup`](#selectormanagerinitgroup) | Resets the parent selector group element
[`SelectorManager.requestSelector`](#selectormanagerrequestselector) | Returns the selector based on the given element
[`SelectorManager.releaseSelector`](#selectormanagerreleaseselector) | Removes the selector of the given element (hides selection box)
[`SelectorManager.getRubberBandBox`](#selectormanagergetrubberbandbox`) | Returns the rubberBandBox DOM element.

###Helper functions	

Function | Description
---------|------------
[`walkTree`](#walktree) | Walks the tree and executes the callback on each element in a top-down fashion
[`walkTreePost`](#walktreepost) | Walks the tree and executes the callback on each element in a depth-first fashion
[`assignAttributes`](#assignattributes) | Assigns multiple attributes to an element.
[`cleanupElement`](#cleanupelement) | Remove unneeded (default) attributes, makes resulting SVG smaller
[`addSvgElementFromJson`](#addsvgelementfromjson) | Create a new SVG element based on the given object keys/values and add it to the current layer The element will be ran through cleanupElement before being returned
[`addExtension`](#addextension) | Add an extension to the editor
[`shortFloat`](#shortfloat) | Rounds a given value to a float with number of digits defined in save_options
[`getStrokedBBox`](#getstrokedbbox) | Get the bounding box for one or more stroked and/or transformed elements
[`getVisibleElements`](#getvisibleelements) | Get all elements that have a BBox (excludes `<defs>`, `<title>`, etc).
[`copyElem`](#copyelem) | Create a clone of an element, updating its ID and its children’s IDs when needed
[`getElem`](#getelem) | Get a DOM element by ID within the SVG root element.
[`getId`](#getid) | Returns the last created DOM element ID string
[`getNextId`](#getnextid) | Creates and returns a unique ID string for a DOM element
[`bind`](#bind) | Attaches a callback function to an event
[`setIdPrefix`](#setidprefix) | Changes the ID prefix to the given value
[`sanitizeSvg`](#sanitizesvg) | Sanitizes the input node and its children It only keeps what is allowed from our whitelist defined above
[`getUrlFromAttr`](#geturlfromattr) | Extracts the URL from the `url(...)`
[`getBBox`](#getbbox) | Get the given/selected element’s bounding box object, convert it to be more usable when necessary
[`ffClone`](#ffclone) | Hack for Firefox bugs where text element features aren't updated.
[`getPathBBox`](#getpathbbox) | Get correct BBox for a path in Webkit Converted from code found [here](http://blog.hackers-cafe.net/2009/06/how-to-calculate-bezier-curves-bounding.html)

###Element Transforms	

Function | Description
---------|------------
[`getRotationAngle`](#getrotationangle) | Get the rotation angle of the given/selected DOM element
[`setRotationAngle`](#setrotationangle) | Removes any old rotations if present, prepends a new rotation at the transformed center
[`getTransformList`](#gettransformlist) | Returns an object that behaves like a SVGTransformList for the given DOM element
[`recalculateAllSelectedDimensions`](#recalculateallselecteddimensions) | Runs recalculateDimensions on the selected elements, adding the changes to a single batch command
[`remapElement`](#remapelement) | Applies coordinate changes to an element based on the given matrix
[`recalculateDimensions`](#recalculatedimensions) | Decides the course of action based on the element’s transform list
[`transformPoint`](#transformpoint) | A (hopefully) quicker function to transform a point by a matrix (this function avoids any DOM calls and just does the math)
[`isIdentity`](#isidentity) | Helper function to check if the matrix performs no actual transform (i.e.
[`matrixMultiply`](#matrixmultiply) | This function tries to return a SVGMatrix that is the multiplication m1*m2.
[`transformListToTransform`](#transformlisttotransform) | This returns a single matrix Transform for a given Transform List (this is the equivalent of `SVGTransformList.consolidate()` but unlike that method, this one does not modify the actual `SVGTransformList`) This function is very liberal with its `min`,`max` arguments
[`hasMatrixTransform`](#hasmatrixtransform) | See if the given transformlist includes a non-indentity matrix transform
[`getMatrix`](#getmatrix) | Get the matrix object for a given element
[`transformBox`](#transformbox) | Transforms a rectangle based on the given matrix

###Selection
	
Function | Description
---------|------------
[`clearSelection`](#clearselection) | Clears the selection.
[`addToSelection`](#addtoselection) | Adds a list of elements to the selection.
[`removeFromSelection`](#removefromselection) | Removes elements from the selection.
[`selectAllInCurrentLayer`](#selectallincurrentlayer) | Clears the selection, then adds all elements in the current layer to the selection.
[`smoothControlPoints`](#smoothcontrolpoints) | Takes three points and creates a smoother line based on them
[`getMouseTarget`](#getmousetarget) | Gets the desired element from a mouse event
[`preventClickDefault`](#preventclickdefault) | Prevents default browser click behaviour on the given element

###Text edit functions - Functions relating to editing text elements

###Path edit functions - Functions relating to editing path elements

###Serialization	

Function | Description
---------|------------
[`removeUnusedDefElems`](#removeunuseddefelems) | Looks at DOM elements inside the <defs> to see if they are referred to, removes them from the DOM if they are not.
[`svgCanvasToString`](#svgcanvastostring) | Main function to set up the SVG content for output
[`svgToString`](#svgtostring) | Sub function ran on each SVG element to convert it to a string as desired
[`embedImage`](#embedimage) | Converts a given image file to a data URL when possible, then runs a given callback
[`save`](#save) | Serializes the current drawing into SVG XML text and returns it to the ‘saved’ handler.
[`rasterExport`](#rasterexport) | Generates a PNG Data URL based on the current image, then calls “exported” with an object including the string and any issues found
[`getSvgString`](#getsvgstring) | Returns the current drawing as raw SVG XML text.
[`setSvgString`](#setsvgstring) | This function sets the current drawing as the input SVG XML.
[`importSvgString`](#importsvgstring) | This function imports the input SVG XML into the current layer in the drawing

###Layers	

Function | Description
---------|------------
[`identifyLayers`](#identifylayers) | Updates layer system
[`createLayer`](#createlayer) | Creates a new top-level layer in the drawing with the given name, sets the current layer to it, and then clears the selection This function then calls the ‘changed’ handler.
[`deleteCurrentLayer`](#deletecurrentlayer) | Deletes the current layer from the drawing and then clears the selection.
[`getNumLayers`](#getnumlayers) | Returns the number of layers in the current drawing.
[`getLayer`](#getlayer) | Returns the name of the ith layer.
[`getCurrentLayer`](#getcurrentlayer) | Returns the name of the currently selected layer.
[`setCurrentLayer`](#setcurrentlayer) | Sets the current layer.
[`renameCurrentLayer`](#renamecurrentlayer) | Renames the current layer.
[`setCurrentLayerPosition`](#setcurrentlayerposition) | Changes the position of the current layer to the new value.
[`getLayerVisibility`](#getlayervisibility) | Returns whether the layer is visible.
[`setLayerVisibility`](#setlayervisibility) | Sets the visibility of the layer.
[`moveSelectedToLayer`](#moveselectedtolayer) | Moves the selected elements to layername.
[`getLayerOpacity`](#getlayeropacity) | Returns the opacity of the given layer.
[`setLayerOpacity`](#setlayeropacity) | Sets the opacity of the given layer.

###Document functions	

Function | Description
---------|------------
[`clear`](#clear) | Clears the current document.
[`linkControlPoints`](#linkcontrolpoints) | Alias function
[`getContentElem`](#getcontentelem) | Returns the content DOM element
[`getRootElem`](#getrootelem) | Returns the root DOM element
[`getSelectedElems`](#getselectedelems) | Returns the array with selected DOM elements
[`getResolution`](#getresolution) | Returns the current dimensions and zoom level in an object
[`getZoom`](#getzoom) | Returns the current zoom level
[`getVersion`](#getversion) | Returns a string which describes the revision number of SvgCanvas.
[`setUiStrings`](#setuistrings) | Update interface strings with given values
[`setConfig`](#setconfig) | Update configuration options with given values
[`getDocumentTitle`](#getdocumenttitle) | Returns the current document title or an empty string if not found
[`setDocumentTitle`](#setdocumenttitle) | Adds/updates a title element for the document with the given name.
[`getEditorNS`](#geteditorns) | Returns the editor’s namespace URL, optionally adds it to root element
[`setResolution`](#setresolution) | Changes the document’s dimensions to the given size
[`getOffset`](#getoffset) | Returns an object with x, y values indicating the svgcontent element’s position in the editor’s canvas.
[`setBBoxZoom`](#setbboxzoom) | Sets the zoom level on the canvas-side based on the given value
[`setZoom`](#setzoom) | Sets the zoom to the given level
[`getMode`](#getmode) | Returns the current editor mode string
[`setMode`](#setmode) | Sets the editor’s mode to the given string

###Element Styling	

Function | Description
---------|------------
[`getColor`](#getcolor) | Returns the current fill/stroke option
[`setColor`](#setcolor) | Change the current stroke/fill color/gradient value
[`findDefs`](#finddefs) | Return the document’s `<defs>` element, create it first if necessary
[`setGradient`](#setgradient) | Apply the current gradient to selected element’s fill or stroke
[`findDuplicateGradient`](#findduplicategradient) | Check if exact gradient already exists
[`setPaint`](#setpaint) | Set a color/gradient to a fill/stroke
[`getStrokeWidth`](#getstrokewidth) | Returns the current stroke-width value
[`setStrokeWidth`](#setstrokewidth) | Sets the stroke width for the current selected elements When attempting to set a line’s width to 0, this changes it to 1 instead
[`setStrokeAttr`](#setstrokeattr) | Set the given stroke-related attribute the given value for selected elements
[`getOpacity`](#getopacity) | Returns the current opacity
[`setOpacity`](#setopacity) | Sets the given opacity to the current selected elements
[`getOpacity`](#getopacity) | Returns the current fill opacity
[`getStrokeOpacity`](#getstrokeopacity) | Returns the current stroke opacity
[`setPaintOpacity`](#setpaintopacity) | Sets the current fill/stroke opacity
[`getBlur`](#getblur) | Gets the `stdDeviation` blur value of the given element
[`setBlurNoUndo`](#setblurnoundo) | Sets the `stdDeviation` blur value on the selected element without being undoable
[`setBlurOffsets`](#setbluroffsets) | Sets the x, y, with, height values of the filter element in order to make the blur not be clipped.
[`setBlur`](#setblur) | Adds/updates the blur filter to the selected element
[`getBold`](#getbold) | Check whether selected element is bold or not
[`setBold`](#setbold) | Make the selected element bold or normal
[`getItalic`](#getitalic) | Check whether selected element is italic or not
[`setItalic`](#setitalic) | Make the selected element italic or normal
[`getFontFamily`](#getfontfamily) | Returns the current font family
[`setFontFamily`](#setfontfamily) | Set the new font family
[`getFontSize`](#getfontsize) | Returns the current font size
[`setFontSize`](#setfontsize) | Applies the given font size to the selected element
[`getText`](#gettext) | Returns the current text (textContent) of the selected element
[`setTextContent`](#settextcontent) | Updates the text element with the given string
[`setImageURL`](#setimageurl) | Sets the new image URL for the selected image element.
[`setRectRadius`](#setrectradius) | Sets the rx & ry values to the selected rect element to change its corner radius

###Element manipulation	

Function | Description
---------|------------
[`setSegType`](#setsegtype) | Sets the new segment type to the selected segment(s).
[`convertToPath`](#converttopath) | Convert selected element to a path, or get the BBox of an element-as-path
[`changeSelectedAttributeNoUndo`](#changeselectedattributenoundo) | This function makes the changes to the elements.
[`changeSelectedAttribute`](#changeselectedattribute) | Change the given/selected element and add the original value to the history stack If you want to change all selectedElements, ignore the elems argument.
[`deleteSelectedElements`](#deleteselectedelements) | Removes all selected elements from the DOM and adds the change to the history stack
[`groupSelectedElements`](#groupselectedelements) | Wraps all the selected elements in a group (g) element
[`ungroupSelectedElement`](#ungroupselectedelement) | Unwraps all the elements in a selected group (g) element.
[`moveToTopSelectedElement`](#movetotopselectedelement) | Repositions the selected element to the bottom in the DOM to appear on top of other elements
[`moveToBottomSelectedElement`](#movetobottomselectedelement) | Repositions the selected element to the top in the DOM to appear under other elements
[`moveSelectedElements`](#moveselectedelements) | Moves selected elements on the X/Y axis
[`cloneSelectedElements`](#cloneselectedelements) | Create deep DOM copies (clones) of all selected elements and move them slightly from their originals
[`alignSelectedElements`](#alignselectedelements) | Aligns selected elements

###Additional editor tools	

Function | Description
---------|------------
[`updateCanvas`](#updatecanvas) | Updates the editor canvas width/height/position after a zoom has occurred
[`setBackground`](#setbackground) | Set the background of the editor (NOT the actual document)
[`cycleElement`](#cycleelement) | Select the next/previous element within the current layer

##`Utils.toXml`

Converts characters in a string to XML-friendly entities. Example: `&` becomes `&amp;`

####Parameters

`str` The string to be converted

####Returns

The converted string

##`Utils.fromXml`

Converts XML entities in a string to single characters. Example: `&amp;` becomes `&`

####Parameters

`str` The string to be converted

####Returns

The converted string 

##`Utils.encode64`
Converts a string to base64

##`Utils.decode64`
Converts a string from base64

##`Utils.convertToXMLReferences`
Converts a string to use XML references

##`rectsIntersect`

	"rectsIntersect": function( r1,r2 )

Check if two rectangles (BBoxes objects) intersect each other

####Paramaters

`r1` The first BBox-like object
`r2` The second BBox-like object

####Returns

Boolean that’s true if rectangles intersect

##`snapToAngle`

	"snapToAngle": function( x1, y1, x2, y2 )
	
Returns a 45 degree angle coordinate associated with the two given coordinates

####Parameters

* `x1` First coordinate’s x value
* `x2` Second coordinate’s x value
* `y1` First coordinate’s y value
* `y2` Second coordinate’s y value

####Returns

Object with the following values: x - The angle-snapped x value y - The angle-snapped y value snapangle - The angle at which to snap

##`text2xml`

	"text2xml": function(sXML)

Cross-browser compatible method of converting a string to an XML tree found this function [here](http://groups.google.com/group/jquery-dev/browse_thread/thread/c6d11387c580a77f)

#Unit conversion functions

##`convertToNum`

	convertToNum = function( attr, val )

Converts given values to numbers.  Attributes must be supplied in case a percentage is given

####Parameters

* `attr` String with the name of the attribute associated with the value
* `val` String with the attribute value to convert

##`setUnitAttr`

	setUnitAttr = function( elem, attr, val )

Sets an element’s attribute based on the unit in its current value.

####Parameters

* `elem` DOM element to be changed
* `attr` String with the name of the attribute associated with the value
* `val` String with the attribute value to convert

##`isValidUnit`

	canvas.isValidUnit = function( attr,val )

Check if an attribute’s value is in a valid format

####Parameters

* `attr` String with the name of the attribute associated with the value
* `val` String with the attribute value to check

#Undo/Redo history management

##`ChangeElementCommand`

	var ChangeElementCommand = this.undoCmd.changeElement = function( elem, attrs, text )

History command to make a change to an element.  Usually an attribute change, but can also be textcontent.

####Parameters

* `elem` The DOM element that was changed
* `attrs` An object with the attributes to be changed and the values they had before the change
* `text` An optional string visible to user related to this change

##`ChangeElementCommand.apply`

Performs the stored change action

##`ChangeElementCommand.unapply`

Reverses the stored change action

##`ChangeElementCommand.elements`

Returns array with element associated with this command

##`InsertElementCommand`

	var InsertElementCommand = this.undoCmd.insertElement = function( elem, text )

History command for an element that was added to the DOM

####Parameters

* `elem	` The newly added DOM element
* `text` An optional string visible to user related to this change

##`InsertElementCommand.apply`

Re-Inserts the new element

##`InsertElementCommand.unapply`

Removes the element

##`InsertElementCommand.elements`

Returns array with element associated with this command

##`RemoveElementCommand`

	var RemoveElementCommand = this.undoCmd.removeElement = function( elem, parent, text )

History command for an element removed from the DOM

####Parameters
* `elem	` The removed DOM element
* `parent` The DOM element’s parent
* `text` An optional string visible to user related to this change

##`RemoveElementCommand.apply`

Re-removes the new element

##`RemoveElementCommand.unapply`

Re-adds the new element

##`RemoveElementCommand.elements`

Returns array with element associated with this command

##`MoveElementCommand`

	var MoveElementCommand = this.undoCmd.moveElement = function( elem, oldNextSibling, oldParent, text )

History command for an element that had its DOM position changed

####Parameters

* `elem	` The DOM element that was moved
* `oldNextSibling` The element’s next sibling before it was moved
* `oldParent` The element’s parent before it was moved
* `text` An optional string visible to user related to this change

##`MoveElementCommand.unapply`

Re-positions the element

##`MoveElementCommand.unapply`

Positions the element back to its original location

##`MoveElementCommand.elements`

Returns array with element associated with this command

##`BatchCommand`

	var BatchCommand = this.undoCmd.batch = function( text )

History command that can contain/execute multiple other commands

####Parameters

* `text` An optional string visible to user related to this change

##`BatchCommand.apply`

Runs “apply” on all subcommands

##`BatchCommand.unapply`

Runs “unapply” on all subcommands

##`BatchCommand.elements`

Iterate through all our subcommands and returns all the elements we are changing

##`BatchCommand.addSubCommand`

Adds a given command to the history stack

####Parameters

* `cmd` The undo command object to add

##`BatchCommand.isEmpty`

Returns a boolean indicating whether or not the batch command is empty

##`resetUndoStack`

	resetUndoStack = function()

Resets the undo stack, effectively clearing the undo/redo history

##`undoMgr.getUndoStackSize`

####Returns
Integer with the current size of the undo history stack

##`undoMgr.getRedoStackSize`

####Returns

Integer with the current size of the redo history stack

##`undoMgr.getNextUndoCommandText`

####Returns

String associated with the next undo command

##`undoMgr.getNextRedoCommandText`

####Returns

String associated with the next redo command

##`undoMgr.undo`

Performs an undo step

##`undoMgr.redo`

Performs a redo step

##`addCommandToHistory`

	addCommandToHistory = c.undoCmd.add = function( cmd )

Adds a command object to the undo history stack

####Parameters

* `cmd` The command object to add

##`beginUndoableChange`

	c.beginUndoableChange = function( attrName, elems )

This function tells the canvas to remember the old values of the attrName attribute for each element sent in.  The elements and values are stored on a stack, so the next call to `finishUndoableChange()` will pop the elements and old values off the stack, gets the current values from the DOM and uses all of these to construct the undo-able command.

####Parameters

* `attrName` The name of the attribute being changed
* `elems` Array of DOM elements being changed

##`finishUndoableChange`

	c.finishUndoableChange = function()

This function returns a BatchCommand object which summarizes the change since beginUndoableChange was called. The command can then be added to the command history

####Returns
Batch command object with resulting changes

##`Selector`

Private class for DOM element selection boxes

####Parameters
* `id` integer to internally indentify the selector
* `elem` DOM element associated with this selector

####Summary

Function | Description
---------|------------
[`Selector.reset`](#selectorreset) | Used to reset the id and element that the selector is attached to
[`Selector.showGrips`](#selectorshowgrips) | Show the resize grips of this selector
[`Selector.updateGripCursors`](selectorupdategripcursors) | Updates cursors for corner grips on rotation so arrows point the right way
[`Selector.resize`](#selectorresize) | Updates the selector to match the element’s size

##Functions

##`Selector.reset`

Used to reset the id and element that the selector is attached to

####Parameters

* `e` DOM element associated with this selector

##`Selector.showGrips`

Show the resize grips of this selector

####Parameters
* `show` boolean indicating whether grips should be shown or not

##`Selector.updateGripCursors`

Updates cursors for corner grips on rotation so arrows point the right way

####Parameters

* `angle` Float indicating current rotation angle in degrees

##`Selector.resize`

Updates the selector to match the element’s size

##`SelectorManager`

Public class to manage all selector objects (selection boxes)

##Summary

Function | Description
---------|------------
[`SelectorManager.initGroup`](#selectormanagerinitgroup) | Resets the parent selector group element
[`SelectorManager.requestSelector`](#selectormanagerrequestselector) | Returns the selector based on the given element
[`SelectorManager.releaseSelector`](#selectormanagerreleaseselector) | Removes the selector of the given element (hides selection box)
[`SelectorManager.getRubberBandBox`](#selectormanagergetrubberbandbox`) | Returns the rubberBandBox DOM element.

##`SelectorManager.initGroup`

Resets the parent selector group element

##`SelectorManager.requestSelector`

Returns the selector based on the given element

####Parameters

* `elem` DOM element to get the selector for

##`SelectorManager.releaseSelector`

Removes the selector of the given element (hides selection box)

####Parameters

* `elem` DOM element to remove the selector for

##`SelectorManager.getRubberBandBox`

Returns the rubberBandBox DOM element.  This is the rectangle drawn by the user for selecting/zooming

#Helper functions

##`walkTree`

	function walkTree( elem, cbFn )

Walks the tree and executes the callback on each element in a top-down fashion

####Parameters

* `elem` DOM element to traverse
* `cbFn` Callback function to run on each element

##`walkTreePost`

	function walkTreePost( elem, cbFn )

Walks the tree and executes the callback on each element in a depth-first fashion

####Parameters

* `elem	` DOM element to traverse
* `cbFn` Callback function to run on each element

##`assignAttributes`

	var assignAttributes = this.assignAttributes = function( node, attrs, suspendLength, unitCheck )

Assigns multiple attributes to an element.

####Parameters

* `node` DOM element to apply new attribute values to
* `attrs` Object with attribute keys/values
* `suspendLength` Optional integer of milliseconds to suspend redraw
* `unitCheck` Boolean to indicate the need to use setUnitAttr

##`cleanupElement`

	var cleanupElement = this.cleanupElement = function( element )

Remove unneeded (default) attributes, makes resulting SVG smaller

####Parameters

* `element` DOM element to clean up

##`addSvgElementFromJson`

	var addSvgElementFromJson = this.addSvgElementFromJson = function( data )

Create a new SVG element based on the given object keys/values and add it to the current layer The element will be ran through `cleanupElement` before being returned

####Parameters

* `data` Object with the following keys/values:
	* `element` - DOM element to create
	* `attr` - Object with attributes/values to assign to the new element
	* `curStyles` - Boolean indicating that current style attributes should be applied first

####Returns

The new element

##`addExtension`

	this.addExtension = function( name, ext_func )

Add an extension to the editor

####Parameters

* `name` String with the ID of the extension
* `ext_func` Function supplied by the extension with its data

##`shortFloat`

	var shortFloat = function( val )

Rounds a given value to a float with number of digits defined in save_options

####Parameters

* `val` The value as a String, Number or Array of two numbers to be rounded

####Returns

If a string/number was given, returns a Float. If an array, return a string with comma-seperated floats

##`getStrokedBBox`

	var getStrokedBBox = this.getStrokedBBox = function( elems )

Get the bounding box for one or more stroked and/or transformed elements

####Parameters

* `elems` Array with DOM elements to check

####Returns

A single bounding box object

##`getVisibleElements`

	var getVisibleElements = this.getVisibleElements = function( parent, includeBBox )

Get all elements that have a BBox (excludes `<defs>`, `<title>`, etc).  Note that 0-opacity, off-screen etc elements are still considered “visible” for this function

####Parameters

* `parent` The parent DOM element to search within
* `includeBBox` Boolean to indicate that an object should return with the element and its bbox

####Returns

An array with all “visible” elements, or if includeBBox is true, an array with objects that include:

* `elem` - The element
* `bbox` - The element’s BBox as retrieved from getStrokedBBox

##`copyElem`

	var copyElem = function( el )

Create a clone of an element, updating its ID and its children’s IDs when needed

####Parameters

* `el` DOM element to clone

####Returns
The cloned element

##`getElem`

	function getElem( id )

Get a DOM element by ID within the SVG root element.

####Parameters

* `id` String with the element’s new ID

##`getId`

	getId = c.getId = function()

Returns the last created DOM element ID string

##`getNextId`

	getNextId = c.getNextId = function()

Creates and returns a unique ID string for a DOM element

##`bind`

	c.bind = function( event, f )

Attaches a callback function to an event

####Parameters

* `event` String indicating the name of the event
* `f` The callback function to bind to the event

####Returns

The previous event

##`setIdPrefix`

	c.setIdPrefix = function( p )

Changes the ID prefix to the given value

####Parameters
* `p` String with the new prefix

##`sanitizeSvg`

	var sanitizeSvg = this.sanitizeSvg = function( node )

Sanitizes the input node and its children It only keeps what is allowed from our whitelist defined above

####Parameters

* `node` The DOM element to be checked, will also check its children

##`getUrlFromAttr`

	var getUrlFromAttr = this.getUrlFromAttr = function( attrVal )

Extracts the URL from the `url(...)` syntax of some attributes.  Three variants:

* `<circle fill="url(someFile.svg#foo)" />`
* `<circle fill="url(‘someFile.svg#foo’)" />`
* `<circle fill=’url("someFile.svg#foo")’ />`

####Parameters

* `attrVal` The attribute value as a string

####Returns

String with just the URL, like `someFile.svg#foo`

##`getBBox`

	var getBBox = this.getBBox = function( elem )

Get the given/selected element’s bounding box object, convert it to be more usable when necessary

####Parameters

* `elem` Optional DOM element to get the BBox for

##`ffClone`

	var ffClone = function( elem )

Hack for Firefox bugs where text element features aren’t updated. This function clones the element and re-selects it 

> TODO: Test for this bug on load and add it to “support” object instead of browser sniffing

####Parameters

* `elem` The (text) DOM element to clone

##`getPathBBox`

	var getPathBBox = function( path )

Get correct BBox for a path in Webkit Converted from code found [here](http://blog.hackers-cafe.net/2009/06/how-to-calculate-bezier-curves-bounding.html)

####Parameters

* `path` The path DOM element to get the BBox for

####Returns
A BBox-like object

#Element Transforms

##`getRotationAngle`

	var getRotationAngle = this.getRotationAngle = function( elem, to_rad )

Get the rotation angle of the given/selected DOM element

####Parameters

* `elem` Optional DOM element to get the angle for
* `to_rad` Boolean that when true returns the value in radians rather than degrees

####Returns

Float with the angle in degrees or radians

##`setRotationAngle`

	this.setRotationAngle = function( val, preventUndo )

Removes any old rotations if present, prepends a new rotation at the transformed center

####Parameters

* `val` The new rotation angle in degrees
* `preventUndo` Boolean indicating whether the action should be undoable or not

##`getTransformList`

	var getTransformList = this.getTransformList = function( elem )

Returns an object that behaves like a SVGTransformList for the given DOM element

####Parameters

* `elem` DOM element to get a transformlist from

##`recalculateAllSelectedDimensions`

	var recalculateAllSelectedDimensions = this.recalculateAllSelectedDimensions = function()

Runs recalculateDimensions on the selected elements, adding the changes to a single batch command

##`remapElement`

	var remapElement = this.remapElement = function( selected, changes, m )

Applies coordinate changes to an element based on the given matrix

####Parameters

* `selected` DOM element to be changed
* `changes` Object with changes to be remapped
* `m` Matrix object to use for remapping coordinates

##`recalculateDimensions`

	var recalculateDimensions = this.recalculateDimensions = function( selected )

Decides the course of action based on the element’s transform list

####Parameters

* `selected` The DOM element to recalculate

####Returns

Undo command object with the resulting change

##`transformPoint`

	var transformPoint = function( x, y, m )

A (hopefully) quicker function to transform a point by a matrix (this function avoids any DOM calls and just does the math)

####Parameters
* `x` Float representing the x coordinate
* `y` Float representing the y coordinate
* `m` Matrix object to transform the point with Returns a x,y object representing the transformed point

##`isIdentity`

	var isIdentity = function( m )

Helper function to check if the matrix performs no actual transform (i.e. exists for identity purposes)

####Parameters

* `m` The matrix object to check

####Returns

Boolean indicating whether or not the matrix is `1,0,0,1,0,0`

##`matrixMultiply`

	var matrixMultiply = this.matrixMultiply = function()

This function tries to return a SVGMatrix that is the multiplication `m1*m2`. We also round to zero when it’s near zero

####Parameters

`= 2 Matrix objects to multiply`

####Returns

The matrix object resulting from the calculation

##`transformListToTransform`

	var transformListToTransform = this.transformListToTransform = function( tlist, min, max )
This returns a single matrix Transform for a given Transform List (this is the equivalent of `SVGTransformList.consolidate()` but unlike that method, this one does not modify the actual `SVGTransformList`) This function is very liberal with its `min`, `max` arguments

####Parameters

* `tlist` The transformlist object
* `min` Optional integer indicating start transform position
* `max` Optional integer indicating end transform position

####Returns

A single matrix transform object

##`hasMatrixTransform`

	var hasMatrixTransform = this.hasMatrixTransform = function( tlist )

See if the given transformlist includes a non-indentity matrix transform

####Parameters

* `tlist` The transformlist to check

####Returns

Boolean on whether or not a matrix transform was found

##`getMatrix`

	var getMatrix = function( elem )

Get the matrix object for a given element

####Parameters

* `elem` The DOM element to check

####Returns

The matrix object associated with the element’s transformlist

##`transformBox`

	var transformBox = this.transformBox = function( l, t, w, h, m )

Transforms a rectangle based on the given matrix

####Parameters

* `l` Float with the box’s left coordinate
* `t` Float with the box’s top coordinate
* `w` Float with the box width
* `h` Float with the box height
* `m` Matrix object to transform the box by

####Returns

An object with the following values:

* `tl` - The top left coordinate (x,y object)
* `tr` - The top right coordinate (x,y object)
* `bl` - The bottom left coordinate (x,y object)
* `br` - The bottom right coordinate (x,y object)
* `aabox` - Object with the following values:
* Float with the axis-aligned x coordinate
* Float with the axis-aligned y coordinate
* Float with the axis-aligned width coordinate
* Float with the axis-aligned height coordinate

#Selection

##`clearSelection`

	var clearSelection = this.clearSelection = function( noCall )

Clears the selection. The `selected` handler is then called.  Parameters: `noCall` - Optional boolean that when true does not call the “selected” handler

##`addToSelection`

	var addToSelection = this.addToSelection = function( elemsToAdd, showGrips )

Adds a list of elements to the selection.  The ‘selected’ handler is then called.

####Parameters

* `elemsToAdd` an array of DOM elements to add to the selection
* `showGrips` a boolean flag indicating whether the resize grips should be shown

##`removeFromSelection`

	var removeFromSelection = this.removeFromSelection = function( elemsToRemove )

Removes elements from the selection.

####Parameters

* `elemsToRemove` an array of elements to remove from selection

##`selectAllInCurrentLayer`

	this.selectAllInCurrentLayer = function()

Clears the selection, then adds all elements in the current layer to the selection. This function then fires the selected event.

##`smoothControlPoints`

	var smoothControlPoints = this.smoothControlPoints = function( ct1, ct2, pt )

Takes three points and creates a smoother line based on them

####Parameters

* `ct1` Object with x and y values (first control point)
* `ct2` Object with x and y values (second control point)
* `pt` Object with x and y values (third point)

####Returns

Array of two “smoothed” point objects

##`getMouseTarget`

	var getMouseTarget = this.getMouseTarget = function( evt )

Gets the desired element from a mouse event

####Parameters

* `evt` Event object from the mouse event

####Returns

DOM element we want

##`preventClickDefault`

	var preventClickDefault = function( img )

Prevents default browser click behaviour on the given element

####Parameters

* `img` The DOM element to prevent the cilck on

#Text edit functions

Functions relating to editing text elements

#Path edit functions

Functions relating to editing path elements

#Serialization

##`removeUnusedDefElems`

	var removeUnusedDefElems = this.removeUnusedDefElems = function()

Looks at DOM elements inside the <defs> to see if they are referred to, removes them from the DOM if they are not.

####Returns

The amount of elements that were removed

##`svgCanvasToString`

	var svgCanvasToString = this.svgCanvasToString = function()

Main function to set up the SVG content for output

####Returns

String containing the SVG image for output

##`svgToString`

	var svgToString = this.svgToString = function( elem, indent )

Sub function ran on each SVG element to convert it to a string as desired

####Parameters

* `elem` The SVG element to convert
* `indent` Integer with the amount of spaces to indent this tag

####Returns

String with the given element as an SVG tag

##`embedImage`

	this.embedImage = function( val, callback )

Converts a given image file to a data URL when possible, then runs a given callback

####Parameters

* `val` String with the path/URL of the image
* `callback` Optional function to run when image data is found, supplies the result (data URL or false) as first parameter.

##`save`

	this.save = function( opts )

Serializes the current drawing into SVG XML text and returns it to the ‘saved’ handler.  This function also includes the XML prolog.  Clients of the SvgCanvas bind their save function to the ‘saved’ event.

#### Returns
Nothing

##`rasterExport`

	this.rasterExport = function()

Generates a PNG Data URL based on the current image, then calls “exported” with an object including the string and any issues found

##`getSvgString`

	this.getSvgString = function()

Returns the current drawing as raw SVG XML text.

####Returns

The current drawing as raw SVG XML text.

##`setSvgString`

	this.setSvgString = function( xmlString )

This function sets the current drawing as the input SVG XML.

####Parameters

* `xmlString` The SVG as XML text.

####Returns

This function returns false if the set was unsuccessful, true otherwise.

##`importSvgString`

	this.importSvgString = function( xmlString )

This function imports the input SVG XML into the current layer in the drawing

####Parameters

* `xmlString` The SVG as XML text.

####Returns

This function returns false if the import was unsuccessful, true otherwise.  

>TODO: 

* properly handle if namespace is introduced by imported content (must add to svgcontent and update all prefixes in the imported node)
* properly handle recalculating dimensions, recalculateDimensions() doesn’t handle arbitrary transform lists, but makes some assumptions about how the transform list was obtained
* import should happen in top-left of current zoomed viewport
* create a new layer for the imported SVG

#Layers

##`identifyLayers`

	var identifyLayers = function()

Updates layer system

##`createLayer`

	this.createLayer = function( name )

Creates a new top-level layer in the drawing with the given name, sets the current layer to it, and then clears the selection This function then calls the ‘changed’ handler.  This is an undoable action.

####Parameters

* `name` The given name

##`deleteCurrentLayer`

	this.deleteCurrentLayer = function()

Deletes the current layer from the drawing and then clears the selection. This function then calls the ‘changed’ handler. This is an undoable action.

##`getNumLayers`

	this.getNumLayers = function()

Returns the number of layers in the current drawing.

####Returns

The number of layers in the current drawing.

##`getLayer`

	this.getLayer = function( i )

Returns the name of the ith layer.  If the index is out of range, an empty string is returned.

####Parameters
* `i` the zero-based index of the layer you are querying.

####Returns

The name of the ith layer

##`getCurrentLayer`

	this.getCurrentLayer = function()

Returns the name of the currently selected layer.  If an error occurs, an empty string is returned.

####Returns

The name of the currently active layer.

##`setCurrentLayer`

	this.setCurrentLayer = function( name )

Sets the current layer.  If the name is not a valid layer name, then this function returns false.  Otherwise it returns true.  This is not an undo-able action.

####Parameters

* `name` the name of the layer you want to switch to.

####Returns

`true` if the current layer was switched, otherwise `false`

##`renameCurrentLayer`

	this.renameCurrentLayer = function( newname )

Renames the current layer. If the layer name is not valid (i.e. unique), then this function does nothing and returns `false`, otherwise it returns `true`. This is an undo-able action.

####Parameters

* `newname` the new name you want to give the current layer. This name must be unique among all layer names.

####Returns

`true` if the rename succeeded, `false` otherwise.

##`setCurrentLayerPosition`

	this.setCurrentLayerPosition = function( newpos )

Changes the position of the current layer to the new value.  If the new index is not valid, this function does nothing and returns false, otherwise it returns true.  This is an undo-able action.

####Parameters

* `newpos` The zero-based index of the new position of the layer. This should be between
`0` and (number of layers `1`)

####Returns

`true` if the current layer position was changed, `false` otherwise.

##`getLayerVisibility`

	this.getLayerVisibility = function(	 layername )

Returns whether the layer is visible.  If the layer name is not valid, then this function returns false.

####Parameters

* `layername` the name of the layer which you want to query.

####Returns

The visibility state of the layer, or false if the layer name was invalid.

##`setLayerVisibility`

	this.setLayerVisibility = function( layername, bVisible )

Sets the visibility of the layer.  If the layer name is not valid, this function return false, otherwise it returns true.  This is an undo-able action.

####Parameters

* `layername` the name of the layer to change the visibility
* `bVisible` true/false, whether the layer should be visible

####Returns

`true` if the layer’s visibility was set, `false` otherwise

##`moveSelectedToLayer`

	this.moveSelectedToLayer = function( layername )

Moves the selected elements to layername.  If the name is not a valid layer name, then false is returned.  Otherwise it returns true.  This is an undo-able action.

####Parameters

* `layername` the name of the layer you want to which you want to move the selected elements

####Returns

`true` if the selected elements were moved to the layer, `false` otherwise.

##`getLayerOpacity`

	this.getLayerOpacity = function( layername )

Returns the opacity of the given layer.  If the input name is not a layer, null is returned.

####Parameters

* `layername` name of the layer on which to get the opacity

####Returns

The opacity value of the given layer.  This will be a value between `0.0` and `1.0`, or null if layername is not a valid layer

##`setLayerOpacity`

	this.setLayerOpacity = function( layername, opacity )

Sets the opacity of the given layer.  If the input name is not a layer, nothing happens.  This is not an undo-able action.

>NOTE: this function exists solely to apply a highlighting/de-emphasis effect to a layer, when it is possible for a user to affect the opacity of a layer, we will need to allow this function to produce an undo-able action.  If opacity is not a value between 0.0 and 1.0, then nothing happens.

####Parameters

* `layername` name of the layer on which to set the opacity
* `opacity` a float value in the range 0.0-1.0

#Document functions

##`clear`

	this.clear = function()

Clears the current document.  This is not an undoable action.

##`linkControlPoints`

Alias function

##`getContentElem`

	this.getContentElem = function()

Returns the content DOM element

##`getRootElem`

	this.getRootElem = function()

Returns the root DOM element

##`getSelectedElems`

	this.getSelectedElems = function()

Returns the array with selected DOM elements

##`getResolution`

	var getResolution = this.getResolution = function()

Returns the current dimensions and zoom level in an object

##`getZoom`

	this.getZoom = function()

Returns the current zoom level

##`getVersion`

	this.getVersion = function()

Returns a string which describes the revision number of SvgCanvas.

##`setUiStrings`

	this.setUiStrings = function(strs)

Update interface strings with given values

####Parameters

* `strs` Object with strings (see uiStrings for examples)

##`setConfig`

	this.setConfig = function( opts )

Update configuration options with given values

####Parameters

* `opts` Object with options (see curConfig for examples)

##`getDocumentTitle`

	this.getDocumentTitle = function()

Returns the current document title or an empty string if not found

##`setDocumentTitle`

	this.setDocumentTitle = function( newtitle )

Adds/updates a title element for the document with the given name.  This is an undoable action

####Parameters

* `newtitle` String with the new title

##`getEditorNS`

	this.getEditorNS = function( add )

Returns the editor’s namespace URL, optionally adds it to root element

####Parameters

* `add` Boolean to indicate whether or not to add the namespace value

##`setResolution`

	this.setResolution = function( x, y )

Changes the document’s dimensions to the given size

####Parameters

* `x` Number with the width of the new dimensions in user units.  Can also be the string “fit” to indicate “fit to content”
* `y` Number with the height of the new dimensions in user units.

####Returns

Boolean to indicate if resolution change was succesful.  It will fail on “fit to content” option with no content to fit to.

##`getOffset`

	this.getOffset = function()

Returns an object with `x`, `y` values indicating the svgcontent element’s position in the editor’s canvas.

##`setBBoxZoom`

	this.setBBoxZoom = function( val, editor_w, editor_h )

Sets the zoom level on the canvas-side based on the given value

####Parameters

* `val` Bounding box object to zoom to or string indicating zoom option
* `editor_w` Integer with the editor’s workarea box’s width
* `editor_h` Integer with the editor’s workarea box’s height

##`setZoom`

	this.setZoom = function( zoomlevel )

Sets the zoom to the given level

####Parameters

* `zoomlevel` Float indicating the zoom level to change to

##`getMode`

	this.getMode = function()

Returns the current editor mode string

##`setMode`

	this.setMode = function( name )

Sets the editor’s mode to the given string

####Parameters

* `name` String with the new mode to change to

#Element Styling

##`getColor`

	this.getColor = function( type )

Returns the current fill/stroke option

##`setColor`

	this.setColor = function( type, val, preventUndo )

Change the current stroke/fill color/gradient value

####Parameters

* `type` String indicating fill or stroke
* `val` The value to set the stroke attribute to
* `preventUndo` Boolean indicating whether or not this should be and undoable option

##`findDefs`

	var findDefs = function()

Return the document’s `<defs>` element, create it first if necessary

##`setGradient`

	var setGradient = this.setGradient = function( type )

Apply the current gradient to selected element’s fill or stroke
Parameters `type` - String indicating “fill” or “stroke” to apply to an element

##`findDuplicateGradient`

	var findDuplicateGradient = function( grad )

Check if exact gradient already exists

####Parameters

* `grad` The gradient DOM element to compare to others

####Returns

The existing gradient if found, null if not

##`setPaint`

	this.setPaint = function( type, paint )

Set a color/gradient to a fill/stroke

####Parameters

* `type` String with “fill” or “stroke”
* `paint` The jGraduate paint object to apply

##`getStrokeWidth`

	this.getStrokeWidth = function()

Returns the current stroke-width value

##`setStrokeWidth`

	this.setStrokeWidth = function( val )

Sets the stroke width for the current selected elements When attempting to set a line’s width to 0, this changes it to 1 instead

####Parameters

* `val` A Float indicating the new stroke width value

##`setStrokeAttr`

	this.setStrokeAttr = function( attr, val )

Set the given stroke-related attribute the given value for selected elements

####Parameters

* `attr` String with the attribute name
* `val` String or number with the attribute value

##`getOpacity`

	this.getOpacity = function()

Returns the current opacity

##`setOpacity`

	this.setOpacity = function( val )

Sets the given opacity to the current selected elements

##`getOpacity`

Returns the current fill opacity

##`getStrokeOpacity`

	this.getStrokeOpacity = function()

Returns the current stroke opacity

##`setPaintOpacity`

	this.setPaintOpacity = function( type, val, preventUndo )

Sets the current fill/stroke opacity

####Parameters

* `type` String with “fill” or “stroke”
* `val` Float with the new opacity value
* `preventUndo` Boolean indicating whether or not this should be an undoable action

##`getBlur`

	this.getBlur = function( elem )

Gets the stdDeviation blur value of the given element

####Parameters

* `elem` The element to check the blur value for

##`setBlurNoUndo`

	canvas.setBlurNoUndo = function( val )

Sets the stdDeviation blur value on the selected element without being undoable

####Parameters

* `val` The new stdDeviation value

##`setBlurOffsets`

	canvas.setBlurOffsets = function( filter, stdDev )

Sets the `x`, `y`, with, height values of the filter element in order to make the blur not be clipped.  Removes them if not neeeded

####Parameters

* `filter` The filter DOM element to update
* `stdDev` The standard deviation value on which to base the offset size

##`setBlur`

	canvas.setBlur = function( val, complete )

Adds/updates the blur filter to the selected element

####Parameters

* `val` Float with the new stdDeviation blur value
* `complete` Boolean indicating whether or not the action should be completed (to add to the undo manager)

##`getBold`

	this.getBold = function()

Check whether selected element is bold or not

####Returns

Boolean indicating whether or not element is bold

##`setBold`

	this.setBold = function( b )

Make the selected element bold or normal

####Parameters

* `b` Boolean indicating bold `true` or normal `false`

##`getItalic`

	this.getItalic = function()

Check whether selected element is italic or not

####Returns

Boolean indicating whether or not element is italic

##`setItalic`

	this.setItalic = function( i )

Make the selected element italic or normal

####Parameters
* `b` Boolean indicating italic (true) or normal (false)

##`getFontFamily`

	this.getFontFamily = function()

Returns the current font family

##`setFontFamily`

	this.setFontFamily = function( val )

Set the new font family

####Parameters

* `val` String with the new font family

##`getFontSize`

	this.getFontSize = function()

Returns the current font size

##`setFontSize`

	this.setFontSize = function( val )

Applies the given font size to the selected element

####Parameters

* `val` Float with the new font size

##`getText`

	this.getText = function()

Returns the current text `textContent` of the selected element

##`setTextContent`

	this.setTextContent = function( val )

Updates the text element with the given string

####Parameters

* `val` String with the new text

##`setImageURL`

	this.setImageURL = function( val )

Sets the new image URL for the selected image element.  Updates its size if a new URL is given

####Parameters

* `val` String with the image URL/path

##`setRectRadius`

	this.setRectRadius = function( val )

Sets the `rx` & `ry` values to the selected rect element to change its corner radius

####Parameters

* `val` The new radius

#Element manipulation

##`setSegType`

	this.setSegType = function( new_type )

Sets the new segment type to the selected segment(s).

####Parameters

* `new_type` Integer with the new segment type See http://www.w3.org/TR/SVG/paths.html#InterfaceSVGPathSeg for list

##`convertToPath`

	this.convertToPath = function( elem, getBBox )

Convert selected element to a path, or get the BBox of an element-as-path

####Parameters

* `elem` The DOM element to be converted
* `getBBox` Boolean on whether or not to only return the path’s BBox

####Returns

If the getBBox flag is true, the resulting path’s bounding box object.  Otherwise the resulting path element is returned.

##`changeSelectedAttributeNoUndo`

	var changeSelectedAttributeNoUndo = function( attr, newValue, elems )

This function makes the changes to the elements.  It does not add the change to the history stack.

####Parameters

* `attr` String with the attribute name
* `newValue` String or number with the new attribute value
* `elems` The DOM elements to apply the change to

##`changeSelectedAttribute`

	var changeSelectedAttribute = this.changeSelectedAttribute = function( attr, val, elems )

Change the given/selected element and add the original value to the history stack If you want to change all selectedElements, ignore the elems argument.  If you want to change only a subset of selectedElements, then send the subset to this function in the elems argument.

####Parameters

* `attr` String with the attribute name
* `newValue` String or number with the new attribute value
* `elems` The DOM elements to apply the change to

##`deleteSelectedElements`

	this.deleteSelectedElements = function()

Removes all selected elements from the DOM and adds the change to the history stack

##`groupSelectedElements`

	this.groupSelectedElements = function()

Wraps all the selected elements in a group (g) element

##`ungroupSelectedElement`

	this.ungroupSelectedElement = function()

Unwraps all the elements in a selected group (g) element.  This requires significant recalculations to apply group’s transforms, etc to its children

##`moveToTopSelectedElement`

	this.moveToTopSelectedElement = function()

Repositions the selected element to the bottom in the DOM to appear on top of other elements

##`moveToBottomSelectedElement`

	this.moveToBottomSelectedElement = function()

Repositions the selected element to the top in the DOM to appear under other elements

##`moveSelectedElements`

	this.moveSelectedElements = function( dx, dy, undoable )

Moves selected elements on the X/Y axis

####Parameters

* `dx` Float with the distance to move on the x-axis
* `dy` Float with the distance to move on the y-axis
* `undoable` Boolean indicating whether or not the action should be undoable

####Returns

Batch command for the move

##`cloneSelectedElements`

	this.cloneSelectedElements = function()

Create deep DOM copies (clones) of all selected elements and move them slightly from their originals

##`alignSelectedElements`

	this.alignSelectedElements = function( type, relative_to )

Aligns selected elements

####Parameters

* `type` String with single character indicating the alignment type
* `relative_to` String that must be one of the following: “selected”, “largest”, “smallest”, “page”

#Additional editor tools

##`updateCanvas`

	this.updateCanvas = function( w, h )

Updates the editor canvas width/height/position after a zoom has occurred

####Parameters

* `w` Float with the new width
* `h` Float with the new height

####Returns

Object with the following values:

* `x` - The canvas’ new x coordinate
* `y` - The canvas’ new y coordinate
* `old_x` - The canvas’ old x coordinate
* `old_y` - The canvas’ old y coordinate
* `d_x` - The x position difference
* `d_y` - The y position difference

##`setBackground`

	this.setBackground = function( color, url )

Set the background of the editor (NOT the actual document)

####Parameters

* `color` String with fill color to apply
* `url` URL or path to image to use

##`cycleElement`

	this.cycleElement = function( next )

Select the next/previous element within the current layer

####Parameters

* `next` Boolean where true = next and false = previous element
