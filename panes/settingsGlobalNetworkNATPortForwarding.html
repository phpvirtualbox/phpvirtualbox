<!--
	NAT Network Port Forwarding Settings
	Copyright (C) 2010-2015 Ian Moore (imoore76 at yahoo dot com)
	
	$Id: settingsGlobalNetworkNATPortForwarding.html 595 2015-04-17 09:50:36Z imoore76 $ 
 -->
<div id='vboxSettingsGlobalNetworkNatPortForwardingDialog' style='padding: 4px'>
<ul>
	<li><a href='#vboxSettingsGlobalNetworkNatPortForwardingIPv4'><span class='translate'>IPv4</span></a></li>
	<li><a href='#vboxSettingsGlobalNetworkNatPortForwardingIPv6'><span class='translate'>IPv6</span></a></li>
</ul>
<div id='vboxSettingsGlobalNetworkNatPortForwardingIPv4' class='vboxTabContent'>
	<table class='vboxInvisible'>
	<tr style='vertical-align: top'>
	<td style='width: 100%; height: 100%'>
		<div id='vboxSettingsGlobalNetworkNatPortForwardingListDivIPv4' class='vboxBordered 'style='overflow: auto; height: '>
			<table class='vboxHorizontal'>
				<thead>
					<tr>
					<th class='translate'>Name</th>
					<th class='translate' style='text-align: center'>Protocol</th>
					<th class='translate' style='text-align: center'>Host IP</th>
					<th class='translate' style='text-align: center'>Host Port</th>
					<th class='translate' style='text-align: center'>Guest IP</th>
					<th class='translate' style='text-align: center'>Guest Port</th>
					</tr>
				</thead>
				<tbody id='vboxSettingsGlobalNetworkNatPortForwardingListIPv4' class='vboxHover vboxSettingsGlobalNetworkNatPortForwardingList'></tbody>
			</table>
		</div>
	</td><td id='vboxSettingsGlobalNetworkNatPortForwardingToolbarIPv4'></td>
	</tr>
	</table>
</div>

<div id='vboxSettingsGlobalNetworkNatPortForwardingIPv6' class='vboxTabContent'>
	<table class='vboxInvisible'>
	<tr style='vertical-align: top'>
	<td style='width: 100%; height: 100%'>
		<div id='vboxSettingsGlobalNetworkNatPortForwardingListDivIPv6' class='vboxBordered' style='overflow: auto;'>
			<table class='vboxHorizontal'>
				<thead>
					<tr>
					<th class='translate'>Name</th>
					<th class='translate' style='text-align: center'>Protocol</th>
					<th class='translate' style='text-align: center'>Host IP</th>
					<th class='translate' style='text-align: center'>Host Port</th>
					<th class='translate' style='text-align: center'>Guest IP</th>
					<th class='translate' style='text-align: center'>Guest Port</th>
					</tr>
				</thead>
				<tbody id='vboxSettingsGlobalNetworkNatPortForwardingListIPv6' class='vboxHover vboxSettingsGlobalNetworkNatPortForwardingList'></tbody>
			</table>
		</div>
	</td><td id='vboxSettingsGlobalNetworkNatPortForwardingToolbarIPv6'></td>
	</tr>
	</table>
</div>

</div>

<script type='text/javascript'>

/*
 * Init port forwarding buttons and toolbar
 */

var sButtons = new Array(
	{
		'name' : 'insportfwd',
		'label' : 'Insert new rule',
		'icon' : 'controller_add',
		'click' : function (e) {
			var listId = $(e.target).closest('div.vboxTabContent').find('tbody.vboxSettingsGlobalNetworkNatPortForwardingList').first().attr('id');
			var rname = null;
			var rules = $('#'+listId).children('tr');
			for(var n = 1; n < 100; n++) {
				rname = trans('Rule %1').replace('%1',n);
				for(var i = 0; i < rules.length; i++) {
					if($(rules[i]).data('vboxRule')[0] == rname) {
						rname = null;
						break;
					}					
				}
				if(rname) break;
			}
			vboxSettingsGlobalNetworkNatPortForwardingAdd(rname+':tcp:[]:0:[]:0', listId);
		}
	},
	{
		'name' : 'delportfwd',
		'label' : 'Delete selected rule',
		'icon' : 'controller_remove',
		'click' : function (e) {
			var listId = $(e.target).closest('div.vboxTabContent').find('tbody.vboxSettingsGlobalNetworkNatPortForwardingList').first().attr('id');
			$('#'+listId).children('tr.vboxListItemSelected').first().remove();
			$('#'+listId).trigger('select');
		},
		'enabled' : function(item) {return (item ? true : false);}
	}
);

var pfToolbarIPv4 = new vboxToolbarSmall({buttons: sButtons, language_context: 'UIMachineSettingsPortForwardingDlg'});
pfToolbarIPv4.renderTo('vboxSettingsGlobalNetworkNatPortForwardingToolbarIPv4');
$('#vboxSettingsGlobalNetworkNatPortForwardingListIPv4').on('select',function(e,el){pfToolbarIPv4.update(el);});
$('#vboxSettingsGlobalNetworkNatPortForwardingListIPv4').trigger('select');


var pfToolbarIPv6 = new vboxToolbarSmall({buttons: sButtons, language_context: 'UIMachineSettingsPortForwardingDlg'});
pfToolbarIPv6.renderTo('vboxSettingsGlobalNetworkNatPortForwardingToolbarIPv6');
$('#vboxSettingsGlobalNetworkNatPortForwardingListIPv6').on('select',function(e,el){pfToolbarIPv6.update(el);});
$('#vboxSettingsGlobalNetworkNatPortForwardingListIPv6').trigger('select');


/* Edit rule element */
function vboxSettingsGlobalNetworkNatPortForwardingEdit(td,type) {
	if($(td).children('input').length) return;
	var w = $(td).width();
	var ex = $(td).parent().data('vboxRule')[$(td).data('vboxPane')];
	$(td).html('');
	$('<input />').data('vboxPane',$(td).data('vboxPane')).attr({'class':'vboxText'}).val(ex.replace('[','').replace(']','')).blur(function(){
		switch($(this).data('vboxPane')) {
			/* name */
			case 0:
				$(this).val(jQuery.trim($(this).val().replace(':','')));
				if(!$(this).val())
					$(this).val($(this).parent().parent().data('vboxRule')[0]);
				break;
			/* IPs */
			case 2:
			case 4:
				$(this).val($(this).val().replace(/[^0-9a-zA-Z\.\:]/,''));
				break;
			/* ports */
			case 3:
			case 5:
				$(this).val($(this).val().replace(/[^0-9]/,''));
				if(!$(this).val() || $(this).val() < 0) $(this).val('0');
				else if($(this).val() > 65535) $(this).val('65535');
				break;
		}
		$(this).parent().parent().data('vboxRule')[$(this).data('vboxPane')] = ($(this).parent().hasClass('vboxIP') ? ('['+ $(this).val() + ']') : $(this).val());
		var ex = $(this).val();
		$(this).replaceWith($('<div />').html(ex).text());
	}).css({'width':(w-8)+'px','padding':'0px','margin':'0px'}).keydown(function(event){
		if(event.keyCode == 13) {
			$(this).trigger('blur');
			return;
		}
		switch($(this).data('vboxPane')) {
			/* name */
			case 0:
				if(event.keyCode == 188) return false; // no commas
				break;
			/* IPs */
			case 2:
			case 4:
				return true; 
				break;
			/* ports */
			case 3:
			case 5:
				return (vboxValidateCtrl(event.keyCode) || vboxValidateNum(event.keyCode));
				break;
		}
		
	}).appendTo(td).focus();
}

/* Edit protocol */
function vboxSettingsGlobalNetworkNatPortForwardingEditProto(td) {
	var ex = $(td).parent().data('vboxRule')[1];
	
	if(ex == 'tcp') val = 'udp';
	else val = 'tcp';

	$(td).parent().data('vboxRule')[1] = val;
	
	$(td).html(val == 'tcp' ? trans('TCP','VBoxGlobal') : trans('UDP','VBoxGlobal'));
	
}
/* Add forwarding rule */
function vboxSettingsGlobalNetworkNatPortForwardingAdd(r,listId) {

	var rule = /(.*?):(.+?):(\[.*?\]):(\d+):(\[.*?\]):(\d+)/.exec(r);
	rule.shift();
	
	var tr = $('<tr />').attr({'class':'vboxListItem'});
	
	/* Rule Name */
	$('<td />').data('vboxPane',0).html($('<div />').html(rule[0]).text()).click(function(){
		if($(this).parent().hasClass('vboxListItemSelected')) {
			vboxSettingsGlobalNetworkNatPortForwardingEdit(this,'name');
			return;
		}
		
		$(this).parent().addClass('vboxListItemSelected').removeClass('vboxHover').siblings().removeClass('vboxListItemSelected');
		
		$(this).closest('tbody.vboxSettingsGlobalNetworkNatPortForwardingList').trigger('select',$(this).parent());
	
	}).addClass('vboxHoverFirst').appendTo(tr);
	
	/* Rule protocol */
	$('<td />').css({'text-align':'center'}).click(function(){
		if($(this).parent().hasClass('vboxListItemSelected')) {
			vboxSettingsGlobalNetworkNatPortForwardingEditProto(this);
			return;
		}
		
		$(this).parent().addClass('vboxListItemSelected').removeClass('vboxHover').siblings().removeClass('vboxListItemSelected');
		
		$(this).closest('tbody.vboxSettingsGlobalNetworkNatPortForwardingList').trigger('select',$(this).parent());
	
	}).addClass('vboxProto vboxHoverMid').html(trans(rule[1] == 'tcp' ? 'TCP' : 'UDP','VBoxGlobal')).appendTo(tr);
	
	for(var i = 2; i < rule.length; i++) {
		$('<td />').css({'text-align':'center'}).data('vboxPane',i).click(function(){
			if($(this).parent().hasClass('vboxListItemSelected')) {
				vboxSettingsGlobalNetworkNatPortForwardingEdit(this,'port');
				return;
			}
			
			$(this).parent().addClass('vboxListItemSelected').removeClass('vboxHover').siblings().removeClass('vboxListItemSelected');
			
			$(this).closest('tbody.vboxSettingsGlobalNetworkNatPortForwardingList').trigger('select',$(this).parent());
			
		}).addClass('vboxHover' + (i == (rule.length-1) ? 'Last' : 'Mid'))
			.html($('<div />').html(rule[i].replace('[','').replace(']','')).text()).addClass((i%2 ? 'vboxPort' : 'vboxIP')).appendTo(tr);
	}
	$(tr).data({'vboxRule':rule}).hover(function(){
		if(!$(this).hasClass('vboxListItemSelected'))
			$(this).addClass('vboxHover');
	},function(){
		$(this).removeClass('vboxHover');
	}).appendTo($('#'+listId));
	
}
function vboxSettingsGlobalNetworkNatPortForwardingInit(rules, IPv6) {
	var listId = 'vboxSettingsGlobalNetworkNatPortForwardingList' + (IPv6 ? 'IPv6' : 'IPv4');
	for(var r = 0; r < rules.length; r++) {
		vboxSettingsGlobalNetworkNatPortForwardingAdd(rules[r], listId);
	}
}
</script>
