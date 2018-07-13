<!--

	Audio Settings
	Copyright (C) 2010-2015 Ian Moore (imoore76 at yahoo dot com)
	
	$Id: settingsAudio.html 597 2015-04-20 11:41:28Z imoore76 $
	
-->
<table class='vboxVertical'>
	<tr>
		<td colspan='2'><label><input type='checkbox' class='vboxCheckbox vboxEnablerCheckbox' name='vboxSettingsAudioEnabled' /> <span class='translate'>Enable Audio</span></label></td>
	</tr>
	<tr>
		<th><span class='translate'>Host Audio Driver:</span></th>
          <td>
             <select name='vboxSettingsAudioDriver'>
		   	</select>
          </td>
	</tr>
	<tr>
		<th><span class='translate'>Audio Controller:</span></th>
		<td>
			<select name='vboxSettingsAudioController'>
           </select>
          </td>
	</tr>
</table>
<script type='text/javascript'>

/* Audio */

/*
 * 
 * Static Audio Drivers
 *
 */
// Not sure if mac returns 'mac' or 'macintosh' or 'apple' for OS name
// Not sure if solaris returns 'solaris' or 'sun' for OS name
// Using just the first letter should take care of this
var vboxSettingsAudioDrivers = {
		'w' : ['Null','WinMM','DirectSound'], // windows
		'l' : ['Null','OSS','ALSA','Pulse'], // linux
		'd' : ['Null','CoreAudio'], // darwin
		'm' : ['Null','CoreAudio'], // mac
		'a' : ['Null','CoreAudio'], // apple
		'o' : ['Null','CoreAudio'], // os x
		's' : ['Null','SolAudio'] // solaris / sun
};


/* Disable non-editable items when VM is running */
$('#vboxSettingsDialog').on('dataLoaded',function(){
	
	/*
	 * Load audio controller types
	 */

	 var ad = $('#vboxSettingsDialog').data('vboxAudioControllerTypes');

	// Failsafe
	if(!ad) ad = [];
	if(jQuery.inArray($('#vboxSettingsDialog').data('vboxMachineData').audioAdapter.audioController, ad) < 0)
		ad[ad.length] = $('#vboxSettingsDialog').data('vboxMachineData').audioAdapter.audioController;
	
	// clear options first
	document.forms['frmVboxSettings'].vboxSettingsAudioController.options.length = 0;
	
	for(var i = 0; i < ad.length; i++) {
		var opt = new Option(trans(vboxAudioController(ad[i]),'VBoxGlobal'),ad[i]);
		document.forms['frmVboxSettings'].vboxSettingsAudioController.options[document.forms['frmVboxSettings'].vboxSettingsAudioController.options.length] = opt;
	}


	/*
	 * Load audio driver types
	 */
	var ad = vboxSettingsAudioDrivers[$('#vboxSettingsDialog').data('vboxHostDetails').operatingSystem.toLowerCase().substring(0,1)];

	// Failsafe
	if(!ad) {
		ad = [$('#vboxPane').data('vboxSystemProperties').defaultAudioDriver];
	}
	if(jQuery.inArray($('#vboxSettingsDialog').data('vboxMachineData').audioAdapter.audioDriver, ad) < 0)
		ad[ad.length] = $('#vboxSettingsDialog').data('vboxMachineData').audioAdapter.audioDriver;

	for(var i = 0; i < ad.length; i++) {
		var opt = new Option(trans(vboxAudioDriver(ad[i]),'VBoxGlobal'),ad[i]);
		document.forms['frmVboxSettings'].vboxSettingsAudioDriver.options[document.forms['frmVboxSettings'].vboxSettingsAudioDriver.options.length] = opt;
	}

	$(document.forms['frmVboxSettings'].vboxSettingsAudioDriver).val($('#vboxSettingsDialog').data('vboxMachineData').audioAdapter.audioDriver);
	$(document.forms['frmVboxSettings'].vboxSettingsAudioController).val($('#vboxSettingsDialog').data('vboxMachineData').audioAdapter.audioController);
	

	var p = $(document.forms['frmVboxSettings'].vboxSettingsAudioController).closest('table'); 
	if(!$('#vboxSettingsDialog').data('vboxFullEdit')) {
		$(document.forms['frmVboxSettings'].vboxSettingsAudioEnabled).prop('checked',$('#vboxSettingsDialog').data('vboxMachineData').audioAdapter.enabled).triggerHandler('click');
		$(p).find('span').addClass('disabled');
		$(p).find('input,select,textarea').prop('disabled',true);
	} else {
		$(p).find('span').removeClass('disabled');
		$(p).find('input,select,textarea').prop('disabled',false);
		$(document.forms['frmVboxSettings'].vboxSettingsAudioEnabled).prop('checked',$('#vboxSettingsDialog').data('vboxMachineData').audioAdapter.enabled).triggerHandler('click');		
	}
});
	
/* Change settings onSave() */
$('#vboxSettingsDialog').on('save',function(){

	$('#vboxSettingsDialog').data('vboxMachineData').audioAdapter.audioDriver = document.forms['frmVboxSettings'].vboxSettingsAudioDriver.value;
	$('#vboxSettingsDialog').data('vboxMachineData').audioAdapter.audioController = document.forms['frmVboxSettings'].vboxSettingsAudioController.value;
	$('#vboxSettingsDialog').data('vboxMachineData').audioAdapter.enabled = document.forms['frmVboxSettings'].vboxSettingsAudioEnabled.checked;
		
});

</script>
	