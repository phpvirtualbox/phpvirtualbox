<?php
/**
 * Virtual machine PNG screenshot generation
 * 
 * @author Ian Moore (imoore76 at yahoo dot com)
 * @copyright Copyright (C) 2010-2015 Ian Moore (imoore76 at yahoo dot com)
 * @version $Id: screen.php 591 2015-04-11 22:40:47Z imoore76 $
 * @package phpVirtualBox
 * 
 */

# Turn off PHP notices
error_reporting(E_ALL & ~E_NOTICE & ~E_STRICT & ~E_WARNING);

require_once(dirname(__FILE__).'/lib/config.php');
require_once(dirname(__FILE__).'/lib/utils.php');
require_once(dirname(__FILE__).'/lib/vboxconnector.php');


// Allow caching of some screenshot data
@Header('ETag: "' . $_REQUEST['vm'].'_'.$_REQUEST['randid'].'"');
session_cache_limiter('private_no_expire');

// Check for valid session
global $_SESSION;
session_init();
if(!@$_SESSION['valid']) {
	return;	
}

// Clean request
$_REQUEST = array_merge(@$_GET,@$_POST);

$settings = new phpVBoxConfigClass();
$vbox = new vboxconnector();
$vbox->connect();

// Set width. Else assume we want real time updates if VM is running below
if($_REQUEST['width']) {
	$force_width = $_REQUEST['width'];
}

try {

	// Is VM Specified
	if(!$_REQUEST['vm']) {
		echo("Please specify a VM to take a screen shot of. E.g. http://webserver/phpvirtualbox/screen.php?vm=VMName");
		exit;
	}

	$machine = $vbox->vbox->findMachine($_REQUEST['vm']);
	
	// Is snapshot specified?
	if($_REQUEST['snapshot']) {
		
		$snapshot = $machine->findSnapshot($_REQUEST['snapshot']);
		$machine->releaseRemote();
		$machine = &$snapshot->machine;
		
	} else {

		// Get machine state
		switch($machine->state->__toString()) {
			case 'Running':
			case 'Saved':
			case 'Restoring':
				break;
			default:
				$machine->releaseRemote();
				throw new Exception('The specified virtual machine is not in a Running state.');
		}

	}
	
	// Date last modified
	$dlm = floor($machine->lastStateChange/1000);

	// Set last modified header
	header("Last-Modified: " . gmdate("D, d M Y H:i:s", $dlm) . " GMT");

	$_REQUEST['vm'] = $machine->id;



	// Take active screenshot if machine is running
	if(!$_REQUEST['snapshot'] && $machine->state->__toString() == 'Running') {

		// Let the browser cache images for 3 seconds
		$ctime = 0;
		if(strpos($_SERVER['HTTP_IF_NONE_MATCH'],'_')) {
			$ctime = preg_replace("/.*_/",str_replace('"','',$_SERVER['HTTP_IF_NONE_MATCH']));
		} else if(strpos($_ENV['HTTP_IF_NONE_MATCH'],'_')) {
			$ctime = preg_replace("/.*_/",str_replace('"','',$_ENV['HTTP_IF_NONE_MATCH']));
		} else if(strpos($_SERVER['HTTP_IF_MODIFIED_SINCE'],'GMT')) {
			$ctime = strtotime($_SERVER['HTTP_IF_MODIFIED_SINCE']);
		} else if(strpos($_ENV['HTTP_IF_MODIFIED_SINCE'],'GMT')) {
			$ctime = strtotime($_ENV['HTTP_IF_MODIFIED_SINCE']);
		}
		
    	if($ctime >= (time()-3)) {
			if (strpos(strtolower(php_sapi_name()),'cgi') !== false) {
				Header("Status: 304 Not Modified");
			} else {
				Header("HTTP/1.0 304 Not Modified");
			}
      		exit;
    	}
		

    	header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT");
    	
		$vbox->session = $vbox->websessionManager->getSessionObject($vbox->vbox->handle);
		$machine->lockMachine($vbox->session->handle,'Shared');
		$machine->releaseRemote();
		
		
		$res = $vbox->session->console->display->getScreenResolution(0);
		
		$screenWidth = array_shift($res);
	    $screenHeight = array_shift($res);
	    

	    // Force screenshot width while maintaining aspect ratio
	    if($force_width) {

			$factor  = (float)$force_width / (float)$screenWidth;

			$screenWidth = $force_width;
			if($factor > 0) {
				$screenHeight = $factor * $screenHeight;
			} else {
				$screenHeight = ($screenWidth * 9.0/16.0);
			}

		// If no width is set, we were reached from Open in New Window
	    } else if(!$_REQUEST['width']) {

			//Set no caching
			header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
			header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT");
			header("Cache-Control: no-store, no-cache, must-revalidate, post-check=0, pre-check=0");
			
	    }

	    // If we were unable to get screen dimensions, set it to something
	    if(!$screenWidth || !$screenHeight) {
	    	$screenWidth = 640;
	    	$screenHeight = 480;
	    }
		// array() for compatibility with readSavedScreenshotPNGToArray return value
		try {
			$imageraw = array($vbox->session->console->display->takeScreenShotToArray(0, $screenWidth, $screenHeight, 'PNG'));
		} catch (Exception $e) {
			// For some reason this is required or you get "Could not take a screenshot (VERR_TRY_AGAIN)" in some cases.
			// I think it's a bug in the Linux guest additions, but cannot prove it.
			$vbox->session->console->display->invalidateAndUpdate();
			$imageraw = array($vbox->session->console->display->takeScreenShotToArray(0, $screenWidth, $screenHeight, 'PNG'));
		}

		$vbox->session->unlockMachine();
		$vbox->session->releaseRemote();
		
	} else {

		// Let the browser cache saved state images
		$ctime = 0;
		if(strpos($_SERVER['HTTP_IF_NONE_MATCH'],'_')) {
			$ctime = preg_replace("/.*_/",str_replace('"','',$_SERVER['HTTP_IF_NONE_MATCH']));
		} else if(strpos($_ENV['HTTP_IF_NONE_MATCH'],'_')) {
			$ctime = preg_replace("/.*_/",str_replace('"','',$_ENV['HTTP_IF_NONE_MATCH']));
		} else if(strpos($_SERVER['HTTP_IF_MODIFIED_SINCE'],'GMT')) {
			$ctime = strtotime($_SERVER['HTTP_IF_MODIFIED_SINCE']);
		} else if(strpos($_ENV['HTTP_IF_MODIFIED_SINCE'],'GMT')) {
			$ctime = strtotime($_ENV['HTTP_IF_MODIFIED_SINCE']);
		}
		
    	if($dlm <= $ctime) {
			if (strpos(strtolower(php_sapi_name()),'cgi') !== false) {
				Header("Status: 304 Not Modified");
			} else {
				Header("HTTP/1.0 304 Not Modified");
			}
      		exit;
    	}
		
	
    	if($_REQUEST['full']) $imageraw = $machine->readSavedScreenshotPNGToArray(0);
    	else $imageraw = $machine->readSavedThumbnailToArray(0, 'PNG');
			
		$machine->releaseRemote();

	}
	$vbox->session = null;

	header("Content-type: image/png",true);

	foreach($imageraw as $i) {
		if(is_array($i)) echo(base64_decode($i[0]));
	}


} catch (Exception $ex) {

	// Ensure we close the VM Session if we hit a error, ensure we don't have a aborted VM
	if($vbox && $vbox->session && $vbox->session->handle) {
		try {
			$vbox->session->unlockMachine();
			unset($vbox->session);
		} catch (Exception $e) {
		}
	}

	if($_REQUEST['full'] && strpos($ex->faultstring,'VERR_NOT_SUPPORTED') > 0) {
		@header("Content-type: text/html");
		echo("Screen shots are not supported by your VirtualBox installation. To enable screen shots, please install a VirtualBox exteionsion pack that supports VRDE ");
		echo("such as the Oracle VM VirtualBox Extension Pack found in the Downloads section of <a href='http://www.virtualbox.org'>http://www.virtualbox.org</a>.");
	} else if($_REQUEST['full'] || $_REQUEST['debug']) {
		header("Content-type: text/html", true);
		echo("<pre>");
		print_r($ex);
		echo("</pre>");
	}
}

