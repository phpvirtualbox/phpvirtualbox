/******
 * Tipped: A tooltip plugin for jQuery
 * http://code.google.com/p/tipped/
 *
 * Copyright 2010, University of Alberta
 *
 * Tipped is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * Tipped is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License v2
 * along with Tipped.  If not, see <http://www.gnu.org/licenses/gpl-2.0.html>
 *
 *
 * Compatibility: Tested with jQuery 1.4.2+, though it should work with 1.3.x
 *
 * v2.2b	- Added delay functionality to _display().  That functionality must have been lost
 *				with v2
 * v2.1.1b  - Fixed a typing bug in the tip creation code that resulted in Firefox rendering an extra line.
 * v2.1b	- Fixed a bug which resulted in the last matched element becoming the $target for all custom param functions
 *			- Fixed an typing error in the html code for creation of the element
 *			- Added (or rather completed) functionality of hideDelay option.  If the Tip is now hovered within hideDelay milliseconds
 *				the automatic hiding is cancelled & the tip stays visible until the user hovers out of the tip
 * v2.0b	- Refactored code into a new Tip object that sits in the window space.  Cleaned up code layout & formatting
 *				- Having difficulty properly determining the width of the tip when sizing.  Consequently, tips
 *				  that are wider than the window, will appear a few pixels too wide the first time they are shown after
 *				  another tip is shown.
 * v1.5.4	- Added "hideDelay" option to allow for the tip to persist after the target has been hovered out
 * v1.5.3	- Added logic to move the tip to the left of the trigger if it gets moved overtop of the mouse
 *			  This should stop flickering when the trigger is on the right or bottom of the screen
 * v1.5.2	- Fixed setting of width when tip is as wide as the window
 * v1.5.1	- Fixed implementation of 'position':'mouse' option
 * v1.5		- Fixed bug with 'title' attribute being added back after tip goes away
 *			- Added 'position' and 'posX', 'posY' options
 *			- Added 'delay' option
 * v1.4		- Added logic that resizes tips that are larger than the viewport, to fit inside the viewport
 *			- Added oversizeStick option
 * v1.3.4:  - Made themeroller compatible
 *			- Used removeAttr() to remove title attribute, rather than setting the attribute to blank
 *			- Thanks to Durval Agnelo for the advice/contribution
 * v1.3.3:	- Became a good jQuery citizen and return the jQuery object from tipped() so it supports chaining
 *			- Fixed a bug that emptied out the title stored in data(), if tipped() is called
 *			  on an element twice
 * v1.3.2:	Fixed 'title' based tips that were trying to show the title from the attribute after it was emptied out
 * v1.3.1:	Did some stuff
 * v1.3:	Reposition tooltip at top left before width calculation for repositioning done.  This
 *			prevents inline elements from being squished.
 * v1.2:	Fixed showing/hiding of the "Close" button if there are tips with both "hover" and "click" mode
 * v1.1: 	- Added turning off of default tooltip that appears when an elelment has a title
 *			- #tipped element is now created explicitely as an window variable - fixes a problem with Safari
 * v1.0: 	Initial release
 */
(function($) {
	/******
	/*	Options
		
			ajaxType:	The type of HTTP request to make.
				Possible values: Anything $.ajax accepts (usually 'GET' or 'POST')
				Default: 'POST'
			
			cache:		Whether or not to cache AJAX requests.  Cache is based on URL, not URL + data, so if 
						you are making multiple requests to the same URL with different data, turn off cache
				Default: false
			
			closer:		The HTML to display when a tip is to be manually closed (ie: when triggered by a click).  
						All text in 'closer' will be injected inside another element that has the close listener
				Default: 'Close'
			
			delay:		The milliseconds to wait between when the trigger is hovered over, and the tip appears.
						Ignored if "mode" is "click".
				Default: 0
				
			hideDelay:	The milliseconds to wait between when the trigger is hovered out, and the tip disappears.
				Default: 0
				
			marginX:	The pixels to the right of the element that the tip should appear.  This amount will be
						overridden if necessary to ensure the entire tip shows on the screen.
				Possible values: Any integer.  Negative numbers will position the tip to the left of the right
								 edge of the triggering element
				Default: '10'
				
			marginY:	The pixels to the bottom of the element that the tip should appear.  This amount will be
						overridden if necessary to ensure the entire tip shows on the screen.
				Possible values: Any integer.  Negative numbers will position the tip above of the bottom
								 edge of the triggering element
				Default: '10'
				
			mode:		The type of tip to make.  'Hover' shows and hides on hover, 'Click' is triggered with a
						click and requires clicking of the closer to go away
				Possible values: 'hover', 'click'
				Default: 'hover'
			
			oversizeStick:	Whether to revert to "click" mode if the content is too large for the screen.  If the
							content is too large, scrollbars appear.  Users can't use those scrollbars though, if
							the tooltip disappears when they hover off the target.  This will remedy that problem.
							
							The 'closer' option will be used when necessary.
				Possible values: true,false
				Default: true
				
			params:		An object representing the parameters to send along with an AJAX request as 'data'
				Possible values:
					A callback: Data passed will be the object returned from this function.  Function will be passed
								a jQuery object representing the triggering element
					An object: Will be used as the data
				Default: {}
			
			position:	The method Tipped will use to determine position.
				Possible values:
					'absolute': The position of the tip will be determined by the posX and posY parameters, 
								with no application of the margins and no consideration for where the triggering 
								element is
					'mouse':	The position of the tip will be determined by the location of the mouse when the 
								tip is triggered. Margins will be applied.
					'element':	The position of the tip will be determined by the bottom right corner of the 
								triggering element. Margins will be applied.
				Default: 'element'
			
			posX:	The absolute position on the x-axis the tooltip will have when displayed.  Only used if the 
					'position' option is "absolute"
				Possible values:
					A callback:  Function must return an integer.  Function will be passed a jQuery object 
								 representing the triggering element.
					An integer
				Default value: 0
			
			posY:	The absolute position on the y-axis the tooltip will have when displayed.  Only used if the 
					'position' option is "absolute"
				Possible values:
					A callback:  Function must return an integer.  Function will be passed a jQuery object 
								 representing the triggering element
					An integer
				Default value: 0
			
			source:		The source of the value to display.
				Possible values: 
					'title':	Value to display will be pulled from the 'title' attribute of the triggering element
					A callback: Value to display will be returned from the callback function.  Function will be passed
								a jQuery object representing the triggering element
					'url':		An AJAX request will be made to the address specified by the 'url' option
					Any other string:	Will be displayed
				Default: 'title'
				
			themeroller:	Whether or not to make Themeroller compatible
				Possible values: true, false
				Default: false
				
			throbber:	The URL to the image to display while the AJAX request is being sent.  If blank, no throbber
						will be shown.
				Default: false
				
			url:		The web address to make the AJAX request to.  Unused if 'source' is not 'url'
	*/
	
	//default setting
	var defaults = {
		ajaxType:'POST',
		cache:false,
		cached:{},
		closer:'Close',
		delay:0,
		hideDelay:0,
		marginX:10,
		marginY:10,
		mode:'hover',
		oversizeStick:true,
		params:{},
		position:'element',
		posX:0,
		posY:0,
		source:'title',
		themeroller:false,
		throbber:false,
		url:''
	};
	
	
	
	/**
	 * Tip object
	 */
	window.Tip = {
		
		// shortcut to the #tipped element
		$tip: {},
		
		//shortcut to the #tipped-content
		$content: {},
		
		//timer for storing delay and hideDelay
		timer: undefined,
		
		settings: {},
		
		//shortcut to the triggering element
		$target: {},
		
		//triggering event
		evt: false,
		
		/*
 		 * init()
		 *
		 * Initializes the tooltip - creating DOM elements if necessary
		 * Sets this.$tip and this.$content
		 */
		init:function(){
			if($("#tipped").length == 0)
				this.$tip = $('<div id = "tipped"><div id = "tipped-content"></div><br /><div id = "tipped-closer-wrapper"><span id = "tipped-closer">'+this.settings.closer+'</span></div>').appendTo(document.body).data('showing',false);
			else
				this.$tip = $("#tipped");
			
			this.$content = $("#tipped-content");
		},
		
		/*
		 * setup()
		 *
		 * Configure the Tip object based on the passed settings
		 */
		setup:function($target,settings,evt){			
			this.settings = settings;
			this.$target = $target;
			this.evt = evt;
			this.hide(true);//hide immediately
			this._setupCloser();
			this._setupThemeRollerCompat();
			this._removeTitle();
						
			//cancel any delay
			clearTimeout(this.timer);
		},
	
		/*
		 * show()
		 *
		 * Manages the showing of the tooltip
		 */
		show:function(){			
			if(this.settings.source === 'url')
				this._showURL();
			else if(this.settings.source === 'title')
				this._display(this.$target.data('tipped').title);
			else if(typeof this.settings.source == 'string')
				this._display(this.settings.source);
			else if(typeof this.settings.source == 'function')
				this._display(this.settings.source(this.$target));
			else if(typeof settings.source == 'object')
				this._display(this.settings.source.html());
		},		
	
	
		/*
		 * hide()
		 *
		 * Manages the hiding of the tooltip
		 */
		hide:function(immediate){
			if(arguments.length == 0)
				immediate = false;
				
			if(immediate){
				this.$tip.data('showing',false).data('original','').hide();
				this.$content.html('');
			}
			else{
				this.$tip
					.on('mouseenter',
					/* Stop the delayed hiding if the user has hovered over the tip */								
					function(){ clearTimeout(Tip.timer); })
					.on('mouseleave',
					/* Once the user hovers out of the tip, hide it immediately */
					function(){ Tip.hide(true); });
				
				this.timer = setTimeout(function(){Tip.hide(true);},Tip.settings.hideDelay);
			}
		},
		
		/*
		* _setupCloser
		*
		* Shows or hides the closer
		*/
		_setupCloser:function(force){
			if(arguments.length == 0)
				force = false;
			
			$("#tipped-closer")
				.html(this.settings.closer)
				.on('click', function(){
					Tip.hide(true);
				});
			
			//hide closer if necessary
			if(this.settings.mode != 'click' && !force)
				$("#tipped-closer-wrapper").hide();
			else
				$("#tipped-closer-wrapper").show();
		},
		
		
		/*
		 * _setupThemeRollerCompat()
		 *
		 * Adds the necessary classes for ThemeRoller compatibility
		 */
		_setupThemeRollerCompat:function(){
			if(this.settings.themeroller){
				this.$tip.addClass('ui-helper-hidden ui-widget ui-dialog ui-corner-all');
				$("#tipped-closer")
					.addClass('ui-button ui-state-hover ui-state-default')
					.on('mouseenter', function(){
							$(this).addClass('ui-state-hover');
						})
					.on('mouseleave', function(){
							$(this).removeClass('ui-state-hover');
						}
					)
					.on('mousedown', function(){
						$(this).addClass('ui-state-active');
					})
					.on('mouseup', function(){
						$(this).removeClass('ui-state-active');
					});
			}
			else{
				this.$tip.removeClass('ui-helper-hidden ui-widget ui-dialog ui-corner-all');
				$("#tipped-closer").removeClass('ui-button ui-state-hover ui-state-default');	
			}			
		},
		
		/*
		 * removeTitle()
		 * 
		 * Removes the title attribute from the target, and store that value in data
		 * Title has to be removed regardless of the "source" - in order to quash the
		 * default browser-based tooltip
		 */
		_removeTitle:function(){
			var data = this.$target.data('tipped');			
		
			if(data.title === undefined){
				data.title = this.$target.attr('title');
				this.$target.data('tipped',data);
			}
			
			//IE doesn't respect removal of the attribute, so need to set it to blank.
			this.$target.removeAttr('title').attr('title','');
		},
		
		/*
		 * _showURL
		 *
		 * Retrieves the value to display from a URL
		 */
		_showURL:function(){
			
			var cached = this.$tip.data('cache');
			
			//if we're not caching, retrieve the value
			if(!this.settings.cache || cached === undefined || cached[this.settings.url] === undefined){
				//set parameters
				var data = {};
				if(typeof this.settings.params == 'function')
					data = this.settings.params(this.$target);
				else if(typeof this.settings.params == 'object')
					data = this.settings.params;
				
				// import settings into local space because "this" in $.ajax doesn't refer to window.Tip
				$this = this;
				
				$.ajax({
					data:data,
					type:$this.settings.ajaxType,
					url:$this.settings.url,
					beforeSend:function(){	
						if($this.settings.throbber)
							$this._display('<img src = '+$this.settings.throbber+' alt = "Loading..." />');
					},
					
					error:function(){
						$this._display('Unable to retrieve contents');
					},
					success:function(returned){
						$this._display(returned);
						
						//cache results if necessary
						if($this.settings.cache){
							var newCache = new Object;
							newCache[$this.settings.url] = returned;
							cached = $.extend(cached,newCache);
							$this.$tip.data('cache',cached);
						}
					}
				});
			}
			//otherwise, show the cached copy
			else
				this._display(cached[this.settings.url]);
		},// _displayURL()
		
		/*
		 * _display()
		 *
		 * Manages the displaying of the tooltip
		 */
		_display:function(value,immediate){
			
			immediate = (immediate == undefined) ? false : immediate;
			
			//If we're delaying display, call this function again after some milliseconds
			if(this.settings.delay && !immediate)
			{
				setTimeout('Tip._display("'+value+'",true)',this.settings.delay);
				return;
			}
			
			this.$content.html(value);
			this._setSize();
			this._setPosition();
			this.$tip.data('showing',true).data('original',this.$target).show();
			this._resizeAfterShow();
		},
		
		/*
		 * _setSize()
		 *
		 * Resizes the tooltip if it's taller/wider than the window
		 */
		_setSize:function(){
			//reset height & width settings - may not be needed
			this.$content.css({height:'auto',width:'auto'});
			this.$tip.css({height:'auto',width:'auto'});
			
			/* If tip is taller than window */
			if(this.$tip.outerHeight() > $(window).height()){
				
				if(this.settings.oversizeStick){
					this._setupCloser(true);//force the closer regardless of mode
					this.$target.unbind('mouseout');
				}		
				var tipHeightDifference = this.$tip.outerHeight() - this.$tip.height();
				
				// _setPosition() will ensure a 5px margin around the outside of the window
				// we need to account for that when setting the height
				this.$tip.css('height',$(window).height() - tipHeightDifference-10);
				
				this.$content.css({
					height:$(window).height()-tipHeightDifference-10,							  
					//+20 to account for the scrollbar. Browsers don't account for "auto" placed scrollbars in width calculations
					//so the contents ends up getting squished
					width:this.$tip.outerWidth()+20,
					overflow:"auto"
				});
			}
			
			
			
			/* If tip is wider than window */
			//+10 to account for 5px margin _setPosition() uses
			if(this.$tip.outerWidth()+10 >= $(window).width()){
				this.$tip.css({
					height:this.$tip.outerHeight(),
					width:$(window).width() - 20,
					overflow:"auto"
				});
			}
		},// _setSize()
		
		/*
		 * _resizeAfterShow
		 *
		 * Resize the content after the tip is shown.  This is to allow the closer to be shown inside the tip
		 * jQuery 1.4.4 doesn't return the height of $("#tipped-closer-wrapper") if it's inside a hidden element,
		 * so we can't accommodate the closer until the tip is shown
		 */
		_resizeAfterShow:function(){
			var $closer = $("#tipped-closer-wrapper");
			if($closer.is(':visible'))
			{
				var closer_height = $closer.outerHeight();
				this.$content.height(this.$tip.height() - closer_height);
			}
		},
		
		/*
		 * setPosition()
		 * 
		 * Sets the position of the tip.  This function is called after the content of the tip
		 * is set, allowing the function to make a dynamic decision about the position of the tip
		 *			
		 * The tip is always displayed fully on the screen & will be moved to ensure that.
		 */
		_setPosition:function(){
			//position tip in the top left corner so full, proper width gets calculated
			this.$tip.css({left:0,top:0});


			var Pos = {x:0,y:0};
			Pos = this._calcInitialPosition(Pos);
			Pos = this._adjustPositionForWindow(Pos);
			Pos = this._adjustPositionForMouse(Pos);
					
			this.$tip.css({ 
				left: Pos.x, 
				top: Pos.y 
			});
		},
		
		/*
		 * calcInitialPosition()
		 *
		 * Calculates the initial position of the tip - not accounting
		 * for screen size or being over the mouse
		 */
		_calcInitialPosition:function(Pos){
			switch(this.settings.position){
				case 'mouse':
					Pos.x = this.evt.pageX + this.settings.marginX;
					Pos.y = this.evt.pageY + this.settings.marginY;
					break;
				case 'absolute':
					if(typeof this.settings.posX == 'function')
						Pos.x = this.settings.posX($target);
					else
						Pos.x = this.settings.posX;
					
					if(typeof this.settings.posY == 'function')
						Pos.y = this.settings.posY($target);
					else
						Pos.y = this.settings.posY;
					break;
				default:
					var targetPos = this.$target.offset();
					Pos.x = targetPos.left + this.$target.outerWidth() + this.settings.marginX;
					Pos.y = targetPos.top + this.$target.outerHeight() + this.settings.marginY;
					break;
			}
			return Pos;
		},
		
		/*
		 * _adjustPositionForWindow()
		 *
		 * Adjusts the position of the tip so it fits in the window
		 */
		_adjustPositionForWindow:function(Pos){
			var right = Pos.x + this.$tip.outerWidth();
			var bottom = Pos.y + this.$tip.outerHeight();
			
			// - 5 to assure there is a 5 pixel "padding" around the edge of the window
			var windowWidth = $(window).width() + $(window).scrollLeft()-5;
			var windowHeight = $(window).height() + $(window).scrollTop()-5;
			
			Pos.x = (right > windowWidth) ? Pos.x - (right - windowWidth) : Pos.x;
			Pos.y = (bottom > windowHeight) ? Pos.y - (bottom - windowHeight) : Pos.y;
			
			return Pos;
		},
		
		
		/*
		 * _adjustPositionForMouse()
		 *
		 * Adjusts the position of the tip so it doesn't appear over the mouse 
		 * (resulting in flickering )
		 */
		_adjustPositionForMouse:function(Pos){
			//adjust to ensure tip is not over the mouse position (which results in flickering)
			if(this.settings.position != 'absolute'){
				var mouseX = this.evt.pageX;
				var mouseY = this.evt.pageY;
				var tipWidth = this.$tip.outerWidth();
				var tipHeight = this.$tip.outerHeight();
				
				if(Pos.x < mouseX && Pos.x + tipWidth > mouseX)
					if(Pos.y < mouseY && Pos.y + tipHeight > mouseY)
						if(this.settings.position == 'mouse')
							Pos.x = mouseX - tipWidth - this.settings.marginX;
						else
							Pos.x = this.$target.offset().left - tipWidth - this.settings.marginX;
			}
			return Pos;
		}
	}


	/* Initialize the Tip object once the page is loaded */
	$(document).ready(function(){ Tip.init(); });



	$.fn.tipped = function(settings){
		this.each(function(i){
			
			// shortcut
			$target = $(this);
			
			//store the settings in the element
			settings = $.extend({},defaults,settings);
			$target.data('tipped',settings);
			
									
			//2 modes act differently
			if(settings.mode == 'hover'){
				$target
					.on('mouseover', function(evt){
						Tip.setup($(this),settings,evt);
						Tip.show();
					})
					.on('mouseout', function(){
						Tip.hide();
					});
			}
			else if(settings.mode == 'click'){		
				$target.on('click', function(evt){ 
					clickedSettings = $(this).data('tipped');
					Tip.setup($(this),clickedSettings,evt);
					Tip.show();
				});
			}	
		});
		
		return this;
	};	
	
	/*
	 * Function: getTrigger()
	 * Purpose: To provide access to the element that triggered the tip.  Useful for 
	 *          clicked tips that need to know who triggered them
	 *
	 * Access with: $.getTrigger()
	 */
	$.extend({
		getTrigger:function(){
			return $tip.data('original');
		}
	});
})(jQuery);