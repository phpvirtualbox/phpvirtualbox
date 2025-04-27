<!-- 

	VM Snapshots Pane
	Copyright (C) 2010-2015 Ian Moore (imoore76 at yahoo dot com)
	
	$Id: tabVMSnapshots.html 595 2015-04-17 09:50:36Z imoore76 $

 -->
<div id='vboxTabVMSnapshots' class='vboxInvisible' style='display: none; width:100%;'>

	<table class='vboxInvisible' style='height: 99%; width: 99%'>
		<tr style='vertical-align: top; height: 1%'>
			<td><div id='vboxSnapshotToolbar'></div></td>
		</tr>
		<tr style='vertical-align: top;'>
			<td><ul style='min-height: 400px' class='vboxBordered vboxTreeView' id='vboxSnapshotList'></ul></td>
		</tr>
	</table>
<!-- 

	New Snapshot Dialog

 -->
	<div id='vboxSnapshotNew' class='vboxDialogContent' style='display: none;'>
		<table class='vboxVertical'>
			<tr style='vertical-align: top'>
				<th>
					<img id='vboxSnapshotNewImg' src='images/vbox/os_other.png' height='32' width='32' />
				</th>
				<td>
					<div style='height: 100%'>
						<div class='translate'>Snapshot Name</div>
						<input id='vboxSnapshotNewName' style='width: 100%'/>
						<div class='translate'>Snapshot Description</div>
						<textarea rows='10' id='vboxSnapshotNewDesc' style='width: 100%;'></textarea>
					</div>
				</td>
			</tr>
		</table>
	</div>


<!-- 

	Snapshot Details Dialog

 -->
	<div id='vboxSnapshotDetails' class='vboxDialogContent' style='display: none;'>
		<table class='vboxVertical'>
			<tr>
				<th><span class='translate'>Name:</span></th>
				<td style='width:100%'>
					<input id='vboxSnapshotDetailsName' style='width: 100%'/>
				</td>
				<td rowspan='2' id='vboxSnapshotSS' style='width:1%'></td>
			</tr>
			<tr>
				<th><span class='translate'>Taken:</span></th>
				<td style='width:100%'>
					<span id='vboxSnapshotDetailsTaken'></span>
				</td>
			</tr>
			<tr>
				<th><span class='translate'>Description:</span></th>
				<td colspan='2'>
					<textarea rows='12' id='vboxSnapshotDetailsDesc' name='vboxSnapshotDetailsDescElm'></textarea>
				</td>
			</tr>
			<tr>
				<th><span class='translate'>Details:</span></th>
				<td class='vboxSnapshotDetailsMachine' colspan='2'>
					<div id='vboxSnapshotDetailsVM' style='overflow: auto; height: 100%'></div>
				</td>
			</tr>
		</table>
	</div>



<script type='text/javascript'>

vboxInitDisplay('vboxSnapshotNew','VBoxTakeSnapshotDlg');
vboxInitDisplay('vboxSnapshotDetails','VBoxSnapshotDetailsDlg');

var vboxSnapshotButtons = [
            	
  	{
  		'name' : 'take_snapshot',
  		'label' : 'Take Snapshot...',
  		'language_context': 'UIActionPool',
  		'icon' : 'snapshot_take',
  		'enabled' : function(item) {
  			
  			if(typeof item == 'string') state = item;
  			else if(item && $(item).data('vboxSnapshot')) state = $(item).data('vboxSnapshot').state;
  			else return false;
  			
  			var vm = vboxChooser.getSingleSelected();
  			return (item && state == 'current' && jQuery.inArray(vm.state, ['RestoringSnapshot','LiveSnapshotting','DeletingSnapshot']) == -1);
  		},
  		'click' : function (callback) {

  			var vm = vboxChooser.getSingleSelected();
  			
  			$('#vboxSnapshotNewImg').attr('src',"images/vbox/" + vboxGuestOSTypeIcon(vm.OSTypeId));

  			var snRegEx = new RegExp('^' + trans('Snapshot %1','VBoxSnapshotsWgt').replace('%1','([0-9]+)') + '$');
  			
  			// Get max snapshot name
  			var snMax = 0;
  			var snList = $('#vboxSnapshotList').find('li');
  			for(var i = 0; i < snList.length; i++) {
  				var snNum = snRegEx.exec($(snList[i]).data('vboxSnapshot').name);
  				if(snNum) snMax = Math.max(parseInt(snNum[1]), snMax);
  			}
  			
  			$('#vboxSnapshotNewName').val(trans('Snapshot %1','VBoxSnapshotsWgt').replace('%1',(snMax+1)));
  			$('#vboxSnapshotNewName').select();
  			$('#vboxSnapshotNewDesc').val('');
  			
  			
  			var buttons = {};
  			var OKBtn = buttons[trans('OK','QIMessageBox')] = function() {
  				
  				// Get fresh VM state when this is clicked
  				var vm = vboxChooser.getSingleSelected();
  				if(!vm) return;
  	  			
  	  			// Deferred object that will trigger
  	  			// taking a snapshot on success
  	  			var isPausedOrNotRunning = $.Deferred();
  	  			
  	  			// Take snapshot function when machine is in
  	  			// a valid paused or not running state
  	  			$.when(isPausedOrNotRunning).done(function(paused) {
  	  				
	  	  			var l = new vboxLoader('snapshotTake');
		  	  		l.add('snapshotTake',function(d){
						if(d && d.responseData && d.responseData.progress) {
							vboxProgress({'progress':d.responseData.progress,'persist':d.persist},function(pres){
								
								// Unpause machine if it was paused
								if(paused) {
									vboxAjaxRequest('machineSetState',{'vm':vm.id,'state':'resume'});
								}
								
								// If progress operation errored, refresh snapshot list
								if(pres && !pres.success)
									$.when(vboxAjaxRequest('machineGetSnapshots',{'vm':vm.id})).done(__vboxTabSnapshotsFill);
								
								// callback passed to click()? else Refresh vm list
								if(typeof callback == 'function') { callback(pres); }
	
							},'progress_snapshot_create_90px.png', trans('Take a snapshot of the current virtual machine state','VBoxSnapshotsWgt'),
								vm.name);
							
						} else {

							// Unpause machine if it was paused
							if(paused) {
								vboxAjaxRequest('machineSetState',{'vm':vm.id,'state':'resume'});
							}

							if(d && d.error) vboxAlert(d.error);
							$.when(vboxAjaxRequest('machineGetSnapshots',{'vm':vm.id})).done(__vboxTabSnapshotsFill);
						}
		 	  		},{'vm':vm.id,'name':$('#vboxSnapshotNewName').val(),'description':$('#vboxSnapshotNewDesc').val()});
		  	  		l.run();
		  	  		
  	  			}).fail(function(){
  	  				
  	  				$.when(vboxAjaxRequest('machineGetSnapshots',{'vm':vm.id})).done(__vboxTabSnapshotsFill);
  	  				
  	  			});
  	  			
  	  			// Set to paused state if VM is running
  	  			if(vboxVMStates.isRunning(vm)) {
	  	  			var pl = new vboxLoader('machineSetStatePaused');
  	  				pl.add('machineSetState', function(d) {
  	  					if(d && d.success) isPausedOrNotRunning.resolve(true);
  	  					else isPausedOrNotRunning.reject();
  	  				},{'vm':vm.id,'state':'pause'});
  	  				pl.run();
  	  			} else {
  	  				isPausedOrNotRunning.resolve();
  	  			}
  	  			

				$(this).dialog('close');

				
  			};
			buttons[trans('Cancel','QIMessageBox')] = function() {
				$(this).dialog('close');
				if(typeof callback == 'function') { callback({success:false,uicancel:true}); }
			};
  			
  			$('#vboxSnapshotNewName').off('keypress').on('keypress',function(e) { if (e.keyCode == 13) OKBtn.apply($('#vboxSnapshotNew')); });
  			
  			$('#vboxSnapshotNew').dialog({'closeOnEscape':false,'width':'400px','height':'auto','buttons':buttons,'modal':true,'autoOpen':true,'dialogClass':'vboxDialogContent','title':'<img src="images/vbox/snapshot_take_16px.png" class="vboxDialogTitleIcon" height="16" width="16" /> ' + trans('Take Snapshot of Virtual Machine','VBoxTakeSnapshotDlg')});
  			
  	  	}
  	},
  	{
  		'name' : 'discard_cur_state',
  		'label' : 'Restore Snapshot',
  		'icon' : 'snapshot_restore',
  		'enabled' : function(item) {
  			var vm = vboxChooser.getSingleSelected();
			return ( item && $(item).data('vboxSnapshot') && $(item).data('vboxSnapshot') && $(item).data('vboxSnapshot').name && $(item).data('vboxSnapshot').state != 'current');
  		},
  		'click' : function () {
  			
  			var vm = vboxChooser.getSingleSelected();
  			
  	  		var snapshot = $('#vboxSnapshotList').find('div.vboxListItemSelected').first().parent().data('vboxSnapshot');
  	  		
			var buttons = {};
			var q = '';
			
			// Check if the current state is modified
			if(vm.currentStateModified) {

				q = trans("<p>You are about to restore snapshot <nobr><b>%1</b></nobr>.</p>" +
                        "<p>You can create a snapshot of the current state of the virtual machine first by checking the box below; " +
                        "if you do not do this the current state will be permanently lost. Do you wish to proceed?</p>",'UIMessageCenter');
				q += '<p><label><input type="checkbox" id="vboxRestoreSnapshotCreate" checked /> ' + trans('Create a snapshot of the current machine state','UIMessageCenter') + '</label></br>';
				q += '<label><input type="checkbox" id="vboxRestoreSnapshotAutoStart" '+ (vboxVMStates.isRunning(vm)? 'checked' : '') + ' /> ' + trans('Automatically start the machine after restore','UIMessageCenter') + '</label></p>';
				
				buttons[trans('Restore','UIMessageCenter')] = function() {

					var self = this;
					var snautostart = function() {
						var l = new vboxLoader();
						l.add('machineSetState',function(d){
							if(!(d && d.success) && errorMsg) {
								vboxAlert(errorMsg.replace('%1', vm.name));
								return;
							}
							// check for progress operation
							if(d && d.responseData && d.responseData.progress) {
								vboxProgress({'progress':d.responseData.progress,'persist':d.persist},function(d){
									// Do Nothing
								},'progress_state_restore_90px.png',trans('Power on virtual machine','VBoxSnapshotsWgt'), vm.name);
								return;
							}
						},{'vm':vm.id,'state':'powerUp'});

						l.run();
					};

					var snrestore = function(autoStart,takeSnapshot){
						
						// Don't do anything if taking a snapshot failed
						if(takeSnapshot && !takeSnapshot.success) {
							if (takeSnapshot.uicancel)
								vboxSnapshotButtons[1].click();
							return;
						}
						
						// Power off VM if needed
						if(vboxVMStates.isRunning(vm) || vboxVMStates.isPaused(vm)) {
							var l = new vboxLoader();
							l.add('machineSetState',function(d){
								if(!(d && d.success) && errorMsg) {
									vboxAlert(errorMsg.replace('%1', vm.name));
									return;
								}
								// check for progress operation
								if(d && d.responseData && d.responseData.progress) {
									vboxProgress({'progress':d.responseData.progress,'persist':d.persist},function(d){
										if (d && d.responseData && d.responseData.info) {
											// when poweroff completed
											if (d.responseData.info.completed) {
												// schedule snapshot restore immediate after
												setTimeout(snrestore.bind(self,autoStart,takeSnapshot),0);
											}
										}
									},'progress_poweroff_90px.png',trans('Power off virtual machine','VBoxSnapshotsWgt'), vm.name);
								}
							},{'vm':vm.id,'state':'powerDown'});

							l.run();
							return;
						}

			  	  		var l = new vboxLoader();
			  	  		l.add('snapshotRestore',function(d){
							if(d && d.responseData && d.responseData.progress) {
								vboxProgress({'progress':d.responseData.progress,'persist':d.persist},function(d){
									if (d && d.responseData && d.responseData.info) {
										// when restore completed and auto start is requested
										if (d.responseData.info.completed && autoStart) {
											// schedule start immediately
											setTimeout(snautostart.bind(self), 0);
										}
									}
								},'progress_snapshot_restore_90px.png',trans('Restore Snapshot','VBoxSnapshotsWgt'),
									vm.name);
							} else if(d && d.error) {
								vboxAlert(d.error);
							}
			 	  		},{'vm':vm.id,'snapshot':snapshot.id});

						l.run();										

					};
					
					var vmRestoreAutoStart = $('#vboxRestoreSnapshotAutoStart').prop('checked');
					if($('#vboxRestoreSnapshotCreate').prop('checked')) {
						vboxSnapshotButtons[0].click(snrestore.bind(self,vmRestoreAutoStart));
					} else {
						snrestore(vmRestoreAutoStart);
					}
		  	  		$(this).empty().remove();
				};

			} else {
				
				q = trans('<p>Are you sure you want to restore snapshot <nobr><b>%1</b></nobr>?</p>','UIMessageCenter');
				
				buttons[trans('Restore','UIMessageCenter')] = function() {
		  	  		var l = new vboxLoader();
		  	  		l.add('snapshotRestore',function(d){
		  	  			if(d && d.responseData && d.responseData.progress) {
							vboxProgress({'progress':d.responseData.progress,'persist':d.persist},function(){

								// Let events get picked up. Nothing to do here
								
							},'progress_snapshot_restore_90px.png',trans('Restore Snapshot','VBoxSnapshotsWgt'),
								vm.name);
						} else if(d && d.error) {
							vboxAlert(d.error);
						}
		 	  		},{'vm':vm.id,'snapshot':snapshot.id});
		  	  		$(this).empty().remove();

					l.run();				
			
				};
			}

			vboxConfirm(q.replace('%1',$('<div />').text(snapshot.name).html()),buttons);
  	  	},
  	  'separator' : true
  	},
  	{
  		'name' : 'delete_snapshot',
  		'label' : 'Delete Snapshot',
  		'icon' : 'snapshot_delete',
  		'enabled' : function(item) {
  			return (item && $(item).data('vboxSnapshot') && $(item).data('vboxSnapshot').name && $(item).data('vboxSnapshot').state != 'current' && $(item).data('vboxSnapshot').children.length <= 1);
  		},
  		'click' : function () {
  			var vm = vboxChooser.getSingleSelected();
  	  		var snapshot = $('#vboxSnapshotList').find('div.vboxListItemSelected').first().parent().data('vboxSnapshot');
			var buttons = {};
			buttons[trans('Delete','UIMessageCenter')] = function() {
	  	  		var l = new vboxLoader();
	  	  		l.add('snapshotDelete',function(d){
	  	  			if(d && d.responseData && d.responseData.progress) {
						vboxProgress({'progress':d.responseData.progress,'persist':d.persist},function(){
							
							// Let events get picked up. Nothing to do here
							
						},'progress_snapshot_discard_90px.png',trans('Delete Snapshot','VBoxSnapshotsWgt'),
							vm.name + ' - ' + snapshot.name);
					}
	 	  		},{'vm':vm.id,'snapshot':snapshot.id});
	  	  		$(this).empty().remove();

				l.run();				
			};
			vboxConfirm(trans('<p>Deleting the snapshot will cause the state information saved in it to be lost, and '+
			        'storage data spread over several image files that VirtualBox has created together with the snapshot '+
			        'will be merged into one file. This can be a lengthy process, and the information in the snapshot cannot '+
			        'be recovered.</p></p>Are you sure you want to delete the selected snapshot <b>%1</b>?</p>','UIMessageCenter').replace('%1',$('<div />').text(snapshot.name).html()),buttons);  	  		
  	  	}
  	},
  	{
  		'name' : 'show_snapshot_details',
  		'label' : 'Show Details',
  		'icon' : 'snapshot_show_details',
  		'enabled' : function(item) {
  			return (item && $(item).data('vboxSnapshot') && $(item).data('vboxSnapshot').name && $(item).data('vboxSnapshot').state != 'current');
  		},
  		'click' : function () {

  			// Current snapshot
  	  		var snapshot = $('#vboxSnapshotList').find('div.vboxListItemSelected').first().parent().data('vboxSnapshot');
  			
  	  		var vm = vboxChooser.getSingleSelected();
  			  			
			var l = new vboxLoader();
			l.add('snapshotGetDetails',function(d){

				$('#vboxSnapshotDetailsName').val(d.responseData.name);
				$('#vboxSnapshotDetailsTaken').html(vboxDateTimeString(d.responseData.timeStamp));
				$('#vboxSnapshotDetailsDesc').val(d.responseData.description);
				
				if(d.responseData.online) {
					$('#vboxSnapshotSS').html('<a href="'+ vboxEndpointConfig.screen +'?vm='+vm.id+
							'&snapshot='+d.responseData.id+'&full=1" target="_blank"><img src="'+vboxEndpointConfig.screen+'?vm='+
									vm.id+'&snapshot='+d.responseData.id+'" /></a>').show();
				} else {
					$('#vboxSnapshotSS').empty().hide();
				}
				
	  	  		// Display details
	  	  		$('#vboxSnapshotDetailsVM').empty();
	  	  		
		  	  	// Enclosing details Table
		  	  	var vboxDetailsTable = $('<table />').attr({'class':'vboxDetailsTable'});
		  	  	
		  	  	// Set to isSnapshot
		  	  	d.responseData.machine._isSnapshot = true;
		  	  	
		  	  	for(var i in vboxVMDetailsSections) {
		
		  	  		section = vboxVMDetailsSections[i];
		  	  		
		  	  		if(section.noSnapshot) continue;
		  	  		
			  	  	$('<tr />').attr({'class':'vboxDetailsHead'}).append(
			  	  		$('<th />').attr({'class':'vboxDetailsSection','colspan':'2'}).disableSelection()
			  	  			.html("<img style='float:left; margin-right: 3px; ' src='images/vbox/" + section.icon + "' height='16' width='16' /> ")
			  	  			.append(
			  	  				$('<span />').css({'float':'left'}).append(document.createTextNode(trans(section.title, section.language_context) +' '))
			  	  			)
			  	  	).appendTo(vboxDetailsTable);

		  	  		__vboxDetailAddRows(d.responseData.machine, section.rows, vboxDetailsTable);
		
		  	  	}
	  	  	
		  	  $('#vboxSnapshotDetailsVM').append(vboxDetailsTable);

	  	  		
			},{'vm':vm.id,'snapshot':snapshot.id});
			l.onLoad = function(){
  			
	  			var buttons = {};
				buttons[trans('OK','QIMessageBox')] = function() {

		  			// Current snapshot
		  	  		var snapshot = $('#vboxSnapshotList').find('div.vboxListItemSelected').first().parent().data('vboxSnapshot');
							
		  	  		var l = new vboxLoader();
		  	  		l.add('snapshotSave',function(d){
		  	  			
		  	  			// Let events get picked up. Nothing to do here
		  	  		
		 	  		},{'vm':vm.id,'snapshot':snapshot.id,'name':$('#vboxSnapshotDetailsName').val(),'description':$('#vboxSnapshotDetailsDesc').val()});
		 	  		$(this).dialog('close');
					l.run();
					
				};
				buttons[trans('Cancel','QIMessageBox')] = function(){
					$(this).dialog('close');
				};
				$('#vboxSnapshotDetails').dialog({'closeOnEscape':false,'width':'600px','height':'auto','buttons':buttons,'modal':true,'autoOpen':true,'dialogClass':'vboxDialogContent','title':'<img src="images/vbox/snapshot_show_details_16px.png" class="vboxDialogTitleIcon" /> '+trans('Details of %1 (%2)','VBoxSnapshotDetailsDlg').replace('%1',$('<div />').text(snapshot.name).html()).replace('%2',vm.name)});
			};
			l.run();
  	  	}
  	},
  	{
  		'name' : 'clone',
  		'label' : 'Clone...',
  		'language_context': 'UIActionPool',
  		'icon' : 'vm_clone',
  		'separator' : true,
  		'enabled' : function(item) { 
  			var vm = vboxChooser.getSingleSelected();
  			return (item && $(item).data('vboxSnapshot') && $(item).data('vboxSnapshot').name && !vboxVMStates.isPaused(vm) && !vboxVMStates.isRunning(vm));
  		},
  		'click' : function () {

  			var vm = vboxChooser.getSingleSelected();
  			
  			// Current snapshot
  	  		var snapshot = $('#vboxSnapshotList').find('div.vboxListItemSelected').first().parent().data('vboxSnapshot');
  			
  	  		new vboxWizardCloneVMDialog({'vm':vm,'snapshot':(snapshot.state == 'current' ? undefined : snapshot)}).run();
  			
  	  	}
  	},
  	

  	
];


/* Append Top Toolbar */
var vboxSnapshotToolbar = new vboxToolbarSmall({buttons: vboxSnapshotButtons, size: 22, language_context: 'VBoxSnapshotsWgt'});
// special case for 'clone' button because it is 16px rather than 22px
vboxSnapshotToolbar.addButtonCSS('clone', {'background-position':'6px 4px'});
vboxSnapshotToolbar.renderTo('vboxSnapshotToolbar');

vboxInitDisplay('vboxSnapshotToolbar','VBoxSnapshotsWgt');

// Context menu for snapshots
var vboxSnapshotContextMenu = new vboxMenu({name:'vboxSnapshotContextMenu', language_context: 'VBoxSnapshotsWgt'});
vboxSnapshotContextMenu.addMenu(vboxSnapshotButtons.slice(-(vboxSnapshotButtons.length-1)));

//Context menu for current state
var vboxSnapshotContextMenuCurrent = new vboxMenu({name: 'vboxSnapshotContextMenuCurrent', language_context: 'VBoxSnapshotsWgt'});
vboxSnapshotContextMenuCurrent.addMenu([vboxSnapshotButtons[0],vboxSnapshotButtons[(vboxSnapshotButtons.length-2)]]);


/* Toolbar and menu updates*/
$('#vboxSnapshotList').on('select',function(e,item) {
	
	// Update toolbar
	vboxSnapshotToolbar.update(item);
	
	vboxSnapshotContextMenu.update(item);
	vboxSnapshotContextMenuCurrent.update(item);
	
});

// Hold timer and date vars
vboxSnapshotToolbar._timer = null;
vboxSnapshotToolbar._timeSpans = new Array();
vboxSnapshotToolbar._timeSpans['days'] = 86400;
vboxSnapshotToolbar._timeSpans['hours'] = 3600,
vboxSnapshotToolbar._timeSpans['minutes'] = 60,
vboxSnapshotToolbar._timeSpans['seconds'] = 1;
vboxSnapshotToolbar._timeSpans.sort(function(a,b){return (a > b ? -1 : 1);});



/* Selected VM changed */
$('#vboxPane').on('vmSelectionListChanged',function(){
	
	$('#vboxTabVMSnapshotsTitle').html(trans('Snapshots','UIVMDesktop'));

	var vm = vboxChooser.getSingleSelected();
	
	$('#vboxSnapshotList').trigger('select',null);
	
	// Got vm and it's not host
	if(vm && vm.id != 'host') {

		// Enable tab
		$('#vboxTabVMSnapshots').parent().trigger('enableTab', ['vboxTabVMSnapshots']);		

		$.when(vboxVMDataMediator.getVMDetails(vm.id)).done(function(vm) {
			$('#vboxTabVMSnapshotsTitle').html(trans('Snapshots','UIVMDesktop') + (vm && vm.snapshotCount ? trans(' (%1)','VBoxSnapshotsWgt').replace('%1',vm.snapshotCount):''));
		});
		
		// Unset last vm
		$('#vboxTabVMSnapshots').data('lastVM',0);
		
		// Remove children
		$('#vboxSnapshotList').children().empty().remove();
		
		// Fill snapshots if this tab is being shown
		if($('#vboxTabVMSnapshots').data('vboxShowing')) {
			
			// Keep track of last VM shown
			$('#vboxTabVMSnapshots').data('lastVM',vm.id);
			
			// append spinner
			$('#vboxSnapshotList').append($('<li />').attr({'class':'last'}).html("<div><img src='images/spinner.gif'></div>"));
			
			$.when(vboxAjaxRequest('machineGetSnapshots',{'vm':vm.id})).done(__vboxTabSnapshotsFill);
			
		}
		
	// No single selected VM or it is host
	} else {
		// disable tab
		$('#vboxTabVMSnapshots').parent().trigger('disableTab', ['vboxTabVMSnapshots']);
		$('#vboxTabVMSnapshots').data('lastVM',0);
	}

/**
 * 
 * VBOX event list triggered
 *
 */
}).on('vboxEvents',function(e,eventList) {
	
	var redrawCurrent = false;
	
	for(var i = 0; i < eventList.length; i++) {
		
		switch(eventList[i].eventType) {
		
			//////////////////////////
			//
			// Snapshot events
			//
			/////////////////////////
			case 'OnSnapshotTaken':
			case 'OnSnapshotDeleted':
			case 'OnSnapshotRestored':
			case 'OnSnapshotChanged':

				// Is this vm selected
				if(vboxChooser.getSingleSelectedId() == eventList[i].machineId) {
					
					// Update title
					$('#vboxTabVMSnapshotsTitle').html(trans('Snapshots','UIVMDesktop') + 
							(eventList[i].enrichmentData && eventList[i].enrichmentData.snapshotCount ? trans(' (%1)','VBoxSnapshotsWgt').replace('%1',eventList[i].enrichmentData.snapshotCount):''));		
				
					// Redraw snapshots if this is shown
					if($('#vboxTabVMSnapshots').data('lastVM') == eventList[i].machineId) {
						
						$('#vboxSnapshotList').children().empty().remove();
						
						// Append spinner
						$('#vboxSnapshotList').append($('<li />').attr({'class':'last'}).html("<div><img src='images/spinner.gif'></div>"));
						
						
						$.when(vboxAjaxRequest('machineGetSnapshots',{'vm':eventList[i].machineId})).done(__vboxTabSnapshotsFill);
									
						return;
						
					}
				}
				break;
				
			/////////////////////////
			//
			// Session or state change
			//
			////////////////////////
			case 'OnSessionStateChanged':
			case 'OnMachineStateChanged':
				if($('#vboxTabVMSnapshots').data('lastVM') == eventList[i].machineId && vboxChooser.getSingleSelectedId() == eventList[i].machineId) {
					redrawCurrent = true;
				}
				break;
				
		}
		
	}
	
	// Redraw current snapshot
	if(redrawCurrent) {
		
		var vmid = vboxChooser.getSingleSelectedId();
		
		// Get current state and details data
		$.when(vboxVMDataMediator.getVMData(vmid), vboxVMDataMediator.getVMDetails(vmid)).done(function(vm, vmd) {
			
			if($('#vboxTabVMSnapshots').data('lastVM') != vm.id) return;
			
			var selected = $('#vboxTabVMSnapshots').find('li.vboxSnapshotCurrentState').children('div.vboxListItemSelected').length;
        	$('#vboxTabVMSnapshots').find('li.vboxSnapshotCurrentState').replaceWith(__vboxTabSnapshotCurrent($.extend(true,{},vm,vmd)));
        	if(selected) {
				$('#vboxSnapshotList').trigger('select',
						$('#vboxTabVMSnapshots').find('li.vboxSnapshotCurrentState').children('div.vboxListItem').addClass('vboxListItemSelected').parent());
        	}
		});
	}


});

// Load snapshots on show
$('#vboxTabVMSnapshots').on('show',function(e){

	$('#vboxTabVMSnapshots').data('vboxShowing', 1);
	
	var vm = vboxChooser.getSingleSelected();
	
	if(vm && vm.id) {
		if($('#vboxTabVMSnapshots').data('lastVM') == vm.id) return;
		$('#vboxTabVMSnapshots').data('lastVM', vm.id);
	} else {
		$('#vboxSnapshotList').children().remove();
		$('#vboxTabVMSnapshots').data('lastVM',0);
		vboxSnapshotToolbar.disable();
		return;
	}
	
	
	// Get snapshots
	// Append spinner
	$('#vboxSnapshotList').append($('<li />').attr({'class':'last'}).html("<div><img src='images/spinner.gif'></div>"));
	$.when(vboxAjaxRequest('machineGetSnapshots',{'vm':vm.id})).done(__vboxTabSnapshotsFill);

	
}).on('hide',function(e) {
	$('#vboxTabVMSnapshots').data('vboxShowing', 0);
});

/*
 * Fill Snapshots
*/
function __vboxTabSnapshotsFill(response) {

	var snapshotData = response.responseData;
	
	if(vboxSnapshotToolbar._timer) {
		window.clearTimeout(vboxSnapshotToolbar._timer);
		vboxSnapshotToolbar._timer = null;
	}
	
	if(!snapshotData) return;
	
	// Get current state and details data
	$.when(vboxVMDataMediator.getVMData(response.responseData.vm), vboxVMDataMediator.getVMDetails(response.responseData.vm)).done(function(vm, vmd) {
		
		if($('#vboxTabVMSnapshots').data('lastVM') != vm.id) return;
		
		var list = $('#vboxSnapshotList');
		$(list).children().remove();
	
		var vmc = $.extend(true, {}, vm, vmd);
		
		// Snapshots exist
		if(snapshotData.snapshot && snapshotData.snapshot.name) {
	
			// Traverse snapshots
			$(list).append(__vboxTabSnapshot(snapshotData.snapshot, snapshotData.currentSnapshotId));
		
			// Append current state to last snapshot
			if(snapshotData.currentSnapshotId) {
		
				// Has children
				if($('#'+snapshotData.currentSnapshotId).children('ul').first()[0]) {
					$('#'+snapshotData.currentSnapshotId).children('ul').last().append(__vboxTabSnapshotCurrent(vmc));
				} else {
					$('#'+snapshotData.currentSnapshotId).append($('<ul />').append(__vboxTabSnapshotCurrent(vmc)));
				};
			};	
			
		// No snapshots. Append current state to list
		} else {
			$(list).append(__vboxTabSnapshotCurrent(vmc));
		}
		
		// Init vbox tree list
		$('#vboxSnapshotList').vbtree();
		
		vboxSnapshotToolbar.enable();
		
		var lastListItem = $(list).find('li.vboxSnapshotCurrentState').last();
		lastListItem.children().addClass('vboxListItemSelected');
		$('#vboxSnapshotList').trigger('select',lastListItem);
		
		__vboxTabSnapshotTimestamps();
		
	});

}

/* Snapshot list item */
function __vboxTabSnapshot(s, currentId) {

	var li = $('<li />').attr({'id':s.id});
	$(li).data('vboxSnapshot',s);
	
	// Use timestamp
	var t = '';
	if(s.timeStampSplit['seconds'] == 0)
		s.timeStampSplit['seconds'] = 1;

	var ago = 0;
	var ts = 'seconds';
	for(var i in s.timeStampSplit) {
		var l = Math.floor(t / s.timeStampSplit[i]);
		if(l > 0) {
			ago = l;
			ts = i;
			break;
		}
	}

	switch(ts) {
		case 'days':
			ts = trans('%n day(s)','VBoxGlobal', ago).replace('%n', ago);
			break;
		case 'hours':
			ts = trans('%n hour(s)', 'VBoxGlobal', ago).replace('%n', ago);
			break;				
		case 'minutes':
			ts = trans('%n minute(s)', 'VBoxGlobal', ago).replace('%n', ago);
			break;				
		case 'seconds':
			ts = trans('%n second(s)', 'VBoxGlobal', ago).replace('%n', ago);
			break;				
	}
	ts = trans(' (%1 ago)','VBoxSnapshotsWgt').replace('%1', ts);
	
	$(li).append(' ').append(
	
	   $('<div />').attr({'class':'vboxListItem'})
	   	  .html('<img src="images/vbox/snapshot_'+(s.online ? 'online' : 'offline')+'_16px.png" height="16" width="16" /> ' + 
	   			  $('<div />').text(s.name).html())
	   	   .append($('<span />').attr({'class':'timestamp'}).data({'vboxTimestamp':s.timeStamp}).text(ts))
	   			  
	      // Context menu
		  .contextMenu({
				menu: vboxSnapshotContextMenu.menuId(),
				clickthrough: true
			},vboxSnapshotContextMenu.menuClickCallback)
			
			// show details on dblclick
			.dblclick(vboxSnapshotButtons[4].click).disableSelection()
			
			// tool tip
			.tipped({'position':'mouse','delay':1500,'source':'<p><strong>'+$('<div />').text(s.name).html()+'</strong> ('+trans((s.online ? 'online)' : 'offline)'),'VBoxSnapshotsWgt')+'</p>'+
				'<p>'+ vboxDateTimeString(s.timeStamp, trans('Taken at %1','VBoxSnapshotsWgt'), trans('Taken on %1','VBoxSnapshotsWgt'))+'</p>' +
							(s.description ? '<hr />' + $('<div />').text(s.description).html() : '')})
			
	).addClass(currentId == s.id ? 'vboxSnapshotCurrent' : '').children('div.vboxListItem').first().click(function(){
		$('#vboxSnapshotList').find('div.vboxListItemSelected').first().removeClass('vboxListItemSelected');
		$(this).addClass('vboxListItemSelected');
		$('#vboxSnapshotList').trigger('select',$(this).parent());
	});

	
	if(s.children.length) {
		var ul = $('<ul />');
		for(var i = 0; i < s.children.length; i++) {
			$(ul).append(__vboxTabSnapshot(s.children[i], currentId));
		}
		$(li).append(ul);
	}
		


	return li;
}

/* Current state list item */
function __vboxTabSnapshotCurrent(vm) {

	return $('<li />').data('vboxSnapshot',{'state':'current','name':trans((vm.currentStateModified ? 'Current State (changed)' : 'Current State'),'VBoxSnapshotsWgt')}).html(' ')
		.addClass('last vboxSnapshotCurrent vboxSnapshotCurrentState')
		.append(
				$('<div />').attr({'class':'vboxListItem'}).html('<img src="images/vbox/'+vboxMachineStateIcon(vm.state)+'" height="16" width="16" /> ' + $('<div />').text(trans((vm.currentStateModified ? 'Current State (changed)' : 'Current State'),'VBoxSnapshotsWgt')).html())
				.contextMenu({
						menu: vboxSnapshotContextMenuCurrent.menuId(),
						clickthrough : true
					},vboxSnapshotContextMenuCurrent.menuClickCallback)
				.click(function(){
					$('#vboxSnapshotList').find('div.vboxListItemSelected').first().removeClass('vboxListItemSelected');
					$(this).addClass('vboxListItemSelected');
					$('#vboxSnapshotList').trigger('select',$(this).parent());
				})
				.tipped({'position':'mouse','delay':1500,'source':'<strong>'+
					trans((vm.currentStateModified ? 'Current State (changed)' : 'Current State'),'VBoxSnapshotsWgt') + '</strong><br />'+
					trans('%1 since %2','VBoxSnapshotsWgt').replace('%1',trans(vboxVMStates.convert(vm.state),'VBoxGlobal'))
						.replace('%2',vboxDateTimeString(vm.lastStateChange))
					+ (vm.snapshotCount > 0 ? '<hr />' + (vm.currentStateModified ?
								trans('The current state differs from the state stored in the current snapshot','VBoxSnapshotsWgt')
								: trans('The current state is identical to the state stored in the current snapshot','VBoxSnapshotsWgt'))
						: '')
					})
		);
	
}

 
/* Update snapshot timestamps */
function __vboxTabSnapshotTimestamps() {
	
	// Shorthand
	var timeSpans = vboxSnapshotToolbar._timeSpans;
	
	// Keep minimum timestamp
	var minTs = 60;

	var currentTime = new Date();
	currentTime = Math.floor(currentTime.getTime() / 1000);

	$('#vboxTabVMSnapshots').find('span.timestamp').each(function(){
		
		var sts = parseInt($(this).data('vboxTimestamp'));
		var t = Math.max(currentTime - sts, 1);
		
		minTs = Math.min(minTs,t);
		
		// Check for max age.
		if(Math.floor(t / 86400) > 30) {
			var sdate = new Date(sts * 1000);
			$(this).html(trans(' (%1)','VBoxSnapshotsWgt').replace('%1',sdate.toLocaleString()));
			return;
		}
		
		var ago = 0;
		var ts = 'seconds';
		for(var i in timeSpans) {
			var l = Math.floor(t / timeSpans[i]);
			if(l > 0) {
				ago = l;
				ts = i;
				break;
			}
		}
		switch(ts) {
			case 'days':
				ts = trans('%n day(s)', 'VBoxGlobal', ago).replace('%n', ago);
				break;
			case 'hours':
				ts = trans('%n hour(s)', 'VBoxGlobal', ago).replace('%n', ago);
				break;				
			case 'minutes':
				ts = trans('%n minute(s)', 'VBoxGlobal', ago).replace('%n', ago);
				break;				
			case 'seconds':
				ts = trans('%n second(s)', 'VBoxGlobal', ago).replace('%n', ago);
				break;				
		}
		$(this).html(ts = trans(' (%1 ago)','VBoxSnapshotsWgt').replace('%1', ts));
	});
	
	var timerSet = (minTs >= 60 ? 60 : 10);
	vboxSnapshotToolbar._timer = window.setTimeout(__vboxTabSnapshotTimestamps,(timerSet * 1000));
}


</script>
</div>
