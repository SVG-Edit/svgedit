// jQuery Context Menu Plugin
//
// Version 1.01
//
// Cory S.N. LaViska
// A Beautiful Site (http://abeautifulsite.net/)
// Modified by Alexis Deveria
//
// More info: http://abeautifulsite.net/2008/09/jquery-context-menu-plugin/
//
// Terms of Use
//
// This plugin is dual-licensed under the GNU General Public License
//   and the MIT License and is copyright A Beautiful Site, LLC.
//
if(jQuery)( function() {
	var win = $(window);
	var doc = $(document);

	$.extend($.fn, {
		
		contextMenu: function(o, callback) {
			// Defaults
			if( o.menu == undefined ) return false;
			if( o.inSpeed == undefined ) o.inSpeed = 150;
			if( o.outSpeed == undefined ) o.outSpeed = 75;
			// 0 needs to be -1 for expected results (no fade)
			if( o.inSpeed == 0 ) o.inSpeed = -1;
			if( o.outSpeed == 0 ) o.outSpeed = -1;
			// Loop each context menu
			$(this).each( function() {
				var el = $(this);
				var offset = $(el).offset();
			
				var menu = $('#' + o.menu);

				// Add contextMenu class
				menu.addClass('contextMenu');
				// Simulate a true right click
				$(this).bind( "mousedown", function(e) {
					var evt = e;
					$(this).mouseup( function(e) {
						var srcElement = $(this);
						srcElement.unbind('mouseup');
						if( evt.button === 2 || o.allowLeft || (evt.ctrlKey && svgedit.browser.isMac()) ) {
							e.stopPropagation();
							// Hide context menus that may be showing
							$(".contextMenu").hide();
							// Get this context menu
						
							if( el.hasClass('disabled') ) return false;
							
							// Detect mouse position
							var d = {}, x = e.pageX, y = e.pageY;
							
							var x_off = win.width() - menu.width(), 
								y_off = win.height() - menu.height();

							if(x > x_off - 15) x = x_off-15;
							if(y > y_off - 30) y = y_off-30; // 30 is needed to prevent scrollbars in FF
							
							// Show the menu
							doc.unbind('click');
							menu.css({ top: y, left: x }).fadeIn(o.inSpeed);
							// Hover events
							menu.find('A').mouseover( function() {
								menu.find('LI.hover').removeClass('hover');
								$(this).parent().addClass('hover');
							}).mouseout( function() {
								menu.find('LI.hover').removeClass('hover');
							});
							
							// Keyboard
							doc.keypress( function(e) {
								switch( e.keyCode ) {
									case 38: // up
										if( !menu.find('LI.hover').length ) {
											menu.find('LI:last').addClass('hover');
										} else {
											menu.find('LI.hover').removeClass('hover').prevAll('LI:not(.disabled)').eq(0).addClass('hover');
											if( !menu.find('LI.hover').length ) menu.find('LI:last').addClass('hover');
										}
									break;
									case 40: // down
										if( menu.find('LI.hover').length == 0 ) {
											menu.find('LI:first').addClass('hover');
										} else {
											menu.find('LI.hover').removeClass('hover').nextAll('LI:not(.disabled)').eq(0).addClass('hover');
											if( !menu.find('LI.hover').length ) menu.find('LI:first').addClass('hover');
										}
									break;
									case 13: // enter
										menu.find('LI.hover A').trigger('click');
									break;
									case 27: // esc
										doc.trigger('click');
									break
								}
							});
							
							// When items are selected
							menu.find('A').unbind('mouseup');
							menu.find('LI:not(.disabled) A').mouseup( function() {
								doc.unbind('click').unbind('keypress');
								$(".contextMenu").hide();
								// Callback
								if( callback ) callback( $(this).attr('href').substr(1), $(srcElement), {x: x - offset.left, y: y - offset.top, docX: x, docY: y} );
								return false;
							});
							
							// Hide bindings
							setTimeout( function() { // Delay for Mozilla
								doc.click( function() {
									doc.unbind('click').unbind('keypress');
									menu.fadeOut(o.outSpeed);
									return false;
								});
							}, 0);
						}
					});
				});
				
				// Disable text selection
				if( $.browser.mozilla ) {
					$('#' + o.menu).each( function() { $(this).css({ 'MozUserSelect' : 'none' }); });
				} else if( $.browser.msie ) {
					$('#' + o.menu).each( function() { $(this).bind('selectstart.disableTextSelect', function() { return false; }); });
				} else {
					$('#' + o.menu).each(function() { $(this).bind('mousedown.disableTextSelect', function() { return false; }); });
				}
				// Disable browser context menu (requires both selectors to work in IE/Safari + FF/Chrome)
				$(el).add($('UL.contextMenu')).bind('contextmenu', function() { return false; });
				
			});
			return $(this);
		},
		
		// Disable context menu items on the fly
		disableContextMenuItems: function(o) {
			if( o == undefined ) {
				// Disable all
				$(this).find('LI').addClass('disabled');
				return( $(this) );
			}
			$(this).each( function() {
				if( o != undefined ) {
					var d = o.split(',');
					for( var i = 0; i < d.length; i++ ) {
						$(this).find('A[href="' + d[i] + '"]').parent().addClass('disabled');
						
					}
				}
			});
			return( $(this) );
		},
		
		// Enable context menu items on the fly
		enableContextMenuItems: function(o) {
			if( o == undefined ) {
				// Enable all
				$(this).find('LI.disabled').removeClass('disabled');
				return( $(this) );
			}
			$(this).each( function() {
				if( o != undefined ) {
					var d = o.split(',');
					for( var i = 0; i < d.length; i++ ) {
						$(this).find('A[href="' + d[i] + '"]').parent().removeClass('disabled');
						
					}
				}
			});
			return( $(this) );
		},
		
		// Disable context menu(s)
		disableContextMenu: function() {
			$(this).each( function() {
				$(this).addClass('disabled');
			});
			return( $(this) );
		},
		
		// Enable context menu(s)
		enableContextMenu: function() {
			$(this).each( function() {
				$(this).removeClass('disabled');
			});
			return( $(this) );
		},
		
		// Destroy context menu(s)
		destroyContextMenu: function() {
			// Destroy specified context menus
			$(this).each( function() {
				// Disable action
				$(this).unbind('mousedown').unbind('mouseup');
			});
			return( $(this) );
		}
		
	});
})(jQuery);