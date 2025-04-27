/**
 * @fileOverview Dialog logic for various wizards and other dialogs
 * @author Ian Moore (imoore76 at yahoo dot com)
 * @version $Id: dialogs.js 599 2015-07-27 10:40:37Z imoore76 $
 * @copyright Copyright (C) 2010-2015 Ian Moore (imoore76 at yahoo dot com)
 */

/**
 * Run the import appliance wizard
 */
function vboxWizardImportApplianceDialog() {

	// reference
	var self = this;
	
	// Extend vboxWizard
	this.parentClass = vboxWizard;
	this.parentClass();
	
	/* Common settings */
	this.name = 'wizardImportAppliance';
	this.title = trans('Import Virtual Appliance','UIWizardImportApp');
	this.bg = 'images/vbox/vmw_ovf_import_bg.png';
	this.icon = 'import';
	this.steps = 2;
	this.height = 500;
	this.finishText = trans('Import','UIWizardImportApp');
	this.context = 'UIWizardImportApp';
	
	/* Restore defaults is added to last step */
	this.stepButtons = [
           {
        	   'name' : trans('Restore Defaults','UIWizardImportApp'),
        	   'steps' : [-1],
        	   'click' : function() {
        		   wizardImportApplianceParsed();
        	   }
           }
       ];
	
	/* Data to be loaded */
	this.data = [
	   {'fn':'vboxGetEnumerationMap','args':{'class':'NetworkAdapterType'},'callback':function(d){$('#vboxPane').data('vboxNetworkAdapterTypes',d.responseData);}},
	   {'fn':'vboxGetEnumerationMap','args':{'class':'AudioControllerType'},'callback':function(d){$('#vboxPane').data('vboxAudioControllerTypes',d.responseData);}},
	];
	
	/* Perform action on finish */
	this.onFinish = function() {

		var file = $(self.form).find('[name=wizardImportApplianceLocation]').val();
		var descriptions = $('#vboxImportProps').data('descriptions');
		var reinitNetwork = $(self.form).find('[name=vboxImportReinitNetwork]').prop('checked');
		
		// Check for descriptions
		if(!descriptions) {
			return;
		}
		
		
		/** Call Appliance import AJAX function */
		var vboxImportApp = function() {
			
			$(self.dialog).empty().remove();
			
			var l = new vboxLoader();
			l.add('applianceImport',function(d){
				if(d.responseData.progress) {
					vboxProgress({'progress':d.responseData.progress,'persist':d.persist},function(){
						// Imported media must be refreshed
						var ml = new vboxLoader();
						ml.add('vboxGetMedia',function(d){$('#vboxPane').data('vboxMedia',d.responseData);});
						ml.onLoad = function(){
							self.completed.resolve();
						};
						ml.run();
					},'progress_import_90px.png',trans('Import an appliance into VirtualBox','UIActionPool').replace(/\.+$/g,''),vboxBasename(file));
				} else {
					self.completed.reject();
				}
			},{'descriptions':descriptions,'file':file,'reinitNetwork':reinitNetwork});
			l.run();				
		};
		
		// license agreements
		var licenses = [];
		
		// Step through each VM and obtain value
		for(var a = 0; a < descriptions.length; a++) {
			var children = $('#vboxImportProps').children('tr.vboxChildOf'+a);
			descriptions[a][5] = []; // enabled / disabled
			var lic = null;
			var vmname = null;
			for(var b = 0; b < children.length; b++) {
				descriptions[a][5][b] = !$(children[b]).data('propdisabled');
				descriptions[a][3][$(children[b]).data('descOrder')] = $(children[b]).children('td:eq(1)').data('descValue');
				// check for license
				if(descriptions[a][0][b] == 'License') {
					lic = descriptions[a][2][b];
				} else if(descriptions[a][0][b] == 'Name') {
					vmname = descriptions[a][2][b]; 
				}
			}
			if(lic) {
				if(!vmname) vmname = trans('Virtual System %1','UIApplianceEditorWidget').replace('%1',a);
				licenses[licenses.length] = {'name':vmname,'license':lic};
			}
		}

		
		if(licenses.length) {
			
			var msg = trans('<b>The virtual system "%1" requires that you agree to the terms and conditions of the software license agreement shown below.</b><br /><br />Click <b>Agree</b> to continue or click <b>Disagree</b> to cancel the import.','UIImportLicenseViewer');
			var a = 0;
			var buttons = {};
			buttons[trans('Agree','UIImportLicenseViewer')] = function() {

				a++;
				if(a >= licenses.length) {
					$(this).remove();
					vboxImportApp();
					return;
				}
				$(this).dialog('close');
				$('#vboxImportWizLicTitle').html(msg.replace('%1',licenses[a]['name']));
				$('#vboxImportWizLicContent').val(licenses[a]['license']);
				$(this).dialog('open');

			};
			buttons[trans('Disagree','UIImportLicenseViewer')] = function() {
				$(this).empty().remove();
			};
			
			var dlg = $('<div />').dialog({'closeOnEscape':false,'width':600,'height':500,'buttons':buttons,'modal':true,'autoOpen':false,'dialogClass':'vboxDialogContent vboxWizard','title':'<img src="images/vbox/os_type_16px.png" class="vboxDialogTitleIcon" /> ' + trans('Software License Agreement','UIImportLicenseViewer')});
			
			$(dlg).html('<p id="vboxImportWizLicTitle" /><textarea rows="20" spellcheck="false" wrap="off" readonly="true"id="vboxImportWizLicContent" style="width:100%; margin:2px; padding:2px;"></textarea>');
			$('#vboxImportWizLicTitle').html(msg.replace('%1',licenses[a]['name']));
			$('#vboxImportWizLicContent').val(licenses[a]['license']);
			$(dlg).dialog('open');

		} else {
			vboxImportApp();				
		}
		

	};
	
}

/**
 * Run the export appliance wizard
 */
function vboxWizardExportApplianceDialog() {

	// reference
	var self = this;
	
	// Extend vboxWizard class
	this.parentClass = vboxWizard;
	this.parentClass();
	
	/* Common settings */
	this.name = 'wizardExportAppliance';
	this.title = trans('Export Virtual Appliance','UIWizardExportApp');
	this.bg = 'images/vbox/vmw_ovf_export_bg.png';
	this.icon = 'export';
	this.steps = 4;
	this.height = 500;
	this.context = 'UIWizardExportApp';
	this.finishText = trans('Export','UIWizardExportApp');
	
	/* Add restore defaults button to last step */
	this.stepButtons = [
	   {
		   'name' : trans('Restore Defaults','UIWizardExportApp'),
		   'steps' : [-1],
		   'click' : function(e) {
			   // Remove export VM properties
			   $('#vboxExportProps').children().remove();
			   // Re-trigger adding them
			   if(self.mode == 'advanced')
				   vboxWizardExportApplianceUpdateList();
			   else
				   $('#wizardExportApplianceStep4').trigger('show',e,self);
		   }
	   }
	];

	/* Function run when wizard completes */
	this.onFinish = function() {
		
		
		// Actually export appliances
		function vboxExportApp(force) {

			// Each VM
			var vmid = null;
			var vms = {};
			var vmsAndProps = $('#vboxExportProps').children('tr');
			for(var a = 0; a < vmsAndProps.length; a++) {
				if($(vmsAndProps[a]).hasClass('vboxTableParent')) {
					vmid = $(vmsAndProps[a]).data('vm').id;
					vms[vmid] = {};
					vms[vmid]['id'] = vmid;
					continue;
				}
				
				var prop = $(vmsAndProps[a]).data('vmprop');
				vms[vmid][prop] = $(vmsAndProps[a]).children('td:eq(1)').children().first().text();
					
			}

			var file = $(self.form).find('[name=wizardExportApplianceLocation]').val();
			var format = $(self.form).find('[name=wizardExportApplianceFormat]').val();
			var manifest = $(self.form).find('[name=wizardExportApplianceManifest]').prop('checked');
			var overwrite = force;
			
			var l = new vboxLoader();
			l.add('applianceExport',function(d){
				if(d.responseData.progress) {
					vboxProgress({'progress':d.responseData.progress,'persist':d.persist},function(){
						self.completed.resolve();
						},'progress_export_90px.png',
						trans('Export one or more VirtualBox virtual machines as an appliance','UIActionPool').replace(/\.+$/g,''),
						vboxBasename(file));
				} else {
					self.completed.reject();
				}
			},{'format':format,'file':file,'vms':vms,'manifest':manifest,'overwrite':overwrite});
			l.run();
			
			$(self.dialog).empty().remove();
			
			
		}

		/* Remove required classes */
		$(self.form).find('[name=wizardExportApplianceLocation]').removeClass('vboxRequired');
		$('#vboxExportAppVMListContainer').removeClass('vboxRequired');
		
		/* Some vms must be selected */
		if($('#vboxExportProps').children('tr').length == 0) {
			$('#vboxExportAppVMListContainer').addClass('vboxRequired');
			return;
		}
		
		/* Check to see if file exists */
		var loc = $(self.form).find('[name=wizardExportApplianceLocation]').val();
		if(!loc) {
			$(self.form).find('[name=wizardExportApplianceLocation]').addClass('vboxRequired');
			return;
		}
		
		var fileExists = false;
		var fe = new vboxLoader();
		fe.add('fileExists',function(d){
			fileExists = d.responseData;
		},{'file':loc});
		fe.onLoad = function() { 
			if(fileExists) {
				var buttons = {};
				buttons[trans('Yes','QIMessageBox')] = function() {
					vboxExportApp(1);
					$(this).empty().remove();
				};
				vboxConfirm(trans('A file named <b>%1</b> already exists. Are you sure you want to replace it?<br /><br />Replacing it will overwrite its contents.','UIMessageCenter').replace('%1',vboxBasename(loc)),buttons,trans('No','QIMessageBox'));
				return;
			}
			vboxExportApp(0);
			
		};
		fe.run();

	};

}

/**
 * Show the medium encryption dialog
 * 
 * @param {String} context - used in dialog name
 * @param {Array} encIds - encryption ids
 * 
 */
function vboxMediumEncryptionPasswordsDialog(context, encIds, validIds) {
    
    if(!(encIds && encIds.length)) { return []; }

    var results = $.Deferred();
    
    var dialogTitle = trans("%1 - Disk Encryption").replace('%1', context);
    
    var l = new vboxLoader();
    l.addFileToDOM("panes/mediumEncryptionPasswords.html");
    l.onLoad = function() {

        for(var i = 0; i < encIds.length; i++) {    
            vboxMediumEncryptionPasswordAdd(encIds[i].id, validIds && validIds.length && jQuery.inArray(encIds[i].id, validIds) > -1);
        }
        
        var buttons = {};
        buttons[trans('OK','QIMessageBox')] = function(){
            // Get passwords
            var pws = vboxMediumEncryptionPasswordsGet();
            if(pws === false)
                return;
            
            $(this).trigger('close').empty().remove();
            
            results.resolve(pws);
        };
        buttons[trans('Cancel','QIMessageBox')] = function(){
            results.reject();
            $(this).trigger('close').empty().remove();
        };

        $('#vboxMediumEncryptionPasswords').dialog({'closeOnEscape':true,'width':600,'height':400,'buttons':buttons,'modal':true,'autoOpen':true,'dialogClass':'vboxDialogContent','title':'<img src="images/vbox/nw_16px.png" class="vboxDialogTitleIcon" /> ' + dialogTitle}).on("dialogbeforeclose",function(){
            $(this).parent().find('span:contains("'+trans('Cancel','QIMessageBox')+'")').trigger('click');
        });

    };
    
    l.run()
    
    return results.promise();
}

/**
 * Show the port forwarding configuration dialog
 * @param {Array} rules - list of port forwarding rules to process
 * @returns {Object} deferred promise
 */
function vboxPortForwardConfigDialog(rules) {
	
	var results = $.Deferred();
	
	var l = new vboxLoader();
	l.addFileToDOM("panes/settingsPortForwarding.html");
	l.onLoad = function(){
		
		vboxSettingsPortForwardingInit(rules);
		
		var resizeTable = function() {
			var h = $('#vboxSettingsPortForwarding').children('table').hide().parent().innerHeight() - 16;
			$('#vboxSettingsPortForwarding').children('table').css({'height':h+'px'}).show();
			$('#vboxSettingsPortForwardingListDiv').css({'height':(h-6)+'px','overflow':'auto'});
			
			
		};
		
		var buttons = {};
		buttons[trans('OK','QIMessageBox')] = function(){
			// Get rules
			var rules = $('#vboxSettingsPortForwardingList').children('tr');
			var rulesToPass = new Array();
			for(var i = 0; i < rules.length; i++) {
				if($(rules[i]).data('vboxRule')[3] == 0 || $(rules[i]).data('vboxRule')[5] == 0) {
					vboxAlert(trans("The current port forwarding rules are not valid. " +
				               "None of the host or guest port values may be set to zero.",'UIMessageCenter'));
					return;
				}
				rulesToPass[i] = $(rules[i]).data('vboxRule');
			}
			$(this).trigger('close').empty().remove();
			
			results.resolve(rulesToPass);
		};
		buttons[trans('Cancel','QIMessageBox')] = function(){
			results.reject();
			$(this).trigger('close').empty().remove();
		};
		
		$('#vboxSettingsPortForwarding').dialog({'closeOnEscape':true,'width':600,'height':400,'buttons':buttons,'modal':true,'autoOpen':true,'dialogClass':'vboxDialogContent','title':'<img src="images/vbox/nw_16px.png" class="vboxDialogTitleIcon" /> ' + trans('Port Forwarding Rules','UIMachineSettingsPortForwardingDlg')}).on("dialogbeforeclose",function(){
	    	$(this).parent().find('span:contains("'+trans('Cancel','QIMessageBox')+'")').trigger('click');
	    }).on('dialogresizestop',resizeTable);
		
		resizeTable();
	};
	l.run();
	
	return results.promise();
}

/**
 * Run the New Virtual Machine Wizard
 * @param {String} vmgroup - VM group to add machine to
 */
function vboxWizardNewVMDialog(vmgroup) {

	// reference to self
	var self = this;
	
	// Extend vboxWizard class
	this.parentClass = vboxWizard;
	this.parentClass();

	/* Common settings */
	this.name = 'wizardNewVM';
	this.bg = 'images/vbox/vmw_new_welcome_bg.png';
	this.title = trans('Create Virtual Machine','UIWizardNewVM');
	this.icon = 'vm_new';
	this.steps = 3;
	this.vmgroup = vmgroup;
	this.context = 'UIWizardNewVM';
	this.finishText = trans('Create','UIWizardNewVM');
	this.data = [
	   {'fn':'vboxGetMedia','callback':function(d){$('#vboxPane').data('vboxMedia',d.responseData);}}
	];
	
	/* Function to run when wizard completes */
	this.onFinish = function() {

		// Callback to finish wizard
		var vboxNewVMFinish = function() {
			
			// Get parameters
			var disk = '';
			if($(self.form).find('[name=newVMDisk]:checked').val() == 'existing') {
				disk = $(self.form)[0].newVMDiskSelect.options[$(self.form)[0].newVMDiskSelect.selectedIndex].value;
				disk = vboxMedia.getMediumById(disk).location;
			}
			var name = jQuery.trim($(self.form).find('[name=newVMName]').val());
			var ostype = $(self.form).find('[name=newVMOSType]').val();
			var mem = parseInt($(self.form).find('[name=wizardNewVMSizeValue]').val());
			
			// Show loading screen
			var l = new vboxLoader('machineCreate');
			l.showLoading();
			
			$.when(vboxAjaxRequest('machineCreate',{'disk':disk,'ostype':ostype,'memory':mem,'name':name,'group':vmgroup}))
			.always(function() {
				l.removeLoading();
			}).done(function(res){

				if(res.responseData.exists) {
					vboxAlert(trans('<p>Cannot create the machine folder <b>%1</b> in the parent folder <nobr><b>%2</b>.</nobr></p><p>This folder already exists and possibly belongs to another machine.</p>','UIMessageCenter').replace('%1',vboxBasename(res.exists)).replace('%2',vboxDirname(res.exists)));
				
				} else if(res.success) {
					$(self.dialog).empty().remove();
					var lm = new vboxLoader('machineCreate');
					lm.add('vboxGetMedia',function(d){$('#vboxPane').data('vboxMedia',d.responseData);});
					lm.onLoad = function() {
						self.completed.resolve();
					};
					lm.run();
				} else {
					self.completed.reject();
				}
				
			});
			
		};
		
		// Name must exist
		if(!jQuery.trim($(self.form).find('[name=newVMName]').val())) {
			$(self.form).find('[name=newVMName]').addClass('vboxRequired');
			return;
		}
		$(self.form).find('[name=newVMName]').removeClass('vboxRequired');
		
		// Make sure file does not exist
		var fnl = new vboxLoader();
		fnl.add('vboxGetComposedMachineFilename',function(d){
			
			loc = vboxDirname(d.responseData);
			var fileExists = false;
			
			var fe = new vboxLoader('fileExists');
			fe.add('fileExists',function(d){
				fileExists = d.responseData;
			},{'file':loc});
			fe.onLoad = function() { 
				
				if(fileExists) {
					
					vboxAlert(trans('<p>Cannot create the machine folder <b>%1</b> in the parent folder <nobr><b>%2</b>.</nobr></p><p>This folder already exists and possibly belongs to another machine.</p>','UIMessageCenter').replace('%1',vboxBasename(loc)).replace('%2',vboxDirname(loc)));
					// Go back
					self.displayStep(1);
					
					return;
				}
				
				// Start new harddisk wizard if create new is selected
				if($(self.form).find('[name=newVMDisk]:checked').val() == 'create') {
					
					// Recommended size
					var size = newVMOSTypesObj[$(self.form).find('[name=newVMOSType]').val()].recommendedHDD;
					
					$.when(new vboxWizardNewHDDialog({'name':jQuery.trim($(self.form).find('[name=newVMName]').val()),'size':size,'group':vmgroup}).run())
							.done(function(med){
								
								$(self.form).find('[name=newVMDisk]').eq(2).trigger('click').prop('checked',true);
								
								// Add newly created disk as option and select it
								vmNewFillExistingDisks(med);
								
								vboxNewVMFinish();
						
							});
					
					return;
					
				} else if($(self.form).find('[name=newVMDisk]:checked').val() == 'none') {
					
					buttons = {};
					buttons[trans('Continue','UIMessageCenter')] = function(){
						$(this).empty().remove();
						vboxNewVMFinish();
					};
					vboxConfirm(trans('You are about to create a new virtual machine without a hard disk. You will not be able to install an operating system on the machine until you add one. In the mean time you will only be able to start the machine using a virtual optical disk or from the network.','UIMessageCenter'), buttons, trans('Go Back','UIMessageCenter'));
					return;
				}
				
				vboxNewVMFinish();
				
			};
			fe.run();
			
			
		},{'name':document.forms['frmwizardNewVM'].newVMName.value, 'group':vmgroup});
		
		fnl.run();
	};
	
}

/**
 * Run the Clone Virtual Machine Wizard
 * @param {Object} args - wizard data - args.vm and args.snapshot should be populated
 * @returns {Object} deferred promise
 * @see vboxWizard()
 */
function vboxWizardCloneVMDialog(args) {
	
	// self reference
	var self = this;
	
	// Extend vboxWizard class
	this.parentClass = vboxWizard;
	this.parentClass();
	
	/* Common options */
	this.name = 'wizardCloneVM';
	this.title = trans('Clone Virtual Machine','UIWizardCloneVM');
	this.bg = 'images/vbox/vmw_clone_bg.png';
	this.icon = 'vm_clone';
	this.finishText = trans('Clone','UIWizardCloneVM');
	this.context = 'UIWizardCloneVM';
	this.widthAdvanced = 450;
	this.heightAdvanced = 350;

	/* Override run() because we need VM data */
	this.parentRun = this.run;
	this.run = function() {

		var l = new vboxLoader('vboxWizardCloneVMInit');
		l.showLoading();
		$.when(vboxVMDataMediator.getVMDetails(args.vm.id)).always(function() {
			// Always remove loading screen
			l.removeLoading();		
		}).done(function(d){			
			self.steps = (d.snapshotCount > 0 ? 3 : 2);
			self.args = $.extend(true,args,{'vm':d});
			self.parentRun();
		});
		
		return self.completed.promise();

	};
	
	/* Function to run when finished */
	this.onFinish = function() {
		
		// Get parameters
		var name = jQuery.trim($(self.form).find('[name=machineCloneName]').val());
		var src = self.args.vm.id;
		var snapshot = self.args.snapshot;
		var allNetcards = $(self.form).find('[name=vboxCloneReinitNetwork]').prop('checked');
		
		if(!name) {
			$(self.form).find('[name=machineCloneName]').addClass('vboxRequired');
			return;
		}
		
		
		// Only two steps? We can assume that state has no child states.
		// Force current state only
		var vmState = 'MachineState';
		if(self.steps > 2 || self.mode == 'advanced') {
			vmState = $(self.form).find('[name=vmState]:checked').val();
		}
		
		// Full / linked clone
		var cLink = $(self.form).find('[name=vboxCloneType]').eq(1).prop('checked');
		
		// wrap function
		var vbClone = function(sn) {
			
			$.when(vboxAjaxRequest('machineClone', {'name':name,'vmState':vmState,'src':src,'snapshot':sn,'reinitNetwork':allNetcards,'link':cLink}))
				.done(function(d){
					if(d.responseData.progress) {
						var registerVM = d.responseData.settingsFilePath;
						vboxProgress({'progress':d.responseData.progress,'persist':d.persist},function(ret) {
							$.when(vboxAjaxRequest('machineAdd',{'file':registerVM})).done(function(){

								$.when(vboxAjaxRequest('vboxGetMedia')).done(function(dat){
									$('#vboxPane').data('vboxMedia',dat.responseData);
									self.completed.resolve();
								}).fail(function(){
									self.completed.reject();
								});
							}).fail(function(){
								self.completed.reject();
							});
						},'progress_clone_90px.png',trans('Clone selected virtual machine','UIActionPool'),
						self.args.vm.name + ' > ' + name);
					} else {
						self.completed.reject();
					}					
				}).fail(function(){
					self.completed.reject();
				});
		};
		
		// Check for linked clone, but not a snapshot
		if(cLink && !self.args.snapshot) {
			
			$.when(vboxAjaxRequest('snapshotTake',
					{'vm':src,'name':trans('Linked Base for %1 and %2','UIWizardCloneVM').replace('%1',self.args.vm.name).replace('%2',name),'description':''}))
				.done(function(d){
					
					if(d.responseData.progress) {
						
						vboxProgress({'progress':d.responseData.progress,'persist':d.persist},function(){
							$.when(vboxVMDataMediator.getVMDetails(src, true)).done(function(md){
								vbClone(md.currentSnapshot);	
							});
						},
						'progress_snapshot_create_90px.png',
						trans('Take a snapshot of the current virtual machine state','UIActionPool'),
						self.args.vm.name);
						
					} else if(d && d.error) {
						self.completed.reject();
						vboxAlert(d.error);
					}
					
				}).fail(function(){
					self.completed.reject();
				});
			
			// Just clone
		} else {
			vbClone(snapshot);
		}
		
		$(self.dialog).empty().remove();
		
	};
}

/**
 * Run the VM Log Viewer dialog
 * @param {String} vm - uuid or name of virtual machine to obtain logs for
 */
function vboxShowLogsDialogInit(vm) {

	$('#vboxPane').append($('<div />').attr({'id':'vboxVMLogsDialog'}));
	
	var l = new vboxLoader();
	l.add('machineGetLogFilesList',function(r){
		$('#vboxVMLogsDialog').data({'logs':r.responseData.logs,'logpath':r.responseData.path});
	},{'vm':vm.id});
	l.addFileToDOM('panes/vmlogs.html',$('#vboxVMLogsDialog'));
	l.onLoad = function(){
		var buttons = {};
		buttons[trans('Refresh','UIVMLogViewer')] = function() {
			l = new vboxLoader();
			l.add('machineGetLogFilesList',function(r){
				$('#vboxVMLogsDialog').data({'logs':r.responseData.logs,'logpath':r.responseData.path});
				
			},{'vm':vm.id});
			l.onLoad = function(){
				vboxShowLogsInit(vm);
			};
			l.run();
		};
		buttons[trans('Close','UIVMLogViewer')] = function(){$(this).trigger('close').empty().remove();};
		$('#vboxVMLogsDialog').dialog({'closeOnEscape':true,'width':800,'height':500,'buttons':buttons,'modal':true,'autoOpen':true,'dialogClass':'vboxDialogContent','title':'<img src="images/vbox/vm_show_logs_16px.png" class="vboxDialogTitleIcon" /> '+ trans('%1 - VirtualBox Log Viewer','UIVMLogViewer').replace('%1',vm.name)}).on("dialogbeforeclose",function(){
	    	$(this).parent().find('span:contains("'+trans('Close','UIVMLogViewer')+'")').trigger('click');
	    });
		vboxShowLogsInit(vm);
	};
	l.run();

}

/**
 * Show the Virtual Media Manager Dialog
 * @param {Boolean} select - true to display "Select" button and resolve with selected medium
 * @param {String} type - optionally restrict media to media of this type
 * @param {Boolean} hideDiff - optionally hide differencing HardDisk media
 * @param {String} mPath - optional path to use when adding or creating media through the VMM dialog
 * @returns {Object} deferred promise
 */
function vboxVMMDialog(select,type,hideDiff,mPath) {

	var results = $.Deferred();
	
	$('#vboxPane').append($('<div />').attr({'id':'vboxVMMDialog','class':'vboxVMMDialog'}));
			
	var l = new vboxLoader();
	l.add('getConfig',function(d){$('#vboxPane').data('vboxConfig',d.responseData);});
	l.add('vboxSystemPropertiesGet',function(d){$('#vboxPane').data('vboxSystemProperties',d.responseData);});
	l.add('vboxGetMedia',function(d){$('#vboxPane').data('vboxMedia',d.responseData);});
	l.addFileToDOM('panes/vmm.html',$('#vboxVMMDialog'));
	l.onLoad = function() {
		var buttons = {};
		if(select) {
			buttons[trans('Select','UIMediumManager')] = function() {
				var sel = null;
				switch($("#vboxVMMTabs").tabs('option','active')) {
					case 0: /* HardDisks */
						sel = $('#vboxVMMHDList').find('tr.vboxListItemSelected').first();
						break;
					case 1: /* DVD */
						sel = $('#vboxVMMCDList').find('tr.vboxListItemSelected').first();
						break;
					default:
						sel = $('#vboxVMMFDList').find('tr.vboxListItemSelected').first();
				}
				if($(sel).length) {
					vboxMedia.updateRecent(vboxMedia.getMediumById($(sel).data('medium')));
					results.resolve($(sel).data('medium'));
				}
				$('#vboxVMMDialog').trigger('close').empty().remove();
			};
		}
		buttons[trans('Close','UIMessageCenter')] = function() {
			$('#vboxVMMDialog').trigger('close').empty().remove();
			results.reject();
		};

		$("#vboxVMMDialog").dialog({'closeOnEscape':true,'width':800,'height':500,'buttons':buttons,'modal':true,'autoOpen':true,'dialogClass':'vboxDialogContent vboxVMMDialog','title':'<img src="images/vbox/diskimage_16px.png" class="vboxDialogTitleIcon" /> '+trans('Virtual Media Manager','VBoxMediaManagerDlg')}).on("dialogbeforeclose",function(){
	    	$(this).parent().find('span:contains("'+trans('Close','UIMessageCenter')+'")').trigger('click');
	    });
		
		vboxVMMInit(hideDiff,mPath);
		
		if(type) {
			switch(type) {
				case 'HardDisk':
					$("#vboxVMMTabs").tabs('option','active',0);
					$("#vboxVMMTabs").tabs('disable',1);
					$("#vboxVMMTabs").tabs('disable',2);					
					break;
				case 'DVD':
					$("#vboxVMMTabs").tabs('option','active',1);
					$("#vboxVMMTabs").tabs('disable',0);
					$("#vboxVMMTabs").tabs('disable',2);					
					break;
				case 'Floppy':
					$("#vboxVMMTabs").tabs('option','active',2);
					$("#vboxVMMTabs").tabs('disable',0);
					$("#vboxVMMTabs").tabs('disable',1);
					break;
				default:
					$("#vboxVMMTabs").tabs('option','active',0);
					break;
			}
		}
	};
	l.run();
	
	return results.promise();
}

/**
 * Run the New Virtual Disk wizard
 * @param {Object} suggested - sugggested defaults such as hard disk name and path
 */
function vboxWizardNewHDDialog(suggested) {

	// reference
	var self = this;
	
	// Extend vboxWizard class
	this.parentClass = vboxWizard;
	this.parentClass();
	
	/* Common options */
	this.name = 'wizardNewHD';
	this.title = trans('Create Virtual Hard Disk','UIWizardNewVD');
	this.bg = 'images/vbox/vmw_new_harddisk_bg.png';
	this.icon = 'hd';
	this.steps = 3;
	this.suggested = suggested;
	this.context = 'UIWizardNewVD';
	this.finishText = trans('Create','UIWizardNewVD');
	this.height = 450;
	
	this.data = [
	   {'fn':'vboxSystemPropertiesGet','callback':function(d){$('#vboxPane').data('vboxSystemProperties',d.responseData);}},
	   {'fn':'vboxGetMedia','callback':function(d){$('#vboxPane').data('vboxMedia',d.responseData);}}
	];
	
	// Compose folder if suggested name exists
	if(this.suggested && this.suggested.name) {
		if(!this.suggested['group']) this.suggested.group = '';
		this.data.push(
			{'fn':'vboxGetComposedMachineFilename','callback':function(d){
			self.suggested.path = vboxDirname(d.responseData)+$('#vboxPane').data('vboxConfig').DSEP;
		},'args':{'name':this.suggested.name, 'group':this.suggested.group}});
	}
	
	/* Function to run when wizard completes */
	this.onFinish = function() {

		// Fix size if we need to
		var mbytes = vboxConvertMbytes($(self.form).find('[name=wizardNewHDSizeValue]').val());
		$(self.form).find('[name=wizardNewHDSizeValue]').val(vboxMbytesConvert(mbytes));
		$('#wizardNewHDSizeLabel').html(vboxMbytesConvert(mbytes) + ' ('+mbytes+' '+trans('MB','VBoxGlobal')+')');

		// Determine file location
		var file = $(self.form).find('[name=wizardNewHDLocation]').val();
		if(file.search(/[\/|\\]/) < 0) {
			// just a name
			if(self.suggested.path) {
				if($('#vboxPane').data('vboxConfig').enforceVMOwnership==true){
					file = self.suggested.path + $('#vboxPane').data('vboxConfig').DSEP + $('#vboxPane').data('vboxSession').user + "_" + file;	
				} else {
					file = self.suggested.path + $('#vboxPane').data('vboxConfig').DSEP + file;
				}
			} else{
				if($('#vboxPane').data('vboxConfig').enforceVMOwnership==true){
					file = $('#vboxPane').data('vboxSystemProperties').homeFolder + $('#vboxPane').data('vboxConfig').DSEP + $('#vboxPane').data('vboxSession').user + "_" + file;
				} else {
					file = $('#vboxPane').data('vboxSystemProperties').homeFolder + $('#vboxPane').data('vboxConfig').DSEP + file;
				}
			}
		
		// Enforce VM ownership
		} else if($('#vboxPane').data('vboxConfig').enforceVMOwnership==true) {
			// has user ownership so use folderbased 
			var nameIndex = file.lastIndexOf($('#vboxPane').data('vboxConfig').DSEP);
			var path = file.substr(0,nameIndex);
			var name = file.substr(nameIndex+1,file.length);
			file = path +$('#vboxPane').data('vboxConfig').DSEP + $('#vboxPane').data('vboxSession').user + "_" + name;
		}

		var format = $(self.form)[0].elements['newHardDiskFileType'];
		var formatOpts = {};
		for(var i = 0; i < format.length; i++) {
			if(format[i].checked) {
				formatOpts = $(format[i]).closest('tr').data('vboxFormat');
				format=format[i].value;
				break;
			}
		}

		// append filename ext?
		if(jQuery.inArray(file.substring(file.lastIndexOf('.')+1).toLowerCase(),formatOpts.extensions) < 0) {
			file += '.'+formatOpts.extensions[0];
		}
		
		// Normalize file
		file = file.replace($('#vboxPane').data('vboxConfig').DSEP+$('#vboxPane').data('vboxConfig').DSEP,$('#vboxPane').data('vboxConfig').DSEP);
		
		/* Check to see if file exists */
		var fileExists = false;
		var l = new vboxLoader('fileExists');
		l.add('fileExists',function(d){
			fileExists = d.responseData;
		},{'file':file});
		l.onLoad = function() { 
			if(fileExists) {
				vboxAlert(trans("<p>The hard disk storage unit at location <b>%1</b> already " +
				           "exists. You cannot create a new virtual hard disk that uses this " +
				           "location because it can be already used by another virtual hard " +
				           "disk.</p>" +
				           "<p>Please specify a different location.</p>",'UIMessageCenter').replace('%1',file));
				return;
			}
			var fsplit = $(self.form).find('[name=newHardDiskSplit]').prop('checked');
			var size = vboxConvertMbytes($(self.form).find('[name=wizardNewHDSizeValue]').val());
			var type = ($(self.form).find('[name=newHardDiskType]').eq(1).prop('checked') ? 'fixed' : 'dynamic');
			var nl = new vboxLoader('mediumCreateBaseStorage');
			nl.add('mediumCreateBaseStorage',function(d){
				if(d.responseData.progress) {
					vboxProgress({'progress':d.responseData.progress,'persist':d.persist},function(ret) {
						var ml = new vboxLoader();
						ml.add('vboxGetMedia',function(dat){$('#vboxPane').data('vboxMedia',dat.responseData);});
						ml.onLoad = function() {
							var med = vboxMedia.getMediumByLocation(file);
							if(med) {
								vboxMedia.updateRecent(med);
								self.completed.resolve(med.id);									
							} else {
								self.completed.reject();
							}
						};
						ml.run();
					},'progress_media_create_90px.png',trans('Create a virtual hard disk now','UIWizardNewVM'),
						vboxBasename(file),true);
				} else {
					self.completed.reject();
				}
			},{'file':file,'type':type,'size':size,'format':format,'split':fsplit});
			nl.run();

			$(self.dialog).empty().remove();
		};
		l.run();
		
	};
}

/**
 * Run the Copy Virtual Disk wizard
 * @param {Object} suggested - sugggested defaults such as hard disk name and path
 */
function vboxWizardCopyHDDialog(suggested) {

	// reference
	var self = this;
	
	/* Extend vboxWizard class */
	this.parentClass = vboxWizard;
	this.parentClass();

	/* Common options */
	this.name = 'wizardCopyHD';
	this.title = trans('Copy Virtual Hard Disk','UIWizardCloneVD');
	this.bg = 'images/vbox/vmw_new_harddisk_bg.png';
	this.icon = 'hd';
	this.steps = 4;
	this.suggested = suggested;
	this.context = 'UIWizardCloneVD';
	this.finishText = trans('Copy','UIWizardCloneVD');
	this.height = 450;
	
	this.data = [
	   {'fn':'vboxSystemPropertiesGet','callback':function(d){$('#vboxPane').data('vboxSystemProperties',d.responseData);}},
	   {'fn':'vboxGetMedia','callback':function(d){$('#vboxPane').data('vboxMedia',d.responseData);}}
	];
		
		
	/* Function run when wizard completes */
	this.onFinish = function() {

        var format = $(self.form)[0].elements['copyHDFileType'];
        var formatOpts = {};
        for(var i = 0; i < format.length; i++) {
            if(format[i].checked) {
                formatOpts = $(format[i]).closest('tr').data('vboxFormat');
                break;
            }
        }

		var src = $(self.form).find('[name=copyHDDiskSelect]').val();
		var type = ($(self.form).find('[name=newHardDiskType]').eq(1).prop('checked') ? 'fixed' : 'dynamic');
		var format = $(self.form)[0].elements['copyHDFileType'];
		for(var i = 0; i < format.length; i++) {
			if(format[i].checked) {
				format=format[i].value;
				break;
			}
		}

		var fsplit = $(self.form).find('[name=newHardDiskSplit]').prop('checked') && vboxMedia.formatSupportsSplit(format);

		var loc = jQuery.trim($(self.form).find('[name=wizardCopyHDLocation]').val());
		if(!loc) {
			$(self.form).find('[name=wizardCopyHDLocation]').addClass('vboxRequired');
			return;
		}
		$(self.form).find('[name=wizardCopyHDLocation]').removeClass('vboxRequired');
		if(loc.search(/[\/|\\]/) < 0) {
			if($('#wizardCopyHDStep4').data('suggestedpath')) {
				loc = $('#wizardCopyHDStep4').data('suggestedpath') + loc;
			} else {
				loc = vboxDirname(vboxMedia.getMediumById(src).location) + $('#vboxPane').data('vboxConfig').DSEP + loc;
			}
		}

		// append ext?
		if(jQuery.inArray(loc.substring(loc.lastIndexOf('.')+1).toLowerCase(),formatOpts.extensions) < 0) {
			loc += '.'+formatOpts.extensions[0];
		}
		
		
		/* Check to see if file exists */
		var fileExists = false;
		var fe = new vboxLoader();
		fe.add('fileExists',function(d){
			fileExists = d.responseData;
		},{'file':loc});
		fe.onLoad = function() { 
			if(fileExists) {
				vboxAlert(trans("<p>The hard disk storage unit at location <b>%1</b> already " +
				           "exists. You cannot create a new virtual hard disk that uses this " +
				           "location because it can be already used by another virtual hard " +
				           "disk.</p>" +
				           "<p>Please specify a different location.</p>",'UIMessageCenter').replace('%1',loc));
				return;
			}
			$(self.dialog).empty().remove();
			
			var l = new vboxLoader();
			l.add('mediumCloneTo',function(d){
				if(d.responseData.progress) {
					vboxProgress({'progress':d.responseData.progress,'persist':d.persist},function(ret,mid) {
						var ml = new vboxLoader();
						ml.add('vboxGetMedia',function(dat){$('#vboxPane').data('vboxMedia',dat.responseData);});
						ml.onLoad = function() {
							med = vboxMedia.getMediumByLocation(loc);
							vboxMedia.updateRecent(med);
							self.completed.resolve(mid);
						};
						ml.run();
					},'progress_media_create_90px.png',trans('Copy Virtual Hard Disk','UIWizardCloneVD'),
						vboxBasename(vboxMedia.getMediumById(src).location) + ' > ' + vboxBasename(loc));
				} else {
					self.completed.reject();
				}
			},{'src':vboxMedia.getMediumById(src).location,'type':type,'format':format,'location':loc,'split':fsplit});
			l.run();
		};
		fe.run();

		
	};
}

/**
 * Display guest network adapters dialog
 * @param {String} vm - virtual machine uuid or name
 */
function vboxGuestNetworkAdaptersDialogInit(vm) {

	/*
	 * 	Dialog
	 */
	$('#vboxPane').append($('<div />').attr({'id':'vboxGuestNetworkDialog','style':'display: none'}));

	/*
	 * Loader
	 */
	var l = new vboxLoader();
	l.addFileToDOM('panes/guestNetAdapters.html',$('#vboxGuestNetworkDialog'));
	l.onLoad = function(){
		
		var buttons = {};
		buttons[trans('Close','UIVMLogViewer')] = function() {$('#vboxGuestNetworkDialog').trigger('close').empty().remove();};
		$('#vboxGuestNetworkDialog').dialog({'closeOnEscape':true,'width':500,'height':250,'buttons':buttons,'modal':true,'autoOpen':true,'dialogClass':'vboxDialogContent','title':'<img src="images/vbox/nw_16px.png" class="vboxDialogTitleIcon" /> ' + trans('Guest Network Adapters','VBoxGlobal')}).on("dialogbeforeclose",function(){
	    	$(this).parent().find('span:contains("'+trans('Close','UIVMLogViewer')+'")').trigger('click');
	    });
		
		// defined in pane
		vboxVMNetAdaptersInit(vm,nic);
	};
	l.run();
	
}


/**
 * Display Global Preferences dialog
 */

function vboxGlobalPrefsDialog() {
	
	// Prefs
	var panes = new Array(
		{'name':'GlobalGeneral','label':'General','icon':'machine','context':'UIGlobalSettingsGeneral'},
		{'name':'GlobalLanguage','label':'Language','icon':'site','context':'UIGlobalSettingsLanguage'},
		{'name':'GlobalNetwork','label':'Network','icon':'nw','context':'UIGlobalSettingsNetwork','tabbed':true},
		{'name':'GlobalUsers','label':'Users','icon':'register','context':'UIUsers'}
	);
	
	var data = new Array(
		{'fn':'hostOnlyInterfacesGet','callback':function(d){$('#vboxSettingsDialog').data('vboxHostOnlyInterfaces',d.responseData);}},
		{'fn':'vboxSystemPropertiesGet','callback':function(d){$('#vboxSettingsDialog').data('vboxSystemProperties',d.responseData);}},
		{'fn':'vboxNATNetworksGet','callback':function(d){$('#vboxSettingsDialog').data('vboxNATNetworks',d.responseData);}},
		{'fn':'getUsers','callback':function(d){$('#vboxSettingsDialog').data('vboxUsers',d.responseData);}}
	);	
	
	// Check for noAuth setting
	if($('#vboxPane').data('vboxConfig').noAuth || !$('#vboxPane').data('vboxSession').admin || !$('#vboxPane').data('vboxConfig').authCapabilities.canModifyUsers) {
		panes.pop();
		data.pop();
	}
	
	$.when(vboxSettingsDialog(trans('Preferences...','UIActionPool').replace(/\./g,''),
			panes,data,null,'global_settings','UISettingsDialogGlobal'))
		.done(function(){

			var l = new vboxLoader();
	
			// Language change?
			if($('#vboxSettingsDialog').data('language') && $('#vboxSettingsDialog').data('language') != __vboxLangName) {
				vboxSetCookie('vboxLanguage',$('#vboxSettingsDialog').data('language'));
				l.onLoad = function(){location.reload(true);};
			
			}

			l.add('vboxNATNetworksSave',function(){return;},{'networks':$('#vboxSettingsDialog').data('vboxNATNetworks')});
			l.add('hostOnlyInterfacesSave',function(){return;},{'networkInterfaces':$('#vboxSettingsDialog').data('vboxHostOnlyInterfaces').networkInterfaces});
			l.add('vboxSystemPropertiesSave',function(){return;},{'SystemProperties':$('#vboxSettingsDialog').data('vboxSystemProperties')});
			l.run();
			
			// Update system properties
			$('#vboxPane').data('vboxSystemProperties',$('#vboxSettingsDialog').data('vboxSystemProperties'));
		
	});
	
}



/**
 * Display a virtual machine settings dialog
 * @param {String} vm - uuid or name of virtual machine
 * @param {String} pane - optionally automatically select pane when dialog is displayed
 * @returns {Object} deferred promise
 */
function vboxVMsettingsDialog(vm,pane) {
	
	var results = $.Deferred();
	
	if(typeof(vm) == 'string')
		vm = vboxVMDataMediator.getVMData(vm);
	
	// Only show these dialogs once per change
	var reloadConfirmShowing = false;
	
	// Handler for when VM settings have changed
	/////////////////////////////////////////////
	var machineSettingsChanged = function(e, eventList) {
		
		for(var i = 0; i < eventList.length; i++) {
			
			////////////////////////////////
			//
			// Machine data changed.. 
			//
			////////////////////////////////
			switch(eventList[i].eventType) {

				case 'OnMachineStateChanged':
				
					if(!eventList[i].machineId || eventList[i].machineId != vm.id) break;
					
					// Display loading screen
					var l = new vboxLoader();
					l.showLoading();
					
					$.when(vboxVMDataMediator.getVMDataCombined(vm.id)).done(function(vmData) {
		            	// data received from deferred object
		            	$('#vboxSettingsDialog').data('vboxMachineData',vmData);
		            	$('#vboxSettingsDialog').data('vboxFullEdit', (vboxVMStates.isPoweredOff(vmData) && !vboxVMStates.isSaved(vmData)));
		            	$('#vboxSettingsDialog').trigger('dataLoaded');
		            	l.removeLoading();
		            	if(vboxVMStates.isRunning(vmData)) {
		            		vboxAlert(trans('The virtual machine that you are changing has been started. Only certain settings can be changed while a machine is running. All other changes will be lost if you close this window now.','UIMessageCenter'));
		            	}
	              	});

					break;

				// Unregistered machine
				case 'OnMachineRegistered':
					
					if(!eventList[i].machineId || eventList[i].machineId != vm.id || eventList[i].registered) break;

					$('#vboxSettingsDialog').parent().find('span:contains("'+trans('Cancel','QIMessageBox')+'")').trigger('click');
					break;
					
				case 'OnMachineDataChanged':
				case 'OnNetworkAdapterChanged':
				case 'OnVRDEServerInfoChanged':
				case 'OnCPUChanged':
				case 'OnStorageControllerChanged':
				case 'OnMediumChanged':
				case 'OnVRDEServerChanged':
				case 'OnUSBControllerChanged':
				case 'OnSharedFolderChanged':
				case 'OnCPUExecutionCapChanged':
				case 'OnStorageDeviceChanged':
				case 'OnNATRedirect':
					
					if(!eventList[i].machineId || eventList[i].machineId != vm.id) break;
					
					// already showing reload confirmation
					if(reloadConfirmShowing) break;
				
					var buttons = {};
					buttons[trans('Reload settings','UIMessageCenter')] = function() {
						
						// Display loading screen
						var l = new vboxLoader();
						l.showLoading();
						
						$(this).empty().remove();
						
						/*
						 * Data to be reloaded
						 */
						var reload = [
			              vboxAjaxRequest('vboxGetMedia',{}).done(function(d){$('#vboxPane').data('vboxMedia',d.responseData);}),
			              
			              vboxAjaxRequest('getNetworking',{}).done(function(d){$('#vboxSettingsDialog').data('vboxNetworking',d.responseData);}),
			              
			              vboxAjaxRequest('vboxRecentMediaGet',{}).done(function(d){$('#vboxPane').data('vboxRecentMedia',d.responseData);}),
			              
			              vboxAjaxRequest('consoleGetSharedFolders',{'vm':vm.id}).done(function(d){$('#vboxSettingsDialog').data('vboxTransientSharedFolders',d.responseData);}),
			              
			              $.when(vboxVMDataMediator.getVMDataCombined(vm.id)).done(function(vmData) {
			            	  
			            	  // data received from deferred object
			            	  $('#vboxSettingsDialog').data('vboxMachineData',vmData);
			            	  $('#vboxSettingsDialog').data('vboxFullEdit', (vboxVMStates.isPoweredOff(vmData) && !vboxVMStates.isSaved(vmData)));
			            	  
			              	})
			              ];
						
						// Only when all of these are done
						$.when.apply($, reload).done(function(){

							/* Change title and tell dialog that data is loaded */
							$('#vboxSettingsDialog').trigger('dataLoaded').dialog('option','title','<img src="images/vbox/vm_settings_16px.png" class="vboxDialogTitleIcon" /> ' + 
									$('<div />').text($('#vboxSettingsDialog').data('vboxMachineData').name).text() + ' - ' + trans('Settings','UISettingsDialog'));

							l.removeLoading();
							reloadConfirmShowing = false;
						});
						
						
					};
					
					reloadConfirmShowing = true;
					
					vboxConfirm(trans("<p>The machine settings were changed while you were editing them. You currently have unsaved setting changes.</p><p>Would you like to reload the changed settings or to keep your own changes?</p>",'UIMessageCenter'),
							buttons,
							trans('Keep changes', 'UIMessageCenter'), function(){
								reloadConfirmShowing = false;
							});
					
					return;
				
			}
		}
	};
	
	// Watch for changed VM settings
	$('#vboxPane').on('vboxEvents',machineSettingsChanged);
	
	$.when(vboxVMDataMediator.getVMDataCombined(vm.id)).done(function(vmData) {
		

		/*
		 * Settings dialog data
		 */
		var dataList = new Array(
			{'fn':'vboxGetMedia','callback':function(d){
			
				$('#vboxPane').data('vboxMedia',d.responseData);

				// data received from deferred object
				$('#vboxSettingsDialog').data('vboxMachineData',vmData);
				$('#vboxSettingsDialog').data('vboxFullEdit', (vboxVMStates.isPoweredOff(vmData) && !vboxVMStates.isSaved(vmData)));
			
			}},
			{'fn':'getNetworking','callback':function(d){$('#vboxSettingsDialog').data('vboxNetworking',d.responseData);}},
			{'fn':'hostGetDetails','callback':function(d){$('#vboxSettingsDialog').data('vboxHostDetails',d.responseData);}},
			{'fn':'vboxGetEnumerationMap','callback':function(d){$('#vboxSettingsDialog').data('vboxNetworkAdapterTypes',d.responseData);},'args':{'class':'NetworkAdapterType'}},
			{'fn':'vboxGetEnumerationMap','callback':function(d){$('#vboxSettingsDialog').data('vboxAudioControllerTypes',d.responseData);},'args':{'class':'AudioControllerType'}},
			{'fn':'vboxRecentMediaGet','callback':function(d){$('#vboxPane').data('vboxRecentMedia',d.responseData);}},
			{'fn':'consoleGetSharedFolders','callback':function(d){$('#vboxSettingsDialog').data('vboxTransientSharedFolders',d.responseData);},'args':{'vm':vm.id}}
		);

		/*
		 * Settings dialog panes
		 */
		var panes = new Array(
				
			{name:'General',label:'General',icon:'machine',tabbed:true,context:'UIMachineSettingsGeneral'},
			{name:'System',label:'System',icon:'chipset',tabbed:true,context:'UIMachineSettingsSystem'},
			{name:'Display',label:'Display',icon:'vrdp',tabbed:true,context:'UIMachineSettingsDisplay'},
			{name:'Storage',label:'Storage',icon:'attachment',context:'UIMachineSettingsStorage'},
			{name:'Audio',label:'Audio',icon:'sound',context:'UIMachineSettingsAudio'},
			{name:'Network',label:'Network',icon:'nw',tabbed:true,context:'UIMachineSettingsNetwork'},
			{name:'SerialPorts',label:'Serial Ports',icon:'serial_port',tabbed:true,context:'UIMachineSettingsSerial'},
			{name:'ParallelPorts',label:'Parallel Ports',icon:'parallel_port',tabbed:true,disabled:(!$('#vboxPane').data('vboxConfig').enableLPTConfig),context:'UIMachineSettingsParallel'},
			{name:'USB',label:'USB',icon:'usb',context:'UIMachineSettingsUSB'},
			{name:'SharedFolders',label:'Shared Folders',icon:'sf',context:'UIMachineSettingsSF'}

		);

		/*
		 * Check for encryption settings change
		 */
		var presaveCallback = function() {
		    
		    if(!$('#vboxSettingsDialog').data('vboxEncSettingsChanged'))
		        return true;
		    
		    var encMediaSettings = $.Deferred();
		    
		    // Validate
		    if(!vboxSettingsGeneralValidate()) {
        	      $('#vboxSettingsMenuList').children('li:eq(0)').first().click();
        	      $('#vboxSettingsPane-General').tabs('option','active', 3);
        	      encMediaSettings.reject();
        	      return encMediaSettings;
		    }
		    
		    var vm = $('#vboxSettingsDialog').data('vboxMachineData');
		    var media = vboxStorage.getAttachedBaseMedia(vm);
		    var encIds = vboxMedia.getEncryptedMediaIds(media);
		    var encMedia = vboxMedia.getEncryptedMedia(media);

		    var formCipher = $('#vboxSettingsDialog').data('vboxEncCipher');
		    var formPassword = $('#vboxSettingsDialog').data('vboxEncPw');
		    var formEncEnabled = $('#vboxSettingsDialog').data('vboxEncEnabled');
		    
		    // If encryption is not enabled, cipher needs to be blank
		    if(!formEncEnabled) {
		        formCipher = '';
		    }
		    
		    // Get encryption password(s)
            $.when(vboxMediumEncryptionPasswordsDialog(vm.name, encIds))
            
                .done(function(pwdata) {
                    
                    var runs = []
                    
                    // Each medium attached
                    for(var i = 0; i < media.length; i++) {
                        // Only hard disks
                        if(media[i].deviceType != 'HardDisk') continue;
                        
                        var id = vm.name;
                        var oldpw = "";
                        var cipher = null;
                        
                        // Check for existing encryption setting
                        for(var a = 0; a < encMedia.length; a++) {
                            if(encMedia[a].medium == media[i].id) {
                                cipher = media[i].encryptionSettings.cipher;
                                // Look in passwords for id
                                for(var b = 0; b < pwdata.length; b++) {
                                    if(pwdata[b].id == id) {
                                        oldpw = pwdata[b].password;
                                        break;
                                    }
                                }
                                break;
                            }
                        }
                        
                        runs.push({
                            medium: media[i].id,
                            cipher: cipher,
                            encId: id,
                            password: oldpw
                        });
                                                
                    }
                    // No encrypted media changes
                    if(!runs.length) {
                        encMediaSettings.resolve();
                        return;
                    }
                    
                    var l = new vboxLoader();
                    l.showLoading();
                    
                    (function doruns(encMediaRuns){
                        
                        if(!encMediaRuns.length) {
                            l.removeLoading();
                            encMediaSettings.resolve();
                            return;                            
                        }
                        
                        var run = encMediaRuns.shift();
                        
                        // If encryption is enabled, and cypher is blank / "Leave Unchanged"
                        // keep the original cipher
                        var mcipher = formCipher;
                        if(formEncEnabled && !mcipher) {
                            mcipher = run.cipher;
                        }
                        
                        var rdata = {
                            medium: run.medium,
                            id: run.encId,
                            old_password: run.password,
                            cipher: mcipher,
                            password: formPassword
                        };
                        
                        $.when(vboxAjaxRequest('mediumChangeEncryption',rdata)).done(function(d){
                            
                            if(d.responseData.progress) {
                                var icon = 'progress_media_create_90px.png';
                                var title = trans('Encryption');
                                vboxProgress({'progress':d.responseData.progress,'persist':d.persist},function(){
                                    // Loop
                                    doruns(encMediaRuns);                                    
                                },icon,title,vboxMedia.getMediumById(run.medium).name, true);
                            } else {
                                l.removeLoading();
                                encMediaSettings.reject();
                                return;
                            }
                            
                        });
                        
                    })(runs);

                })
                .fail(function() {
                    encMediaSettings.reject();
                });
  
		    return encMediaSettings.promise();
		    
		}

		$.when(vboxSettingsDialog(vmData.name + ' - ' + trans('Settings','UISettingsDialog'),panes,dataList,pane,'vm_settings','UISettingsDialogMachine', presaveCallback))
		
			// Always run this
			.always(function(){

				// No longer watch for changed VM settings
				$('#vboxPane').unbind('vboxEvents',machineSettingsChanged);

			})
		
			// Run this when "Save" is clicked
			.done(function() {
			    
				var loader = new vboxLoader();
				var sdata = $.extend($('#vboxSettingsDialog').data('vboxMachineData'),{'clientConfig':$('#vboxPane').data('vboxConfig')});
				loader.add('machineSave',function(){return;},sdata);
				loader.onLoad = function() {
					// Refresh media
					var mload = new vboxLoader();
					mload.add('vboxGetMedia',function(d){$('#vboxPane').data('vboxMedia',d.responseData);});
					mload.onLoad = function() {
						results.resolve();
					};
					mload.run();
				};
				loader.run();
		});
		
	});
	
	return results.promise();
}




/**
 * Run the "First Run" wizard
 * @param {Object} vm - VM details object
 */
function vboxWizardFirstRunDialog(vm) {
	
	// ref
	var self = this;
	
	this.parentClass = vboxWizard;
	this.parentClass();
	
	this.name = 'wizardFirstRun';
	this.title = $('<div />').text(vm.name).html();
	this.bg = 'images/vbox/vmw_first_run_bg.png';
	this.icon = vboxGuestOSTypeIcon(vm.OSTypeId);
	this.steps = 1;
	this.finishText = trans('Start','UIWizardFirstRun');
	this.context = 'UIWizardFirstRun';
	this.noAdvanced = true;
	this.args = vm;
	
	// This still resolves on cancel
	this.onCancel = function () {
		self.completed.resolve();
	};
	
	this.onFinish = function() {
		
		var med = vboxMedia.getMediumById($('#wizardFirstRunMedia').find(":selected").attr('value'));
		
		$(self.dialog).empty().remove();
		
		if(med) {
			
			var port = null;
			var device = null;
			var bus = null;
			var controller = null;
			
			for(var i = 0; i < self.args.storageControllers.length; i++) {
				for(var a = 0; a < self.args.storageControllers[i].mediumAttachments.length; a++) {
					if(self.args.storageControllers[i].mediumAttachments[a].type == "DVD" &&
							self.args.storageControllers[i].mediumAttachments[a].medium == null) {
						
						port = self.args.storageControllers[i].mediumAttachments[a].port;
						device = self.args.storageControllers[i].mediumAttachments[a].device;
						bus = self.args.storageControllers[i].bus;
						controller = self.args.storageControllers[i].name;
						
						break;
					}
				}
			}

			
			var args = {'vm':self.args.id,
				'medium':med,
				'port':port,
				'device':device,
				'bus':bus,
				'controller':controller,
				'noSave':true
			};
			
			// Ajax request to mount medium
			var mount = new vboxLoader();
			mount.add('mediumMount',function(ret){
				var l = new vboxLoader();
				l.add('vboxGetMedia',function(d){$('#vboxPane').data('vboxMedia',d.responseData);});
				l.onLoad = function(){
					self.completed.resolve();
				};
				l.run();		
			},args);
			mount.run();	

			
		} else {
			self.completed.resolve();
		}
		
	};
}


/**
 * Display a settings dialog (generic) called by dialog initializers
 * @param {String} title - title of dialog
 * @param {Array} panes - list of panes {Object} to load
 * @param {Object} data - list of data to load
 * @param {String} pane - optionally automatically select pane when dialog is shown
 * @param {String} icon - optional URL to icon for dialog
 * @param {String} langContext - language context to use for translations
 * @param {Function} presave - presave callback to run
 * @returns {Object} deferred promise
 * @see trans()
 */
function vboxSettingsDialog(title,panes,data,pane,icon,langContext,presave) {
	
	var results = $.Deferred();
	
	var d = $('<div />').attr({'id':'vboxSettingsDialog','style':'display: none;'});
	
	var f = $('<form />').attr({'name':'frmVboxSettings','style':'height: 100%'});
	
	var t = $('<table />').attr({'style':'height: 100%;','class':'vboxSettingsTable'});
	
	var tr = $('<tr />');
	
	$($('<td />').attr({'id':'vboxSettingsMenu','style': (panes.length == 1 ? 'display:none;' : '')})).append($('<ul />').attr({'id':'vboxSettingsMenuList','class':'vboxHover'})).appendTo(tr);
	
	var td = $('<td />').attr({'id':'vboxSettingsPane'}).css({'height':'100%'});
	
	// Settings table contains title and visible settings pane
	var stbl = $('<table />').css({'height':'100%','width':'100%','padding':'0px','margin':'0px','border':'0px','border-spacing':'0px'});
	
	// Title
	var d1 = $('<div />').attr({'id':'vboxSettingsTitle'}).html('Padding').css({'display':(panes.length == 1 ? 'none' : '')});
	$(stbl).append($('<tr />').append($('<td />').css({'height':'1%','padding':'0px','margin':'0px','border':'0px'}).append(d1)));
	
	
	// Settings pane
	var d1 = $('<div />').attr({'id':'vboxSettingsList'}).css({'width':'100%'});
	
	$(stbl).append($('<tr />').append($('<td />').css({'padding':'0px','margin':'0px','border':'0px'}).append(d1)));
	
	
	$(td).append(stbl).appendTo(tr);
	
	$(d).append($(f).append($(t).append(tr))).appendTo('#vboxPane');
	
	/* Load panes and data */
	var loader = new vboxLoader();
	
	/* Load Data */
	for(var i = 0; i < data.length; i++) {
		loader.add(data[i].fn,data[i].callback,(data[i].args ? data[i].args : undefined));
	}

	/* Load settings panes */
	for(var i = 0; i < panes.length; i++) {
		
		if(panes[i].disabled) continue;
				
		// Menu item
		$('<li />').html('<div><img src="images/vbox/'+panes[i].icon+'_16px.png" /></div> <div>'+trans(panes[i].label,langContext)+'</div>').data(panes[i]).click(function(){
			
			$('#vboxSettingsTitle').html(trans($(this).data('label'),langContext));
			
			$(this).addClass('vboxListItemSelected').siblings().addClass('vboxListItem').removeClass('vboxListItemSelected');
			
			// jquery apply this css to everything with class .settingsPa..
			$('#vboxSettingsDialog .vboxSettingsPaneSection').css({'display':'none'});
			
			// Show selected pane
			$('#vboxSettingsPane-' + $(this).data('name')).css({'display':''}).children().first().trigger('show');
			
		}).on("mouseenter",function(){$(this).addClass('vboxHover');}).on("mouseleave",function(){$(this).removeClass('vboxHover');}).appendTo($('#vboxSettingsMenuList'));
		
		
		// Settings pane
		$('#vboxSettingsList').append($('<div />').attr({'id':'vboxSettingsPane-'+panes[i].name,'style':'display: none;','class':'vboxSettingsPaneSection ui-corner-all ' + (panes[i].tabbed ? 'vboxTabbed' : 'vboxNonTabbed')}));
		
		loader.addFileToDOM('panes/settings'+panes[i].name+'.html',$('#vboxSettingsPane-'+panes[i].name));
		
	}
	
	loader.onLoad = function(){
		
		
		/* Init UI Items */
		for(var i = 0; i < panes.length; i++) {
			vboxInitDisplay($('#vboxSettingsPane-'+panes[i].name),panes[i].context);
			if(panes[i].tabbed) $('#vboxSettingsPane-'+panes[i].name).tabs();
		}
		
		/* Tell dialog that data is loaded */
		$('#vboxSettingsDialog').trigger('dataLoaded');

		var buttons = { };
		buttons[trans('OK','QIMessageBox')] = function() {
			
		    $(this).trigger('save');

		    // Does some settings pane need to do some presave
		    // work? (ask questions, run wizard, some other asynch task)
		    var promise = true;
		    if(presave) {
		        promise = presave();
		    }
		    var dlg = this;
		    $.when(promise).done(function() {
		        results.resolve(true);
		        $(dlg).trigger('close').empty().remove();
		        $(document).trigger('click');                
            });
		};
		buttons[trans('Cancel','QIMessageBox')] = function() {
			results.reject();
			$(this).trigger('close').empty().remove();
			$(document).trigger('click');
		};

		// Init with "nothing has changed yet"
		$('#vboxSettingsDialog').data('formDataChanged', false);
		
		// Show dialog
	    $('#vboxSettingsDialog').dialog({'closeOnEscape':true,'width':(panes.length > 1 ? 900 : 600),'height':(panes.length > 1 ? 500 : 450),'buttons':buttons,'modal':true,'autoOpen':true,'dialogClass':'vboxSettingsDialog vboxDialogContent','title':(icon ? '<img src="images/vbox/'+icon+'_16px.png" class="vboxDialogTitleIcon" /> ' : '') + title}).on("dialogbeforeclose",function(){
	    	$(this).parent().find('span:contains("'+trans('Cancel','QIMessageBox')+'")').trigger('click');
	    });

	    // Resize pane
	    $('#vboxSettingsList').height($('#vboxSettingsList').parent().innerHeight()-8).css({'overflow':'auto','padding':'0px','margin-top':'8px','border':'0px','border-spacing':'0px'});
	    
	    // Resizing dialog, resizes this too
	    $('#vboxSettingsDialog').on('dialogresizestop',function(){
	    	var h = $('#vboxSettingsList').css({'display':'none'}).parent().innerHeight();
	    	$('#vboxSettingsList').height(h-8).css({'display':''});	    	
	    });
	    
	    /* Select first or passed menu item */
	    var i = 0;
	    var offset = 0;
	    var tab = undefined;
	    if(typeof pane == "string") {
	    	var section = pane.split(':');
	    	if(section[1]) tab = section[1];
	    	for(i = 0; i < panes.length; i++) {
	    		if(panes[i].disabled) offset++;
	    		if(panes[i].name == section[0]) break;
	    	}
	    }
	    i-=offset;
	    if(i >= panes.length) i = 0;
	    $('#vboxSettingsMenuList').children('li:eq('+i+')').first().click().each(function(){
	    	if(tab !== undefined) {
	    		// Check for out of scope tab
	    		tab = Math.min(($('#vboxSettingsPane-'+$(this).data('name')).children('ul').first().children().length-1), parseInt(tab));
	    		$('#vboxSettingsPane-'+$(this).data('name')).tabs('option','active', tab);
	    	}
	    	
	    });
	    
	    /* Only 1 pane? */
	    if(panes.length == 1) {
	    	$('#vboxSettingsDialog table.vboxSettingsTable').css('width','100%');
	    	$('#vboxSettingsDialog').dialog('option','title',(icon ? '<img src="images/vbox/'+icon+'_16px.png" class="vboxDialogTitleIcon" /> ' : '') + trans(panes[0].label,langContext));
	    }
	    
		
	};
	
	loader.run();
	
	return results.promise();

}
