/**
 * @fileOverview Deferred data loader / cacher singleton. Provides vboxDataMediator
 * @author Ian Moore (imoore76 at yahoo dot com)
 * @version $Id: datamediator.js 591 2015-04-11 22:40:47Z imoore76 $
 * @copyright Copyright (C) 2010-2015 Ian Moore (imoore76 at yahoo dot com)
 */

/**
 * vboxVMDataMediator
 * 
 * @see jQuery.deferred
 * @namespace vboxVMDataMediator
 */
var vboxVMDataMediator = {
	
	/* Promises for data */
	promises : {
		'getVMDetails':{},
		'getVMRuntimeData':{}
	},
	
	/* Holds Basic VM data */
	vmData : null,
	
	/* Holds VM details */
	vmDetailsData : {},
	
	/* Holds VM runtime data */
	vmRuntimeData : {},
		
	/* Expire cached promise / data */
	expireVMDetails: function(vmid) {
		vboxVMDataMediator.promises.getVMDetails[vmid] = null;
		vboxVMDataMediator.vmDetailsData[vmid] = null;
	},
	expireVMRuntimeData: function(vmid) {
		vboxVMDataMediator.promises.getVMRuntimeData[vmid] = null;
		vboxVMDataMediator.vmRuntimeData[vmid] = null;
	},
	expireAll: function() {
		for(var i in vboxVMDataMediator.promises) {
			if(typeof(i) != 'string') continue;
			vboxVMDataMediator.promises[i] = {};
		}
		vboxVMDataMediator.vmData = null;
		vboxVMDataMediator.vmRuntimeData = {};
		vboxVMDataMediator.vmDetailsData = {};
	},
	
	/**
	 * Get basic vm data
	 * 
	 * @param vmid {String} ID of VM
	 * @returns {Object} vm data
	 */
	getVMData: function(vmid) {
		
		// VMList must exist
		if(!vboxVMDataMediator.vmData) {
			return;
		}
		
		return vboxVMDataMediator.vmData[vmid];
		
	},
	
	/**
	 * Return list of machines, subscribe to running VM events
	 * and start the event listener
	 * 
	 * @returns {Object} promise
	 */
	getVMList: function() {
	
		// Return array from existing data
		if(vboxVMDataMediator.vmData) {
			var list = [];
			for(var i in vboxVMDataMediator.vmData) {
				if(typeof i != 'string') continue;
				if(i == 'host') continue;
				list.push(vboxVMDataMediator.vmData[i]);
			}
			return list;
		}
		
		
		var mList = $.Deferred();
		$.when(vboxAjaxRequest('vboxGetMachines')).done(function(d) {
			
			var vmData = {};
			var subscribeList = [];

			for(var i = 0; i < d.responseData.length; i++) {
				
				// Enforce VM ownership
			    if($('#vboxPane').data('vboxConfig').enforceVMOwnership && !$('#vboxPane').data('vboxSession').admin && d.responseData[i].owner != $('#vboxPane').data('vboxSession').user) {
			    	continue;
			    }

				vmData[d.responseData[i].id] = d.responseData[i];
				
				if(vboxVMStates.isRunning({'state':d.responseData[i].state}) || vboxVMStates.isPaused({'state':d.responseData[i].state}))
					subscribeList[subscribeList.length] = d.responseData[i].id;
				
			}
			
			// Start event listener
			$.when(vboxEventListener.start(subscribeList)).done(function(){
				vboxVMDataMediator.vmData = vmData;
				mList.resolve(d.responseData);		
				
			}).fail(function() {
				mList.reject();
			});
			
			
		}).fail(function() {
			mList.reject();
		});
		
		return mList.promise();
	},
	
	/**
	 * Get VM details data
	 * 
	 * @param vmid {String} ID of VM to get data for
	 * @param forceRefresh {Boolean} force refresh of VM data
	 * @returns {Object} vm data or promise
	 */
	getVMDetails: function(vmid, forceRefresh) {
		
		// Data exists
		if(vboxVMDataMediator.vmDetailsData[vmid] && !forceRefresh) {
			vboxVMDataMediator.promises.getVMDetails[vmid] = null;
			return vboxVMDataMediator.vmDetailsData[vmid];
		}
		
		// Promise does not yet exist?
		if(!vboxVMDataMediator.promises.getVMDetails[vmid]) {
			
			vboxVMDataMediator.promises.getVMDetails[vmid] = $.Deferred();

			$.when(vboxAjaxRequest('machineGetDetails',{vm:vmid})).done(function(d){
				vboxVMDataMediator.vmDetailsData[d.responseData.id] = d.responseData;
				vboxVMDataMediator.promises.getVMDetails[vmid].resolve(d.responseData);
			}).fail(function(){
				vboxVMDataMediator.promises.getVMDetails[vmid].reject();
				vboxVMDataMediator.promises.getVMDetails[vmid] = null;
			});

		}		
		return vboxVMDataMediator.promises.getVMDetails[vmid];
	},
	
	/**
	 * Get VM's runtime data
	 * 
	 * @param vmid {String} ID of VM to get data for
	 * @returns {Object} VM runtime data or promise
	 */
	getVMRuntimeData: function(vmid) {

		// Data exists
		if(vboxVMDataMediator.vmRuntimeData[vmid]) {
			vboxVMDataMediator.promises.getVMRuntimeData[vmid] = null;
			return vboxVMDataMediator.vmRuntimeData[vmid];
		}
		
		// Promise does not yet exist?
		if(!vboxVMDataMediator.promises.getVMRuntimeData[vmid]) {
			
			vboxVMDataMediator.promises.getVMRuntimeData[vmid] = $.Deferred();

			$.when(vboxAjaxRequest('machineGetRuntimeData',{vm:vmid})).done(function(d){
				vboxVMDataMediator.vmRuntimeData[d.responseData.id] = d.responseData;
				if(vboxVMDataMediator.promises.getVMRuntimeData[vmid])
					vboxVMDataMediator.promises.getVMRuntimeData[vmid].resolve(d.responseData);
			}).fail(function(){
				vboxVMDataMediator.promises.getVMRuntimeData[vmid].reject();
				vboxVMDataMediator.promises.getVMRuntimeData[vmid] = null;
			});

		}		
		return vboxVMDataMediator.promises.getVMRuntimeData[vmid];
	},
	
	/**
	 * Return all data for a VM
	 * @param vmid {String} ID of VM to get data for
	 * @returns promise
	 */
	getVMDataCombined : function(vmid) {
		
		// Special case for 'host'
		if(vmid == 'host') {
			var def = $.Deferred();
			$.when(vboxVMDataMediator.getVMDetails(vmid)).done(function(d){
				def.resolve(d);
			}).fail(function(){
				def.reject();
			});
			return def.promise();
		}
		
		if(!vboxVMDataMediator.vmData[vmid]) return;
		
		var runtime = function() { return {};};
		if(vboxVMStates.isRunning({'state':vboxVMDataMediator.vmData[vmid].state}) || vboxVMStates.isPaused({'state':vboxVMDataMediator.vmData[vmid].state})) {
			runtime = vboxVMDataMediator.getVMRuntimeData(vmid);
		}
		
		var def = $.Deferred();
		$.when(vboxVMDataMediator.getVMDetails(vmid), runtime, vboxVMDataMediator.getVMData(vmid)).done(function(d1,d2,d3){
			def.resolve($.extend(true,{},d1,d2,d3));
		}).fail(function(){
			def.reject();
		});
		return def.promise();
		
	},
	
	/**
	 * Get new VM data
	 * @param vmid {String} ID of VM to get data for
	 * @returns {Object} promise
	 */
	refreshVMData : function(vmid) {
		
		// Special case for host
		if(vmid == 'host') {
			$('#vboxPane').trigger('vboxOnMachineDataChanged', [{machineId:'host'}]);
			$('#vboxPane').trigger('vboxEvents', [[{eventType:'OnMachineDataChanged',machineId:'host'}]]);
			return;
		}
		
		if(!vboxVMDataMediator.vmData[vmid]) return;
		
		var def = $.Deferred();
		$.when(vboxAjaxRequest('vboxGetMachines',{'vm':vmid})).done(function(d) {
			vm = d.responseData[0];
			vboxVMDataMediator.vmData[vm.id] = vm;
			def.resolve();
			$('#vboxPane').trigger('vboxOnMachineDataChanged', [{machineId:vm.id,enrichmentData:vm}]);
			$('#vboxPane').trigger('vboxEvents', [[{eventType:'OnMachineDataChanged',machineId:vm.id,enrichmentData:vm}]]);
		}).fail(function(){
			def.reject();
		});
		
		return def.promise();
	}

};

/* Events to bind for vboxVMDataMediator when everything is loaded */
$(document).ready(function(){

	/*
	 * 
	 * VirtualBox events
	 * 
	 */
	
	// Raw event to data handlers
	$('#vboxPane').on('vboxOnMachineDataChanged',function(e, eventData) {
		
		vboxVMDataMediator.expireVMDetails(eventData.machineId);
		vboxVMDataMediator.expireVMRuntimeData(eventData.machineId);
		
		if(vboxVMDataMediator.vmData[eventData.machineId] && eventData.enrichmentData) {
			$.extend(true, vboxVMDataMediator.vmData[eventData.machineId], eventData.enrichmentData);
			// $.extend doesn't seem to handle this for some reason
			vboxVMDataMediator.vmData[eventData.machineId].groups = eventData.enrichmentData.groups; 
		}
	
	// Machine state change
	}).on('vboxOnMachineStateChanged', function(e, eventData) {

		// Only care about it if its in our list
		if(vboxVMDataMediator.vmData[eventData.machineId]) {
			
			vboxVMDataMediator.vmData[eventData.machineId].state = eventData.state;
			vboxVMDataMediator.vmData[eventData.machineId].lastStateChange = eventData.enrichmentData.lastStateChange;
			vboxVMDataMediator.vmData[eventData.machineId].currentStateModified = eventData.enrichmentData.currentStateModified;
			
			// If it's running, subscribe to its events
			if(vboxVMStates.isRunning({'state':eventData.state}) || vboxVMStates.isPaused({'state':eventData.state})) {
				
				// If we already have runtime data, assume we were already subscribed
				if(!vboxVMDataMediator.vmRuntimeData[eventData.machineId]) {
					
					// Tell event listener to subscribe to this machine's events
					vboxEventListener.subscribeVMEvents(eventData.machineId);
				}
				
			} else {
				vboxVMDataMediator.expireVMRuntimeData(eventData.machineId);
			}
		}
		
	// Session state change
	}).on('vboxOnSessionStateChanged', function(e, eventData) {
		
		if(vboxVMDataMediator.vmData[eventData.machineId])
			vboxVMDataMediator.vmData[eventData.machineId].sessionState = eventData.state;

	
	// Snapshot changed
	}).on('vboxOnSnapshotTaken vboxOnSnapshotDeleted vboxOnSnapshotChanged vboxOnSnapshotRestored',function(e,eventData) {
		
		if(vboxVMDataMediator.vmData[eventData.machineId]) {
			
			vboxVMDataMediator.vmData[eventData.machineId].currentSnapshotName = eventData.enrichmentData.currentSnapshotName;
			vboxVMDataMediator.vmData[eventData.machineId].currentStateModified = eventData.enrichmentData.currentStateModified;
			
			// Get media again
			$.when(vboxAjaxRequest('vboxGetMedia')).done(function(d){$('#vboxPane').data('vboxMedia',d.responseData);});
			
		}
		if(vboxVMDataMediator.vmDetailsData[eventData.machineId])
			vboxVMDataMediator.vmDetailsData[eventData.machineId].snapshotCount = eventData.enrichmentData.snapshotCount;
		
	// Expire all data for a VM when machine is unregistered
	}).on('vboxOnMachineRegistered', function(e, eventData) {
		
		if(!eventData.registered) {
			vboxVMDataMediator.expireVMDetails(eventData.machineId);
			vboxVMDataMediator.expireVMRuntimeData(eventData.machineId);
			vboxVMDataMediator.vmData[eventData.machineId] = null;
			
		} else if(eventData.enrichmentData) {
		
			// Enforce VM ownership
		    if($('#vboxPane').data('vboxConfig').enforceVMOwnership && !$('#vboxPane').data('vboxSession').admin && eventData.enrichmentData.owner != $('#vboxPane').data('vboxSession').user) {
		    	return;
		    }
		    
		    vboxVMDataMediator.vmData[eventData.enrichmentData.id] = eventData.enrichmentData;

		}

	//}).on('vboxOnCPUChanged', function(e, vmid) {
	
		/*
		case 'OnCPUChanged':
			$data['cpu'] = $eventDataObject->cpu;
			$data['add'] = $eventDataObject->add;
			$data['dedupId'] .= '-' . $data['cpu'];
			break;
		*/

	}).on('vboxOnNetworkAdapterChanged', function(e, eventData) {
		
		if(vboxVMDataMediator.vmRuntimeData[eventData.machineId]) {
			$.extend(vboxVMDataMediator.vmRuntimeData[eventData.machineId].networkAdapters[eventData.networkAdapterSlot], eventData.enrichmentData);
		}
		

	/* Storage controller of VM changed */
	//}).on('vboxOnStorageControllerChanged', function() {
		/*
        case 'OnStorageControllerChanged':
        	$data['machineId'] = $eventDataObject->machineId;
        	$data['dedupId'] .= '-'. $data['machineId'];
        	break;
        */
		
	}).on('vboxOnMediumChanged', function(e, eventData) {
		
		/* Medium attachment changed */
		if(vboxVMDataMediator.vmRuntimeData[eventData.machineId]) {
			for(var a = 0; a < vboxVMDataMediator.vmRuntimeData[eventData.machineId].storageControllers.length; a++) {
				if(vboxVMDataMediator.vmRuntimeData[eventData.machineId].storageControllers[a].name == eventData.controller) {
					for(var b = 0; b < vboxVMDataMediator.vmRuntimeData[eventData.machineId].storageControllers[a].mediumAttachments.length; b++) {
						if(vboxVMDataMediator.vmRuntimeData[eventData.machineId].storageControllers[a].mediumAttachments[b].port == eventData.port &&
								vboxVMDataMediator.vmRuntimeData[eventData.machineId].storageControllers[a].mediumAttachments[b].device == eventData.device) {
							
							vboxVMDataMediator.vmRuntimeData[eventData.machineId].storageControllers[a].mediumAttachments[b].medium = (eventData.medium ? {id:eventData.medium} : null);
							break;
						}
					}
					break;
				}
			}
		}
		
	/* Shared folders changed */
	//}).on('vboxOnSharedFolderChanged', function() {

	// VRDE runtime info
	}).on('vboxOnVRDEServerChanged', function(e, eventData) {

		if(vboxVMDataMediator.vmRuntimeData[eventData.machineId]) {
			$.extend(true,vboxVMDataMediator.vmRuntimeData[eventData.machineId].VRDEServer, eventData.enrichmentData);
		}

	
	// This only fires when it is enabled
	}).on('vboxOnVRDEServerInfoChanged', function(e, eventData) {

		if(vboxVMDataMediator.vmRuntimeData[eventData.machineId]) {
			vboxVMDataMediator.vmRuntimeData[eventData.machineId].VRDEServerInfo.port = eventData.enrichmentData.port;
			vboxVMDataMediator.vmRuntimeData[eventData.machineId].VRDEServer.enabled = eventData.enrichmentData.enabled;
		}

		
	// Execution cap
	}).on('vboxOnCPUExecutionCapChanged', function(e, eventData) {
		
		if(vboxVMDataMediator.vmRuntimeData[eventData.machineId]) {
			vboxVMDataMediator.vmRuntimeData[eventData.machineId].CPUExecutionCap = eventData.executionCap;
		}

	// Special cases for where phpvirtualbox keeps its extra data
	}).on('vboxOnExtraDataChanged', function(e, eventData) {
		
		// No vm id is a global change
		if(!eventData.machineId || !vboxVMDataMediator.vmData[eventData.machineId]) return;
		
		switch(eventData.key) {

			// Startup mode
			case 'pvbx/startupMode':
				if(vboxVMDataMediator.vmDetailsData[eventData.machineId])
					vboxVMDataMediator.vmDetailsData[eventData.machineId].startupMode = eventData.value;
				break;
			
			// Owner
			case 'phpvb/sso/owner':
				vboxVMDataMediator.vmData[eventData.machineId].owner = eventData.value;
				break;
			
			// Custom icon
			case 'phpvb/icon':
				
				vboxVMDataMediator.vmData[eventData.machineId].customIcon = eventData.value;
				
				if(vboxVMDataMediator.vmDetailsData[eventData.machineId])
					vboxVMDataMediator.vmDetailsData[eventData.machineId].customIcon = eventData.value;
				
				
				break;
			
			// First time run
			case 'GUI/FirstRun':
				if(vboxVMDataMediator.vmDetailsData[eventData.machineId])
					vboxVMDataMediator.vmDetailsData[eventData.machineId].GUI.FirstRun = eventData.value;
				break;
				
		}
		
		
	/*
	 * 
	 * phpVirtualBox events
	 * 
	 */
		
	// Expire everything when host changes
	}).on('hostChange',function(){
		vboxVMDataMediator.expireAll();
	
	});
	
});