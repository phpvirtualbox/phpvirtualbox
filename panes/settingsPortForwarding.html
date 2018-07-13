<!--
	Port Forwarding Settings
	Copyright (C) 2010-2015 Ian Moore (imoore76 at yahoo dot com)
	
	$Id: settingsPortForwarding.html 595 2015-04-17 09:50:36Z imoore76 $ 
 -->
<div id='vboxSettingsPortForwarding' style='height: 100%'>
<table class='vboxInvisible'>
<tr style='vertical-align: top'>
<td style='width: 100%; height: 100%'>
	<div id='vboxSettingsPortForwardingListDiv' class='vboxBordered' style='overflow: auto;'>
		<table class='vboxHorizontal'>
			<thead>
				<tr>
				<th class='translate'>Name</th>
				<th class='translate'>Protocol</th>
				<th class='translate'>Host IP</th>
				<th class='translate'>Host Port</th>
				<th class='translate'>Guest IP</th>
				<th class='translate'>Guest Port</th>
				</tr>
			</thead>
			<tbody id='vboxSettingsPortForwardingList' class='vboxHover'></tbody>
		</table>
	</div>
</td><td id='vboxSettingsPortForwardingToolbar'></td>
</tr>
</table>
<script type='text/javascript'>

/*
 * Translate
 */
$('#vboxSettingsPortForwarding').find('.translate').html(function(i,h){return trans(h,'UIPortForwardingModel');}).removeClass('translate');

/*
 * Init port forwarding buttons and toolbar
 */

var sButtons = new Array(
	{
		'name' : 'insportfwd',
		'label' : 'Insert new rule',
		'icon' : 'controller_add',
		'click' : function () {
			var rname = null;
			var rules = $('#vboxSettingsPortForwardingList').children('tr');
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
			vboxSettingsPortForwardingAdd(rname+',1,,,,');
		}
	},
	{
		'name' : 'delportfwd',
		'label' : 'Delete selected rule',
		'icon' : 'controller_remove',
		'click' : function () {
			$('#vboxSettingsPortForwardingList').children('tr.vboxListItemSelected').first().remove();
			$('#vboxSettingsPortForwardingList').trigger('select');
		},
		'enabled' : function(item) {return ((item && $(item).data('vboxRule')) ? true : false);}
	}
);
var pfToolbar = new vboxToolbarSmall({buttons: sButtons, language_context: 'UIMachineSettingsPortForwardingDlg'});
pfToolbar.renderTo('vboxSettingsPortForwardingToolbar');


$('#vboxSettingsPortForwardingList').on('select',function(e,el){pfToolbar.update(el);});
$('#vboxSettingsPortForwardingList').trigger('select');

/* Edit rule element */
function vboxSettingsPortForwardingEdit(td,type) {
	if($(td).children('input').length) return;
	var ex = $(td).parent().data('vboxRule')[$(td).data('vboxPane')];
	var w = $(td).width();
	$(td).html('');
	$('<input />').data('vboxPane',$(td).data('vboxPane')).attr({'class':'vboxText'}).val(ex).blur(function(){
		switch($(this).data('vboxPane')) {
			/* name */
			case 0:
				$(this).val(jQuery.trim($(this).val().replace(',','')));
				if(!$(this).val())
					$(this).val($(this).parent().parent().data('vboxRule')[0]);
				break;
			/* IPs */
			case 2:
			case 4:
				$(this).val($(this).val().replace(/[^0-9\.]/,''));
				break;
			/* ports */
			case 3:
			case 5:
				$(this).val($(this).val().replace(/[^0-9]/,''));
				if(!$(this).val() || $(this).val() < 0) $(this).val('0');
				else if($(this).val() > 65535) $(this).val('65535');
				break;
		}
		$(this).parent().parent().data('vboxRule')[$(this).data('vboxPane')] = $(this).val();
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
function vboxSettingsPortForwardingEditProto(td) {
	var ex = $(td).parent().data('vboxRule')[1];
	
	if(ex == 0) val = 1;
	else val = 0;

	$(td).parent().data('vboxRule')[1] = val;
	
	$(td).html(val == '1' ? trans('TCP','VBoxGlobal') : trans('UDP','VBoxGlobal'));
	
}
/* Add forwarding rule */
function vboxSettingsPortForwardingAdd(r) {

	var rule = r.split(',');
	var tr = $('<tr />').attr({'class':'vboxListItem'});
	
	$('<td />').data('vboxPane',0).html($('<div />').html(rule[0]).text()).click(function(){
		if($(this).parent().hasClass('vboxListItemSelected')) {
			vboxSettingsPortForwardingEdit(this,'name');
			return;
		}
		$(this).parent().addClass('vboxListItemSelected').removeClass('vboxHover').siblings().removeClass('vboxListItemSelected');
		$('#vboxSettingsPortForwardingList').trigger('select',$(this).parent());
	}).addClass('vboxHoverFirst').appendTo(tr);
	
	$('<td />').click(function(){
		if($(this).parent().hasClass('vboxListItemSelected')) {
			vboxSettingsPortForwardingEditProto(this);
			return;
		}
		$(this).parent().addClass('vboxListItemSelected').removeClass('vboxHover').siblings().removeClass('vboxListItemSelected');
		$('#vboxSettingsPortForwardingList').trigger('select',$(this).parent());
	}).addClass('vboxProto vboxHoverMid').html(trans(rule[1] == 1 ? 'TCP' : 'UDP','VBoxGlobal')).appendTo(tr);
	
	for(var i = 2; i < rule.length; i++) {
		$('<td />').data('vboxPane',i).click(function(){
			if($(this).parent().hasClass('vboxListItemSelected')) {
				vboxSettingsPortForwardingEdit(this,'port');
				return;
			}
			$(this).parent().addClass('vboxListItemSelected').removeClass('vboxHover').siblings().removeClass('vboxListItemSelected');
			$('#vboxSettingsPortForwardingList').trigger('select',$(this).parent());
		}).addClass('vboxHover' + (i == (rule.length-1) ? 'Last' : 'Mid'))
			.html($('<div />').html(rule[i]).text()).addClass((i%2 ? 'vboxPort' : 'vboxIP')).appendTo(tr);
	}
	$(tr).data({'vboxRule':rule}).hover(function(){
		if(!$(this).hasClass('vboxListItemSelected'))
			$(this).addClass('vboxHover');
	},function(){
		$(this).removeClass('vboxHover');
	}).appendTo($('#vboxSettingsPortForwardingList'));
	
}
function vboxSettingsPortForwardingInit(rules) {
	for(var r = 0; r < rules.length; r++) {
		vboxSettingsPortForwardingAdd(rules[r]);
	}
}
</script>
</div>
