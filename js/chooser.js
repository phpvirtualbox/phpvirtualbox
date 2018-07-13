/**
 *
 * @fileOverview Chooser (vm list) singleton. Provides vboxChooser
 * @author Ian Moore (imoore76 at yahoo dot com)
 * @version $Id: chooser.js 591 2015-04-11 22:40:47Z imoore76 $
 * @copyright Copyright (C) 2010-2015 Ian Moore (imoore76 at yahoo dot com)
 *
 */

/**
 * Chooser selection mode constants
 */
var vboxSelectionModeNone = 0;
var vboxSelectionModeSingleVM = 1;
var vboxSelectionModeMultiVM = 2;
var vboxSelectionModeSingleGroup = 3;


/**
 * @namespace vboxChooser
 * 
 * Draws machine selection chooser and controls selection list
 * @see js/eventlistener.js
 */
var vboxChooser = {

	// VM list
	vms : {},
	
	// VM tool tip
	_vmToolTip : '<nobr>%1<br></nobr><nobr>%2 since %3</nobr><br><nobr>Session %4</nobr>',
	
	// Anchor element
	_anchorid : null,
	_anchor : null,
	
	/* Internal list of all unique selected items */
	_selectedList : [],
	
	/* List of unique selected VMs */
	selectedVMs : [],
	
	/* Holds group definitions */
	_groupDefs : [],

	/* selection mode can be
	
		var vboxSelectionModeNone = 0,
		var vboxSelectionModeSingleVM = 1,
		var vboxSelectionModeMultiVM = 2,
		var vboxSelectionModeSingleGroup = 3,
	 */
	selectionMode : vboxSelectionModeNone,
	
	/* Check phpVirtualBox version and VirtualBox
	 * version compatibility.
	 */
	_versionChecked : false,
	
	/* Some items are not editable while vmGroup
	 * definitions are being written
	 */
	_editable : true,
	
	/* Context menus */
	_vmContextMenuObj : null,
	_vmGroupContextMenuObj : null,
	
	/* Holds history of showing only single groups */
	_showOnlyGroupHistory : [],
	
	/* Group definition extra value key */
	_groupDefinitionKey : '',
	
	/* Whether chooser is in compact mode or not */
	_compact : false,
	
	/**
	 * Set anchor id to draw to
	 */
	setAnchorId : function(aid) {
		vboxChooser._anchorid = aid;
		vboxChooser._anchor = $('#'+aid);
		
		vboxChooser._anchor.html("<div id='vboxChooserSpinner' style='text-align: center'><div><img src='images/spinner.gif' /></div></div>");
		
		vboxChooser._anchor.hover(function(){
			$(this).addClass('vboxChooserDropTargetHoverRoot');
		},function() {
			$(this).removeClass('vboxChooserDropTargetHoverRoot');
		});
		
		$(window).resize(function(){
			
			// Get anchor id and add / remove class
			var w = parseInt($(vboxChooser._anchor).innerWidth());
			if(w < 120) {
				$(vboxChooser._anchor).addClass('vboxChooserMini');
				vboxChooser._compact = true;
			} else {
				$(vboxChooser._anchor).removeClass('vboxChooserMini');
				vboxChooser._compact = false;
			}

			vboxChooser._resizeElements(true);
			
		});
	},
	
	/**
	 * Set context menus
	 * 
	 */
	setContextMenu : function(target, menuitems) {
		
		switch(target) {
		
			// Group menu
			case 'group':
				vboxChooser._vmGroupContextMenuObj = new vboxMenu({'name': vboxChooser._anchorid+'vmgroups',
				                                                   'menuItems': menuitems,
				                                                   'language_context': 'UIActionPool'});
				vboxChooser._vmGroupContextMenuObj.update();
				break;
				
			// VM Menu
			case 'vm':
				vboxChooser._vmContextMenuObj = new vboxMenu({'name': vboxChooser._anchorid+'vms',
				                                              'menuItems': menuitems,
				                                              'language_context': 'UIActionPool'});
				vboxChooser._vmContextMenuObj.update();
				break;
				
			// Main list menu
			case 'anchor':

				var vboxChooserPaneMenu = new vboxMenu({'name': vboxChooser._anchorid+'Pane',
				                                        'menuItems': menuitems,
				                                        'language_context': 'UIActionPool'});			
				$('#'+vboxChooser._anchorid).parent().contextMenu({
				  		menu: vboxChooserPaneMenu.menuId()
				  	},
				  	vboxChooserPaneMenu.menuClickCallback
				);

				break;
				
			default:
				vboxAlert('vboxChooser::setContextMenu: unknown context menu type (' + target + ')');
		}
	},

	/*
	 * Return true if a selected VM is in the given state
	 */
	isSelectedInState : function(state) {
	
		 for(var i = 0; i < vboxChooser.selectedVMs.length; i++) {
			 if(vboxVMStates['is'+state](vboxVMDataMediator.getVMData(vboxChooser.selectedVMs[i])))
				 return true;
		 }
		 return false;
		 
 	},
	 
 	/**
 	 * Return true if the passed VM is selected
 	 */
 	isVMSelected : function(vmid) {
 		return (jQuery.inArray(vmid,vboxChooser.selectedVMs) > -1);	 
 	},
 	 
 	/**
 	 * Return selected VM data in array
 	 */
 	getSelectedVMsData : function() {

 		var vms = [];
		for(var i = 0; i < vboxChooser.selectedVMs.length; i++) {
			vms[vms.length] = vboxVMDataMediator.getVMData(vboxChooser.selectedVMs[i]);
		}
		return vms;
 	},
 	
	/**
	 * Triggered when selection list has changed
	 */
	selectionListChanged : function(selectionList) {
		
		if(!selectionList) selectionList = [];
		
		selectionMode = vboxSelectionModeNone;
		
		// Hold unique selected VMs
		var vmListUnique = {};
		for(var i = 0; i < selectionList.length; i++) {
			if(selectionList[i].type == 'group') {
				vboxChooser.getGroupElement(selectionList[i].groupPath, true).find('table.vboxChooserVM:not(.ui-draggable-dragging)').each(function(idx,elm){
					if(elm) {
						var vmid = $(elm).data('vmid');
						if(vmid)
							vmListUnique[vmid] = vmid;
					}
				});
				switch(selectionMode) {
					case vboxSelectionModeSingleGroup:
					case vboxSelectionModeSingleVM:
						selectionMode = vboxSelectionModeMultiVM;
						break;
					case vboxSelectionModeNone:
						selectionMode = vboxSelectionModeSingleGroup;
				}
			} else {				
				switch(selectionMode) {
					case vboxSelectionModeNone:
						selectionMode = vboxSelectionModeSingleVM;
						break;
					default:
						selectionMode = vboxSelectionModeMultiVM;
				}

				vmListUnique[selectionList[i].id] = selectionList[i].id;
			}
		}
		
		// Change selection list
		var selectedVMs = [];
		for(var i in vmListUnique) {
			selectedVMs[selectedVMs.length] = i;
		}
		
		vboxChooser.selectedVMs = selectedVMs;

		// If there is only one unique vm selected,
		// selection mode becomes single VM if the
		// current selection mode is not singleGroup
		if(vboxChooser.selectedVMs.length == 1 && selectionMode != vboxSelectionModeSingleGroup)	
			selectionMode = vboxSelectionModeSingleVM;

		vboxChooser.selectionMode = selectionMode;
		
		vboxChooser._selectedList = selectionList;

		$('#vboxPane').trigger('vmSelectionListChanged',[vboxChooser]);	
		
		
	},
	
	/**
	 * Return the single selected VM's id if
	 * only one vm is selected. Else null.
	 */
	getSingleSelectedId : function() {
		if(vboxChooser.selectedVMs.length == 1) {
			return vboxChooser.selectedVMs[0];
		}
		return null;
	},
	 
	/*
	 * Return a single vm if only one is selected.
	 * Else null.
	 */
	getSingleSelected : function() {
		if(vboxChooser.selectedVMs.length == 1) {
			return vboxVMDataMediator.getVMData(vboxChooser.selectedVMs[0]);
		}
		return null;
	 },
	
	/*
	 * Update list of VMs from data received
	 * from ajax query
	 */
	updateList : function(vmlist) {

		// We were stopped before the request returned data
		if(!vboxChooser._running) return;
		

		// No list? Something is wrong
		if(!vmlist) {
			
			phpVirtualBoxFailure();
			
			vboxChooser.stop();
			vboxChooser._anchor.children().remove();
			return;
		}
		
		// Remove spinner
		vboxChooser._anchor.children().remove();
		
		// Render host
		vboxChooser._anchor.append(vboxChooser.vmHTML(
			{
				'id':'host',
				'state':'Hosting',
				'owner':'',
				'name':$('#vboxPane').data('vboxConfig').name,
				'OSTypeId':'VirtualBox_Host'
			}
		));
		
		// Render root group
		vboxChooser._anchor.append(vboxChooser.groupHTML("/"));
				
		// Enforce VM ownership
        if($('#vboxPane').data('vboxConfig').enforceVMOwnership && !$('#vboxPane').data('vboxSession').admin) {
        	vmlist = jQuery.grep(vmlist,function(vm,i){
        		return (vm.owner == $('#vboxPane').data('vboxSession').user);
        	});
		}

        var groups = [];
		// Each item in list
		for(var i = 0; i < vmlist.length; i++) {	
			// Update
			vboxChooser.updateVMElement(vmlist[i], true);
			groups = groups.concat(vmlist[i].groups);
		}
		
		// Sort groups
		var groupsSorted = {};
		for(var i = 0; i < groups.length; i++) {
			if(groupsSorted[groups[i]]) continue;
			groupsSorted[groups[i]] = true;
			var gElm = vboxChooser.getGroupElement(groups[i], true);
			if(gElm[0]) vboxChooser.sortGroup(gElm);
		}

		// compose group definitions
		vboxChooser.composeGroupDef();
		
		// Set initial resize
		vboxChooser._initialResize = true;
		vboxChooser._resizeElements(true);

	},

	/*
	 * Save collapsed group list
	 */
	_collapsedGroups : [],
	_saveCollapsedGroups : function(){

		// Write out collapsed group list
		var cGroupList = [];
		vboxChooser._anchor.find('div.vboxVMGroupCollapsed:not(.ui-draggable-dragging)').each(function(idx,elm) {
			cGroupList[cGroupList.length] = $(elm).data('vmGroupPath');
		});
		
		var groupListKey = $('#vboxPane').data('vboxConfig').key+'-collapsedGroups';
		vboxSetLocalDataItem(groupListKey, cGroupList.join(','), true);

		// Cache instead of using local storage
		vboxChooser._collapsedGroups = cGroupList;
	},
	
	/*
	 * Return true if group is collapsed
	 */
	_isGroupCollapsed : function(gpath) {
		return(jQuery.inArray(gpath,vboxChooser._collapsedGroups) > -1);
	},
	
	/*
	 * Resize group and VM titles
	 */
	_scrollbarWidth : 0,
	_scrollbarWasVisible: false,
	_initialResize: false,
	_resizeElements : function(forceResize) {

		// Haven't completed our initial resizing yet
		if(!vboxChooser._initialResize) {
			return;
		}
		
		var sbVisible = (vboxChooser._anchor.get(0).scrollHeight > vboxChooser._anchor.height());
		
		// Nothing changed since resize
		if(!forceResize && (sbVisible == vboxChooser._scrollbarWasVisible)) {
			return;
		}
		
		vboxChooser._scrollbarWasVisible = sbVisible;
		
		var groupTitleWidth = vboxChooser._anchor.width() - (vboxChooser._compact ? 22 : 32) - (sbVisible ? vboxChooser._scrollbarWidth : 0);
		var vmTitleWidth = groupTitleWidth - (vboxChooser._compact ? -12 : 18); // (2px padding on .vboxChooserGroupVMs + 
			// 2px border on table + 4px margin on icon) * 2 
		var groupLevelOffset = (vboxChooser._compact ? 8 : 8); // (2px margin + 2px border) * 2
		
		
		// Now that we have sizes, we can inject styles
		$('#vboxChooserStyle').empty().remove();
		
		var styleRules = [];
		var path = ['div.vboxChooserGroupRootLevel'];
		
		// Special case for root level VM list
		styleRules[styleRules.length] = 'div.vboxChooserGroupRootLevel > div.vboxChooserGroupVMs table.vboxChooserVM div.vboxFitToContainer { width: ' + vmTitleWidth + 'px; }';
		
		// Special case for group header when only showing one group
		styleRules[styleRules.length] = 'div.vboxChooserGroupShowOnly.vboxChooserGroupRootLevel > div.vboxChooserGroupHeader span.vboxChooserGroupName { max-width: ' + (groupTitleWidth - 4) + 'px; }';
		
		// Bottom group resize bars
		styleRules[styleRules.length] = 'div.vboxChooserGroupRootLevel > div.vboxChooserDropTargetBottom { width: ' + (groupTitleWidth) + 30 + 'px; }';

		for(var i = 1; i < 11; i++) {
			
			// Group titles at this level
			styleRules[styleRules.length] = path.join(' > ') + ' > div.vboxChooserGroup > div.vboxChooserGroupHeader span.vboxChooserGroupName { max-width: ' + (groupTitleWidth - (i*groupLevelOffset)) + 'px; }';
			
			// VM titles at this level
			styleRules[styleRules.length] = path.join(' > ') + ' > div.vboxChooserGroup > div.vboxChooserGroupVMs table.vboxChooserVM div.vboxFitToContainer { width: ' + (vmTitleWidth - (i*(groupLevelOffset))) + 'px; }';

			// Bottom group resize bars
			styleRules[styleRules.length] = path.join(' > ') +' > div.vboxChooserGroup > div.vboxChooserDropTargetBottom { width: ' + (groupTitleWidth + 30 - (i*groupLevelOffset)) + 'px; }';

			path[path.length] = 'div.vboxChooserGroup';
		}
	
		// Style for minified vmlist
		if(vboxChooser._compact) {
			// Title moves left
			styleRules[styleRules.length] = 'div.vboxChooserGroup > div.vboxChooserGroupVMs table.vboxChooserVM div.vboxVMName { position: relative; left: -20px; }';
			// Icon moves down
			styleRules[styleRules.length] = 'div.vboxChooserGroup > div.vboxChooserGroupVMs table.vboxChooserVM img.vboxVMIcon { position: relative; top: 8px; }';
			// State text goes away
			styleRules[styleRules.length] = 'div.vboxChooserGroup > div.vboxChooserGroupVMs table.vboxChooserVM span.vboxVMState { display: none; }';
			// Less padding
			styleRules[styleRules.length] = 'div.vboxChooserGroup > div.vboxChooserGroupVMs table.vboxChooserVM td { padding: 0px; }';
			// Some group header items and drop targets go away
			styleRules[styleRules.length] = 'div.vboxChooserGroup > div.vboxChooserGroupHeader > .vboxChooserGroupNameArrowCollapse, #' +vboxChooser._anchorid + ' div.vboxChooserGroup .vboxChooserDropTarget { display: none; }';
			styleRules[styleRules.length] = 'div.vboxChooserGroup { overflow: hidden; }';
			// host
			styleRules[styleRules.length] = '#vboxChooserVMHost .vboxVMState { display: none; }';
			// group header 
			styleRules[styleRules.length] = 'div.vboxChooserGroup div.vboxChooserGroupHeader { height: auto; padding: 2px; }';

		}
		$('head').append('<style type="text/css" id="vboxChooserStyle">#'+vboxChooser._anchorid + ' ' + styleRules.join("\n#"+vboxChooser._anchorid + " ") + '</style>');
		
	},
		
	/*
	 * Get group element by path
	 */
	getGroupElement : function(gpath, noCreate) {

		if(!gpath) gpath = '/';
		var gnames = gpath.split('/');
		var groot = vboxChooser._anchor.children('div.vboxChooserGroup:not(.ui-draggable-dragging)');
		for(var i = 1; i < gnames.length; i++) {
			
			if(!gnames[i]) continue;
			
			var group = groot.children('div.vboxChooserGroup:not(.ui-draggable-dragging)').children('div.vboxChooserGroupIdentifier[title="'+gnames[i]+'"]').parent();
			
			// If it does not exist, create it
			if(!group[0]) {
				
				if(noCreate) return null;
				
				var gpath = '/';
				for(var a = 1; a <= i; a++) {
					gpath = gpath + '/' + gnames[a];
				}
				gpath = gpath.replace('//','/');
				
				vboxChooser.groupHTML(gpath).insertBefore(groot.children('div.vboxChooserGroupVMs'));
				
				vboxChooser.sortGroup(groot);
				
				// Resize chooser elements
				vboxChooser._initialResize = true;
				vboxChooser._resizeElements();
				
				groot = groot.children('div.vboxChooserGroup:not(.ui-draggable-dragging)').children('div.vboxChooserGroupIdentifier[title="'+gnames[i]+'"]').parent();
				
			} else {
				groot = group;
			}
			
		}
		return groot;
	},

	/*
	 *
	 * Update VM elements
	 *
	 */
	updateVMElement : function(vmUpdate, newVM) {

		// Not running.. don't do anything
		if(!vboxChooser._running) return;
		
		// Stale event after vm was removed
		if(!vmUpdate) return;
		
		// New VM
		if(newVM) {

			// New VM.. add it to groups..
			if(!vmUpdate.groups || vmUpdate.groups.length == 0)
				vmUpdate.groups = ['/'];
			
			for(var i = 0; i < vmUpdate.groups.length; i++) {
				var gElm = $(vboxChooser.getGroupElement(vmUpdate.groups[i]));
				vboxChooser.vmHTML(vmUpdate).appendTo(
					gElm.children('div.vboxChooserGroupVMs')
				);
			}
			
		// Existing VM. Replace existing elements
		} else {
				
			$('#'+vboxChooser._anchorid).find('table.vboxChooserItem-'+vboxChooser._anchorid+'-'+vmUpdate.id).each(function(i,elm){
				
				var newHTML = vboxChooser.vmHTML(vmUpdate);
				if($(elm).hasClass('vboxListItemSelected')) {
					$(newHTML).addClass('vboxListItemSelected').removeClass('vboxHover');
				}
				$(elm).children().replaceWith(newHTML.children());
			});
				
		}

	},
	

	/*
	 * Returns true if there are VMs with ID vmid that are not selected
	 */
	vmHasUnselectedCopy : function (vmid) {
		return ($(vboxChooser._anchor).find('table.vboxChooserItem-'+vboxChooser._anchorid+'-'+vmid+':not(.vboxListItemSelected)').length > 0);
	},
	
	/*
	 * Remove selected VMs from the list and rewrite group definitions
	 * this assumes that there are other copies of these VMs that are not
	 * selected.
	 */
	removeVMs : function(vmids) {
		
		for(var i = 0; i < vmids.length; i++) {
			$(vboxChooser._anchor).find('table.vboxChooserItem-'+vboxChooser._anchorid+'-'+vmids[i]+'.vboxListItemSelected').remove();		
		}
				
		// Update selection list
		vboxChooser._selectedList = vboxChooser._selectedList.filter(function(v){
			return (v.type == 'group' || (jQuery.inArray(v.id, vmids) == -1));
		});

		// Tell interface that selection list has changed
		vboxChooser.selectionListChanged(vboxChooser._selectedList);

		// compose and save group definitions
		vboxChooser.composeGroupDef(true);
		
		
		// Possible resize needed
		vboxChooser._resizeElements(true);

	},
	
	/*
	 * Generate HTML from VM definition
	 */
	vmHTML : function (vmn) {
		
		var tbl = $('<table />').attr({'class':'vboxChooserItem-'+vboxChooser._anchorid+'-'+vmn.id + " vboxChooserVM"})
			.on('mousedown',vboxChooser.selectItem)
			.hoverClass('vboxHover').data('vmid',vmn.id);
		
		
		// Drag-and-drop functionality
		/////////////////////////////////
		if(vmn.id != 'host' && $('#vboxPane').data('vboxSession').admin) {
			
			$(tbl).draggable({'cursorAt':{left: -10, top: -10},'helper':function(){
				return $(this).clone().css({'width':($(this).width()+2)+'px','display':'inline','background':'#fff','border-color':'#69f'}).removeClass('vboxHover');
				
			// drag start
			},'start':function(e) {
							
				if(!vboxChooser._editable) return false;
				
				$(vboxChooser._anchor).disableSelection();
				vboxChooser._dragging = vmn.id;
				$(vboxChooser._anchor).find('table.vboxHover').removeClass('vboxHover');
				
			// drag stop
			},'stop':function(e) {
				vboxChooser.vmDropped(e, $(this));
			}});
		}

		// Functionality to drop above / below VM
		/////////////////////////////////////////////
		var td = $('<td />').attr({'colspan':'2'}).addClass('vboxChooserDropTarget vboxDropTargetTop');
		if(vmn.id != 'host') {
			td.hover(function(){
				if(vboxChooser._dragging && vboxChooser._dragging != vmn.id)
					$(this).addClass('vboxChooserDropTargetHover');
			},function(){
				$(this).removeClass('vboxChooserDropTargetHover');
			}
			);
		}
		$('<tr />').append(td).appendTo(tbl);

		
		
		// VM OS type icon
		var tr = $('<tr />');
		if($('#vboxPane').data('vboxConfig').enableCustomIcons && vmn.customIcon) {
			$('<td />').attr({'rowspan':'2'}).html("<img src='" + vmn.customIcon + "' class='vboxVMIcon' />").appendTo(tr);
		} else {
			$('<td />').attr({'rowspan':'2'}).html("<img src='images/vbox/" + vboxGuestOSTypeIcon(vmn.OSTypeId) + "' class='vboxVMIcon" + (vmn.id == 'host' ? " vboxHostIcon" : "") + "' />").appendTo(tr);
		}
		
		
		// VM Name
		var td = $('<td />').attr({'class':'vboxVMTitle'});
		
		// Host will have HTML in name and unique id
		if(vmn.id == 'host') {
			
			$(tbl).attr('id', 'vboxChooserVMHost');
			
			// Check for multiple server config
			if($('#vboxPane').data('vboxConfig').servers.length) {
				
				// If there are multiple servers configured, setup menu
				if(!$('#vboxServerMenu')[0]) {
					var servers = $('#vboxPane').data('vboxConfig').servers;
					var ul = $('<ul />').attr({'id':'vboxServerMenu','style':'display: none','class':'contextMenu'});
					for(var i = 0; i < servers.length; i++) {
						$('<li />').html("<a href='#" + $('<div />').html(servers[i].name).text() + "' style='background-image: url(images/vbox/OSE/VirtualBox_16px.png);'>"+$('<div />').html(servers[i].name).text()+"</a>").appendTo(ul);
					}
					$('#vboxPane').append(ul);					
				}

				var span = $('<span />').attr({'class':'vboxServerLink'}).text('('+$('#vboxPane').data('vboxConfig').name+')').contextMenu({
						menu: 'vboxServerMenu',
						button: 0,
						mode: 'menu'
					},
					function(a) {
						
						if(a == $('#vboxPane').data('vboxConfig').name) return;				
						
						// Show loading screen
						var l = new vboxLoader();
						l.showLoading();
						
						// Empty selection list
						vboxChooser.selectionListChanged();
						

						// Unsubscribe from events
						$.when(vboxEventListener.stop()).done(function() {
							
							// Expire data mediator data
							vboxVMDataMediator.expireAll();
							
							// Trigger host change
							vboxSetCookie("vboxServer",a);
							$('#vboxPane').trigger('hostChange',[a]);	
							
						}).always(function(){
							
							// remove loading screen
							l.removeLoading();
							
						});
						
						
					}
				);
				$(td).html('<span class="vboxVMName">VirtualBox</span> ').append(span);
			} else {				
				$(td).html('<span class="vboxVMName">VirtualBox</span> ('+vmn.name+')');
			}
			
		// Not rendering host
		} else {
			
			$(td).append('<div class="vboxFitToContainer vboxVMName"><span class="vboxVMName">'+$('<span />').text(vmn.name).html()+'</span>'+ (vmn.currentSnapshotName ? '<span class="vboxVMChooserSnapshotName"> (' + $('<span />').text(vmn.currentSnapshotName).html() + ')</span>' : '')+'</div>');
			

			// Table gets tool tips
			tip = trans(vboxChooser._vmToolTip, 'UIVMListView').replace('%1',('<b>'+$('<span />')
				.text(vmn.name).html()+'</b>'+(vmn.currentSnapshotName ? ' (' + $('<span />')
						.text(vmn.currentSnapshotName).html() + ')' : '')))
				.replace('%2',trans(vboxVMStates.convert(vmn.state),'VBoxGlobal'))
				.replace('%3',vboxDateTimeString(vmn.lastStateChange))
				.replace('%4',trans(vmn.sessionState,'VBoxGlobal').toLowerCase());
			
			$(tbl).tipped({'source':tip,'position':'mouse','delay':1500});
		}
		
		$(tr).append(td).appendTo(tbl);
		
		// VM state row
		var tr = $('<tr />');
		var td = $('<td />').attr({'class':(vmn.id != 'host' && vmn.sessionState != 'Unlocked' ? 'vboxVMSessionOpen' : '')});

		// Add VirtualBox version if hosting
		if(vmn.id == 'host') {
			
			$(td).html("<div class='vboxFitToContainer vboxVMState'><img src='images/vbox/" + vboxMachineStateIcon(vmn.state) +"' /><span class='vboxVMState'>" + trans(vboxVMStates.convert(vmn.state),'VBoxGlobal') + ' - ' + $('#vboxPane').data('vboxConfig').version.string+'</span></div>');
			
			// Check for version mismatches?
			if(!vboxChooser._versionChecked) {
				vboxChooser._versionChecked = true;
				var vStr = $('#vboxPane').data('vboxConfig').phpvboxver.substring(0,$('#vboxPane').data('vboxConfig').phpvboxver.indexOf('-'));
				var vers = $('#vboxPane').data('vboxConfig').version.string.replace('_OSE','').split('.');
				if(vers[0]+'.'+vers[1] != vStr) {
					vboxAlert('This version of phpVirtualBox ('+$('#vboxPane').data('vboxConfig').phpvboxver+') is incompatible with VirtualBox ' + $('#vboxPane').data('vboxConfig').version.string + ". You probably need to <a href='http://sourceforge.net/projects/phpvirtualbox/files/' target=_blank>download the latest phpVirtualBox " + vers[0]+'.'+vers[1] + "-x</a>.<p>See the Versioning section below the file list in the link for more information</p>",{'width':'auto'});
				}
			}			
		} else {
			$(td).html("<div class='vboxFitToContainer vboxVMState'><img src='images/vbox/" + vboxMachineStateIcon(vmn.state) +"' /><span class='vboxVMState'>" + trans(vboxVMStates.convert(vmn.state),'VBoxGlobal') + '</span></div>');
		}
		
		$(tr).append(td).appendTo(tbl);

		// Droppable targets
		var td = $('<td />').attr({'colspan':'2'}).addClass('vboxChooserDropTarget vboxDropTargetBottom');
		if(vmn.id != 'host') {
			td.hover(function(){
				if(vboxChooser._dragging && vboxChooser._dragging != vmn.id)
					$(this).addClass('vboxChooserDropTargetHover');
				},function(){
					$(this).removeClass('vboxChooserDropTargetHover');
				}
			);
		}
		$('<tr />').addClass('vboxChooserDropTarget').css({'height':'4px'}).append(td).appendTo(tbl);
		
		
		// Context menus?
		if(vboxChooser._vmContextMenuObj) {
			
			$(tbl).contextMenu({
				menu: vboxChooser._vmContextMenuObj.menuId(),
				menusetup : function(el) {
					if(!$(el).hasClass('vboxListItemSelected')) $(el).trigger('click');
				}
			},function(act,el,pos,d,e){
				vboxChooser._vmContextMenuObj.menuClickCallback(act);
			});
			
			// Open settings on dblclick
			$(tbl).dblclick(function(){
				if(vboxChooser._vmContextMenuObj.menuItems['settings'].enabled())
					vboxChooser._vmContextMenuObj.menuItems['settings'].click();
			});
		}
		
		return tbl;
		
	},

	
	/*
	 * VM Group Dropped
	 */
	vmGroupDropped : function(e, droppedGroup) {
		
		
		$(vboxChooser._anchor).enableSelection();

		
		var vmGroupPath = vboxChooser._draggingGroup;		
		vboxChooser._draggingGroup = false;
		$(droppedGroup).removeClass('vboxHover');
		
		if(!vboxChooser._editable) return false;		
		
		// Cannot drag a group that contains a VM without
		// an unlocked session state if it will modify VM
		// Groups
		var sessionLocked = false;
		if($(droppedGroup).find('td.vboxVMSessionOpen')[0])
			sessionLocked=true;

		
		// Check for above/below group first
		var dropTarget = vboxChooser._anchor.find('div.vboxChooserDropTargetHover').first();
		if(dropTarget[0]) {

			// Make sure that this wasn't dropped onto a sub-group or itself
			if(
					!dropTarget.closest('div.vboxChooserGroup')[0]
							||
					vmGroupPath == dropTarget.closest('div.vboxChooserGroup').data('vmGroupPath')
							||
					dropTarget.closest('div.vboxChooserGroup').data('vmGroupPath').indexOf(vmGroupPath + '/') == 0 
			) {
				return;
			}


			// If we are not still in the same group, check for name conflict							
			var currParentGroupPath = $(droppedGroup).closest('div.vboxChooserGroup').parent().closest('div.vboxChooserGroup').data('vmGroupPath');
			
			if(dropTarget.closest('div.vboxChooserGroup').parent().closest('div.vboxChooserGroup').data('vmGroupPath') != currParentGroupPath) {

				// Do not allow to be dragged into another group
				// if there is a Vm with a locked session in this one
				if(sessionLocked && !$('#vboxPane').data('vboxConfig')['phpVboxGroups']) return;
				
				// Make sure there are no conflicts
				var groupName = $(droppedGroup).children('div.vboxChooserGroupIdentifier').attr('title');
				var newGroupName = groupName;
				

				var i = 2;
				while(vboxChooser.groupNameConflicts(dropTarget.closest('div.vboxChooserGroup').parent(), newGroupName)) {
					newGroupName = groupName + ' (' + (i++) + ')';				
				}
				
				$(droppedGroup).children('div.vboxChooserGroupIdentifier').attr({'title':newGroupName})
					.siblings('div.vboxChooserGroupHeader')
						.children('span.vboxChooserGroupName').text(newGroupName);
			
			}

			// Insert before or insert after?
			if(dropTarget.hasClass('vboxDropTargetTop')) {
				$(droppedGroup).detach().insertBefore(dropTarget.closest('div.vboxChooserGroup'));
			} else {
				$(droppedGroup).detach().insertAfter(dropTarget.closest('div.vboxChooserGroup'));
			}

			
		// Dropped onto a group or main VM list
		} else {
			
			// Will not do this if this group contains
			// a VM with a locked session
			if(sessionLocked && !$('#vboxPane').data('vboxConfig')['phpVboxGroups']) return;
			
			var dropTarget = vboxChooser._anchor.find('div.vboxHover').first();
			
			
			// Dropped onto a group
			if(dropTarget[0] && dropTarget.parent().hasClass('vboxChooserGroup')) {
				
				dropTarget = dropTarget.parent();
				
				// Make sure that this wasn't dropped onto a sub-group or itself
				if(
						vmGroupPath == dropTarget.data('vmGroupPath')
								||
						dropTarget.closest('div.vboxChooserGroup').data('vmGroupPath').indexOf(vmGroupPath + '/') == 0 
				) {
					return;
				}

			// Dropped onto main vm list
			} else if($(vboxChooser._anchor).find('div.vboxGroupHover').length == 0 && $(vboxChooser._anchor).hasClass('vboxChooserDropTargetHoverRoot')) {

				dropTarget = null;
				
				// Only showing one group?
				if(vboxChooser._showOnlyGroupHistory.length > 0) {
					dropTarget = $(vboxChooser._showOnlyGroupHistory[vboxChooser._showOnlyGroupHistory.length-1]);
				}

				if(!$(dropTarget)[0])
					dropTarget = vboxChooser._anchor.children('div.vboxChooserGroup');					
				
			} else {
				return;
			}
			
			// Make sure there are no conflicts
			var newElm = $(droppedGroup).detach();
			var groupName = $(droppedGroup).children('div.vboxChooserGroupIdentifier').attr('title');
			var newGroupName = groupName;
			
			var i = 2;
			while(vboxChooser.groupNameConflicts(dropTarget, newGroupName, $(newElm).data('vmGroupPath'))) {
				newGroupName = groupName + ' (' + (i++) + ')';				
			}
			
			$(newElm)
				.children('div.vboxChooserGroupIdentifier').attr({'title':newGroupName})
					.siblings('div.vboxChooserGroupHeader')
					.children('span.vboxChooserGroupName').text(newGroupName);
			$(newElm).insertBefore(dropTarget.children('div.vboxChooserGroupVMs'));
			
		}

		// vmGroup dropped - compose and save group definitions
		vboxChooser.composeGroupDef(true);
		
		// Hide group info
		vboxChooser._anchor.find('div.vboxChooserGroupHeader').trigger('mouseout');

		// Resize chooser elements
		vboxChooser._resizeElements();
		
		vboxChooser.selectionListChanged(vboxChooser._selectedList);
		
	},
	
	/*
	 * VM dropped
	 */
	vmDropped : function (e, droppedVM){
		
		
		$(vboxChooser._anchor).enableSelection();
		vboxChooser._dragging = null;
		
		if(!vboxChooser._editable) return false;

		// Cannot drag if this VM's session is not open
		var thisSessionLocked = false;
		var vmData = vboxVMDataMediator.getVMData($(droppedVM).data('vmid'));
		
		if(vmData.sessionState != 'Unlocked')
			thisSessionLocked = true;

		
		
		// Where was this dropped?
		var dropTarget = $('#'+vboxChooser._anchorid).find('td.vboxChooserDropTargetHover');
		
		// Dropped above / below a VM
		if(dropTarget[0]) {
			
			// Dropped from another group into this one,
			// but this group already has this VM
			if((dropTarget.closest('table').closest('div.vboxChooserGroup').data('vmGroupPath') != $(droppedVM).closest('div.vboxChooserGroup').data('vmGroupPath')) 
					&& dropTarget.closest('table').siblings('table.vboxChooserItem-'+vboxChooser._anchorid+'-'+$(droppedVM).data('vmid'))[0]) {
					return true;
			}
			
			// If session of this VM is locked, don't allow it to be
			// dragged out of current group
			if(thisSessionLocked && !$('#vboxPane').data('vboxConfig')['phpVboxGroups'] && ($(droppedVM).closest('div.vboxChooserGroup').data('vmGroupPath') != dropTarget.closest('div.vboxChooserGroup').data('vmGroupPath'))) {
				return
			}
			
			// Get VM from target's parent table
			if(dropTarget.hasClass('vboxDropTargetTop')) {
				if(!e.ctrlKey && !e.metaKey) {
					$(droppedVM).detach().insertBefore($(dropTarget).closest('table'));
				} else {
					// Copy
					if($(dropTarget).closest('table').parent().children('table.vboxChooserItem-'+vboxChooser._anchorid+'-'+vmData.id)[0])
							return;
					vboxChooser.vmHTML(vmData).insertBefore($(dropTarget).closest('table'));
				}
			} else {
				if(!e.ctrlKey && !e.metaKey) {
					$(droppedVM).detach().insertAfter($(dropTarget).closest('table'));
				} else {
					// Copy - Don't allow if it already exists
					if($(dropTarget).closest('table').parent().children('table.vboxChooserItem-'+vboxChooser._anchorid+'-'+vmData.id)[0])
						return;
					vboxChooser.vmHTML(vmData).insertAfter($(dropTarget).closest('table'));
				}
			}
		
		// Not dropped above / below vm
		} else {
			
			// Don't allow this if sessoin is locked
			if(thisSessionLocked && !$('#vboxPane').data('vboxConfig')['phpVboxGroups']) return;
			
			// Dropped ON a vm?
			dropTarget = $('#'+vboxChooser._anchorid).find('table.vboxHover:not(.ui-draggable-dragging)').first();
			if($(dropTarget).data('vmid')) {
			
				// Create a group?
				dropTarget = $('#'+vboxChooser._anchorid).find('table.vboxHover').first();
				
				// Nothing to do. Not dropped on valid target
				if(!dropTarget[0] || ($(dropTarget).data('vmid') == $(droppedVM).data('vmid'))) return true;
									
				// Dont' allow this if target VM's session is locked
				if($(dropTarget).find('td.vboxVMSessionOpen')[0])
					return;
				
				// Where to drop vboxChooser..
				var p = dropTarget.closest('div.vboxChooserGroup').children('div.vboxChooserGroupVMs');
				// assume root?
				if(!p[0]) p = vboxChooser._anchor.children('div.vboxChooserGroupVMs');

				// Determine group name
				var gname = trans('New group','UIGChooserModel');
				var tgname = gname;

				var i = 2;
				while(vboxChooser.groupNameConflicts($(p).parent(), tgname)) {
					tgname = gname + ' ' + (i++);
				}

			
				// New position is below target
				var ghtml = vboxChooser.groupHTML(String(dropTarget.closest('div.vboxChooserGroup').data('vmGroupPath')+'/'+tgname).replace('//','/'));
				
				if(!e.ctrlKey && !e.metaKey) {
					ghtml.children('div.vboxChooserGroupVMs').append($(droppedVM).detach());
				} else {
					ghtml.children('div.vboxChooserGroupVMs').append(vboxChooser.vmHTML(vmData));
				}
				ghtml.children('div.vboxChooserGroupVMs').append(dropTarget.detach());
				
				ghtml.insertBefore(p);
				
			// Dropped in the main VM list or group header?
			} else {
				
				dropTarget = $(vboxChooser._anchor).find('div.vboxHover').first();
				if(dropTarget[0] && dropTarget.hasClass('vboxChooserGroupHeader')) {
					
					// Group already has this dragging VM?
					if(dropTarget.siblings('div.vboxChooserGroupVMs').children('table.vboxChooserItem-'+vboxChooser._anchorid+'-'+$(droppedVM).data('vmid'))[0]) {
						return;
					}
										
					if(!e.ctrlKey && !e.metaKey)
						$(droppedVM).detach().appendTo(dropTarget.siblings('div.vboxChooserGroupVMs').first());
					else
						vboxChooser.vmHTML(vmData).appendTo(dropTarget.siblings('div.vboxChooserGroupVMs').first());
				
				// Main VM list
				} else if($(vboxChooser._anchor).find('div.vboxGroupHover').length == 0 && $(vboxChooser._anchor).hasClass('vboxChooserDropTargetHoverRoot')) {
				
					dropTarget = null;
					
					// Only showing one group?
					if(vboxChooser._showOnlyGroupHistory.length > 0) {
						dropTarget = $(vboxChooser._showOnlyGroupHistory[vboxChooser._showOnlyGroupHistory.length-1]);
					}

					if(!$(dropTarget)[0])
						dropTarget = vboxChooser._anchor.children('div.vboxChooserGroup');					

					// Already in this list?
					if(dropTarget.children('div.vboxChooserGroupVMs').children('table.vboxChooserItem-'+vboxChooser._anchorid+'-'+$(droppedVM).data('vmid'))[0]) {
						return true;
					}
					
					if(!e.ctrlKey && !e.metaKey) {
						$(droppedVM).detach().appendTo(dropTarget.children('div.vboxChooserGroupVMs').first());
					} else {
						vboxChooser.vmHTML(vmData).appendTo(dropTarget.children('div.vboxChooserGroupVMs').first());
					}

				}
			}
			
		}

		// vm dropped - compose and save group definitions
		vboxChooser.composeGroupDef(true);
		
		// Resize chooser elements
		vboxChooser._resizeElements();
		
		vboxChooser.selectionListChanged(vboxChooser._selectedList);
		
	},
	
	/*
	 * Group selected items into a new group
	 */
	groupSelectedItems : function() {
		
		// Get all group paths to determine new group target
		var groupPaths = {};
		vboxChooser._anchor.find('div.vboxVMGroupSelected').closest('div.vboxChooserGroup').each(function(idx,elm) {
			groupPaths[$(elm).data('vmGroupPath')] = 1;
		});
		vboxChooser._anchor.find('table.vboxListItemSelected').closest('div.vboxChooserGroup').each(function(idx,elm) {
			groupPaths[$(elm).data('vmGroupPath')] = 1;
		});
		
		// The group clsest to the root group will be the target
		var groupPathTarget = null;
		for(var i in groupPaths) {
			
			if(typeof(i) != 'string') continue;
			
			// Already at root group. Nothing to do
			if(groupPathTarget == '/') break;
			
			// No target set yet or equal targets, or this group is the root
			if(!groupPathTarget || groupPathTarget == i || i == '/') {
				groupPathTarget = i;
				continue;
			}
			
			var t1 = groupPathTarget.split("/");
			var t2 = i.split("/");
			for(var i = 0; i < Math.min(t1.length,t2.length); i++) {
				if(t1[i] != t2[i]) {
					groupPathTarget = '';
					for(var a = 0; a < i; a++) {
						groupPathTarget += "/" + t1[a];
					}
					groupPathTarget = groupPathTarget.replace('//','/');
					break;
				}
			}
			
			
		}
		
		var target = vboxChooser.getGroupElement(groupPathTarget, true);
		
		if(!$(target)[0]) return;
		
		// Determine group name
		var gname = trans('New group','UIGChooserModel');
		var tgname = gname;

		var i = 2;
		while(vboxChooser.groupNameConflicts($(target), tgname)) {
			tgname = gname + ' ' + (i++);
		}
		
		var gHTML = vboxChooser.groupHTML('/'+tgname);

		// Append group and vm elements
		vboxChooser._anchor.find('div.vboxVMGroupSelected').detach().insertAfter(gHTML.children('div.vboxChooserGroupHeader'));
		vboxChooser._anchor.find('table.vboxListItemSelected').detach().appendTo(gHTML.children('div.vboxChooserGroupVMs'));

		gHTML.insertBefore($(target).children('div.vboxChooserGroupVMs'));
		
		// group selected items,
		// Compose and save group definitions
		vboxChooser.composeGroupDef(true);
		
		// Resize chooser elements
		vboxChooser._resizeElements();


		
	},

	/**
	 * Compose group data from GUI and optionally save it
	 * 
	 * @param save - save group definitions to vbox
	 */
	composeGroupDef : function(save) {
		
		var allGroups = [];
		var groupsResolved = false;
		
		// Keep looping through group definitions until
		// there are no groups removed
		while(!groupsResolved) {
			
			allGroups = [];
			groupsResolved = true;
			
			vboxChooser._anchor.find('div.vboxChooserGroup:not(.ui-draggable-dragging)').each(function(idx,elm) {
				
				// Group element was removed
				if(!$(elm)[0]) return;
				
				// Compose group path
				var myPath = $(elm).children('div.vboxChooserGroupIdentifier').attr('title');
				if(!myPath) myPath = '/';
				$(elm).parents('div.vboxChooserGroup:not(.ui-draggable-dragging)').each(function(idx2,elm2){
					var pName = $(elm2).children('div.vboxChooserGroupIdentifier').attr('title');
					if(!pName) pName = '/';
					myPath = String(pName + '/' + myPath).replace('//','/');
				});
								
				// Groups
				var gList = [];
				$(elm).children('div.vboxChooserGroup:not(.ui-draggable-dragging)').each(function(idx2,elm2){
					
					// If this group is selected, we'll have to update its path
					// in the selection list
					var selected = $(elm2).hasClass('vboxVMGroupSelected');
					var oldPath = $(elm2).data('vmGroupPath');
					var newPath = String(myPath + '/' + $(elm2).children('div.vboxChooserGroupIdentifier').attr('title')).replace('//','/');
					
					gList[gList.length] = $(elm2).children('div.vboxChooserGroupIdentifier').attr('title');
					
					// set / correct group path data
					$(elm2).data('vmGroupPath', newPath);
					
					// Group's path changed?
					if(selected && (oldPath != newPath)) {
						for(var i = 0; i < vboxChooser._selectedList.length; i++) {
							if(vboxChooser._selectedList[i].type == 'group' && vboxChooser._selectedList[i].groupPath == oldPath) {
								vboxChooser._selectedList[i].groupPath = String(myPath + '/' + $(elm2).children('div.vboxChooserGroupIdentifier').attr('title')).replace('//','/');
								break;
							}
						}							
					}
					
				});
				
				// VMs
				var vmList = [];
				$(elm).children('div.vboxChooserGroupVMs').children('table.vboxChooserVM:not(.ui-draggable-dragging)').each(function(idx3,elm3){
					vmList[vmList.length] = $(elm3).data('vmid');
				});
				
				// Skip and remove if there are no VMs or subgroups
				// And it is not the parent group
				if(gList.length + vmList.length == 0 && !$(elm).hasClass('vboxChooserGroupRoot')) {
					
					// remove from selected list?
					if(elm && $(elm).hasClass('vboxVMGroupSelected')) {
					
						var myPath = $(elm).data('vmGroupPath');
						// Deselect item
						vboxChooser._selectedList = vboxChooser._selectedList.filter(function(v){
							return (v.type != 'group' || (v.groupPath != myPath));
						});
					}
					$(elm).empty().remove();
					groupsResolved = false;
					return false;
				}
				
				// append to all groups list
				gorder = [];
				if(gList.length) gorder[0] = 'go='+gList.join(',go=');
				if(vmList.length) gorder[gorder.length] = 'm='+vmList.join(',m=');
				allGroups[allGroups.length] = {
					path: $(elm).data('vmGroupPath'),
					order: gorder.join(',')
				};
				
				// Update counts span
				$(elm).children('div.vboxChooserGroupVMs').css({'display':(vmList.length || $(elm).data('vmGroupPath') == '/' ? '' : 'none')})
					.siblings('div.vboxChooserGroupHeader')
					.each(function(hidx,header) {
						
						var staticTip = '<strong>'+$(header).siblings('div.vboxChooserGroupIdentifier').attr('title')+'</strong>'+
							(gList.length ? ('<br />' + trans('%n group(s)','UIGChooserItemGroup',gList.length).replace('%n',gList.length)) : '') +
							(vmList.length ? ('<br />' + trans('%n machine(s)','UIGChooserItemGroup',vmList.length).replace('%n',vmList.length)) : '');

						$(header).tipped({'source':function() {
									
							// find number of running VMs
							var runningVMs = 0;
							
							if(vmList.length) {
								$(header).siblings('div.vboxChooserGroupVMs').find('td.vboxVMSessionOpen').each(function(idx,elm3) {
									if(vboxVMStates.isRunning(vboxVMDataMediator.getVMData($(elm3).closest('table').data('vmid'))))
										runningVMs++;
								});								
							}
							
							return staticTip + (runningVMs > 0 ? ' ' + trans('(%n running)','UIGChooserItemGroup',runningVMs).replace('%n', runningVMs) : '');
						}
							,'position':'mouse','delay':1500});
					})
						.children('span.vboxChooserGroupInfo')
						.children('span.vboxChooserGroupCounts').html(
							(gList.length ? ('<span style="background-image:url(images/vbox/group_abstract_16px.png);" />'+gList.length) : '') +
							(vmList.length ? ('<span style="background-image:url(images/vbox/machine_abstract_16px.png);" />'+vmList.length) : '')
				);
			});
			
		}
		
		// Save GUI group definition?
		if(!save) return;
		
		
		// Tell the interface we're about to save groups
		vboxChooser._editable = false;
		$('#vboxPane').trigger('vmGroupDefsSaving');
		
		vboxChooser._groupDefs = allGroups;
		
		// Save machine groups and trigger change
		var vms = [];
		var vmList = vboxVMDataMediator.getVMList();
		for(var i = 0; i < vmList.length; i++) {
			
			if(!vmList[i] || vmList[i].id == 'host') continue;

			/* If a VM's groups have changed, add it to the list */
			var eGroups = vmList[i].groups;
			var nGroups = vboxChooser.getGroupsForVM(vmList[i].id);
			
			if($(nGroups).not(eGroups).length || $(eGroups).not(nGroups).length) {
			
				vms[vms.length] = {
					'id' : vmList[i].id,
					'groups' : nGroups
				};				
			}
		}
		
		// Save machines groups?
		if(vms.length) {

			// Reload VMs and group definitions
			var reloadAll = function() {
				
				var ml = new vboxLoader();
				ml.add('vboxGetMedia',function(d){$('#vboxPane').data('vboxMedia',d.responseData);});
				ml.add('vboxGroupDefinitionsGet',function(d){vboxChooser._groupDefs = d.responseData;});
				
				// Reload VM list and group definitions, something went wrong
				ml.onLoad = function() {
					
					// Stop vmlist from refreshing..
					vboxChooser.stop();
					
					// reset selections
					$('#vboxPane').trigger('vmSelectionListChanged',[vboxChooser]);
					
					// ask for new one
					vboxChooser.start();
				};
				ml.run();				
			};
			
			$.when(vboxAjaxRequest('machinesSaveGroups',{'vms':vms})).done(function(res){
				
				if(res.responseData.errored) {
					reloadAll();
					vboxChooser._editable = true;
					$('#vboxPane').trigger('vmGroupDefsSaved');
				} else {
					$.when(vboxAjaxRequest('vboxGroupDefinitionsSet',{'groupDefinitions':allGroups})).always(function(){
						vboxChooser._editable = true;
						$('#vboxPane').trigger('vmGroupDefsSaved');
					});
				}
				
			}).fail(reloadAll);
			
		} else {
			$.when(vboxAjaxRequest('vboxGroupDefinitionsSet',{'groupDefinitions':allGroups})).always(function(){
				vboxChooser._editable = true;
				$('#vboxPane').trigger('vmGroupDefsSaved');
			});
		}
		
		
		return allGroups;
		
	},
	
	/*
	 * Return a list of groups that VM is a member of
	 */ 
	getGroupsForVM : function(vmid) {
		var gPathList = [];
		vboxChooser._anchor.find('table.vboxChooserItem-'+vboxChooser._anchorid+'-'+vmid+':not(.ui-draggable-dragging)').each(function(idx,elm){
			var gParent = $(elm).closest('div.vboxChooserGroup');
			if(!gParent.hasClass('ui-draggable-dragging'))
				gPathList[gPathList.length] = gParent.data('vmGroupPath');
		});
		return gPathList;
	},
	
	/*
	 * Determine whether or not a group name conflicts
	 * with another group in parent
	 */
	groupNameConflicts : function(parentGroup, name, ignoreGroupAtPath) {
		var found = false;
		parentGroup.children('div.vboxChooserGroup:not(.ui-draggable-dragging)').children('div.vboxChooserGroupIdentifier[title="'+name+'"]').parent().each(function(i,elm){
			
			if(ignoreGroupAtPath && (ignoreGroupAtPath == $(elm).data('vmGroupPath')))
				return true;
			
			found=true;
			return false;
		});
		return found;
	},
	
	/*
	 * Ungroup selected group
	 */
	unGroupSelectedGroup : function() {

		var target = $(vboxChooser.getSelectedGroupElements()[0]).siblings('div.vboxChooserGroupVMs');
		
		// Groups
		// - ignore group at path we are currently ungrouping
		var ignoreGroup = $(vboxChooser.getSelectedGroupElements()[0]).data('vmGroupPath');
		$(vboxChooser.getSelectedGroupElements()[0]).children('div.vboxChooserGroup').each(function(i,elm) {
			
			// Make sure there are no conflicts
			var newElm = $(elm).detach();
			var groupName = $(elm).children('div.vboxChooserGroupIdentifier').attr('title');
			var newGroupName = groupName;

			var i = 2;
			while(vboxChooser.groupNameConflicts($(target).parent(), newGroupName, ignoreGroup)) {
				newGroupName = groupName + ' (' + (i++) + ')';				
			}
			
			$(newElm).children('div.vboxChooserGroupIdentifier').attr({'title':newGroupName})
				.siblings('div.vboxChooserGroupHeader')
					.children('span.vboxChooserGroupName').text(newGroupName);
			
			$(newElm).insertBefore(target);
			
		});
		
		// VMs
		$(vboxChooser.getSelectedGroupElements()[0]).children('div.vboxChooserGroupVMs').children().each(function(i,elm){
			$(elm).detach();
			if(!target.children('table.vboxChooserItem-'+vboxChooser._anchorid+'-'+$(elm).data('vmid'))[0])
				target.append(elm);
		});
		

		// ungroup selected items
		// compose and save group definitions
		vboxChooser.composeGroupDef(true);
		
		// Resize chooser elements
		vboxChooser._resizeElements();

		vboxChooser.selectionListChanged();
		

	},
	
	/*
	 * Sort group sub-elements based on VirtualBox
	 * group definitions
	 */
	sortGroup : function(gElm) {
		
		// Find group orders
		var gPath = $(gElm).data('vmGroupPath');
		var groupList = vboxChooser._groupDefs;
		
		if(!(gPath && groupList)) return;
		
		var machineOrder = [];
		var groupOrder = [];
		
		// Get correct order
		for(var i = 0; i < groupList.length; i++) {
			if(groupList[i].path == gPath) {
				order = groupList[i].order.split(',');
				for(var a = 0; a < order.length; a++) {
					kv = order[a].split('=',2);
					if(kv[0] == 'm') machineOrder[machineOrder.length] = kv[1];
					else groupOrder[groupOrder.length] = kv[1];
				}
			}
		}
		
		// sort groups
		var groups = $(gElm).children('div.vboxChooserGroup').get();
		var maxPos = groups.length;
		groups.sort(function(a,b){
			
			var Pos1 = jQuery.inArray($(a).children('div.vboxChooserGroupIdentifier').attr('title'), groupOrder);
			var Pos2 = jQuery.inArray($(b).children('div.vboxChooserGroupIdentifier').attr('title'), groupOrder);

			if(Pos1==-1) Pos1 = maxPos;
			if(Pos2==-1) Pos2 = maxPos;

			return (Pos1 > Pos2 || Pos1 == -1 ? -1 : (Pos2 == Pos1 ? 0 : 1));
			
		});
		$.each(groups, function(idx,itm) {
			$(itm).insertAfter($(gElm).children('div.vboxChooserGroupHeader'));
		});
		
		// sort VMs
		var vms = $(gElm).children('div.vboxChooserGroupVMs').children('table.vboxChooserVM').get();
		var maxPos = vms.length;
		vms.sort(function(a,b) {
			
			var Pos1 = jQuery.inArray($(a).data('vmid'), machineOrder);
			var Pos2 = jQuery.inArray($(b).data('vmid'), machineOrder);
			
			if(Pos1==-1) Pos1 = maxPos;
			if(Pos2==-1) Pos2 = maxPos;
			
			return (Pos1 > Pos2 ?  1 : (Pos2 == Pos1 ? 0 : -1));

		});
		$.each(vms, function(idx,itm) {
			$(gElm).children('div.vboxChooserGroupVMs').append(itm);
		});
		
		
	},
	
	/*
	 * Sort selected group by item names
	 */
	sortSelectedGroup : function(rootElm) {

		var el = $(vboxChooser.getSelectedGroupElements()[0]);
		
		if(rootElm || !el) {
			el = vboxChooser._anchor.children('div.vboxChooserGroup');
		}
		
		// sort groups
		var groups = $(el).children('div.vboxChooserGroup').get();
		groups.sort(function(a,b){
			return $(b).children('div.vboxChooserGroupIdentifier').attr('title').localeCompare($(a).children('div.vboxChooserGroupIdentifier').attr('title'));
		});
		$.each(groups, function(idx,itm) {
			$(itm).insertAfter($(el).children('div.vboxChooserGroupHeader'));
		});
		
		// sort VMs
		var vms = $(el).children('div.vboxChooserGroupVMs').children('table.vboxChooserVM').get();
		vms.sort(function(a,b) {
			return $(a).find('span.vboxVMName').text().localeCompare($(b).find('span.vboxVMName').text());
		});
		$.each(vms, function(idx,itm) {
			$(el).children('div.vboxChooserGroupVMs').append(itm);
		});
		
		// compose and save group definitions
		vboxChooser.composeGroupDef(true);

	},
	
	/*
	 * Rename selected group
	 */
	renameSelectedGroup : function() {
		
		var el = $(vboxChooser.getSelectedGroupElements()[0]);
		
		// Function to rename group
		var renameGroup = function(e, textbox) {
			
			if(!textbox) textbox = $(this);
			
			var newName = $(textbox).val().replace(/[\\\/:*?"<>,]/g,'_');
			
			if(newName && newName != $(textbox).closest('div.vboxChooserGroup').children('div.vboxChooserGroupIdentifier').attr('title')) {
				
				// Do not rename if it conflicts
				var noConflict = newName;
				var i = 2;
				while(vboxChooser.groupNameConflicts($(textbox).parent().parent().parent().parent(), noConflict)) {
					noConflict = newName + ' (' + (i++) + ')';
				}
				newName = noConflict;
				
				$(textbox).closest('div.vboxChooserGroup')
					.children('div.vboxChooserGroupIdentifier').attr({'title':newName})
					.siblings('div.vboxChooserGroupHeader')
						.children('span.vboxChooserGroupName').html(newName);

				// group renamed, compose and save groups
				vboxChooser.composeGroupDef(true);
				
				// Write out collapsed group list
				vboxChooser._saveCollapsedGroups();

			}
			
			
			$(textbox).parent().parent().children().css({'display':''});
			$(textbox).parent().empty().remove();
		};
		
		$(el).children('div.vboxChooserGroupHeader').children().css({'display':'none'});
		$(el).children('div.vboxChooserGroupHeader').append(
			
			$('<form />').append(
				$('<input />').attr({'type':'text','value':$(el).children('div.vboxChooserGroupIdentifier').attr('title')}).css({'width':'90%','padding':'0px','margin':'0px'}).on('keypress',function(e){
					if (e.which == 13) {
						$(this).off('blur', renameGroup);
						renameGroup(e,this);
						e.stopPropagation();
						e.preventDefault();
						$(this).trigger('blur');
						return false;
					}
				})
			)

		);
		$(el).children('div.vboxChooserGroupHeader').children('form').children('input').focus().select().blur(renameGroup);

	},

	/*
	 * Select a single group
	 */
	_selectGroup : function(gelm) {		
		$(gelm).addClass('vboxVMGroupSelected');
	},
	
	/*
	 * Deselect a single group
	 */
	_deselectGroup : function(gelm) {
		
		$(gelm).removeClass('vboxVMGroupSelected');
	},
	
	/*
	 * Select (or unselect) an item in our list. Called onmousedown or onCLick
	 */
	selectItem : function(e) {
		
		// Right click selects item if it is not selected
		if(e.which != 1) {
	
			// Right click on group header and group is selected
			// just return and show context menu
			if($(this).hasClass('vboxChooserGroupHeader') && $(this).parent().hasClass('vboxVMGroupSelected')) {
				return true;
			
			// Right click on VM and VM is already selected
			// just return and show context menu
			} else if($(this).hasClass('vboxListItemSelected')) {
				return true;
			}
		}
		
		var selectedList = [];
		var item = $(this);
		
		
		// Group?
		if($(item).hasClass('vboxChooserGroupHeader')) {
			
			
			// No control key. Exclusive selection
			if(!e.ctrlKey && !e.metaKey) {
				
				// already selected
				if(vboxChooser._selectedList.length == 1 && vboxChooser._selectedList[0].type == 'group' &&
						vboxChooser._selectedList[0].groupPath == $(item).parent().data('vmGroupPath'))
					return true;

				vboxChooser._anchor.find('.vboxListItemSelected').removeClass('vboxListItemSelected');
				vboxChooser._anchor.find('div.vboxVMGroupSelected')
					.each(function(idx,gelm) {
						vboxChooser._deselectGroup(gelm);
					});
				
				
					
				// select current group
				vboxChooser._selectGroup($(item).parent());

				selectedList = [{
					type: 'group',
					groupPath: $(item).parent().data('vmGroupPath')
				}];

			// Already selected, and ctrl key
			} else if($(item).parent().hasClass('vboxVMGroupSelected')){
				
				// Deselect item
				selectedList = vboxChooser._selectedList.filter(function(v){
					return (v.type != 'group' || (v.groupPath != $(item).parent().data('vmGroupPath')));
				});
				
				vboxChooser._deselectGroup($(item).parent());
			
			// Not already selected, and ctrl key
			} else {
	
				vboxChooser._selectGroup($(item).parent());
				
				selectedList = vboxChooser._selectedList;
				
				selectedList[selectedList.length] = {
					type: 'group',
					groupPath: $(item).parent().data('vmGroupPath')
				};
				
			}
			
			
		// VM
		} else {
			
			// No ctrl key or selection is host. Exclusive selection
			if((!e.ctrlKey && !e.metaKey) || $(item).data('vmid') == 'host') {
				
				vboxChooser._anchor.find('.vboxListItemSelected').removeClass('vboxListItemSelected');
				vboxChooser._anchor.find('div.vboxVMGroupSelected').removeClass('vboxVMGroupSelected')
					.each(function(idx,gelm){
						vboxChooser._deselectGroup(gelm);
					});
				
				// Select current VM
				$(item).addClass('vboxListItemSelected').removeClass('vboxHover');
				
				// already selected
				if(vboxChooser._selectedList.length == 1 && vboxChooser._selectedList[0].type == 'vm' &&
						vboxChooser._selectedList[0].id == $(item).data('vmid'))
					return true;

				selectedList = [{
					type: 'vm',
					id: $(item).data('vmid'),
					groupPath: $(item).parent().data('vmGroupPath')
				}];
				
			// Already selected, and ctrl key
			} else if($(item).hasClass('vboxListItemSelected')) {

				// Deselect item
				selectedList = vboxChooser._selectedList.filter(function(v){
					return (v.type == 'group' || (v.id != $(item).data('vmid')));
				});
				
				$(item).removeClass('vboxListItemSelected');
			
			// ctrl key, but not already selected
			} else {
				
				$(item).addClass('vboxListItemSelected').removeClass('vboxHover');
				
				selectedList = vboxChooser._selectedList;
				
				selectedList[selectedList.length] = {
					type: 'vm',
					id: $(item).data('vmid'),
					groupPath: $(item).parent().data('vmGroupPath')
				};
				
			}
			
		}

		// Remove host?
		if(selectedList.length > 1) {

			// Deselect host
			selectedList = selectedList.filter(function(v){
				return (v.type == 'group' || (v.id != 'host'));
			});
			
			vboxChooser._anchor.children('table.vboxChooserItem-'+vboxChooser._anchorid+'-host').removeClass('vboxListItemSelected');
			
		}
		
		vboxChooser.selectionListChanged(selectedList);
		
		return true;

		
	},
	
	/*
	 * Show only single group element identified by gelm
	 */
	showOnlyGroupElm : function(gelm) {

		// Going backwards affects animations
		var back = false;
		
		// gelm is null if we're going backwards
		if(!gelm) {
			
			
			if(vboxChooser._showOnlyGroupHistory.length > 1) {
				// this gets rid of current
				vboxChooser._showOnlyGroupHistory.pop();
				// selects previous
				gelm = vboxChooser._showOnlyGroupHistory.pop();
				back = true;
			} else {
				gelm = null;
			}
			
			
		} else {
			
			// Hold history
			vboxChooser._showOnlyGroupHistory[vboxChooser._showOnlyGroupHistory.length] = gelm;			
		}
		
		
		// No scrolling
		vboxChooser._anchor.css({'overflow-y':'hidden'});

		if($(gelm)[0]) {
			
			
			// Slide over or back
			$.when(vboxChooser._anchor.hide('slide', {direction: (back ? 'right' : 'left'), distance: (vboxChooser._anchor.outerWidth()/1.5)}, 200)).always(function() {
				

				/* hide host when showing only a group */
				$('table.vboxChooserItem-'+vboxChooser._anchorid+'-host').hide();


				/* Undo anything previously performed by this */
				vboxChooser._anchor.find('div.vboxChooserGroupHide').removeClass('vboxChooserGroupHide vboxChooserGroupHideShowContainer');
				vboxChooser._anchor.find('div.vboxChooserGroupShowOnly').removeClass('vboxChooserGroupShowOnly');

				$(gelm).parents('div.vboxChooserGroup').addClass('vboxChooserGroupHide vboxChooserGroupHideShowContainer').siblings().addClass('vboxChooserGroupHide');
				
				vboxChooser._anchor.find('div.vboxChooserGroupRootLevel').removeClass('vboxChooserGroupRootLevel');
				$(gelm).addClass('vboxChooserGroupShowOnly vboxChooserGroupRootLevel').siblings().addClass('vboxChooserGroupHide');

				$.when(vboxChooser._anchor.show('slide', {direction: (back ? 'left' : 'right'), distance: (vboxChooser._anchor.outerWidth()/1.5)}, 200))
					.done(function(){
						
						// Restore scrolling
						vboxChooser._anchor.css({'overflow-y':'auto'});
						
						// Hide group info
						$(gelm).find('div.vboxChooserGroupHeader').trigger('mouseout');
						
						// Reset title sizes
						vboxChooser._resizeElements();
						
						// force redraw of these
						$(gelm).find('.vboxFitToContainer').css({'display':'none'}).css({'width':'','display':''});
						

					});
								
			});
			
		} else {

			vboxChooser._showOnlyGroupHistory = [];

			// Slide back to anchor
			$.when(vboxChooser._anchor.hide('slide', {direction: 'right', distance: (vboxChooser._anchor.outerWidth()/1.5)}, 200)).always(function() {

				/* show host when going back to main list */
				$('table.vboxChooserItem-'+vboxChooser._anchorid+'-host').show();
	
				vboxChooser._anchor.find('div.vboxChooserGroupHide').removeClass('vboxChooserGroupHide vboxChooserGroupHideShowContainer');
				vboxChooser._anchor.find('div.vboxChooserGroupShowOnly').removeClass('vboxChooserGroupShowOnly ');
				
				vboxChooser._anchor.find('div.vboxChooserGroupRootLevel').removeClass('vboxChooserGroupRootLevel');
				vboxChooser._anchor.children('div.vboxChooserGroupRoot').addClass('vboxChooserGroupRootLevel');

				$.when(vboxChooser._anchor.show('slide', {direction: 'left', distance: (vboxChooser._anchor.outerWidth()/1.5)}, 200))
					.done(function(){

						// Restore scrolling
						vboxChooser._anchor.css({'overflow-y':'auto'});

						// Hide group info
						vboxChooser._anchor.find('div.vboxChooserGroupHeader').trigger('mouseout');
						
						// Reset title sizes
						vboxChooser._resizeElements();

						// force redraw of these
						vboxChooser._anchor.find('.vboxFitToContainer').css({'display':'none','width':''}).css({'display':''});
					});
			});
		}
			
	},
	
	/*
	 * Return HTML for group
	 */
	groupHTML : function(gpath) {
		
		if(!gpath) gpath = '/';
	 	var first = gpath == '/';
	 	var gname = gpath.substring(gpath.lastIndexOf('/')+1);
	 	var collapsed = vboxChooser._isGroupCollapsed(gpath);
	 	
		var gHTML = $('<div />').append(
				$('<div />').addClass('vboxChooserGroupIdentifier').css({'display':'none'}).attr({'title':gname})
			).append(
			$('<div />').addClass('vboxChooserGroupHeader').css({'display':(first ? 'none' : '')})
				.attr({'title':gname})
				.dblclick(function() {

					// Already collapsed?
					var collapsed = $(this).closest('div.vboxChooserGroup').hasClass('vboxVMGroupCollapsed');
					
					// Button rotation function
					var rotateButton = function(){return true;};
						
					var vboxArrowImage = $(this).find('span.vboxChooserGroupNameArrowCollapse');

					if(!($.browser.msie && $.browser.version.substring(0,1) < 9)) {
						
						rotateButton = function() {
							
							return $('<div />').animate({left:90},{
								duration: 300,
								step: function(currentStep) {
									if(!collapsed) currentStep = (90 - currentStep);
									vboxArrowImage.css({
										'transform':'rotate('+currentStep+'deg)',
										'-moz-transform': 'rotate('+currentStep+'deg)',
										'-webkit-transform': 'rotate('+currentStep+'deg)',
										'-o-transform': 'rotate('+currentStep+'deg)',
										'-ms-transform': 'rotate('+currentStep+'deg)'
									});
								},
								queue: true,
								complete: function() {
									vboxArrowImage.css({
										'transform':'',
										'-moz-transform': '',
										'-webkit-transform': '',
										'-o-transform': '',
										'-ms-transform': ''
									});
								}
								
							});
						};
					}

					
					// Run button rotation and toggle class
					$.when(rotateButton(), $(this).closest('div.vboxChooserGroup').toggleClass('vboxVMGroupCollapsed', ($.browser.msie && $.browser.version.substring(0,1) < 9) ? undefined : 300)).always(function(){
						
						// Write out collapsed group list
						vboxChooser._saveCollapsedGroups();
						
						// Reset title sizes
						vboxChooser._resizeElements();
					});


				})
				.append(
						$('<div />').addClass('vboxChooserDropTarget')
							.addClass('vboxDropTargetTop').hover(function(){
							if(vboxChooser._draggingGroup)
								$(this).addClass('vboxChooserDropTargetHover' + (first ? 'ignore' : ''));
						}, function(){
							$(this).removeClass('vboxChooserDropTargetHover');
						})
				)
				.append(
						$('<span />').addClass('vboxChooserGroupNameArrowLeft vboxChooserGroupNameArrowCollapse vboxArrowImage')
								.mousedown(function(e){
									e.stopPropagation();
									e.preventDefault();
									return false;
								}).mouseup(function(){
									$(this).closest('div.vboxChooserGroupHeader').trigger('dblclick');									
								})
						
				).append(
						
					$('<span />').addClass('vboxChooserGroupNameArrowLeft vboxChooserGroupShowOnlyBack vboxArrowImage')
						.click(function(e) {
							e.stopPropagation();
							e.preventDefault();
							vboxChooser.showOnlyGroupElm();
							return false;

						})
							
				)
				.append($('<span />').addClass('vboxChooserGroupInfo').html(
						"<span class='vboxChooserGroupCounts' />"
						).append(
							$('<span />').addClass('vboxChooserGroupShowOnly vboxArrowImage')
								.click(function(e){
									e.stopPropagation();
									e.preventDefault();
									vboxChooser.showOnlyGroupElm($(this).closest('div.vboxChooserGroup'));
									return false;
								})
							
						))
				.append($('<span />').html(gname).addClass('vboxChooserGroupName vboxFitToContainer'))
				.append(
					$('<div />').addClass('vboxChooserDropTarget vboxChooserDropTargetBottom')
						.hover(function(){
							if(vboxChooser._draggingGroup)
								$(this).addClass('vboxChooserDropTargetHover' + (first ? 'ignore' : ''));
						}, function(){
							$(this).removeClass('vboxChooserDropTargetHover');
					})

				)
				.hover(function(){
					
					if(vboxChooser._compact) return;
					
					$(this).addClass('vboxHover');

					// Resize title and add hover class?
					if(!$(this).parent().hasClass('vboxChooserGroupRoot')) {
						
						// Set width of title to -group info span width
						var infoWidth = $(this).children('span.vboxChooserGroupInfo').width();
						var pWidth = $(this).width();
						
						$(this).children('span.vboxChooserGroupName').css({'max-width':(pWidth-infoWidth-20)+'px'});
						
					}
					
					
				},function(){
					
					// Resize title and remove hover class
					$(this).removeClass('vboxHover');
					
					if(!$(this).parent().hasClass('vboxChooserGroupRoot'))
						$(this).children('span.vboxChooserGroupName').css({'max-width':''});
					
				}).on('mousedown',vboxChooser.selectItem)				

			).addClass((first ? 'vboxChooserGroupRoot vboxChooserGroupRootLevel ' : (collapsed ? 'vboxVMGroupCollapsed ' : '')) + 'vboxChooserGroup')
			.data({'vmGroupPath':gpath})
			.draggable({'cursorAt':{left: -10, top: -10},'helper':function(){
				
				return $(this).clone().addClass('vboxVMGroupCollapsed vboxVMGroupSelected')
					.children('div.vboxChooserGroupHeader').removeClass('vboxHover').children('.vboxChooserGroupNameArrowCollapse')
					.hide().closest('div.vboxChooserGroup').css({'width':$(this).width()+'px'});
									
				
				},'start':function() {
										
					if(!$('#vboxPane').data('vboxSession').admin) return false;
					
					if(!vboxChooser._editable) return false;
					
					vboxChooser._draggingGroup = $(this).data('vmGroupPath');
					$(vboxChooser._anchor).disableSelection();
				
				},'stop':function(e) {
					vboxChooser.vmGroupDropped(e,$(this));					
					
			}}).append($('<div />').addClass('vboxChooserGroupVMs'));


		// Bottom drop target
		if(!first) {
			gHTML.hover(function(){
				$(this).addClass('vboxGroupHover'); }, function() {
					$(this).removeClass('vboxGroupHover');
			}).append(
				$('<div />').addClass('vboxChooserDropTarget vboxChooserDropTargetBottom')
					.hover(function(){
						if(vboxChooser._draggingGroup)
							$(this).addClass('vboxChooserDropTargetHover');
					}, function(){
						$(this).removeClass('vboxChooserDropTargetHover');
				})
			);
		}

		

		// Group context menu
		$(gHTML).contextMenu({
			menu: vboxChooser._vmGroupContextMenuObj.menuId(),
			menusetup: function(el) {
				$(el).children('div.vboxChooserGroupHeader').trigger('click');
			}
		},function(act,el,pos,d,e){
			vboxChooser._vmGroupContextMenuObj.menuClickCallback(act, el);
		});
		
		return gHTML;
		
		
	
	},
	
	/*
	 * Return selected VM elements
	 */
	getSelectedVMElements : function() {
		return vboxChooser._anchor.find('table.vboxSelected');
	},
	
	/*
	 * Return selected group elements
	 */
	getSelectedGroupElements : function() {
		return vboxChooser._anchor.find('div.vboxVMGroupSelected');
	},
	
	
	/*
	 * Start VM list update
	 */ 
	start : function(anchorid) {
		
		// already running?
		if(vboxChooser._running) return;
		vboxChooser._running = true;

		// Where are we drawn?
		if(anchorid) {
			vboxChooser._anchorid = anchorid;
			vboxChooser._anchor = $('#'+anchorid);
		}
		
		
		// Set group definition key
		vboxChooser._groupDefinitionKey = $('#vboxPane').data('vboxConfig')['groupDefinitionKey'];
		
		// Get collapsed group list
		vboxChooser._collapsedGroups = vboxGetLocalDataItem($('#vboxPane').data('vboxConfig').key+'-collapsedGroups', true);
		if(!vboxChooser._collapsedGroups) vboxChooser._collapsedGroups = [];
		else vboxChooser._collapsedGroups = vboxChooser._collapsedGroups.split(',');
		

		// Get groups and machine list. datamediator will start listener
		$.when(vboxAjaxRequest('vboxGroupDefinitionsGet')).done(function(g) {
			
			vboxChooser._groupDefs = g.responseData;
			
			$.when(vboxVMDataMediator.getVMList()).done(function(d) {
				vboxChooser.updateList(d);
			});			
		});
		
	},
		
	/*
	 * Stop VM list updates and clear list
	 */
	stop : function() {
		
		if(!vboxChooser._running) return;
		vboxChooser._running = false;
		
		vboxChooser._anchor.html("<div id='vboxChooserSpinner' style='text-align: center'><div><img src='images/spinner.gif' /></div></div>");
		
		// reset vars
		vboxChooser._versionChecked = false;
		vboxChooser._selectedList = [];
		vboxChooser.selectedVMs = [];
		vboxChooser.selectionMode = vboxSelectionModeNone;
		
	}
	
	

};

$(document).ready(function(){

	// Calculate scrollbar width
	vboxChooser._scrollbarWidth = getScrollbarWidth();
	
	// "Stop" chooser
	$('#vboxPane').on('hostChange',function(){
	
		vboxChooser.stop();
		
	}).on('hostChanged',function(){
	
	
		vboxChooser.start();
		
	// Refresh menus
	}).on('vmGroupDefsSaving vmGroupDefsSaved vmSelectionListChanged', function() {
		
		if(vboxChooser._vmGroupContextMenuObj)
			vboxChooser._vmGroupContextMenuObj.update(vboxChooser);		
		if(vboxChooser._vmContextMenuObj)
			vboxChooser._vmContextMenuObj.update(vboxChooser);

			
	// Event list queue
	}).on('vboxEvents',function(e, eventList) {

		var redrawVMs = [];
		var sortGroups = [];
		var groupsChanged = false;
		var selectedChanged = false;
		var resizeElements = false;
		
		for(var i = 0; i < eventList.length; i++) {
			
			switch(eventList[i].eventType) {

				////////////////////////////////
				//
				// Machine data changed
				//
				////////////////////////////////
				case 'OnMachineDataChanged':
					
					// Shorthand
					var vmid = eventList[i].machineId;
					var data = vboxVMDataMediator.getVMData(vmid);

					// Update VM in list
					if(data) {
						
						// Enforce VM ownership
						if($('#vboxPane').data('vboxConfig').enforceVMOwnership && !$('#vboxPane').data('vboxSession').admin && data.owner != $('#vboxPane').data('vboxSession').user) {
							break;
						}

						redrawVMs[redrawVMs.length] = vmid;
						
						// Make sure VM has root group at least
						if(data.groups.length == 0) data.groups = ['/'];
						
						// Remove from groups if they have changed
						var currGroups  = vboxChooser.getGroupsForVM(vmid);
						var groupDiff = $(currGroups).not(data.groups);
						groupsChanged = groupDiff.length;
						for(var a = 0; a < groupDiff.length; a++) {
							
							var gElm = vboxChooser.getGroupElement(groupDiff[a], false);
							if(!$(gElm)[0]) return;
							
							selectedChanged = (selectedChanged || $(gElm).children('div.vboxChooserGroupVMs').closest('div.vboxVMGroupSelected').length);
							
							$(gElm).children('div.vboxChooserGroupVMs')
								.children('table.vboxChooserItem-'+vboxChooser._anchorid+'-'+data.id).empty().remove();
							
						}
						
						// Add to other groups
						var groupDiff = $(data.groups).not(currGroups);
						groupsChanged = (groupsChanged || groupDiff.length);
						for(var a = 0; a < groupDiff.length; a++) {
							
							var gElm = vboxChooser.getGroupElement(groupDiff[a]);
							
							// Skip it if it is already there
							if($(gElm).children('div.vboxChooserGroupVMs').children('table.vboxChooserItem-'+vboxChooser._anchorid+'-'+data.id)[0])
								continue;
							
							$(gElm).children('div.vboxChooserGroupVMs')
								.append(								
										vboxChooser.vmHTML(data)
								);
							
							selectedChanged = (selectedChanged || $(gElm).children('div.vboxChooserGroupVMs').closest('div.vboxVMGroupSelected').length);
							
							// Sort the group this machine was added to
							sortGroups = sortGroups.concat(data.groups);
							
						}
						
						resizeElements = (resizeElements || groupsChanged);
						
						
					}
					
					break;
					
				/////////////////////////////////
				//
				// Snapshot taken / deleted / restored
				//
				/////////////////////////////////
				case 'OnSnapshotDeleted':
				case 'OnSnapshotTaken':
				case 'OnSnapshotRestored':
				case 'OnSnapshotChanged':
					redrawVMs[redrawVMs.length] = eventList[i].machineId;
					break;
				
				/////////////////////////////////////
				//
				// Machine registered or unregistered
				//
				//////////////////////////////////////
				case 'OnMachineRegistered':
					
					// Shorthand
					var vmid = eventList[i].machineId;
					
					// Unregistered
					if(!eventList[i].registered) {
						
						var wasSelected = vboxChooser.isVMSelected(vmid);
						
						$('#'+vboxChooser._anchorid +' table.vboxChooserItem-'+vboxChooser._anchorid+'-'+vmid).remove();
						
						groupsChanged = true;
						
						// See if VM was selected
						if(wasSelected) {
							
							selectedChanged = true;
							
							 vboxChooser._selectedList = vboxChooser._selectedList.filter(function(v){
								return (v.type == 'group' || (v.id != vmid));
							});
							
							
						}
						
						resizeElements = true;
						
						
						break;

					}
					
					// Registered
					
					// Enforce VM ownership
					if($('#vboxPane').data('vboxConfig').enforceVMOwnership && !$('#vboxPane').data('vboxSession').admin && eventList[i].enrichmentData.owner != $('#vboxPane').data('vboxSession').user) {
						break;
					}
					
					// Add to list			
					vboxChooser.updateVMElement(eventList[i].enrichmentData, true);
					
					resizeElements = true;
					break;
					
					
				///////////////////////////////////
				//
				// Extra data changed
				//
				////////////////////////////////////
				case 'OnExtraDataChanged':
					
					if(!eventList[i].machineId && eventList[i].key.indexOf(vboxChooser._groupDefinitionKey) === 0) {
												
						var path = eventList[i].key.substring(vboxChooser._groupDefinitionKey.length);
						if(!path) path = "/";
						var name = path.substring(path.lastIndexOf('/')+1);
						var vboxVMGroups = vboxChooser._groupDefs;
						var found = false;
						
						// No current group definitions?
						if(!vboxVMGroups) break;
						
						// Step through each group, comparing
						for(var a = 0; a < vboxVMGroups.length; a++) {
							if(vboxVMGroups[a].path == path) {
								// Sort this group if it is different
								if(vboxVMGroups[a].order != eventList[i].value)
									sortGroups[sortGroups.length] = path;
								found = true;
								vboxVMGroups[a] = {'path':path,'name':name,'order':eventList[i].value};
								break;
							}
						}
						
						// Add to group if not found
						if(!found) {
							vboxVMGroups[vboxVMGroups.length] = {'path':path,'name':name,'order':eventList[i].value};
							sortGroups[sortGroups.length] = path; // sort when added
							resizeElements = true;
						}
												
					} else {
						
						switch(eventList[i].key) {
						
							// redraw when custom icon changes
							case 'phpvb/icon':
								redrawVMs[redrawVMs.length] = eventList[i].machineId;
								break;
						}
					}
					break;
					
				////////////////////////////////////////
				//
				// Session or state change gets redrawn
				//
				///////////////////////////////////////
				case 'OnSessionStateChanged':
				case 'OnMachineStateChanged':
					redrawVMs[redrawVMs.length] = eventList[i].machineId;
					break;
					
			} // </ switch eventType >>
			
			
		} // </ for each event >

		// Now redraw each VM
		///////////////////////////
		var redrawn = {};
		var updateMenus = false;
		for(var i = 0; i < redrawVMs.length; i++) {
			
			if(redrawn[redrawVMs[i]]) continue;
			redrawn[redrawVMs[i]] = true;
			
			vboxChooser.updateVMElement(vboxVMDataMediator.getVMData(redrawVMs[i]));
			
			// Update menus if the VM is selected
			updateMenus = (updateMenus || vboxChooser.isVMSelected(redrawVMs[i]));
			
		}

		// Sort groups
		var groupsSorted = {};
		for(var i = 0; i < sortGroups.length; i++) {
			if(groupsSorted[sortGroups[i]]) continue;
			groupsSorted[sortGroups[i]] = true;
			var gElm = $(vboxChooser.getGroupElement(sortGroups[i]),false);
			if(gElm[0])
				vboxChooser.sortGroup(gElm);
			
		}
		
		// Groups changed
		if(groupsChanged || sortGroups.length) {
			vboxChooser.composeGroupDef();
		}
		

		// update selection list
		if(selectedChanged) {
			
			vboxChooser.selectionListChanged(vboxChooser._selectedList);
			
		} else if(updateMenus) {

			if(vboxChooser._vmGroupContextMenuObj)
				vboxChooser._vmGroupContextMenuObj.update(vboxChooser);
		
			
			if(vboxChooser._vmContextMenuObj)
				vboxChooser._vmContextMenuObj.update(vboxChooser);

		}
		
		if(resizeElements) vboxChooser._resizeElements(true);

		

	});
	
	

});