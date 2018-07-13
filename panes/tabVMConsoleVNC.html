<!--

	VM Console tab
	Copyright (C) 2010-2015 Ian Moore (imoore76 at yahoo dot com)
	
	$Id: tabVMConsoleVNC.html 595 2015-04-17 09:50:36Z imoore76 $
	
 -->
<form name="vboxVNCForm" id="vboxVNCForm">
	<span class='translate'>Requested desktop size</span>:
	<select id='vboxVNCSize' name='vboxVNCSizeSelect'>
		<option value='800x600'>800x600</option>
		<option value='1024x768'>1024x768</option>
		<option value='1280x1024'>1280x1024</option>
	</select>
	<input id='vboxVNCDetachBtn' name='detach' type='button' value='Detach' onClick="vboxVNCDetach();" />
</form>
<div id='vboxVNCAppletContainer'>
</div>
<script type='text/javascript'>

//Custom resolutions
if($("#vboxPane").data('vboxConfig').consoleResolutions) {
	var res = $("#vboxPane").data('vboxConfig').consoleResolutions;
	// first one must be valid
	if(res[0].split('x').length == 2) {
		document.vboxVNCForm.vboxVNCSizeSelect.options.length = 0;
		$(document.vboxVNCForm.vboxVNCSizeSelect).children().remove();
		for(var i = 0; i < res.length; i++) {
			document.vboxVNCForm.vboxVNCSizeSelect.options[i] = new Option(res[i],res[i]);
		}
	}
	$(document.vboxVNCForm.vboxVNCSizeSelect).on('change',function(){
		var wh = $(this).val().split('x');
		var width = wh[0];
		var height = wh[1];
		
		$('#vboxVNCAppletContainer').children().first().attr({'height':height,'width':width});
		
    	vboxSetLocalDataItem('vbox'+vboxChooser.getSingleSelectedId()+'ConsoleSize',$(this).val(),true);
	});
}

// Translate
$(document.vboxVNCForm.vboxVNCDetachBtn).val(trans("Detach",'VBoxConsoleWgt'));

//Disable / enable tab on selection list changes
$('#vboxPane').on('vmSelectionListChanged', function(){

	var vm = vboxChooser.getSingleSelected();
	
	// Initially disable tab
	$('#vboxTabVMConsole').parent().trigger('disableTab', ['vboxTabVMConsole']);
	
	if(vm && vboxVMStates.isRunning(vm)) {
		
		// VM is running, get runtime data
		$.when(vboxVMDataMediator.getVMDataCombined(vm.id)).done(function(info) {
			
			if(info.VRDEServerInfo && info.VRDEServerInfo.port > 0) {				
				
				$('#vboxTabVMConsole').parent().trigger('enableTab', ['vboxTabVMConsole']);		
				
			}
			
		});
		
	}
	

// Update on console info change
}).on('vboxOnVRDEServerInfoChanged',function(e,eventData) {
	
	// Shorthand
	var vmid = eventData.machineId;
	var VRDEServerInfo = eventData.enrichmentData;
		
	var selVM = vboxChooser.getSingleSelected(); 		
	var enabled = (selVM && selVM.id == vmid && vboxVMStates.isRunning(selVM) && VRDEServerInfo && VRDEServerInfo.port > 0);
	
	if(enabled) {

		$.when(vboxVMDataMediator.getVMDataCombined(vmid)).done(function(info) {
			
			enabled = (info.VRDEServerInfo && info.VRDEServerInfo.port > 0);
		
			if(enabled) {
				
				$('#vboxTabVMConsole').parent().trigger('enableTab', ['vboxTabVMConsole']);
		
				var chost = vboxGetVRDEHost(selVM);
				chost+=':'+VRDEServerInfo.port;
				
			} else {
				$('#vboxTabVMConsole').parent().trigger('disableTab', ['vboxTabVMConsole']);
			}
		
		});
		
	} else {
		
		$('#vboxTabVMConsole').parent().trigger('disableTab', ['vboxTabVMConsole']);
	}
	
// Update tab on machine state change
}).on('vboxOnMachineStateChanged', function(e, eventData){

	var selVMId = vboxChooser.getSingleSelectedId();	    		
	var enabled = (selVMId == eventData.machineId && vboxVMStates.isRunning({'state':eventData.state}));
	
	$('#vboxTabVMConsole').parent().trigger('disableTab', ['vboxTabVMConsole']);
	
	if(enabled) {
		
		// VM is running, get runtime data
		$.when(vboxVMDataMediator.getVMRuntimeData(eventData.machineId)).done(function(vm) {
			
			if(vm.VRDEServerInfo && vm.VRDEServerInfo.port > 0) {
				
				$('#vboxTabVMConsole').parent().trigger('enableTab', ['vboxTabVMConsole']);		
				
			}
			
		});

	}

// Clean up local data storage when a machine is unregistered
}).on('vboxMachineRegistered', function(e, eventData) {

	if(!eventData.registered) {
		vboxSetLocalDataItem('vbox'+eventData.machineId+'ConsoleSize','',true);
    	vboxSetLocalDataItem('vbox'+eventData.machineId+'ConsoleConnected','',true);	
	}
});

/*
 * Populate console info values when this tab is shown
 */

$('#vboxTabVMConsole').on('show',function(){

	var vm = vboxChooser.getSingleSelected();
	
	/* Load runtime data. This will tell us if the VRDE server is actually active */
	/* And details. This will give us info about the VRDEServer configuration */
	$.when(vboxVMDataMediator.getVMRuntimeData(vm.id),vboxVMDataMediator.getVMDetails(vm.id))
		.done(function(runtimeData, detailsData) {
		
		/* Not active */
		if(!(runtimeData.VRDEServerInfo && runtimeData.VRDEServerInfo.port > 0)) {
			$('#vboxTabVMConsole').parent().trigger('disableTab',['vboxTabVMConsole']);
			return;
		}

		// Set default console size for this VM?
		var cs = vboxGetLocalDataItem('vbox'+detailsData.id+'ConsoleSize');
		if(cs) {
			$(document.vboxVNCForm.vboxVNCSizeSelect).children('[value='+cs+']').first().prop('selected',true);	
		}
		
		var wh = $(document.vboxVNCForm.vboxVNCSizeSelect).val().split('x');
		var width = wh[0];
		var height = wh[1];
		
		var chost = vboxGetVRDEHost(runtimeData);
		
		$('#vboxVNCAppletContainer').empty().html('<APPLET CODE="VncViewer.class" ARCHIVE="tightvnc/VncViewer.jar" width="'+width+'" height="'+height+'"><PARAM NAME="PORT" VALUE="'+runtimeData.VRDEServerInfo.port+'"><PARAM NAME="HOST" VALUE="'+chost+'"></APPLET>');

	});

});

function vboxVNCDetach() {

	var vmname = vboxChooser.getSingleSelected().name;
	
	var wh = $('#vboxVNCSize').val().split('x');
	var newwin = window.open('about:blank','vboxConsoleDetachedWin'+vmname.replace(/[^a-zA-Z0-9]/g,'_'),'toolbar=0,menubar=0,location=0,directories=0,status=true,resize=true,width='+(parseInt(wh[0])+20)+',height='+(parseInt(wh[1])+20)+'');

	newwin.document.open();	
	newwin.document.write('<html><head><title>'+vmname + ' - ' + trans('Console','UIVMDesktop')+'</title></head><body style="margin: 0px; border: 0px; padding: 0px; overflow: hidden;"><div style="margin: 0px; border: 0px; padding: 0px" id="vboxPane">'+$('#vboxVNCAppletContainer').html()+'</div></body></html>');
	newwin.document.close();
	newwin.trans = function(t) { return t; };
	
}   


</script>