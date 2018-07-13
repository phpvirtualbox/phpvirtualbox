<!-- 
	Serial port settings
	Copyright (C) 2010-2015 Ian Moore (imoore76 at yahoo dot com)
	
	$Id: settingsSerialPorts.html 597 2015-04-20 11:41:28Z imoore76 $
 -->
<div id='vboxSettingsTabSerialPort' style='display: none'>
<table class='vboxVertical'>
	<tr>
		<td colspan='2'><label><input name='vboxSettingsSPortEnabled' class='vboxCheckbox vboxEnablerCheckbox' type='checkbox' /> <span class='translate'>Enable Serial Port</span></label></td>
	</tr>
	<tr>
		<th style='min-width: 120px'><span class='translate'>Port Number:</span></th>
		<td class='vboxEnablerTrigger'>
			<select style='width: auto' name='vboxSettingsPortNumber' onchange='vboxSettingsUpdateSPortOptions(this);'>
				<option value='COM1'>COM1</option>
				<option value='COM2'>COM2</option>
				<option value='COM3'>COM3</option>
				<option value='COM4'>COM4</option>
				<option value='User-defined' class='translate'>User-defined</option>	
			</select>
			<span class='vboxEnablerListen'><span class='translate'>IRQ:</span></span> <input type='text' name='vboxSettingsSPortIRQ' size='2' />
			<span class='vboxEnablerListen'><span class='translate'>I/O Port:</span></span> <input type='text' name='vboxSettingsSPortIO' size='5' />
        </td>
	</tr>
	<tr>
		<th><span class='translate'>Port Mode:</span></th>
		<td class='vboxEnablerTrigger'>
			<select style='width: auto' name='vboxSettingsPortMode' onchange='vboxSettingsUpdateSPortMode(this);'>
				<option value='Disconnected' >Disconnected</option>
				<option value='HostPipe' >HostPipe</option>
				<option value='HostDevice' >HostDevice</option>
				<option value='RawFile' >RawFile</option>
			</select>
          </td>
	</tr>
	<tr>
		<th></th>
		<td>
			<label><input type='checkbox' class='vboxCheckbox vboxSettingsSPortCreatePipe' name='vboxSettingsSPortCreatePipe' />
			<span class='translate vboxEnablerListen'>Create Pipe</span></label>
		</td>
	</tr>
	<tr>
		<th class='vboxSPortPathLabel'><span class='translate'>Port/File Path:</span></th>
		<td>
			<input type='text' class='vboxText vboxSPortPathBox' style='width: 100%' name='vboxSettingsSPortPath'/>
		</td>
	</tr>
</table>
</div>

<script type='text/javascript'>


/*
 * 
 * Setup data for serial port options
 *
 */
  
var vboxSettingsSPortTemplate = document.getElementById('vboxSettingsTabSerialPort');
var vboxSettingsSPortContainer = $(vboxSettingsSPortTemplate).parent();

/* translated select values */
for(var i = 0; i < document.forms['frmVboxSettings'].vboxSettingsPortNumber.options.length; i++) {
	if($(document.forms['frmVboxSettings'].vboxSettingsPortNumber.options[i]).hasClass('translate'))
		$(document.forms['frmVboxSettings'].vboxSettingsPortNumber.options[i]).text(trans(document.forms['frmVboxSettings'].vboxSettingsPortNumber.options[i].text,'VBoxGlobal')).removeClass('translate');
}
for(var i = 0; i < document.forms['frmVboxSettings'].vboxSettingsPortMode.options.length; i++) {
	document.forms['frmVboxSettings'].vboxSettingsPortMode.options[i].text = trans(vboxSerialMode(document.forms['frmVboxSettings'].vboxSettingsPortMode.options[i].text),'VBoxGlobal');
}

// Translations
$('#vboxSettingsTabSerialPort').find(".translate").html(function(i,h){return trans($('<div />').html(h).text(),'UIMachineSettingsSerial');}).removeClass('translate');

/* Serial Port tab links */
var ul = $('<ul />');
$(vboxSettingsSPortContainer).append(ul);

for(var i = 0; i < parseInt($('#vboxPane').data('vboxSystemProperties').serialPortCount); i++) {

	
	/* tab */
	ul.append($('<li />').html('<a href="#' + vboxSettingsSPortTemplate.id + (i + 1) +'"><span>' + trans('Port %1','UIMachineSettingsSerial').replace('%1',i + 1) + '</span></a>'));

	/* tab content */
	var newTab = $("#vboxSettingsTabSerialPort").clone(true);
	newTab.attr({'id':vboxSettingsSPortTemplate.id + (i + 1)}).css({'display':'block'}).find('.vboxEnablerTrigger').on('enable',function(){
		$(this).find('select').trigger('change');
	});
	
	newTab.appendTo(vboxSettingsSPortContainer);

	/* Form elements must be unique */
	$("#vboxSettingsTabSerialPort" + (i + 1)).find('[name]').each(function() {
		$(this).attr('name',$(this).attr('name') + (i + 1));
	});

}


/* Remove Template */
$("#vboxSettingsTabSerialPort").empty().remove();


// Tell jQuery to set up tabs
$(vboxSettingsSPortContainer).tabs();

/*
 * Called when serial port options change
 */
function vboxSettingsUpdateSPortOptions(sel) {

	// IRQ and IO text boxes
	if(sel.value == 'User-defined') {
		$(sel).siblings('input').prop('disabled',false);
		$(sel).siblings('span').removeClass('vboxDisabled');
	} else {
		$(sel).siblings('input').prop('disabled',true);
		$(sel).siblings('span').addClass('vboxDisabled');
		for(var i = 0; i < vboxSerialPorts.ports.length; i++) {
			if(vboxSerialPorts.ports[i].name == sel.value) {
				$(sel).siblings('input').first().val(vboxSerialPorts.ports[i].irq);
				$(sel).siblings('input').last().val(vboxSerialPorts.ports[i].port);
				return;
			}
		}
	}
}

/*
 * When serial port mode changes
 */
function vboxSettingsUpdateSPortMode(sel) {
	var ptable = $(sel).closest('table');
	if(sel.value == 'HostPipe') {
		ptable.find('input.vboxSettingsSPortCreatePipe').prop({'disabled':false}).siblings().removeClass('vboxDisabled');
	} else {
		ptable.find('input.vboxSettingsSPortCreatePipe').prop({'disabled':true}).siblings().addClass('vboxDisabled');
	}
	if(sel.value == 'Disconnected') {
		ptable.find('.vboxSPortPathLabel').addClass('vboxDisabled');
		ptable.find('.vboxSPortPathBox').prop('disabled',true);
	} else {
		ptable.find('.vboxSPortPathLabel').removeClass('vboxDisabled');
		ptable.find('.vboxSPortPathBox').prop('disabled',false);
	}
}


/* When data is loaded */
$('#vboxSettingsDialog').on('dataLoaded',function(){
	
	/*
	 * Serial ports
	 *
	 */
	for(var i = 0; i < parseInt($('#vboxSettingsDialog').data('vboxMachineData').serialPorts.length); i++) {

		var a = (i + 1); 
		
		if(a > $('#vboxPane').data('vboxSystemProperties').serialPortCount) continue;

		// Port Number
		var pNum = vboxSerialPorts.getPortName($('#vboxSettingsDialog').data('vboxMachineData').serialPorts[i].IRQ,$('#vboxSettingsDialog').data('vboxMachineData').serialPorts[i].IOBase);
		$(document.forms['frmVboxSettings'].elements['vboxSettingsPortNumber'+a]).val(pNum);
		$(document.forms['frmVboxSettings'].elements['vboxSettingsPortNumber'+a].options[document.forms['frmVboxSettings'].elements['vboxSettingsPortNumber'+a].selectedIndex]).attr('selected','selected');
		$(document.forms['frmVboxSettings'].elements['vboxSettingsPortNumber'+a]).change();	

		$(document.forms['frmVboxSettings'].elements['vboxSettingsSPortIRQ'+a]).val($('#vboxSettingsDialog').data('vboxMachineData').serialPorts[i].IRQ);
		$(document.forms['frmVboxSettings'].elements['vboxSettingsSPortIO'+a]).val($('#vboxSettingsDialog').data('vboxMachineData').serialPorts[i].IOBase);

		// Port Mode
		$(document.forms['frmVboxSettings'].elements['vboxSettingsPortMode'+a]).val($('#vboxSettingsDialog').data('vboxMachineData').serialPorts[i].hostMode);
		$(document.forms['frmVboxSettings'].elements['vboxSettingsPortMode'+a].options[document.forms['frmVboxSettings'].elements['vboxSettingsPortMode'+a].selectedIndex]).attr('selected','selected');
		$(document.forms['frmVboxSettings'].elements['vboxSettingsPortMode'+a]).change();

		// Create pipe 
		$(document.forms['frmVboxSettings'].elements['vboxSettingsSPortCreatePipe'+a]).prop('checked',($('#vboxSettingsDialog').data('vboxMachineData').serialPorts[i].server ? true : false)).triggerHandler('click');
		
		// Path
		$(document.forms['frmVboxSettings'].elements['vboxSettingsSPortPath'+a]).val($('#vboxSettingsDialog').data('vboxMachineData').serialPorts[i].path);

		// Enabled
		$(document.forms['frmVboxSettings'].elements['vboxSettingsSPortEnabled'+a]).prop('checked',($('#vboxSettingsDialog').data('vboxMachineData').serialPorts[i].enabled));

	}

	if(!$('#vboxSettingsDialog').data('vboxFullEdit')) {
		vboxSettingsSPortContainer.find('input.vboxEnablerCheckbox').triggerHandler('click');
		vboxSettingsSPortContainer.children(':not(ul)').find('span').addClass('disabled');
		vboxSettingsSPortContainer.find('input,select,textarea').prop('disabled',true);
	} else {
		vboxSettingsSPortContainer.find('span').removeClass('disabled');
		vboxSettingsSPortContainer.find('input,select,textarea').prop('disabled',false);
		vboxSettingsSPortContainer.find('input.vboxEnablerCheckbox').triggerHandler('click');
	}
	
});

/* Change settings onSave() */
$('#vboxSettingsDialog').on('save',function(){

	/* Net */
	for(var i = 0; i < parseInt($('#vboxPane').data('vboxSystemProperties').serialPortCount); i++) {

		var a = (i + 1); 

		// Port IRQ and IO
		$('#vboxSettingsDialog').data('vboxMachineData').serialPorts[i].IRQ = $(document.forms['frmVboxSettings'].elements['vboxSettingsSPortIRQ'+a]).val();
		$('#vboxSettingsDialog').data('vboxMachineData').serialPorts[i].IOBase = $(document.forms['frmVboxSettings'].elements['vboxSettingsSPortIO'+a]).val();

		// Port Mode
		$('#vboxSettingsDialog').data('vboxMachineData').serialPorts[i].hostMode = $(document.forms['frmVboxSettings'].elements['vboxSettingsPortMode'+a]).val(); 

		// Create pipe 
		$('#vboxSettingsDialog').data('vboxMachineData').serialPorts[i].server = document.forms['frmVboxSettings'].elements['vboxSettingsSPortCreatePipe'+a].checked;
		
		// Path
		$('#vboxSettingsDialog').data('vboxMachineData').serialPorts[i].path = $(document.forms['frmVboxSettings'].elements['vboxSettingsSPortPath'+a]).val();
		
		// Enabled port
		$('#vboxSettingsDialog').data('vboxMachineData').serialPorts[i].enabled = document.forms['frmVboxSettings'].elements['vboxSettingsSPortEnabled'+a].checked;


	}

});


</script>