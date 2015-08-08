/**
 * @fileOverview Common classes and objects used
 * @author Ian Moore (imoore76 at yahoo dot com)
 * @version $Id: phpvirtualbox.js 599 2015-07-27 10:40:37Z imoore76 $
 * @copyright Copyright (C) 2010-2015 Ian Moore (imoore76 at yahoo dot com)
 */


/**
 * Host details sections used on details tab
 * 
 * @namespace vboxHostDetailsSections
 */
var vboxHostDetailsSections = {
	
	/*
	 * General
	 */
	hostgeneral: {
		icon: 'machine_16px.png',
		title: 'General',
		settingsLink: 'General',
		rows: [
		   {
			   title: 'Name',
			   callback: function() { return $('#vboxPane').data('vboxConfig').name; },
			   condition: function() { return $('#vboxPane').data('vboxConfig').servers.length; }
		   },{
			   title: 'OS Type',
			   callback: function(d) {
				   return d['operatingSystem'] + ' (' + d['OSVersion'] +')';
			   }
		   },{
			   title: 'VirtualBox',
			   callback: function() {
				   return $('#vboxPane').data('vboxConfig').version.string+' ('+$('#vboxPane').data('vboxConfig').version.revision+')';
			   }
		   },{
			   title: 'Base Memory',
			   callback: function(d) {
				   return trans('<nobr>%1 MB</nobr>').replace('%1',d['memorySize']);
			   }
		   },{
			   title: '',
			   data: '<span id="vboxHostMemUsed"><div style="background-color:#a33" id="vboxHostMemUsedPct"><div style="background-color:#a93;float:right;" id="vboxHostMemResPct"></div></div><div style="width:100%;position:relative;top:-14px;left:0px;text-align:center;"><span id="vboxHostMemUsedLblPct" style="float:left" /><span id="vboxHostMemFreeLbl" style="float:right" /></div></span>'
		   },{
			   title: "Processor(s)",
			   callback: function(d) {
				   return d['cpus'][0] + ' (' + d['cpus'].length +')';
			   }
		   },{
			   title: '',
			   callback: function(d) {
			
				   // Processor features?
					var cpuFeatures = new Array();
					for(var f in d.cpuFeatures) {
						if(!d.cpuFeatures[f]) continue;
						cpuFeatures[cpuFeatures.length] = trans(f);
					}
					return cpuFeatures.join(', ');
					
			   },
			   condition: function(d) {
				   if(!d.cpuFeatures) return false;
				   for(var f in d.cpuFeatures) {
					   if(!d.cpuFeatures[f]) continue;
					   return true;
					}
					return false;
			   }
		}],
		
		onRender: function(d) {
			
			// See if timer is already set
			var eTimer = $('#vboxVMDetails').data('vboxHostMemInfoTimer');
			if(eTimer != null) {
				$('#vboxVMDetails').data('vboxHostMemInfoTimer',null);
				window.clearInterval(eTimer);
			}

			
			var showFree = $('#vboxPane').data('vboxConfig').hostMemInfoShowFreePct;
			var memRes = $('#vboxPane').data('vboxConfig').vmMemoryOffset;
			if(!memRes || parseInt(memRes) < 1) memRes = 0;
			
			// Memory used function
			var vboxHostShowMemInfo = function(avail) {

				// If target div no longer exists, stop updating
				if($('#vboxHostMemFreeLbl')[0] == null) {
					var eTimer = $('#vboxVMDetails').data('vboxHostMemInfoTimer');
					$('#vboxVMDetails').data('vboxHostMemInfoTimer',null);
					window.clearInterval(eTimer);
					return;
				}
				
				// Subtract reserved memory?
				avail -= memRes;
				avail = Math.max(0,avail);
				
				var mUsed = d['memorySize'] - (avail + memRes);
				var mUsedPct = Math.round(parseInt((mUsed / d['memorySize']) * 100));
				var memResPct = 0;
				if(memRes > 0) {
					memResPct = Math.round(parseInt((memRes / d['memorySize']) * 100));
				}
				
				// Add tooltip with info
				var tip = trans('<nobr>%1 MB</nobr>').replace('%1',mUsed);
				if(memResPct) tip += ' | ' + trans('<nobr>%1 MB</nobr>').replace('%1',memRes);
				tip += ' | ' + trans('<nobr>%1 MB</nobr>').replace('%1',avail);
				$('#vboxHostMemUsed').tipped({'source':tip,'position':'mouse'});
				
				// Update tooltip content in case tooltip is already showing
				var cid = $($('#tipped').data('original')).attr('id');
				if(cid && cid == 'vboxHostMemUsed') $('#tipped-content').html(tip);
				
				// Width(s)
				$('#vboxHostMemUsedPct').css({'width':((mUsedPct+memResPct)*2)+'px'});
				if(memRes > 0) {
					$('#vboxHostMemResPct').css({'width':''+(memResPct*2)+'px'});
				} else {
					$('#vboxHostMemResPct').hide();
				}

				// Labels
				if(!showFree) {
					$('#vboxHostMemUsedLblPct').html(trans('<nobr>%1 MB</nobr>').replace('%1',(mUsed)) + ' ('+trans('<nobr>%1%</nobr>').replace('%1',mUsedPct)+')');
					$('#vboxHostMemFreeLbl').html(trans('<nobr>%1 MB</nobr>').replace('%1',avail));			
				} else {
					$('#vboxHostMemUsedLblPct').html(trans('<nobr>%1 MB</nobr>').replace('%1',mUsed));
					$('#vboxHostMemFreeLbl').html('('+trans('<nobr>%1%</nobr>').replace('%1',Math.round(parseInt((avail / d['memorySize']) * 100)))+') ' + trans('<nobr>%1 MB</nobr>').replace('%1',avail));
				}
			};
			
			// Refresh at configured intervals
			var interval = 5;
			try {
				interval = Math.max(3,parseInt($('#vboxPane').data('vboxConfig').hostMemInfoRefreshInterval));
			} catch (e) {
				interval = 5;
			}
			
			var vboxHostUpdateMeminfo = function() {
				$.when(vboxAjaxRequest('hostGetMeminfo')).done(function(d){
					vboxHostShowMemInfo(d.responseData);		
				});
			};
			vboxHostUpdateMeminfo();
			
			// Failsafe
			if(isNaN(interval) || interval < 3) interval = 5;
			
			$('#vboxVMDetails').data('vboxHostMemInfoTimer',window.setInterval(vboxHostUpdateMeminfo,interval*1000));
		
		}

	},
		   
	hostnetwork: {
		title: 'Network',
		icon: 'nw_16px.png',
		rows: function(d) {
			
			var netRows = [];
			
			d['networkInterfaces'].sort(strnatcasecmp);
			
			for(var i = 0; i < d['networkInterfaces'].length; i++) {		
				
				/* Interface Name */
				netRows[netRows.length] = {
					title: d['networkInterfaces'][i].name + ' (' + trans(d['networkInterfaces'][i].status) + ')',
					data: ''
				};
				

				/* IPv4 Addr */
				if(d['networkInterfaces'][i].IPAddress){
					
					netRows[netRows.length] = {
						title: trans('IPv4 Address','UIGlobalSettingsNetwork'),
						data: d['networkInterfaces'][i].IPAddress + ' / ' + d['networkInterfaces'][i].networkMask,
						indented: true
					};
					
				}
				
				/* IPv6 Address */
				if(d['networkInterfaces'][i].IPV6Supported && d['networkInterfaces'][i].IPV6Address) {
					
					netRows[netRows.length] = {
						title: trans('IPv6 Address','UIGlobalSettingsNetwork'),
						data: d['networkInterfaces'][i].IPV6Address + ' / ' + d['networkInterfaces'][i].IPV6NetworkMaskPrefixLength,
						indented: true
					};
				}
				
				/* Physical info */
				netRows[netRows.length] = {
					title: '',
					data: trans(d['networkInterfaces'][i].mediumType) + (d['networkInterfaces'][i].hardwareAddress ? ' (' + d['networkInterfaces'][i].hardwareAddress + ')': ''),
					indented: true
				};
				
							
			}
			return netRows;
		}
	},

	hostdvddrives: {
		title: 'DVD',
		icon: 'cd_16px.png',
		language_context: 'UIApplianceEditorWidget',
		condition: function(d) {
			return d['DVDDrives'].length;
		},
		rows: function(d) {

			var dvdRows = [];
			
			for(var i = 0; i < d['DVDDrives'].length; i++) {
				dvdRows[dvdRows.length] = {
					title: vboxMedia.getName(vboxMedia.getMediumById(d['DVDDrives'][i].id)),
					data: ''
				};
			}
			
			return dvdRows;
		}
	},
	
	hostfloppydrives: {
		title: 'Floppy',
		language_context: 'UIApplianceEditorWidget',
		icon: "fd_16px.png",
		condition: function(d) { return d['floppyDrives'].length; },
		rows: function(d) {
			
			var fRows = [];
			
			for(var i = 0; i < d['floppyDrives'].length; i++) {		
				
				fRows[fRows.length] = {
						title: vboxMedia.getName(vboxMedia.getMediumById(d['floppyDrives'][i].id)),
						data: ''
				};
				
			}

			return fRows;
		}
	}
};

/**
 * VM details sections used on details tab and snapshot pages
 * 
 * @namespace vboxVMDetailsInfo
 */
var vboxVMDetailsSections = {
	
	/*
	 * General
	 */
	general: {
		title: 'General',
		icon: 'machine_16px.png',
		settingsLink: 'General',
		multiSelectDetailsTable: true,
		rows: [
		   {
			   title: 'Name', attrib: 'name'
		   },{
			   title: 'OS Type', attrib: 'OSTypeDesc'
		   },{
			   title: 'Guest Additions Version', attrib: 'guestAdditionsVersion'
		   },{
			   title: 'Groups',
			   language_context: 'UIGDetails',
			   condition: function(d){
				   return (d.groups.length > 1 || (d.groups.length == 1 && d.groups[0] != '/')); 
			   },
			   callback: function(d) {
				   if(d.groups && d.groups.length > 0)
					   return jQuery.map(d.groups,function(elm) {
						   if(elm.length > 1) return elm.substring(1);
						   return elm;
					   }).join(', ');
			   }
		   }
		   
		]
	},
	
	/*
	 * System
	 */
	system: {
		title: 'System',
		icon: 'chipset_16px.png',
		settingsLink: 'System',
		redrawMachineEvents: ['OnCPUExecutionCapChanged'],
		multiSelectDetailsTable: true,
		rows: [
		   {
			   title: 'Base Memory',
			   callback: function(d) {
				   return trans('<nobr>%1 MB</nobr>').replace('%1',d['memorySize']);
			   }
		   },{
			   title: "Processor(s)",
			   attrib: 'CPUCount',
			   condition: function(d) { return d.CPUCount > 1; }
		   },{
			   title: "Execution Cap",
			   callback: function(d) {
				   return trans('<nobr>%1%</nobr>').replace('%1',parseInt(d['CPUExecutionCap']));
			   },
			   condition: function(d) { return d.CPUExecutionCap < 100; }
		   },{
			   title: "Boot Order",
			   callback: function(d) {
					var bo = new Array();
					for(var i = 0; i < d['bootOrder'].length; i++) {
						bo[i] = trans(vboxDevice(d['bootOrder'][i]));
					}
					return bo.join(', ');
			   }
		   },{
			   title: "Acceleration",
			   language_context: 'UIGDetails',
			   callback: function(d) {
				   var acList = [];
				   if(d['HWVirtExProperties'].Enabled) acList[acList.length] = trans('VT-x/AMD-V');
				   if(d['HWVirtExProperties'].NestedPaging) acList[acList.length] = trans('Nested Paging');
				   if(d['CpuProperties']['PAE']) acList[acList.length] = trans('PAE/NX');
				   
				   if($('#vboxPane').data('vboxConfig').enableAdvancedConfig) {
					   if(d['HWVirtExProperties'].LargePages) acList[acList.length] = trans('Large Pages');
					   if(d['HWVirtExProperties'].UnrestrictedExecution) acList[acList.length] = trans('VT-x unrestricted execution');
					   if(d['HWVirtExProperties'].VPID) acList[acList.length] = trans('VT-x VPID');
				   }
				   return acList.join(', ');
			   },
		   	   condition: function(d) { return (d['HWVirtExProperties'].Enabled || d['CpuProperties']['PAE']); }
		   }
		]
	},
	
	/*
	 * Preview box
	 */
	preview: {
		title: 'Preview',
		icon: 'fullscreen_16px.png',
		_resolutionCache: {},
		settingsLink: 'Display',
		multiSelectDetailsTable: true,
		noSnapshot: true,
		noFooter: true,
		_updateInterval: undefined,
		_screenPadding: 17, // padding around actual screenshot in px 
		condition: function() {
			
			// Update our default updateInterval here
			if(vboxVMDetailsSections.preview._updateInterval === undefined) {
				// Try local data first
				var updateInterval = vboxGetLocalDataItem('previewUpdateInterval');
				if(updateInterval === null || updateInterval === undefined) {
					updateInterval = $('#vboxPane').data('vboxConfig').previewUpdateInterval;
					if(updateInterval === null || updateInterval === undefined) {
						updateInterval = 3;
					}
					vboxSetLocalDataItem('previewUpdateInterval', parseInt(updateInterval));
				}
				vboxVMDetailsSections.preview._updateInterval = parseInt(updateInterval);
			}
			
			return !($('#vboxPane').data('vboxConfig').noPreview);
		},

		/**
		 * Function triggered on VM state change
		 * 
		 */
		vboxEventOnMachineStateChanged: function(eventData) {
		
			var timer = $('#vboxPane').data('vboxPreviewTimer-'+eventData.machineId);
			if(timer) {
				$('#vboxPane').data('vboxPreviewTimer-'+eventData.machineId, null);
				window.clearInterval(timer);
			}
			
			vboxVMDetailsSections.preview._drawPreview(eventData.machineId);

			// Kick off timer if VM is running
			if(vboxVMStates.isRunning(eventData)) {
				window.setTimeout(function(){							
					$('#vboxPane').data('vboxPreviewTimer-'+eventData.machineId, window.setInterval('vboxVMDetailsSections.preview._drawPreview("'+eventData.machineId+'")',vboxVMDetailsSections.preview._updateInterval*1000));							
				},vboxVMDetailsSections.preview._updateInterval*1000);
			}

		},
		
		/*
		 * 
		 * Preivew Update Menu
		 * 
		 */
		contextMenu: function() {
			
			var menu = $('#vboxDetailsPreviewMenu');
			if(menu[0]) return menu;
			

			/* Menu List */
			var ul = $('<ul />')
				.attr({'class':'contextMenu contextMenuNoBG','style':'display: none','id':'vboxDetailsPreviewMenu'})
				.click(function(){$(this).hide();})
				.on('contextmenu', function() { return false; })
				
				// Menu setup for "open in new window"
				.on('beforeshow', function(e, vmid) {
					
					var d = vboxVMDataMediator.getVMData(vmid);
					
					if(vboxVMStates.isRunning(d) || vboxVMStates.isSaved(d)) {
						$('#vboxDetailsViewSavedSS')
							.css('display','')
							.data({'vmid':d.id});
					} else {
						$('#vboxDetailsViewSavedSS').css('display', 'none');
					}
				});
						

			// Menu item to disable update
			$('<li />')
				.hoverClass('vboxHover')
				.append(

					$('<label />').append(

						$('<input />')
							.attr({'class':'vboxRadio','type':'radio','name':'vboxPreviewRadio','value':0})
							.click(function(){
								vboxSetLocalDataItem('previewUpdateInterval','0');
								vboxVMDetailsSections.preview._updateInterval = 0;
							})
							.prop('checked', parseInt(vboxVMDetailsSections.preview._updateInterval) == 0)
						
					).append(
							
						$('<span />')
							.html(trans('Update disabled','UIGMachinePreview'))
					)
					
				).appendTo(ul);


			// Update intervals
			var ints = [3,5,10,20,30,60];
			
			// check for update interval
			if(vboxVMDetailsSections.preview._updateInterval > 0 && jQuery.inArray(vboxVMDetailsSections.preview._updateInterval, ints) < 0) {
				ints[ints.length] = vboxVMDetailsSections.preview._updateInterval;
			}
			ints.sort(function(a,b){
				if(a == b) return 0;
				return (a > b ? 1: -1);
			});

			// Add each interval to menu
			for(var i = 0; i < ints.length; i++) {
				
				var li = $('<li />');
				
				if(i==0) $(li).attr('class','separator');

				var radio = $('<input />').attr({'class':'vboxRadio','type':'radio','name':'vboxPreviewRadio','value':ints[i]}).click(function(){
					
					var lastIntervalNone = (parseInt(vboxVMDetailsSections.preview._updateInterval) == 0);
					
					vboxSetLocalDataItem('previewUpdateInterval',$(this).val());
					vboxVMDetailsSections.preview._updateInterval = $(this).val();
					
					// Kick off preview updates if the last interval was 0
					if(lastIntervalNone) {
						var selVMData = vboxChooser.getSelectedVMsData();
						for(var i = 0; i < selVMData.length; i++) {
							if(vboxVMStates.isRunning(selVMData[i]) || vboxVMStates.isSaved(selVMData[i]))
								vboxVMDetailsSections.preview._drawPreview(selVMData[i].id);
						}
					}
					
					
				}).prop('checked', parseInt(vboxVMDetailsSections.preview._updateInterval) == ints[i]);
				
				$('<label />')
					.append(radio)
					.append(
						$('<span />')
							.html(trans('Every %1 seconds','UIGMachinePreview').replace('%1',ints[i]))
					)
					.appendTo(li);

				$(ul).append(li);
				
			}

			/* Append "Open in new window" */
			$('<li />')
				.attr({'id':'vboxDetailsViewSavedSS','class':'separator','style':'display:none;text-align: center;'})
				.click(function(){
					window.open(vboxEndpointConfig.screen+'?vm='+$(this).data('vmid')+'&full=1','vboxSC','toolbar=1,menubar=0,location=0,directories=0,status=true,resize=true');
				}).append(
					$('<span />')
						.html(trans('Open in new window','UIVMPreviewWindow'))
				).appendTo(ul);
			
			/* Hover */
			$(ul).children().hoverClass('vboxHover');

						
			$(document).click(function(e){if(e.button!=2)$(ul).hide();});
			
			$('#vboxTabVMDetails').append(ul);
			
			return $('#vboxDetailsPreviewMenu');

		},
		
		/**
		 * This is run when the preview screen is drawn
		 */
		onRender: function(d) {

			// Not needed in canvas logic
			if(isCanvasSupported()) return;
			
			if(!vboxVMDetailsSections.preview._updateInterval || (!vboxVMStates.isRunning(d) && !vboxVMStates.isSaved(d))) {
				var timer = $('#vboxPane').data('vboxPreviewTimer-'+d.id);
				if(timer) {
					$('#vboxPane').data('vboxPreviewTimer-'+d.id, null);
					window.clearInterval(timer);
				}
				vboxVMDetailsSections.preview._drawPreview(d.id);
				return;
			}
		
			vboxVMDetailsSections.preview._drawPreview(d.id);
			
			if(vboxVMStates.isRunning(d)) {
				
				var timer = $('#vboxPane').data('vboxPreviewTimer-'+d.id);
				if(timer) window.clearInterval(timer);
				
				$('#vboxPane').data('vboxPreviewTimer-'+d.id,
					window.setInterval('vboxVMDetailsSections.preview._drawPreview("'+d.id+'")',
							vboxVMDetailsSections.preview._updateInterval * 1000));

			}
		},

		/**
		 * Draw the preview window from VM screenshot
		 * 
		 */
		_drawPreview: function(vmid) {
			
			// Does the target still exist?
			if(!$('#vboxDetailsGeneralTable-'+vmid)[0]) {
				var timer = $('#vboxPane').data('vboxPreviewTimer-'+vmid);
				if(timer) window.clearInterval(timer);
				$('#vboxPane').data('vboxPreviewTimer-'+vmid, null);
				return;
			}

			var width = $('#vboxPane').data('vboxConfig')['previewWidth'];
			
			// Get fresh VM data
			var vm = vboxVMDataMediator.getVMData(vmid);
			
			var __vboxDrawPreviewImg = new Image();			
			__vboxDrawPreviewImg.onload = function() {

				// Does the target still exist?
				if(!$('#vboxDetailsGeneralTable-'+vmid)[0]) {
					var timer = $('#vboxPane').data('vboxPreviewTimer-'+vmid);
					if(timer) window.clearInterval(timer);
					$('#vboxPane').data('vboxPreviewTimer-'+vmid, null);
					return;
				}
				
				// Set and cache dimensions
				if(this.height > 0) {
					
					// If width != requested width, it is scaled
					if(this.width != $('#vboxPane').data('vboxConfig')['previewWidth']) {
						height = this.height * (width / this.width);
						
					// Not scaled
					} else {					
						height = this.height;							
					}

					vboxVMDetailsSections.preview._resolutionCache[vmid] = {
						'height': height
					};

				// Height of image is 0
				} else {
					
					// Check for cached resolution
					if(vboxVMDetailsSections.preview._resolutionCache[vmid]) {				
						height = vboxVMDetailsSections.preview._resolutionCache[vmid].height;
					} else {
						height = parseInt(width / $('#vboxPane').data('vboxConfig')['previewAspectRatio']);
					}
					
					// Clear interval if set
					var timer = $('#vboxPane').data('vboxPreviewTimer-'+vmid);
					if(timer) window.clearInterval(timer);
					
				}
				
				// Get fresh VM data
				var vm = vboxVMDataMediator.getVMData(vmid);
				
				// Return if this is stale
				if(!vm) {
					var timer = $('#vboxPane').data('vboxPreviewTimer-'+vmid);
					if(timer) window.clearInterval(timer);
					$('#vboxPane').data('vboxPreviewTimer-'+vmid, null);
					return;
				}
				
				// Canvas redraw
				if(isCanvasSupported()) {
					
					// Reset height and width
					$('#vboxPreviewCanvas-'+vmid).attr({'width':(width+(vboxVMDetailsSections.preview._screenPadding*2)),'height':(height+(vboxVMDetailsSections.preview._screenPadding*2))});
					
					// Redraw preview
					vboxDrawPreviewCanvas($('#vboxPreviewCanvas-'+vmid)[0], (this.height <= 1 ? null: this), vm.name, width, height);
			
				// HTML update
				} else {
					
					var baseStr = 'vboxDetailsGeneralTable-'+vmid;
					if(this.height <= 1) {
						

						// IE uses filter
						if($.browser.msie) {
							$('#'+baseStr+' img.vboxDetailsPreviewImg').css({'display':'none',"filter":""})
								.attr({'src':'images/vbox/blank.gif'}).parent().css({'background':'#000'});
						} else {
							$('#'+baseStr+' img.vboxDetailsPreviewImg').css({'display':'none'}).attr('src','images/vbox/blank.gif');							
						}
						
						$('#'+baseStr+' div.vboxDetailsPreviewVMName').css('display','');

						// Resize name?
						$('#vboxDetailsGeneralTable-'+vmid+ ' div.vboxDetailsPreviewVMName span.textFill').textFill({maxFontPixels:20,'height':(height),'width':(width)});
						

					} else {
						
						$('#'+baseStr+' div.vboxDetailsPreviewVMName').css('display','none');
						$('#'+baseStr+' img.vboxDetailsPreviewImg').css({'display':'','height':height+'px','width':width+'px'});

						// IE uses filter
						if($.browser.msie) {
							
							if(vboxVMStates.isRunning(vm)) {
								
								// Setting background URL keeps image from being
								// requested again, but does not allow us to set
								// the size of the image. This is fine, since the
								// image is returned in the size requested.
								$('#'+baseStr+' img.vboxDetailsPreviewImg').css({"filter":""}).parent().css({'background':'url('+this.src+')'});
								
							} else {
								
								// This causes the image to be requested again, but
								// is the only way to size the background image.
								// Saved preview images are not returned in the size
								// requested and must be resized at runtime by
								// the browser.
								$('#'+baseStr+' img.vboxDetailsPreviewImg').css({"filter":"progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled='true', src='"+this.src+"', sizingMethod='scale')"}).parent().css({'background':'#000'});
							}
							
						} else {
							
							$('#'+baseStr+' img.vboxDetailsPreviewImg').css({'background-image':'url('+this.src+')','background-size':(width+1) +'px ' + (height+1)+'px'});
							
						}
					}
					
					
					$('#'+baseStr+' div.vboxDetailsPreviewWrap').css({'height':height+'px','width':width+'px'});
					$('#'+baseStr+' img.vboxPreviewMonitor').css('width',width+'px');
					$('#'+baseStr+' img.vboxPreviewMonitorSide').css('height',height+'px');

					
				}

			};

			// Update disabled? State not Running or Saved
			if(!vboxVMDetailsSections.preview._updateInterval || (!vboxVMStates.isRunning(vm) && !vboxVMStates.isSaved(vm))) {
				__vboxDrawPreviewImg.height = 0;
				__vboxDrawPreviewImg.onload();
			} else {
				// Running VMs get random numbers.
				// Saved are based on last state change to try to let the browser cache Saved screen shots
				var randid = vm.lastStateChange;
				if(vboxVMStates.isRunning(vm)) {
					var currentTime = new Date();
					randid = Math.floor(currentTime.getTime() / 1000);
				}
				__vboxDrawPreviewImg.src = vboxEndpointConfig.screen+'?width='+(width)+'&vm='+vmid+'&randid='+randid;
				
			}
			


		},
		
		/**
		 * Rows wrapper
		 */
		rows: function(d) {

			var timer = $('#vboxPane').data('vboxPreviewTimer-'+d.id);
			if(timer) window.clearInterval(timer);
			$('#vboxPane').data('vboxPreviewTimer-'+d.id, null);
			
			return (isCanvasSupported() ? vboxVMDetailsSections.preview._rows_canvas(d): vboxVMDetailsSections.preview._rows_html(d));
		},
		
		/**
		 * Draws preview window in HTML
		 */
		_rows_html: function(d) {
			
			var width = $('#vboxPane').data('vboxConfig')['previewWidth'];
			if(!width) width = $('#vboxPane').data('vboxConfig')['previewWidth'] = 180;
			width = parseInt(width);
			var height = parseInt(width / $('#vboxPane').data('vboxConfig')['previewAspectRatio']);

			// Check for cached resolution
			if(vboxVMDetailsSections.preview._resolutionCache[d.id]) {
				width = vboxVMDetailsSections.preview._resolutionCache[d.id].width;
				height = vboxVMDetailsSections.preview._resolutionCache[d.id].height;
			}

			var divOut1 = "<div class='vboxDetailsPreviewVMName' style='position:absolute;overflow:hidden;padding:0px;height:"+height+"px;width:"+width+"px;"+
				"display:"+((vboxVMStates.isRunning(d) || vboxVMStates.isSaved(d)) ? 'none': '')+"' >" +
				"<div style='position:relative;display:table-cell;padding:0px;vertical-align:middle;color:#fff;font-weight:bold;overflow:hidden;text-align:center;height:"+height+"px;width:"+width+"px;" +
				($.browser.msie ? "filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled=\"true\", src=\"images/monitor_glossy.png\", sizingMethod=\"scale\")": "" +
					"background:url(images/monitor_glossy.png) top left no-repeat;-moz-background-size:100% 100%;background-size:"+(width+1) +"px " + (height+1)+"px;-webkit-background-size:100% 100%") +
				"'><span class='textFill' style='font-size: 12px;position:relative;display:inline-block;'>"+$('<div />').html(d.name).text()+"</span></div>"+
				"</div>";

			return [
			        {
			        	data: "<tr style='vertical-align: middle'>"+
							"<td style='text-align: center' colspan='2'>"+
								"<table class='vboxInvisible vboxPreviewTable' style='margin-left:auto;margin-right:auto;'>"+
									"<tr style='vertical-align:bottom; padding:0px; margin:0px;height:17px'>"+
										"<td class='vboxInvisible' style='text-align:right;width:15px;height:17px'><img src='images/monitor_tl.png' style='width:15px;height:17px;'/></td>"+
										"<td class='vboxInvisible'><img src='images/monitor_top.png' class='vboxPreviewMonitor' style='height:17px;width:"+width+"px'/></td>"+
										"<td class='vboxInvisible' style='text-align:left;width:15px;height:17px'><img src='images/monitor_tr.png' style='width:15px;height:17px;'/></td>"+
									"</tr>"+
									"<tr style='vertical-align:top;'>"+
										"<td class='vboxInvisible' style='text-align:right;'><img src='images/monitor_left.png' style='width:15px;height:"+height+"px' class='vboxPreviewMonitorSide' /></td>"+
										"<td class='vboxInvisible' style='position:relative;'><div class='vboxDetailsPreviewWrap "+ (vboxVMStates.isSaved(d) ? 'vboxPreviewSaved': '') +"' style='width: "+width+"px; height:"+height+"px; position:relative;overflow:hidden;text-align:center;background-color:#000;border:0px;display:table;#position:relative;background-repeat:no-repeat;padding:0px;margin:0px;'>"+
											"<img class='vboxDetailsPreviewImg' src='images/monitor_glossy.png' vspace='0px' hspace='0px' "+
											"style='display:"+((vboxVMStates.isRunning(d) || vboxVMStates.isSaved(d)) ? '': 'none')+";top:0px;margin:0px;border:0px;padding;0px;"+
											"background-position:top left;background-repeat:no-repeat;"+
											"-moz-background-size:100% 100%;background-size:100% 100%;-webkit-background-size:100% 100%;background-spacing:0px 0px;"+
											"height:"+height+"px;width:"+width+"px;' />"+
											divOut1+
										"</div></td>"+
										"<td class='vboxInvisible' style='text-align:left;' ><img src='images/monitor_right.png' style='width:14px;height:"+height+"px' class='vboxPreviewMonitorSide' /></td>"+
									"</tr>"+
									"<tr style='vertical-align:top;height:17px'>"+
										"<td class='vboxInvisible' style='text-align:right;width:15px;height:17px'><img src='images/monitor_bl.png' style='width:15px;height:17px;float:right;'/></td>"+
										"<td class='vboxInvisible' style='vertical-align:top'><img src='images/monitor_bottom.png' class='vboxPreviewMonitor' style='height:17px;width:"+width+"px'/></td>"+
										"<td class='vboxInvisible' style='text-align:left;width:15px;height:17px'><img src='images/monitor_br.png' style='width:15px;height:17px;'/></td>"+
									"</tr>"+
								"</table>"+													
							"</td>"+
						"</tr>",
						rawRow: true
			        }
				];

		},
		
		/**
		 * Draws preview on canvas object
		 */
		_rows_canvas: function(d) {

			var width = $('#vboxPane').data('vboxConfig')['previewWidth'];
			if(!width) width = $('#vboxPane').data('vboxConfig')['previewWidth'] = 180;
			width = parseInt(width);
			var height = parseInt(width / $('#vboxPane').data('vboxConfig')['previewAspectRatio']);
			
			// Check for cached resolution
			if(vboxVMDetailsSections.preview._resolutionCache[d.id]) {
				height = vboxVMDetailsSections.preview._resolutionCache[d.id].height;
			}
			
			// Create canvas and initially draw VM name
			var previewCanvas = $('<canvas />').attr({'id':'vboxPreviewCanvas-'+d.id,'width':(width+(vboxVMDetailsSections.preview._screenPadding*2)),'height':(height+(vboxVMDetailsSections.preview._screenPadding*2))});
			
			vboxDrawPreviewCanvas(previewCanvas[0], null, d.name, width, height);
			
			// Draw screenshot if it's running or saved
			if(vboxVMDetailsSections.preview._updateInterval > 0 && (vboxVMStates.isRunning(d) || vboxVMStates.isSaved(d))) {
				
				// Preview image kicks off timer when it is loaded
				var preview = new Image();
				preview.onload = function(){
					
					// Set and cache dimensions
					if(this.height > 0) {
						
						// If width != requested width, it is scaled
						if(this.width != $('#vboxPane').data('vboxConfig')['previewWidth']) {
							
							height = this.height * (width/this.width);
							
						// Not scaled
						} else {					
							height = this.height;							
						}
						
						$('#vboxPreviewCanvas-'+d.id).attr({'width':(width+(vboxVMDetailsSections.preview._screenPadding*2)),'height':(height+(vboxVMDetailsSections.preview._screenPadding*2))});
						
						
					// Check for cached resolution
					} else if(vboxVMDetailsSections.preview._resolutionCache[d.id]) {
						height = vboxVMDetailsSections.preview._resolutionCache[d.id].height;
					} else {
						height = parseInt(width / $('#vboxPane').data('vboxConfig')['previewAspectRatio']);
					}
					
					vboxVMDetailsSections.preview._resolutionCache[d.id] = {'width':width,'height':height};

					// Draw this screen shot
					vboxDrawPreviewCanvas($('#vboxPreviewCanvas-'+d.id)[0], preview, d.name, width, height);
					
					// Kick off timer if VM is running
					if(vboxVMStates.isRunning(d)) {
						window.setTimeout(function(){							
							$('#vboxPane').data('vboxPreviewTimer-'+d.id, window.setInterval('vboxVMDetailsSections.preview._drawPreview("'+d.id+'")',vboxVMDetailsSections.preview._updateInterval*1000));							
						},vboxVMDetailsSections.preview._updateInterval*1000);
					}
				};
				

				var randid = d.lastStateChange;
				if(vboxVMStates.isRunning(d)) {
					var currentTime = new Date();
					randid = Math.floor(currentTime.getTime() / 1000);
				}
				preview.src = vboxEndpointConfig.screen+'?width='+(width)+'&vm='+d.id+'&randid='+randid;

			}
			
			/* Return row */
			return [ {
				data: $('<div />')
						.attr({'class':'vboxInvisble'})
						.append(previewCanvas),
				rawRow: true
			}];
			
		}
	},
	
	/*
	 * Display
	 */
	display: {
		title: 'Display',
		icon: 'vrdp_16px.png',
		settingsLink: 'Display',
		redrawMachineEvents: ['OnVRDEServerInfoChanged','OnVRDEServerChanged','OnMachineStateChanged'],
		rows: [
		   {
			   title: "Video Memory",
			   callback: function(d) {
				   return trans('<nobr>%1 MB</nobr>').replace('%1',d['VRAMSize']);
			   }
		   },{
			   title: 'Remote Desktop Server Port',
			   callback: function(d) {
				   
				   var chost = vboxGetVRDEHost(d);
				
				   // Get ports
				   var rowStr = d['VRDEServer']['ports'];
				   
				   // Just this for snapshots
				   if(d._isSnapshot) return rowStr;
				   
				   // Display links?
				   if((d['state'] == 'Running' || d['state'] == 'Paused') && d['VRDEServerInfo']) {
					   
					   if(d['VRDEServerInfo']['port'] <= 0) {
						   
						   rowStr = '<span style="text-decoration: line-through; color: #f00;">' + rowStr + '</span>';						   
					   
					   // RDP
					   } else if(d['VRDEServer']['VRDEExtPack'].indexOf("VNC") == -1) {
						   rowStr = " <a href='" + vboxEndpointConfig.rdpGen + "?host=" + chost + '&port=' + d['VRDEServerInfo']['port'] + "&id=" + d['id'] + "&vm=" + encodeURIComponent(d['name']) + "'>" + d['VRDEServerInfo']['port'] + "</a>";
						   rowStr += ' <img src="images/vbox/blank.gif" style="vspace:0px;hspace:0px;height2px;width:10px;" /> (' + chost + ':' + d['VRDEServerInfo']['port'] + ')';
					   // VNC   
					   } else {
						   rowStr = " <a href='vnc://" + chost + ':' + d['VRDEServerInfo']['port'] + "'>" + d['VRDEServerInfo']['port'] + "</a>";						   
						   rowStr += ' <img src="images/vbox/blank.gif" style="vspace:0px;hspace:0px;height2px;width:10px;" /> (' + chost + ':' + d['VRDEServerInfo']['port'] + ')';
					   }
				   } else {
					   rowStr += ' ('+chost+')';
				   }
				   return rowStr;
				   
  
			   },
			   html: true,
			   condition: function(d) {
				   
				   // Running and paused states have real-time console info
				   if(!d._isSnapshot && (d['state'] == 'Running' || d['state'] == 'Paused')) {
					   return d.VRDEServer && (d.VRDEServer.enabled);
				   }
				   return (d['VRDEServer'] && (d._isSnapshot || d['VRDEServer']['VRDEExtPack']) && d['VRDEServer']['enabled'] && d['VRDEServer']['ports']);
			   }
		   },{
			   title: "Remote Desktop Server",
			   callback: function(d) {
				   return trans('Disabled','VBoxGlobal',null,'details report (VRDE Server)');
			   },
			   condition: function(d) {
				   return !(vboxVMDetailsSections.display.rows[1].condition(d));
			   }
		   }
		]
	},
	
	/*
	 * Storage controllers
	 */
	storage: {
		title: 'Storage',
		icon: 'hd_16px.png',
		settingsLink: 'Storage',
		redrawMachineEvents: ['OnMediumChanged', 'OnMachineStateChanged'],
		_refreshVMMedia: function(vmid, mid) {
			
			// See if medium is there
			var mRefresh = true;
			if(!vboxMedia.getMediumById(mid)) {
				mRefresh = vboxAjaxRequest('vboxGetMedia');
			}
			var l = new vboxLoader();
			l.showLoading();
			$.when(mRefresh, vboxVMDataMediator.refreshVMData(vmid)).done(function(d){
				if(d && d.responseData) $('#vboxPane').data('vboxMedia',d.responseData);
			}).always(function(){
				l.removeLoading();
			});
		},
		rows: function(d) {
			
			var rows = new Array();
			
			for(var a = 0; a < d['storageControllers'].length; a++) {
				
				var con = d['storageControllers'][a];
				
				// Controller name
				rows[rows.length] = {
						title: trans('Controller: %1','UIMachineSettingsStorage').replace('%1',$('<div />').text(con.name).html()),
						callback: function(){return'';}
				};
						
				// Each attachment.
				for(var b = 0; b < d['storageControllers'][a]['mediumAttachments'].length; b++) {
					
					var portName = vboxStorage[d['storageControllers'][a].bus].slotName(d['storageControllers'][a]['mediumAttachments'][b].port, d['storageControllers'][a]['mediumAttachments'][b].device);

					// Medium / host device info
					var medium = (d['storageControllers'][a]['mediumAttachments'][b].medium && d['storageControllers'][a]['mediumAttachments'][b].medium.id ? vboxMedia.getMediumById(d['storageControllers'][a]['mediumAttachments'][b].medium.id): null);
					
					// Do we need to reload media?
					if(d['storageControllers'][a]['mediumAttachments'][b].medium && d['storageControllers'][a]['mediumAttachments'][b].medium.id && medium === null) {
						
						if(!d._isSnapshot) {
							portDesc = '<a href="javascript:vboxVMDetailsSections.storage._refreshVMMedia(\''+
							d.id+"','"+d['storageControllers'][a]['mediumAttachments'][b].medium.id+"');\">"+trans('Refresh','UIVMLogViewer')+"</a>";							

						} else {
							portDesc = trans('Refresh','UIVMLogViewer');
						}

					} else {
						
						// Get base medium (snapshot -> virtual disk file)
						var it = false;
						if(medium && medium.base && (medium.base != medium.id)) {
							it = true;
							medium = vboxMedia.getMediumById(medium.base);
						}

						portDesc = vboxMedia.mediumPrint(medium,false,it);
					}

					rows[rows.length] = {
						title: portName,
						indented: true,
						data: (d['storageControllers'][a]['mediumAttachments'][b].type == 'DVD' ? trans('[Optical Drive]','UIGDetails') + ' ': '') + portDesc,
						html: true
					};
					
				}
				
			}
			return rows;
		}
	},
	
	/*
	 * Audio
	 */
	audio: {
		title: 'Audio',
		icon: 'sound_16px.png',
		settingsLink: 'Audio',
		rows: [
		    {
			    title: "Disabled",
			    language_context: ['VBoxGlobal', null, 'details report (audio)'],
			    cssClass: 'vboxDetailsNone', 
			    condition: function(d) { return !d['audioAdapter']['enabled']; },
			    data: ''
		    },{
		    	title: "Host Driver",
		    	language_context: 'VBoxGlobal',
		    	callback: function(d) {
		    		return trans(vboxAudioDriver(d['audioAdapter']['audioDriver']),'VBoxGlobal');
		    	},
		    	condition: function(d) { return d['audioAdapter']['enabled']; }
		    },{
		    	title: "Controller",
		    	language_context: 'VBoxGlobal',
		    	callback: function (d) {
		    		return trans(vboxAudioController(d['audioAdapter']['audioController']),'VBoxGlobal');
		    	},
		    	condition: function(d) { return d['audioAdapter']['enabled']; }
		    }
		]
	},
	
	/*
	 * Network adapters
	 */
	network: {
		icon: 'nw_16px.png',
		title: 'Network',
		redrawMachineEvents: ['OnNetworkAdapterChanged','OnMachineStateChanged'],
		settingsLink: 'Network',
		rows: function(d) {
			
			var vboxDetailsTableNics = 0;
			var rows = [];
			
			
			for(var i = 0; i < d['networkAdapters'].length; i++) {
				
				nic = d['networkAdapters'][i];
				
				// compose extra info
				var adp = '';

				if(nic.enabled) {
					vboxDetailsTableNics++;
					switch(nic.attachmentType) {
						case 'Null':
							adp = trans('Not attached','VBoxGlobal');
							break;
						case 'Bridged':
							adp = trans('Bridged adapter, %1').replace('%1', nic.bridgedInterface);
							break;
						case 'HostOnly':
							adp = trans('Host-only adapter, \'%1\'').replace('%1', nic.hostOnlyInterface);
							break;
						case 'NAT':
							// 'NATNetwork' ?
							adp = trans('NAT','VBoxGlobal');
							break;
						case 'Internal':
							adp = trans('Internal network, \'%1\'').replace('%1', $('<div />').text(nic.internalNetwork).html());
							break;
						case 'Generic':
							// Check for properties
							if(nic.properties) {
								adp = trans('Generic Driver, \'%1\' { %2 }','UIGDetails').replace('%1', $('<div />').text(nic.genericDriver).html());
								var np = nic.properties.split("\n");
								adp = adp.replace('%2', np.join(" ,"));
								break;
							}
							adp = trans('Generic Driver, \'%1\'','UIGDetails').replace('%1', $('<div />').text(nic.genericDriver).html());
							break;					
						case 'VDE':
							adp = trans('VDE network, \'%1\'').replace('%1', $('<div />').text(nic.VDENetwork).html());
							break;
						case 'NATNetwork':
							adp = trans('NAT Network, \'%1\'','UIGDetails').replace('%1', $('<div />').text(nic.NATNetwork).html());
							break;
					}

					rows[rows.length] = {
						title: trans("Adapter %1").replace('%1',(i + 1)),
						data: trans(vboxNetworkAdapterType(nic.adapterType)).replace(/\(.*\)/,'') + ' (' + adp + ')'
					};
				}
						
			}
			
			// No enabled nics
			if(vboxDetailsTableNics == 0) {
				
				rows[rows.length] = {
					title: trans('Disabled','VBoxGlobal',null,'details report (network)'),
					cssClass: 'vboxDetailsNone'
				};
				
			// Link nic to guest networking info?
			} else if(d['state'] == 'Running') {
				
				rows[rows.length] = {
					title: '',
					data: '<a href="javascript:vboxGuestNetworkAdaptersDialogInit(\''+d['id']+'\');">('+trans('Guest Network Adapters')+')</a>',
					html: true
				};
				
			}
			
			return rows;

		}
	},
	
	/*
	 * Serial Ports
	 */
	serialports: {
		title: 'Serial Ports',
		icon: 'serial_port_16px.png',
		settingsLink: 'SerialPorts',
		rows: function(d) {
			
			var rows = [];
			
			var vboxDetailsTableSPorts = 0;
			for(var i = 0; i < d['serialPorts'].length; i++) {
				
				p = d['serialPorts'][i];
				
				if(!p.enabled) continue;
				
				// compose extra info
				var xtra = vboxSerialPorts.getPortName(p.IRQ,p.IOBase);
				
				var mode = p.hostMode;
				xtra += ', ' + trans(vboxSerialMode(mode),'VBoxGlobal');
				if(mode != 'Disconnected') {
					xtra += ' (' + $('<div />').text(p.path).html() + ')';
				}
				
				rows[rows.length] = {
					title: trans("Port %1",'VBoxGlobal',null,'details report (serial ports)').replace('%1',(i + 1)),
					data: xtra,
					html: true
				};
				
				vboxDetailsTableSPorts++;
						
			}
			
			if(vboxDetailsTableSPorts == 0) {
				rows[rows.length] = {
					title: trans('Disabled','VBoxGlobal',null,'details report (serial ports)'),
					cssClass: 'vboxDetailsNone'
				};
			}
			
			return rows;
		
		}
	},
	
	/*
	 * Parallel ports
	 */
	parallelports: {
		title: 'Parallel Ports',
		language_context: 'UISettingsDialogMachine',
		icon: 'parallel_port_16px.png',
		settingsLink: 'ParallelPorts',
		condition: function() { return $('#vboxPane').data('vboxConfig').enableLPTConfig; },
		rows: function(d) {
			
			var rows = [];
			
			var vboxDetailsTableSPorts = 0;
			for(var i = 0; i < d['parallelPorts'].length; i++) {
				
				p = d['parallelPorts'][i];
				
				if(!p.enabled) continue;
				
				// compose extra info
				var xtra = trans(vboxParallelPorts.getPortName(p.IRQ,p.IOBase));
				xtra += ' (' + $('<div />').text(p.path).html() + ')';
				
				rows[rows.length] = {
					title: trans("Port %1",'VBoxGlobal',null,'details report (parallel ports)').replace('%1',(i + 1)),
					data: xtra
				};
				vboxDetailsTableSPorts++;
						
			}
			
			if(vboxDetailsTableSPorts == 0) {
				rows[0] = {
					title: trans('Disabled','VBoxGlobal',null,'details report (parallel ports)'),
					cssClass: 'vboxDetailsNone'
				};
			}
			return rows;
			
		}
	},
	
	/*
	 * USB
	 */
	usb: {
		icon: 'usb_16px.png',
		title: 'USB',
		language_context: 'UIGDetails',
		settingsLink: 'USB',
		rows: function(d) {
			
			var rows = [];
			
			var usbEnabled = false;
			var usbType = 'OHCI';
		        
	        for(var i = 0; i < d.USBControllers.length; i++) {
	            var listUSBType = d.USBControllers[i].type;
	            if(listUSBType == 'OHCI') {
	                usbEnabled = true;
	            }
	            switch(listUSBType) {
	                case 'OHCI':
	                    if(usbType == 'EHCI')
	                        break;
	                case 'EHCI':
	                    if(usbType == 'XHCI')
	                       break;
	                default:
	                    usbType = listUSBType;
	            }
	        }

			if(usbEnabled) {
				
			    rows.push({
			        title: trans("USB Controller", 'UIGDetails', null, 'details (usb)'),
			        data: usbType
			    });
			    
				var tot = 0;
				var act = 0;
				for(var i = 0; i < d.USBDeviceFilters.length; i++) {
					tot++;
					if(d.USBDeviceFilters[i].active) act++;
				}
				
				rows.push({
					title: trans("Device Filters", 'UIGDetails', null, 'details (usb)'),
					data: trans('%1 (%2 active)', 'UIGDetails', null, 'details (usb)').replace('%1',tot).replace('%2',act)
				});
				
			} else {
				
				rows.push({
					title: trans("Disabled", 'UIGDetails', null, 'details report (USB)'),
					cssClass: 'vboxDetailsNone'
				});
			}
			
			return rows;

		}
	},
	
	/*
	 * Shared folders list
	 */
	sharedfolders: {
		title: 'Shared Folders',
		language_context: 'UIGDetails',
		icon: 'sf_16px.png',
		settingsLink: 'SharedFolders',
		rows: function(d) {

			if(!d['sharedFolders'] || d['sharedFolders'].length < 1) {
				return [{
					title: trans('None',null,null,'details report (shared folders)'),
					cssClass: 'vboxDetailsNone'
				}];
			}
			
			return [{
					title: trans('Shared Folders', 'UIGDetails'),
					data: d['sharedFolders'].length
				}];
		}
	},
	
	/*
	 * VM Description
	 */
	description: {
		icon: 'description_16px.png',
		title: 'Description',
		language_context: 'UIGDetails',
		settingsLink: 'General:2',
		rows: function(d) {
			return [{
				title: '',
				data: $('<tr />').attr({'class':'vboxDetailRow'}).append(
						$('<td />').attr({'class':'vboxDetailDescriptionCell','colspan':'2'})
							.html(d.description.length ? $('<div />').text(d.description).html(): '<span class="vboxDetailsNone">'+trans("None",null,null,'details report (description)')+'</span>')
				),
				rawRow: true
			}];
		}
	}
};

/**
 * Common VM Group Actions - most of these are passed off
 * to the vboxChooser object
 * 
 * @namespace vboxVMGroupActions
 */
var vboxVMGroupActions = {

	'newmachine': {
		label: 'New Machine...',
		icon: 'vm_new',
		name: 'new',
		click: function(){
			vboxVMActions['new'].click(true);
		},
		enabled: function() {
			return $('#vboxPane').data('vboxSession').admin;
		}
	},
	
	addmachine: {
		label: 'Add Machine...',
		icon: 'vm_add',
		name: 'add',
		click: function() {
			vboxVMActions['add'].click(true);
		},
		enabled: function() {
			return $('#vboxPane').data('vboxSession').admin;
		}
	},
	
	rename: {
		label: 'Rename Group...',
		icon: 'vm_group_name',
		name: 'rename_group',
		enabled: function() {
			if(!$('#vboxPane').data('vboxSession').admin) return false;
			if(!vboxChooser._editable) return false;
			var gElm = vboxChooser.getSelectedGroupElements()[0];
			if(!gElm) return false;
			if($('#vboxPane').data('vboxConfig')['phpVboxGroups']) return true;
			if($(gElm).find('td.vboxVMSessionOpen')[0]) return false;
			return true;
		},
		click: function() {
			vboxChooser.renameSelectedGroup();
		}
	},
	
	ungroup: {
		label: 'Ungroup',
		icon: 'vm_group_remove',
		name: 'remove_group',
		enabled: function() {
			if(!vboxChooser._editable) return false;
			if(!$('#vboxPane').data('vboxSession').admin) return false;
			var gElm = vboxChooser.getSelectedGroupElements()[0];
			if(!gElm) return false;
			if($('#vboxPane').data('vboxConfig')['phpVboxGroups']) return true;
			if($(gElm).find('td.vboxVMSessionOpen')[0]) return false;
			return true;
		},
		click: function() {
			
			vboxChooser.unGroupSelectedGroup();
			
		}
	},
	
	'sort': {
		label: 'Sort',
		icon:'sort',
		name: 'sort_group',
		click: function() {
			vboxChooser.sortSelectedGroup();
		},
		enabled: function() {
			if(!vboxChooser._editable) return false;
			return $('#vboxPane').data('vboxSession').admin;
		}
	}
	
};

/**
 * Common VM Actions - These assume that they will be run on the selected VM as
 * stored in vboxChooser.getSingleSelected()
 * 
 * @namespace vboxVMActions
 */
var vboxVMActions = {
		
	/** Invoke the new virtual machine wizard */
	'new':{
			label: 'New...',
			icon: 'vm_new',
			name: 'new',
			click: function(fromGroup){
				new vboxWizardNewVMDialog((fromGroup ? $(vboxChooser.getSelectedGroupElements()[0]).data('vmGroupPath'): '')).run();
			}
	},
	
	/** Add a virtual machine via its settings file */
	add: {
		label: 'Add...',
		icon: 'vm_add',
		name: 'add',
		click: function(){
			vboxFileBrowser($('#vboxPane').data('vboxSystemProperties').defaultMachineFolder,function(f){
				if(!f) return;
				var l = new vboxLoader();
				l.add('machineAdd',function(){return;},{'file':f});
				l.onLoad = function(){
					var lm = new vboxLoader();
					lm.add('vboxGetMedia',function(d){$('#vboxPane').data('vboxMedia',d.responseData);});
					lm.run();
				};
				l.run();
				
			},false,trans('Add existing virtual machine','UIActionPool'),'images/vbox/machine_16px.png',true);
		}
	},

	/** Start VM */
	start: {
		label: 'Start',
		name: 'start',
		icon: 'vm_start',
		_startedVMs: {},
        /*
         * Subscribe to machine state changes to remove from _startedVMs
         * 
         */
        _subscribedStateChanges: false,
        _subscribeStateChanges: function() {
            
            if(vboxVMActions.start._subscribedStateChanges)
                return;
            
            vboxVMActions.start._subscribedStateChanges = true;
            
            $('#vboxPane').on('vboxOnMachineStateChanged', function(e, eventData) {

                // We did not start this VM
                if(!vboxVMActions.start._startedVMs[eventData.machineId])
                    return;
                
                var vmState = {'state': eventData.state};
                if(vboxVMStates.isPaused(vmState) || vboxVMStates.isStuck(vmState) || vboxVMStates.isPoweredOff(vmState)) {
                    delete vboxVMActions.start._startedVMs[eventData.machineId];
                }

            });

        },
		/*
		 * Subscribe to machine runtime errors to ask for medium
		 * encryption password(s)
		 */
		_subscribedRuntimeErrors: false,
		_subscribeRuntimeErrors: function() {
		    
		    if(vboxVMActions.start._subscribedRuntimeErrors)
		        return;
		    
		    vboxVMActions.start._subscribedRuntimeErrors = true;
		    
		    // Trigger VM media encryption password dialog
		    $('#vboxPane').on('vboxOnRuntimeError',function(e, eventData) {
		        
		        // We did not start this VM
		        if(!vboxVMActions.start._startedVMs[eventData.machineId])
		            return;

		        // Disk encryption missing
		        if(eventData.id == "DrvVD_DEKMISSING") {
		            
		            // Encryption passwords are needed to start VM
		            var vmData = vboxVMDataMediator.getVMDetails(eventData.machineId);
		            vboxVMActions.start._getEncryptionPasswordsStartVM(vmData);
		            
		            return;
		        }

		        // Display runtime error
		        var message = vboxVMDataMediator.getVMData(eventData.machineId).title + ' - ' +
		            eventData.message;
		        vboxAlert(message);
		        
		        
		    });
		    
		},
		/* Get passwords and start VM Logic */
		_getEncryptionPasswordsStartVM: function(vm, validIds) {
		    
	        // Encrypted media
	        var encIds = vboxMedia.getEncryptedMediaIds(
	            vboxStorage.getAttachedBaseMedia(vm)
	        );

            // Get encryption password(s)
            var pwPromise = vboxMediumEncryptionPasswordsDialog(vm.name, encIds, validIds);
            
            $.when(pwPromise).done(function(pwdata) {
                
                
                // vboxVMActions.start._getEncryptionPasswordsStartVM(vm);
                $.when(vboxAjaxRequest('consoleAddDiskEncryptionPasswords',
                        {'vm':vm.id,'passwords':pwdata}))
                        
                .done(function(retData) {

                    if(!retData)
                        return;
                    
                    var failed = retData.responseData.failed.length;
                    var valid = retData.responseData.accepted;

                    if(failed) {
                        var acknowledged = vboxAlert(trans('Unable to enter password!')+
                                '<p>'+retData.responseData.errors.join('<br />')+'</p>');
                        
                        $.when(acknowledged).done(function(){
                            vboxVMActions.start._getEncryptionPasswordsStartVM(vm, valid);
                        })
                    }
                    // VMs will be started automatically if the password(s) supplied were correct
                })
                
            }).fail(function(){
                // Clicked cancel
                // TODO: "Close VM" dialog
            });

		},
		/* Start a single VM */
		_startVM: function(vm) {
		    
            $.when(vm,vboxAjaxRequest('machineSetState',{'vm':vm.id,'state':'powerUp'}))
            
                // VM started and / or progress op returned
                .done(function(evm,d){
                
                    // check for progress operation
                    if(d && d.responseData && d.responseData.progress) {
                        if(vboxVMStates.isSaved(evm)) icon = 'progress_state_restore_90px.png';
                        else icon = 'progress_start_90px.png';
                        
                        vboxProgress({'progress':d.responseData.progress,'persist':d.persist}, function(){return;},
                                icon, trans('Start selected virtual machines','UIActionPool'),evm.name);
                    }
            });

		},
		click: function (btn) {
		
			// Setup
		    vboxVMActions.start._subscribeRuntimeErrors();
		    vboxVMActions.start._subscribeStateChanges();
		    
			// Should the "First Run" wizard be started
			////////////////////////////////////////////
			var firstRun = function(vm) {
				
				var frDef = $.Deferred();
				
				$.when(vboxVMDataMediator.getVMDetails(vm.id)).done(function(d) {

					// Not first run?
					if(d.GUI.FirstRun != 'yes') {
						// Just resolve, nothing to do
						frDef.resolve(d);
						return;
					}

					// Check for CD/DVD drive attachment that has no CD/DVD
					var cdFound = false;
					for(var i = 0; i < d.storageControllers.length; i++) {
						for(var a = 0; a < d.storageControllers[i].mediumAttachments.length; a++) {
							if(d.storageControllers[i].mediumAttachments[a].type == "DVD" &&
									d.storageControllers[i].mediumAttachments[a].medium == null) {
								cdFound = true;
								break;
							}
						}
					}
					
					// No CD/DVD attachment
					if(!cdFound) {
						// Just resolve, nothing to do
						frDef.resolve(d);
						return;	
					}
					
					// First time run
					$.when(d, new vboxWizardFirstRunDialog(d).run()).done(function(vm2start){
						frDef.resolve(vm2start);
					});
					
					
				});
				return frDef.promise();
			};
			
			// Start each eligable selected vm
			//////////////////////////////////////
			var startVMs = function() {				
				
				var vms = vboxChooser.getSelectedVMsData();
				var vmsToStart = [];
				for(var i = 0; i < vms.length; i++) {
					if(vboxVMStates.isPaused(vms[i]) || vboxVMStates.isPoweredOff(vms[i]) || vboxVMStates.isSaved(vms[i])) {
						vmsToStart[vmsToStart.length] = vms[i];
					}
					
				}
				
				(function runVMsToStart(vms){
					
					(vms.length && $.when(firstRun(vms.shift())).done(function(vm){

					    // Save the fact that we started this VM
					    vboxVMActions.start._startedVMs[vm.id] = true;
					    
					    vboxVMActions.start._startVM(vm);
					    
					    // Loop
						runVMsToStart(vms);
						
					}));
				})(vmsToStart);
			};
			
			// Check for memory limit
			// Paused VMs are already using all their memory
			if($('#vboxPane').data('vboxConfig').vmMemoryStartLimitWarn) {
				
				var freeMem = 0;
				var baseMem = 0;
				
				// Host memory needs to be checked
				var loadData = [vboxAjaxRequest('hostGetMeminfo')];
				
				// Load details of each machine to get memory info
				var vms = vboxChooser.getSelectedVMsData();
				for(var i = 0; i < vms.length; i++) {
					if(vboxVMStates.isPoweredOff(vms[i]) || vboxVMStates.isSaved(vms[i]))
						loadData[loadData.length] = vboxVMDataMediator.getVMDataCombined(vms[i].id);
				}
				
				// Show loading screen while this is occuring
				var l = new vboxLoader('vboxHostMemCheck');
				l.showLoading();
				
				// Load all needed data
				$.when.apply($, loadData).done(function() {
					
					// Remove loading screen
					l.removeLoading();

					// First result is host memory info
					freeMem = arguments[0].responseData;
					
					// Add memory of each VM
					for(var i = 1; i < arguments.length; i++) {
				
						// Paused VMs are already using their memory
						if(vboxVMStates.isPaused(arguments[i])) continue;
						
						// memory + a little bit of overhead
						baseMem += (arguments[i].memorySize + 50);
					}

					// subtract offset
					if($('#vboxPane').data('vboxConfig').vmMemoryOffset)
						freeMem -= $('#vboxPane').data('vboxConfig').vmMemoryOffset;
					
					// Memory breaches warning threshold
					if(baseMem >= freeMem) {
						var buttons = {};
						buttons[trans('Yes','QIMessageBox')] = function(){
							$(this).remove();
							startVMs();
						};
						freeMem = Math.max(0,freeMem);
						vboxConfirm('<p>The selected virtual machine(s) require(s) <b><i>approximately</b></i> ' + baseMem +
								'MB of memory, but your VirtualBox host only has ' + freeMem + 'MB '+
								($('#vboxPane').data('vboxConfig').vmMemoryOffset ? ' (-'+$('#vboxPane').data('vboxConfig').vmMemoryOffset+'MB)': '') +
								' free.</p><p>Are you sure you want to start the virtual machine(s)?</p>',buttons,trans('No','QIMessageBox'));
						
						// Memory is fine. Start vms.
					} else {
						startVMs();
					}
					
				});
				
			// No memory limit warning configured
			} else {
				startVMs();
			}

						
		},
		enabled: function () {
			return (vboxChooser.isSelectedInState('Paused') || vboxChooser.isSelectedInState('PoweredOff') || vboxChooser.isSelectedInState('Saved'));			
		}	
	},
	
	/** Invoke VM settings dialog */
	settings: {
		label: 'Settings...',
		icon: 'vm_settings',
		name: 'settings',
		click: function(){
			
			vboxVMsettingsDialog(vboxChooser.getSingleSelectedId());
		},
		enabled: function () {
			return vboxChooser && vboxChooser.selectionMode == vboxSelectionModeSingleVM && 
				(vboxChooser.isSelectedInState('Running') || vboxChooser.isSelectedInState('Paused') || vboxChooser.isSelectedInState('Editable'));
		}
	},

	/** Clone a VM */
	clone: {
		label: 'Clone...',
		icon: 'vm_clone',
		name: 'clone',
		click: function(){
			new vboxWizardCloneVMDialog({vm:vboxChooser.getSingleSelected()}).run();
		},
		enabled: function () {
			return (vboxChooser.selectionMode == vboxSelectionModeSingleVM && vboxChooser.isSelectedInState('PoweredOff'));
		}
	},

	/** Refresh a VM's details */
	refresh: {
		label: 'Refresh',
		language_context: 'UIVMLogViewer',
		icon:'refresh',
		name: 'refresh',
		click:function(){
			
			var vmid = vboxChooser.getSingleSelectedId();
			
			var l = new vboxLoader();
			l.showLoading();
			$.when(vboxVMDataMediator.refreshVMData(vmid)).done(function(){
				l.removeLoading();
			});
			
    	},
    	enabled: function () {return(vboxChooser.selectedVMs.length ==1);}
    },
    
    /** Delete / Remove a VM */
    remove: {
		label: 'Remove...',
		icon: 'vm_delete',
		name: 'remove_vm',
		click:function(){

			///////////////////
			// Remove VMs
			//////////////////
			var removeCopies = function() {
				
				var vmList = [];
				var vmNames = [];
				var vms = vboxChooser.getSelectedVMsData();
				for(var i = 0; i < vms.length; i++) {
					if(vboxVMStates.isPoweredOff(vms[i]) && vboxChooser.vmHasUnselectedCopy(vms[i].id)) {
						vmList[vmList.length] = vms[i].id;
						vmNames[vmNames.length] = vms[i].name;
					}
				}

				if(vmList.length) {

					var rcDef = $.Deferred();
					
					var buttons = {};
					buttons[trans('Remove', 'UIMessageCenter')] = function() {
						$(this).empty().remove();
						vboxChooser.removeVMs(vmList);
						rcDef.resolve();
					}
					
					vmNames = '<b>'+vmNames.join('</b>, <b>')+'</b>';
					var q = trans('<p>You are about to remove following virtual machine items from the machine list:</p><p><b>%1</b></p><p>Do you wish to proceed?</p>','UIMessageCenter').replace('%1',vmNames);
					
					vboxConfirm(q,buttons,undefined,function(){
						rcDef.resolve();
					});

					
					return rcDef.promise();					
				}
				
				return true;

			}
			
			//////////////////
			// Unregister VMs
			///////////////////
			$.when(removeCopies()).done(function() {
			
				var unregisterVMs = function(keepFiles, vms) {
	
					var vms = vboxChooser.getSelectedVMsData();
					
					for(var i = 0; i < vms.length; i++) {
						
						if(vboxVMStates.isPoweredOff(vms[i]) || vboxVMStates.isInaccessible(vms[i])) {
	
							// Remove each selected vm
							$.when(vms[i].name, vboxAjaxRequest('machineRemove',
									{'vm':vms[i].id,'delete':(keepFiles ? '0': '1')}))
								.done(function(vmname, d){
									// check for progress operation
									if(d && d.responseData && d.responseData.progress) {
										vboxProgress({'progress':d.responseData.progress,'persist':d.persist},function(){return;},'progress_delete_90px.png',
												trans('Remove selected virtual machines', 'UIActionPool'), vmname);
									}
							});						
						}
					}				
				};
				var buttons = {};
				buttons[trans('Delete all files','UIMessageCenter')] = function(){
					$(this).empty().remove();
					unregisterVMs(false);
				};
				buttons[trans('Remove only','UIMessageCenter')] = function(){
					$(this).empty().remove();
					unregisterVMs(true);
				};
				
				
				var vmNames = [];
				var vms = vboxChooser.getSelectedVMsData();
				for(var i = 0; i < vms.length; i++) {
					if((vboxVMStates.isPoweredOff(vms[i]) || vboxVMStates.isInaccessible(vms[i])) && !vboxChooser.vmHasUnselectedCopy(vms[i].id)) {
						vmNames[vmNames.length] = vms[i].name;
					}
				}
				
				if(vmNames.length) {
	
					vmNames = '<b>'+vmNames.join('</b>, <b>')+'</b>';
					var q = trans('<p>You are about to remove following virtual machines from the machine list:</p><p>%1</p><p>Would you like to delete the files containing the virtual machine from your hard disk as well? Doing this will also remove the files containing the machine\'s virtual hard disks if they are not in use by another machine.</p>','UIMessageCenter').replace('%1',vmNames);
					
					vboxConfirm(q,buttons);
					
				}
				
			});
    	
    	},
    	enabled: function () {
    		if(!vboxChooser._editable) return false;
    		return (vboxChooser.isSelectedInState('PoweredOff') || vboxChooser.isSelectedInState('Inaccessible'));
    	}
    },
    
    /** Create a group from VM * */
    group: {
    	label: 'Group',
    	icon: 'vm_group_create',
    	name: 'create_group',
    	click: function() {
    		vboxChooser.groupSelectedItems();
    	},
    	enabled: function() {
    		
    		if(!$('#vboxPane').data('vboxSession').admin)
    			return false;
    		
    		if (!vboxChooser || (vboxChooser.getSingleSelectedId() == 'host'))
    			return false;
    		
    		if(!vboxChooser._editable) return false;
    		
    		return vboxChooser.isSelectedInState('Editable');
    		
    	}
    },
    
    /** Discard VM State */
    discard: {
		label: 'Discard Saved State...',
		icon: 'vm_discard',
		name: 'discard',
		click: function(){
			
			var buttons = {};
			buttons[trans('Discard','UIMessageCenter')] = function(){
				$(this).empty().remove();

				var vms = vboxChooser.getSelectedVMsData();
				for(var i = 0; i < vms.length; i++) {
					if(vboxVMStates.isSaved(vms[i])) {
						vboxAjaxRequest('machineSetState',{'vm':vms[i].id,'state':'discardSavedState'});
					}
				}
			};
			var vmNames = [];
			var vms = vboxChooser.getSelectedVMsData();
			for(var i = 0; i < vms.length; i++) {
				if(vboxVMStates.isSaved(vms[i])) {
					vmNames[vmNames.length] = vms[i].name;
				}
			}
			
			if(vmNames.length) {

				vmNames = '<b>'+vmNames.join('</b>, <b>')+'</b>';
				
				vboxConfirm(trans('<p>Are you sure you want to discard the saved state of the following virtual machines?</p><p><b>%1</b></p><p>This operation is equivalent to resetting or powering off the machine without doing a proper shutdown of the guest OS.</p>','UIMessageCenter').replace('%1',vmNames),buttons);
			}
		},
		enabled:function(){
			return vboxChooser.isSelectedInState('Saved');
		}
    },
    
    /** Install Guest Additions **/
    guestAdditionsInstall: {
    	label: 'Install Guest Additions...',
    	icon: 'guesttools',
    	name: 'guesttools',
    	click: function(vmid, mount_only) {
    		
    		if(!vmid)
    			vmid = vboxChooser.getSingleSelected().id;
    		
			$.when(vboxAjaxRequest('consoleGuestAdditionsInstall',{'vm':vmid,'mount_only':mount_only})).done(function(d){
				
				// Progress operation returned. Guest Additions are being updated.
				if(d && d.responseData && d.responseData.progress) {
				
					vboxProgress({'progress':d.responseData.progress,'persist':d.persist,'catcherrs':1},function(d){
					
						// Error updating guest additions
						if(!d.responseData.result && d.responseData.error && d.responseData.error.err) {
							if(d.responseData.error.err != 'VBOX_E_NOT_SUPPORTED') {
								vboxAlert({'error':trans('Failed to update Guest Additions. The Guest Additions installation image will be mounted to provide a manual installation.','UIMessageCenter'),'details':d.responseData.error.err+"\n"+d.responseData.error.message});
							}
							vboxVMActions['guestAdditionsInstall'].click(vmid, true);
							return;
						}
					},'progress_install_guest_additions_90px.png',trans('Install Guest Additions...','UIActionPool').replace(/\./g,''));
					
				// Media was mounted
				} else if(d.responseData && d.responseData.result && d.responseData.result == 'mounted') {

					// Media must be refreshed
					var ml = new vboxLoader();
					ml.add('vboxGetMedia',function(dat){$('#vboxPane').data('vboxMedia',dat.responseData);});
					ml.run();
					
					if(d.responseData.errored)
						vboxAlert(trans('Failed to update Guest Additions. The Guest Additions installation image will be mounted to provide a manual installation.','UIMessageCenter'));
					
				// There's no CDROM drive
				} else if(d.responseData && d.responseData.result && d.responseData.result == 'nocdrom') {
					
					var vm = vboxVMDataMediator.getVMData(vmid);
					vboxAlert(trans("<p>Could not insert the VirtualBox Guest Additions " +
			                "installer CD image into the virtual machine <b>%1</b>, as the machine " +
			                "has no CD/DVD-ROM drives. Please add a drive using the " +
			                "storage page of the virtual machine settings dialog.</p>",'UIMessageCenter').replace('%1',vm.name));
					
				// Can't find guest additions
				} else if (d.responseData && d.responseData.result && d.responseData.result == 'noadditions') {
					
					var s1 = '('+trans('None','VBoxGlobal')+')';
					var s2 = s1;
					
					if(d.responseData.sources && d.responseData.sources.length) {
						if(d.responseData.sources[0]) s1 = d.responseData.sources[0];
						if(d.responseData.sources[1]) s2 = d.responseData.sources[1];
					}
					var q = trans('<p>Could not find the VirtualBox Guest Additions CD image file <nobr><b>%1</b></nobr> or <nobr><b>%2</b>.</nobr></p><p>Do you wish to download this CD image from the Internet?</p>','UIMessageCenter').replace('%1',s1).replace('%2',s2);
					var b = {};
					b[trans('Yes','QIMessageBox')] = function() {
						var url = 'http://download.virtualbox.org/virtualbox/%1/VBoxGuestAdditions_%2.iso';
						url = url.replace('%1',$('#vboxPane').data('vboxConfig').version.string.replace('_OSE',''));
						url = url.replace('%2',$('#vboxPane').data('vboxConfig').version.string.replace('_OSE',''));
						$(this).remove();
						window.open(url);
					};
					vboxConfirm(q,b,trans('No','QIMessageBox'));
				}
			});

    	}

    },
    
    /** Show VM Logs */
    logs: {
		label: 'Show Log...',
		icon: 'vm_show_logs',
		name: 'show_logs',
		click: function(){
    		vboxShowLogsDialogInit(vboxChooser.getSingleSelected());
		},
		enabled:function(){
			return (vboxChooser.getSingleSelectedId() && vboxChooser.getSingleSelectedId() != 'host');
		}
    },

    /** Save the current VM State */
	savestate: {
		label: 'Save State',
		icon: 'vm_save_state',
		name: 'save_state',
		stop_action: true,
		enabled: function(){
			return (vboxChooser.isSelectedInState('Running') || vboxChooser.isSelectedInState('Paused'));
		},
		click: function() {

			var vms = vboxChooser.getSelectedVMsData();
			for(var i = 0; i < vms.length; i++) {
				if(vboxVMStates.isRunning(vms[i]) || vboxVMStates.isPaused(vms[i]))
					vboxVMActions.powerAction('savestate','Save the state of the virtual machine', vms[i]);
			}
		}
	},

	/** Send ACPI Power Button to VM */
	powerbutton: {
		label: 'ACPI Shutdown',
		icon: 'vm_shutdown',
		name: 'vm_shutdown',
		stop_action: true,
		enabled: function(){
			return vboxChooser.isSelectedInState('Running');
		},
		click: function() {
			var buttons = {};
			buttons[trans('ACPI Shutdown','UIMessageCenter')] = function() {
				$(this).empty().remove();
				var vms = vboxChooser.getSelectedVMsData();
				for(var i = 0; i < vms.length; i++) {
					if(vboxVMStates.isRunning(vms[i]))
						vboxVMActions.powerAction('powerbutton','Send the ACPI Shutdown signal to the virtual machine', vms[i]);		
				}
			};
			var vmNames = [];
			var vms = vboxChooser.getSelectedVMsData();
			for(var i = 0; i < vms.length; i++) {
				if(vboxVMStates.isRunning(vms[i])) {
					vmNames[vmNames.length] = vms[i].name;
				}
			}
			
			if(vmNames.length) {

				vmNames = '<b>'+vmNames.join('</b>, <b>')+'</b>';

				vboxConfirm(trans("<p>Do you really want to send an ACPI shutdown signal " +
					"to the following virtual machines?</p><p><b>%1</b></p>",'UIMessageCenter').replace('%1', vmNames),buttons);
			}
		}
	},
	
	/** Pause a running VM */
	pause: {
		label: 'Pause',
		icon: 'vm_pause',
		name: 'vm_pause',
		enabled: function(){
			return vboxChooser.isSelectedInState('Running');
		},
		click: function() {
			var vms = vboxChooser.getSelectedVMsData();
			for(var i = 0; i < vms.length; i++) {
				if(vboxVMStates.isRunning(vms[i]))
					vboxVMActions.powerAction('pause','Suspend execution of selected virtual machines', vms[i]);
			}
		}
	},
	
	/** Power off a VM */
	powerdown: {
		label: 'Power Off',
		icon: 'vm_poweroff',
		name: 'poweroff',
		stop_action: true,
		enabled: function() {
			return (vboxChooser.isSelectedInState('Running') || vboxChooser.isSelectedInState('Paused') || vboxChooser.isSelectedInState('Stuck'));
		},
		click: function() {
			
			var buttons = {};
			buttons[trans('Power Off','UIActionPool')] = function() {
				$(this).empty().remove();
				
				var vms = vboxChooser.getSelectedVMsData();
				for(var i = 0; i < vms.length; i++) {
					if(vboxVMStates.isRunning(vms[i]) || vboxVMStates.isPaused(vms[i]) || vboxVMStates.isStuck(vms[i]))
						vboxVMActions.powerAction('powerdown','Power off selected virtual machines', vms[i]);
				}
			};
			
			var vmNames = [];
			var vms = vboxChooser.getSelectedVMsData();
			for(var i = 0; i < vms.length; i++) {
				if(vboxVMStates.isRunning(vms[i]) || vboxVMStates.isPaused(vms[i]) || vboxVMStates.isStuck(vms[i])) {
					vmNames[vmNames.length] = vms[i].name;
				}
			}
			
			if(vmNames.length) {

				vmNames = '<b>'+vmNames.join('</b>, <b>')+'</b>';
				
				vboxConfirm(trans("<p>Do you really want to power off the following virtual machines?</p>" +
						"<p><b>%1</b></p><p>This will cause any unsaved data in applications " +
						"running inside it to be lost.</p>", 'UIMessageCenter').replace('%1', vmNames), buttons);
			}

		}
	},
	
	/** Reset a VM */
	reset: {
		label: 'Reset',
		icon: 'vm_reset',
		name: 'reset',
		enabled: function(){
			return vboxChooser.isSelectedInState('Running');
		},
		click: function() {
			var buttons = {};
			buttons[trans('Reset','UIActionPool')] = function() {
				$(this).remove();

				var vms = vboxChooser.getSelectedVMsData();
				for(var i = 0; i < vms.length; i++) {
					if(vboxVMStates.isRunning(vms[i]))
						vboxVMActions.powerAction('reset','Reset selected virtual machines', vms[i]);
				}
			};
			
			var vmNames = [];
			var vms = vboxChooser.getSelectedVMsData();
			for(var i = 0; i < vms.length; i++) {
				if(vboxVMStates.isRunning(vms[i])) {
					vmNames[vmNames.length] = vms[i].name;
				}
			}
			
			if(vmNames.length) {

				vmNames = '<b>'+vmNames.join('</b>, <b>')+'</b>';

				vboxConfirm(trans("<p>Do you really want to reset the following virtual machines?</p><p><b>%1</b></p><p>"+
				            "This will cause any unsaved data in applications running inside it to be lost.</p>",'UIMessageCenter').replace('%1',vmNames),buttons);
			}
		}
	},
	
	/** Stop actions list */
	stop_actions: ['savestate','powerbutton','powerdown'],

	/** Stop a VM */
	stop: {
		name: 'stop',
		label: 'Stop',
		language_context: 'VBoxSelectorWnd',
		icon: 'vm_shutdown',
		menu: true,
		click: function () { return true; /* handled by stop context menu */ },
		enabled: function () {
			return (vboxChooser.isSelectedInState('Running') || vboxChooser.isSelectedInState('Paused') || vboxChooser.isSelectedInState('Stuck'));
		}
	},
	
	/** Power Action Helper function */
	powerAction: function(pa,pt,vm){
		icon =null;
		errorMsg = null;
		switch(pa) {
			case 'powerdown':
				fn = 'powerDown';
				icon='progress_poweroff_90px.png';
				break;
			case 'powerbutton':
				fn = 'powerButton';
				errorMsg = trans('Failed to send the ACPI Power Button press event to the virtual machine <b>%1</b>.','UIMessageCenter');
				break;
			case 'savestate':
				fn = 'saveState';
				icon='progress_state_save_90px.png';
				break;
			case 'pause':
				fn = 'pause';
				break;
			case 'reset':
				fn = 'reset';
				break;
			default:
				return;
		}
		
		$.when(vboxAjaxRequest('machineSetState',{'vm':vm.id,'state':fn})).done(function(d){
			if(!(d && d.success) && errorMsg) {
				vboxAlert(errorMsg.replace('%1', vm.name));
				return;
			}
			// check for progress operation
			if(d && d.responseData && d.responseData.progress) {
				vboxProgress({'progress':d.responseData.progress,'persist':d.persist},function(){
					return;
				},icon,trans(pt,'UIActionPool'), vm.name);
				return;
			}
		});	
		
	}
};


/**
 * Common Media functions object
 * 
 * @namespace vboxMedia
 */
var vboxMedia = {

    /**
     * Get encryption settings for medium
     */
    getEncryptionSettings: function(m) {
        if(m && m.encryptionSettings) {
            return m.encryptionSettings
        }
        return null;
    },
    
    /**
     * Return a list of encrypted media and associated
     * encryption ids
     */
    getEncryptedMedia: function(media) {
        var encMedia = [];
        for(var i = 0; i < media.length; i++) {
            var e = vboxMedia.getEncryptionSettings(media[i]);
            if(!e) continue;
            encMedia.push({
                medium: media[i].id,
                id: e.id
            });
        }
        return encMedia;
    },
    
    /**
     * Return list of IDs and cypers for media list
     */
    getEncryptedMediaIds: function(media) {
        var encryptIds = [];
        var idsSeen = [];
        for(var i = 0; i < media.length; i++) {
            var e = vboxMedia.getEncryptionSettings(media[i]);
            if(!e) continue;
            if(jQuery.inArray(e.id, idsSeen) > -1) continue;
            idsSeen.push(e.id);
            encryptIds.push({id: e.id, cipher: e.cipher})
        }
        return encryptIds;
    },

    /**
     * Return true if medium is a host drive
     */
    isHostDrive: function(m) {
        return (m && m.hostDrive)
    },
    
	/**
	 * Return a printable string for medium m
	 * 
	 * @static
	 */
	mediumPrint: function(m,nosize,usehtml) {
		var name = vboxMedia.getName(m);
		var enc = vboxMedia.getEncryptionSettings(m);
		if(nosize || !m || m.hostDrive) return name;
		return name + ' (' + (m.deviceType == 'HardDisk' ? trans(m.type,'VBoxGlobal', null, 'MediumType') + ', ' + (enc && enc.id ? trans('Encrypted', 'VBoxGlobal') + ', ' : '') : '') + vboxMbytesConvert(m.logicalSize) + ')';
	},

	/**
	 * Return printable medium name
	 * 
	 * @static
	 */
	getName: function(m) {
		if(!m) return trans('Empty','VBoxGlobal');
		if(m.hostDrive) {
			if (m.description && m.name) {
				return trans('Host Drive %1 (%2)','VBoxGlobal').replace('%1',m.description).replace('%2',m.name);
			} else if (m.location) {
				return trans('Host Drive \'%1\'','VBoxGlobal').replace('%1',m.location);
			} else {
				return trans('Host Drive','VBoxGlobal');
			}
		}
		return m.name;
	},

	/**
	 * Return printable medium type
	 * 
	 * @static
	 */
	getType: function(m) {
		if(!m || !m.type) return trans('Normal', 'VBoxGlobal', null, 'MediumType');
		if(m.type == 'Normal' && m.base && m.base != m.id) return trans('Differencing', 'VBoxGlobal', null, 'MediumType');
		return trans(m.type,'VBoxGlobal', null, 'MediumType');
	},
	
	/**
	 * Return printable medium format
	 * 
	 * @static
	 */
	getFormat: function (m) {
		if(!m) return '';
		switch(m.format.toLowerCase()) {
			case 'vdi':
				return trans('VDI (VirtualBox Disk Image)','UIWizardNewVD');
			case 'vmdk':
				return trans('VMDK (Virtual Machine Disk)','UIWizardNewVD');
			case 'vhd':
				return trans('VHD (Virtual Hard Disk)','UIWizardNewVD');
			case 'parallels':
			case 'hdd':
				return trans('HDD (Parallels Hard Disk)','UIWizardNewVD');
			case 'qed':
				return trans('QED (QEMU enhanced disk)','UIWizardNewVD');
			case 'qcow':
				return trans('QCOW (QEMU Copy-On-Write)','UIWizardNewVD');
		}	
		return m.format;
	},
	
	/**
	 * Return true if a medium format supports
	 */
	formatSupportsSplit: function(format) {
		
		var format = format.toLowerCase();
		
		var mfs = $('#vboxPane').data('vboxSystemProperties').mediumFormats;
		
		for(var i = 0; i < mfs.length; i++) {
			if(mfs[i].id.toLowerCase() == format) {
				return (jQuery.inArray('CreateSplit2G',mfs[i].capabilities) > -1);
			}
		}
		return false;
	},
	
	/**
	 * Return printable virtual hard disk variant
	 * 
	 * @static
	 */
	getHardDiskVariant: function(m) {
		
		var variants = $('#vboxPane').data('vboxMediumVariants');
		
		
/*
 * [Standard] => 0 [VmdkSplit2G] => 1 [VmdkRawDisk] => 2 [VmdkStreamOptimized] =>
 * 4 [VmdkESX] => 8 [Fixed] => 65536 [Diff] => 131072 [NoCreateDir] =>
 * 1073741824
 */
		
		switch(m.variant) {

			case variants.Standard:
	            return trans("Dynamically allocated storage", "VBoxGlobal", null, 'MediumVariant');
	        case (variants.Standard | variants.Diff):
	            return trans("Dynamically allocated differencing storage", "VBoxGlobal"), null, 'MediumVariant';
	        case (variants.Standard | variants.Fixed):
	            return trans("Fixed size storage", "VBoxGlobal", null, 'MediumVariant');
	        case (variants.Standard | variants.VmdkSplit2G):
	            return trans("Dynamically allocated storage split into files of less than 2GB", "VBoxGlobal", null, 'MediumVariant');
	        case (variants.Standard | variants.VmdkSplit2G | variants.Diff):
	            return trans("Dynamically allocated differencing storage split into files of less than 2GB", "VBoxGlobal", null, 'MediumVariant');
	        case (variants.Standard | variants.Fixed | variants.VmdkSplit2G):
	            return trans("Fixed size storage split into files of less than 2GB", "VBoxGlobal", null, 'MediumVariant');
	        case (variants.Standard | variants.VmdkStreamOptimized):
	            return trans("Dynamically allocated compressed storage", "VBoxGlobal", null, 'MediumVariant');
	        case (variants.Standard | variants.VmdkStreamOptimized | variants.Diff):
	            return trans("Dynamically allocated differencing compressed storage", "VBoxGlobal", null, 'MediumVariant');
	        case (variants.Standard | variants.Fixed | variants.VmdkESX):
	            return trans("Fixed size ESX storage", "VBoxGlobal", null, 'MediumVariant');
	        case (variants.Standard | variants.Fixed | variants.VmdkRawDisk):
	            return trans("Fixed size storage on raw disk", "VBoxGlobal", null, 'MediumVariant');
	        default:
	        	return trans("Dynamically allocated storage", "VBoxGlobal", null, 'MediumVariant');
	    }

	},

	/**
	 * Return media and drives available for attachment type
	 * 
	 * @static
	 */
	mediaForAttachmentType: function(t,children) {
	
		var media = new Array();
		
		// DVD Drives
		if(t == 'DVD') { media = media.concat($('#vboxPane').data('vboxHostDetails').DVDDrives);
		// Floppy Drives
		} else if(t == 'Floppy') { 
			media = media.concat($('#vboxPane').data('vboxHostDetails').floppyDrives);
		}
		
		// media
		return media.concat(vboxTraverse($('#vboxPane').data('vboxMedia'),'deviceType',t,true,(children ? 'children': '')));
	},

	/**
	 * Return a medium by its location
	 * 
	 * @static
	 */
	getMediumByLocation: function(p) {
		// Fix this in windows version
		if($('#vboxPane').data('vboxConfig').DSEP == '\\')
			p = p.replace('\\.','/.');
		return vboxTraverse($('#vboxPane').data('vboxMedia'),'location',p,false,'children');
	},

	/**
	 * Return a medium by its name, ignoring case and 
	 * extension
	 * 
	 * @static
	 */
	getMediumByName: function(n) {
		var meds = $('#vboxPane').data('vboxMedia');
		for(var i = 0; i < meds.length; i++) {
			if(n.toLowerCase() == meds[i].name.replace(/\.[^\.]+$/, "").toLowerCase())
				return meds[i];
		}
		return null;
	},
	
	/**
	 * Elect a new hard disk name
	 */
	electHardDiskName: function(rootName, start) {
		
		/* Go through list of media and pick new hd name */
		var number = (start ? start: 1);
		var HDname = (rootName ? rootName: 'NewVirtualDisk');
		var RetName = '';
		var found = false;
		do {
			RetName = HDname + (number++);
			found = vboxMedia.getMediumByName(RetName);		
		} while(found);
		
		return RetName;
	},

	/**
	 * Return a medium by its ID
	 * 
	 * @static
	 */
	getMediumById: function(id) {
		return vboxTraverse($('#vboxPane').data('vboxMedia').concat($('#vboxPane').data('vboxHostDetails').DVDDrives.concat($('#vboxPane').data('vboxHostDetails').floppyDrives)),'id',id,false,'children');
	},

	/**
	 * Return a printable list of machines and snapshots this a medium is
	 * attached to
	 * 
	 * @static
	 */
	attachedTo: function(m,nullOnNone) {
		var s = new Array();
		if(!m.attachedTo || !m.attachedTo.length) return (nullOnNone ? null: '<i>'+trans('Not Attached')+'</i>');
		for(var i = 0; i < m.attachedTo.length; i++) {
			s[s.length] = m.attachedTo[i].machine + (m.attachedTo[i].snapshots.length ? ' (' + m.attachedTo[i].snapshots.join(', ') + ')': '');
		}
		return s.join(', ');
	},

	/**
	 * Update recent media menu and global recent media list
	 * 
	 * @static
	 */
	updateRecent: function(m, skipPathAdd) {
		
		// Only valid media that is not a host drive or iSCSI
		if(!m || !m.location || m.hostDrive || m.format == 'iSCSI') return false;
		
	    // Update recent path
		if(!skipPathAdd) {
			vboxAjaxRequest('vboxRecentMediaPathSave',{'type':m.deviceType,'folder':vboxDirname(m.location)});
			$('#vboxPane').data('vboxRecentMediaPaths')[m.deviceType] = vboxDirname(m.location);
		}
		
		// Update recent media
		// ///////////////////////
		
		// find position (if any) in current list
		var pos = jQuery.inArray(m.location,$('#vboxPane').data('vboxRecentMedia')[m.deviceType]);		
		
		// Medium is already at first position, return
		if(pos == 0) return false;
		
		// Exists and not in position 0, remove from list
		if(pos > 0) {
			$('#vboxPane').data('vboxRecentMedia')[m.deviceType].splice(pos,1);
		}
		
		// Add to list
		$('#vboxPane').data('vboxRecentMedia')[m.deviceType].splice(0,0,m.location);
		
		// Pop() until list only contains 5 items
		while($('#vboxPane').data('vboxRecentMedia')[m.deviceType].length > 5) {
			$('#vboxPane').data('vboxRecentMedia')[m.deviceType].pop();
		}

		// Update Recent Media in background
		vboxAjaxRequest('vboxRecentMediaSave',{'type':m.deviceType,'list':$('#vboxPane').data('vboxRecentMedia')[m.deviceType]});
		
		return true;

	},
	
	/**
	 * List of actions performed on Media in phpVirtualBox
	 * 
	 * @static
	 * @namespace
	 */
	actions: {
		
		/**
		 * Choose existing medium file
		 * 
		 * @static
		 */
		choose: function(path,type,callback) {
		
			if(!path) path = $('#vboxPane').data('vboxRecentMediaPaths')[type];

			title = null;
			icon = null;
			switch(type) {
				case 'HardDisk':
					title = trans('Choose a virtual hard disk file...','UIMachineSettingsStorage');
					icon = 'images/vbox/hd_16px.png';
					break;
				case 'Floppy':
					title = trans('Choose a virtual floppy disk file...','UIMachineSettingsStorage');
					icon = 'images/vbox/fd_16px.png';
					break;
				case 'DVD':
					title = trans('Choose a virtual optical disk file...','UIMachineSettingsStorage');
					icon = 'images/vbox/cd_16px.png';
					break;					
			}
			vboxFileBrowser(path,function(f){
				if(!f) return;
				var med = vboxMedia.getMediumByLocation(f);
				if(med && med.deviceType == type) {
					vboxMedia.updateRecent(med);
					callback(med);
					return;
				} else if(med) {
					return;
				}
				var ml = new vboxLoader();
				ml.add('mediumAdd',function(ret){
					var l = new vboxLoader();
					if(ret && ret.responseData.id) {
						var med = vboxMedia.getMediumById(ret.responseData.id);
						// Not registered yet. Refresh media.
						if(!med)
							l.add('vboxGetMedia',function(dret){$('#vboxPane').data('vboxMedia',dret.responseData);});
					}
					l.onLoad = function() {
						if(ret && ret.responseData.id) {
							var med = vboxMedia.getMediumById(ret.responseData.id);
							if(med && med.deviceType == type) {
								vboxMedia.updateRecent(med);
								callback(med);
								return;
							}
						}
					};
					l.run();
				},{'path':f,'type':type});
				ml.run();
			},false,title,icon);
		} // </ choose >
	
	} // </ actions >
};



/**
 * Base Wizard class (new HardDisk, VM, etc..)
 * 
 * @class vboxWizard
 * @constructor
 */
function vboxWizard() {
	
	var self = this;

	/* Number of wizard steps */
	this.steps = 0;
	
	/* Wizard name - used to determine form name and HTML pane to load */
	this.name = '';
	
	/* Title of wizard */
	this.title = '';
	
	/* Wizard dialog icon image */
	this.icon = null;
	
	/* Width and height for Simple mode */
	this.width = 700;
	this.height = 400;
	
	/* Width and height for expert mode */
	this.widthAdvanced = 600;
	this.heightAdvanced = 450;
	
	/* Background image */
	this.bg = null;
	
	/* Text on Back button */
	this.backText = trans('Back','QIArrowSplitter');
	
	/* Text on Next button */
	this.nextText = trans('Next','QIArrowSplitter');

	/* Text on cancel button */
	this.cancelText = trans('Cancel','QIMessageBox');

	/* Text on finish button */
	this.finishText = 'Finish';
	
	/* Translation context */
	this.context = '';

	/* Arrow on back button */
	this.backArrow = $('<div />').html('&laquo;').text();

	/* Arrow on Next button */
	this.nextArrow = $('<div />').html('&raquo;').text();
	
	/* Mode of wizard */
	this.mode = 'simple';
	
	/* Data to load */
	this.data = [];
	
	/* Form object held to get values */
	this.form = null;
	
	/* Reference to dialog object created */
	this.dialog = null;
	
	/* Deferred object resolved when complete */
	this.completed = $.Deferred();
	
	/* Function to be run on cancel */
	this.onCancel = null;
	
	/* Function to run on finish */
	this.onFinish = function() {
		
		if(self.completed.state() == 'pending')
			self.completed.resolve();
		
		$(self.dialog).empty().remove();
	};
	
	/**
	 * Initialize / display wizard
	 * 
	 * @memberOf vboxWizard
	 * @name vboxWizard.run
	 * @returns {Object} deferred promise
	 */
	this.run = function() {

		// Set mode
		this.mode = (vboxGetLocalDataItem('vboxWizardMode'+this.name) == 'a' ? 'advanced': '');
		
		this.dialog = $('<div />').attr({'id':this.name+'Dialog','style':'display: none','class':'vboxWizard'});
		
		this.form = $('<form />').attr({'name':('frm'+this.name),'style':'height:100%;margin:0px;padding:0px;border:0px;'})
			.on('submit',function(e){
				self.displayNext();
				e.stopPropagation();
				e.preventDefault();
				return false;
			});

		// main table
		var tbl = $('<table />').attr({'class':'vboxWizard','style':'height: 100%; margin:0px; padding:0px;border:0px;'});
		var tr = $('<tr />');

		
		var td = $('<td />').attr({'id':this.name+'Content','class':'vboxWizardContent'});
		
		if(this.bg) {
			$(this.dialog).css({'background':'url('+this.bg+') ' + ((this.mode == 'advanced' ? this.widthAdvanced: this.width) - 360) +'px -60px no-repeat','background-color':'#fff'});				
		}
		
		// Title and content table
		$('<h3 />').attr('id',this.name+'Title').html(this.title).appendTo(td);

		$(tr).append(td).appendTo(tbl);		
		
		this.form.append(tbl);
		this.dialog.append(this.form).appendTo($('#vboxPane'));
		
		// load data and panes
		var l = new vboxLoader(this.name+'Loader');
		for(var i = 0; i < this.data.length; i++) {
			l.add(this.data[i].fn,this.data[i].callback,(this.data[i].args ? this.data[i].args: undefined));
		}
		l.addFileToDOM('panes/'+this.name+(this.mode == 'advanced' ? 'Advanced': '')+'.html',$('#'+this.name+'Content'));
		
		l.onLoad = function(){
		
			// Show / Hide description button
			if(!self.stepButtons) self.stepButtons = [];
			if(!self.noAdvanced) {
				
				self.stepButtons = jQuery.merge([{
					
					name: trans((self.mode == 'advanced' ? 'Guided Mode': 'Expert Mode'), 'UIWizard'),
					click: function() {
						
						// Unbind any old resize handlers
						$('#'+self.name+'Dialog').off('dialogresizestop');
						
						// Check mode
						if(self.mode != 'advanced') {
							
							// Now in advanced mode
							self.mode = 'advanced';
							
							// Hide title, remove current content and add
							// advanced content
							$('#'+self.name+'Title').hide().siblings().empty().remove();
							
							// Hold old number of steps
							self.simpleSteps = self.steps;
							
							// resize dialog
							$('#'+self.name+'Dialog').dialog('option', 'width', self.widthAdvanced)
							.dialog('option', 'height', self.heightAdvanced)
							.css({'background':'url('+self.bg+') ' + ((self.mode == 'advanced' ? self.widthAdvanced: self.width) - 360) +'px -60px no-repeat','background-color':'#fff'});
							
							
							
							var vl = new vboxLoader();
							vl.addFileToDOM('panes/'+self.name+'Advanced.html',$('#'+self.name+'Content'));
							vl.onLoad = function() {
								
								// Change this button text
								$('#'+self.name+'Dialog').parent().find('.ui-dialog-buttonpane').find('span:contains("'+trans('Expert Mode', 'UIWizard')+'")')
								.html(trans('Guided Mode', 'UIWizard'));
								
								for(var i = 0; i < self.stepButtons.length; i++) {
									if(self.stepButtons[i].name == trans('Expert Mode', 'UIWizard')) {
										self.stepButtons[i].name = trans('Guided Mode', 'UIWizard');
									}
									
								}
								
								// Hide back button
								$('#'+self.name+'Dialog').parent().find('.ui-dialog-buttonpane').find('span:contains("'+self.backArrow + ' '+self.backText+'")').parent().hide();
								
								// Translations and setup
								vboxInitDisplay(self.name+'Content',self.context);
								
								self.steps = 1;
								
								// Go to last step
								self.displayStep(1);
								
								$('#'+self.name+'Dialog').parent().find('.ui-dialog-buttonpane').find('span:contains("'+self.finishText+'")').parent().focus();
								
							};
							vl.run();
							
						} else {
							
							// Now in simple mode
							self.mode = 'simple';
							
							// Remove current content and show simple content
							$('#'+self.name+'Title').show().siblings().empty().remove();
							
							// resize dialog
							$('#'+self.name+'Dialog').dialog('option', 'width', self.width)
								.dialog('option', 'height', self.height)
								.css({'background':'url('+self.bg+') ' + ((self.mode == 'advanced' ? self.widthAdvanced: self.width) - 360) +'px -60px no-repeat','background-color':'#fff'});
							
							
							// Reset old number of steps
							self.steps = self.simpleSteps;
							
							var vl = new vboxLoader();
							vl.addFileToDOM('panes/'+self.name+'.html',$('#'+self.name+'Content'));
							vl.onLoad = function() {
								
								// Change this button text
								$('#'+self.name+'Dialog').parent().find('.ui-dialog-buttonpane')
								.find('span:contains("'+trans('Guided Mode', 'UIWizard')+'")')
								.html(trans('Expert Mode', 'UIWizard'));
								
								for(var i = 0; i < self.stepButtons.length; i++) {
									if(self.stepButtons[i].name == trans('Guided Mode', 'UIWizard')) {
										self.stepButtons[i].name = trans('Expert Mode', 'UIWizard');
									}
									
								}
								
								// Translations
								vboxInitDisplay(self.name+'Content',self.context);
								
								// Show back button
								$('#'+self.name+'Dialog').parent().find('.ui-dialog-buttonpane').find('span:contains("'+self.backArrow + ' '+self.backText+'")').parent().show();
								
								self.steps = self.simpleSteps;
								
								self.displayStep(1);
								
								$('#'+self.name+'Dialog').parent().find('.ui-dialog-buttonpane').find('span:contains("'+self.nextArrow+'")').parent().focus();

								
							};
							vl.run();
						}
						
						vboxSetLocalDataItem('vboxWizardMode'+self.name, (self.mode == 'advanced' ? 'a': ''));
						
						
					},
					steps: [1]
				}], self.stepButtons);
				
			}
			
			
			// buttons
			var buttons = { };
			
			if(self.stepButtons) {
				for(var i = 0; i < self.stepButtons.length; i++) {
					buttons[self.stepButtons[i].name] = self.stepButtons[i].click;
				}
			}
			
			if(!self.noAdvanced || self.steps > 1)
				buttons[self.backArrow + ' '+self.backText] = self.displayPrev;
			
			buttons[(self.steps > 1 ? self.nextText +' '+self.nextArrow: self.finishText)] = self.displayNext;
			buttons[self.cancelText] = self.cancel;
			
			// Translations
			vboxInitDisplay(self.name+'Content',self.context);
			
			$(self.dialog).dialog({
				'closeOnEscape':true,
				'width':(self.mode == 'advanced' ? self.widthAdvanced: self.width),
				'height':(self.mode == 'advanced' ? self.heightAdvanced: self.height),
				'buttons':buttons,
				'modal':true,
				'autoOpen':true,
				'stack':true,
				'dialogClass':'vboxDialogContent vboxWizard',
				'open': function() {
					$('#'+self.name+'Dialog').parent().find('.ui-dialog-buttonpane').find('span:contains("'+self.nextArrow+'")').parent().focus();
				},
				'title':(self.icon ? '<img src="images/vbox/'+self.icon+ ( (self.icon.indexOf('.png') == -1) ? '_16px.png': '') +'" class="vboxDialogTitleIcon" /> ': '') + self.title
			
			}).on('dialogclose', function(){

				// Reject if still pending
				if(self.completed.state() == 'pending')
					self.completed.reject();

				$(this).empty().remove();
				
			}).on('keyup',function(e) {
			    
				if (e.keyCode == 13) {
			    	
					self.displayNext();
					e.stopPropagation();
					e.preventDefault();
					return false;
			    }
			});

			// Setup if in advanced mode
			if(self.mode == 'advanced') {
			
				// Hold old number of steps
				self.simpleSteps = self.steps;
				self.steps = 1;
				
				// Hide title
				$('#'+self.name+'Title').hide();
				
				// Hide back button
				$('#'+self.name+'Dialog').parent().find('.ui-dialog-buttonpane').find('span:contains("'+self.backArrow + ' '+self.backText+'")').parent().hide();
			}
			
			self.displayStep(1);
		};
		l.run();
		
		return self.completed.promise();
	};
	
	/**
	 * Cancel wizard
	 * 
	 * @memberOf vboxWizard
	 */
	this.cancel = function() {

		// Check for onCancel function
		if(self.onCancel) {
			self.onCancel();
		}
		
		// Reject if still pending
		if(self.completed.state() == 'pending')
			self.completed.reject();

		$(self.dialog).empty().remove();
	};
	
	/**
	 * Display a step
	 * 
	 * @memberOf vboxWizard
	 * @param {Integer}
	 *            step - step to display
	 */
	this.displayStep = function(step) {
		self._curStep = step;
		for(var i = 0; i < self.steps; i++) {
			$('#'+self.name+'Step'+(i+1)).css({'display':'none'});
		}
		/* update buttons */
		if(self.stepButtons) {
			for(var i = 0; i < self.stepButtons.length; i++) {
				$('#'+self.name+'Dialog').parent().find('.ui-dialog-buttonpane').find('span:contains("'+self.stepButtons[i].name+'")').parent().css({'display':((step == self.steps && self.stepButtons[i].steps[0]==-1) || jQuery.inArray(step,self.stepButtons[i].steps) > -1 ? '': 'none')});
			}
		}
		if(step == 1 && step != self.steps) {
			$('#'+self.name+'Dialog').parent().find('.ui-dialog-buttonpane').find('span:contains("'+self.backText+'")').parent().addClass('disabled').blur();
			$('#'+self.name+'Dialog').parent().find('.ui-dialog-buttonpane').find('span:contains("'+self.finishText+'")').html($('<div />').text((self.steps > 1 ? self.nextText+' '+self.nextArrow: self.finishText)).html());
		} else {
			
			$('#'+self.name+'Dialog').parent().find('.ui-dialog-buttonpane').find('span:contains("'+self.backText+'")').parent().removeClass('disabled');
			
			if(step == self.steps) {
				$('#'+self.name+'Dialog').parent().find('.ui-dialog-buttonpane').find('span:contains("'+self.nextArrow+'")').html($('<div />').text(self.finishText).html());
			} else {
				$('#'+self.name+'Dialog').parent().find('.ui-dialog-buttonpane').find('span:contains("'+self.finishText+'")').html($('<div />').text(self.nextText+' '+self.nextArrow).html());
			}
		}
		$('#'+self.name+'Title').html(trans($('#'+self.name+'Step'+step).attr('title'),self.context));
		$('#'+self.name+'Step'+step).css({'display':''});

		$('#'+self.name+'Step'+step).trigger('show',self);

	};
	
	/**
	 * Set current wizard step to be the last step in list
	 * 
	 * @memberOf vboxWizard
	 */
	this.setLast = function() {
		$('#'+self.name+'Dialog').parent().find('.ui-dialog-buttonpane').find('span:contains("'+self.nextText+'")').html($('<div />').text(self.finishText).html());
		self._origSteps = self.steps;
		self.steps = self._curStep;
	};

	/**
	 * Unset the current wizard step so that it is not forced to be the last one
	 * in the list
	 * 
	 * @memberOf vboxWizard
	 */
	this.unsetLast = function() {
		$('#'+self.name+'Dialog').parent().find('.ui-dialog-buttonpane').find('span:contains("'+self.finishText+'")').html($('<div />').text(self.nextText+' '+self.nextArrow).html());
		if(self._origSteps) self.steps = self._origSteps;
	};
	
	/**
	 * Display previous step
	 * 
	 * @memberOf vboxWizard
	 */
	this.displayPrev = function() {
		if(self._curStep <= 1) return;
		self.displayStep(self._curStep - 1);
	};
	
	/**
	 * Display next step
	 * 
	 * @memberOf vboxWizard
	 */
	this.displayNext = function() {
		if(self._curStep >= self.steps) {
			self.onFinish();
			return;
		}
		self.displayStep(self._curStep + 1);
	};
	
}

/**
 * Common toolbar class
 * 
 * @constructor
 * @class vboxToolbar
 * @options {Object}
 *      buttons - buttons to add to toolbar
 *      language_context - context to use for translations
 *      renderTo - element to render to
 *      buttonStyle - CSS to add to button elements
 *      size - size of button elements
 */
function vboxToolbar(options) {

	var self = this;
	this.buttons = options.buttons;
	this.size = options.size ? options.size : 22;
	this.addHeight = 24;
	this.lastItem = null;
	this.buttonStyle = options.buttonStyle;
	this.enabled = true;
	this.mutliSelect = false; // true if multiple items are selected
	this._buttonElements = {}; // button elements by name
	this.language_context = options.language_context;

	/**
	 * Add buttons to this object
	 * @param {Array} buttons - buttons to add to toolbar
	 */
	this.addButtons = function(buttons) {
		this.buttons = buttons;
	}
	
	/**
	 * Update buttons to be enabled / disabled
	 * 
	 * @memberOf vboxToolbar
	 * @param {Object|Null}
	 *            item - item to check
	 */
	this.update = function(item) {
		
		// Event target or manually passed item
		self.lastItem = item;
		
		if(!self.enabled) return;
		
		for(var i = 0; i < self.buttons.length; i++) {
			if(self.buttons[i].enabled && !self.buttons[i].enabled(self.lastItem)) {
				self.disableButton(self.buttons[i]);
			} else {
				self.enableButton(self.buttons[i]);
			}
		}		
	};

	/**
	 * Enable entire toolbar. Calls self.update()
	 * 
	 * @memberOf vboxToolbar
	 * @param {Object}
	 *            e - event
	 * @param {Object}
	 *            item - item to pass to update
	 */ 
	this.enable = function(e, item) {
		self.enabled = true;
		self.update((item||self.lastItem));
	};

	/**
	 * Disable entire toolbar
	 * 
	 * @memberOf vboxToolbar
	 */
	this.disable = function() {
		self.enabled = false;
		for(var i = 0; i < self.buttons.length; i++) {
			self.disableButton(self.buttons[i]);
		}		
	};
	
	/**
	 * Enable a single button
	 * 
	 * @memberOf vboxToolbar
	 * @param {Object}
	 *            b - button to enable
	 */
	this.enableButton = function(b) {
		this._buttonElements[b.name].addClass('vboxEnabled').removeClass('vboxDisabled disabled').children('img.vboxToolbarImg').attr('src','images/vbox/'+b.icon+'_'+self.size+'px.png');
	};

	/**
	 * Disable a single button
	 * 
	 * @memberOf vboxToolbar
	 * @param {Object}
	 *            b - button to disable
	 */
	this.disableButton = function(b) {
		this._buttonElements[b.name].addClass('vboxDisabled disabled').removeClass('vboxEnabled').children('img.vboxToolbarImg').attr('src','images/vbox/'+b.icon+'_disabled_'+self.size+'px.png').trigger('mouseleave');
	};

	/**
	 * Set button label
	 * 
	 * @memberOf vboxToolbar
	 * @param {String}
	 *            bname - name of button to set label for
	 * @param {String}
	 *            l - new label for button
	 */
	this.setButtonLabel = function(bname,l) {
		this._buttonElements[b.name].find('span.vboxToolbarButtonLabel').html(l);
	};
	
	/**
	 * Return the button element by name
	 * 
	 * @param {String}
	 *            bname - button name
	 * @returns {HTMLNode}
	 */
	this.getButtonElement = function(bname) {
		return this._buttonElements[bname]
	};
	
	/**
	 * Generate HTML element for button
	 * 
	 * @memberOf vboxToolbar
	 * @param {Object}
	 *            b - button object containing various button parameters
	 * @return {HTMLNode} button element
	 */
	this.buttonElement = function(b) {

		// Pre-load disabled version of icon if enabled function exists
		if(b.enabled) {
			var a = new Image();
			a.src = "images/vbox/"+b.icon+"_disabled_"+self.size+"px.png";
		}
		
		// TD
		var label = String(trans(b.toolbar_label ? b.toolbar_label: b.label, b.language_context ? b.language_context : self.language_context)).replace(/\.+$/g,'')
		var td = $('<td />').attr({'class':'vboxToolbarButton ui-corner-all vboxEnabled vboxToolbarButton'+self.size,
			'style':self.buttonStyle+'; min-width: '+(self.size+12)+'px;'
		}).html('<img src="images/vbox/'+b.icon+'_'+self.size+'px.png" class="vboxToolbarImg" style="height:'+self.size+'px;width:'+self.size+'px;"/><br /><span class="vboxToolbarButtonLabel">' + label +'</span>').on('click',function(){
			if($(this).hasClass('vboxDisabled')) return;
			$(this).data('toolbar').click($(this).data('name'));
		// store data
		}).data(b);
		
		if(!self.noHover) {
			$(td).hover(
					function(){if($(this).hasClass('vboxEnabled')){$(this).addClass('vboxToolbarButtonHover');}},
					function(){$(this).removeClass('vboxToolbarButtonHover');}		
			).mousedown(function(e){
				if($.browser.msie && e.button == 1) e.button = 0;
				if(e.button != 0 || $(this).hasClass('vboxDisabled')) return true;
				$(this).addClass('vboxToolbarButtonDown');

				var e = jQuery.Event("mouseup", {button:0});
				$(this).siblings().trigger(e);
				
				var btn = $(this);
				$(document).one('mouseup',function(){
					$(btn).removeClass('vboxToolbarButtonDown');
				});
			});
		}
		
		return td;
		
	};

	/**
	 * Render buttons to HTML node where id = id param
	 * 
	 * @memberOf vboxToolbar
	 * @param {String|Object}
	 *            node - HTMLNode or id to add buttons to
	 */
	this.renderTo = function(node) {
		
		if(typeof(node) == 'string') {
			node = $('#'+node);	
		}
		
		self.height = self.size + self.addHeight; 
		
		// Create table
		var tbl = $('<table />').attr({'class':'vboxToolbar vboxToolbar'+this.size});
		var tr = $('<tr />');
		
		for(var i = 0; i < self.buttons.length; i++) {
			
			if(self.buttons[i].separator) {
				$('<td />').attr({'class':'vboxToolbarSeparator'}).html('<br />').appendTo(tr);
			}

			self.buttons[i].toolbar = self;
			self._buttonElements[self.buttons[i].name] = self.buttonElement(self.buttons[i]);
			$(tr).append(self._buttonElements[self.buttons[i].name]);
			

		}

		$(tbl).append(tr);
		$(node).append(tbl).addClass('vboxToolbar vboxToolbar'+this.size).on('disable',self.disable).on('enable',self.enable);
		
		// If button can be enabled / disabled, disable by default
		for(var i = 0; i < self.buttons.length; i++) {
			if(self.buttons[i].enabled) {
				self.disableButton(self.buttons[i]);
			}
		}
		
		return this;
	};

	/**
	 * Return button by name
	 * 
	 * @memberOf vboxToolbar
	 * @param {String}
	 *            n - button name
	 * @return {Object} button
	 */ 
	this.getButtonByName = function(n) {
		for(var i = 0; i < self.buttons.length; i++) {
			if(self.buttons[i].name == n)
				return self.buttons[i];
		}
		return null;
	};
	
	/**
	 * Trigger click event on button who's name = btn param
	 * 
	 * @memberOf vboxToolbar
	 * @param {String}
	 *            btn - name of button
	 * @return return value of .click() function performed on button
	 */
	this.click = function(btn) {
		var b = self.getButtonByName(btn);
		return b.click(btn);
	};

   if(options.renderTo)
        this.renderTo(options.renderTo);

}

/**
 * Toolbar class for single button
 *
 * @constructor
 * @class vboxToolbarSmall
 * @super vboxToolbar
 * @param {Object} options
 *      button - button for toolbar
 *      language_context - language context to use for translations
 *      renderTo - element to render toolbar to
 *     
*/
function vboxToolbarSingle(options) {

	this.parentClass = vboxToolbarSmall;
	options.buttons = [options.button]
	renderTo = options.renderTo
	options.renderTo = undefined
	this.parentClass(options);
	this._buttonElement = this.buttonElement; /* copy orig */

	/**
	 * Generate HTML element for button
	 * 
	 * @memberOf vboxToolbarSingle
	 * @param {Object}
	 *            b - button object containing various button parameters
	 * @return {HTMLNode} button element
	 */
	this.buttonElement = function(b) {
	    var label = trans(b.toolbar_label ? b.toolbar_label: b.label, b.language_context ? b.language_context : self.language_context)
		return this._buttonElement(b).attr({'title': label});
	}
	
	if(renderTo)
	    this.renderTo(renderTo);
}

/**
 * Toolbar class for a small toolbar
 * 
 * @constructor
 * @class vboxToolbarSmall
 * @super vboxToolbar
 * @param {Options}
 *            buttons - list of buttons for toolbar
 *            language_context - context to use for translations
 *            renderTo - element to render to
 *            buttonStyle - style to use for button elements
 *            noHover - do not add hover styling
 *            size - button size
 */
function vboxToolbarSmall(options) {

	var self = this;
	this.buttonStyle = options.buttonStyle;
	this.buttonCSS = {};

	renderTo = options.renderTo
    options.renderTo = undefined

	this.parentClass = vboxToolbar;
	this.parentClass(options);
	this.selected = null;
	this.lastItem = null;
	this.enabled = true;
	this.size = options.size ? options.size : 16;
	this.disabledString = 'disabled';
	this.noHover = options.noHover;
	this.language_context = options.language_context;

	/**
	 * Enable a single button
	 * 
	 * @memberOf vboxToolbarSmall
	 * @param {Object}
	 *            b - button to enable
	 * @return null
	 */
	this.enableButton = function(b) {
		if(b.noDisabledIcon)
			this._buttonElements[b.name].css('display','').prop('disabled',false);
		else
			this._buttonElements[b.name].css('background-image','url(images/vbox/' + b.icon + '_'+self.size+'px.png)').prop('disabled',false);
	};
	/**
	 * Disable a single button
	 * 
	 * @memberOf vboxToolbarSmall
	 * @param {Object}
	 *            b - button to disable
	 * @return null
	 */
	this.disableButton = function(b) {
		if(b.noDisabledIcon)
			this._buttonElements[b.name].css('display','none').prop('disabled',false).removeClass('vboxToolbarSmallButtonHover').addClass('vboxToolbarSmallButton').trigger('mouseleave');
		else
			this._buttonElements[b.name].css('background-image','url(images/vbox/' + b.icon + '_'+self.disabledString+'_'+self.size+'px.png)').prop('disabled',true).removeClass('vboxToolbarSmallButtonHover').addClass('vboxToolbarSmallButton').trigger('mouseleave');
	};

	/**
	 * Add CSS to be applied to button
	 * 
	 * @param {String}
	 *            b button name
	 * @param {Object}
	 *            css css to be applied to button
	 */
	this.addButtonCSS = function(b, css) {
		self.buttonCSS[b] = css;
	};
	
	/**
	 * Generate HTML element for button
	 * 
	 * @memberOf vboxToolbarSmall
	 * @param {Object}
	 *            b - button object containing various button parameters
	 * @return {HTMLNode} button element
	 */
	this.buttonElement = function(b) {

		// Pre-load disabled version of icon if enabled function exists
		if(b.enabled && !b.noDisabledIcon) {
			var a = new Image();
			a.src = "images/vbox/" + b.icon + '_'+self.disabledString+'_'+self.size+'px.png';
		}

		var label = String(trans(b.toolbar_label ? b.toolbar_label: b.label, b.language_context ? b.language_context : self.language_context)).replace(/\.+$/g,'')
		var btn = $('<input />').attr({'type':'button','value':'',
			'class': 'vboxImgButton vboxToolbarSmallButton ui-corner-all',
			'title': label,
			'style': self.buttonStyle+' background-image: url(images/vbox/' + b.icon + '_'+self.size+'px.png);'
		}).click(b.click);		
		
		if(!self.noHover) {
			$(btn).hover(
					function(){if(!$(this).prop('disabled')){$(this).addClass('vboxToolbarSmallButtonHover').removeClass('vboxToolbarSmallButton');}},
					function(){$(this).addClass('vboxToolbarSmallButton').removeClass('vboxToolbarSmallButtonHover');}		
			);
		
		}
		
		// Check for button specific CSS
		if(self.buttonCSS[b.name]) btn.css(self.buttonCSS[b.name]);
		
		return btn;
		
	};

	/**
	 * Render buttons to HTML node where id = id param
	 * 
	 * @memberOf vboxToolbarSmall
	 * @param {String|Object}
	 *            targetElm - HTMLNode or id to add buttons to
	 * @return null
	 */
	this.renderTo = function(targetElm) {
		
		if(typeof(targetElm) == 'string') {
			targetElm = $('#'+targetElm);
		}
		
		if(!self.buttonStyle)
			self.buttonStyle = 'height: ' + (self.size+8) + 'px; width: ' + (self.size+8) + 'px; ';
		
		for(var i = 0; i < self.buttons.length; i++) {
			
			if(self.buttons[i].separator) {
				$(targetElm).append($('<hr />').attr({'style':'display: inline','class':'vboxToolbarSmall vboxSeparatorLine'}));
			}

			this._buttonElements[self.buttons[i].name] = self.buttonElement(self.buttons[i]);
			$(targetElm).append(this._buttonElements[self.buttons[i].name]); 
				
		}

		$(targetElm).attr({'name':self.name}).addClass('vboxToolbarSmall vboxEnablerTrigger vboxToolbarSmall'+self.size).on('disable',self.disable).on('enable',self.enable);

		return this;
		
	};

   if(renderTo)
        this.renderTo(renderTo);

}

/**
 * Media menu button class
 * 
 * @constructor
 * @class vboxButtonMediaMenu
 * @param {String} type - type of media to display
 * @param {Function} callback - callback to run when media is selected
 * @param {String} mediumPath - path to use when selecting media
 */
function vboxButtonMediaMenu(type,callback,mediumPath) {
	
	var self = this;
	this.buttonStyle = '';
	this.enabled = true;
	this.size = 16;
	this.disabledString = 'disabled';
	this.type = type;
	this.lastItem = null;
	this._buttonElement = null; // holds button node
	
	/** vboxMediaMenu to display when button is clicked */
	this.mediaMenu = new vboxMediaMenu(type, callback, mediumPath);
	
	/* Static button type list */
	this.buttons = {
			
		HardDisk: {
			name: 'mselecthdbtn',
			label: 'Set up the virtual hard disk',
			language_context: 'UIMachineSettingsStorage',
			icon: 'hd',
			click: function () {
				return;				
			}
		},
		
		DVD: {
			name: 'mselectcdbtn',
			label: 'Set up the virtual optical drive',
			language_context: 'UIMachineSettingsStorage',
			icon: 'cd',
			click: function () {
				return;				
			}
		},
	
		Floppy: {
			name: 'mselectfdbtn',
			label: 'Set up the virtual floppy drive',
			language_context: 'UIMachineSettingsStorage',
			icon: 'fd',
			click: function () {
				return;				
			}
		}
	};
	
	// Set button based on passed type
	this.button = self.buttons[self.type];

	/**
	 * Update button to be enabled / disabled
	 * 
	 * @memberOf vboxButtonMediaMenu
	 * @param {Object|Null}
	 *            target - item to test in button's enabled() fuction
	 * @param {Object|Null}
	 *            item - item to test in button's enabled() fuction
	 * @return null
	 */
	this.update = function(target,item) {
		
		if(!self.enabled) return;
		
		self.lastItem = (item||target);
		
		if(self.button.enabled && !self.button.enabled(self.lastItem)) {
			self.disableButton();
		} else {
			self.enableButton();
		}
	};
	/**
	 * Enable this button
	 * 
	 * @memberOf vboxButtonMediaMenu
	 * @return null
	 */
	this.enableButton = function() {
		var b = self.button;
		this._buttonElement.css('background-image','url(images/vbox/' + b.icon + '_'+self.size+'px.png)').removeClass('vboxDisabled').html('<img src="images/downArrow.png" style="margin:0px;padding:0px;float:right;width:6px;height:6px;" />');
	};
	/**
	 * Disable this button
	 * 
	 * @memberOf vboxButtonMediaMenu
	 * @return null
	 */
	this.disableButton = function() {
		var b = self.button;
		this._buttonElement.css('background-image','url(images/vbox/' + b.icon + '_'+self.disabledString+'_'+self.size+'px.png)').removeClass('vboxToolbarSmallButtonHover').addClass('vboxDisabled').html('').trigger('mouseleave');
	};

	/**
	 * Enable button and menu
	 * 
	 * @memberOf vboxButtonMediaMenu
	 * @param {Object} e event object
	 * @param {Mixed} item test item passed to buttons .enabled() functions
	 * @return null
	 */
	this.enable = function(e, item) {
		self.enabled = true;
		self.update((item||self.lastItem));
		self.getButtonElm().enableContextMenu();
	};

	/**
	 * Disable button and menu
	 * 
	 * @memberOf vboxButtonMediaMenu
	 * @return null
	 */
	this.disable = function() {
		self.enabled = false;
		self.disableButton();
		self.getButtonElm().disableContextMenu();
	};
	
	
	/**
	 * Generate HTML element for button
	 * 
	 * @memberOf vboxButtonMediaMenu
	 * @return {HTMLNode}
	 */
	this.buttonElement = function() {

		var b = self.button;
		
		// Pre-load disabled version of icon if enabled function exists
		if(b.enabled) {
			var a = new Image();
			a.src = "images/vbox/" + b.icon + "_" + self.disabledString + "_" + self.size + "px.png";
		}
		var label = trans(b.label, b.language_context);
		return $('<td />').attr({'type':'button','value':'',
			'class': 'vboxImgButton vboxToolbarSmallButton vboxButtonMenuButton ui-corner-all',
			'title': label,
			'style': self.buttonStyle+' background-image: url(images/vbox/' + b.icon + '_'+self.size+'px.png);text-align:right;vertical-align:bottom;'
		}).click(function(e){
			if($(this).hasClass('vboxDisabled')) return;
			$(this).addClass('vboxButtonMenuButtonDown');
			var tbtn = $(this);
			e.stopPropagation();
			e.preventDefault();
			$(document).one('mouseup',function(){
				$(tbtn).removeClass('vboxButtonMenuButtonDown');
			});
		}).html('<img src="images/downArrow.png" style="margin:0px;padding:0px;float:right;width:6px;height:6px;" />').hover(
					function(){if(!$(this).hasClass('vboxDisabled')){$(this).addClass('vboxToolbarSmallButtonHover');}},
					function(){$(this).removeClass('vboxToolbarSmallButtonHover');}		
		);
		
		
	};
	
	/**
	 * Return a jquery object containing button element.
	 * 
	 * @memberOf vboxButtonMediaMenu
	 * @return {Object} jQuery object containing button element
	 */
	this.getButtonElm = function () {
		return this._buttonElement;
	};

	/**
	 * Render button to element with id
	 * 
	 * @memberOf vboxButtonMediaMenu
	 * @param {String|Object}
	 *            targetElm - HTMLNode node or id to add button to
	 */
	this.renderTo = function(targetElm) {
		
		if(typeof(targetElm) == 'string')
			targetElm = $('#'+targetElm);
		
		if(!self.buttonStyle)
			self.buttonStyle = 'height: ' + (self.size + ($.browser.msie || $.browser.webkit ? 3: 7)) + 'px; width: ' + (self.size+10) + 'px; ';
		
		this._buttonElement = self.buttonElement(); 
		
		var tbl = $('<table />').attr({'style':'border:0px;margin:0px;padding:0px;'+self.buttonStyle});
		$('<tr />').css({'vertical-align':'bottom'}).append(this._buttonElement).appendTo(tbl);
		
		$(targetElm).attr({'name':self.name}).addClass('vboxToolbarSmall vboxButtonMenu vboxEnablerTrigger').on('disable',self.disable).on('enable',self.enable).append(tbl);
		
		// Generate and attach menu
		self.mediaMenu.menuElement();
		
		self.getButtonElm().contextMenu({
	 		menu: self.mediaMenu.menu_id(),
	 		mode:'menu',
	 		button: 0
	 	},self.mediaMenu.menuCallback);
		
		
	};
	
	/**
	 * Update media menu
	 * 
	 * @see vboxMediaMenu.menuUpdateMedia
	 */
	this.menuUpdateMedia = self.mediaMenu.menuUpdateMedia;

}

/**
 * Media menu class
 * 
 * @constructor
 * @class vboxMediaMenu
 * @param {String}
 *            type - type of media to display
 * @param {Function}
 *            callback - callback function to run when medium is selected
 * @param {String}
 *            mediumPath - path to use when selecting media
 */
function vboxMediaMenu(type,callback,mediumPath) {

	var self = this;
	this.type = type;
	this.callback = callback;
	this.mediumPath = mediumPath;
	this.removeEnabled = true;
	
	/**
	 * Generate menu element ID
	 * 
	 * @memberOf vboxMediaMenu
	 * @return {String} string to use for menu node id
	 */
	this.menu_id = function(){
		return 'vboxMediaListMenu'+self.type;
	};
		
	/**
	 * Generate menu element
	 * 
	 * @memberOf vboxMediaMenu
	 * @return {HTMLNode} menu element
	 */
	this.menuElement = function() {
		
		// Pointer already held
		if(self._menuElm) return self._menuElm;
		
		var id = self.menu_id();
		
		// Hold pointer
		self._menu = new vboxMenu({'name': id, 'id': id});
		
		// Add menu
		self._menu.addMenu(self.menuGetDefaults());
		
		// Update recent list
		self.menuUpdateRecent();
		
		self._menu.update();
		
		self._menuElm = $('#'+self.menu_id());
		
		return self._menuElm;
	};
	
	/**
	 * Generate and return host drives
	 * 
	 * @memberOf vboxMediaMenu
	 * @return {Array} array of objects that can be added to menu
	 */
	this.menuGetDrives = function() {
		
		var menu = [];
		
		// Add host drives
		var meds = vboxMedia.mediaForAttachmentType(self.type);
		for(var i =0; i < meds.length; i++) {
			if(!meds[i].hostDrive) continue;
			menu[menu.length] = {'name':meds[i].id,'label':vboxMedia.getName(meds[i])};
		}
		
		return menu;
		
	};
	
	
	/**
	 * List of default menu items to use for media of type self.type
	 * 
	 * @memberOf vboxMediaMenu
	 * @return {Array} List of default menu items to use for media of type
	 *         self.type
	 */
	this.menuGetDefaults = function () {
		
		menus = [];
		
		switch(self.type) {
			
			// HardDisk defaults
			case 'HardDisk':
		
				// create hard disk
				menus[menus.length] = {'name':'createD','icon':'hd_new','label':trans('Create a new hard disk...','UIMachineSettingsStorage')};

				// choose hard disk
				menus[menus.length] = {'name':'chooseD','icon':'select_file','label':trans('Choose a virtual hard disk file...','UIMachineSettingsStorage')};
				
				// Add VMM?
				if($('#vboxPane').data('vboxConfig').enableAdvancedConfig) {
					menus[menus.length] = {'name':'vmm','icon':'diskimage','label':trans('Virtual Media Manager...','UIActionPool')};
				}

				// recent list place holder
				menus[menus.length] = {'name':'vboxMediumRecentBefore','cssClass':'vboxMediumRecentBefore','enabled':function(){return false;},'hide_on_disabled':true};
								
				break;
				
			// CD/DVD Defaults
			case 'DVD':
				
				// Choose disk image
				menus[menus.length] = {'name':'chooseD','icon':'select_file','label':trans('Choose a virtual optical disk file...','UIMachineSettingsStorage')};

				// Add VMM?
				if($('#vboxPane').data('vboxConfig').enableAdvancedConfig) {
					menus[menus.length] = {'name':'vmm','icon':'diskimage','label':trans('Virtual Media Manager...','UIActionPool')};
				}
				
				// Add host drives
				menus = menus.concat(self.menuGetDrives());
								
				// Add remove drive
				menus[menus.length] = {'name':'removeD','icon':'cd_unmount','cssClass':'vboxMediumRecentBefore',
						'label':trans('Remove disk from virtual drive','UIMachineSettingsStorage'),'separator':true,
						'enabled':function(){return self.removeEnabled;}};

				break;
			
			// Floppy defaults
			default:

				// Choose disk image
				menus[menus.length] = {'name':'chooseD','icon':'select_file','label':trans('Choose a virtual floppy disk file...','UIMachineSettingsStorage')};

				// Add VMM?
				if($('#vboxPane').data('vboxConfig').enableAdvancedConfig) {
					menus[menus.length] = {'name':'vmm','icon':'diskimage','label':trans('Virtual Media Manager...','UIActionPool')};
				}
				
				// Add host drives
				menus = menus.concat(self.menuGetDrives());

				// Add remove drive
				menus[menus.length] = {'name':'removeD','icon':'fd_unmount','cssClass':'vboxMediumRecentBefore',
						'label':trans('Remove disk from virtual drive','UIMachineSettingsStorage'),'separator':true,
						'enabled':function(){return self.removeEnabled;}};

				break;
								
		}
		
		return menus;
		
	};

	/**
	 * Update "recent" media list menu items
	 * 
	 * @memberOf vboxMediaMenu
	 */
	this.menuUpdateRecent = function() {
		
		var elm = $('#'+self.menu_id());
		var list = $('#vboxPane').data('vboxRecentMedia')[self.type];
		elm.children('li.vboxMediumRecent').remove();
		var ins = elm.children('li.vboxMediumRecentBefore').last();
		for(var i = 0; i < list.length; i++) {
			if(!list[i]) continue;
			if(!vboxMedia.getMediumByLocation(list[i])) continue;
			
			$('<li />').attr({'class':'vboxMediumRecent'}).append(
					$('<a />').attr({
						'href': '#path:'+list[i],
						'title': list[i]
					}).text(vboxBasename(list[i]))
			).insertBefore(ins);
		}
	};
		
	/**
	 * Update media checkbox and "remove image from disk" menu item
	 * 
	 * @memberOf vboxMediaMenu
	 * @param {String}
	 *            medium - medium attached to controller
	 * @return null
	 */
	this.menuUpdateMedia = function(medium) {
		self.removeEnabled = (medium ? true: false);
		if(!self._menu) self.menuElement();
		else self._menu.update();
		// Remove all 'attached' spans
		var elm = $('#'+self.menu_id());
		$(elm).find('a.vboxCheckMark').removeClass('vboxCheckMark').children('span.vboxCheckMark').remove();
		if(medium) {
			if(medium.hostDrive) {
				$(elm).find('a[href="#'+medium.id+'"]').addClass('vboxCheckMark').prepend($('<span />').attr({'class':'vboxCheckMark'}).html('&#x2713;'));
			} else {
				$(elm).find('a[href="#path:'+medium.location+'"]').addClass('vboxCheckMark').prepend($('<span />').attr({'class':'vboxCheckMark'}).html('&#x2713;'));				
			}
		}
	};
	
	/**
	 * Update recent media menu and global recent media list
	 * 
	 * @memberOf vboxMediaMenu
	 * @param {Object}
	 *            m - medium object
	 * @param {Boolean}
	 *            skipPathAdd - don't add medium's path to vbox's list of recent
	 *            media paths
	 */
	this.updateRecent = function(m, skipPathAdd) {
		
		if(vboxMedia.updateRecent(m, skipPathAdd)) { // returns true if
														// recent media list has
														// changed
			// Update menu
			self.menuUpdateRecent();
		}
	};
	
	/**
	 * Function called when menu item is selected
	 * 
	 * @memberOf vboxMediaMenu
	 * @param {String}
	 *            action - menu item's href value (text in a href="#...")
	 */
	this.menuCallback = function(action) {
		
		switch(action) {
		
			// Create hard disk
			case 'createD':
				$.when(new vboxWizardNewHDDialog({'path':(self.mediumPath ? self.mediumPath: $('#vboxPane').data('vboxRecentMediaPaths')[self.type])+$('#vboxPane').data('vboxConfig').DSEP}).run())
					.done(function(id){
						if(!id) return;
						var med = vboxMedia.getMediumById(id);
						self.callback(med);
						self.menuUpdateRecent(med);						
					});
				break;
			
			// VMM
			case 'vmm':
				// vboxVMMDialog(select,type,hideDiff,mPath)
				$.when(vboxVMMDialog(true,self.type,true,(self.mediumPath ? self.mediumPath: $('#vboxPane').data('vboxRecentMediaPaths')[self.type]))).done(function(m){
					if(m) {
						self.callback(vboxMedia.getMediumById(m));
						self.menuUpdateRecent();
					}
				});
				break;
				
			// Choose medium file
			case 'chooseD':
				
				vboxMedia.actions.choose(self.mediumPath,self.type,function(med){
					self.callback(med);
					self.menuUpdateRecent();
				});
				
				break;
				
			// Existing medium was selected
			default:
				if(action.indexOf('path:') == 0) {
					var path = action.substring(5);
					var med = vboxMedia.getMediumByLocation(path);
					if(med && med.deviceType == self.type) {
						self.callback(med);
						self.updateRecent(med,true);
					}
					return;
				}
				var med = vboxMedia.getMediumById(action);
				self.callback(med);
				self.updateRecent(med,true);
		}
	};
		
		
}




/**
 * Menu class for use with context or button menus
 * 
 * @constructor
 * @class vboxMenu
 * @param {Object}
 *            name - name of menu
 *            id - optional HTMLNode id of menu to use
 * 			  menuItems - list of menu items to add
 *            language_context - translation language context
 */
function vboxMenu(options) {

	var self = this;
	
	this.name = options.name;
	this.menuItems = {};
	this.iconStringDisabled = '_disabled';
	this.id = options.id;
	this.language_context = options.language_context;
		
	/**
	 * return menu id
	 * 
	 * @memberOf vboxMenu
	 * @return {String} the HTMLNode id of this menu
	 */
	this.menuId = function() {
		if(self.id) return self.id;
		return self.name + 'Menu';
	};
	
	/**
	 * Add menu to menu object
	 * 
	 * @memberOf vboxMenu
	 * @param {Object}
	 *            m - menu configuration object
	 */
	this.addMenu = function(m) {
		$('#vboxPane').append(self.menuElement(m,self.menuId()));
	};

	/**
	 * Traverse menu configuration object and generate a
	 * <UL>
	 * containing menu items
	 * 
	 * @memberOf vboxMenu
	 * @param {Object}
	 *            m - menu configuration object
	 * @param {String}
	 *            mid - the optional id to use for the generated HTMLNode
	 * @return {HTMLNode} menu
	 *         <UL>
	 *         node containing menu items and submenus
	 */
	this.menuElement = function(m, mid) {

		var ul = null;
		
		if(mid) {
			ul = $('#'+mid);
			if(ul && ul.length) {
				ul.empty();
			} else {
				ul = $('<ul />').attr({'id':mid,'style':'display: none;'});
			}
		} else {
			ul = $('<ul />').attr({'style':'display: none;'});
		}
		
		ul.addClass('contextMenu');
		
		for(var i in m) {
			
			if(typeof m[i] == 'function') continue;
			
			// get menu item
			var item = self.menuItem(m[i]);
			
			// Add to menu list
			self.menuItems[m[i].name] = m[i];

			// Children?
			if(m[i].children && m[i].children.length) {
				item.append(self.menuElement(m[i].children, self.menuId()+'-submenu-' + i));
			}
			
			ul.append(item);
			
		}
		
		return ul;
		
	};
	
	/**
	 * Menu click callback
	 * 
	 * @memberOf vboxMenu
	 * @param {Integer}
	 *            i - menu item index number
	 * @param {Object}
	 *            item - optional selected item
	 * @return return value of menu item's click() function
	 */
	this.menuClickCallback = function(i, item) {
		return self.menuItems[i].click(item);
	};
	
	/**
	 * generate menu item HTML
	 * 
	 * @memberOf vboxMenu
	 * @param {Object}
	 *            i - menu item's configuration object
	 * @return {HTMLNode}
	 *         <li> containing menu item
	 */
	this.menuItem = function(i) {

	    var label = trans(i.label, i.language_context ? i.language_context : self.language_context);
		return $('<li />').addClass((i.separator ? 'separator': '')).addClass((i.cssClass ? i.cssClass: '')).append($('<a />')
			.html(label)
			.attr({
				'style': (i.icon ? 'background-image: url('+self.menuIcon(i,false)+')': ''),
				'id': self.name+i.name,'href':'#'+i.name
			}));		
		
	};
	
	/**
	 * Return a URL to use for menu item's icon
	 * 
	 * @memberOf vboxMenu
	 * @param {Object}
	 *            i - menu item configuration object
	 * @param {Boolean}
	 *            disabled - whether or not the icon should be disabled
	 * @return {String} url to icon to use
	 */
	this.menuIcon = function(i,disabled) {
		
		if(!i.icon) return '';
		
		return 'images/vbox/' + i.icon + (disabled ? self.iconStringDisabled: '') + '_16px.png';
		
	};
	
	/**
	 * Update all menu items
	 * 
	 * @memberOf vboxMenu
	 * @param {Object}
	 *            testObj - object used to test for enabled()
	 * @return null
	 */
	this.update = function(testObj) {
		
		for(var i in self.menuItems) {
						
			// If enabled function doesn't exist, there's nothing to do
			if(!self.menuItems[i].enabled) continue;
			
			var mi = $('#'+self.name+i);
			
			// Disabled
			if(!self.menuItems[i].enabled(testObj)) {
				
				if(self.menuItems[i].hide_on_disabled) {
					mi.parent().hide();
				} else {
					self.disableItem(i,mi);
				}
			
			// Enabled
			} else {
				if(self.menuItems[i].hide_on_disabled) { 
					mi.parent().show();
				} else {
					self.enableItem(i,mi);
				}
			}
			
		}
	};

	/**
	 * Disable a single menu item
	 * 
	 * @memberOf vboxMenu
	 * @param {String}
	 *            i - menu item's name
	 * @param {Object}
	 *            mi - optional menu item HTMLNode or jQuery object
	 */
	this.disableItem = function(i, mi) {
		if(!mi) mi = $('#'+self.name+i);
		if(self.menuItems[i].icon)
			mi.css({'background-image':'url('+self.menuIcon(self.menuItems[i],true)+')'}).parent().addClass('disabled');
		else
			mi.parent().addClass('disabled');		
		
	};
	
	/**
	 * Enable a single menu item
	 * 
	 * @memberOf vboxMenu
	 * @param {String}
	 *            i - menu item's name
	 * @param {Object}
	 *            mi - optional menu item HTMLNode or jQuery object
	 */	
	this.enableItem = function(i, mi) {
		if(!mi) mi = $('#'+self.name+i);
		if(self.menuItems[i].icon)
			mi.css({'background-image':'url('+self.menuIcon(self.menuItems[i],false)+')'}).parent().removeClass('disabled');
		else
			mi.parent().removeClass('disabled');		
	};
	
	
	// Just add menu items if there were passed
	if(options.menuItems) self.addMenu(options.menuItems);

}

/**
 * Menu bar class
 * 
 * @constructor
 * @class vboxMenuBar
 * @param {String}
 *            name - name of this menu bar
 */
function vboxMenuBar(options) {
	
	var self = this;
	this.name = options.name;
	this.language_context = options.language_context;
	this.menus = new Array();
	this.menuClick = {};
	this.iconStringDisabled = options.iconStringDisabled ? options.iconStringDisabled : '_disabled';
	
	/**
	 * Add a menu to this object
	 * 
	 * @memberOf vboxMenuBar
	 * @param {Object}
	 *            m - menu configuration object
	 * @return void
	 */
	this.addMenu = function(m) {
		
		// Create menu object
		m.menuObj = new vboxMenu({'name': m.name, language_context: m.language_context ? m.language_context : self.language_context});
		
		// Propagate config
		m.menuObj.iconStringDisabled = self.iconStringDisabled;
		
		// Add menu
		m.menuObj.addMenu(m.menu);
		self.menus[self.menus.length] = m;
				
	};

	/**
	 * Render menu bar to element identified by ID
	 * 
	 * @memberOf vboxMenuBar
	 * @param {String}
	 *            id - HTMLNode id of node to add menu bar to
	 */
	this.renderTo = function(id) {
		
		$('#'+id).prepend($('<div />').attr({'class':'vboxMenuBar','id':self.name+'MenuBar'}));
		
		for(var i = 0; i < self.menus.length; i++) {
		    var label = trans(self.menus[i].label, self.menus[i].language_context ? self.menus[i].language_context : self.language_context);
			$('#'+self.name+'MenuBar').append(
					$('<span />').attr({'id':'vboxMenuBarMenu'+self.name+self.menus[i].name}).html(label)
					.contextMenu({
					 		menu: self.menus[i].menuObj.menuId(),
					 		button: 0,
					 		mode: 'menu',
					 		menusetup: function(el) {
								$(el).parent().data('vboxMenubarActive', true);
								$(document).one('mousedown',function(){
									$(el).parent().data('vboxMenubarActive', false);
								});
							}					 		
						},
						self.menus[i].menuObj.menuClickCallback
					).hover(
						function(){
							$(this).addClass('vboxBordered');
							if($(this).parent().data('vboxMenubarActive')) {
								
								// Hide any showing menu
								var e = jQuery.Event("mouseup", {button:0});
								$(this).trigger(e);
								var e = jQuery.Event("mousedown", {button:0});
								$(this).trigger(e);
								var e = jQuery.Event("mouseup", {button:0});
								$(this).trigger(e);
							}
						},
						function(){
							$(this).removeClass('vboxBordered');
						}
					).disableSelection()
				);
		}
	};
	
	
	/**
	 * Update Menu items
	 * 
	 * @memberOf vboxMenuBar
	 * @param {Object}
	 *            item - item to use in menu configuration items' update() test
	 * @return void
	 */
	this.update = function(item) {
		
		
		for(var i = 0; i < self.menus.length; i++) {
			
			// check for enabled function on entire menu object
			if(self.menus[i].enabled) {
				if(self.menus[i].enabled(item)) {
					$('#vboxMenuBarMenu'+self.name+self.menus[i].name).show();
				} else {
					$('#vboxMenuBarMenu'+self.name+self.menus[i].name).hide();
					continue;
				}
			}
			self.menus[i].menuObj.update(item);
		}
		
	};
	
	
}

/**
 * Loads data, scripts, and HTML files and optionally displays "Loading ..."
 * screen until all items have completed loading
 * 
 * @param {String} name - unique name for this loader. used to generate id
 * 		of "Loading..." div
 * @constructor
 * @class vboxLoader
 */
function vboxLoader(name) {

	if(!name) name = '';
	var self = this;
	this._load = [];
	this.onLoad = null;
	this._loadStarted = {};
	this.hideRoot = false;
	this.noLoadingScreen = false;
	this.name = name;
	
	this._data = [];
	this._files = [];
	
	/**
	 * Add data item to list of items to load
	 * 
	 * @memberOf vboxLoader
	 * @param {String}
	 *            dataFunction - function to pass to vboxAjaxRequest()
	 * @param {Function}
	 *            callback - callback to run when data is returned
	 * @param {Object}
	 *            params - params to pass to vboxAjaxRequest()
	 * @see vboxAjaxRequest()
	 */
	this.add = function(dataFunction, callback, params) {
		if(!this.name) this.name = dataFunction + 'Loader';
		this._data[this._data.length] = vboxAjaxRequest(dataFunction,params).done(callback);
	};

	/**
	 * Add file to list of items to load
	 * 
	 * @memberOf vboxLoader
	 * @param {String}
	 *            file - URL of file to load
	 * @param {Function}
	 *            callback - callback to run when file is loaded
	 * @see vboxAjaxRequest()
	 */
	this.addFile = function(file,callback) {
		this._files[this._files.length] = {
				'callback': callback,
				'file': file
			};		
	};

	/**
	 * Add file to list of items to load. Append resulting file to element.
	 * 
	 * @memberOf vboxLoader
	 * @param {String}
	 *            file - URL of file to load
	 * @param {jQueryObject}
	 *            elm - element to append file to
	 */
	this.addFileToDOM = function(file,elm) {
		if(elm === undefined) elm = $('#vboxPane');
		var callback = function(f){elm.append(f);};
		self.addFile(file,callback);
	};
	
	/**
	 * Show loading screen
	 * 
	 */
	this.showLoading = function() {
		
		var div = $('<div />').attr({'id':'vboxLoaderDialog'+self.name,'title':'','style':'display: none;','class':'vboxLoaderDialog'});
		
		var tbl = $('<table />');
		var tr = $('<tr />');

		$('<td />').attr('class', 'vboxLoaderSpinner').html('<img src="images/spinner.gif" width="36" height="39" />').appendTo(tr);
		
		$('<td />').attr('class','vboxLoaderText').html(trans('Loading ...','UIVMDesktop')).appendTo(tr);

		$(tbl).append(tr).appendTo(div);
		
		if(self.hideRoot)
			$('#vboxPane').css('display', 'none');

		$(div).dialog({
			'dialogClass': 'vboxLoaderDialog',
			'width': 'auto',
			'height': 65,
			'modal': true,
			'resizable': false,
			'draggable': false,
			'closeOnEscape': false,
			'buttons': {}
		});

	};
	
	/**
	 * Hide loading screen
	 */
	this.removeLoading = function() {
		$('#vboxLoaderDialog'+self.name).empty().remove();
	};
	
	/**
	 * Load data and optionally present "Loading..." screen
	 * 
	 * @memberOf vboxLoader
	 * @return null
	 */
	this.run = function() {

		if(!self.noLoadingScreen) {
			self.showLoading();
		}
		
		// Data first
		$.when.apply($, self._data).done(function() {
			
			// files
			for(var i = 0; i < self._files.length; i++) {
				self._files[i] = jQuery.get(self._files[i]['file'],self._files[i]['callback']).fail(function(d) {
				
					// Check for error HTTP status
					if(d && d.status && (String(d.status).substring(0,1) == '4' || String(d.status).substring(0,1) == '5')) {
						var err = {error: 'HTTP error: ' + d.status + ' ' + d.statusText,details:''};
						for(var i in d) {
							if(typeof(d[i]) == 'function' || typeof(d[i]) == 'object') continue;
							err.details += i + ': "' + d[i] + '"' + "\n";
						}
						vboxAlert(err);
					}
				
				});
			}
			
			$.when.apply($, self._files).done(function() {
				self._stop();
			});
				
		});
		
	};
	
	/**
	 * Remove loading screen and show body
	 * 
	 * @memberOf vboxLoader
	 */
	this._stop = function() {

		if(self.onLoad) self.onLoad(self);

		if(!self.noLoadingScreen) self.removeLoading();
		
		if(self.hideRoot) $('#vboxPane').css('display', '');
		
		if(self.onShow) self.onShow();
	};

}

/**
 * Serial port namespace
 * 
 * @namespace vboxSerialPorts
 */
var vboxSerialPorts = {
	
	ports: [
      { 'name':"COM1", 'irq':4, 'port':'0x3F8' },
      { 'name':"COM2", 'irq':3, 'port':'0x2F8' },
      { 'name':"COM3", 'irq':4, 'port':'0x3E8' },
      { 'name':"COM4", 'irq':3, 'port':'0x2E8' },
	],
	
	/**
	 * Return port name based on irq and port
	 * 
	 * @param {Integer}
	 *            irq - irq number
	 * @param {String}
	 *            port - IO port
	 * @return {String} port name
	 */
	getPortName: function(irq,port) {
		for(var i = 0; i < vboxSerialPorts.ports.length; i++) {
			if(vboxSerialPorts.ports[i].irq == irq && vboxSerialPorts.ports[i].port.toUpperCase() == port.toUpperCase())
				return vboxSerialPorts.ports[i].name;
		}
		return 'User-defined';
	}
	
};

/**
 * LPT port namespace
 * 
 * @namespace vboxParallelPorts
 */
var vboxParallelPorts = {
	
	ports: [
      { 'name':"LPT1", 'irq':7, 'port':'0x3BC' },
      { 'name':"LPT2", 'irq':5, 'port':'0x378' },
      { 'name':"LPT3", 'irq':5, 'port':'0x278' }
	],

	/**
	 * Return port name based on irq and port
	 * 
	 * @param {Integer}
	 *            irq - irq number
	 * @param {String}
	 *            port - IO port
	 * @return {String} port name
	 */	
	getPortName: function(irq,port) {
		for(var i = 0; i < vboxParallelPorts.ports.length; i++) {
			if(vboxParallelPorts.ports[i].irq == irq && vboxParallelPorts.ports[i].port.toUpperCase() == port.toUpperCase())
				return vboxParallelPorts.ports[i].name;
		}
		return 'User-defined';
	}
	
};


/**
 * Common VM storage / controller functions namespace
 * 
 * @namespace vboxStorage
 * 
5.133.2 getDefaultIoCacheSettingForStorageController
5.133.3 getDeviceTypesForStorageBus
5.133.4 getMaxDevicesPerPortForStorageBus
5.133.5 getMaxInstancesOfStorageBus

 */
var vboxStorage = {

     
	/**
	 * Return list of bus types
	 * 
	 * @memberOf vboxStorage
	 * @static
	 * @return {Array} list of all storage bus types
	 */
	getBusTypes: function() {
		var busts = [];
		for(var i in vboxStorage) {
			if(typeof i == 'function') continue;
			if(!vboxStorage[i].maxPortCount) continue;
			busts[busts.length] = i;
		}
		return busts;
	},
	
	/**
	 * Return list of attached media for storage
	 * controllers of a VM
	 */
	getAttachedBaseMedia: function(vm) {
	    
	    var media = [];
	    
	    for(var a = 0; a < vm.storageControllers.length; a++) {

	        var attch = vm.storageControllers[a].mediumAttachments;
	        
	        for(var b = 0; b < attch.length; b++) {
	            var m = attch[b].medium;
	            if(!m) continue;
	            media.push(vboxMedia.getMediumById(m.base ? m.base: m.id));
	        }
	    }
	    
	    return media;
    
	},
	
    /**
     * Return icon name for bus
     * 
     * @memberOf vboxStorage
     * @param {Object} ma - medium attachment object
     * @return {Array} options list
     */
	getMAOptions: function(ma) {
	
	    switch(ma.type) {
	        case 'HardDisk':
	            var opts = [{
	                label: trans('Solid-state Drive','UIMachineSettingsStorage'),
	                attrib: 'nonRotational'
	            }];
	            if($('#vboxPane').data('vboxConfig').enableHDFlushConfig) {
	                opts.push({
                        label: 'Ignore Flush Requests',
                        attrib: 'ignoreFlush',
                        runningEnabled: true,
	                });
	            }
	            return opts;
	        case 'DVD':
	            // Host drive
	            if(vboxMedia.isHostDrive(ma.medium)) {
	                return [{
	                    label: trans('Passthrough','UIMachineSettingsStorage'),
	                    attrib: 'passthrough'
	                }];
	            }
	            // Image
                return [{
                    label: trans('Live CD/DVD','UIMachineSettingsStorage'),
                    attrib: 'temporaryEject',
                    runningEnabled: true
                }];
	        default:
	            return []
	    }
	},
	
	/**
	 * Get medium attachment options for storage controller
	 * 
     * @memberOf vboxStorage
     * @param {Object} sc - storage controller object
     * @return {Array} options list
	 */
	getMAOptionsForSC: function(sc) {
	    if(sc.bus == 'SATA' || sc.bus == 'USB') {
	        return [{
                label: trans('Hot-pluggable','UIMachineSettingsStorage'),
                attrib: 'hotPluggable'
	        }];
	    }
	    return [];
	},
	
	/**
	 * Return icon name for bus
	 * 
	 * @memberOf vboxStorage
	 * @param {String} bus - bus type
	 * @return {String} icon name
	 */
	getBusIconName: function(bus) {
		if(vboxStorage[bus].displayInherit) bus = vboxStorage[bus].displayInherit
		return bus.toLowerCase();
	},
	
	IDE: {
		maxPortCount: 2,
		limitOneInstance: true,
		maxDevicesPerPortCount: 2,
		types :['PIIX3','PIIX4','ICH6' ],
		ignoreFlush: true,
		slotName: function(p,d) {
			switch(p+'-'+d) {
				case '0-0': return (trans('IDE Primary Master','VBoxGlobal', null, 'StorageSlot'));
				case '0-1': return (trans('IDE Primary Slave','VBoxGlobal', null, 'StorageSlot'));
				case '1-0': return (trans('IDE Secondary Master','VBoxGlobal', null, 'StorageSlot'));
				case '1-1': return (trans('IDE Secondary Slave','VBoxGlobal', null, 'StorageSlot'));
			}
		},
		driveTypes: ['dvd','disk'],
		slots: function() { return {
		          	'0-0': (trans('IDE Primary Master','VBoxGlobal', null, 'StorageSlot')),
		          	'0-1': (trans('IDE Primary Slave','VBoxGlobal', null, 'StorageSlot')),
		          	'1-0': (trans('IDE Secondary Master','VBoxGlobal', null, 'StorageSlot')),
		          	'1-1': (trans('IDE Secondary Slave','VBoxGlobal', null, 'StorageSlot'))
			};
		}
	},
		
	SATA: {
		maxPortCount: 30,
		maxDevicesPerPortCount: 1,
		ignoreFlush: true,
		types: ['IntelAhci'],
		driveTypes: ['dvd','disk'],
		slotName: function(p,d) { return trans('SATA Port %1','VBoxGlobal', null, 'StorageSlot').replace('%1',p); },
		slots: function() {
					var s = {};
					for(var i = 0; i < 30; i++) {
						s[i+'-0'] = trans('SATA Port %1','VBoxGlobal', null, 'StorageSlot').replace('%1',i);
					}
					return s;
				}
	},
		
	SCSI: {
		maxPortCount: 16,
		maxDevicesPerPortCount: 1,
		driveTypes: ['dvd','disk'],
		types: ['LsiLogic','BusLogic'],
		ignoreFlush: true,
		slotName: function(p,d) { return trans('SCSI Port %1','VBoxGlobal', null, 'StorageSlot').replace('%1',p); },
		slots: function() {
						var s = {};
						for(var i = 0; i < 16; i++) {
							s[i+'-0'] = trans('SCSI Port %1','VBoxGlobal', null, 'StorageSlot').replace('%1',i);
						}
						return s;				
					}
	},
	SAS: {
		maxPortCount: 8,
		maxDevicesPerPortCount: 1,
		types: ['LsiLogicSas'],
		driveTypes: ['dvd','disk'],
		slotName: function(p,d) { return trans('SAS Port %1','VBoxGlobal', null, 'StorageSlot').replace('%1',p); },
		slots: function() {
			var s = {};
			for(var i = 0; i < 8; i++) {
				s[i+'-0'] = trans('SAS Port %1','VBoxGlobal', null, 'StorageSlot').replace('%1',i);
			}
			return s;				
		},
		displayInherit: 'SATA'
	},
		

	Floppy: {
		maxPortCount: 1,
		limitOneInstance: true,
		maxDevicesPerPortCount: 2,
		types: ['I82078'],
		driveTypes: ['floppy'],
		slotName: function(p,d) { return trans('Floppy Device %1','VBoxGlobal', null, 'StorageSlot').replace('%1',d); },
		slots: function() { return { '0-0':trans('Floppy Device %1','VBoxGlobal', null, 'StorageSlot').replace('%1','0'),
		                            '0-1' :trans('Floppy Device %1','VBoxGlobal', null, 'StorageSlot').replace('%1','1') }; }	
	},
	
	USB: {
        maxPortCount: 8,
        maxDevicesPerPortCount: 1,
        types: ['USB'],
        driveTypes: ['dvd','disk'],
        slotName: function(p,d) { return trans('USB Port %1','VBoxGlobal', null, 'StorageSlot').replace('%1',p); },
        slots: function() {
            var s = {};
            for(var i = 0; i < 8; i++) {
                s[i+'-0'] = trans('USB Port %1','VBoxGlobal', null, 'StorageSlot').replace('%1',i);
            }
            return s;
        }
	}
};

/**
 * Storage Controller Types conversions
 * 
 * @param {String}
 *            c - storage controller type
 * @return {String} string used for translation
 */
function vboxStorageControllerType(c) {
	switch(c) {
		case 'LsiLogic': return 'Lsilogic';
		case 'LsiLogicSas': return 'LsiLogic SAS';
		case 'IntelAhci': return 'AHCI';
	}
	return c;
}
/**
 * Serial port mode conversions
 * 
 * @param {String}
 *            m - serial port mode
 * @return {String} string used for translation
 */
function vboxSerialMode(m) {
	switch(m) {
		case 'HostPipe': return 'Host Pipe';
		case 'HostDevice': return 'Host Device';
		case 'RawFile': return 'Raw File';
	}
	return m;
}

/**
 * Network adapter type conversions
 * 
 * @param {String}
 *            t - network adapter type
 * @return {String} string used for translation
 */
function vboxNetworkAdapterType(t) {
	switch(t) {
		case 'Am79C970A': return 'PCnet-PCI II (Am79C970A)';
		case 'Am79C973': return 'PCnet-FAST III (Am79C973)';
		case 'I82540EM': return 'Intel PRO/1000 MT Desktop (82540EM)';
		case 'I82543GC': return 'Intel PRO/1000 T Server (82543GC)';
		case 'I82545EM': return 'Intel PRO/1000 MT Server (82545EM)';
		case 'Virtio': return 'Paravirtualized Network (virtio-net)';
	}
}

/**
 * Audio controller conversions
 * 
 * @param {String}
 *            c - audio controller type
 * @return {String} string used for translation
 */
function vboxAudioController(c) {
	switch(c) {
		case 'AC97': return 'ICH AC97';
		case 'SB16': return 'SoundBlaster 16';
		case 'HDA': return 'Intel HD Audio';
	}
}
/**
 * Audio driver conversions
 * 
 * @param {String}
 *            d - audio driver type
 * @return {String} string used for translation
 */
function vboxAudioDriver(d) {
	switch(d) {
		case 'OSS': return 'OSS Audio Driver';
		case 'ALSA': return 'ALSA Audio Driver';
		case 'Pulse': return 'PulseAudio';
		case 'WinMM': return 'Windows Multimedia';
		case 'DirectSound': return 'Windows DirectSound';
		case 'Null': return 'Null Audio Driver';
		case 'SolAudio': return 'Solaris Audio';
	}
	return d;
}
/**
 * VM storage device conversions
 * 
 * @param {String}
 *            d - storage device type
 * @return {String} string used for translation
 */
function vboxDevice(d) {
	switch(d) {
		case 'DVD': return 'Optical';
		case 'HardDisk': return 'Hard Disk';
	}
	return d;
}

/**
 * VM State functions namespace
 * 
 * @namespace vboxVMStates
 */
var vboxVMStates = {
	
	/* Return whether or not vm is running */
	isRunning: function(vm) {
		return (vm && jQuery.inArray(vm.state, ['Running','LiveSnapshotting','Teleporting']) > -1);
	},

	/* Return whether or not vm is inaccessible */
	isInaccessible: function(vm) {
		return (vm && !vm.accessible);
	},

	/* Return whether or not a vm is stuck */
	isStuck: function (vm) {
		return (vm && vm.state == 'Stuck');
	},
	
	/* Whether or not a vm is paused */
	isPaused: function(vm) {
		return (vm && jQuery.inArray(vm.state, ['Paused','TeleportingPausedVM']) > -1);
	},
	
	/* True if vm is powered off */
	isPoweredOff: function(vm) {
		return (vm && jQuery.inArray(vm.state, ['PoweredOff','Saved','Teleported', 'Aborted']) > -1);
	},
	
	/* True if vm is saved */
	isSaved: function(vm) {
		return (vm && vm.state == 'Saved');
	},
	
	/* True if vm is editable */
	isEditable: function(vm) {
		return (vm && vm.sessionState == 'Unlocked');
	},
	
	/* True if one VM in list matches item */
	isOne: function(test, vmlist) {
	
		for(var i = 0; i < vmlist.length; i++) {
			if(vboxVMStates['is'+test](vmlist[i]))
				return true;
		}
		return false;
	},
	
	/* Convert Machine state to translatable state */
	convert: function(state) {
		switch(state) {
			case 'PoweredOff': return 'Powered Off';
			case 'LiveSnapshotting': return 'Live Snapshotting';
			case 'TeleportingPausedVM': return 'Teleporting Paused VM';
			case 'TeleportingIn': return 'Teleporting In';
			case 'TakingLiveSnapshot': return 'Taking Live Snapshot';
			case 'RestoringSnapshot': return 'Restoring Snapshot';
			case 'DeletingSnapshot': return 'Deleting Snapshot';
			case 'SettingUp': return 'Setting Up';
			default: return state;
		}
	}
};

