<!--
	Parallel port settings
	Copyright (C) 2010-2015 Ian Moore (imoore76 at yahoo dot com)
	
	$Id: settingsParallelPorts.html 597 2015-04-20 11:41:28Z imoore76 $
-->
<div id='vboxSettingsTabParallelPort'>
	<table class='vboxVertical'>
		<tr>
			<td colspan='2'><label><input name='vboxSettingsPPortEnabled' class='vboxCheckbox vboxEnablerCheckbox' type='checkbox' /> <span class='translate'>Enable Parallel Port</span></label></td>
		</tr>
		<tr>
			<th style='min-width: 120px'><span class='translate'>Port Number:</span></th>
			<td class='vboxEnablerTrigger'>
				<select style='width: auto' name='vboxSettingsPPortNumber' onchange='vboxSettingsUpdatePPortOptions(this);'>
					<option value='LPT1'>LPT1</option>
					<option value='LPT2'>LPT2</option>
					<option value='LPT3'>LPT3</option>
					<option value='User-defined' class='translate'>User-defined</option>	
				</select>
				<span class='vboxEnablerListen translate'>IRQ:</span> <input type='text' name='vboxSettingsPPortIRQ' size='2' />
				<span class='vboxEnablerListen translate'>I/O Port:</span> <input type='text' name='vboxSettingsPPortIO' size='5' />
	        </td>
		</tr>
		<tr>
			<th class='vboxPPortPathLabel'><span class='translate'>Port Path:</span></th>
			<td>
				<input type='text' class='vboxText vboxPPortPathBox' style='width: 100%' name='vboxSettingsPPortPath'/>
			</td>
		</tr>
	</table>
</div>

<script type='text/javascript'>

/*
 * 
 * Setup data for parallel port options
 *
 */
if($('#vboxPane').data('vboxConfig').enableLPTConfig) {
	
	var vboxSettingsPPortTemplate = document.getElementById('vboxSettingsTabParallelPort');
	var vboxSettingsPPortContainer = $(vboxSettingsPPortTemplate).parent();
	
	/* translated select values */
	for(var i = 0; i < document.forms['frmVboxSettings'].vboxSettingsPPortNumber.options.length; i++) {
		if($(document.forms['frmVboxSettings'].vboxSettingsPPortNumber.options[i]).hasClass('translate'))
			$(document.forms['frmVboxSettings'].vboxSettingsPPortNumber.options[i]).text(trans(document.forms['frmVboxSettings'].vboxSettingsPPortNumber.options[i].text,'VBoxGlobal')).removeClass('translate');
	}
	
	//Translations
	$('#vboxSettingsTabParallelPort').find(".translate").html(function(i,h){return trans($('<div />').html(h).text(),'UIMachineSettingsParallel');}).removeClass('translate');
	
	
	
	/* Parallel Port tab links */
	var ul = $('<ul />');
	$(vboxSettingsPPortContainer).append(ul);
	
	for(var i = 0; i < parseInt($('#vboxPane').data('vboxSystemProperties').parallelPortCount); i++) {
	
		
		/* tab */
		ul.append($('<li />').html('<a href="#' + vboxSettingsPPortTemplate.id + (i + 1) +'"><span>' + trans('Port %1','UIMachineSettingsParallel').replace('%1',i + 1) + '</span></a>'));
	
		/* tab content */
		var newTab = $("#vboxSettingsTabParallelPort").clone(true);
		newTab.attr('id',vboxSettingsPPortTemplate.id + (i + 1));
		newTab.css('display','block');
	
		// Enable / disable trigger
		newTab.find('.vboxEnablerTrigger').on('enable',function(){
			$(this).children('select').trigger('change');
		});
		
		newTab.appendTo(vboxSettingsPPortContainer);
	
		/* Form elements must be unique */
		$("#vboxSettingsTabParallelPort" + (i + 1)).find('[name]').each(function() {
			$(this).attr('name',$(this).attr('name') + (i + 1));
		});
	
	}
	
	
	/* Remove Template */
	$("#vboxSettingsTabParallelPort").empty().remove();
	
	
	//Tell jQuery to set up tabs
	$(vboxSettingsPPortContainer).tabs();
	

	

}

/*
 * Called when parallel port options change
 */
function vboxSettingsUpdatePPortOptions(sel) {

	// IRQ and IO text boxes
	if(sel.value == 'User-defined') {
		$(sel).siblings('input').prop('disabled',false);
		$(sel).siblings('span').removeClass('vboxDisabled');
	} else {
		$(sel).siblings('input').prop('disabled',true);
		$(sel).siblings('span').addClass('vboxDisabled');
		for(var i = 0; i < vboxParallelPorts.ports.length; i++) {
			if(vboxParallelPorts.ports[i].name == sel.value) {
				$(sel).siblings('input').first().val(vboxParallelPorts.ports[i].irq);
				$(sel).siblings('input').last().val(vboxParallelPorts.ports[i].port);
				return;
			}
		}
	}
}

/*
 *
 * Parallel port logic
 *
 */
if($('#vboxPane').data('vboxConfig').enableLPTConfig) {
	
	$('#vboxSettingsDialog').on('dataLoaded',function(){
		
		/* Port values */
		for(var i = 0; i < parseInt($('#vboxSettingsDialog').data('vboxMachineData').parallelPorts.length); i++) {
		
			var a = (i + 1); 
			
			if(a > $('#vboxPane').data('vboxSystemProperties').parallelPortCount) continue;
		
			// Port Number
			var pNum = vboxParallelPorts.getPortName($('#vboxSettingsDialog').data('vboxMachineData').parallelPorts[i].IRQ,$('#vboxSettingsDialog').data('vboxMachineData').parallelPorts[i].IOBase);
			$(document.forms['frmVboxSettings'].elements['vboxSettingsPPortNumber'+a]).val(pNum);
			$(document.forms['frmVboxSettings'].elements['vboxSettingsPPortNumber'+a].options[document.forms['frmVboxSettings'].elements['vboxSettingsPPortNumber'+a].selectedIndex]).attr('selected','selected');
			$(document.forms['frmVboxSettings'].elements['vboxSettingsPPortNumber'+a]).change();	
		
			$(document.forms['frmVboxSettings'].elements['vboxSettingsPPortIRQ'+a]).val($('#vboxSettingsDialog').data('vboxMachineData').parallelPorts[i].IRQ);
			$(document.forms['frmVboxSettings'].elements['vboxSettingsPPortIO'+a]).val($('#vboxSettingsDialog').data('vboxMachineData').parallelPorts[i].IOBase);
		
			// Path
			$(document.forms['frmVboxSettings'].elements['vboxSettingsPPortPath'+a]).val($('#vboxSettingsDialog').data('vboxMachineData').parallelPorts[i].path);
			
			// Enabled port
			$(document.forms['frmVboxSettings'].elements['vboxSettingsPPortEnabled'+a]).prop('checked',$('#vboxSettingsDialog').data('vboxMachineData').parallelPorts[i].enabled).triggerHandler('click'); 
		
		}

		if(!$('#vboxSettingsDialog').data('vboxFullEdit')) {
			vboxSettingsPPortContainer.find('input.vboxEnablerCheckbox').triggerHandler('click');
			vboxSettingsPPortContainer.children(':not(ul)').find('span').addClass('disabled');
			vboxSettingsPPortContainer.find('input,select,textarea').prop('disabled',true);
		} else {
			vboxSettingsPPortContainer.find('span').removeClass('disabled');
			vboxSettingsPPortContainer.find('input,select,textarea').prop('disabled',false);
			vboxSettingsPPortContainer.find('input.vboxEnablerCheckbox').triggerHandler('click');
		}
	});
}


/* Change settings onSave() */
$('#vboxSettingsDialog').on('save',function(){

	if(!$('#vboxPane').data('vboxConfig').enableLPTConfig) return;
	
	for(var i = 0; i < parseInt($('#vboxPane').data('vboxSystemProperties').parallelPortCount); i++) {

		var a = (i + 1); 

		// Port IRQ and IO
		$('#vboxSettingsDialog').data('vboxMachineData').parallelPorts[i].IRQ = $(document.forms['frmVboxSettings'].elements['vboxSettingsPPortIRQ'+a]).val();
		$('#vboxSettingsDialog').data('vboxMachineData').parallelPorts[i].IOBase = $(document.forms['frmVboxSettings'].elements['vboxSettingsPPortIO'+a]).val();

		// Path
		$('#vboxSettingsDialog').data('vboxMachineData').parallelPorts[i].path = $(document.forms['frmVboxSettings'].elements['vboxSettingsPPortPath'+a]).val();
		
		// Enabled port
		$('#vboxSettingsDialog').data('vboxMachineData').parallelPorts[i].enabled = document.forms['frmVboxSettings'].elements['vboxSettingsPPortEnabled'+a].checked;


	}

});


</script>
