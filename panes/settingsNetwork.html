<!--

	VM Network Settings
	Copyright (C) 2010-2015 Ian Moore (imoore76 at yahoo dot com)
	
	$Id: settingsNetwork.html 597 2015-04-20 11:41:28Z imoore76 $

-->
<div id='vboxSettingsTabNetAdapter' title='Adapter' style='display: none'>
<table class='vboxVertical'>
	<tr>
		<td colspan='2'><label><input name='vboxSettingsNetEnabled' class='vboxCheckbox vboxEnablerCheckbox' type='checkbox' /> <span class='translate'>Enable Network Adapter</span></label></td>
	</tr>
	<tr>
		<th style='min-width: 120px'><span class='translate'>Attached to:</span></th>
		<td style='width: 100%' class='vboxEnablerTrigger'>
			<select name='vboxSettingsNetAttachedTo' onchange='vboxSettingsUpdateNetworkOptions(this);' style='width: 100%'>
				<option value='Null' class='translate'>Not attached</option>
				<option value='NAT' class='translate'>NAT</option>
				<option value='NATNetwork' class='translate'>NAT Network</option>
				<option value='Bridged' class='translate'>Bridged Adapter</option>
				<option value='Internal' class='translate'>Internal Network</option>
				<option value='HostOnly' class='translate'>Host-only Adapter</option>
				<option value='Generic' class='translate'>Generic Driver</option>			
				<option value='VDE' class='translate'>VDE Adapter</option>
			</select>
        </td>
	</tr>
	<tr>
		<th class='vboxSettingsNetAdapterNamedLabel'><span class='translate'>Name:</span></th>
		<td>
             <select name='vboxSettingsNetName' class='vboxSettingsNetAdapterNamed' style='width: 100%'>
                <option value=''></option>
                
             </select>
          </td>
	</tr>
	
	<!-- Advanced NAT Settings -->
	<tr class='vboxSettingsAdvancedNat' style='display: none'>
		<th><span class='translate'>NAT Alias Mode:</span></th>
		<td>
			<label><input type='checkbox' class='vboxCheckbox' class='vboxEnablerListen' name='vboxSettingsNetAliasModeProxyOnly' /> <span class='translate vboxEnablerListen'>Proxy Only</span></label><br />
			<label><input type='checkbox' class='vboxCheckbox' class='vboxEnablerListen' name='vboxSettingsNetAliasModeSamePorts' /> <span class='translate vboxEnablerListen'>Same Ports</span></label><br />
		</td>
	</tr>
	<tr class='vboxSettingsAdvancedNat' style='display: none'>
		<th><span class='translate'>Advanced NAT Options</span> :</th>
		<td>
			<label><input type='checkbox' class='vboxCheckbox' class='vboxEnablerListen' name='vboxSettingsNetPassDNSDomain' /> <span class='translate vboxEnablerListen'>Pass DNS Domain</span></label><br />
			<label><input type='checkbox' class='vboxCheckbox' class='vboxEnablerListen' name='vboxSettingsNetDNSProxy' /> <span class='translate vboxEnablerListen'>DNS Proxy</span></label><br />
			<label><input type='checkbox' class='vboxCheckbox' class='vboxEnablerListen' name='vboxSettingsNetUseHostResolver' /> <span class='translate vboxEnablerListen'>Use Host Resolver</span></label><br />
			<span class='translate vboxEnablerListen'>Bind to IP</span> <input type='text' class='vboxTextbox' class='vboxEnablerListen' name='vboxSettingsNetBindIp' size='16'/>
		</td>
	</tr>

	<tr>
		<th>
			<input class="netImgAdvanced vboxImgButton" style='background: url(images/rightArrow.png) 3px 2px no-repeat; width: 14px; height: 14px;' type="button" value="" />
			<span class='translate'>Advanced</span></th>
		<td></td>
	</tr>
	<tr class='vboxSettingsNetToggleAdvanced' style='display: none'>
		<th><span class='translate'>Adapter Type:</span></th>
		<td>
			<select name='vboxSettingsNetAdapter' style='width: 100%'>
			</select>
		</td>
	</tr>
	<tr class='vboxSettingsNetToggleAdvanced' style='display: none'>
		<th><span class='translate'>MAC Address:</span></th>
		<td style='white-space: nowrap'><input type='text' class='vboxText' style='width: 200px' name='vboxSettingsNetMAC' size='40' />
			<input class="vboxSettingsNetMacGen vboxImgButton" style='background: url(images/vbox/refresh_16px.png) 1px 1px no-repeat; width: 18px; height: 18px; vertical-align:bottom' type="button"  value="" />
		</td>
	</tr>
	<tr class='vboxSettingsNetToggleAdvanced vboxSettingsNetPromiscuousMode' style='display: none'>
		<th class='vboxSettingsNetPromiscuousMode'><span class='translate'>Promiscuous Mode:</span></th>
		<td>
			<select class='vboxSettingsNetPromiscuousMode' name='vboxSettingsNetAdapterPromiscuousMode' style='width: 100%'>
				<option value='Deny'>Deny</option>
				<option value='AllowNetwork'>Allow VMs</option>
				<option value='AllowAll'>Allow All</option>
			</select>
		</td>
	</tr>	
	<tr class='vboxSettingsNetToggleAdvanced vboxSettingsNetGenPropsRow' style='display: none'>
		<th><span class='translate vboxRunningEnabled'>Generic Properties:</span></th>
		<td style='white-space: nowrap'>
			<textarea class='vboxRunningEnabled' rows='3' cols='20' name='vboxSettingsNetGenericProps'></textarea>
		</td>
	</tr>	
	<tr class='vboxSettingsNetToggleAdvanced' style='display: none'>
		<th></th>
		<td><label><input type='checkbox' class='vboxCheckbox' class='vboxEnablerListen' name='vboxSettingsNetConnected' /> <span class='translate vboxEnablerListen'>Cable Connected</span></label></td>
	</tr>
	<tr class='vboxSettingsNetToggleAdvanced vboxSettingsNetPFButton' style='display: none'>
		<th></th>
		<td><input type='button' class='vboxButton' class='vboxEnablerListen' name='vboxSettingsNetPF' value='Port Forwarding' /></td>
	</tr>
		
</table>
</div>
<script type='text/javascript'>

/* Translations */
$(document.forms['frmVboxSettings'].vboxSettingsNetAttachedTo).find('option').html(function(i,h){return trans(h,'VBoxGlobal');});
$(document.forms['frmVboxSettings'].vboxSettingsNetAdapterPromiscuousMode).find('option').html(function(i,h){return trans(h,'VBoxGlobal');});
$('#vboxSettingsTabNetAdapter').find(".translate").html(function(i,h){return trans($('<div />').html(h).text(),'UIMachineSettingsNetwork');}).removeClass('translate');

/*
 * 
 * Setup data for networking options.
 *
 */
var vboxSettingsNetAdaptersBridged = new Array();
var vboxSettingsNetAdaptersHostOnly = new Array();
var vboxSettingsNetNetworks = new Array();

/*
 * Fill Adapter Types
 */
var nics = $('#vboxSettingsDialog').data('vboxNetworkAdapterTypes');
for(var i = 1; i < nics.length; i++) { // index 0 is 'Null' and not used
	var opt = new Option(trans(vboxNetworkAdapterType(nics[i]),'VBoxGlobal'),nics[i]);
	document.forms['frmVboxSettings'].vboxSettingsNetAdapter.options[document.forms['frmVboxSettings'].vboxSettingsNetAdapter.options.length] = opt;
}


// Shorthand
var vboxNetworking = $('#vboxSettingsDialog').data('vboxNetworking');
vboxNetworking.networkInterfaces = $('#vboxSettingsDialog').data('vboxHostDetails').networkInterfaces;

for(var i = 0; i < vboxNetworking.networkInterfaces.length; i++) {
	if(vboxNetworking.networkInterfaces[i].interfaceType == 'Bridged') {
		vboxSettingsNetAdaptersBridged[vboxSettingsNetAdaptersBridged.length] = vboxNetworking.networkInterfaces[i].name;
	} else if(vboxNetworking.networkInterfaces[i].interfaceType == 'HostOnly') {
		vboxSettingsNetAdaptersHostOnly[vboxSettingsNetAdaptersHostOnly.length] = vboxNetworking.networkInterfaces[i].name;
	} else {
		vboxAlert('Unknown interface type :' + vboxNetworking.networkInterfaces[i].interfaceType);
	}
}

// Check for sub / virtual interfaces. These will not be reported by VirtualBox
var vboxGuestNet = $('#vboxSettingsDialog').data('vboxMachineData').networkAdapters;
for(var i = 0; i < vboxGuestNet.length; i++) {
	if(!vboxGuestNet[i].bridgedInterface || vboxGuestNet[i].bridgedInterface == '') continue;
	if(jQuery.inArray(vboxGuestNet[i].bridgedInterface,vboxSettingsNetAdaptersBridged) < 0) {
		vboxSettingsNetAdaptersBridged[vboxSettingsNetAdaptersBridged.length] = vboxGuestNet[i].bridgedInterface;
	}
}


var vboxSettingsNetTemplate = document.getElementById('vboxSettingsTabNetAdapter');
var vboxSettingsNetContainer = $(vboxSettingsNetTemplate).parent();
 

/* Network advanced show / hide */
$('#vboxSettingsTabNetAdapter').find('input.netImgAdvanced').click(function(){
		
		if(!$(this).data('toggleClicked')) {
			
			$(this).data('toggleClicked', true);
			$(this).data('vboxAdvancedEnabled',true);
			$(this).closest('table').find('.vboxSettingsNetToggleAdvanced:not(.vboxForceHide)').css('display','');
			$(this).css('background-image','url(images/downArrow.png)');
			
		} else {
			
			$(this).data('toggleClicked', false);
			$(this).data('vboxAdvancedEnabled',false);
			$(this).closest('table').find('.vboxSettingsNetToggleAdvanced').css('display','none');
			$(this).css('background-image','url(images/rightArrow.png)');
			
		}
});

/* Mac address generator */
$('#vboxSettingsTabNetAdapter').find('input.vboxSettingsNetMacGen').click(function(){

	var t = $(this).siblings('input').first();
	var oval = $(t).val();
	$(t).val('...').prop('disabled',true);
	
	var l = new vboxLoader();
	l.add('vboxGenerateMacAddress',function(d){
		if(d && d.success) $(t).val(d.responseData);
		else $(t).val(oval);
		$(t).prop('disabled',false);
	});
	l.noLoadingScreen = true;
	l.run();
});


/* Network adapter tab links */
var ul = $('<ul />');
$(vboxSettingsNetContainer).append(ul);

for(var i = 0; i < parseInt($('#vboxPane').data('vboxConfig').nicMax); i++) {

	
	/* tab */
	$(ul).append($('<li />').html('<a href="#' + vboxSettingsNetTemplate.id + (i + 1) +'"><span>' + trans('Adapter %1','VBoxGlobal').replace('%1',(i + 1)) + '</span></a>'));

	/* tab content */
	var newTab = $("#vboxSettingsTabNetAdapter").clone(true);
	newTab.attr({'id':vboxSettingsNetTemplate.id + (i + 1)}).css({'display':'block'}).find('.vboxEnablerTrigger').on('enable',function(){
		$(this).children('select').first().trigger('change');
	});
	newTab.appendTo(vboxSettingsNetContainer);

	/* Form elements must be unique */
	$("#vboxSettingsTabNetAdapter" + (i + 1)).find('[name]').each(function() {
		$(this).attr('name',$(this).attr('name') + (i + 1));
	});

}


/* Remove Template */
$("#vboxSettingsTabNetAdapter").empty().remove();


/* preload network 'advanced' down arrow image */
var netDnAdvImg = new Image();
netDnAdvImg.src = 'images/downArrow.png';

/*
 * Called when network adpater 'attached to' changes
 */
function vboxSettingsUpdateNetworkOptions(sel) {

	var ptable = $(sel).closest('table');
	var th = $(ptable).find('th.vboxSettingsNetAdapterNamedLabel').first();
	var nsel = $(ptable).find('.vboxSettingsNetAdapterNamed').first();
	
	var advEnabled = ptable.find('input.netImgAdvanced').first().data('vboxAdvancedEnabled');

	// Promiscuous mode selection
	if(sel.value == 'NAT' || sel.value == 'Null' || sel.value == 'Generic') {
		$(ptable).find('tr.vboxSettingsNetPromiscuousMode').addClass('vboxForceHide').hide();
	} else {
		$(ptable).find('tr.vboxSettingsNetPromiscuousMode').removeClass('vboxForceHide');
		if(advEnabled) $(ptable).find('tr.vboxSettingsNetPromiscuousMode').show();
	}

	// Generic properties
	if(sel.value == 'Generic') {
		$(ptable).find('tr.vboxSettingsNetGenPropsRow').removeClass('vboxForceHide');
		if(advEnabled) $(ptable).find('tr.vboxSettingsNetGenPropsRow').show();
	} else {
		$(ptable).find('tr.vboxSettingsNetGenPropsRow').hide().addClass('vboxForceHide');
	}
	
	// Port forward button
	if(sel.value == 'NAT') {
		$(ptable).find('tr.vboxSettingsNetPFButton').removeClass('vboxForceHide');
		if(advEnabled) $(ptable).find('tr.vboxSettingsNetPFButton').show();
	} else {
		$(ptable).find('tr.vboxSettingsNetPFButton').addClass('vboxForceHide').hide();
	}
	
	// Name box	
	if(sel.value == 'Null' || sel.value == 'NAT') {

		$(th).addClass('vboxDisabled');
		
		$(nsel).children().remove();
		$(nsel).prop('disabled',true);
		
		if(sel.value == 'NAT' && $('#vboxPane').data('vboxConfig').enableAdvancedConfig) ptable.find('tr.vboxSettingsAdvancedNat').css('display','');
		else ptable.find('tr.vboxSettingsAdvancedNat').css('display','none');

		
	} else {

		ptable.find('tr.vboxSettingsAdvancedNat').css('display','none');
		
		$(th).removeClass('vboxDisabled');
		
		$(nsel).children().remove();
		$(nsel).prop('disabled',false);

		// Special case for certian network selects
		if(sel.value == 'Internal' || sel.value == 'VDE' || sel.value=='Generic' || sel.value=='Bridged' || sel.value=='NATNetwork') {
			var isel = $(nsel).clone(false);
			$(nsel).replaceWith(isel);
			nsel = isel;
		}

		var defaultSel = $(sel).data('vboxDefault');
		
		switch(sel.value) {
			case 'Bridged':
				src = vboxSettingsNetAdaptersBridged;
				break;
			case 'HostOnly':
				src = vboxSettingsNetAdaptersHostOnly;
				break;
			case 'Internal':
				src = $('#vboxSettingsDialog').data('vboxNetworking').networks;
				break;
			case 'Generic':
				src = $('#vboxSettingsDialog').data('vboxNetworking').genericDrivers;
				break;	
			case 'NATNetwork':
				src = $('#vboxSettingsDialog').data('vboxNetworking').natNetworks;
				break;
			case 'VDE':
				src = $('#vboxSettingsDialog').data('vboxNetworking').vdenetworks;
				break;				
			default:
				vboxAlert('Unknown network binding type: ' + sel.value);
		}
		
		for(var i = 0; i < src.length; i++) {
			var hSrc = $('<div />').text(src[i]).html();
			$(nsel).append('<option ' + (src[i] == defaultSel ? ' selected ' : '') + ' value="' + hSrc + '">' + hSrc + '</option>');
		}
	}

	// Special case for Internal, Generic, and VDE network selects
	if(sel.value == 'Internal' || sel.value == 'VDE' || sel.value == 'Generic' || sel.value == 'Bridged') {
		$(nsel).jec();
	}
	
}

/* Change settings onShow() when VM is running */
$('#vboxSettingsDialog').on('dataLoaded',function(){
	
	
	/* Net values */
	var vboxVDEFound = false; // check for VDE attachments
	for(var i = 0; i < parseInt($('#vboxPane').data('vboxConfig').nicMax); i++) {

		var a = (i + 1); 

		// attached to
		$(document.forms['frmVboxSettings'].elements['vboxSettingsNetAttachedTo'+a]).val($('#vboxSettingsDialog').data('vboxMachineData').networkAdapters[i].attachmentType).trigger('change');
		$(document.forms['frmVboxSettings'].elements['vboxSettingsNetAttachedTo'+a].options[document.forms['frmVboxSettings'].elements['vboxSettingsNetAttachedTo'+a].selectedIndex]).attr('selected','selected');
		$(document.forms['frmVboxSettings'].elements['vboxSettingsNetAttachedTo'+a]).change();
		
		// Device or network name, depending on what 'attached to' is
		var netName = '';
		switch($('#vboxSettingsDialog').data('vboxMachineData').networkAdapters[i].attachmentType) {
			case 'Bridged':
				netName = $('#vboxSettingsDialog').data('vboxMachineData').networkAdapters[i].bridgedInterface;
				break;
			case 'HostOnly':
				netName = $('#vboxSettingsDialog').data('vboxMachineData').networkAdapters[i].hostOnlyInterface;
				break;
			case 'Internal':
				netName = $('#vboxSettingsDialog').data('vboxMachineData').networkAdapters[i].internalNetwork;
				break;
			case 'Generic':
				netName = $('#vboxSettingsDialog').data('vboxMachineData').networkAdapters[i].genericDriver;
				break;
			case 'NATNetwork':
				netName = $('#vboxSettingsDialog').data('vboxMachineData').networkAdapters[i].NATNetwork;
				break;
			case 'VDE':
				netName = $('#vboxSettingsDialog').data('vboxMachineData').networkAdapters[i].VDENetwork;
				vboxVDEFound = true;
				break;			
		}

		// hold default value
		$(document.forms['frmVboxSettings'].elements['vboxSettingsNetAttachedTo'+a]).data('vboxDefault', netName);
		
		document.forms['frmVboxSettings'].elements['vboxSettingsNetName'+a].value = netName;

	    document.forms['frmVboxSettings'].elements['vboxSettingsNetAdapter'+a].value = $('#vboxSettingsDialog').data('vboxMachineData').networkAdapters[i].adapterType;
		document.forms['frmVboxSettings'].elements['vboxSettingsNetMAC'+a].value = $('#vboxSettingsDialog').data('vboxMachineData').networkAdapters[i].MACAddress;
		document.forms['frmVboxSettings'].elements['vboxSettingsNetConnected'+a].checked = ($('#vboxSettingsDialog').data('vboxMachineData').networkAdapters[i].cableConnected ? true : false);
		$(document.forms['frmVboxSettings'].elements['vboxSettingsNetAdapterPromiscuousMode'+a]).val($('#vboxSettingsDialog').data('vboxMachineData').networkAdapters[i].promiscModePolicy);

		document.forms['frmVboxSettings'].elements['vboxSettingsNetGenericProps'+a].innerHTML = $('#vboxSettingsDialog').data('vboxMachineData').networkAdapters[i].properties;
			
		// Enabled adapter
		$(document.forms['frmVboxSettings'].elements['vboxSettingsNetEnabled'+a]).prop('checked',$('#vboxSettingsDialog').data('vboxMachineData').networkAdapters[i].enabled).triggerHandler('click');;

		
		$(document.forms['frmVboxSettings'].elements['vboxSettingsNetPF'+a]).unbind('click');
		$(document.forms['frmVboxSettings'].elements['vboxSettingsNetPF'+a]).click(function(){
			
			var nicIndex = (parseInt($(this).attr('name').substr(17))-1);
			
			$.when(vboxPortForwardConfigDialog($('#vboxSettingsDialog').data('vboxMachineData').networkAdapters[nicIndex].redirects))
				.done(function(rules){
					for(var i = 0; i < rules.length; i++) {
						rules[i] = rules[i].join(',');
					}
					$('#vboxSettingsDialog').data('vboxMachineData').networkAdapters[nicIndex].redirects = rules;
			});
			
		}).val(trans('Port Forwarding','UIMachineSettingsNetwork'));
		
		// Set Nat values
		if($('#vboxPane').data('vboxConfig').enableAdvancedConfig) {
			document.forms['frmVboxSettings'].elements['vboxSettingsNetAliasModeProxyOnly'+a].checked = (($('#vboxSettingsDialog').data('vboxMachineData').networkAdapters[i].NATEngine.aliasMode & 2) ? true : false);
			document.forms['frmVboxSettings'].elements['vboxSettingsNetAliasModeSamePorts'+a].checked = (($('#vboxSettingsDialog').data('vboxMachineData').networkAdapters[i].NATEngine.aliasMode & 4) ? true : false);
			document.forms['frmVboxSettings'].elements['vboxSettingsNetPassDNSDomain'+a].checked = ($('#vboxSettingsDialog').data('vboxMachineData').networkAdapters[i].NATEngine.DNSPassDomain ? true : false);
			document.forms['frmVboxSettings'].elements['vboxSettingsNetDNSProxy'+a].checked = ($('#vboxSettingsDialog').data('vboxMachineData').networkAdapters[i].NATEngine.DNSProxy ? true : false);
			document.forms['frmVboxSettings'].elements['vboxSettingsNetUseHostResolver'+a].checked = ($('#vboxSettingsDialog').data('vboxMachineData').networkAdapters[i].NATEngine.DNSUseHostResolver ? true : false);
			$(document.forms['frmVboxSettings'].elements['vboxSettingsNetBindIp'+a]).val($('#vboxSettingsDialog').data('vboxMachineData').networkAdapters[i].NATEngine.hostIP);
		}


	}
	/* Disable VDE selection? */
	if(!vboxVDEFound && !$('#vboxPane').data('vboxConfig').enableVDE) {
		for(var i = 0; i < parseInt($('#vboxPane').data('vboxConfig').nicMax); i++) {
			$(document.forms['frmVboxSettings'].elements['vboxSettingsNetAttachedTo'+(i+1)]).children("[value='VDE']").remove();
		}
	}

	if(!$('#vboxSettingsDialog').data('vboxFullEdit')) {
		
		for(var i = 0; i < parseInt($('#vboxPane').data('vboxConfig').nicMax); i++) {
			
			var a = (i + 1);
			
			/* Disable these inputs */
			document.forms['frmVboxSettings'].elements['vboxSettingsNetEnabled'+a].disabled ='disabled';
		    document.forms['frmVboxSettings'].elements['vboxSettingsNetAdapter'+a].disabled ='disabled';
			document.forms['frmVboxSettings'].elements['vboxSettingsNetMAC'+a].disabled ='disabled';
			$(document.forms['frmVboxSettings'].elements['vboxSettingsNetMAC'+a]).siblings('input').css('display','none');
			
			/* Disable these labels */
			$(document.forms['frmVboxSettings'].elements['vboxSettingsNetEnabled'+a]).closest('tr').children().addClass('vboxDisabled');
			$(document.forms['frmVboxSettings'].elements['vboxSettingsNetAdapter'+a]).closest('tr').children().addClass('vboxDisabled');
			$(document.forms['frmVboxSettings'].elements['vboxSettingsNetMAC'+a]).closest('tr').children().addClass('vboxDisabled');
			
		}
		// Expand all advanced settings
		$('#vboxSettingsDialog').find('input.netImgAdvanced').each(function(){
			if(!$(this).data('vboxAdvancedEnabled')) $(this).trigger('click');
		});

		// Disable mac address generation
		$('#vboxSettingsDialog').find('input.vboxSettingsNetMacGen').prop('disabled',true);
		
	} else {
		
		for(var i = 0; i < parseInt($('#vboxPane').data('vboxConfig').nicMax); i++) {
			
			var a = (i + 1);
			
			/* Enable these inputs */
			document.forms['frmVboxSettings'].elements['vboxSettingsNetEnabled'+a].disabled ='';
		    document.forms['frmVboxSettings'].elements['vboxSettingsNetAdapter'+a].disabled ='';
			document.forms['frmVboxSettings'].elements['vboxSettingsNetMAC'+a].disabled ='';
			$(document.forms['frmVboxSettings'].elements['vboxSettingsNetMAC'+a]).siblings('input').css('display','');
			
			/* Enable these labels */
			$(document.forms['frmVboxSettings'].elements['vboxSettingsNetEnabled'+a]).closest('tr').children().removeClass('vboxDisabled');
			$(document.forms['frmVboxSettings'].elements['vboxSettingsNetAdapter'+a]).closest('tr').children().removeClass('vboxDisabled');
			$(document.forms['frmVboxSettings'].elements['vboxSettingsNetMAC'+a]).closest('tr').children().removeClass('vboxDisabled');
			
		}

		// Enable mac address generation
		$('#vboxSettingsDialog').find('input.vboxSettingsNetMacGen').prop('disabled',false);

	}
	
/* Change settings onSave() */
}).on('save',function(){

	/* Net */
	for(var i = 0; i < parseInt($('#vboxPane').data('vboxConfig').nicMax); i++) {

		var a = (i + 1); 

		// attached to
		$('#vboxSettingsDialog').data('vboxMachineData').networkAdapters[i].attachmentType = document.forms['frmVboxSettings'].elements['vboxSettingsNetAttachedTo'+a].value;

		// Device or network name, depending on what 'attached to' is
		switch($('#vboxSettingsDialog').data('vboxMachineData').networkAdapters[i].attachmentType) {
			case 'Bridged':
				$('#vboxSettingsDialog').data('vboxMachineData').networkAdapters[i].bridgedInterface = document.forms['frmVboxSettings'].elements['vboxSettingsNetName'+a].value;;
			case 'HostOnly':
				$('#vboxSettingsDialog').data('vboxMachineData').networkAdapters[i].hostOnlyInterface = document.forms['frmVboxSettings'].elements['vboxSettingsNetName'+a].value;;
				break;
			case 'Generic':
				$('#vboxSettingsDialog').data('vboxMachineData').networkAdapters[i].genericDriver = document.forms['frmVboxSettings'].elements['vboxSettingsNetName'+a].value;
				break;				
			case 'Internal':
				$('#vboxSettingsDialog').data('vboxMachineData').networkAdapters[i].internalNetwork = document.forms['frmVboxSettings'].elements['vboxSettingsNetName'+a].value;
				break;
			case 'NATNetwork':
				$('#vboxSettingsDialog').data('vboxMachineData').networkAdapters[i].NATNetwork = document.forms['frmVboxSettings'].elements['vboxSettingsNetName'+a].value;
				break;
			case 'VDE':
				$('#vboxSettingsDialog').data('vboxMachineData').networkAdapters[i].VDENetwork = document.forms['frmVboxSettings'].elements['vboxSettingsNetName'+a].value;
				break;				
		}
		
		// Set Nat values
		if($('#vboxPane').data('vboxConfig').enableAdvancedConfig) {
			var aliasMode = $('#vboxSettingsDialog').data('vboxMachineData').networkAdapters[i].NATEngine.aliasMode & 1;
			if(document.forms['frmVboxSettings'].elements['vboxSettingsNetAliasModeProxyOnly'+a].checked) {
				aliasMode |= 2;
			}
			if(document.forms['frmVboxSettings'].elements['vboxSettingsNetAliasModeSamePorts'+a].checked) {
				aliasMode |= 4;
			}
			$('#vboxSettingsDialog').data('vboxMachineData').networkAdapters[i].NATEngine.aliasMode = aliasMode;
			$('#vboxSettingsDialog').data('vboxMachineData').networkAdapters[i].NATEngine.DNSPassDomain = document.forms['frmVboxSettings'].elements['vboxSettingsNetPassDNSDomain'+a].checked;
			$('#vboxSettingsDialog').data('vboxMachineData').networkAdapters[i].NATEngine.DNSProxy = document.forms['frmVboxSettings'].elements['vboxSettingsNetDNSProxy'+a].checked;
			$('#vboxSettingsDialog').data('vboxMachineData').networkAdapters[i].NATEngine.DNSUseHostResolver = document.forms['frmVboxSettings'].elements['vboxSettingsNetUseHostResolver'+a].checked;
			$('#vboxSettingsDialog').data('vboxMachineData').networkAdapters[i].NATEngine.hostIP = $(document.forms['frmVboxSettings'].elements['vboxSettingsNetBindIp'+a]).val();
		}
		
		$('#vboxSettingsDialog').data('vboxMachineData').networkAdapters[i].properties = $(document.forms['frmVboxSettings'].elements['vboxSettingsNetGenericProps'+a]).val();
		$('#vboxSettingsDialog').data('vboxMachineData').networkAdapters[i].promiscModePolicy = $(document.forms['frmVboxSettings'].elements['vboxSettingsNetAdapterPromiscuousMode'+a]).val();
		$('#vboxSettingsDialog').data('vboxMachineData').networkAdapters[i].adapterType = document.forms['frmVboxSettings'].elements['vboxSettingsNetAdapter'+a].value;
		$('#vboxSettingsDialog').data('vboxMachineData').networkAdapters[i].MACAddress = document.forms['frmVboxSettings'].elements['vboxSettingsNetMAC'+a].value;
		$('#vboxSettingsDialog').data('vboxMachineData').networkAdapters[i].cableConnected = document.forms['frmVboxSettings'].elements['vboxSettingsNetConnected'+a].checked;
		$('#vboxSettingsDialog').data('vboxMachineData').networkAdapters[i].enabled = document.forms['frmVboxSettings'].elements['vboxSettingsNetEnabled'+a].checked;

	}

});

</script>


