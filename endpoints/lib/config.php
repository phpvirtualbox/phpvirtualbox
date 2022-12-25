<?php
/**
 * phpVirtualBox configuration class. Parses user configuration, applies
 * defaults, and sanitizes user values.
 *
 * @author Ian Moore (imoore76 at yahoo dot com)
 * @copyright Copyright (C) 2010-2015 Ian Moore (imoore76 at yahoo dot com)
 * @version $Id: config.php 595 2015-04-17 09:50:36Z imoore76 $
 * @package phpVirtualBox
 * @see config.php-example
 *
*/

/*
 * This version of phpVirtualBox
 */
define('PHPVBOX_VER', '7.0-0');

class phpVBoxConfigClass {

	/* DEFAULTS */

	/**
	 * Default language
	 * @var string
	 */
	var $language = 'en';

	/**
	 * Exclusively use phpVirtualBox groups rather than
	 * VirtualBox groups
	 */
	var $phpVboxGroups = false;

	/**
	 * Preview screen width
	 * @var integer
	 */
	var $previewWidth = 180;

	/**
	 * Aspect ratio of preview screen
	 * @var float
	 */
	var $previewAspectRatio = 1.6;

	/**
	 * Allow users to delete media when it is removed
	 * @var boolean
	 */
	var $deleteOnRemove = true;

	/**
	 * Restrict file / folder browsers to files ending in extensions found in this array
	 * @var array
	 */
	var $browserRestrictFiles = array('.iso','.vdi','.vmdk','.img','.bin','.vhd','.hdd','.ovf','.ova','.xml','.vbox','.cdr','.dmg','.ima','.dsk','.vfd');

	/**
	 * Force file / folder browser to use local PHP functions rather than VirtualBox's IVFSExplorer.
	 * If this is set to true, the assumption is made that the web server is on the same host as VirtualBox.
	 * @var boolean
	 */
	var $browserLocal = false;

	/**
	 * List of console resolutions available on console tab
	 * @var array
	 */
	var $consoleResolutions = array('640x480','800x600','1024x768','1280x720','1440x900');

	/**
	 * Maximum number of NICs displayed per VM
	 * @var integer
	 */
	var $nicMax = 4;

	/**
	 * Max number of operations to keep in progress list
	 * @var integer
	 */
	var $maxProgressList = 5;

	/**
	 * Enable custom icon per VM
	 * @var boolean
	 */
	var $enableCustomIcons = false;

	/**
	 * true if there is no user supplied config.php found.
	 * @var boolean
	 */
	var $warnDefault = false;

	/**
	 * Set the standard VRDE port number range to be used when
	 * creating new VMs
	 * @var string
	 */
	var $vrdeports = '9000-9100';

	/**
	 * Key used to uniquely identify the current server in this
	 * instantiation of phpVBoxConfigClass.
	 * Set in __construct()
	 * @var string
	 */
	var $key = null;

	/**
	 * Auth library object instance. See lib/auth for classes.
	 * Set in __construct() based on authLib config setting value.
	 * @var phpvbAuth
	 */
	var $auth = null;

	/**
	 * Enable VirtualBox start / stop configuration.
	 * Only available in Linux (I beleive)
	 * @var boolean
	 */
	var $vboxAutostartConfig = false;

	/**
	 * Authentication capabilities provided by authentication module.
	 * Set in __construct
	 * @var phpvbAuthBuiltin::authCapabilities
	 */
	var $authCapabilities = null;

	/**
	 * Configuration passed to authentication module
	 * @var array
	 */
	var $authConfig = array();

	/**
	 * Event listener timeout in seconds.
	 * @var integer
	 */
	var $eventListenerTimeout = 20;

	/**
	 * Read user configuration, apply defaults, and do some sanity checking
	 * @see vboxconnector
	 */
	function __construct() {

		@include_once(dirname(dirname(dirname(__FILE__))).'/config.php');

		$ep = error_reporting(0);

		/* Apply object vars of configuration class to this class */
		if(class_exists('phpVBoxConfig')) {
			$c = new phpVBoxConfig();
			foreach(get_object_vars($c) as $k => $v) {
				// Safety checks
				if($k == 'browserRestrictFiles' && !is_array($v)) continue;
				if($k == 'consoleResolutions' && !is_array($v)) continue;
				if($k == 'browserRestrictFolders' && !is_array($v)) continue;
				$this->$k = $v;
			}

		/* User config.php does not exist. Send warning */
		} else {
			$this->warnDefault = true;
		}

		// Ignore any server settings if we have servers
		// in the servers array
		if(isset($this->servers) && is_array($this->servers) && count($this->servers) && is_array($this->servers[0])) {
			unset($this->location);
			unset($this->user);
			unset($this->pass);
		}
		// Set to selected server based on browser cookie
		if(isset($_COOKIE['vboxServer']) && isset($this->servers) && is_array($this->servers) && count($this->servers)) {
			foreach($this->servers as $s) {
				if($s['name'] == $_COOKIE['vboxServer']) {
					foreach($s as $k=>$v) $this->$k = $v;
					break;
				}
			}
		// If servers is not an array, set to empty array
		} elseif(!isset($this->servers) || !is_array($this->servers)) {
			$this->servers = array();
		}
		// We still have no server set, use the first one from
		// the servers array
		if(empty($this->location) && count($this->servers)) {
			foreach($this->servers[0] as $k=>$v) $this->$k = $v;
		}
		// Make sure name is set
		if(!isset($this->name) || !$this->name) {
			$this->name = parse_url($this->location);
			$this->name = $this->name['host'];
		}

		// Key used to uniquely identify this server in this
		// phpvirtualbox installation
		$this->setKey();

		// legacy rdpHost setting
		if(!empty($this->rdpHost) && empty($this->consoleHost))
			$this->consoleHost = $this->rdpHost;

		// Ensure authlib is set
		if(empty($this->authLib)) $this->authLib = 'Builtin';
		// include interface
		include_once(dirname(__FILE__).'/authinterface.php');
		include_once(dirname(__FILE__).'/auth/'.str_replace(array('.','/','\\'),'',$this->authLib).'.php');

		// Check for session functionality
		if(!function_exists('session_start')) $this->noAuth = true;

		$alib = "phpvbAuth{$this->authLib}";
		$this->auth = new $alib(@$this->authConfig);
		$this->authCapabilities = $this->auth->capabilities;

		/* Sanity checks */
		if(!@$this->nicMax)
			$this->nicMax = 4;

		$this->previewUpdateInterval = max(3, @$this->previewUpdateInterval);

		error_reporting($ep);
	}

	/**
	 * Set VirtualBox server to use
	 * @param string $server server from config.php $servers array
	 */
	function setServer($server) {
		// do nothing if we are already using this server
		if($server == $this->name) return;
		foreach($this->servers as $s) {
			if($s['name'] == $server) {
				foreach($s as $k=>$v) $this->$k = $v;
				$this->setKey();
				break;
			}
		}
	}

	/**
	 * Generate a key for current server settings and populate $this->key
	 */
	function setKey() {
		$this->key = md5($this->location);
	}

	/**
	 * Return the name of the server marked as the authentication master
	 * @return string name of server marked as authMaster
	 */
	function getServerAuthMaster() {
		foreach($this->servers as $s) {
			if($s['authMaster']) {
				return $s['name'];
			}
		}
		return @$this->servers[0]['name'];
	}

}



