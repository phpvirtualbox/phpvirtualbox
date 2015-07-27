/**
 * @fileOverview Misc jQuery plugins maintained by the phpVirtualBox project for 
 *    the phpVirtualBox project. These are either solely authored by
 *    the project or so heavily modified that they can no longer be
 *    separately maintained
 * @author Ian Moore (imoore76 at yahoo dot com)
 * @version $Id: jquery.projectPlugins.js 595 2015-04-17 09:50:36Z imoore76 $
 * @copyright Copyright (C) 2010-2015 Ian Moore (imoore76 at yahoo dot com)
 * 
 */

/**
 * Override _title method of dialog to accept HTML
 * 
 * http://stackoverflow.com/questions/14488774/using-html-in-a-dialogs-title-in-jquery-ui-1-10
 */
$.widget("ui.dialog", $.extend({}, $.ui.dialog.prototype, {
    _title: function(title) {
    	title.html(this.options.title ? this.options.title : "&#160;");
    }
}));
/**
 * Adds deprecated enable/disableSelection to jquery.
 * 
 * Taken from jQuery source.
 * 
 */
$.support.selectstart = "onselectstart" in document.createElement( "div" );

$.fn.extend({
	disableSelection: function() {
		return this.on( ( $.support.selectstart ? "selectstart" : "mousedown" ) +
		".ui-disableSelection", function( event ) {
				event.preventDefault();
		});
	},

	enableSelection: function() {
		return this.off( ".ui-disableSelection" );
	}
});

/**
 * 
 * Add hover and hoverClass functionality to jquery
 * 
 */

(function($) {


	/* Mimic jquery hover function deprecated in jquery 1.9 */
	$.fn.hover = function(onenter, onleave) {
		
		this.each(function() {
			$(this).on("mouseenter", onenter).on("mouseleave", onleave);
		});
		
		return $(this);
		
	}

	/* Add / remove class onmouseenter/leave */
	$.fn.hoverClass = function(hclass) {
		
		this.each(function() {
			$(this).on("mouseenter",function(){
				$(this).addClass(hclass);
			}).on("mouseleave", function(){
				$(this).removeClass(hclass);
			});
		});
		
		return $(this);
		
	}

})(jQuery);



/**
 * Restore jQuery.browser functionality. Taken from:
 * 
 * https://github.com/jquery/jquery-migrate/blob/master/src/core.js
 * 
 */
jQuery.uaMatch = function( ua ) {
	
	ua = ua.toLowerCase();
	
	var match = /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
	/(webkit)[ \/]([\w.]+)/.exec( ua ) ||
	/(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
	/(msie) ([\w.]+)/.exec( ua ) ||
	ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
	[];
	
	return {
		browser: match[ 1 ] || "",
		version: match[ 2 ] || "0"
	};
};

// Don't clobber any existing jQuery.browser in case it's different
if ( !jQuery.browser ) {
	matched = jQuery.uaMatch( navigator.userAgent );
	browser = {};
	
	if ( matched.browser ) {
		browser[ matched.browser ] = true;
		browser.version = matched.version;
	}

	// Chrome is Webkit, but Webkit is also Safari.
	if ( browser.chrome ) {
		browser.webkit = true;
	} else if ( browser.webkit ) {
		browser.safari = true;
	}

	jQuery.browser = browser;
}


/**
 * Modified version of http://archive.plugins.jquery.com/project/TextFill
 */
;(function($) {
    $.fn.textFill = function(options) {
        
    	var maxFontSize = options.maxFontPixels;
    	var maxHeight = parseInt(options.height);
    	var maxWidth = parseInt(options.width);
        
    	var ourText = $(this);
        
        var fontSize = parseInt(ourText.css('font-size'));   
        var fontSizeOrig = fontSize;
        var textHeight = $(ourText).outerHeight(true);
        var textWidth = $(ourText).outerWidth(true);
        
        do {
        	ourText.css('font-size', fontSize++);
        	textHeight = $(ourText).outerHeight(true);
        	textWidth = $(ourText).outerWidth(true);
        	
        } while(textHeight <= maxHeight && textWidth <= maxWidth && fontSize <= maxFontSize);

        fontSize--;
        return ourText.css({'font-size':(fontSize)+'px','top':(fontSize > fontSizeOrig ? '-1' : '0') + 'px'});
    };
})(jQuery);



/**
 * 
 * phpVirtualBox tree view for snapshots
 * 
 */

(function($) {


	$.fn.vbtree = function(options, toplevel) {
		
		if(!toplevel)
			var toplevel = this;
	
		this.each(function() {
	       
			$(this).addClass('vboxTreeView').children('li').each(function(i,li){
			
				// Change class
				/////////////////////
				var children = $(li).children('ul').length;
				var last = !$(this).next().is('li');
				var classadd = null;
				
				// Children and last
				if(children && !last) {
					classadd = 'collapsable';
				// Children but no last
				} else if(children && last) {
					classadd = 'lastCollapsable';
				} else if(!children && last) {
					classadd = 'last';
				}
				$(li).addClass(classadd);
				
				// Insert hitarea
				var d = document.createElement('div');
				$(d).addClass('hitarea').addClass((classadd ? classadd + '-hitarea' : '')).click(function(){
					
					if(!$(this).data('toggleClicked')) {
						
						$(this).data('toggleClicked', true);
	
						if($(this).hasClass('last-hitarea')) return;
						if($(this).hasClass('lastCollapsable-hitarea'))
							$(this).addClass('lastExpandable-hitarea').removeClass('lastCollapsable-hitarea').parent().parent().children('ul').css({'display':'none'});
						else
							$(this).addClass('expandable-hitarea').removeClass('collapsable-hitarea').parent().parent().children('ul').css({'display':'none'});
						
					} else {
						
						$(this).data('toggleClicked', false);
						
						if($(this).hasClass('last-hitarea')) return;				
						if($(this).hasClass('lastExpandable-hitarea'))
							$(this).addClass('lastCollapsable-hitarea').removeClass('lastExpandable-hitarea').parent().parent().children('ul').css({'display':''});
						else
							$(this).addClass('collapsable-hitarea').removeClass('expandable-hitarea').parent().parent().children('ul').css({'display':''});				
					}
					
					return false;
				});
				
				$(li).children('div').first().prepend(d);
										
				// Tree each UL under li one
				$(li).children('ul').vbtree({},toplevel);
							
				
			});
	    
		});
 
	return this;
 
	};
 
})(jQuery);

/**
 * 
 * phpVirtualBox medium (disk / CD image etc.) select box
 * 
 * Copyright (C) 2010-2015 Ian Moore (imoore76 at yahoo dot com)
 * 
 */

(function($) {

	$.fn.mediumselect = function(options) {
		
		/* Public access to select medium */
		if(options.selectMedium) {
			$('#'+$(this).attr('id')+'-mediumselect-'+options.selectMedium).click();
			return;
		}
		
		/* Defaults */
		if(!options.type) options.type = 'HardDisk';
		if(!options.media) options.media = [];
		
		/* Internal Select Medium */
		function _selectmedium(d,sel) {
						
			if($(d).hasClass('vboxMediumReadOnly')) {
				$(sel).addClass('vboxMediumSelectReadOnly').addClass('vboxMediumReadOnly');
			} else {
				$(sel).removeClass('vboxMediumSelectReadOnly').removeClass('vboxMediumReadOnly');
			}
			
			// Set text
			$(sel).html(($(d).data('label') ? $(d).data('label') : ''));
			
			// Hide list
			$('#'+$(sel).attr('id')+'-list').hide();
			
			// Set hidden select box value and
			// trigger change
			var old = $('#'+$(sel).data('origId'));
			$(old).val($(d).data('id'));
			$(old).trigger('change',old);


		}
		
		

		/* Generate and return list item */
		function listItem(m,sel,old,children) {
			
			var li = document.createElement('li');
			
			
			var d = document.createElement('div');
			d.setAttribute('id',$(sel).attr('id')+'-'+m.attachedId);
			
			var opt = $(old).children('option[value='+m.attachedId+']');
			
			if($(opt).hasClass('vboxMediumReadOnly')) {
				$(d).addClass('vboxMediumReadOnly');
				$(li).addClass('vboxMediumReadOnly');
			}
			
			if($(opt).attr('title')) {
				$(d).attr('title',$(opt).attr('title'));
				$(d).tipped({'source':'title'});
			}
			
			$(d).addClass('vboxMediumSelectDiv').on("mouseenter",function(){$(this).addClass('vboxMediumSelectHover');}).on("mouseleave",function(){$(this).removeClass('vboxMediumSelectHover');});			
			$(d).html(m.label);
			$(d).data('label',m.label);
			$(d).data('id',m.attachedId);
			
			$(d).click(function(){_selectmedium(this,sel);});
			
			$(li).append(d);

			// Traverse children
			if(children && m.children && m.children.length) {
				var ul = document.createElement('ul');
				for(var c = 0; c < m.children.length; c++) {
					$(ul).append(listItem(m.children[c],sel,old,true));
				}
				$(li).append(ul);	
			}
			
			return li;	
		}
		
		/* Show list */
		function showList(sel) {
			
			var list = $('#'+$(sel).attr('id')+'-list');
			var sTop = $(sel).offset().top + $(sel).outerHeight();
			var sLeft = $(sel).offset().left;
			var sWidth = $(sel).outerWidth() + $(sel).closest('table').find('.vboxMediumSelectImg').outerWidth();
						
			// Hide menu when clicking anywhere else
			$(document).one('click',function(){$(list).hide();});
			
			$(list).css({'left':sLeft+'px','top':sTop+'px','min-width':sWidth}).show();
			
			return false;

		}
		
		/* 
		 * Main
		 */
		this.each(function() {
			
			// Generate select box replacement
			if(!$('#'+$(this).attr('id')+'-mediumselect').attr('id')) {
				
				var sel = document.createElement('div');
				$(sel).data('origId', $(this).attr('id'));
				$(sel).attr('id',$(this).attr('id')+'-mediumselect');
				$(sel).attr('class','vboxMediumSelect');
				$(sel).on('click',function(){
					if($('#'+$(this).data('origId')+'-table').hasClass('vboxDisabled')) return;
					return showList(this);
				});

				$(this).hide();
				
				var img = document.createElement('div');
				img.setAttribute('id',$(this).attr('id')+'-mediumselectimg');
				img.setAttribute('class','vboxMediumSelectImg');
				$(img).click(function(e){
					$(e.target).closest('table').find('div.vboxMediumSelect').trigger('click');
					return false;
				});
				
				var tbl = document.createElement('table');
				$(tbl).attr('id',$(this).attr('id')+'-table');
				$(tbl).attr('class','vboxMediumSelect');
				$(tbl).css({'padding':'0px','margin':'0px','border':'0px','width':'100%','border-spacing':'0px'});
				var tr = document.createElement('tr');
				var td = document.createElement('td');
				$(td).attr({'class':'vboxMediumSelectTableLeft'}).css({'padding':'0px','margin':'0px','width':'100%'});
				$(td).append(sel);
				$(tr).append(td);
				var td = document.createElement('td');
				$(td).attr({'class':'vboxMediumSelectTableRight'}).css({'padding':'0px','margin':'0px','width':'auto'});
				$(td).append(img);
				$(tr).append(td);
				$(tbl).append(tr);
				
				// Handle enabled / disabled
				$(tbl).on('enable',function(){
					$(this).removeClass('vboxDisabled');
				}).on('disable',function(){
					$(this).addClass('vboxDisabled');
				});
				
				$(this).before(tbl);
				
				
				var list = document.createElement('ul');
				$(list).attr('id',$(this).attr('id')+'-mediumselect-list');
				$(list).attr('class', 'vboxMediumSelect');
				$(list).css({'display':'none'});
				
				$('#vboxPane').append(list);
			}

			// Hide list if it exists
			$('#'+$(this).attr('id')+'-mediumselect-list').hide();
					
			$('#'+$(this).attr('id')+'-mediumselectimg').css({'background-image':'url(images/downArrow.png)'});
			
			// Compile list
			var list = $('#'+$(this).attr('id')+'-mediumselect-list');
			$(list).children().remove();
			
			var sel = $('#'+$(this).attr('id')+'-mediumselect');
			var old = this;
			
			for(var i = 0; i < options.media.length; i++) {
				if(options.media[i].base && options.media[i].id != options.media[i].base) continue;
				$(list).append(listItem(options.media[i],sel,old,options.showdiff));
			}

			// Set initial text and styles
			var oldopt = $(this).children('option:eq('+Math.max($(this).prop('selectedIndex'),0)+')');
			
			if(!$(oldopt).val()) {
				_selectmedium($(list).find('div').first(), sel, old);
			} else {
				_selectmedium($('#'+$(sel).attr('id')+'-'+$(oldopt).val()), sel, old);
			}
		}); // </ .each() >
	 
		return this;
 
	}; // </mediumselect()>
	
})(jQuery);


//jQuery File Tree Plugin
//
// Version 1.01
//
// Cory S.N. LaViska
// A Beautiful Site (http://abeautifulsite.net/)
// 24 March 2008
//
// Visit http://abeautifulsite.net/notebook.php?article=58 for more information
//
// Usage: $('.fileTreeDemo').fileTree( options, callback )
//
// Options:  root           - root folder to display; default = /
//           script         - location of the serverside AJAX file to use; default = jqueryFileTree.php
//           folderEvent    - event to trigger expand/collapse; default = click
//           expandSpeed    - default = 500 (ms); use -1 for no animation
//           collapseSpeed  - default = 500 (ms); use -1 for no animation
//           expandEasing   - easing function to use on expand (optional)
//           collapseEasing - easing function to use on collapse (optional)
//           multiFolder    - whether or not to limit the browser to one subfolder at a time
//           loadMessage    - Message to display while initial tree loads (can be HTML)
//
// History:
//
// 1.01 - updated to work with foreign characters in directory/file names (12 April 2008)
// 1.00 - released (24 March 2008)
//
// TERMS OF USE
// 
// This plugin is dual-licensed under the GNU General Public License and the MIT License and
// is copyright 2008 A Beautiful Site, LLC. 
//
// 2010-05-12 - Modified by Ian Moore for phpVirtualBox
//
//
if(jQuery) (function($){
	
	$.extend($.fn, {
		fileTree: function(o, h) {
			// Defaults
			if( !o ) var o = {};
			if( o.root == undefined ) o.root = '/';
			if( o.script == undefined ) o.script = vboxEndpointConfig.filebrowser;
			if( o.expandSpeed == undefined ) o.expandSpeed= 500;
			if( o.collapseSpeed == undefined ) o.collapseSpeed= 500;
			if( o.expandEasing == undefined ) o.expandEasing = null;
			if( o.collapseEasing == undefined ) o.collapseEasing = null;
			if( o.multiFolder == undefined ) o.multiFolder = true;
			if( o.loadMessage == undefined ) o.loadMessage = trans('Loading ...','UIVMDesktop');
			if( o.scrollTo == undefined ) o.scrollTo = null;
			if( o.dirsOnly == undefined) o.dirsOnly = false;
			
			var top = this;
			
			$(this).each( function() {
				
				function showTree(c, t, fullpath) {
				    
				    // If a UL is not the target, find or create it
				    if($(c).prop('tagName') != 'UL') {
				        var target = $(c).children('UL').first();
				        if(target.length) {
				            c = $(target);
				        } else {
				            var rootList = $('<ul />').addClass("jqueryFileTree");
				            $(c).append(rootList);
				            c = rootList;				            
				        }
				    }
				    
				    // If data is already loaded, just show it
				    if($(c).children().length) {
				        $(c).slideDown({ duration: o.expandSpeed, easing: o.expandEasing });
				        return;
				    }
				    
				    $(c).append($('<li />').addClass("wait").text(o.loadMessage));
				    
					$.post(o.script, JSON.stringify({ 'dir': t, 'dirsOnly' : (o.dirsOnly ? true : false), 'fullpath' : (fullpath ? true : false)}), function(data) {

					    $(c).children('.wait').remove();
						$(c).append(toHTML(data));
						
						if(o.scrollTo) {
							var sto = $(o.scrollTo).find('a.vboxListItemSelected').first();
							if(sto.length) {
								$(o.scrollTo).scrollTo($(sto),{'axis':'y','offset':{'top':-15}});
							}
						}
						bindTree(c);
						
					}, "json");
				}
				
				function folderElement(data) {
				    return $('<li/>').addClass("folder")
				        .addClass(data.expanded ? 'expanded' : 'collapsed')
				        .addClass('vboxListItem')
				        .addClass(data.selected ? 'vboxListItemSelected' : '')
				        .append(
				                $('<a/>').attr({'href':'#','name':data.path,'rel':data.path}).text(data.name)
				        );
				}
				
				function fileElement(data) {
				    return $('<li/>').addClass('file file_' + data.ext +' vboxListItem')
				        .append(
				                $('<a/>').attr({'href':'#','name':data.path,'rel':data.path}).text(data.name)
				         );
				}
				function toHTML(data) {
				
				    data.sort(function(a,b){
				        if(a.type == b.type)
				            return strnatcasecmp(a.path, b.path);
				        
				        return a.type == 'folder' ? 1 : -1
				    });
				    
				    var elms = [];
				    for(var i = 0; i < data.length; i++) {
				        
				        // Folder
				        if(data[i].type == 'folder') {
				            var direlm = folderElement(data[i]);
				            if(data[i].expanded) {
				                var listelm = $('<ul/>').addClass('jqueryFileTree');
				                var children = toHTML(data[i].children);
				                for(var a = 0; a < children.length; a++) {
				                    $(listelm).append(children[a]);				                    
				                }
				                $(direlm).append(listelm);
				            }
				            elms.push(direlm);
				            
				            				            
				        // File
				        } else {
				            elms.push(fileElement(data[i]));
				        }
				    }
				    return elms;
				}
				
				function bindTree(t) {
				    // Expand / collapse
					$(t).find('LI A').on('dblclick', function(e) {
						e.preventDefault();
						// Folder
						if( $(this).parent().hasClass('folder') ) {
						    
						    // Is collapsed. Expand
							if( $(this).parent().hasClass('collapsed') ) {
								// Expand
								if( !o.multiFolder ) {
									$(top).find('UL').slideUp({ duration: o.collapseSpeed, easing: o.collapseEasing })
									$(top).find('LI.folder').removeClass('expanded').addClass('collapsed');
								}
								$(this).parent().removeClass('collapsed').addClass('expanded');
							    showTree( $(this).parent(), $(this).attr('name') );			
							    
							// Is expanded. Collapse
							} else {
								// Collapse
								$(this).parent().removeClass('expanded').addClass('collapsed')
								    .children('UL').slideUp({ duration: o.collapseSpeed, easing: o.collapseEasing });
							}
						} else {
							h($(this).attr('name'));
						}
						return false;
						
					}).on('click', function() {
						$(top).find('.vboxListItemSelected').removeClass('vboxListItemSelected');
						$(this).addClass('vboxListItemSelected');
						return false;
					});
				}
				// Loading message
				var rootList = $('<ul />').addClass("jqueryFileTree");
				$(this).empty().append(rootList);
				// Get the initial file list
				showTree( rootList, o.root, true);
			});
			
			return this;
		}
	});
	
})(jQuery);


/* jQuery Context Menu Plugin

Version 1.01

Cory S.N. LaViska
A Beautiful Site (http://abeautifulsite.net/)

More info: http://abeautifulsite.net/2008/09/jquery-context-menu-plugin/

//
// Terms of Use
//
// This plugin is dual-licensed under the GNU General Public License
//   and the MIT License and is copyright A Beautiful Site, LLC.
//

This jQuery plugin now hardly resembles the original.
--Ian Moore


*/
if(jQuery)( function() {
	
	$.extend($.fn, {
		
		contextMenu: function(o, callback) {
			// Defaults
			if( o.menu == undefined ) return false;
			if( o.inSpeed == undefined ) o.inSpeed = 150;
			if( o.outSpeed == undefined ) o.outSpeed = 75;
			// 0 needs to be -1 for expected results (no fade)
			if( o.inSpeed == 0 ) o.inSpeed = -1;
			if( o.outSpeed == 0 ) o.outSpeed = -1;
			if( o.button == undefined) o.button = 2;
			if( o.clickthrough == undefined) o.clickthrough = false;
			
			// Loop each context menu
			$(this).each( function() {
				
				var el = $(this);								
				var menu = $('#'+o.menu);
								
				// Simulate a true click
				$(this).mousedown( function(e) {
					
					if( $(el).hasClass('disabled') ) return true;
					
					if(!( e.button == o.button || (o.button == 0 && e.button == 1 && $.browser.msie))) return;
					if(o.clickthrough) $(el).trigger('click');
					var evt = e;
					evt.stopPropagation();
					
					$(this).mouseup( function(e) {
						
						if( $(this).hasClass('disabled') ) return true;

						e.stopPropagation();
						
						var srcElement = $(this);
						$(this).off('mouseup');
						
						
						if( evt.button == o.button || (o.button == 0 && evt.button == 1 && $.browser.msie)) {
						
							// Menu setup function
							if(o.menusetup) {
								o.menusetup(el);
							}
							// Hide context menus that may be showing
							$("ul.contextMenu").hide();
							
							showMenu(srcElement, menu, o.mode, e);
																					
							$(document).one('mouseup', function() {
								$(menu).fadeOut(o.outSpeed);
								$("ul.contextMenu").hide();
							});
						}
					});
				});

				/*
				 * Initialize menu items
				 * 
				 */
				var menuItems = function(menu, srcElement, level) {
					
					// When items are selected
					$(menu).addClass('contextMenu').data({'level':level}).disableSelection().children('li').off('mouseup').on('mouseup', function(e) {
						
						if($(this).hasClass('disabled')) {
							return;							
						} 
						
						$("ul.contextMenu").hide();
						
						// Callback
						if( callback ) {
							var aElm = $(this).children('a');
							if($(aElm)[0]) {
								callback( aElm.attr('href').substr(1), $(srcElement), null, aElm);
							} else {
								$(this).children('.vboxMenuAcceptClick').click();
							}
						}
						

					}).on("mouseenter", function(e, li) {
						
						$('#vboxPane').trigger('contextMenuShowLevel',
								{'level':$(this).parent().data('level'), 'id':$(this).parent().attr('id')}
						);

						$(menu).find('LI.vboxHover').removeClass('vboxHover');
						if($(this).hasClass('disabled')) return;
							
						$(this).addClass('vboxHover');
						
						var subMenuId = $(this).data('subId');
						if(subMenuId) showMenu($(this),$('#'+subMenuId),'submenu',e);
						
					}).on("mouseleave",function() {
						
						$(menu).find('LI.vboxHover').removeClass('vboxHover');
						
					}).children('a').off('click').on('click',function(e){
						e.preventDefault();
						return false;
					});
					
					// Sub menu initialization
					$(menu).children('li').children('ul').each(function() {
						
						var plink = $(this).siblings('a').first();
						var subId = $(this).attr('id');
						if(!subId) {
							var href = plink.attr('href').replace('#','');
							subId = href + '-Submenu';
							$(this).attr('id', subId);
						}
						$(this).addClass('contextMenu contextSubMenu').data({'level':level+1}).parent().addClass('contextMenuParent').data({'subId':subId,'level':level});
						var html = plink.html();
						plink.html('<table class="vboxInvisible" style="width:100%"><tr><td style="text-align:left">'+html+'</td><td style="text-align:right; width: 22px;"><img src="images/rightArrow.png" /></td></tr></table>');
						
						// Hide menus trigger
						var smenu = this;
						$('#vboxPane').on('contextMenuShowLevel',function(e,c){
							if($(smenu).data('level') >= c.level && $(smenu).attr('id') != c.id)
								$(smenu).hide();
						});
						
						// Reloop through setup
						menuItems($(this), srcElement, ++level);
						
						$(this).detach().appendTo($('#vboxPane'));
						

					});
					
					
				};

				
				/*
				 * 
				 * Activate menu items
				 * 
				 */
				
				var showMenu = function(srcElement, menu, mode, e) {
					
					// Check menu
					if(!$(menu)[0]) {
						return;
					}
					
					// Hide all other menus at this level
					$('#vboxPane').trigger('contextMenuShowLevel', {'level':$(menu).data('level'), 'id':$(menu).attr('id')});
					
					// Detect mouse position
					var d = {};
					
					var x = null;
					var y = null;
					
					if(mode == 'menu') {
				 		x = $(srcElement).offset().left;
			 			y = $(srcElement).offset().top + $(srcElement).outerHeight();		
					} else if(mode == 'submenu') {
						y = $(srcElement).offset().top;									
				 		x = $(srcElement).offset().left + $(srcElement).outerWidth();
					} else {
						
						if( self.innerHeight ) {
							d.pageYOffset = self.pageYOffset;
							d.pageXOffset = self.pageXOffset;
							d.innerHeight = self.innerHeight;
							d.innerWidth = self.innerWidth;
						} else if( document.documentElement &&
							document.documentElement.clientHeight ) {
							d.pageYOffset = document.documentElement.scrollTop;
							d.pageXOffset = document.documentElement.scrollLeft;
							d.innerHeight = document.documentElement.clientHeight;
							d.innerWidth = document.documentElement.clientWidth;
						} else if( document.body ) {
							d.pageYOffset = document.body.scrollTop;
							d.pageXOffset = document.body.scrollLeft;
							d.innerHeight = document.body.clientHeight;
							d.innerWidth = document.body.clientWidth;
						}

						$(menu).css({'left':0,'top':0});

						(e.pageX) ? x = e.pageX : x = e.clientX + d.scrollLeft;
						(e.pageY) ? y = e.pageY : y = e.clientY + d.scrollTop;
						
					
					}
					
					// shift left if submenu
					if($(menu).data('level')) x-=3;
					
					//adjust to ensure menu is inside viewable screen
					var right = x + $(menu).outerWidth();
					var bottom = y + $(menu).outerHeight();
					
					var windowWidth = $(window).width() + $(window).scrollLeft()-5;
					var windowHeight = $(window).height() + $(window).scrollTop()-5;
					
					x = (right > windowWidth) ? x - (right - windowWidth) : x;
					y = (bottom > windowHeight) ? y - (bottom - windowHeight) : y;

					
					$(menu).one('menuLoaded',function(){
						menuItems(menu, srcElement);
					});
					
					// Check for callback if nothing is present
					if($(menu).children().length == 0 && $(menu).data('callback')) {
						
						
						var m = window[$(menu).data('callback')](menu);
						
						// New menu returned?
						if(m) {
							$(m).addClass('contextSubMenu contextMenuLevel' + ($(menu).data('level')+1)).data('level',($(menu).data('level')+1));
							// Hide menus trigger
							$('#vboxPane').on('contextMenuShowLevel',function(e,c){
								if($(m).data('level') >= c.level && $(m).attr('id') != c.id) $(m).hide();
							});
					
							menuItems(m, srcElement, $(menu).data('level')+1);
							
							showMenu(srcElement, m, 'submenu', e);
							
							return;
						}
					} else {
						menuItems(menu, srcElement, $(menu).data('level'));
					}
					
					// Menu  show
					$(menu).css({ top: y, left: x}).show();//.fadeIn(o.inSpeed);
					
					
				};
				
				// Setup menu 
				menuItems(menu, el, 0);
				
				
				// Disable browser context menu (requires both selectors to work in IE/Safari + FF/Chrome)
				$(el).add($('UL.contextMenu')).on('contextmenu', function() { return false; });
				
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
						$(this).find('A[href="' + d[i] + '"]').closest('li').addClass('disabled');
						
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
						$(this).find('A[href="' + d[i] + '"]').closest('li').removeClass('disabled');
						
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
				$(this).off('mousedown').off('mouseup');
			});
			return( $(this) );
		}
		
	});
})(jQuery);
