<!-- 

	Panes for "First Run" wizard. Logic in vboxWizard()
	Copyright (C) 2010-2015 Ian Moore (imoore76 at yahoo dot com)
	
	$Id: wizardFirstRun.html 595 2015-04-17 09:50:36Z imoore76 $

 -->
<!-- Step 1 -->
<div id='wizardFirstRunStep1' title='Select start-up disk' style='display: none'>

	<span class='translate' id='wizardFirstRunStepWHD'>&lt;p&gt;Please select a virtual optical disk file or a physical optical drive containing a disk to start your new virtual machine from.&lt;/p&gt;&lt;p&gt;The disk should be suitable for starting a computer from and should contain the operating system you wish to install on the virtual machine if you want to do that now. The disk will be ejected from the virtual drive automatically next time you switch the virtual machine off, but you can also do this yourself if needed using the Devices menu.&lt;/p&gt;</span>
	<span class='translate' id='wizardFirstRunStepNoHD'>&lt;p&gt;Please select a virtual optical disk file or a physical optical drive containing a disk to start your new virtual machine from.&lt;/p&gt;&lt;p&gt;The disk should be suitable for starting a computer from. As this virtual machine has no hard drive you will not be able to install an operating system on it at the moment.&lt;/p&gt;</span>
	
	<table class='vboxInvisible'>
		<tr style='vertical-align: middle'><td>
				<select id='wizardFirstRunMedia'>
				</select>
			</td>
			<td style='width:1%' id='wizardFirstRunChoose'></td></tr>
	</table>	
</div>

<script type='text/javascript'>

$('#wizardFirstRunStep1').on('show',function(e,wiz){

	var hdFound = false;
	for(var i = 0; i < wiz.args.storageControllers.length; i++) {
		for(var a = 0; a < wiz.args.storageControllers[i].mediumAttachments.length; a++) {
			if(wiz.args.storageControllers[i].mediumAttachments[a].type == "HardDisk" &&
					wiz.args.storageControllers[i].mediumAttachments[a].medium != null) {
				hdFound = true;
				break;
			}
		}
	}
	
	$('#wizardFirstRunStepWHD').css({'display':(hdFound ? '' : 'none')});
	$('#wizardFirstRunStepNoHD').css({'display':(hdFound ? 'none' : '')});
	
	function wizardFirstRunFillMedia(sel) {
		
		var cds = vboxMedia.mediaForAttachmentType('DVD');
		
		$('#wizardFirstRunMedia')[0].options = [];
		
		for(var i = 0; i < cds.length; i++) {
			$('#wizardFirstRunMedia')[0].options[i] = new Option(vboxMedia.getName(cds[i]), cds[i].id, (sel && sel == cds[i].id), (sel && sel == cds[i].id));
		}
		
	}
	
	wizardFirstRunFillMedia();
	
	var wizardFirstRunBar = new vboxToolbarSingle({button: {
		/* Add Attachment Button */
		'name' : 'mselecthdbtnd',
		'label' : 'Choose a virtual optical disk file...',
		'language_context': 'UIWizardFirstRun',
		'icon' : 'select_file',
		'click' : function () {
			vboxMedia.actions.choose(null,'DVD',function(med){
				if(!med) return;
				wizardFirstRunFillMedia(med.id);
			});
		}
	}});
	wizardFirstRunBar.renderTo('wizardFirstRunChoose');		

	$('#wizardFirstRunMedia').hide();
	var w = $('#wizardFirstRunMedia').parent().innerWidth();
	$('#wizardFirstRunMedia').css({'width':w+'px'}).show();


});

</script>
