<!--
	
	VM Log dialog
	Copyright (C) 2010-2015 Ian Moore (imoore76 at yahoo dot com)

	$Id: vmlogs.html 595 2015-04-17 09:50:36Z imoore76 $
-->
<table id='vboxVMLogContainer' class='vboxInvisible' style='width:100%;height:100%'>
	<tr style='vertical-align:bottom'>
		<td style='height: 1%;' id='vboxVMLogsTabsList'></td>
	</tr>
	<tr id='vboxVMLogsTabsRow' style='vertical-align:top'>
		<td id='vboxVMLogTabsContainer'></td>
	</tr>
</table>
<script type='text/javascript'>

function vboxShowLogsInit(vm) {

	$('#vboxVMLogsTabsList').empty();
	$('#vboxVMLogTabsContainer').empty();
	
	$('<div />').attr({'id':'vboxVMLogTabs','style':'margin: 0px; padding: 0px;'}).appendTo($('#vboxVMLogTabsContainer'));
	
	var logs = $('#vboxVMLogsDialog').data('logs');

	if(!logs || !logs.length) {
		$('#vboxVMLogTabs').html(trans('<p>No log files found. Press the <b>Refresh</b> button to rescan the log folder <nobr><b>%1</b></nobr>.</p>','UIVMLogViewer').replace('%1',$('#vboxVMLogsDialog').data('logpath')));
		return;
	}

	// Pattern for regexp replacement
	var preg = new RegExp('.*'+$('#vboxPane').data('vboxConfig').DSEP.replace('\\','\\\\'));

	var ul = $('<ul />').attr({'id':'vboxVMLogsUL'});
	for(var i = 0; i < logs.length; i++) {

		// Replace path with just file name
		logs[i] = logs[i].replace(preg,'');

		// Tab link
		$('<li />').html('<a href="#vboxVMLog'+i+'"><span>'+logs[i]+'</span></a>').appendTo(ul);				

		// Tab content
		$('<div />').css({'padding':'4px','margin':'0px'}).attr({'id':'vboxVMLog'+i,'class':'vboxVMLog vboxDialogContent'}).data('logIndex',i).one('show',function(){

			$(this).html('<img src="images/spinner.gif" />');
			
			$.when({'logIndex':$(this).data('logIndex')}, vboxAjaxRequest('machineGetLogFile',{'vm':vm.id,'log':$(this).data('logIndex')})).done(function(x,d){
				
				// -8 for padding set above + parent's padding
				var pHeight = $('#vboxVMLogTabs').innerHeight() - 10;
				
				var frm = $('<form />');
				$(frm).height(pHeight);
				$('<textarea />').attr({'id':'vboxLogText'+x.logIndex,'spellcheck':'false','wrap':'off','readonly':'true'}).height(pHeight).val(d.responseData).appendTo(frm);
				$('#vboxVMLog'+x.logIndex).html('').append(frm);
				$('#vboxLogText'+x.logIndex).attr('scrollTop',$('#vboxLogText'+x.logIndex).attr('scrollHeight'));
				
			});

			
			
		}).appendTo($('#vboxVMLogTabs'));
			
		
	}
	$('#vboxVMLogTabs').prepend(ul);
	
	$('#vboxVMLogTabs').tabs({'activate':function(e,i){
		$('#vboxVMLogTabs').children('div:eq('+$('#vboxVMLogTabs').tabs('option','active')+')').trigger('show');
	}});
	
	// Move tabs to table
	$('#vboxVMLogsUL').css({'border-bottom':'0px','margin-bottom':'0px','padding-bottom':'0px'}).detach().appendTo($('#vboxVMLogsTabsList').addClass($('#vboxVMLogTabs').css({'border-top':'0px','margin-top':'0px','padding-top':'0px'}).removeClass('ui-corner-all').attr('class')));
	
	// Set height
	$('#vboxVMLogTabs').css({'display':'none'});
	
	// -6 to account for padding and leave a small buffer
	$('#vboxVMLogTabs').css({'padding':'0px 2px 2px 2px','margin':'0px','display':''}).height($('#vboxVMLogTabsContainer').css({'padding':'0px','margin':'0px'}).innerHeight()-6);
	
	// Resize dialog resizes these elemtns
	$('#vboxVMLogContainer').parent().on("dialogresizestop",function(e){

		// Set height
		$('#vboxVMLogTabs').css({'display':'none'});
		
		var pHeight = $('#vboxVMLogTabsContainer').innerHeight();
		
		// -4 to account for padding
		// -12 to account for vboxVMLogTabs 2px padding and pane's 4px padding (8 + 4)
		$('#vboxVMLogTabs').css({'display':''}).height(pHeight-4).find('form').height(pHeight-12).find('textarea').height(pHeight-12);
		
		
		
	});
	
	$('#vboxVMLogTabs').children('div:eq(0)').trigger('show');
	
	
	
	
}
</script>
