/**
 * @fileOverview Common utilities
 * @author Ian Moore (imoore76 at yahoo dot com)
 * @version $Id: utils.js 599 2015-07-27 10:40:37Z imoore76 $
 * @copyright Copyright (C) 2010-2015 Ian Moore (imoore76 at yahoo dot com)
 * 		- unless otherwise noted in fuction
 */

/**
 * 
 * Prevent ESC key from stopping background AJAX requests
 * 
 */
$(document).ready(function(){
    $(window).keydown(function(i){if(i.keyCode&&i.keyCode===27){
        i.preventDefault();
        try {
                var flash = RDPWebClient.getFlashById("FlashRDP");
                flash.keyboardSendScancodes('01');
        } catch (e) {
                //alert(e.message);
        }
    }});
    $(document).keydown(function(i){if(i.keyCode&&i.keyCode===27){
        i.preventDefault();
        try {
                var flash = RDPWebClient.getFlashById("FlashRDP");
                flash.keyboardSendScancodes('01');
        } catch (e) {
                //alert(e.message);
        }
    }});
});

/**
 * Traverse a tree and return matching nodes.
 * @param {Object} tree - tree to traverse
 * @param {String} prop - node property to match
 * @param {Mixed} val - value that node property must match
 * @param {Boolean} all - return all results rather than stopping at first matching node (optional)
 * @param {String} children - search node children in property named by this argument (optional)
 * @return all matched nodes | first matched node | null
 */
function vboxTraverse(tree,prop,val,all,children) {
	var leafs = new Array();
	for(var a in tree) {
		if(tree[a][prop] == val) {
			if(!all) return tree[a];
			leafs[leafs.length] = tree[a];
		}
		if(children && tree[a][children] && tree[a][children].length) {
			var c = vboxTraverse(tree[a][children],prop,val,all,children);
			if(!all && c) { return c; }
			else if(c && c.length) {
				leafs = leafs.concat(c);
			}
		}
	}
	return (all ? leafs : null);
}

/**
 * Performs AJAX request, alert()'s returned errors
 * 
 * @param {String} fn - AJAX function to call
 * @param {Object} params - params to pass to AJAX call
 * @return {Object} deferred promise
 */
function vboxAjaxRequest(fn,params,config) {
	
	// Promise for data
	var def = $.Deferred();
	
	// Fatal error previously occurred
	if($('#vboxPane').data('vboxFatalError'))
		return def.reject();
	
	var data = {
        'fn': fn,
        'params': params ? params : null,
        'persist': config && config.persist ? config.persist : null
	};

	$.when($.post(vboxEndpointConfig.api, JSON.stringify(data), undefined,"json")
	
		// Run on error
		.fail(function(d,etext,xlr,d2) {

			// Fatal error previously occurred
			if($('#vboxPane').data('vboxFatalError')) return null;
			
			if(etext != 'error') {
				
				// Halt on parse errors
				if(etext.search(/parse/i) > -1) {
					$('#vboxPane').data('vboxFatalError',1);
				}
				
				if(window.console && window.console.log)
					window.console.log(etext + ': '+ d.responseText);
				
				vboxAlert({'error':'Ajax error: ' + etext,'details':d.responseText},{'width':'400px'});

			} else {
				
				// Check for error HTTP status
				if(d && d.status && (String(d.status).substring(0,1) == '4' || String(d.status).substring(0,1) == '5')) {
					var err = {error:'<div align="center">HTTP error: ' + d.status + ' ' + d.statusText+"</div>",details:''};
					for(var i in d) {
						if(typeof(d[i]) == 'function' || typeof(d[i]) == 'object') continue;
						err.details += i + ': "' + d[i] + '"' + "\n";
					}
					phpVirtualBoxFailure(err);
					
				} else {
					phpVirtualBoxFailure('<div align="center">(General communication failure)');					
				}
			}
			
			return null;
			
		// Filter out data and display error messages
		}).pipe(function(d){

			// Fatal error previously occurred
			if($('#vboxPane').data('vboxFatalError')) {
				return null;
			}

			// Append debug output to console
			if(d && d.messages && window.console && window.console.log) {
				for(var i = 0; i < d.messages.length; i++) {
					window.console.log(d.messages[i]);
				}
			}
			
			if(d.errors.length > 0) {
				
				
				for(var i = 0; i < d.errors.length; i++) {
					
					// Handle fatal and connection errors
					if(d.errors[i].fatal || d.errors[i].connection) {
						
						// Multiple Servers check
						if(d.errors[i].connection && $('#vboxPane').data('vboxConfig')	) {
							
							$('#vboxPane').data('vboxFatalError',1);
							$('#vboxPane').css({'display':'none'});
							
							s='';
							if($('#vboxPane').data('vboxConfig').servers && $('#vboxPane').data('vboxConfig').servers.length) {
								var servers = $('#vboxPane').data('vboxConfig').servers;
								for(var a = 0; a < servers.length; a++) {
									servers[a] = "<a href='?server="+servers[a].name+"'>"+$('<div />').html(servers[a].name).text()+"</a>";
								}
								s = '<div style="display: block">'+trans('Server List','phpVirtualBox')+': '+servers.join(', ')+'</div>';
							}
							if(s) vboxAlert(s);
							vboxAlert(d.errors[i],{'width':'400px'});
							vboxAlert('<p>'+trans('An error occurred communicating with your vboxwebsrv. No more requests will be sent by phpVirtualBox until the error is corrected and this page is refreshed. The details of this connection error should be displayed in a subsequent dialog box.','phpVirtualBox')+'</p>'+s,{'width':'50%'});
							
							
						
						// Ignore connection errors until we have config data unless this was a login attempt
						} else if(!d.errors[i].connection || fn == 'login') {
							
							// If we have config data, and the error is fatal, halt processing
							if(d.errors[i].fatal && $('#vboxPane').data('vboxConfig')) {
								$('#vboxPane').data('vboxFatalError',1);
								$('#vboxPane').css({'display':'none'});
							}

							vboxAlert(d.errors[i],{'width':'400px'});
							
						}
						
					} else {
						
						// Error from normal request
						vboxAlert(d.errors[i],{'width':'400px'});
					}
					
				} // </ foreach error >
				
			} // </ if errors.length >
				
			return (d && d.data ? d.data : null);
			
		})
	).done(function(d) {
		if(d) def.resolve(d);
		else def.reject();
	}).fail(function(){
		def.reject();
	});
	
	return def.promise();
}

/**
 * Return VRDE host address of VM
 * @param {Object} vm - virtual machine object
 * @return {String} VRDE host for VM
 */
function vboxGetVRDEHost(vm) {
	var chost = ($('#vboxPane').data('vboxConfig').consoleHost ? $('#vboxPane').data('vboxConfig').consoleHost : (vm && vm.VRDEServer && vm.VRDEServer.netAddress ? vm.VRDEServer.netAddress : null));
	if(!chost) {
		// Set to host
		chost = $('#vboxPane').data('vboxConfig').host;
		// Check for localhost / 127.0.0.1
		if(!chost || chost == 'localhost' || chost == '127.0.0.1')
			chost = location.hostname;
	}
	return chost;
}

/**
 * Return the correct icon string relative to images/vbox/ for the guest OS type
 * @param {String} osTypeId - guest OS type id
 * @return {String} icon file name
 */
function vboxGuestOSTypeIcon(osTypeId) {
	
    var strIcon = "os_other.png";
    switch (osTypeId)
    {
		case "Other":           strIcon = "os_other.png"; break;
		case "DOS":             strIcon = "os_dos.png"; break;
		case "Netware":         strIcon = "os_netware.png"; break;
		case "L4":              strIcon = "os_l4.png"; break;
		case "Windows31":       strIcon = "os_win31.png"; break;
		case "Windows95":       strIcon = "os_win95.png"; break;
		case "Windows98":       strIcon = "os_win98.png"; break;
		case "WindowsMe":       strIcon = "os_winme.png"; break;
		case "WindowsNT4":      strIcon = "os_winnt4.png"; break;
		case "Windows2000":     strIcon = "os_win2k.png"; break;
		case "WindowsXP":       strIcon = "os_winxp.png"; break;
		case "WindowsXP_64":    strIcon = "os_winxp_64.png"; break;
		case "Windows2003":     strIcon = "os_win2k3.png"; break;
		case "Windows2003_64":  strIcon = "os_win2k3_64.png"; break;
		case "WindowsVista":    strIcon = "os_winvista.png"; break;
		case "WindowsVista_64": strIcon = "os_winvista_64.png"; break;
		case "Windows2008":     strIcon = "os_win2k8.png"; break;
		case "Windows2008_64":  strIcon = "os_win2k8_64.png"; break;
		case "Windows7":        strIcon = "os_win7.png"; break;
		case "Windows7_64":     strIcon = "os_win7_64.png"; break;
		case "Windows8":        strIcon = "os_win8.png"; break;
		case "Windows8_64":     strIcon = "os_win8_64.png"; break;
		case "Windows81":       strIcon = "os_win81.png"; break;
		case "Windows81_64":    strIcon = "os_win81_64.png"; break;
		case "Windows10":       strIcon = "os_win10.png"; break;
		case "Windows10_64":    strIcon = "os_win10.png"; break;
		case "Windows11_64":    strIcon = "os_win11_64.png"; break;
		case "WindowsNT":       strIcon = "os_win_other.png"; break;
		case "WindowsNT_64":    strIcon = "os_win_other_64.png"; break; 
		case "Windows2012_64":	strIcon = "os_win2k12_64.png"; break;
		case "Windows2016_64":	strIcon = "os_win2k16_64.png"; break;
                case "Windows2019_64":	strIcon = "os_win2k19_64.png"; break;
		case "OS2Warp3":        strIcon = "os_os2warp3.png"; break;
		case "OS2Warp4":        strIcon = "os_os2warp4.png"; break;
		case "OS2Warp45":       strIcon = "os_os2warp45.png"; break;
		case "OS2eCS":          strIcon = "os_os2ecs.png"; break;
		case "OS2":             strIcon = "os_os2_other.png"; break;
		case "Linux_64":        strIcon = "os_linux_64.png"; break;
		case "Linux":           strIcon = "os_linux.png"; break;
		case "Linux22":         strIcon = "os_linux22.png"; break;
		case "Linux24":         strIcon = "os_linux24.png"; break;
		case "Linux24_64":      strIcon = "os_linux24_64.png"; break;
		case "Linux26":         strIcon = "os_linux26.png"; break;
		case "Linux26_64":      strIcon = "os_linux26_64.png"; break;
		case "ArchLinux":       strIcon = "os_archlinux.png"; break;
		case "ArchLinux_64":    strIcon = "os_archlinux_64.png"; break;
		case "Debian":          strIcon = "os_debian.png"; break;
		case "Debian_64":       strIcon = "os_debian_64.png"; break;
		case "OpenSUSE":        strIcon = "os_opensuse.png"; break;
		case "OpenSUSE_64":     strIcon = "os_opensuse_64.png"; break;
		case "Fedora":          strIcon = "os_fedora.png"; break;
		case "Fedora_64":       strIcon = "os_fedora_64.png"; break;
		case "Gentoo":          strIcon = "os_gentoo.png"; break;
		case "Gentoo_64":       strIcon = "os_gentoo_64.png"; break;
		case "Mandriva":        strIcon = "os_mandriva.png"; break;
		case "Mandriva_64":     strIcon = "os_mandriva_64.png"; break;
		case "RedHat":          strIcon = "os_redhat.png"; break;
		case "RedHat_64":       strIcon = "os_redhat_64.png"; break;
		case "Turbolinux":      strIcon = "os_turbolinux.png"; break;
		case "Turbolinux_64":   strIcon = "os_turbolinux_64.png"; break;
		case "Ubuntu":          strIcon = "os_ubuntu.png"; break;
		case "Ubuntu_64":       strIcon = "os_ubuntu_64.png"; break;
		case "Xandros":         strIcon = "os_xandros.png"; break;
		case "Xandros_64":      strIcon = "os_xandros_64.png"; break;
		case "FreeBSD":         strIcon = "os_freebsd.png"; break;
		case "FreeBSD_64":      strIcon = "os_freebsd_64.png"; break;
		case "OpenBSD":         strIcon = "os_openbsd.png"; break;
		case "OpenBSD_64":      strIcon = "os_openbsd_64.png"; break;
		case "NetBSD":          strIcon = "os_netbsd.png"; break;
		case "NetBSD_64":       strIcon = "os_netbsd_64.png"; break;
		case "Solaris":         strIcon = "os_solaris.png"; break;
		case "Solaris_64":      strIcon = "os_solaris_64.png"; break;
		case "Solaris11_64":    strIcon = "os_oraclesolaris_64.png"; break;
		case "OpenSolaris":     strIcon = "os_oraclesolaris.png"; break;
		case "OpenSolaris_64":  strIcon = "os_oraclesolaris_64.png"; break;
		case "QNX":             strIcon = "os_qnx.png"; break;
		case "MacOS106":        strIcon = "os_macosx.png"; break;
		case 'MacOS':           strIcon = "os_macosx.png"; break;
		case 'MacOS_64':        strIcon = "os_macosx_64.png"; break;
		case "MacOS106_64":     strIcon = "os_macosx_64.png"; break;
		case "MacOS107_64":     strIcon = "os_macosx_64.png"; break;
		case "MacOS108_64":     strIcon = "os_macosx_64.png"; break;
		case "MacOS109_64":     strIcon = "os_macosx_64.png"; break;
		case "MacOS1010_64":     strIcon = "os_macosx_64.png"; break;
		case "MacOS1011_64":     strIcon = "os_macosx_64.png"; break;
		case "MacOS1012_64":     strIcon = "os_macosx_64.png"; break;
		case "MacOS1013_64":     strIcon = "os_macosx_64.png"; break;
		case 'Oracle':          strIcon = "os_oracle.png"; break;
		case 'Oracle_64':       strIcon = "os_oracle_64.png"; break;
		case 'JRockitVE':       strIcon = 'os_jrockitve.png'; break;
		case "VirtualBox_Host": strIcon = "os_virtualbox.png"; break;

        default:
            break;
    }
    return strIcon;
}

/**
 * Return the correct icon relative to images/vbox/ for the VM state.
 * @param {String} state - virtual machine state
 * @return {String} icon file name
 */
function vboxMachineStateIcon(state)
{
	var strIcon = "state_powered_off_16px.png";
    var strNoIcon = "state_running_16px.png";

    switch (state)
    {
        case "PoweredOff": strIcon = "state_powered_off_16px.png"; break;
        case "Saved": strIcon = "state_saved_16px.png"; break;
        case "Saving": strIcon = "state_saving_16px.png"; break;
        case "Snapshotting": strIcon = "snapshot_offline_16px.png"; break;
        case "LiveSnapshotting": strIcon = "snapshot_online_16px.png"; break;
        case "Aborted": strIcon = "state_aborted_16px.png"; break;
        case "Running": strIcon = "state_running_16px.png"; break;
        case "Paused": strIcon = "state_paused_16px.png"; break;
        case "Stuck": strIcon = "state_stuck_16px.png"; break;
        case "Saving": strIcon = "state_discarding_16px.png"; break;
        case "Restoring": strIcon = "vm_settings_16px.png"; break;
        case "RestoringSnapshot": strIcon = "discard_cur_state_16px.png"; break;
        case "DeletingSnapshot": strIcon = "state_discarding_16px.png"; break;
        case "Hosting" : strIcon = "vm_settings_16px.png"; break;
        case "Inaccessible": strIcon = "state_aborted_16px.png"; break;
        default:
            strIcon = strNoIcon;
    }
    
    return strIcon;

}

/**
 * File or Folder browser dialog
 * @param {String} root - path to initial folder or file
 * @param {Function} fn - callback function to run when OK is clicked on dialog
 * @param {Boolean} foldersonly - only display / allow selection of folders (optional)
 * @param {String} title - title of dialog (optional)
 * @param {String} icon - URL to icon (optional) 
 * @param {Boolean} strictFiles - only allow the OK button to be clicked when a file is selected (optional)
 */
function vboxFileBrowser(root,fn,foldersonly,title,icon,strictFiles) {

	var buttons = { };
	buttons[trans('OK','QIMessageBox')] = function(f) {
		
		if(strictFiles && $('#vboxBrowseFolderList').find('.vboxListItemSelected').first().parent().hasClass('directory')) {
			$('#vboxBrowseFolderList').find('.vboxListItemSelected').first().trigger('dblclick');
			return;
		}
		
		if(typeof f != 'string') {
			f = $('#vboxBrowseFolderList').find('.vboxListItemSelected').first().attr('name');
		}
		$('#vboxBrowseFolder').trigger('close').empty().remove();
		fn(f);
	};
	buttons[trans('Cancel','QIMessageBox')] = function() { fn(null); $('#vboxBrowseFolder').trigger('close').empty().remove(); };

	var d1 = $('<div />').attr({'id':'vboxBrowseFolder','class':'vboxDialogContent','style':'display:none'});
	
	$('<div />').attr({'id':'vboxBrowseFolderList'}).fileTree({ 'root': (root ? root : '/'),'dirsOnly':foldersonly,'loadMessage':trans('Loading ...','UIVMDesktop'),'scrollTo':'#vboxBrowseFolder'},function(f){
    	buttons[trans('OK','QIMessageBox')](f);
    }).appendTo(d1);
	
    $(d1).dialog({'closeOnEscape':true,'width':400,'height':600,'buttons':buttons,'modal':true,'autoOpen':true,'dialogClass':'vboxDialogContent','title':'<img src="'+(icon ? icon : 'images/jqueryFileTree/'+(foldersonly ? 'folder_open' : 'file')+'.png') + '" class="vboxDialogTitleIcon" /> ' + (title ? title : trans((foldersonly ? 'Select Folder' : 'Select File')))}).on("dialogbeforeclose",function(){
    	$(this).parent().find('span:contains("'+trans('Cancel','QIMessageBox')+'")').trigger('click');
    });			

}
/**
 * Convert megabytes to human readable string
 * @param {Integer} mb - megabytes
 * @return {String} human readable size representation (e.g. 2 GB, 500 MB, etc..)
 */
function vboxMbytesConvert(mb) {return vboxBytesConvert(parseFloat(mb) * 1024 * 1024);}
/**
 * Convert bytes to human readable string
 * @param {Integer} bytes - bytes
 * @return {String} human readable size representation (e.g. 2 GB, 500 MB, etc..)
 */
function vboxBytesConvert(bytes) {
	var ext = new Array('B','KB','MB','GB','TB');
	var unitCount;
	for(unitCount=0; bytes >= 1024 && unitCount < ext.length; unitCount++) bytes = parseFloat(parseFloat(bytes)/1024);
	
	return Math.round(parseFloat(bytes)*Math.pow(10,2))/Math.pow(10,2) + " " + trans(ext[unitCount], 'VBoxGlobal');
}
/**
 * Parse str param into megabytes
 * @param {String} str - size string (2 TB, 500 MB, etc..) to parse
 * @return {Integer} megabytes
 */
function vboxConvertMbytes(str) {
	str = str.replace('  ',' ');
	str = str.split(' ',2);
	if(!str[1]) str[1] = trans('MB','VBoxGlobal');
	var ext = new Array(trans('B','VBoxGlobal'),trans('KB','VBoxGlobal'),trans('MB','VBoxGlobal'),trans('GB','VBoxGlobal'),trans('TB','VBoxGlobal'));
	var index = jQuery.inArray(str[1],ext);
	if(index == -1) index = 2;
	switch(index) {
		case 0:
			return ((str[0] / 1024) / 1024);
			break;
		case 1:
			return (str[0] / 1024);
			break;
		case 3:
			return (str[0] * 1024);
			break;
		case 4:
			return (str[0] * 1024 * 1024);
			break;
		default:
			return (str[0]); 
	}
	
}


/**
 * Display alert Dialog
 * @param {String|Object} e - message to display or object containing error message and details
 * @param {Object} xtraOpts - extra options to apply to alert jquery dialog (optional)
 * @see jQuery.dialog()
 */
function vboxAlert(e,xtraOpts) {

    var acknowledged = $.Deferred();
    
	var msg = '';
	
	if(typeof e == 'object') msg = e.error;
	else msg = e;
	
	// Convert to <p>
	if(msg[0] != '<') msg = '<p>'+msg+'</p>';
	
	var div = $('<div />').attr({'class':'vboxDialogContent vboxAlert'}).html('<img src="images/50px-Warning_icon.svg.png" style="float: left; padding: 10px; height: 50px; width: 50px;" height="50" width="50" />'+msg);
	
	
	if(typeof e == 'object' && e.details) {
		
		// Details can contain HTML entities
		e.details = $('<div />').html(e.details).text();
		
		var p = $('<p />').attr({'style':'text-align: center'});
		$('<a />').attr({'href':'#'}).html(trans('Details','QIMessageBox')).click(function(){
			$(this).parent().parent().dialog('option',{'height':400,'position':'center'});
			$(this).parent().siblings(".vboxAlert").css({"display":""});
			$(this).parent().css({'padding':'0px','margin':'0px'});
			$(this).parent().siblings(".vboxAlert").siblings().empty().remove();
			return false;
		}).appendTo(p);

		$(div).append(p);
		
		var ddet = $('<div />').attr({'style':'display: none; height: 100%; width: auto;','class':'vboxAlert'});	
		$('<textarea />').attr({'spellcheck':'false','wrap':'off','readonly':'true'}).val(e.details).appendTo($('<form />').appendTo(ddet));	
		$(div).append(ddet);
	}
	
	
	
	var buttons = { };
	buttons[trans('OK','QIMessageBox')] = function(f) {
	    $(this).trigger('close').empty().remove();
	    acknowledged.resolve();
	};

	var dialogOpts = {'closeOnEscape':false,'width':600,'height':'auto','buttons':buttons,'modal':true,'autoOpen':true,'dialogClass':'vboxDialogContent','title':'<img src="images/vbox/OSE/about_16px.png" class="vboxDialogTitleIcon" /> phpVirtualBox'};

	if(typeof xtraOpts == "object") {
		for(var i in xtraOpts) {
			dialogOpts[i] = xtraOpts[i];
		}
	}

	$(div).dialog(dialogOpts);
	
    return acknowledged;

}
/**
 * Confirmation dialog
 * @param {String} q - question to ask
 * @param {Object} buttons -buttons to display on confirmation dialog
 * @param {String} cancelText - string displayed on Cancel button. Defaults to 'Cancel'
 * @param {Function} onCancel - function to run onCancel
 * @return {HTMLNode}
 * @see jQuery.dialog()
 */
function vboxConfirm(q,buttons,cancelText,onCancel) {

	var div = $('<div />').attr({'class':'vboxDialogContent','style':'display: none; width: 500px;'}).html('<img src="images/50px-Question_icon.svg.png" style="height: 50px; width: 50px; float: left; padding: 10px;" height="50" width="50" />'+q);
	
	if(!cancelText) cancelText = trans('Cancel','QIMessageBox');
	
	buttons[cancelText] = function() { $(this).remove(); if(onCancel) { onCancel(); }};
	
    $(div).dialog({'closeOnEscape':false,'width':500,'height':'auto','buttons':buttons,'modal':true,'autoOpen':true,'dialogClass':'vboxDialogContent','title':'<img src="images/vbox/OSE/about_16px.png" class="vboxDialogTitleIcon" /> phpVirtualBox'});			
	
    return $(div);
}

/**
 * Initialize common UI items
 * @param {String|HTMLNode} root - root HTML Node or node ID to initialize
 * @param {String} context - language context to use for translations
 * @see trans()
 */
function vboxInitDisplay(root,context) {
	
	if(typeof root == 'string')
		root = $('#'+root);
	
	/* 
	 * Sliders 
	 */
	
	$(root).find('div.slider').each(function(){
	
		if($(this).hasClass('translateglob')) {
			$(this).closest('table').find(".translate").html(function(i,h){return trans($('<div />').html(h).text(),'VBoxGlobal');}).removeClass('translate');
		}
		var frm = $(this).data('form');
		if($(this).data('display')) {
			var fn = $(this).data('display');
			$(this).slider('option','slide',function(event,ui){
				document.forms[frm].elements[event.target.id + 'Value'].value = fn(ui.value);
			}).slider('option','change',function(event,ui){
				document.forms[frm].elements[event.target.id + 'Value'].value = fn(ui.value);
			});			
		} else {
			$(this).slider('option','slide',function(event,ui){
				document.forms[frm].elements[event.target.id + 'Value'].value = ui.value;
			}).slider('option','change',function(event,ui){
				document.forms[frm].elements[event.target.id + 'Value'].value = ui.value;
			});
		}
		
		// Slider scale (ticks)
		$(this).children("div.sliderScale").each(function(){
	
			var min = $(this).parent().slider('option','min');
			var max = $(this).parent().slider('option','max');
			
			var diff = Math.min((max - min),50);
			var tdw = Math.round(100 / diff);
			
			var tr = $('<tr />');
	
			for(var a = 0; a < diff; a++) {
				$(tr).append($('<td />').attr({'style':'width: '+ tdw + '%'}));
			}
			$('<table />').attr({'class':'sliderScale'}).append(tr).appendTo(this);
			
		});
	
		// save value
		$(this).slider('value',$(this).slider('value'));
		
		// Min / Max labels
		if(!$(this).data('noMinMaxLabels')) {
			var min = $(this).slider('option','min');
			var max = $(this).slider('option','max');
			$(this).closest('table').find('.vboxSliderMin').html(function(i,h){return ' ' + trans(h,context,min,$(this).attr('title')).replace('%1',min);});
			$(this).closest('table').find('.vboxSliderMax').html(function(i,h){return ' ' + trans(h,context,max,$(this).attr('title')).replace('%1',max);});
	}
	});

	
	/*
	 * Translations
	 */
	$(root).find(".translate").html(function(i,h){return trans($('<div />').html(h).text(),context);}).removeClass('translate');

	/*
	 * Setup Tabs
	 */
	$(root).find(".vboxTabbed").tabs();
	
	
	/* Image buttons */
	if(!jQuery.browser.msie) {
		
		$(root).find('input.vboxImgButton').on('mousedown',function(){
	
			var xy = $(this).css('backgroundPosition').split(' ');
	
			if(!$(this).data('startX')) $(this).data('startX', parseInt(xy[0]));
			if(!$(this).data('startY')) $(this).data('startY', parseInt(xy[1]));
	
			$(this).css('backgroundPosition',(parseInt($(this).data('startX'))+1)+'px '+(parseInt($(this).data('startY'))+1)+'px'); 
			
			var btn = this;
			$(document).one('mouseup',function(){
				$(btn).css('backgroundPosition',$(btn).data('startX')+'px '+$(btn).data('startY')+'px');
			});
				
		});
		
	}
	
	/*
	 * 
	 * Enable / disable sections (Remote Display, Audio, Network Adapters, usb)
	 * 
	 */
	
	$(root).find('input.vboxEnablerCheckbox').on('click', function(e) {
	
			var roottbl = $(this).closest('table');
			
			$(roottbl).find('input:not(.vboxEnablerCheckbox)').prop('disabled',!this.checked);
			$(roottbl).find('select:not(.vboxEnablerIgnore)').prop('disabled',!this.checked);
			(this.checked ? $(roottbl).find('th').removeClass('vboxDisabled') : $(roottbl).find('th:not(.vboxEnablerIgnore)').addClass('vboxDisabled'));
			(this.checked ? $(roottbl).find('.vboxEnablerListen').removeClass('vboxDisabled') : $(roottbl).find('.vboxEnablerListen').addClass('vboxDisabled'));
	
			// Find any enabler / disabler listeners
			$(roottbl).find('.vboxEnablerTrigger').trigger(this.checked ? 'enable' : 'disable');
			
			
	});
	
	
	/*
	 * Tooltips
	 */
	$(root).find('.vboxToolbarSmallButton').tipped({'source':'title','mode':'hover'});
	
	
	/*
	 * File / Folder browsers
	 */
	if($('#vboxPane').data('vboxConfig').browserDisable) {
		$(root).find('table td.vboxFileFolderInput input.vboxImgButton').hide();
	}


}

/**
 * Color VISIBLE children rows of parent elm
 * @param {HTMLNode} elm - element who's children to color
 * @param {Boolean} startOdd - start on the 2nd child (optional)
 * @param {String} headerClass - if child node has headerClass class, consider it a header and skip coloring (optional)
 */
function vboxColorRows(elm,startOdd,headerClass) {
	var odd = 0;
	if(startOdd) odd = 1;
	$(elm).children().each(function(i){
		if(headerClass && $(this).hasClass(headerClass)) {
			odd = (startOdd ? 1 : 0);
			return;
		}
		if($(this).css('display') == 'none' || $(this).hasClass('vboxListItemDisabled')) return;
		(odd++ % 2 ? $(this).addClass('vboxOddRow') : $(this).removeClass('vboxOddRow'));
	});
}

/**
 * Return an HTML div node sized to parent with overflow hidden
 * @param {HTMLNode} p - node to add div to
 * @return {HTMLNode}
 */
function vboxDivOverflowHidden(p) {
	var w = $(p).innerWidth();
	w -= parseInt($(p).css('padding-right'));
	w -= parseInt($(p).css('padding-left'));
	return $('<div />').css({'width':(w-4)+'px','overflow':'hidden','padding':'0px','margin':'0px','border':'0px'});
}


/**
 * Show progress dialog and periodically poll the progress' status
 * 
 * @param {String} prequest - request object passed to ajax
 * @param {Function} callback - function to run on progress completion
 * @param {String} icon - URL of image to display on progress operation dialog (optional)
 * @param {String} title - title of progress operation dialog (optional)
 * @param {String} target - contextual target of progress operation
 * @param {Boolean} blocking - true if progress operation should block other ops
 * @see vboxconnector::progressGet()
 */
function vboxProgress(prequest,callback,icon,title,target,blocking) {

	// Fix title
	title = title.replace('\.+$','');
	
	// Sanitize target
	target = $('<div />').text(target).html();
	
	// Sanitize progress request data
	var persist = prequest.persist;
	prequest = {
		'progress' : prequest.progress,
		'catcherrs' : prequest.catcherrs
	};

	// Blocking creates a dialog
	if(!blocking) {
	
		vboxProgressCreateListElement(prequest,icon,title,target,callback);
		
		$.when(prequest, vboxAjaxRequest('progressGet',prequest,{'persist':persist})).done(vboxProgressUpdate);

	} else {
		
		vboxProgressCreateDialog(prequest,icon,title,target,callback);
				
		$.when(prequest, vboxAjaxRequest('progressGet',prequest,{'persist':persist})).done(vboxProgressUpdateModal);
	}
	
	
	
}

/**
 * Generate modal progress dialog
 * 
 * @param {Object} prequest - progress operation request object
 * @param {String} icon - URL of image to display on progress operation dialog (optional)
 * @param {String} title - title of progress operation dialog (optional)
 * @param {String} target - contextual target of progress operation
 * @param {Function} callback - function to run on progress completion
 * @see vboxconnector::progressGet()
 */
function vboxProgressCreateDialog(prequest,icon,title,target,callback) {

	// Shorthand
	var pid = prequest.progress;
	
	var div = $('<div />').attr({'id':'vboxProgress'+pid,'title':(title ? title : 'phpVirtualBox'),'style':'text-align: center'});
	
	var tbl = $('<table />').css({'width':'100%'});
	var tr = $('<tr />').css({'vertical-align':'middle'});
	var td = $('<td />').css({'padding':'0px','text-align':'left','width':'1px'});
	if(icon) {
		$('<img />').css({'margin':'4px'}).attr({'src':'images/vbox/'+icon,'height':'90','width':'90'}).appendTo(td);
	}
	$(tr).append(td);
	
	var td = $('<td />').css({'text-align':'center','padding':'4px'}).append($('<div />').attr({'id':'vboxProgressBar'+pid,'margin':'4px'}).progressbar({ value: 1 }));
	
	$('<div />').attr({'id':'vboxProgressText'+pid}).html('<img src="images/spinner.gif" />').appendTo(td);
	
	// Cancel button
	$('<div />').attr({'id':'vboxProgressCancel'+pid}).css({'display':'none','padding':'8px'}).append(

		$('<input />').attr('type','button').val(trans('Cancel','QIMessageBox')).data({'pid':pid}).click(function(){
			this.disabled = 'disabled';
			vboxAjaxRequest('progressCancel',prequest);
		})
	).appendTo(td);
	
	
	$(tbl).append($(tr).append(td)).appendTo(div);
	
	// Append placeholder for list element
	$('#vboxProgressOps').prepend($('<div />').addClass('vboxProgressOpElement').css({'display':'none'}).attr({'id':'vboxProgressPlaceholder'+pid}));
	
	$(div).data({
		'vboxCallback':callback,
		'vboxIcon' : icon,
		'vboxTitle' : title,
		'vboxTarget' : target
	}).dialog({'width':400,'height':'auto','closeOnEscape':false,'modal':true,'resizable':false,'draggable':true,'closeOnEscape':false,'buttons':{}});
	

}

/**
 * Generate progress list element and append it
 * 
 * @param {Object} prequest - progress operation request object
 * @param {String} icon - URL of image to display on progress operation dialog (optional)
 * @param {String} title - title of progress operation dialog (optional)
 * @param {String} target - contextual target of progress operation
 * @param {Function} callback - function to run on progress completion
 * @see vboxconnector::progressGet()
 */
function vboxProgressCreateListElement(prequest,icon,title,target,callback) {
	
	// Shorthand
	var pid = prequest.progress;
	
	var div = $('<div />').attr({'id':'vboxProgress'+pid}).addClass('vboxProgressOpElement');

	var divOpTitle = $('<div />').addClass('vboxProgressOpTitle');

	if(icon) {
		$('<img />').attr({'src':'images/vbox/'+icon,'height':'16','width':'16'}).appendTo(divOpTitle);
	}

	// Title
	if($('#vboxPane').data('vboxConfig').servers.length) {
		title = $('#vboxPane').data('vboxConfig').name + ': ' + title;		
	}

	$(divOpTitle).append(title + (target ? ' (' + target + ')' : '')).appendTo(div);

	// Progress bar
	$('<div />').addClass('vboxProgressBarContainer').append(
			$('<div />').attr({'id':'vboxProgressBar'+pid}).progressbar({ value: 1 })
	).appendTo(div);
	
	// Progress text
	$('<div />').addClass('vboxProgressOpText').append(
			$('<span />').attr({'id':'vboxProgressText'+pid}).html('<img src="images/spinner.gif" height=12 width=12/>')
	).appendTo(div);
	
	// Cancel button
	$('<div />').addClass('vboxProgressOpCancel').append(
			$('<input />').attr({'id':'vboxProgressCancel'+pid,'type':'button'}).val(trans('Cancel','UIProgressDialog')).data({'pid':pid})
				.click(function(){
					this.disabled = 'disabled';
					vboxAjaxRequest('progressCancel',prequest);
				})
				.css({'margin':'0px'})
	).appendTo(div);
	
	$(div).data({'vboxCallback':callback})
	
	if($('#vboxProgressPlaceholder'+pid)[0]) {
		$('#vboxProgressPlaceholder'+pid).replaceWith(div);
	} else {
	    $('#vboxProgressOps').prepend(div);		
	}

	
}

/** 
 * OnUnload warning shown when an operation is in progress
 * @return {String} warning message indicating operation is in progress
 */
function vboxOpInProgressCheck() {
	if($('#vboxProgressOps').children('div.vboxProgressOpElement:not(.vboxProgressComplete)').addClass('vboxProgressRunning').length) {
		return trans('Warning: A VirtualBox internal operation is in progress. Closing this window or navigating away from this web page may cause unexpected and undesirable results. Please wait for the operation to complete.','phpVirtualBox');
	}
}

/**
 * Update progress dialog box. Callback run from vboxAjaxRequest
 * 
 * @param {Object} prequest - progress operation data passed to ajax call
 * @param {Object} data - data returned from progressGet AJAX call
 */
function vboxProgressUpdateModal(prequest, data) {
	vboxProgressUpdate(prequest,data,true);
}

/**
 * Update progress dialog box or progress list row with % completed
 * 
 * @param {Object} prequest - progress operation data passed to ajax call
 * @param {Object} d - data returned from progressGet AJAX call
 * @param {Boolean} modal - true if updating modal dialog
 * @see vboxconnector::progressGet()
 */
function vboxProgressUpdate(prequest,d,modal) {
	
	// Shorthand
	var pid = prequest.progress;

	// check for completed progress
	if(!d || !d.responseData || !d.responseData['progress'] || !d.responseData['info'] || d.responseData['info']['completed'] || d.responseData['info']['canceled']) {
		
		if(d && d.responseData['info'] && d.responseData['info']['canceled'])
			vboxAlert(trans('Operation Canceled','phpVirtualBox'),{'width':'300px','height':'auto'});
		
		var callback = $("#vboxProgress"+pid).data('vboxCallback');
		
		$("#vboxProgressBar"+pid).progressbar({ value: 100 });
		
		if(modal) {
			
			var icon = $("#vboxProgress"+pid).data('vboxIcon');
			var title = $("#vboxProgress"+pid).data('vboxTitle');
			var target = $("#vboxProgress"+pid).data('vboxTarget');
			
			$("#vboxProgress"+pid).empty().remove();

			if(callback) callback(d);
			
			// Now append to list
			vboxProgressCreateListElement(prequest,icon,title,target);
			vboxProgressUpdate(prequest);
			
		} else {
			
			var sdate = new Date();
			$("#vboxProgressText"+pid).html(sdate.toLocaleString());
			$('#vboxProgressCancel'+pid).remove();
			
			if(callback) callback(d);
		}
		
		$("#vboxProgress"+pid).addClass('vboxProgressComplete').removeClass('vboxProgressRunning');
		
		// Remove data
		$("#vboxProgress"+pid).removeData([
			'vboxCallback',
			'vboxIcon',
			'vboxTitle',
			'vboxTarget'
		]);
		
		// Check for max elements
		if($('#vboxPane').data('vboxConfig').maxProgressList) {
			var maxList = $('#vboxPane').data('vboxConfig').maxProgressList; 
	        try {
	        	maxList = Math.max(2,parseInt(maxList));
		    } catch (e) {
		        maxList = 5;
		    }
		    if(maxList > 0) $('#vboxProgressOps').children('div.vboxProgressComplete').slice(maxList).remove();

		}
		
		return;
	}

	// update percent
	$("#vboxProgressBar"+pid).progressbar({ value: d.responseData.info.percent });
	$("#vboxProgressText"+pid).html(d.responseData.info.percent+'%'+(modal ? '<br />' : ' ') + d.responseData.info.operationDescription);
	
	// Cancelable?
	if(d.responseData.info.cancelable) {
		$('#vboxProgressCancel'+pid).show();
	}
	
	// Get request
	var def = $.Deferred();
	def.done(function(){

		$.when(prequest, vboxAjaxRequest('progressGet', prequest, {'persist': d.persist}))
			.done((modal ? vboxProgressUpdateModal : vboxProgressUpdate));
		
	});
	window.setTimeout(def.resolve, 2000);
	
}

/**
 * Position element to mouse event
 * @param {HTMLNode} elm - HTML node to position
 * @param {Event} e - Event to position to
 */
function vboxPositionEvent(elm,e) {
	
	var d = {};
	
	if( self.innerHeight ) {
		d.pageYOffset = self.pageYOffset;
		d.pageXOffset = self.pageXOffset;
		d.innerHeight = self.innerHeight;
		d.innerWidth = self.innerWidth;
	} else if( document.documentElement &&
		document.documentElement.clientHeight ) {
		d.pageYOffset = document.documentElement.scrollTop;
		d.pageXOffset = document.documentElement.scrollLeft;
		d.innerHeight = document.documentElement.clientHeight;
		d.innerWidth = document.documentElement.clientWidth;
	} else if( document.body ) {
		d.pageYOffset = document.body.scrollTop;
		d.pageXOffset = document.body.scrollLeft;
		d.innerHeight = document.body.clientHeight;
		d.innerWidth = document.body.clientWidth;
	}

	$(elm).css({'left':0,'top':0});

	(e.pageX) ? x = e.pageX : x = e.clientX + d.scrollLeft;
	(e.pageY) ? y = e.pageY : y = e.clientY + d.scrollTop;
	
	//adjust to ensure element is inside viewable screen
	var right = x + $(elm).outerWidth();
	var bottom = y + $(elm).outerHeight();
	
	var windowWidth = $(window).width() + $(window).scrollLeft()-5;
	var windowHeight = $(window).height() + $(window).scrollTop()-5;
	
	x = (right > windowWidth) ? x - (right - windowWidth) : x;
	y = (bottom > windowHeight) ? y - (bottom - windowHeight) : y;
	
	$(elm).css({ top: y, left: x });
}

/**
 * Position element inside visible window
 * @param {HTMLNode} elm - element
 */
function vboxPositionToWindow(elm) {

	var offset = $(elm).offset();
	var x = offset.left;
	var y = offset.top;
		
	//adjust to ensure menu is inside viewable screen
	var right = x + $(elm).outerWidth();
	var bottom = y + $(elm).outerHeight();
	
	var windowWidth = $(window).width() + $(window).scrollLeft();
	var windowHeight = $(window).height() + $(window).scrollTop();
	
	x = (right > windowWidth) ? x - (right - windowWidth) : x;
	y = (bottom > windowHeight) ? y - (bottom - windowHeight) : y;
	
	$(elm).css({'top':y,'left':x});

}

/*
 * keycode input validation functions 
 */
/**
 * Return true if k param is a number
 * @param {Integer} k - keycode
 * @return {Boolean}
 */
function vboxValidateNum(k) {
	return ((k >= 96 && k <= 105)||(k >= 48 && k <= 57));
}
/**
 * Return true if k param is a number or '.'
 * @param {Integer} k - keycode
 * @return {Boolean}
 */
function vboxValidateIP(k) {
	return (vboxValidateNum(k) || k == 190 || k == 110 || k == 59 || k==78);
}
/**
 * Return true if k param is a valid control code (shift, backspace, etc..)
 * @param {Integer} k - keycode
 * @return {Boolean}
 */
function vboxValidateCtrl(k) {
	switch(k) {
		case 8: // backspace
		case 37: // left | right
		case 39:
		case 27: // esc
		case 16: // shift
		case 17: // ctrl
		case 35: // end
		case 36: // home
		case 46: // del
		case 144: // numlock
		case 20: // capslock
		case 18: // alt
			return true;
	}
	return false;
}

/** Parse Cookies and populate $('#vboxPane').data('vboxCookies') */
function vboxParseCookies() {
	if($('#vboxPane').data('vboxCookiesParsed')) return;
	var cookies = {};
	var c = document.cookie.split('; ');
	for(var i = 0; i < c.length; i++) {
		var nv = c[i].split('=');
		cookies[nv[0]] = nv[1];
	}	
	$('#vboxPane').data('vboxCookies', cookies);
	$('#vboxPane').data('vboxCookiesParsed',true);
}

/**
 * General application failure
 * @param {String|Object} msg - Optional extra message appended to error
 * 		or error object passed to vboxAlert
 */
function phpVirtualBoxFailure(msg) {
	if($('#vboxPane').data('vboxFatalError')) return;
	$('#vboxPane').data('vboxFatalError', 1);
	$('#vboxPane').css({'display':'none'});
	$('#vboxPane').trigger('phpVirtualBoxFailure');
	if(typeof(msg) == 'string') {
		vboxAlert(trans('There was an error obtaining the list of registered virtual machines from VirtualBox. Make sure vboxwebsrv is running and that the settings in config.php are correct.<p>The list of virtual machines will not begin auto-refreshing again until this page is reloaded.</p>','phpVirtualBox')+(msg ? msg : ''));
	} else {
		msg.error = trans('There was an error obtaining the list of registered virtual machines from VirtualBox. Make sure vboxwebsrv is running and that the settings in config.php are correct.<p>The list of virtual machines will not begin auto-refreshing again until this page is reloaded.</p>','phpVirtualBox') + msg.error;		
		vboxAlert(msg);
	}
}

/**
 * Set a cookie and update $('#vboxPane').data('vboxCookies') 
 * @param {String} k - cookie key
 * @param {any} v - cookie value
 * @param {Date} expire - when cookie should expire
 */
function vboxSetCookie(k,v,expire) {
	var exp = (v ? (expire ? expire : new Date(Date.now() + 7 * 1000 * 60 * 60 * 24)) : new Date().setDate(new Date().getDate() - 1));
	document.cookie = k+"="+v+"; expires="+exp.toGMTString()+"; path=/";
	$('#vboxPane').data('vboxCookies')[k] = v;
}

/**
 * Set a local data item using the local storage mechanism
 * and upate $('#vboxPane').data('vboxCookies');
 * @param {String} k - data item key
 * @param {any} v - data item value
 * @param {Boolean} nocookies - do not fall back to cookies
 */
function vboxSetLocalDataItem(k,v,nocookies) {

	// fall back to normal cookie
	if(typeof(Storage)==="undefined") {
		if(!nocookies) vboxSetCookie(k,v);
		return;
	}
	// Remove item?
	if(v) {
		localStorage.setItem(k,v.toString());		
	} else {
		localStorage.removeItem(k);
	}
}

/**
 * Get a local data item using the local storage mechanism
 * @param {String} k - data item key
 * @return {mixed} data item value
 */
function vboxGetLocalDataItem(k) {

	// fall back to normal cookie
	if(typeof(Storage)==="undefined") {
		return $('#vboxPane').data('vboxCookies')[k];
	}
	return localStorage.getItem(k);

}
/**
 * Strip file name from path
 * @param {String} p - path
 * @return {String} path minus file name
 */
function vboxDirname(p) {
	var pos = p.lastIndexOf($('#vboxPane').data('vboxConfig').DSEP);
	if(pos > -1) {
		return p.substring(0,pos);
	}
	return p;
}
/**
 * Strip dir name from path
 * @param {String} p - path
 * @return {String} file name portion of path
 */
function vboxBasename(p) {
	var pos = p.lastIndexOf($('#vboxPane').data('vboxConfig').DSEP);
	if(pos > -1) {
		return p.substring((pos+1));
	}
	return p;
}

/**
 * Return a time or date+time string depending on
 * how much time has elapsed
 * @param {Integer} t - seconds since 1/1/1970 0:0:0
 * @param {String} replaceTime - optional string to return replacing time
 * @param {String} replaceDateTime - optional string to return replace date_time
 * @return {String} time or date+time string
 */
function vboxDateTimeString(t, replaceTime, replaceDateTime) {

	var sdate = new Date(t*1000);
	if((new Date().getTime() - sdate.getTime())/1000 > 86400
			|| new Date().getDate() != sdate.getDate()) {
			return (replaceDateTime ? replaceDateTime.replace('%1',sdate.toLocaleString()) : sdate.toLocaleString());
		}
	return (replaceTime ? replaceTime.replace('%1',sdate.toLocaleTimeString()) : sdate.toLocaleTimeString());
}

/**
 * Calculate scrollbar width
 * @return {Integer} width of scrollbar
 * 
 * http://www.alexandre-gomes.com/?p=115
 * 
 */
var getScrollbarWidth = function() {
	
	var inner = document.createElement('p');  
    inner.style.width = "100%"; 
    inner.style.height = "200px";  
  
    var outer = document.createElement('div');  
    outer.style.position = "absolute";  
    outer.style.top = "0px";  
    outer.style.left = "0px";  
    outer.style.visibility = "hidden";  
    outer.style.width = "200px";  
    outer.style.height = "150px";  
    outer.style.overflow = "hidden";  
    outer.appendChild (inner);  
  
    document.body.appendChild (outer);  
    var w1 = inner.offsetWidth;  
    outer.style.overflow = 'scroll';  
    var w2 = inner.offsetWidth;  
    if (w1 == w2) w2 = outer.clientWidth;  
  
    document.body.removeChild (outer);  
  
    return (w1 - w2);  
	    
};

/**
 * Returns the result of case-insensitive string comparison using 'natural' algorithm comparing str1 to str2
 * @param {String} str1 - 1st string
 * @param {String} str2 - 2nd string
 * @return {Integer} integer for use in list sorting comparison
 */
function strnatcasecmp(str1, str2) {
    // Returns the result of case-insensitive string comparison using 'natural' algorithm  
    // 
    // version: 1004.2314
    // discuss at: http://phpjs.org/functions/strnatcasecmp    // +      original by: Martin Pool
    // + reimplemented by: Pierre-Luc Paour
    // + reimplemented by: Kristof Coomans (SCK-CEN (Belgian Nucleair Research Centre))
    // + reimplemented by: Brett Zamir (http://brett-zamir.me)
    // +      bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)    // *     example 1: strnatcasecmp(10, 1);
    // *     returns 1: 1
    // *     example 1: strnatcasecmp('1', '10');
    // *     returns 1: -1
    var a = (str1+'').toLowerCase();    var b = (str2+'').toLowerCase();
 
    var isWhitespaceChar = function (a) {
        return a.charCodeAt(0) <= 32;
    }; 
    var isDigitChar = function (a) {
        var charCode = a.charCodeAt(0);
        return ( charCode >= 48  && charCode <= 57 );
    }; 
    var compareRight = function (a,b) {
        var bias = 0;
        var ia = 0;
        var ib = 0; 
        var ca;
        var cb;
 
        // The longest run of digits wins.  That aside, the greatest        // value wins, but we can't know that it will until we've scanned
        // both numbers to know that they have the same magnitude, so we
        // remember it in BIAS.
        for (;; ia++, ib++) {
            ca = a.charAt(ia);            cb = b.charAt(ib);
 
            if (!isDigitChar(ca) &&
                !isDigitChar(cb)) {
                return bias;            } else if (!isDigitChar(ca)) {
                return -1;
            } else if (!isDigitChar(cb)) {
                return +1;
            } else if (ca < cb) {                if (bias == 0) {
                    bias = -1;
                }
            } else if (ca > cb) {
                if (bias == 0) {                    bias = +1;
                }
            } else if (ca == 0 && cb == 0) {
                return bias;
            }        }
    };
 
    var ia = 0, ib = 0;
    var nza = 0, nzb = 0;    var ca, cb;
    var result;
 
    while (true) {
        // only count the number of zeroes leading the last number compared        nza = nzb = 0;
 
        ca = a.charAt(ia);
        cb = b.charAt(ib);
         // skip over leading spaces or zeros
        while (isWhitespaceChar( ca ) || ca =='0') {
            if (ca == '0') {
                nza++;
            } else {                // only count consecutive zeroes
                nza = 0;
            }
 
            ca = a.charAt(++ia);        }
 
        while (isWhitespaceChar( cb ) || cb == '0') {
            if (cb == '0') {
                nzb++;            } else {
                // only count consecutive zeroes
                nzb = 0;
            }
             cb = b.charAt(++ib);
        }
 
        // process run of digits
        if (isDigitChar(ca) && isDigitChar(cb)) {            if ((result = compareRight(a.substring(ia), b.substring(ib))) != 0) {
                return result;
            }
        }
         if (ca == 0 && cb == 0) {
            // The strings compare the same.  Perhaps the caller
            // will want to call strcmp to break the tie.
            return nza - nzb;
        } 
        if (ca < cb) {
            return -1;
        } else if (ca > cb) {
            return +1;        }
 
        ++ia; ++ib;
    }
}

/** Filter prototype for older browsers
 * https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/filter
 */
if (!Array.prototype.filter)
{
  Array.prototype.filter = function(fun /*, thisp */)
  {
    "use strict";
 
    if (this == null)
      throw new TypeError();
 
    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun != "function")
      throw new TypeError();
 
    var res = [];
    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if (i in t)
      {
        var val = t[i]; // in case fun mutates this
        if (fun.call(thisp, val, i, t))
          res.push(val);
      }
    }
 
    return res;
  };
}

$(document).ready(function() {

	// Don't unload while progress operation is .. in progress
	window.onbeforeunload = vboxOpInProgressCheck;

});