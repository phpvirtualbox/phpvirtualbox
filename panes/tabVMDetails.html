<!-- 

	VM Details Pane
	Copyright (C) 2010-2015 Ian Moore (imoore76 at yahoo dot com)
	
	$Id: tabVMDetails.html 596 2015-04-19 11:50:53Z imoore76 $

 -->
<div id='vboxTabVMDetails' style='height: 100%; width: 100%; display: none;' class='vboxInvisible'>

	<!-- VM Details -->
	<div id='vboxVMDetails' style='height: 100%; width: 100%; display: table; min-height:100px;' class='vboxInvisible'></div>
	
	<!-- Loading... -->
	<div id='vboxDetailsLoading' class='vboxInvisible' style='#position:absolute;#top:50%;display:none;vertical-align:middle;width:100%;height:100%;padding:0px;margin:0px'>
		<div style='#position:relative;#top:-50%;padding:4px;text-align:center;width:100%'>
			<span class='ui-corner-all translate' style='padding:8px;background:#fff;border:2px solid #ddd'>Loading ...</span>
		</div>
	</div>
	
	<!-- Welcome -->
	<div id='vboxDetailsWelcome' style='#position:absolute;#top:50%;display:table-cell;vertical-align:middle;width:50%;height:50%;text-align:center'>
		<div style='#position:relative;#top:-50%;padding:0px;text-align:center;width:100%'>
			<img src='images/vbox/welcome.png' />
		</div>
	</div>
	
<script type='text/javascript'>

// Translate loading div
$('#vboxDetailsLoading').find('span.translate').html(trans('Loading ...','UIVMDesktop')).removeClass('translate');

// Last selection list was none
$('#vboxTabVMDetails').data('vboxLastSelectionList',[]);

// Listen for events
/////////////////////////////
$('#vboxPane').on('vmSelectionListChanged',function(){

	// No VMs?
	if(!vboxChooser || vboxChooser.selectionMode == vboxSelectionModeNone) {
		
		// Hide all tab children first
		$('#vboxTabVMDetails').css({'display':'table','width':'100%'}).children().hide();
		
		// Display Welcome div
		$('#vboxDetailsWelcome').show().css('display','table-cell');
		
		$('#vboxTabVMDetails').data('showingWelcome', true);
		
		$('#vboxTabVMDetails').data('vboxLastSelectionList',[]);
		
		return;

	// Were we showing the welcome screen before?
	} else if($('#vboxTabVMDetails').data('showingWelcome')) {
		
		$('#vboxTabVMDetails').css({'display':''})
			.data({'showingWelcome':false}).children().hide();
		$('#vboxVMDetails').html('').css({'display':''});
		
	}
	
	// We have VMs to load
	if(vboxChooser.selectionMode != vboxSelectionModeNone) {

		var targetDiv = $('#vboxVMDetails');
		
		// Loading scren
		if(vboxChooser.selectedVMs.length == 1 && $('#vboxTabVMDetails').css('display') != 'none') {
				
			// Hide all tab children first
			$('#vboxTabVMDetails').css({'display':'table','width':'100%'}).children().hide();
				
			// Display loading div
			$('#vboxDetailsLoading').show().css('display','table-cell');
		}
		
		if(vboxChooser.getSingleSelectedId() == 'host') {

			$('#vboxTabVMDetails').data('vboxLastSelectionList',['host']);
			
			targetDiv.children().empty().remove();					

			$.when(vboxVMDataMediator.getVMDetails('host')).done(function(d) {

				// Hide loading screen
				targetDiv.siblings().hide();
				targetDiv.show();
				
		
				__vboxDisplayHostDetailsData(d, targetDiv);

			});

			return;
		}
		
		// Remove anything that is not a details table
		targetDiv.children(':not(table)').remove();
		
		// Last list of selected vms
		var lastSelectionList = $('#vboxTabVMDetails').data('vboxLastSelectionList');
		$('#vboxTabVMDetails').data('vboxLastSelectionList', vboxChooser.selectedVMs);
		
		// Remove any that aren't in list
		$(lastSelectionList).not(vboxChooser.selectedVMs).each(function(idx,vmid){
			$('#vboxVMDetails .vboxVMDetailsBox-vm-'+vmid).empty().remove();
		});
		
		// Placeholders so vms are listed in order			
		for(var i = 0; i < vboxChooser.selectedVMs.length; i++) {
			
			if(jQuery.inArray(vboxChooser.selectedVMs[i], lastSelectionList) > -1) {
				$('#vboxDetailsGeneralTable-'+vboxChooser.selectedVMs[i]).detach().appendTo(targetDiv);
			} else {
				$('<table />').attr({'id':'vboxDetailsGeneralTable-'+vboxChooser.selectedVMs[i],'class':'vboxInvisible vboxVMDetailsBox-vm-'+vboxChooser.selectedVMs[i],'style':'display:none'})
					.appendTo(targetDiv);
			}
			
			
		}
		
		var oneLoaded = false;
		var skipTable = false; // skip drawing multi-section details table
		for(var i = 0; i < vboxChooser.selectedVMs.length; i++) {
			
			// Already drawn and we are showing more than one vm
			if(jQuery.inArray(vboxChooser.selectedVMs[i], lastSelectionList) > -1) {
				
			    if(vboxChooser.selectedVMs.length > 1) {
					oneLoaded = true;
					targetDiv.siblings().hide();
					targetDiv.show();				
					continue;
			    }
			    skipTable = true;
			}
			
			$.when(vboxChooser.selectedVMs[i], vboxVMDataMediator.getVMDataCombined(vboxChooser.selectedVMs[i])).done(function(vmid, d) {
				
				// Remove placeholder and don't draw
				// if this vm is no longer selected
				if(!d || !vboxChooser.isVMSelected(vmid)) {
					$('#vboxDetailsGeneralTable-'+vmid).empty().remove();
					return;
				}
				
				// Clear target div if we only have one vm
				if(!oneLoaded) {
					oneLoaded = true;
					targetDiv.siblings().hide();
					targetDiv.show();
				}
				

				__vboxDisplayDetailsData(d, (vboxChooser.selectedVMs.length > 1), targetDiv, skipTable);
			
			});
		}
		

	}

	
/////////////////////////////////
//
// Redraw section logic
//
//////////////////////////////////
}).on('vboxEvents', function(e, eventList) {
	
	// Multiple vms selected
	var multiSelect = (vboxChooser.selectedVMs.length > 1);
			
	// Keep track of details to redraw
	var vmRedrawDetails = {};
	var vmRedrawSections = {};
	var vmTriggerEventSection = {};
	
	// Each event in list
	for(var i = 0; i < eventList.length; i++) {
		
		// Nothing to do if VM is not selected
		if(!eventList[i].machineId || !vboxChooser.isVMSelected(eventList[i].machineId))
			continue;
		
		
		
		switch(eventList[i].eventType) {
		
			// These trigger complete redraws
			case 'OnMachineDataChanged':
				vmRedrawDetails[eventList[i].machineId] = true;
				break;
			
			default:
			
				// already redrawing all vm details
				if(vmRedrawDetails[eventList[i].machineId])
					break;
			
				// Check for specific section redraws or events
				for(var s in vboxVMDetailsSections) {
					
					if(typeof(s) != 'string') continue;
					if(multiSelect && !vboxVMDetailsSections[s].multiSelectDetailsTable) continue;
					
					// Redraw this section?
					if(vboxVMDetailsSections[s].redrawMachineEvents && jQuery.inArray(eventList[i].eventType, vboxVMDetailsSections[s].redrawMachineEvents) > -1) {
						
						if(!vmRedrawSections[eventList[i].machineId])
							vmRedrawSections[eventList[i].machineId] = {};
						
						vmRedrawSections[eventList[i].machineId][s] = true;
					
					// Specific event handler
					} else if(vboxVMDetailsSections[s]['vboxEvent'+eventList[i].eventType]) {

						if(!vmTriggerEventSection[eventList[i].machineId])
							vmTriggerEventSection[eventList[i].machineId] = {};
						if(!vmTriggerEventSection[eventList[i].machineId][s])
							vmTriggerEventSection[eventList[i].machineId][s] = [];
						
						vmTriggerEventSection[eventList[i].machineId][s][vmTriggerEventSection[eventList[i].machineId][s].length] = eventList[i];
					}
				}
				
		} // </ switch eventType >
		
		
	} // </ foreach event >
	
	
	// Target for actions
	var targetDiv = $('#vboxVMDetails');


	// Redraw each details table
	/////////////////////////////////
	for(var vmid in vmRedrawDetails) {
		
		if(typeof(vmid) != 'string') continue;
		
		// Get and show details and runtime data again	
		$.when(vboxVMDataMediator.getVMDataCombined(vmid)).done(function(d) {
			
			// Do nothing if VM is no longer selected
			if(!vboxChooser.isVMSelected(d.id)) return;
			
			// if there's only one, we'll have to remove existing data
			if(vboxChooser.selectedVMs.length == 1) {
				targetDiv.children().empty().remove();
			}
			// Special case for host
			if(d.id == 'host') __vboxDisplayHostDetailsData(d, targetDiv);
			else __vboxDisplayDetailsData(d, (vboxChooser.selectedVMs.length > 1), targetDiv);
		});
	
	};
	
	// Redraw each section
	////////////////////////////
	for(var vmid in vmRedrawSections) {
		
		if(typeof(vmid) != 'string') continue;
		if(vmRedrawDetails[vmid]) continue; // already redrew entire details
		
		// Get and show details and runtime data again	
		$.when(vboxVMDataMediator.getVMDataCombined(vmid),vmRedrawSections[vmid]).done(function(d,sections) {

			// Do nothing if VM is no longer selected
			if(!vboxChooser.isVMSelected(d.id)) return;

			// Redraw each section in list
			for(var s in sections) {
				
				if(typeof(s) != 'string') continue;
				
				$('#vboxDetailsSectionId-'+s+'-'+d.id).replaceWith(
					__vboxCreateDetailsSection(d, s)
				);
						
				if(vboxVMDetailsSections[s].onRender)
					vboxVMDetailsSections[s].onRender(d);

			}
		});

	}
	
	// Specific event handlers for each section
	for(var vmid in vmTriggerEventSection) {

		if(typeof(vmid) != 'string') continue;
		if(vmRedrawDetails[vmid]) continue; // already redrew entire details

		// Do nothing if VM is no longer selected
		if(!vboxChooser.isVMSelected(vmid)) return;

		for(var s in vmTriggerEventSection[vmid]) {
			
			if(typeof(s) != 'string') continue;
			if(vmRedrawSections[vmid] && vmRedrawSections[vmid][s]) continue; // already redrew this section 
			
			// Call each event handler
			for(var i = 0; i < vmTriggerEventSection[vmid][s].length; i++) {
				var event = vmTriggerEventSection[vmid][s][i];
				vboxVMDetailsSections[s]['vboxEvent'+event.eventType](event);
			}
			
			
		}

	}
	
});

// Hide context menus when hiding tab
$('#vboxTabVMDetails').on('hide',function(){
	$('ul.contextMenu').hide();
});



//Base function that returns a table row of machine detail data
//Called from other functions
function __vboxDetailRow(name, value, cssClass, html) {
	
	// convert to strings
	if(typeof(value) == 'undefined') value = '';
	name = ''+name;
	value = ''+value;
	
	
	var tr = $('<tr />').attr({'class':'vboxDetailRow'});
	$('<th />').html(name + (value && value.length && name.length ? ':' : ''))
		.attr({'class':'vboxDetailContent ' + cssClass})
		.appendTo(tr);
	
	$('<td />').attr({'class':'vboxDetailsValue'}).html(value).appendTo(tr);

	return tr;
}

//Draw rows to table
function __vboxDetailAddRows(data, rows, table) {
	
	// Is rows a function?
	if(typeof(rows) == 'function') rows = rows(data);

	for(var i = 0; i < rows.length; i++) {
		
		// Check if row has condition
		if(rows[i].condition && !rows[i].condition(data)) continue;
		
		// hold row data
		var rowData = '';
		
		// Check for row attribute
		if(rows[i].attrib) {
			if(!data[rows[i].attrib]) continue;
			rowData = data[rows[i].attrib];
		
		// Check for row callback
		} else if(rows[i].callback) {
			rowData = rows[i].callback(data);

		// Static data
		} else {
			rowData = rows[i].data;
		}

		if(rows[i].rawRow) {
			$(table).append(rowData);
		} else {
		    var title = trans(rows[i].title, rows[i].language_context);
			$(table).append(__vboxDetailRow(
			        title,
			        rowData, 
			        'vboxDetailName ' + (rows[i].indented ? ' vboxDetailNameIndent' : '') + ' ' + (rows[i].cssClass ? rows[i].cssClass : ''),
			        rows[i].html));
		}
		
	}
	
}

// Details section
////////////////////////////
function __vboxCreateDetailsSection(data, sectionName, section) {
	
	if(!section)
		section = vboxVMDetailsSections[sectionName];

	var links = true;
	
	// No link if VM is not in valid state
	if(!((vboxVMStates.isRunning(data) || vboxVMStates.isPaused(data) || vboxVMStates.isEditable(data)) && !vboxVMStates.isSaved(data))) {
		links = false;
	}

	var title = trans(section.title, section.language_context);
	var vboxDetailsTable = $('<table />')
		.attr({'class':'vboxDetailsTable vboxDetailsTableBox'})
		.append($('<thead />')
			.append($('<tr />').attr({'class':'vboxDetailsHead'})
				.append($('<th />').attr({'class':'vboxDetailsSection','colspan':'2'})
					.append($('<div />')
						.append(
							$('<img />').attr({'style':'float:left;margin-right:3px','src':'images/vbox/'+section.icon,'class':'vboxDetailsSectionIcon'})
						).append(
							$('<span />').css({'float':'left'}).addClass((links ? 'vboxDetailsSectionLink' : '')).click(function(){
								if($(this).hasClass('vboxDetailsSectionLink'))
									vboxVMsettingsDialog(data,section.settingsLink);
							}).html(title)
						).append(
							$('<span />').addClass('vboxArrowImage')
								.click(function(){ $(this).parent().trigger("dblclick"); })
						)
					)
				).disableSelection()
			)
		);

	
	var tbody = $('<tbody />');
	
	__vboxDetailAddRows(data, section.rows, tbody);
	
	
	// Class added to last row to aid in rounded corners
	if(section.noFooter) {
		tbody.children().last().addClass('vboxTableLastRow');
	} else {
		tbody.append($('<tr />').addClass('vboxTableLastRow').append($('</td >')).append('<td />'));
	}
	
	vboxDetailsTable.append(tbody);

	var vboxDetailsSection = $('<div />')
		.attr({'class':'vboxDetailsBorder vboxVMDetailsBox'+sectionName+ ' vboxVMDetailsBox-vm-'+data.id,'id':'vboxDetailsSectionId-'+sectionName+'-'+data.id})
		.dblclick(__vboxDetailsSectionCollapse)
			.hoverClass('vboxHover').disableSelection().data({'sectionName':sectionName});

	if(vboxGetLocalDataItem("vboxSectionCollapse"+sectionName)) {
		vboxDetailsSection.addClass('vboxDetailsSectionCollapsed');
	}
	
	if(!vboxGetLocalDataItem("vboxSectionHide"+sectionName)) {
		$(vboxDetailsSection).show();
	} else {
		$(vboxDetailsSection).hide();
	}

	/* Context menu for section ? */
	if(section.contextMenu) {
		
		var menu = section.contextMenu();
				
		$(vboxDetailsSection).mouseup({'vmid':data.id},function(e) {

			$('ul.contextMenu').hide();
			
			if(e.button == 2) {

				$(menu).trigger('beforeshow', e.data.vmid);
				
				vboxPositionEvent(menu, e);
				$(menu).show();
				
				e.preventDefault();
				e.stopPropagation();
				
				return false;
			}
			
		});
		
		$(vboxDetailsSection)
			.on('contextmenu', function() { return false; })
			.on('click',function(e){return e.button!=2;});

	}
	return vboxDetailsSection.append(vboxDetailsTable);

}

//Display details data table for VM
//////////////////////////////////
function __vboxDisplayDetailsData(data, multiSelect, targetDiv, skipTable) {
	
	// No data? Should never happen
	if(typeof data == 'undefined') return;
	
	
	// Accessibility check
	if(data.state == 'Inaccessible') {

		
		var reasonDiv = $('<div />')
			.attr({'class':'vboxVMDetailsBox-vm-'+data.id})
			.html('<div style="width: 50%">'+trans('The selected virtual machine is <i>inaccessible</i>. Please inspect the error message shown below and press the <b>Refresh</b> button if you want to repeat the accessibility check:','UIDetailsPagePrivate')+'</div>');
		
		// Details Table
		$('<table />').attr({'style':'width: 50%','class':'vboxDetailsTable vboxDetailsTableError vboxVMDetailsBox-vm-'+data.id}).append(__vboxDetailRow(trans("VirtualBox - Error",'UIMessageCenter'), data.accessError['text'])).append(__vboxDetailRow(trans('Result Code: ','UIMessageCenter'), data.accessError['resultCode'])).append(__vboxDetailRow(trans("Component: ",'UIMessageCenter'), data.accessError['component'])).appendTo(targetDiv);
		
		var d = $('<div />').attr({'style':'width: 50%; padding: 4px;'});
		
		$('<input />').attr({'type':'button',
			'value':trans('Refresh','UIVMLogViewer'),
			'style':'background: url(images/vbox/refresh_16px.png) 2px 2px no-repeat; padding: 2px 2px 2px 18px; border: 1px solid #000; background-color: #eee;'
		}).click({vmid:data.id},function(e){

			
			var l = new vboxLoader();
			l.showLoading();
			$.when(vboxVMDataMediator.refreshVMData(e.data.vmid)).always(function(){
				l.removeLoading();	
			});
			
			
		}).appendTo(d);

		$(reasonDiv).append(d).appendTo(targetDiv);
		
		return;
	}

	// Multi-select details table sections
	////////////////////////////////////////
	if(!skipTable) {

		var tbl = $('<table />').attr({'id':'vboxDetailsGeneralTable-'+data.id,'class':'vboxInvisible vboxVMDetailsBox-vm-'+data.id,'style':'width: 100%;'}).append(
	
			$('<tr />').attr({'style':'vertical-align: top'})
			
    			.append(
    	
    				$('<td />').css({'width':'100%'})
    					.append(__vboxCreateDetailsSection(data,'general'))
    					.append(__vboxCreateDetailsSection(data,'system'))
    			
    			).append(
    
			        vboxVMDetailsSections['preview'].condition() ?
        				$('<td />')
        					.append(__vboxCreateDetailsSection(data,'preview')) :
        				null
    			)
			
		).data({'vmid':data.id});
		
		// If already exists, replace the table, else append to div
		if($('#vboxDetailsGeneralTable-'+data.id)[0]) {
			$('#vboxDetailsGeneralTable-'+data.id).replaceWith(tbl);
		} else {
			tbl.appendTo(targetDiv);
		}
		
		for(var s in {'general':1,'system':1,'preview':1}) {
			if(vboxVMDetailsSections[s].onRender)
				vboxVMDetailsSections[s].onRender(data);
		}
	
	}
	
	// Other sections
	///////////////////////////
	
	// Not shown if multiple vms are selected
	if(multiSelect) return;
	
	for(var s in vboxVMDetailsSections) {
		
		if(vboxVMDetailsSections[s].multiSelectDetailsTable) continue;
		
		if(vboxVMDetailsSections[s].condition && !vboxVMDetailsSections[s].condition(data))
			continue;
		
		$(targetDiv).append(__vboxCreateDetailsSection(data, s));
		
		if(vboxVMDetailsSections[s].onRender)
			vboxVMDetailsSections[s].onRender(data);
		
		
	}
	
}

//Display details data for VirtualBox Host
/////////////////////////////////////////////
function __vboxDisplayHostDetailsData(data, targetDiv) {
	
	for(var s in vboxHostDetailsSections) {
		
		if(vboxHostDetailsSections[s].condition && !vboxHostDetailsSections[s].condition(data))
			continue;
		
		$(targetDiv).append(__vboxCreateDetailsSection(data, s, vboxHostDetailsSections[s]));
		
		if(vboxHostDetailsSections[s].onRender)
			vboxHostDetailsSections[s].onRender(data);
		
	}
	
}


//Collapse section used on dblclick of sections
function __vboxDetailsSectionCollapse(e) {

	// Save section name
	var sectionName = $(this).data('sectionName');
	
	vboxSetLocalDataItem('vboxSectionCollapse'+sectionName,
		($(this).hasClass('vboxDetailsSectionCollapsed') ? '' : '1')
	);
	
	var collapsed = $(this).hasClass('vboxDetailsSectionCollapsed');
	
		
	// IE8 doesn't display this animation
	if(!($.browser.msie && $.browser.version.substring(0,1) < 9)) {
		
		// Get image span of current section only
		var vboxArrowImage = $(this).find('span.vboxArrowImage');
			
		// Only animate the span that is part of this section header
		// All others just get switched
		$.when($('<div />').animate({left:90},
			{
				duration: 300,
				step: function(currentStep) {
					
					if(collapsed) {
						currentStep = (180 - currentStep);
					} else {
						currentStep = currentStep+90;
					}
					vboxArrowImage.css({
						'transform':'rotate('+currentStep+'deg)',
						'-moz-transform': 'rotate('+currentStep+'deg)',
						'-webkit-transform': 'rotate('+currentStep+'deg)',
						'-o-transform': 'rotate('+currentStep+'deg)',
						'-ms-transform': 'rotate('+currentStep+'deg)'
					});
				},
				queue: true
			})).done(function(){
				
				vboxArrowImage.css({
					'transform':'',
					'-moz-transform': '',
					'-webkit-transform': '',
					'-o-transform': '',
					'-ms-transform': ''
				});
				
			});
			
	}
	
	$('#vboxVMDetails').find('div.vboxVMDetailsBox'+sectionName)
		.toggleClass('vboxDetailsSectionCollapsed', (($.browser.msie && $.browser.version.substring(0,1) < 9) ? undefined : 300));
	


	return false;
	
}

/*
 *
 * Show / Hide boxes menu
 *
 */
var ul = $('<ul />')
	.attr({'class':'contextMenu contextMenuNoBG','style':'display: none','id':'vboxDetailsShowMenu'})
	.on('contextmenu', function() { return false; });
	
for(var i in vboxVMDetailsSections) {

	if(typeof(i) != 'string') continue;
	
	// Skip if we shouldn't display
	if(vboxVMDetailsSections[i].condition && !vboxVMDetailsSections[i].condition())
		continue;
	
	$('<li />').attr('id','vboxDetailsShowMenuItem'+i).append(
		
		$('<label />').append(
			
			$('<input />')
				.attr({'type':'checkbox','class':'vboxCheckbox','name':i})
				.prop('checked',!vboxGetLocalDataItem("vboxSectionHide"+i))
				.on('click',{'sectionName':i},function(e){

					vboxSetLocalDataItem("vboxSectionHide"+$(this).attr('name'),(this.checked ? '' : '1'));
					$('#vboxTabVMDetails .vboxVMDetailsBox'+$(this).attr('name')).css('display',(this.checked ? '' : 'none'));

					var sectionName = e.data.sectionName;
					
					// Run section's onShow function
					if(this.checked && vboxVMDetailsSections[sectionName].onShow) {
						vboxVMDetailsSections[sectionName].onShow();
					} else if(!this.checked && vboxVMDetailsSections[sectionName].onHide) {
						vboxVMDetailsSections[sectionName].onHide();
					}
		
				})
				
			).append(
				$('<span />').html(trans(vboxVMDetailsSections[i].title, vboxVMDetailsSections[i].language_context))
				
			).disableSelection()
			
		).appendTo(ul);


}
$('#vboxTabVMDetails').append(ul);


/* Menu functionality */
$("#vboxVMDetails").mouseup( function(e) {

	$('ul.contextMenu').hide();
	
	if(e.button ==  2 && vboxChooser.getSingleSelectedId() != 'host') {

		var menu = $('#vboxDetailsShowMenu');
		vboxPositionEvent(menu, e);
		$(menu).show();
		
		e.preventDefault();
		e.stopPropagation();
		
		return false;
	}
	

}).on('contextmenu', function() { return false; })
	.on('click',function(e){return e.button!=2;});

//Display Welcome div
$('#vboxTabVMDetails').css({'display':'table','width':'100%'}).children().hide();
$('#vboxDetailsWelcome').show().css('display','table-cell');
$('#vboxTabVMDetails').data('showingWelcome', true);

</script>
</div>