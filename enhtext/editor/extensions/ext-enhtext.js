/*
 * ext-enhtext.js
 *
 * Enhanced Text tool for SVG-edit
 *
 * Licensed under the Apache License, Version 2
 *
 * Copyright(c) 2010 Jeff Schiller
 *
 */

$(function() {
	svgCanvas.addExtension("enhText", function(S) {
		var svgcontent = S.svgcontent,
			addElem = S.addSvgElementFromJson,
			selElems,
			svgns = "http://www.w3.org/2000/svg",
			xlinkns = "http://www.w3.org/1999/xlink",
			xmlns = "http://www.w3.org/XML/1998/namespace",
			xmlnsns = "http://www.w3.org/2000/xmlns/",
			se_ns = "http://svg-edit.googlecode.com",
			htmlns = "http://www.w3.org/1999/xhtml",
			editingforeign = false,
			svgdoc = S.svgroot.parentNode.ownerDocument,
			started,
			newFO;
			
		/*
		var properlySourceSizeTextArea = function(){
			// TODO: remove magic numbers here and get values from CSS
			var height = $('#svg_source_container').height() - 80;
			$('#svg_source_textarea').css('height', height);
		};
		*/

		function showPanel(on) {
			var fc_rules = $('#fc_rules');
			if(!fc_rules.length) {
				fc_rules = $('<style id="fc_rules"><\/style>').appendTo('head');
			} 
			fc_rules.text(!on?"":" #tool_topath { display: none !important; }");
			$('#enhText_panel').toggle(on);
		}

		/*
		function toggleSourceButtons(on) {
			$('#tool_source_save, #tool_source_cancel').toggle(!on);
			$('#foreign_save, #foreign_cancel').toggle(on);
		}
		*/
		
		function setAttr(attr, val) {
			svgCanvas.changeSelectedAttribute(attr, val);
			S.call("changed", selElems);
		}
		
		
		return {
			name: "enhText",
			svgicons: "extensions/enhtext-icons.xml",
			buttons: [{
				id: "tool_enhtext",
				type: "mode",
				title: "Enhanced Text Tool",
				events: {
					'click': function() {
						svgCanvas.setMode('enhtext')
					}
				}
			},/*{
				id: "edit_foreign",
				type: "context",
				panel: "enhText_panel",
				title: "Edit ForeignObject Content",
				events: {
					'click': function() {
						showForeignEditor();
					}
				}
			}*/],
			
			context_tools: [{
				type: "input",
				panel: "enhText_panel",
				title: "Change text's width",
				id: "enhtext_width",
				label: "w",
				size: 3,
				events: {
					change: function() {
						setAttr('width', this.value);
					}
				}
			},{
				type: "input",
				panel: "enhText_panel",
				title: "Change text's height",
				id: "enhtext_height",
				label: "h",
				events: {
					change: function() {
						setAttr('height', this.value);
					}
				}
			},{
				type: "input",
				panel: "enhText_panel",
				title: "Change text font size",
				id: "enhtext_font_size",
				label: "font-size",
				size: 2,
				defval: 16,
				events: {
					change: function() {
						setAttr('font-size', this.value);
					}
				}
			}],
			callback: function() {
				$('#enhText_panel').hide();

				/*
				var endChanges = function() {
					$('#svg_source_editor').hide();
					editingforeign = false;
					$('#svg_source_textarea').blur();
					toggleSourceButtons(false);
				}
				*/

				/*
				// TODO: Needs to be done after orig icon loads
				setTimeout(function() {				
					// Create source save/cancel buttons
					var save = $('#tool_source_save').clone()
						.hide().attr('id', 'foreign_save').unbind()
						.appendTo("#tool_source_back").click(function() {
							
							if (!editingforeign) return;

							if (!setForeignString($('#svg_source_textarea').val())) {
								$.confirm("Errors found. Revert to original?", function(ok) {
									if(!ok) return false;
									endChanges();
								});
							} else {
								endChanges();
							}
							// setSelectMode();	
						});
						
					var cancel = $('#tool_source_cancel').clone()
						.hide().attr('id', 'foreign_cancel').unbind()
						.appendTo("#tool_source_back").click(function() {
							endChanges();
						});
					
				}, 3000);
				*/
			},
			mouseDown: function(opts) {
				var e = opts.event;
				
				if(svgCanvas.getMode() == "enhtext") {

					started = true;
					newFO = S.addSvgElementFromJson({
						"element": "foreignObject",
						"attr": {
							"x": opts.start_x,
							"y": opts.start_y,
							"id": S.getNextId(),
							"font-size": 16, //cur_text.font_size,
							"width": "120",
							"height": "40",
							"style": "pointer-events:inherit"
						}
					});
					var div = svgdoc.createElementNS(htmlns, 'div');
					div.setAttributeNS(xmlnsns, 'xmlns', htmlns);
					div.setAttribute('display', 'inline');
					div.setAttribute("contenteditable", "true");
					var p = svgdoc.createElementNS(htmlns, 'p');
					p.appendChild( svgdoc.createTextNode("text") );
					div.appendChild(p);
					newFO.appendChild(div);
					return {
						started: true
					};
				}
			},
			mouseUp: function(opts) {
				var e = opts.event;
				if(svgCanvas.getMode() == "enhtext" && started) {
					var attrs = $(newFO).attr(["width", "height"]);
					keep = (attrs.width != 0 || attrs.height != 0);
					svgCanvas.addToSelection([newFO], true);

					return {
						keep: keep,
						element: newFO
					}

				}
				
			},
			selectedChanged: function(opts) {
				// Use this to update the current selected elements
				selElems = opts.elems;
				
				var i = selElems.length;
				
				while(i--) {
					var elem = selElems[i];
					if(elem && elem.tagName == "foreignObject") {
						if(opts.selectedElement && !opts.multiselected &&
							elem.firstElementChild.namespaceURI == htmlns) {
							$('#enhtext_font_size').val(elem.getAttribute("font-size"));
							$('#enhtext_width').val(elem.getAttribute("width"));
							$('#enhtext_height').val(elem.getAttribute("height"));
						
							showPanel(true);
						} else {
							showPanel(false);
						}
					} else {
						showPanel(false);
					}
				}
			},
			elementChanged: function(opts) {
				var elem = opts.elems[0];
			}
		};
	});
});
