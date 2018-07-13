<!-- 

	USB port settings
	Copyright (C) 2010-2015 Ian Moore (imoore76 at yahoo dot com)
	
	$Id: settingsUSB.html 597 2015-04-20 11:41:28Z imoore76 $

 -->
<table id='vboxSettingsUSBTable' style='width: 100%'>
	<tr>
		<td><label><input type='checkbox' class='vboxCheckbox vboxEnablerCheckbox' name='vboxSettingsUSBEnabled' /> <span class='translate'>Enable USB Controller</span></label></td>
	</tr>
	<tr>
		<td style='width: 100%; padding-left: 20px;'><label><input type='radio' class='vboxCheckbox' name='vboxSettingsUSBControllerType' value='OHCI'/> <span class='translate vboxEnablerListen'>USB 1.1 (OHCI) Controller</span></label></td>
	</tr>
	   <tr>
        <td style='width: 100%; padding-left: 20px;'><label><input type='radio' class='vboxCheckbox' name='vboxSettingsUSBControllerType' value='EHCI'/> <span class='translate vboxEnablerListen'>USB 2.0 (EHCI) Controller</span></label></td>
    </tr>
	   <tr>
        <td style='width: 100%; padding-left: 20px;'><label><input type='radio' class='vboxCheckbox' name='vboxSettingsUSBControllerType' value='XHCI'/> <span class='translate vboxEnablerListen'>USB 3.0 (xHCI) Controller</span></label></td>
    </tr>
	<tr style='vertical-align: middle' class='vboxRunningEnabled'>
		<td style='width: 100%; padding-left: 20px;'>
			<table class='vboxSettingsHeadingLine' style='width:100%;border-spacing:0;border:0px;margin:0px;padding:0px;'><tr style='vertical-align:middle' class='vboxRunningEnabled'><td style='white-space: nowrap; width: auto'><span class='translate vboxEnablerListen'>USB Device Filters</span></td><td style='width: 100%'><hr style='width: 100%;'  class='vboxSeparatorLine'/></td></tr></table>
		</td>
	</tr>
	<tr class='vboxRunningEnabled'>
		<td style='width: 100%; padding-left: 20px;'>
		<table style='width: 100%'>
			<tr class='vboxRunningEnabled'>
				<td id='vboxSettingsUSBFilters' style='width: 100%;' class='vboxBordered vboxEnablerListen'>
                    <!-- Hidden div for context menu -->
                    <div id='vboxSettingsUSBAddDeviceClick' style='display: none' />
					<ul id='vboxSettingsUSBFilterList' class='vboxList vboxHover' style='width: 100%'>
						<li class='vboxListItem'><input type='checkbox' class='vboxCheckbox' />a</li>
					</ul>
				</td>
				<td id='vboxSettingsUSBButtons' class='vboxEnablerListen'></td>
			</tr>
		</table>
		</td>
	</tr>

</table>
<script type='text/javascript'>

/*
 * USB Buttons and Toolbar
 */
 
//Translations
 $('#vboxSettingsTabPortsUSB').find(".translate").html(function(i,h){return trans($('<div />').html(h).text(),'UIMachineSettingsUSB');}).removeClass('translate');


 var sButtons = new Array(

	{
		'name' : 'usbnew',
		'label' : 'Add Empty Filter',
		'icon' : 'usb_new',
		'click' : function () {
			var list = $('#vboxSettingsUSBFilterList');
			var currUsbName = 1;
			for(; currUsbName < 99; currUsbName++) {
				if(!$(list).find('span.vboxSettingsUSBFilterTitle').filter(function(){
					return ($(this).text() == trans('New Filter %1','UIMachineSettingsUSB').replace('%1',currUsbName));
				}).length) break;
			}

			vboxSettingsAddUSBFilter({'active':1,'name':trans('New Filter %1','UIMachineSettingsUSB').replace('%1',currUsbName)});

			if(!$('#vboxSettingsUSBFilterList').find('.vboxListItemSelected').first().trigger('click').html()) {
				$('#vboxSettingsUSBFilterList').trigger('select',null);		}
			}
	},

	{
		'name' : 'usbnewdevice',
		'label' : 'Add Filter From Device',
		'icon' : 'usb_add',
		'click' : function (e) {

			// Update menu
			var menu = $("#vboxSettingsUSBAddDevice");
			
			menu.children().remove();		
			menu.append($('<li />').html('<span><img src="images/jqueryFileTree/spinner.gif" /></span>').css({'width':'100px','text-align':'center'}));
			
			var l = new vboxLoader();
			l.add('hostGetUSBDevices',function(res){
				
				var hostUSB = res.responseData;
				
				$(menu).children().remove();
				for(var i = 0; i < hostUSB.length; i++) {

					var dname = '';
					if(!hostUSB[i].product)
						dname = trans('Unknown device %1:%2','VBoxGlobal').replace('%1',hostUSB[i].vendorId).replace('%2',hostUSB[i].productId);
					else
						dname = hostUSB[i].manufacturer + ' ' + hostUSB[i].product;
					dname += ' [' + hostUSB[i].revision + ']';
					
					$(menu).append($('<li />').append($('<a />').attr({'href':'#usbDev'+i}).html(dname).data({'device':hostUSB[i]})));
				}
				
				// No devices?
				if(hostUSB.length == 0) {
					$(menu).append($('<li />').append($('<a />').attr({'href':'#usbNoop'}).html($('<div />').text(trans('<no devices available>','VBoxUSBMenu')).html()).data({'device':hostUSB[i]})));
				}
				$(menu).trigger('menuLoaded');
				
				vboxPositionToWindow(menu);
				
			},{});
			l.noLoadingScreen = true;
			l.run();

			// Trigger mouse up / down on hidden element
			
			var md = jQuery.Event("mousedown");
			var mu = jQuery.Event("mouseup");
			for(var i in e) { (md[i] ? null : md[i] = mu[i] = e[i]); }
			// Fix mouse button for MSIE
			if(jQuery.browser.msie && e.button == 0) md.button = mu.button = 1;
			
			
			$("#vboxSettingsUSBAddDeviceClick").trigger(md).trigger(mu);
		}		
	},
	
	{
		'name' : 'usbedit',
		'label' : 'Edit Filter',
		'icon' : 'usb_filter_edit',
		'enabled' : function (item) { return (item && $(item).data('filter') && $(item).data('filter').name); },
		'click' : function () {

          	var d = $('<div />').attr({'id':'vboxSettingsUSBFilterEdit','style':'display: none','class':'vboxNonTabbed vboxDialogContent'});

          	var tbl = $('<table />').attr({'style':'width: 100%','class':'vboxSettingsTable'});
          	
			var vboxSettingsUSBFilterProps = [
				['Name','name'],['Vendor ID','vendorId'],['Product ID','productId'],
				['Revision','revision'],['Manufacturer','manufacturer'],['Product','product'],
				['Serial No.','serialNumber'],['Port','port']];
			
			/* Get Defaults */
			var filter = $('#vboxSettingsUSBFilterList').find('li.vboxListItemSelected').first().data('filter');

          	for(var i = 0; i < vboxSettingsUSBFilterProps.length; i++) {
              	
          		var val = (filter[vboxSettingsUSBFilterProps[i][1]]||'');
          		$('<tr />').append($('<th />').attr({'style':'white-space: nowrap; width: auto; text-align: right;'}).html(trans(vboxSettingsUSBFilterProps[i][0]+':','UIMachineSettingsUSBFilterDetails'))).append($('<td />').attr({'style':'width: 100%'}).html('<input type="text" class="vboxText" style="width: 100%" id="vboxSettingsUSBF'+vboxSettingsUSBFilterProps[i][1]+'" value="'+$('<div />').text((filter[vboxSettingsUSBFilterProps[i][1]]||'')).html()+'"/>')).appendTo(tbl);
          	}
          	
          	// Generate select box
          	var sel = $('<select />').attr({'id':'vboxSettingsUSBFRemote'});
          	var opts = [['',trans('Any','UIMachineSettingsUSBFilterDetails')],['yes',trans('Yes','UIMachineSettingsUSBFilterDetails')],['no',trans('No','UIMachineSettingsUSBFilterDetails')]];
          	for(var i = 0; i < opts.length; i++) {
              	var o = new Option(opts[i][1],opts[i][0],((filter['remote']||'')==opts[i][0]));
              	$(sel).prop('options').add(o);
          	}
          	
          	$('<tr />').append($('<th />').attr({'style':'white-space: nowrap; width: auto; text-align: right;'}).html(trans('Remote:','UIMachineSettingsUSBFilterDetails'))).append($('<td />').attr({'style':'width: 100%'}).append(sel)).appendTo(tbl);
          	
          	$(d).append(tbl).appendTo($('#vboxPane'));
          	
			var buttons = { };
			buttons[trans('OK','QIMessageBox')] = function() {

				var item = $('#vboxSettingsUSBFilterList').find('.vboxListItemSelected').first();

				for(var i = 0; i < vboxSettingsUSBFilterProps.length; i++) {
					$(item).data('filter')[vboxSettingsUSBFilterProps[i][1]] = $('#vboxSettingsUSBF'+(vboxSettingsUSBFilterProps[i][1])).val();
				}
				$(item).data('filter').remote = ($('#vboxSettingsUSBFRemote').val()||'');
				// Change display name
				$(item).find('span.vboxSettingsUSBFilterTitle').first().text($(item).data('filter').name);
				$('#vboxSettingsUSBFilterEdit').remove();
			};
			buttons[trans('Cancel','QIMessageBox')] = function() { $('#vboxSettingsUSBFilterEdit').remove(); };

			                  			
          	$('#vboxSettingsUSBFilterEdit').dialog({'buttons':buttons,'closeOnEscape':false,'width':400,'modal':true,'autoOpen':true,'dialogClass':'vboxDialogContent vboxNonTabbed','title':'<img src="images/vbox/usb_16px.png" class="vboxDialogTitleIcon" /> '+trans('USB Filter Details','UIMachineSettingsUSBFilterDetails')});
			
		}		
	},

	{
		'name' : 'usbremove',
		'label' : 'Remove Filter',
		'icon' : 'usb_remove',
		'enabled' : function (item) { return (item && $(item).data('filter') && $(item).data('filter').name); },
		'click' : function () {
			var item = $('#vboxSettingsUSBFilterList').find('.vboxListItemSelected').first();
			// determine next target
			var target = $(item).next();
			if(!$(target).length) target = $(item).prev();
			if(!$(target).length) target = null;
			$(item).empty().remove();

			if(!$(target).trigger('click').length) {
				$('#vboxSettingsUSBFilterList').trigger('select',null);
			}
			vboxColorRows($('#vboxSettingsUSBFilterList'));
		}		
	},
	
	{
		'name' : 'usbup',
		'label' : 'Move Filter Up',
		'icon' : 'usb_moveup',
		'enabled' : function (item) {
			return (item && $(item).data('filter') && $(item).data('filter').name && $(item).attr('id') != $('#vboxSettingsUSBFilterList').children().first().attr('id'));
		},
		'click' : function () {

			var item = $('#vboxSettingsUSBFilterList').find('.vboxListItemSelected').first();

			var prev = $(item).prev();
			if(!$(prev).length) return;
			var mv = $(item).detach();
			$(prev).before(mv);

			vboxColorRows($('#vboxSettingsUSBFilterList'));
			$('#vboxSettingsUSBFilterList').find('.vboxListItemSelected').first().trigger('click');
			 
		}		
	},
	
	{
		'name' : 'usbdown',
		'label' : 'Move Filter Down',
		'icon' : 'usb_movedown',
		'enabled' : function (item) {
			return (item && $(item).data('filter') && $(item).data('filter').name && $(item).attr('id') != $('#vboxSettingsUSBFilterList').children().last().attr('id'));
		},
		'click' : function () {
			
			var item = $('#vboxSettingsUSBFilterList').find('.vboxListItemSelected').first();

			var next = $(item).next();
			if(!$(next).length) return;
			var mv = $(item).detach();
			$(next).after(mv);
			
			vboxColorRows($('#vboxSettingsUSBFilterList'));
			$('#vboxSettingsUSBFilterList').find('.vboxListItemSelected').first().trigger('click');
		}
	}
		
			
 );

var usbToolbar = new vboxToolbarSmall({buttons: sButtons,
    language_context: 'UIMachineSettingsUSB', renderTo: 'vboxSettingsUSBButtons'});

$('#vboxSettingsUSBFilterList').on('select',function(e,el){usbToolbar.update(el);});



/* Adds a USB filter to list */
function vboxSettingsAddUSBFilter(f,noColor) {
	
	var li = $('<li />').data({'filter':f}).attr({'id':'vboxSettingsUSBFilterNumber' + (Math.floor(Math.random()*1000)),'class':'vboxListItem'});
	
	if(document.forms['frmVboxSettings'].vboxSettingsUSBEnabled.checked) {
		
		li.click(function(){
			$(this).parent().children().removeClass('vboxListItemSelected');
			$(this).addClass('vboxListItemSelected');
			$('#vboxSettingsUSBFilterList').trigger('select',this);
		}).dblclick(function(e){
			e.preventDefault();
			usbToolbar.click('usbedit');
		}).hoverClass('vboxHover').disableSelection();
	}
	
	$('<input />').attr({'type':'checkbox'}).prop('checked',(f.active ? true : false)).appendTo(li);
	
	$(li).append(' <span class="vboxSettingsUSBFilterTitle">'+$('<div/>').text(f.name).html()+'</span>').appendTo($('#vboxSettingsUSBFilterList'));

	
	if(!noColor) vboxColorRows($('#vboxSettingsUSBFilterList'));
}


/* Menu for adding existing USB device */

var exUsb = new vboxMenu({id: 'vboxSettingsUSBAddDevice', menuItems: []});

/* Add attachment button menu initialization  */
$("#vboxSettingsUSBAddDeviceClick").contextMenu({
		menu: 'vboxSettingsUSBAddDevice',
		button: 0
	},
	function(action, el, pos, menuItem) {

		if(action == 'usbNoop') return;

		// usb data kept in elm
		var usb = $(menuItem).data('device');
		delete usb.port, usb.version, usb.portVersion;
		usb.name = $(menuItem).html();
		usb.active = 1;
		
		vboxSettingsAddUSBFilter(usb);
		
		$('#vboxSettingsUSBFilterList').trigger('select',$('#vboxSettingsUSBFilterList').find('.vboxListItemSelected').first());

	}
);


/*
 * USB data
 */
$('#vboxSettingsDialog').on('dataLoaded',function(){
	
	// set checkboxes for USB and EHCI
	if($('#vboxSettingsDialog').data('vboxMachineData').USBControllers.length) {
		
		var usbType = 'OHCI';
		var enabled = false;
		
		for(var i = 0; i < $('#vboxSettingsDialog').data('vboxMachineData').USBControllers.length; i++) {
			var listUSBType = $('#vboxSettingsDialog').data('vboxMachineData').USBControllers[i].type;
			if(listUSBType == 'OHCI') {
				enabled = true;
			}
			switch(listUSBType) {
			    case 'OHCI':
			        if(usbType == 'EHCI')
			            break;
			    case 'EHCI':
			        if(usbType == 'XHCI')
					   break;
			    default:
			        usbType = listUSBType;
			}
		}
		$(document.forms['frmVboxSettings'].vboxSettingsUSBEnabled).prop('checked',enabled).triggerHandler('click');
		
		$(document.forms['frmVboxSettings']).find('input[value="'+usbType+'"]').prop('checked',true);	
		
	} else {
		$(document.forms['frmVboxSettings'].vboxSettingsUSBEnabled).prop('checked',false).triggerHandler('click');
		$(document.forms['frmVboxSettings']).find('input[value="OHCI"]').prop('checked',true);
	}

	// clear list
	var list = $('#vboxSettingsUSBFilterList');
	$(list).empty().children().remove();

	// add filters
	for(var i = 0; i < $('#vboxSettingsDialog').data('vboxMachineData').USBDeviceFilters.length; i++) {
		vboxSettingsAddUSBFilter($('#vboxSettingsDialog').data('vboxMachineData').USBDeviceFilters[i],true);
	}
	vboxColorRows($('#vboxSettingsUSBFilterList'));


	if(!$('#vboxSettingsUSBFilterList').find('li.vboxListItem').first().trigger('click')) {
		$('#vboxSettingsUSBFilterList').trigger('select',null);
	}

	var p = $('#vboxSettingsUSBTable');
	if(!$('#vboxSettingsDialog').data('vboxFullEdit')) {
		$(p).find('tr:not(.vboxRunningEnabled)').find('span').addClass('disabled');
		$(p).find('tr:not(.vboxRunningEnabled)').find('input,select,textarea').prop('disabled',true);
	} else {
		$(p).find('tr:not(.vboxRunningEnabled)').find('span').removeClass('disabled');
		$(p).find('tr:not(.vboxRunningEnabled)').find('input,select,textarea').prop('disabled',false);
	}
});


/* Change settings onSave() */
$('#vboxSettingsDialog').on('save',function(){

	// get checkboxes for USB and EHCI
	var frmEnabled = document.forms['frmVboxSettings'].vboxSettingsUSBEnabled.checked;
	
	var frmType = $(document.forms['frmVboxSettings']).find('input[name="vboxSettingsUSBControllerType"]:checked').val();
	
	$('#vboxSettingsDialog').data('vboxMachineData').USBControllers = new Array();
	
    if(frmEnabled) {
        $('#vboxSettingsDialog').data('vboxMachineData').USBControllers = [{
            'name': 'OHCI',
            'type': 'OHCI'
         }];
    }
    
    if(frmType != 'OHCI') {
		$('#vboxSettingsDialog').data('vboxMachineData').USBControllers.push({
		   'name': frmType,
		   'type': frmType
		});
    }

	$('#vboxSettingsDialog').data('vboxMachineData').USBDeviceFilters = new Array();

	$('#vboxSettingsUSBFilterList').children('li').each(function(){
		$(this).data('filter').active = $(this).children('input:checkbox').first().prop('checked');
		$('#vboxSettingsDialog').data('vboxMachineData').USBDeviceFilters[$('#vboxSettingsDialog').data('vboxMachineData').USBDeviceFilters.length] = $(this).data('filter');
	});
	
});


</script>

 