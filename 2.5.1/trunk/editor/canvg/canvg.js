/*
 * canvg.js - Javascript SVG parser and renderer on Canvas
 * MIT Licensed 
 * Gabe Lerner (gabelerner@gmail.com)
 * http://code.google.com/p/canvg/
 *
 * Requires: rgbcolor.js - http://www.phpied.com/rgb-color-parser-in-javascript/
 */
if(!window.console) {
	window.console = {};
	window.console.log = function(str) {};
	window.console.dir = function(str) {};
}
(function(){
	// canvg(target, s)
	// target: canvas element or the id of a canvas element
	// s: svg string or url to svg file
	this.canvg = function (target, s) {
		if (typeof target == 'string') {
			target = document.getElementById(target);
		}
		
		// reuse class per canvas
		var svg;
		if (target.svg == null) {
			svg = build();
			target.svg = svg;
		}
		else {
			svg = target.svg;
			svg.stop();
		}
		
		var ctx = target.getContext('2d');
		if (s.substr(0,1) == '<') {
			// load from xml string
			svg.loadXml(ctx, s);
		}
		else {
			// load from url
			svg.load(ctx, s);
		}
	}

	function build() {
		var svg = {};
		
		svg.FRAMERATE = 30;
		
		// globals
		svg.init = function(ctx) {
			svg.Definitions = {};
			svg.Styles = {};
			svg.Animations = [];
			svg.ctx = ctx;
			svg.ViewPort = new (function () {
				this.viewPorts = [];
				this.SetCurrent = function(width, height) { this.viewPorts.push({ width: width, height: height }); }
				this.RemoveCurrent = function() { this.viewPorts.pop(); }
				this.Current = function() { return this.viewPorts[this.viewPorts.length - 1]; }
				this.width = function() { return this.Current().width; }
				this.height = function() { return this.Current().height; }
				this.ComputeSize = function(d) {
					if (d != null && typeof(d) == 'number') return d;
					if (d == 'x') return this.width();
					if (d == 'y') return this.height();
					return Math.sqrt(Math.pow(this.width(), 2) + Math.pow(this.height(), 2)) / Math.sqrt(2);			
				}
			});
		}
		svg.init();

		// trim
		svg.trim = function(s) { return s.replace(/^\s+|\s+$/g, ''); }
		
		// compress spaces
		svg.compressSpaces = function(s) { return s.replace(/[\s\r\t\n]+/gm,' '); }
		
		// ajax
		svg.ajax = function(url) {
			var AJAX;
			if(window.XMLHttpRequest){AJAX=new XMLHttpRequest();}
			else{AJAX=new ActiveXObject('Microsoft.XMLHTTP');}
			if(AJAX){
			   AJAX.open('GET',url,false);
			   AJAX.send(null);
			   return AJAX.responseText;
			}
			return null;
		} 
		
		// parse xml
		svg.parseXml = function(xml) {
			if (window.DOMParser)
			{
				var parser = new DOMParser();
				return parser.parseFromString(xml, 'text/xml');
			}
			else 
			{
				xml = xml.replace(/<!DOCTYPE svg[^>]*>/, '');
				var xmlDoc = new ActiveXObject('Microsoft.XMLDOM');
				xmlDoc.async = 'false';
				xmlDoc.loadXML(xml); 
				return xmlDoc;
			}		
		}
		
		svg.Property = function(name, value) {
			this.name = name;
			this.value = value;
			
			this.hasValue = function() {
				return (this.value != null && this.value != '');
			}
							
			// return the numerical value of the property
			this.numValue = function() {
				if (!this.hasValue()) return 0;
				
				var n = parseFloat(this.value);
				if ((this.value + '').match(/%$/)) {
					n = n / 100.0;
				}
				return n;
			}
			
			this.valueOrDefault = function(def) {
				if (this.hasValue()) return this.value;
				return def;
			}
			
			this.numValueOrDefault = function(def) {
				if (this.hasValue()) return this.numValue();
				return def;
			}
			
			/* EXTENSIONS */
			var that = this;
			
			// color extensions
			this.Color = {
				// augment the current color value with the opacity
				addOpacity: function(opacity) {
					var newValue = that.value;
					if (opacity != null && opacity != '') {
						var color = new RGBColor(that.value);
						if (color.ok) {
							newValue = 'rgba(' + color.r + ', ' + color.g + ', ' + color.b + ', ' + opacity + ')';
						}
					}
					return new svg.Property(that.name, newValue);
				}
			}
			
			// definition extensions
			this.Definition = {
				// get the definition from the definitions table
				getDefinition: function() {
					var name = that.value.replace(/^(url\()?#([^\)]+)\)?$/, '$2');
					return svg.Definitions[name];
				},
				
				isUrl: function() {
					return that.value.indexOf('url(') == 0
				},
				
				getFillStyle: function(e) {
					var def = this.getDefinition();
					
					// gradient
					if (def != null && def.createGradient) {
						return def.createGradient(svg.ctx, e);
					}
					
					// pattern
					if (def != null && def.createPattern) {
						return def.createPattern(svg.ctx, e);
					}
					
					return null;
				}
			}
			
			// length extensions
			this.Length = {
				DPI: function(viewPort) {
					return 96.0; // TODO: compute?
				},
				
				EM: function(viewPort) {
					var em = 12;
					
					var fontSize = new svg.Property('fontSize', svg.Font.Parse(svg.ctx.font).fontSize);
					if (fontSize.hasValue()) em = fontSize.Length.toPixels(viewPort);
					
					return em;
				},
			
				// get the length as pixels
				toPixels: function(viewPort) {
					if (!that.hasValue()) return 0;
					var s = that.value+'';
					if (s.match(/em$/)) return that.numValue() * this.EM(viewPort);
					if (s.match(/ex$/)) return that.numValue() * this.EM(viewPort) / 2.0;
					if (s.match(/px$/)) return that.numValue();
					if (s.match(/pt$/)) return that.numValue() * 1.25;
					if (s.match(/pc$/)) return that.numValue() * 15;
					if (s.match(/cm$/)) return that.numValue() * this.DPI(viewPort) / 2.54;
					if (s.match(/mm$/)) return that.numValue() * this.DPI(viewPort) / 25.4;
					if (s.match(/in$/)) return that.numValue() * this.DPI(viewPort);
					if (s.match(/%$/)) return that.numValue() * svg.ViewPort.ComputeSize(viewPort);
					return that.numValue();
				}
			}
			
			// time extensions
			this.Time = {
				// get the time as milliseconds
				toMilliseconds: function() {
					if (!that.hasValue()) return 0;
					var s = that.value+'';
					if (s.match(/s$/)) return that.numValue() * 1000;
					if (s.match(/ms$/)) return that.numValue();
					return that.numValue();
				}
			}
			
			// angle extensions
			this.Angle = {
				// get the angle as radians
				toRadians: function() {
					if (!that.hasValue()) return 0;
					var s = that.value+'';
					if (s.match(/deg$/)) return that.numValue() * (Math.PI / 180.0);
					if (s.match(/grad$/)) return that.numValue() * (Math.PI / 200.0);
					if (s.match(/rad$/)) return that.numValue();
					return that.numValue() * (Math.PI / 180.0);
				}
			}
		}
		
		// fonts
		svg.Font = new (function() {
			this.Styles = ['normal','italic','oblique','inherit'];
			this.Variants = ['normal','small-caps','inherit'];
			this.Weights = ['normal','bold','bolder','lighter','100','200','300','400','500','600','700','800','900','inherit'];
			
			this.CreateFont = function(fontStyle, fontVariant, fontWeight, fontSize, fontFamily, inherit) { 
				var f = inherit != null ? this.Parse(inherit) : this.CreateFont('', '', '', '', '', svg.ctx.font);
				return { 
					fontFamily: fontFamily || f.fontFamily, 
					fontSize: fontSize || f.fontSize, 
					fontStyle: fontStyle || f.fontStyle, 
					fontWeight: fontWeight || f.fontWeight, 
					fontVariant: fontVariant || f.fontVariant,
					toString: function () { return [this.fontStyle, this.fontVariant, this.fontWeight, this.fontSize, this.fontFamily].join(' ') } 
				} 
			}
			
			var that = this;
			this.Parse = function(s) {
				var f = {};
				var d = svg.trim(svg.compressSpaces(s || '')).split(' ');
				var set = { fontSize: false, fontStyle: false, fontWeight: false, fontVariant: false }
				var ff = '';
				for (var i=0; i<d.length; i++) {
					if (!set.fontStyle && that.Styles.indexOf(d[i]) != -1) { if (d[i] != 'inherit') f.fontStyle = d[i]; set.fontStyle = true; }
					else if (!set.fontVariant && that.Variants.indexOf(d[i]) != -1) { if (d[i] != 'inherit') f.fontVariant = d[i]; set.fontStyle = set.fontVariant = true;	}
					else if (!set.fontWeight && that.Weights.indexOf(d[i]) != -1) {	if (d[i] != 'inherit') f.fontWeight = d[i]; set.fontStyle = set.fontVariant = set.fontWeight = true; }
					else if (!set.fontSize) { if (d[i] != 'inherit') f.fontSize = d[i].split('/')[0]; set.fontStyle = set.fontVariant = set.fontWeight = set.fontSize = true; }
					else { if (d[i] != 'inherit') ff += d[i]; }
				} if (ff != '') f.fontFamily = ff;
				return f;
			}
		});
		
		// points and paths
		svg.ToNumberArray = function(s) {
			var a = svg.trim(svg.compressSpaces((s || '').replace(/,/g, ' '))).split(' ');
			for (var i=0; i<a.length; i++) {
				a[i] = parseFloat(a[i]);
			}
			return a;
		}		
		svg.Point = function(x, y) {
			this.x = x;
			this.y = y;
			
			this.angleTo = function(p) {
				return Math.atan2(p.y - this.y, p.x - this.x);
			}
		}
		svg.CreatePoint = function(s) {
			var a = svg.ToNumberArray(s);
			return new svg.Point(a[0], a[1]);
		}
		svg.CreatePath = function(s) {
			var a = svg.ToNumberArray(s);
			var path = [];
			for (var i=0; i<a.length; i+=2) {
				path.push(new svg.Point(a[i], a[i+1]));
			}
			return path;
		}
		
		// bounding box
		svg.BoundingBox = function(x1, y1, x2, y2) { // pass in initial points if you want
			this.x1 = Number.NaN;
			this.y1 = Number.NaN;
			this.x2 = Number.NaN;
			this.y2 = Number.NaN;
			
			this.x = function() { return this.x1; }
			this.y = function() { return this.y1; }
			this.width = function() { return this.x2 - this.x1; }
			this.height = function() { return this.y2 - this.y1; }
			
			this.addPoint = function(x, y) {	
				if (x != null) {
					if (isNaN(this.x1) || isNaN(this.x2)) {
						this.x1 = x;
						this.x2 = x;
					}
					if (x < this.x1) this.x1 = x;
					if (x > this.x2) this.x2 = x;
				}
			
				if (y != null) {
					if (isNaN(this.y1) || isNaN(this.y2)) {
						this.y1 = y;
						this.y2 = y;
					}
					if (y < this.y1) this.y1 = y;
					if (y > this.y2) this.y2 = y;
				}
			}			
			this.addX = function(x) { this.addPoint(x, null); }
			this.addY = function(y) { this.addPoint(null, y); }
			
			this.addQuadraticCurve = function(p0x, p0y, p1x, p1y, p2x, p2y) {
				var cp1x = p0x + 2/3 * (p1x - p0x); // CP1 = QP0 + 2/3 *(QP1-QP0)
				var cp1y = p0y + 2/3 * (p1y - p0y); // CP1 = QP0 + 2/3 *(QP1-QP0)
				var cp2x = cp1x + 1/3 * (p2x - p0x); // CP2 = CP1 + 1/3 *(QP2-QP0)
				var cp2y = cp1y + 1/3 * (p2y - p0y); // CP2 = CP1 + 1/3 *(QP2-QP0)
				this.addBezierCurve(p0x, p0y, cp1x, cp2x, cp1y,	cp2y, p2x, p2y);
			}
			
			this.addBezierCurve = function(p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y) {
				// from http://blog.hackers-cafe.net/2009/06/how-to-calculate-bezier-curves-bounding.html
				var p0 = [p0x, p0y], p1 = [p1x, p1y], p2 = [p2x, p2y], p3 = [p3x, p3y];
				this.addPoint(p0[0], p0[1]);
				this.addPoint(p3[0], p3[1]);
				
				for (i=0; i<=1; i++) {
					var f = function(t) { 
						return Math.pow(1-t, 3) * p0[i]
						+ 3 * Math.pow(1-t, 2) * t * p1[i]
						+ 3 * (1-t) * Math.pow(t, 2) * p2[i]
						+ Math.pow(t, 3) * p3[i];
					}
					
					var b = 6 * p0[i] - 12 * p1[i] + 6 * p2[i];
					var a = -3 * p0[i] + 9 * p1[i] - 9 * p2[i] + 3 * p3[i];
					var c = 3 * p1[i] - 3 * p0[i];
					
					if (a == 0) {
						if (b == 0) continue;
						var t = -c / b;
						if (0 < t && t < 1) {
							if (i == 0) this.addX(f(t));
							if (i == 1) this.addY(f(t));
						}
						continue;
					}
					
					var b2ac = Math.pow(b, 2) - 4 * c * a;
					if (b2ac < 0) continue;
					var t1 = (-b + Math.sqrt(b2ac)) / (2 * a);
					if (0 < t1 && t1 < 1) {
						if (i == 0) this.addX(f(t1));
						if (i == 1) this.addY(f(t1));
					}
					var t2 = (-b - Math.sqrt(b2ac)) / (2 * a);
					if (0 < t2 && t2 < 1) {
						if (i == 0) this.addX(f(t2));
						if (i == 1) this.addY(f(t2));
					}
				}
			}
			
			this.addPoint(x1, y1);
			this.addPoint(x2, y2);
		}
		
		// transforms
		svg.Transform = function(v) {	
			var that = this;
			this.Type = {}
		
			// translate
			this.Type.translate = function(s) {
				this.p = svg.CreatePoint(s);			
				this.apply = function(ctx) {
					ctx.translate(this.p.x || 0.0, this.p.y || 0.0);
				}
			}
			
			// rotate
			this.Type.rotate = function(s) {
				var a = svg.ToNumberArray(s);
				this.angle = new svg.Property('angle', a[0]);
				this.cx = a[1] || 0;
				this.cy = a[2] || 0;
				this.apply = function(ctx) {
					ctx.translate(this.cx, this.cy);
					ctx.rotate(this.angle.Angle.toRadians());
					ctx.translate(-this.cx, -this.cy);
				}
			}
			
			this.Type.scale = function(s) {
				this.p = svg.CreatePoint(s);
				this.apply = function(ctx) {
					ctx.scale(this.p.x || 1.0, this.p.y || this.p.x || 1.0);
				}
			}
			
			this.Type.matrix = function(s) {
				this.m = svg.ToNumberArray(s);
				this.apply = function(ctx) {
					ctx.transform(this.m[0], this.m[1], this.m[2], this.m[3], this.m[4], this.m[5]);
				}
			}
			
			this.Type.SkewBase = function(s) {
				this.base = that.Type.matrix;
				this.base(s);
				this.angle = new svg.Property('angle', s);
			}
			this.Type.SkewBase.prototype = new this.Type.matrix;
			
			this.Type.skewX = function(s) {
				this.base = that.Type.SkewBase;
				this.base(s);
				this.m = [1, 0, Math.tan(this.angle.Angle.toRadians()), 1, 0, 0];
			}
			this.Type.skewX.prototype = new this.Type.SkewBase;
			
			this.Type.skewY = function(s) {
				this.base = that.Type.SkewBase;
				this.base(s);
				this.m = [1, Math.tan(this.angle.Angle.toRadians()), 0, 1, 0, 0];
			}
			this.Type.skewY.prototype = new this.Type.SkewBase;
		
			this.transforms = [];
			this.apply = function(ctx) {
				for (var i=0; i<this.transforms.length; i++) {
					this.transforms[i].apply(ctx);
				}
			}
			
			var data = v.split(/\s(?=[a-z])/);
			for (var i=0; i<data.length; i++) {
				var type = data[i].split('(')[0];
				var s = data[i].split('(')[1].replace(')','');
				var transform = eval('new this.Type.' + type + '(s)');
				this.transforms.push(transform);
			}
		}
		
		// elements
		svg.Element = {}
		
		svg.Element.ElementBase = function(node) {	
			this.attributes = {};
			this.styles = {};
			this.children = [];
			
			// get or create attribute
			this.attribute = function(name, createIfNotExists) {
				var a = this.attributes[name];
				if (a != null) return a;
							
				a = new svg.Property(name, '');
				if (createIfNotExists == true) this.attributes[name] = a;
				return a;
			}
			
			// get or create style
			this.style = function(name, createIfNotExists) {
				var s = this.styles[name];
				if (s != null) return s;
				
				var a = this.attribute(name);
				if (a != null && a.hasValue()) {
					return a;
				}
					
				s = new svg.Property(name, '');
				if (createIfNotExists == true) this.styles[name] = s;
				return s;
			}
			
			// base render
			this.render = function(ctx) {
				ctx.save();
				this.setContext(ctx);
				this.renderChildren(ctx);
				this.clearContext(ctx);
				ctx.restore();
			}
			
			// base set context
			this.setContext = function(ctx) {
				// OVERRIDE ME!
			}
			
			// base clear context
			this.clearContext = function(ctx) {
				// OVERRIDE ME!
			}			
			
			// base render children
			this.renderChildren = function(ctx) {
				for (var i=0; i<this.children.length; i++) {
					this.children[i].render(ctx);
				}
			}
			
			this.addChild = function(childNode, create) {
				var child = childNode;
				if (create) child = svg.CreateElement(childNode);
				child.parent = this;
				this.children.push(child);			
			}
				
			if (node != null && node.nodeType == 1) { //ELEMENT_NODE
				// add children
				for (var i=0; i<node.childNodes.length; i++) {
					var childNode = node.childNodes[i];
					if (childNode.nodeType == 1) this.addChild(childNode, true); //ELEMENT_NODE
				}
				
				// add attributes
				for (var i=0; i<node.attributes.length; i++) {
					var attribute = node.attributes[i];
					this.attributes[attribute.nodeName] = new svg.Property(attribute.nodeName, attribute.nodeValue);
				}
										
				// add tag styles
				var styles = svg.Styles[this.type];
				if (styles != null) {
					for (var name in styles) {
						this.styles[name] = styles[name];
					}
				}					
				
				// add class styles
				if (this.attribute('class').hasValue()) {
					var classes = svg.compressSpaces(this.attribute('class').value).split(' ');
					for (var j=0; j<classes.length; j++) {
						styles = svg.Styles['.'+classes[j]];
						if (styles != null) {
							for (var name in styles) {
								this.styles[name] = styles[name];
							}
						}
					}
				}
				
				// add inline styles
				if (this.attribute('style').hasValue()) {
					var styles = this.attribute('style').value.split(';');
					for (var i=0; i<styles.length; i++) {
						if (svg.trim(styles[i]) != '') {
							var style = styles[i].split(':');
							var name = svg.trim(style[0]);
							var value = svg.trim(style[1]);
							this.styles[name] = new svg.Property(name, value);
						}
					}
				}
				
				// set id
				if (this.attribute('id').hasValue()) svg.Definitions[this.attribute('id').value] = this;				
			}
		}
		
		svg.Element.RenderedElementBase = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);
			
			this.setContext = function(ctx) {
				// fill
				if (this.style('fill').Definition.isUrl()) {
					var fs = this.style('fill').Definition.getFillStyle(this);
					if (fs != null) ctx.fillStyle = fs;
				}
				else if (this.style('fill').hasValue()) {
					var fillStyle = this.style('fill');
					if (this.style('fill-opacity').hasValue()) fillStyle = fillStyle.Color.addOpacity(this.style('fill-opacity').value);
					ctx.fillStyle = (fillStyle.value == 'none' ? 'rgba(0,0,0,0)' : fillStyle.value);
				}
									
				// stroke
				if (this.style('stroke').Definition.isUrl()) {
					var fs = this.style('stroke').Definition.getFillStyle(this);
					if (fs != null) ctx.strokeStyle = fs;
				}
				else if (this.style('stroke').hasValue()) {
					var strokeStyle = this.style('stroke');
					if (this.style('stroke-opacity').hasValue()) strokeStyle = strokeStyle.Color.addOpacity(this.style('stroke-opacity').value);
					ctx.strokeStyle = (strokeStyle.value == 'none' ? 'rgba(0,0,0,0)' : strokeStyle.value);
				}
				if (this.style('stroke-width').hasValue()) ctx.lineWidth = this.style('stroke-width').Length.toPixels();
				if (this.style('stroke-linecap').hasValue()) ctx.lineCap = this.style('stroke-linecap').value;
				if (this.style('stroke-linejoin').hasValue()) ctx.lineJoin = this.style('stroke-linejoin').value;
				if (this.style('stroke-miterlimit').hasValue()) ctx.miterLimit = this.style('stroke-miterlimit').value;

				// font
				if (typeof(ctx.font) != 'undefined') {
					ctx.font = svg.Font.CreateFont( 
						this.style('font-style').value, 
						this.style('font-variant').value, 
						this.style('font-weight').value, 
						this.style('font-size').hasValue() ? this.style('font-size').Length.toPixels() + 'px' : '', 
						this.style('font-family').value).toString();
				}
				
				// transform
				if (this.attribute('transform').hasValue()) { 
					var transform = new svg.Transform(this.attribute('transform').value);
					transform.apply(ctx);
				}
				
				// clip
				if (this.attribute('clip-path').hasValue()) {
					var clip = this.attribute('clip-path').Definition.getDefinition();
					if (clip != null) clip.apply(ctx);
				}
				
				// opacity
				if (this.style('opacity').hasValue()) {
					ctx.globalAlpha = this.style('opacity').numValue();
				}
			}		
		}
		svg.Element.RenderedElementBase.prototype = new svg.Element.ElementBase;
		
		svg.Element.PathElementBase = function(node) {
			this.base = svg.Element.RenderedElementBase;
			this.base(node);
			
			this.path = function(ctx) {
				if (ctx != null) ctx.beginPath();
				return new svg.BoundingBox();
			}
			
			this.renderChildren = function(ctx) {
				this.path(ctx);
				if (ctx.fillStyle != '') ctx.fill();
				if (ctx.strokeStyle != '') ctx.stroke();
				
				var markers = this.getMarkers();
				if (markers != null) {
					if (this.attribute('marker-start').Definition.isUrl()) {
						var marker = this.attribute('marker-start').Definition.getDefinition();
						marker.render(ctx, markers[0][0], markers[0][1]);
					}
					if (this.attribute('marker-mid').Definition.isUrl()) {
						var marker = this.attribute('marker-mid').Definition.getDefinition();
						for (var i=1;i<markers.length-1;i++) {
							marker.render(ctx, markers[i][0], markers[i][1]);
						}
					}
					if (this.attribute('marker-end').Definition.isUrl()) {
						var marker = this.attribute('marker-end').Definition.getDefinition();
						marker.render(ctx, markers[markers.length-1][0], markers[markers.length-1][1]);
					}
				}					
			}
			
			this.getBoundingBox = function() {
				return this.path();
			}
			
			this.getMarkers = function() {
				return null;
			}
		}
		svg.Element.PathElementBase.prototype = new svg.Element.RenderedElementBase;
		
		// svg element
		svg.Element.svg = function(node) {
			this.base = svg.Element.RenderedElementBase;
			this.base(node);
			
			this.baseClearContext = this.clearContext;
			this.clearContext = function(ctx) {
				this.baseClearContext(ctx);
				svg.ViewPort.RemoveCurrent();
			}
			
			this.baseSetContext = this.setContext;
			this.setContext = function(ctx) {
				this.baseSetContext(ctx);
				
				// create new view port
				if (this.attribute('x').hasValue() && this.attribute('y').hasValue()) {
					ctx.translate(this.attribute('x').Length.toPixels('x'), this.attribute('y').Length.toPixels('y'));
				}
				
				var width = svg.ViewPort.width();
				var height = svg.ViewPort.height();
				if (this.attribute('width').hasValue() && this.attribute('height').hasValue()) {
					width = this.attribute('width').Length.toPixels('x');
					height = this.attribute('height').Length.toPixels('y');
					
					var x = 0;
					var y = 0;
					if (this.attribute('refX').hasValue() && this.attribute('refY').hasValue()) {
						x = -this.attribute('refX').Length.toPixels('x');
						y = -this.attribute('refY').Length.toPixels('y');
					}
					
					ctx.beginPath();
					ctx.moveTo(x, y);
					ctx.lineTo(width, y);
					ctx.lineTo(width, height);
					ctx.lineTo(x, height);
					ctx.closePath();
					ctx.clip();
				}
				svg.ViewPort.SetCurrent(width, height);	
						
				// viewbox
				if (this.attribute('viewBox').hasValue()) {				
					var viewBox = svg.ToNumberArray(this.attribute('viewBox').value);
					var minX = viewBox[0];
					var minY = viewBox[1];
					width = viewBox[2];
					height = viewBox[3];
					
					// aspect ratio - http://www.w3.org/TR/SVG/coords.html#PreserveAspectRatioAttribute
					var preserveAspectRatio = svg.compressSpaces(this.attribute('preserveAspectRatio').value);
					preserveAspectRatio = preserveAspectRatio.replace(/^defer\s/,''); // ignore defer
					var align = preserveAspectRatio.split(' ')[0] || 'xMidYMid';
					var meetOrSlice = preserveAspectRatio.split(' ')[1] || 'meet';					
					
					// calculate scale
					var scaleX = svg.ViewPort.width() / width;
					var scaleY = svg.ViewPort.height() / height;
					var scaleMin = Math.min(scaleX, scaleY);
					var scaleMax = Math.max(scaleX, scaleY);
					if (meetOrSlice == 'meet') { width *= scaleMin; height *= scaleMin; }
					if (meetOrSlice == 'slice') { width *= scaleMax; height *= scaleMax; }	
					
					if (this.attribute('refX').hasValue() && this.attribute('refY').hasValue()) {
						ctx.translate(-scaleMin * this.attribute('refX').Length.toPixels('x'), -scaleMin * this.attribute('refY').Length.toPixels('y'));
					} 
					else {					
						// align
						if (align.match(/^xMid/) && ((meetOrSlice == 'meet' && scaleMin == scaleY) || (meetOrSlice == 'slice' && scaleMax == scaleY))) ctx.translate(svg.ViewPort.width() / 2.0 - width / 2.0, 0); 
						if (align.match(/YMid$/) && ((meetOrSlice == 'meet' && scaleMin == scaleX) || (meetOrSlice == 'slice' && scaleMax == scaleX))) ctx.translate(0, svg.ViewPort.height() / 2.0 - height / 2.0); 
						if (align.match(/^xMax/) && ((meetOrSlice == 'meet' && scaleMin == scaleY) || (meetOrSlice == 'slice' && scaleMax == scaleY))) ctx.translate(svg.ViewPort.width() - width, 0); 
						if (align.match(/YMax$/) && ((meetOrSlice == 'meet' && scaleMin == scaleX) || (meetOrSlice == 'slice' && scaleMax == scaleX))) ctx.translate(0, svg.ViewPort.height() - height); 
					}
					
					// scale
					if (meetOrSlice == 'meet') ctx.scale(scaleMin, scaleMin); 
					if (meetOrSlice == 'slice') ctx.scale(scaleMax, scaleMax); 	
					ctx.translate(-minX, -minY);	
					
					svg.ViewPort.RemoveCurrent();	
					svg.ViewPort.SetCurrent(viewBox[2], viewBox[3]);						
				}				
				
				// initial values
				ctx.strokeStyle = 'rgba(0,0,0,0)';
				ctx.lineCap = 'butt';
				ctx.lineJoin = 'miter';
				ctx.miterLimit = 4;
			}
		}
		svg.Element.svg.prototype = new svg.Element.RenderedElementBase;

		// rect element
		svg.Element.rect = function(node) {
			this.base = svg.Element.PathElementBase;
			this.base(node);
			
			this.path = function(ctx) {
				var x = this.attribute('x').Length.toPixels('x');
				var y = this.attribute('y').Length.toPixels('y');
				var width = this.attribute('width').Length.toPixels('x');
				var height = this.attribute('height').Length.toPixels('y');
				var rx = this.attribute('rx').Length.toPixels('x');
				var ry = this.attribute('ry').Length.toPixels('y');
				if (this.attribute('rx').hasValue() && !this.attribute('ry').hasValue()) ry = rx;
				if (this.attribute('ry').hasValue() && !this.attribute('rx').hasValue()) rx = ry;
				
				if (ctx != null) {
					ctx.beginPath();
					ctx.moveTo(x + rx, y);
					ctx.lineTo(x + width - rx, y);
					ctx.quadraticCurveTo(x + width, y, x + width, y + ry)
					ctx.lineTo(x + width, y + height - ry);
					ctx.quadraticCurveTo(x + width, y + height, x + width - rx, y + height)
					ctx.lineTo(x + rx, y + height);
					ctx.quadraticCurveTo(x, y + height, x, y + height - ry)
					ctx.lineTo(x, y + ry);
					ctx.quadraticCurveTo(x, y, x + rx, y)
					ctx.closePath();
				}
				
				return new svg.BoundingBox(x, y, x + width, y + height);
			}
		}
		svg.Element.rect.prototype = new svg.Element.PathElementBase;
		
		// circle element
		svg.Element.circle = function(node) {
			this.base = svg.Element.PathElementBase;
			this.base(node);
			
			this.path = function(ctx) {
				var cx = this.attribute('cx').Length.toPixels('x');
				var cy = this.attribute('cy').Length.toPixels('y');
				var r = this.attribute('r').Length.toPixels();
			
				if (ctx != null) {
					ctx.beginPath();
					ctx.arc(cx, cy, r, 0, Math.PI * 2, true); 
					ctx.closePath();
				}
				
				return new svg.BoundingBox(cx - r, cy - r, cx + r, cy + r);
			}
		}
		svg.Element.circle.prototype = new svg.Element.PathElementBase;	

		// ellipse element
		svg.Element.ellipse = function(node) {
			this.base = svg.Element.PathElementBase;
			this.base(node);
			
			this.path = function(ctx) {
				var KAPPA = 4 * ((Math.sqrt(2) - 1) / 3);
				var rx = this.attribute('rx').Length.toPixels('x');
				var ry = this.attribute('ry').Length.toPixels('y');
				var cx = this.attribute('cx').Length.toPixels('x');
				var cy = this.attribute('cy').Length.toPixels('y');
				
				if (ctx != null) {
					ctx.beginPath();
					ctx.moveTo(cx, cy - ry);
					ctx.bezierCurveTo(cx + (KAPPA * rx), cy - ry,  cx + rx, cy - (KAPPA * ry), cx + rx, cy);
					ctx.bezierCurveTo(cx + rx, cy + (KAPPA * ry), cx + (KAPPA * rx), cy + ry, cx, cy + ry);
					ctx.bezierCurveTo(cx - (KAPPA * rx), cy + ry, cx - rx, cy + (KAPPA * ry), cx - rx, cy);
					ctx.bezierCurveTo(cx - rx, cy - (KAPPA * ry), cx - (KAPPA * rx), cy - ry, cx, cy - ry);
					ctx.closePath();
				}
				
				return new svg.BoundingBox(cx - rx, cy - ry, cx + rx, cy + ry);
			}
		}
		svg.Element.ellipse.prototype = new svg.Element.PathElementBase;			
		
		// line element
		svg.Element.line = function(node) {
			this.base = svg.Element.PathElementBase;
			this.base(node);
			
			this.getPoints = function() {
				return [
					new svg.Point(this.attribute('x1').Length.toPixels('x'), this.attribute('y1').Length.toPixels('y')),
					new svg.Point(this.attribute('x2').Length.toPixels('x'), this.attribute('y2').Length.toPixels('y'))];
			}
								
			this.path = function(ctx) {
				var points = this.getPoints();
				
				if (ctx != null) {
					ctx.beginPath();
					ctx.moveTo(points[0].x, points[0].y);
					ctx.lineTo(points[1].x, points[1].y);
				}
				
				return new svg.BoundingBox(points[0].x, points[0].y, points[1].x, points[1].y);
			}
			
			this.getMarkers = function() {
				var points = this.getPoints();	
				var a = points[0].angleTo(points[1]);
				return [[points[0], a], [points[1], a]];
			}
		}
		svg.Element.line.prototype = new svg.Element.PathElementBase;		
				
		// polyline element
		svg.Element.polyline = function(node) {
			this.base = svg.Element.PathElementBase;
			this.base(node);
			
			this.points = svg.CreatePath(this.attribute('points').value);
			this.path = function(ctx) {
				var bb = new svg.BoundingBox(this.points[0].x, this.points[0].y);
				if (ctx != null) {
					ctx.beginPath();
					ctx.moveTo(this.points[0].x, this.points[0].y);
				}
				for (var i=1; i<this.points.length; i++) {
					bb.addPoint(this.points[i].x, this.points[i].y);
					if (ctx != null) ctx.lineTo(this.points[i].x, this.points[i].y);
				}
				return bb;
			}
			
			this.getMarkers = function() {
				var markers = [];
				for (var i=0; i<this.points.length - 1; i++) {
					markers.push([this.points[i], this.points[i].angleTo(this.points[i+1])]);
				}
				markers.push([this.points[this.points.length-1], markers[markers.length-1][1]]);
				return markers;
			}			
		}
		svg.Element.polyline.prototype = new svg.Element.PathElementBase;				
				
		// polygon element
		svg.Element.polygon = function(node) {
			this.base = svg.Element.polyline;
			this.base(node);
			
			this.basePath = this.path;
			this.path = function(ctx) {
				var bb = this.basePath(ctx);
				if (ctx != null) {
					ctx.lineTo(this.points[0].x, this.points[0].y);
					ctx.closePath();
				}
				return bb;
			}
		}
		svg.Element.polygon.prototype = new svg.Element.polyline;

		// path element
		svg.Element.path = function(node) {
			this.base = svg.Element.PathElementBase;
			this.base(node);
					
			var d = this.attribute('d').value;
			// TODO: floating points, convert to real lexer based on http://www.w3.org/TR/SVG11/paths.html#PathDataBNF
			d = d.replace(/,/gm,' '); // get rid of all commas
			d = d.replace(/([A-Za-z])([A-Za-z])/gm,'$1 $2'); // separate commands from commands
			d = d.replace(/([A-Za-z])([A-Za-z])/gm,'$1 $2'); // separate commands from commands
			d = d.replace(/([A-Za-z])([^\s])/gm,'$1 $2'); // separate commands from points
			d = d.replace(/([^\s])([A-Za-z])/gm,'$1 $2'); // separate commands from points
			d = d.replace(/([0-9])([+\-])/gm,'$1 $2'); // separate digits when no comma
			d = d.replace(/(\.[0-9]*)(\.)/gm,'$1 $2'); // separate digits when no comma
			d = d.replace(/([Aa](\s+[0-9]+){3})\s+([01])\s*([01])/gm,'$1 $3 $4 '); // shorthand elliptical arc path syntax
			d = svg.compressSpaces(d); // compress multiple spaces
			d = svg.trim(d);
			this.PathParser = new (function(d) {
				this.tokens = d.split(' ');
				
				this.reset = function() {
					this.i = -1;
					this.command = '';
					this.control = new svg.Point(0, 0);
					this.current = new svg.Point(0, 0);
					this.points = [];
					this.angles = [];
				}
								
				this.isEnd = function() {
					return this.i == this.tokens.length - 1;
				}
				
				this.isCommandOrEnd = function() {
					if (this.isEnd()) return true;
					return this.tokens[this.i + 1].match(/[A-Za-z]/) != null;
				}
				
				this.isRelativeCommand = function() {
					return this.command == this.command.toLowerCase();
				}
				
				this.getToken = function() {
					this.i = this.i + 1;
					return this.tokens[this.i];
				}
				
				this.getScalar = function() {
					return parseFloat(this.getToken());
				}
				
				this.nextCommand = function() {
					this.command = this.getToken();
				}				
				
				this.getPoint = function() {
					var p = new svg.Point(this.getScalar(), this.getScalar());
					return this.makeAbsolute(p);
				}
				
				this.getAsControlPoint = function() {
					var p = this.getPoint();
					this.control = p;
					return p;
				}
				
				this.getAsCurrentPoint = function() {
					var p = this.getPoint();
					this.current = p;
					return p;	
				}
				
				this.getReflectedControlPoint = function() {
					var p = new svg.Point(2 * this.current.x - this.control.x, 2 * this.current.y - this.control.y);					
					return this.makeAbsolute(p);
				}
				
				this.makeAbsolute = function(p) {
					if (this.isRelativeCommand()) {
						p.x = this.current.x + p.x;
						p.y = this.current.y + p.y;
					}
					return p;
				}
				
				this.addMarker = function(p, from) {
					this.addMarkerAngle(p, from == null ? null : from.angleTo(p));
				}
				
				this.addMarkerAngle = function(p, a) {
					this.points.push(p);
					this.angles.push(a);
				}				
				
				this.getMarkerPoints = function() { return this.points; }
				this.getMarkerAngles = function() {
					for (var i=0; i<this.angles.length; i++) {
						if (this.angles[i] == null) {
							for (var j=i+1; j<this.angles.length; j++) {
								if (this.angles[j] != null) {
									this.angles[i] = this.angles[j];
									break;
								}
							}
						}
					}
					return this.angles;
				}
			})(d);
			
			this.path = function(ctx) {		
				var pp = this.PathParser;
				pp.reset();
				
				var bb = new svg.BoundingBox();
				if (ctx != null) ctx.beginPath();
				while (!pp.isEnd()) {
					pp.nextCommand();
					if (pp.command.toUpperCase() == 'M') {
						var p = pp.getAsCurrentPoint();
						pp.addMarker(p);
						bb.addPoint(p.x, p.y);
						if (ctx != null) ctx.moveTo(p.x, p.y);
						while (!pp.isCommandOrEnd()) {
							var p = pp.getAsCurrentPoint();
							pp.addMarker(p);
							bb.addPoint(p.x, p.y);
							if (ctx != null) ctx.lineTo(p.x, p.y);
						}
					}
					else if (pp.command.toUpperCase() == 'L') {
						while (!pp.isCommandOrEnd()) {
							var c = pp.current;
							var p = pp.getAsCurrentPoint();
							pp.addMarker(p, c);
							bb.addPoint(p.x, p.y);
							if (ctx != null) ctx.lineTo(p.x, p.y);
						}
					}
					else if (pp.command.toUpperCase() == 'H') {
						while (!pp.isCommandOrEnd()) {
							var newP = new svg.Point((pp.isRelativeCommand() ? pp.current.x : 0) + pp.getScalar(), pp.current.y);
							pp.addMarker(newP, pp.current);
							pp.current = newP;
							bb.addPoint(pp.current.x, pp.current.y);
							if (ctx != null) ctx.lineTo(pp.current.x, pp.current.y);
						}
					}
					else if (pp.command.toUpperCase() == 'V') {
						while (!pp.isCommandOrEnd()) {
							var newP = new svg.Point(pp.current.x, (pp.isRelativeCommand() ? pp.current.y : 0) + pp.getScalar());
							pp.addMarker(newP, pp.current);
							pp.current = newP;
							bb.addPoint(pp.current.x, pp.current.y);
							if (ctx != null) ctx.lineTo(pp.current.x, pp.current.y);
						}
					}
					else if (pp.command.toUpperCase() == 'C') {
						while (!pp.isCommandOrEnd()) {
							var curr = pp.current;
							var p1 = pp.getPoint();
							var cntrl = pp.getAsControlPoint();
							var cp = pp.getAsCurrentPoint();
							pp.addMarker(cp, cntrl);
							bb.addBezierCurve(curr.x, curr.y, p1.x, p1.y, cntrl.x, cntrl.y, cp.x, cp.y);
							if (ctx != null) ctx.bezierCurveTo(p1.x, p1.y, cntrl.x, cntrl.y, cp.x, cp.y);
						}
					}
					else if (pp.command.toUpperCase() == 'S') {
						while (!pp.isCommandOrEnd()) {
							var curr = pp.current;
							var p1 = pp.getReflectedControlPoint();
							var cntrl = pp.getAsControlPoint();
							var cp = pp.getAsCurrentPoint();
							pp.addMarker(cp, cntrl);
							bb.addBezierCurve(curr.x, curr.y, p1.x, p1.y, cntrl.x, cntrl.y, cp.x, cp.y);
							if (ctx != null) ctx.bezierCurveTo(p1.x, p1.y, cntrl.x, cntrl.y, cp.x, cp.y);
						}				
					}					
					else if (pp.command.toUpperCase() == 'Q') {
						while (!pp.isCommandOrEnd()) {
							var curr = pp.current;
							var cntrl = pp.getAsControlPoint();
							var cp = pp.getAsCurrentPoint();
							pp.addMarker(cp, cntrl);
							bb.addQuadraticCurve(curr.x, curr.y, cntrl.x, cntrl.y, cp.x, cp.y);
							if (ctx != null) ctx.quadraticCurveTo(cntrl.x, cntrl.y, cp.x, cp.y);
						}
					}					
					else if (pp.command.toUpperCase() == 'T') {
						while (!pp.isCommandOrEnd()) {
							var curr = pp.current;
							var cntrl = pp.getReflectedControlPoint();
							pp.control = cntrl;
							var cp = pp.getAsCurrentPoint();
							pp.addMarker(cp, cntrl);
							bb.addQuadraticCurve(curr.x, curr.y, cntrl.x, cntrl.y, cp.x, cp.y);
							if (ctx != null) ctx.quadraticCurveTo(cntrl.x, cntrl.y, cp.x, cp.y);
						}					
					}

					else if (pp.command.toUpperCase() == 'A') {
						while (!pp.isCommandOrEnd()) {
						    var curr = pp.current;
							var rx = pp.getScalar();
							var ry = pp.getScalar();
							var xAxisRotation = pp.getScalar() * (Math.PI / 180.0);
							var largeArcFlag = pp.getScalar();
							var sweepFlag = pp.getScalar();
							var cp = pp.getAsCurrentPoint();
							
							// Conversion from endpoint to center parameterization
							// http://www.w3.org/TR/SVG11/implnote.html#ArcImplementationNotes
							// x1', y1'
							var currp = new svg.Point(
								Math.cos(xAxisRotation) * (curr.x - cp.x) / 2.0 + Math.sin(xAxisRotation) * (curr.y - cp.y) / 2.0,
								-Math.sin(xAxisRotation) * (curr.x - cp.x) / 2.0 + Math.cos(xAxisRotation) * (curr.y - cp.y) / 2.0
							);
							// adjust radii
							var l = Math.pow(currp.x,2)/Math.pow(rx,2)+Math.pow(currp.y,2)/Math.pow(ry,2);
							if (l > 1) {
								rx *= Math.sqrt(l);
								ry *= Math.sqrt(l);
							}
							// cx', cy'
							var s = (largeArcFlag == sweepFlag ? -1 : 1) * Math.sqrt(
								((Math.pow(rx,2)*Math.pow(ry,2))-(Math.pow(rx,2)*Math.pow(currp.y,2))-(Math.pow(ry,2)*Math.pow(currp.x,2))) /
								(Math.pow(rx,2)*Math.pow(currp.y,2)+Math.pow(ry,2)*Math.pow(currp.x,2))
							);
							if (isNaN(s)) s = 0;
							var cpp = new svg.Point(s * rx * currp.y / ry, s * -ry * currp.x / rx);
							// cx, cy
							var centp = new svg.Point(
								(curr.x + cp.x) / 2.0 + Math.cos(xAxisRotation) * cpp.x - Math.sin(xAxisRotation) * cpp.y,
								(curr.y + cp.y) / 2.0 + Math.sin(xAxisRotation) * cpp.x + Math.cos(xAxisRotation) * cpp.y
							);
							// vector magnitude
							var m = function(v) { return Math.sqrt(Math.pow(v[0],2) + Math.pow(v[1],2)); }
							// ratio between two vectors
							var r = function(u, v) { return (u[0]*v[0]+u[1]*v[1]) / (m(u)*m(v)) }
							// angle between two vectors
							var a = function(u, v) { return (u[0]*v[1] < u[1]*v[0] ? -1 : 1) * Math.acos(r(u,v)); }
							// initial angle
							var a1 = a([1,0], [(currp.x-cpp.x)/rx,(currp.y-cpp.y)/ry]);
							// angle delta
							var u = [(currp.x-cpp.x)/rx,(currp.y-cpp.y)/ry];
							var v = [(-currp.x-cpp.x)/rx,(-currp.y-cpp.y)/ry];
							var ad = a(u, v);
							if (r(u,v) <= -1) ad = Math.PI;
							if (r(u,v) >= 1) ad = 0;
							
							if (sweepFlag == 0 && ad > 0) ad = ad - 2 * Math.PI;
							if (sweepFlag == 1 && ad < 0) ad = ad + 2 * Math.PI;
							
							// for markers
							var halfWay = new svg.Point(
								centp.x - rx * Math.cos((a1 + ad) / 2),
								centp.y - ry * Math.sin((a1 + ad) / 2)
							);
							pp.addMarkerAngle(halfWay, (a1 + ad) / 2 + (sweepFlag == 0 ? 1 : -1) * Math.PI / 2);
							pp.addMarkerAngle(cp, ad + (sweepFlag == 0 ? 1 : -1) * Math.PI / 2);
														
							bb.addPoint(cp.x, cp.y); // TODO: this is too naive, make it better
							if (ctx != null) {
								var r = rx > ry ? rx : ry;
								var sx = rx > ry ? 1 : rx / ry;
								var sy = rx > ry ? ry / rx : 1;
							
								ctx.translate(centp.x, centp.y);
								ctx.rotate(xAxisRotation);
								ctx.scale(sx, sy);
								ctx.arc(0, 0, r, a1, a1 + ad, 1 - sweepFlag);
								ctx.scale(1/sx, 1/sy);
								ctx.rotate(-xAxisRotation);
								ctx.translate(-centp.x, -centp.y);
							}
						}
					}
					else if (pp.command.toUpperCase() == 'Z') {
						if (ctx != null) ctx.closePath();
					}
				}
							
				return bb;
			}
			
			this.getMarkers = function() {
				var points = this.PathParser.getMarkerPoints();
				var angles = this.PathParser.getMarkerAngles();
				
				var markers = [];
				for (var i=0; i<points.length; i++) {
					markers.push([points[i], angles[i]]);
				}
				return markers;
			}
		}
		svg.Element.path.prototype = new svg.Element.PathElementBase;
		
		// pattern element
		svg.Element.pattern = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);
			
			this.createPattern = function(ctx, element) {
				// render me using a temporary svg element
				var tempSvg = new svg.Element.svg();
				tempSvg.attributes['viewBox'] = new svg.Property('viewBox', this.attribute('viewBox').value);
				tempSvg.attributes['x'] = new svg.Property('x', this.attribute('x').value);
				tempSvg.attributes['y'] = new svg.Property('y', this.attribute('y').value);
				tempSvg.attributes['width'] = new svg.Property('width', this.attribute('width').value);
				tempSvg.attributes['height'] = new svg.Property('height', this.attribute('height').value);
				tempSvg.children = this.children;
				
				var c = document.createElement('canvas');
				c.width = this.attribute('width').Length.toPixels();
				c.height = this.attribute('height').Length.toPixels();
				tempSvg.render(c.getContext('2d'));		
				return ctx.createPattern(c, 'repeat');
			}
		}
		svg.Element.pattern.prototype = new svg.Element.ElementBase;
		
		// marker element
		svg.Element.marker = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);
			
			this.baseRender = this.render;
			this.render = function(ctx, point, angle) {
				ctx.translate(point.x, point.y);
				if (this.attribute('orient').valueOrDefault('auto') == 'auto') ctx.rotate(angle);
				if (this.attribute('markerUnits').valueOrDefault('strokeWidth') == 'strokeWidth') ctx.scale(ctx.lineWidth, ctx.lineWidth);
				ctx.save();
							
				// render me using a temporary svg element
				var tempSvg = new svg.Element.svg();
				tempSvg.attributes['viewBox'] = new svg.Property('viewBox', this.attribute('viewBox').value);
				tempSvg.attributes['refX'] = new svg.Property('refX', this.attribute('refX').value);
				tempSvg.attributes['refY'] = new svg.Property('refY', this.attribute('refY').value);
				tempSvg.attributes['width'] = new svg.Property('width', this.attribute('markerWidth').value);
				tempSvg.attributes['height'] = new svg.Property('height', this.attribute('markerHeight').value);
				tempSvg.attributes['fill'] = new svg.Property('fill', this.attribute('fill').valueOrDefault('black'));
				tempSvg.attributes['stroke'] = new svg.Property('stroke', this.attribute('stroke').valueOrDefault('none'));
				tempSvg.children = this.children;
				tempSvg.render(ctx);
				
				ctx.restore();
				if (this.attribute('markerUnits').valueOrDefault('strokeWidth') == 'strokeWidth') ctx.scale(1/ctx.lineWidth, 1/ctx.lineWidth);
				if (this.attribute('orient').valueOrDefault('auto') == 'auto') ctx.rotate(-angle);
				ctx.translate(-point.x, -point.y);
			}
		}
		svg.Element.marker.prototype = new svg.Element.ElementBase;
		
		// definitions element
		svg.Element.defs = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);			
			
			this.render = function(ctx) {
				// NOOP
			}
		}
		svg.Element.defs.prototype = new svg.Element.ElementBase;
		
		// base for gradients
		svg.Element.GradientBase = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);
			
			this.gradientUnits = this.attribute('gradientUnits').valueOrDefault('objectBoundingBox');
			
			this.stops = [];			
			for (var i=0; i<this.children.length; i++) {
				var child = this.children[i];
				this.stops.push(child);
			}	

			this.getGradient = function() {
				// OVERRIDE ME!
			}			

			this.createGradient = function(ctx, element) {
				var g = this.getGradient(ctx, element);
				for (var i=0; i<this.stops.length; i++) {
					g.addColorStop(this.stops[i].offset, this.stops[i].color);
				}
				return g;				
			}
		}
		svg.Element.GradientBase.prototype = new svg.Element.ElementBase;
		
		// linear gradient element
		svg.Element.linearGradient = function(node) {
			this.base = svg.Element.GradientBase;
			this.base(node);
			
			this.getGradient = function(ctx, element) {
				var bb = element.getBoundingBox();
				
				var x1 = (this.gradientUnits == 'objectBoundingBox' 
					? bb.x() + bb.width() * this.attribute('x1').numValue() 
					: this.attribute('x1').Length.toPixels('x'));
				var y1 = (this.gradientUnits == 'objectBoundingBox' 
					? bb.y() + bb.height() * this.attribute('y1').numValue()
					: this.attribute('y1').Length.toPixels('y'));
				var x2 = (this.gradientUnits == 'objectBoundingBox' 
					? bb.x() + bb.width() * this.attribute('x2').numValue()
					: this.attribute('x2').Length.toPixels('x'));
				var y2 = (this.gradientUnits == 'objectBoundingBox' 
					? bb.y() + bb.height() * this.attribute('y2').numValue()
					: this.attribute('y2').Length.toPixels('y'));
				
				return ctx.createLinearGradient(x1, y1, x2, y2);
			}
		}
		svg.Element.linearGradient.prototype = new svg.Element.GradientBase;
		
		// radial gradient element
		svg.Element.radialGradient = function(node) {
			this.base = svg.Element.GradientBase;
			this.base(node);
			
			this.getGradient = function(ctx, element) {
				var bb = element.getBoundingBox();
				
				var cx = (this.gradientUnits == 'objectBoundingBox' 
					? bb.x() + bb.width() * this.attribute('cx').numValue() 
					: this.attribute('cx').Length.toPixels('x'));
				var cy = (this.gradientUnits == 'objectBoundingBox' 
					? bb.y() + bb.height() * this.attribute('cy').numValue() 
					: this.attribute('cy').Length.toPixels('y'));
				
				var fx = cx;
				var fy = cy;
				if (this.attribute('fx').hasValue()) {
					fx = (this.gradientUnits == 'objectBoundingBox' 
					? bb.x() + bb.width() * this.attribute('fx').numValue() 
					: this.attribute('fx').Length.toPixels('x'));
				}
				if (this.attribute('fy').hasValue()) {
					fy = (this.gradientUnits == 'objectBoundingBox' 
					? bb.y() + bb.height() * this.attribute('fy').numValue() 
					: this.attribute('fy').Length.toPixels('y'));
				}
				
				var r = (this.gradientUnits == 'objectBoundingBox' 
					? (bb.width() + bb.height()) / 2.0 * this.attribute('r').numValue()
					: this.attribute('r').Length.toPixels());
				
				return ctx.createRadialGradient(fx, fy, 0, cx, cy, r);
			}
		}
		svg.Element.radialGradient.prototype = new svg.Element.GradientBase;
		
		// gradient stop element
		svg.Element.stop = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);
			
			this.offset = this.attribute('offset').numValue();
			
			var stopColor = this.style('stop-color');
			if (this.style('stop-opacity').hasValue()) stopColor = stopColor.Color.addOpacity(this.style('stop-opacity').value);
			this.color = stopColor.value;
		}
		svg.Element.stop.prototype = new svg.Element.ElementBase;
		
		// animation base element
		svg.Element.AnimateBase = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);
			
			svg.Animations.push(this);
			
			this.duration = 0.0;
			this.begin = this.attribute('begin').Time.toMilliseconds();
			this.maxDuration = this.begin + this.attribute('dur').Time.toMilliseconds();

			this.calcValue = function() {
				// OVERRIDE ME!
				return '';
			}
			
			this.update = function(delta) {			
				// if we're past the end time
				if (this.duration > this.maxDuration) {
					// loop for indefinitely repeating animations
					if (this.attribute('repeatCount').value == 'indefinite') {
						this.duration = 0.0
					}
					else {
						return false; // no updates made
					}
				}			
				this.duration = this.duration + delta;
			
				// if we're past the begin time
				var updated = false;
				if (this.begin < this.duration) {
					var newValue = this.calcValue(); // tween
					var attributeType = this.attribute('attributeType').value;
					var attributeName = this.attribute('attributeName').value;
					
					if (this.parent != null) {
						if (attributeType == 'CSS') {
							this.parent.style(attributeName, true).value = newValue;
						}
						else { // default or XML
							if (this.attribute('type').hasValue()) {
								// for transform, etc.
								var type = this.attribute('type').value;
								this.parent.attribute(attributeName, true).value = type + '(' + newValue + ')';
							}
							else {
								this.parent.attribute(attributeName, true).value = newValue;
							}
						}
						updated = true;
					}
				}
				
				return updated;
			}
			
			// fraction of duration we've covered
			this.progress = function() {
				return ((this.duration - this.begin) / (this.maxDuration - this.begin));
			}			
		}
		svg.Element.AnimateBase.prototype = new svg.Element.ElementBase;
		
		// animate element
		svg.Element.animate = function(node) {
			this.base = svg.Element.AnimateBase;
			this.base(node);
			
			this.calcValue = function() {
				var from = this.attribute('from').numValue();
				var to = this.attribute('to').numValue();
				
				// tween value linearly
				return from + (to - from) * this.progress(); 
			};
		}
		svg.Element.animate.prototype = new svg.Element.AnimateBase;
			
		// animate color element
		svg.Element.animateColor = function(node) {
			this.base = svg.Element.AnimateBase;
			this.base(node);

			this.calcValue = function() {
				var from = new RGBColor(this.attribute('from').value);
				var to = new RGBColor(this.attribute('to').value);
				
				if (from.ok && to.ok) {
					// tween color linearly
					var r = from.r + (to.r - from.r) * this.progress();
					var g = from.g + (to.g - from.g) * this.progress();
					var b = from.b + (to.b - from.b) * this.progress();
					return 'rgb('+parseInt(r,10)+','+parseInt(g,10)+','+parseInt(b,10)+')';
				}
				return this.attribute('from').value;
			};
		}
		svg.Element.animateColor.prototype = new svg.Element.AnimateBase;
		
		// animate transform element
		svg.Element.animateTransform = function(node) {
			this.base = svg.Element.animate;
			this.base(node);
		}
		svg.Element.animateTransform.prototype = new svg.Element.animate;
		
		// text element
		svg.Element.text = function(node) {
			this.base = svg.Element.RenderedElementBase;
			this.base(node);
			
			if (node != null) {
				// add children
				this.children = [];
				for (var i=0; i<node.childNodes.length; i++) {
					var childNode = node.childNodes[i];
					if (childNode.nodeType == 1) { // capture tspan and tref nodes
						this.addChild(childNode, true);
					}
					else if (childNode.nodeType == 3) { // capture text
						this.addChild(new svg.Element.tspan(childNode), false);
					}
				}
			}
			
			this.baseSetContext = this.setContext;
			this.setContext = function(ctx) {
				this.baseSetContext(ctx);
				if (this.attribute('text-anchor').hasValue()) {
					var textAnchor = this.attribute('text-anchor').value;
					ctx.textAlign = textAnchor == 'middle' ? 'center' : textAnchor;
				}
				if (this.attribute('alignment-baseline').hasValue()) ctx.textBaseline = this.attribute('alignment-baseline').value;
			}
			
			this.renderChildren = function(ctx) {
				var x = this.attribute('x').Length.toPixels('x');
				var y = this.attribute('y').Length.toPixels('y');
				for (var i=0; i<this.children.length; i++) {
					this.children[i].x = x;
					this.children[i].y = y;
					this.children[i].render(ctx);
					x += this.children[i].measureText(ctx);
				}
			}
		}
		svg.Element.text.prototype = new svg.Element.RenderedElementBase;
		
		// text base
		svg.Element.TextElementBase = function(node) {
			this.base = svg.Element.RenderedElementBase;
			this.base(node);
			
			this.renderChildren = function(ctx) {
				ctx.fillText(svg.compressSpaces(this.getText()), this.x, this.y);
			}
			
			this.getText = function() {
				// OVERRIDE ME
			}
			
			this.measureText = function(ctx) {
				return ctx.measureText(svg.compressSpaces(this.getText())).width;
			}
		}
		svg.Element.TextElementBase.prototype = new svg.Element.RenderedElementBase;
		
		// tspan 
		svg.Element.tspan = function(node) {
			this.base = svg.Element.TextElementBase;
			this.base(node);
			
			//								 TEXT			  ELEMENT
			this.text = node.nodeType == 3 ? node.nodeValue : node.childNodes[0].nodeValue;
			this.getText = function() {
				return this.text;
			}
		}
		svg.Element.tspan.prototype = new svg.Element.TextElementBase;
		
		// tref
		svg.Element.tref = function(node) {
			this.base = svg.Element.TextElementBase;
			this.base(node);
			
			this.getText = function() {
				var element = this.attribute('xlink:href').Definition.getDefinition();
				if (element != null) return element.children[0].getText();
			}
		}
		svg.Element.tref.prototype = new svg.Element.TextElementBase;		
		
		// group element
		svg.Element.g = function(node) {
			this.base = svg.Element.RenderedElementBase;
			this.base(node);
		}
		svg.Element.g.prototype = new svg.Element.RenderedElementBase;

		// symbol element
		svg.Element.symbol = function(node) {
			this.base = svg.Element.RenderedElementBase;
			this.base(node);
		}
		svg.Element.symbol.prototype = new svg.Element.RenderedElementBase;		
		
		// a element
		svg.Element.a = function(node) {
			this.base = svg.Element.RenderedElementBase;
			this.base(node);
		}
		svg.Element.a.prototype = new svg.Element.RenderedElementBase;
		
		// style element
		svg.Element.style = function(node) { 
			this.base = svg.Element.ElementBase;
			this.base(node);
			
			var css = node.childNodes[0].nodeValue;
			css = css.replace(/(\/\*([^*]|[\r\n]|(\*+([^*\/]|[\r\n])))*\*+\/)|(\/\/.*)/gm, ''); // remove comments
			css = svg.compressSpaces(css); // replace whitespace
			var cssDefs = css.split('}');
			for (var i=0; i<cssDefs.length; i++) {
				if (svg.trim(cssDefs[i]) != '') {
					var cssDef = cssDefs[i].split('{');
					var cssClasses = cssDef[0].split(',');
					var cssProps = cssDef[1].split(';');
					for (var j=0; j<cssClasses.length; j++) {
						var cssClass = svg.trim(cssClasses[j]);
						if (cssClass != '') {
							var props = {};
							for (var k=0; k<cssProps.length; k++) {
								var prop = cssProps[k].split(':');
								var name = prop[0];
								var value = prop[1];
								if (name != null && value != null) {
									props[svg.trim(prop[0])] = new svg.Property(svg.trim(prop[0]), svg.trim(prop[1]));
								}
							}
							svg.Styles[cssClass] = props;
						}
					}

				}
			}
		}
		svg.Element.style.prototype = new svg.Element.ElementBase;
		
		// use element 
		svg.Element.use = function(node) {
			this.base = svg.Element.RenderedElementBase;
			this.base(node);
			
			this.baseSetContext = this.setContext;
			this.setContext = function(ctx) {
				this.baseSetContext(ctx);
				if (this.attribute('x').hasValue()) ctx.translate(this.attribute('x').Length.toPixels('x'), 0);
				if (this.attribute('y').hasValue()) ctx.translate(0, this.attribute('y').Length.toPixels('y'));
			}
			
			this.renderChildren = function(ctx) {
				var element = this.attribute('xlink:href').Definition.getDefinition();
				if (element != null) element.render(ctx);
			}
		}
		svg.Element.use.prototype = new svg.Element.RenderedElementBase;
		
		// clip element
		svg.Element.clipPath = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);
			
			this.apply = function(ctx) {
				for (var i=0; i<this.children.length; i++) {
					if (this.children[i].path) {
						this.children[i].path(ctx);
						ctx.clip();
					}
				}
			}
		}
		svg.Element.clipPath.prototype = new svg.Element.ElementBase;

		// title element, do nothing
		svg.Element.title = function(node) {
		}
		svg.Element.title.prototype = new svg.Element.ElementBase;

		// desc element, do nothing
		svg.Element.desc = function(node) {
		}
		svg.Element.desc.prototype = new svg.Element.ElementBase;		
		
		svg.Element.MISSING = function(node) {
			console.log('ERROR: Element \'' + node.nodeName + '\' not yet implemented.');
		}
		svg.Element.MISSING.prototype = new svg.Element.ElementBase;
		
		// element factory
		svg.CreateElement = function(node) {
			var className = 'svg.Element.' + node.nodeName.replace(/^[^:]+:/,'');
			if (!eval(className)) className = 'svg.Element.MISSING';
		
			var e = eval('new ' + className + '(node)');
			e.type = node.nodeName;
			return e;
		}
				
		// load from url
		svg.load = function(ctx, url) {
			svg.loadXml(ctx, svg.ajax(url));
		}
		
		// load from xml
		svg.loadXml = function(ctx, xml) {
			svg.init(ctx);
		
			var dom = svg.parseXml(xml);
			var e = svg.CreateElement(dom.documentElement);
			
			// set canvas size
			if (e.attribute('width').hasValue()) {
				ctx.canvas.width = e.attribute('width').Length.toPixels(ctx.canvas.parentNode.clientWidth);
			}
			if (e.attribute('height').hasValue()) {
				ctx.canvas.height = e.attribute('height').Length.toPixels(ctx.canvas.parentNode.clientHeight);
			}
			svg.ViewPort.SetCurrent(ctx.canvas.clientWidth, ctx.canvas.clientHeight);
			
			// render loop
			ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
			e.render(ctx);
			svg.intervalID = setInterval(function() { 
				// update animations
				var needUpdate = false;
				for (var i=0; i<svg.Animations.length; i++) {
					needUpdate = needUpdate | svg.Animations[i].update(1000 / svg.FRAMERATE);
				}
			
				// render if needed
				if (needUpdate) {
					ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
					e.render(ctx);
				}
			}, 1000 / svg.FRAMERATE);
		}
		
		svg.stop = function() {
			if (svg.intervalID) {
				clearInterval(svg.intervalID);
			}
		}
		
		return svg;
	}
})();
