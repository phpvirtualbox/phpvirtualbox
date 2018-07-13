<!-- 

	General Global Settings / Preferences
	Copyright (C) 2010-2015 Ian Moore (imoore76 at yahoo dot com)
	
	$Id: settingsGlobalGeneral.html 595 2015-04-17 09:50:36Z imoore76 $

 -->
<table style='width: 100%' class='vboxVertical'>
	<tr style='vertical-align: middle'>
		<th><span class='translate'>Default Machine Folder:</span></th>
		<td>
			<table class="vboxInvisible" style='width: 100%'>
			<tr style='vertical-align: top'>
				<td style="width: auto; white-space: nowrap;" class="vboxFileFolderInput">
					<input type='text' class='vboxText' name='vboxSettingsDefaultMachineFolder' />
					<input type="button" class="vboxImgButton" style="background-image: url(images/vbox/select_file_16px.png)"
						onClick="vboxSettingsBrowseMachineFolder(this)" />
				</td>
			</tr>
			</table>		
		</td>
	</tr>
	
	<tr><td colspan='2'><hr style='width: 100%' class='vboxSeparatorLine'/></td></tr>
	
	<tr style='vertical-align: middle'>
		<th><span class='translate'>VRDP Authentication Library:</span></th>
		<td>
			<table class="vboxInvisible" style='width: 100%'>
			<tr style='vertical-align: top'>
				<td style="width: auto; white-space: nowrap;" class="vboxFileFolderInput">
					<input type='text' class='vboxText' name='vboxSettingsVRDEAuthLibrary' />
					<input type="button" class="vboxImgButton" style="background-image: url(images/vbox/select_file_16px.png)"
						onClick="vboxSettingsBrowseVRDPAuthLibrary(this)" />
				</td>
			</tr>
			</table>				
		</td>
	</tr>

	<tr style='vertical-align: middle' id='vboxAutostartConfigPropsGeneral'>
		<th><span class='translate'>Auto-start DB Path:</span></th>
		<td>
			<input type='text' class='vboxText' name='vboxAutostartConfigDBPath' />
		</td>
	</tr>
	
</table>
<script type='text/javascript'>

/* Set Defaults */

document.frmVboxSettings.vboxSettingsDefaultMachineFolder.value = $('#vboxSettingsDialog').data('vboxSystemProperties').defaultMachineFolder;
document.frmVboxSettings.vboxSettingsVRDEAuthLibrary.value = $('#vboxSettingsDialog').data('vboxSystemProperties').VRDEAuthLibrary;

// Autostart config path
if($('#vboxPane').data('vboxConfig').vboxAutostartConfig) {
	
	document.frmVboxSettings.vboxAutostartConfigDBPath.value = $('#vboxSettingsDialog').data('vboxSystemProperties').autostartDatabasePath;
	
} else {
	
	$('#vboxAutostartConfigPropsGeneral').hide();
}

/* Browsers */
function vboxSettingsBrowseMachineFolder(btn) {
	var def = $(btn).siblings('input').first();
	vboxFileBrowser($(def).val(),function(f){
		if(f) $(def).val(f);
	},true,trans('Default Machine Folder:','UIGlobalSettingsGeneral').replace(':',''));
}

function vboxSettingsBrowseVRDPAuthLibrary(btn) {
	var def = $(btn).siblings('input').first();
	vboxFileBrowser($(def).val(),function(f){
		if(f) $(def).val(f);
	},false,trans('VRDP Authentication Library:','UIGlobalSettingsGeneral').replace(':',''));
}

/* 
 * 
 * Update Data onSave() 
 * 
 */
$('#vboxSettingsDialog').on('save',function(){

	$('#vboxSettingsDialog').data('vboxSystemProperties').defaultMachineFolder = document.frmVboxSettings.vboxSettingsDefaultMachineFolder.value;
	$('#vboxSettingsDialog').data('vboxSystemProperties').VRDEAuthLibrary = document.frmVboxSettings.vboxSettingsVRDEAuthLibrary.value;
	
	// Autostart config path
	if($('#vboxPane').data('vboxConfig').vboxAutostartConfig) {
		$('#vboxSettingsDialog').data('vboxSystemProperties').autostartDatabasePath = document.frmVboxSettings.vboxAutostartConfigDBPath.value;
	}

});
</script>