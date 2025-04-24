<?php
/**
 *
 * Connects to vboxwebsrv, calls SOAP methods, and returns data.
 *
 * @author Ian Moore (imoore76 at yahoo dot com)
 * @copyright Copyright (C) 2010-2015 Ian Moore (imoore76 at yahoo dot com)
 * @version $Id: vboxconnector.php 599 2015-07-27 10:40:37Z imoore76 $
 * @package phpVirtualBox
 *
 */

#[AllowDynamicProperties]
class vboxconnector {

	/**
	 * Error with safe HTML
	 * @var integer
	 */
	const PHPVB_ERRNO_HTML = 1;

	/**
	 * Error number describing a fatal error
	 * @var integer
	 */
	const PHPVB_ERRNO_FATAL = 32;

	/**
	 * Error number describing a connection error
	 * @var integer
	 */
	const PHPVB_ERRNO_CONNECT = 64;

	/**
	 * phpVirtualBox groups extra value key
	 * @var string
	 */
	const phpVboxGroupKey = 'phpvb/Groups';

	/**
	 * Holds any errors that occur during processing. Errors are placed in here
	 * when we want calling functions to be aware of the error, but do not want to
	 * halt processing
	 *
	 * @var array
	 */
	var $errors = array();

	/**
	 * Holds any debug messages
	 *
	 * @var array
	 */
	var $messages = array();

	/**
	 * Settings object
	 * @var phpVBoxConfigClass
	 * @see phpVBoxConfigClass
	 */
	var $settings = null;

	/**
	 * true if connected to vboxwebsrv
	 * @var boolean
	 */
	var $connected = false;

	/**
	 * IVirtualBox instance
	 * @var IVirtualBox
	 */
	var $vbox = null;

	/**
	 * VirtualBox web session manager
	 * @var IWebsessionManager
	 */
	var $websessionManager = null;

	/**
	 * Holds IWebsessionManager session object if created
	 * during processing so that it can be properly shutdown
	 * in __destruct
	 * @var ISession
	 * @see vboxconnector::__destruct()
	 */
	var $session = null;

	/**
	 * Holds VirtualBox version information
	 * @var array
	 */
	var $version = null;

	/**
	 * If true, vboxconnector will not verify that there is a valid
	 * (PHP) session before connecting.
	 * @var boolean
	 */
	var $skipSessionCheck = false;

	/**
	 * Holds items that should persist accross requests
	 * @var array
	 */
	var $persistentRequest = array();

	/**
	 * Holds VirtualBox host OS specific directory separator set by getDSep()
	 * @var string
	 * @see vboxconnector::getDsep()
	 */
	var $dsep = null;

	/**
	 * Obtain configuration settings and set object vars
	 * @param boolean $useAuthMaster use the authentication master obtained from configuration class
	 * @see phpVBoxConfigClass
	 */
	public function __construct($useAuthMaster = false) {

		require_once(dirname(__FILE__).'/language.php');
		require_once(dirname(__FILE__).'/vboxServiceWrappers.php');

		/* Set up.. .. settings */

		/** @var phpVBoxConfigClass */
		$this->settings = new phpVBoxConfigClass();

		// Are default settings being used?
		if(@$this->settings->warnDefault) {
			throw new Exception("No configuration found. Rename the file <b>config.php-example</b> in phpVirtualBox's folder to ".
					"<b>config.php</b> and edit as needed.<p>For more detailed instructions, please see the installation wiki on ".
					"phpVirtualBox's web site. <p><a href='https://github.com/phpvirtualbox/phpvirtualbox/wiki' target=_blank>".
					"https://github.com/phpvirtualbox/phpvirtualbox/wiki</a>.</p>",
						(vboxconnector::PHPVB_ERRNO_FATAL + vboxconnector::PHPVB_ERRNO_HTML));
		}

		// Check for SoapClient class
		if(!class_exists('SoapClient')) {
			throw new Exception('PHP does not have the SOAP extension enabled.',vboxconnector::PHPVB_ERRNO_FATAL);
		}

		// use authentication master server?
		if(@$useAuthMaster) {
			$this->settings->setServer($this->settings->getServerAuthMaster());
		}

	}

	/**
	 * Connect to vboxwebsrv
	 * @see SoapClient
	 * @see phpVBoxConfigClass
	 * @return boolean true on success or if already connected
	 */
	public function connect() {

		// Already connected?
		if(@$this->connected)
			return true;

		// Valid session?
		if(!@$this->skipSessionCheck && !$_SESSION['valid']) {
			throw new Exception(trans('Not logged in.','UIUsers'),vboxconnector::PHPVB_ERRNO_FATAL);
		}

		// Persistent server?
		if(@$this->persistentRequest['vboxServer']) {
			$this->settings->setServer($this->persistentRequest['vboxServer']);
		}

		//Connect to webservice
		$pvbxver = substr(@constant('PHPVBOX_VER'),0,(strpos(@constant('PHPVBOX_VER'),'-')));
		$this->client = new SoapClient(dirname(__FILE__)."/vboxwebService-".$pvbxver.".wsdl",
		    array(
		    	'features' => (SOAP_USE_XSI_ARRAY_TYPE + SOAP_SINGLE_ELEMENT_ARRAYS),
		        'cache_wsdl' => WSDL_CACHE_BOTH,
		        'trace' => (@$this->settings->debugSoap),
				'connection_timeout' => (@$this->settings->connectionTimeout ? $this->settings->connectionTimeout : 20),
		        'location' => @$this->settings->location
		    ));


		// Persistent handles?
		if(@$this->persistentRequest['vboxHandle']) {

			try {

				// Check for existing sessioin
				$this->websessionManager = new IWebsessionManager($this->client);
				$this->vbox = new IVirtualBox($this->client, $this->persistentRequest['vboxHandle']);

				// force valid vbox check
				$ev = $this->vbox->eventSource;

				if($this->vbox->handle)
					return ($this->connected = true);


			} catch (Exception $e) {
				// nothing. Fall through to new login.

			}
		}

		/* Try / catch / throw here hides login credentials from exception if one is thrown */
		try {
			$this->websessionManager = new IWebsessionManager($this->client);
			$this->vbox = $this->websessionManager->logon($this->settings->username,$this->settings->password);


		} catch (Exception $e) {

			if(!($msg = $e->getMessage()))
				$msg = 'Error logging in to vboxwebsrv.';
			else
				$msg .= " ({$this->settings->location})";

			throw new Exception($msg,vboxconnector::PHPVB_ERRNO_CONNECT);
		}


		// Error logging in
		if(!$this->vbox->handle) {
			throw new Exception('Error logging in or connecting to vboxwebsrv.',vboxconnector::PHPVB_ERRNO_CONNECT);
		}

		// Hold handle
		if(array_key_exists('vboxHandle',$this->persistentRequest)) {
			$this->persistentRequest['vboxHandle'] = $this->vbox->handle;
		}

		return ($this->connected = true);

	}


	/**
	 * Get VirtualBox version
	 * @return array version information
	 */
	public function getVersion() {

		if(!@$this->version) {

			$this->connect();

			$this->version = explode('.',$this->vbox->version);
			$this->version = array(
				'ose' => (stripos($this->version[2],'ose') > 0),
				'string' => join('.',$this->version),
				'major' => intval(array_shift($this->version)),
				'minor' => intval(array_shift($this->version)),
				'sub' => intval(array_shift($this->version)),
				'revision' => (string)$this->vbox->revision,
				'settingsFilePath' => $this->vbox->settingsFilePath
			);
		}

		return $this->version;

	}

	/**
	 *
	 * Log out of vboxwebsrv
	 */
	public function __destruct() {

		// Do not logout if there are persistent handles
		if($this->connected && @$this->vbox->handle && !array_key_exists('vboxHandle' ,$this->persistentRequest)) {

			// Failsafe to close session
			if(@$this->session && @(string)$this->session->state == 'Locked') {
				try {$this->session->unlockMachine();}
				catch (Exception $e) { }
			}

			// Logoff
			if($this->vbox->handle)
				$this->websessionManager->logoff($this->vbox->handle);

		}

		unset($this->client);
	}

	/**
	 * Add a machine event listener to the listener list
	 *
	 * @param string $vm id of virtual machine to subscribe to
	 */
	private function _machineSubscribeEvents($vm) {

		// Check for existing listener
		if($this->persistentRequest['vboxEventListeners'][$vm]) {

			try {

				$listener = new IEventListener($this->client, $this->persistentRequest['vboxEventListeners'][$vm]['listener']);
				$source = new IEventSource($this->client, $this->persistentRequest['vboxEventListeners'][$vm]['source']);

				$source->unregisterListener($listener);

				$listener->releaseRemote();
				$source->releaseRemote();

			} catch (Exception $e) {
				// Pass
			}
		}

		try {

			/* @var $machine IMachine */
			$machine = $this->vbox->findMachine($vm);

			/* Ignore if not running */
			$state = (string)$machine->state;
			if($state != 'Running' && $state != 'Paused') {
				$machine->releaseRemote();
				return;
			}

			$this->session = $this->websessionManager->getSessionObject($this->vbox->handle);
			$machine->lockMachine($this->session->handle, 'Shared');

			// Create and register event listener
			$listener = $this->session->console->eventSource->createListener();
			$this->session->console->eventSource->registerListener($listener,array('Any'), false);

			// Add to event listener list
			$this->persistentRequest['vboxEventListeners'][$vm] = array(
					'listener' => $listener->handle,
					'source' => $this->session->console->eventSource->handle);


			$machine->releaseRemote();

		} catch (Exception $e) {
			// pass
		}

		if($this->session) {
			try {
				$this->session->unlockMachine();
			} catch (Exception $e) {
				// pass
			}
			unset($this->session);
		}

		// Machine events before vbox events. This is in place to handle the "DrvVD_DEKMISSING"
		// IRuntimeErrorEvent which tells us that a medium attached to a VM requires a password.
		// This event needs to be presented to the client before the VM state change. This way
		// the client can track whether or not the runtime error occurred in response to its
		// startup request because the machine's RunTimeError will occur before vbox's
		// StateChange.
		uksort($this->persistentRequest['vboxEventListeners'], function($a, $b){
		    if($a == 'vbox') return 1;
		    if($b == 'vbox') return -1;
		    return 0;
		});

	}

	/**
	 * Get pending vbox and machine events
	 *
	 * @param array $args array of arguments. See function body for details.
	 * @return array list of events
	 */
	public function remote_getEvents($args) {

		$this->connect();

		$eventlist = array();

		// This should be an array
		if(!is_array($this->persistentRequest['vboxEventListeners'])) {

				$this->persistentRequest['vboxEventListeners'] = array();
				$listenerWait = 1000;

		} else {

			// The amount of time we will wait for events is determined by
			// the amount of listeners - at least half a second
			$listenerWait = max(100,intval(500/count($this->persistentRequest['vboxEventListeners'])));
		}

		// Get events from each configured event listener
		foreach($this->persistentRequest['vboxEventListeners'] as $k => $el) {

			try {

				$listener = new IEventListener($this->client, $el['listener']);
				$source = new IEventSource($this->client, $el['source']);

				$event = $source->getEvent($listener,$listenerWait);

				try {

					while($event->handle) {

						$eventData = $this->_getEventData($event, $k);
						$source->eventProcessed($listener, $event);
						$event->releaseRemote();


						// Only keep the last event of one particular type
						//$eventlist[$eventData['dedupId']] = $eventData;

						if($eventData)
						    $eventlist[$eventData['dedupId']] = $eventData;

						$event = $source->getEvent($listener,100);
					}

				} catch (Exception $e) {

					$this->errors[] = $e;

				}

			} catch (Exception $e) {

				// Machine powered off or client has stale MO reference
				if($listener)
					try { $listener->releaseRemote(); } catch (Exception $e) {
						/// pass
					}
				if($source)
					try { $source->releaseRemote(); } catch (Exception $e) {
						// pass
					}

				// Remove listener from list
				unset($this->persistentRequest['vboxEventListeners'][$k]);

			}

		}

		// Enrich events
		foreach($eventlist as $k=>$event) {

			switch($event['eventType']) {

				/* Network adapter changed */
				case 'OnNetworkAdapterChanged':

					try {

						$machine = $this->vbox->findMachine($event['sourceId']);
						$this->session = $this->websessionManager->getSessionObject($this->vbox->handle);

						// Session locked?
						if((string)$this->session->state != 'Unlocked')
							$this->session->unlockMachine();

						$machine->lockMachine($this->session->handle, 'Shared');

						try {

							list($eventlist[$k]['enrichmentData']) = $this->_machineGetNetworkAdapters($this->session->machine, $event['networkAdapterSlot']);

						} catch (Exception $e) {
							// Just unlock the machine
							$eventlist[$k]['enrichmentData'] = array($e->getMessage());
						}

						$this->session->unlockMachine();
						$machine->releaseRemote();

					} catch (Exception $e) {
						$eventlist[$k]['enrichmentData'] = array($e->getMessage());
					}
					break;


				/* VRDE server changed */
				case 'OnVRDEServerChanged':
					try {

						$machine = $this->vbox->findMachine($event['sourceId']);
						$this->session = $this->websessionManager->getSessionObject($this->vbox->handle);

						// Session locked?
						if((string)$this->session->state != 'Unlocked')
							$this->session->unlockMachine();

						$machine->lockMachine($this->session->handle, 'Shared');
						$vrde = $this->session->machine->VRDEServer;

						try {
							$eventlist[$k]['enrichmentData'] = (!$vrde ? null : array(
								'enabled' => $vrde->enabled,
								'ports' => $vrde->getVRDEProperty('TCP/Ports'),
								'netAddress' => $vrde->getVRDEProperty('TCP/Address'),
								'VNCPassword' => $vrde->getVRDEProperty('VNCPassword'),
								'authType' => (string)$vrde->authType,
								'authTimeout' => $vrde->authTimeout
								)
							);
						} catch (Exception $e) {
							// Just unlock the machine
							$eventlist[$k]['enrichmentData'] = array($e->getMessage());
						}

						$this->session->unlockMachine();
						$machine->releaseRemote();

					} catch (Exception $e) {
						$eventlist[$k]['enrichmentData'] = array($e->getMessage());
					}
					break;



				/* VRDE server info changed. Just need port and enabled/disabled */
				case 'OnVRDEServerInfoChanged':
					try {

						$machine = $this->vbox->findMachine($event['sourceId']);
						$this->session = $this->websessionManager->getSessionObject($this->vbox->handle);

						// Session locked?
						if((string)$this->session->state != 'Unlocked')
							$this->session->unlockMachine();

						$machine->lockMachine($this->session->handle, 'Shared');

						try {
							$eventlist[$k]['enrichmentData'] = array(
									'port' => $this->session->console->VRDEServerInfo->port,
									'enabled' => $this->session->machine->VRDEServer->enabled
							);
						} catch (Exception $e) {
							// Just unlock the machine
							$eventlist[$k]['enrichmentData'] = array($e->getMessage());
						}

						$this->session->unlockMachine();
						$machine->releaseRemote();

					} catch (Exception $e) {
						$eventlist[$k]['enrichmentData'] = array($e->getMessage());
					}
					break;

				/* Machine registered */
				case 'OnMachineRegistered':

					if(!$event['registered']) break;

					// Get same data that is in VM list data
					$vmdata = $this->remote_vboxGetMachines(array('vm'=>$event['machineId']));
					$eventlist[$k]['enrichmentData'] = $vmdata[0];
					unset($vmdata);

					break;

				/* enrich with basic machine data */
				case 'OnMachineDataChanged':

					try {

						$machine = $this->vbox->findMachine($event['machineId']);

						if($this->settings->phpVboxGroups) {
							$groups = explode(',',$machine->getExtraData(vboxconnector::phpVboxGroupKey));
							if(!is_array($groups) || (count($groups) == 1 && !$groups[0])) $groups = array("/");
						} else {
							$groups = $machine->groups;
						}

						usort($groups, 'strnatcasecmp');

						$eventlist[$k]['enrichmentData'] = array(
								'id' => $event['machineId'],
								'name' => @$this->settings->enforceVMOwnership ? preg_replace('/^' . preg_quote($_SESSION['user']) . '_/', '', $machine->name) : $machine->name,
								'OSTypeId' => $machine->getOSTypeId(),
								'owner' => (@$this->settings->enforceVMOwnership ? $machine->getExtraData("phpvb/sso/owner") : ''),
								'groups' => $groups
						);
						$machine->releaseRemote();

					} catch (Exception $e) {
						// pass
					}
					break;

				/* Update lastStateChange on OnMachineStateChange events */
				case 'OnMachineStateChanged':
					try {

						$machine = $this->vbox->findMachine($event['machineId']);
						$eventlist[$k]['enrichmentData'] = array(
							'lastStateChange' => (string)($machine->lastStateChange/1000),
							'currentStateModified' => $machine->currentStateModified
						);
						$machine->releaseRemote();

					} catch (Exception $e) {
						$eventlist[$k]['enrichmentData'] = array('lastStateChange' => 0);
					}
					break;

				/* enrich with snapshot name and new snapshot count*/
				case 'OnSnapshotTaken':
				case 'OnSnapshotDeleted':
				case 'OnSnapshotRestored':
				case 'OnSnapshotChanged':

					try {
						$machine = $this->vbox->findMachine($event['machineId']);
						$eventlist[$k]['enrichmentData'] = array(
								'currentSnapshotName' => ($machine->currentSnapshot->handle ? $machine->currentSnapshot->name : ''),
								'snapshotCount' => $machine->snapshotCount,
								'currentStateModified' => $machine->currentStateModified
						);
						$machine->releaseRemote();

					} catch (Exception $e) {
						// pass
						$this->errors[] = $e;
					}
					break;

			}

		}

		return array_values($eventlist);

	}

	/**
	 * Subscribe to a single machine's events
	 *
	 * @param array $args array of arguments. See function body for details.
	 * @return boolean true on success
	 */
	public function remote_machineSubscribeEvents($args) {

		$this->connect();
		foreach($args['vms'] as $vm)
			$this->_machineSubscribeEvents($vm);

		return true;
	}

	/**
	 * Unsubscribe from vbox and machine events
	 *
	 * @param array $args array of arguments. See function body for details.
	 * @return boolean true on success
	 */
	public function remote_unsubscribeEvents($args) {

		$this->connect();

		if(!is_array($this->persistentRequest['vboxEventListeners']))
			$this->persistentRequest['vboxEventListeners'] = array();

		// Get events from each configured event listener
		foreach($this->persistentRequest['vboxEventListeners'] as $k => $el) {

			try {

				$listener = new IEventListener($this->client, $el['listener']);
				$source = new IEventSource($this->client, $el['source']);

				$source->unregisterListener($listener);

				$source->releaseRemote();
				$listener->releaseRemote();



			} catch (Exception $e) {
				$this->errors[] = $e;
			}

			$this->persistentRequest['vboxEventListeners'][$k] = null;

		}

		$this->websessionManager->logoff($this->vbox->handle);
		unset($this->vbox);

		return true;
	}

	/**
	 * Subscribe to vbox and machine events
	 *
	 * @param array $args array of arguments. See function body for details.
	 * @return boolean true on success
	 */
	public function remote_subscribeEvents($args) {

		$this->connect();

		// Check for existing listener
		if($this->persistentRequest['vboxEventListeners']['vbox']) {

			try {

				$listener = new IEventListener($this->client, $this->persistentRequest['vboxEventListeners']['vbox']['listener']);
				$source = new IEventSource($this->client, $this->persistentRequest['vboxEventListeners']['vbox']['source']);

				$source->unregisterListener($listener);

				$listener->releaseRemote();
				$source->releaseRemote();

			} catch (Exception $e) {
				// Pass
			}
		}

		// Create and register event listener
		$listener = $this->vbox->eventSource->createListener();
		$this->vbox->eventSource->registerListener($listener,array('MachineEvent', 'SnapshotEvent', 'OnMediumRegistered', 'OnExtraDataChanged', 'OnSnapshotRestored'), false);

		// Add to event listener list
		$this->persistentRequest['vboxEventListeners']['vbox'] = array(
			'listener' => $listener->handle,
			'source' => $this->vbox->eventSource->handle);

		// Subscribe to each machine in list
		foreach($args['vms'] as $vm) {
			$this->_machineSubscribeEvents($vm);
		}

		$this->persistentRequest['vboxHandle'] = $this->vbox->handle;

		return true;

	}

	/**
	 * Return relevant event data for the event.
	 *
	 * @param IEvent $event
	 * @param String $listenerKey Key of event listener - 'vbox' or
	 * 		machine id
	 * @return array associative array of event attributes
	 */
	private function _getEventData($event, $listenerKey) {

		$data = array('eventType'=>(string)$event->type,'sourceId'=>$listenerKey);

		// Convert to parent class
		$parentClass = 'I'.substr($data['eventType'],2).'Event';
		$eventDataObject = new $parentClass($this->client, $event->handle);

		// Dedup ID is at least listener key ('vbox' or machine id) and event type
		$data['dedupId'] = $listenerKey.'-'.$data['eventType'];

		switch($data['eventType']) {

			case 'OnMachineStateChanged':
				$data['machineId'] = $eventDataObject->machineId;
				$data['state'] = (string)$eventDataObject->state;
				$data['dedupId'] .= '-'. $data['machineId'];
		        break;

			case 'OnMachineDataChanged':
		        $data['machineId'] = $eventDataObject->machineId;
		        $data['dedupId'] .= '-'. $data['machineId'];
		        break;

	        case 'OnExtraDataCanChange':
			case 'OnExtraDataChanged':
		        $data['machineId'] = $eventDataObject->machineId;
		        $data['key'] = $eventDataObject->key;
		        $data['value'] = $eventDataObject->value;
		        $data['dedupId'] .= '-'. $data['machineId'] .'-' . $data['key'];
		        break;

			case 'OnMediumRegistered':
				$data['machineId'] = $data['sourceId'];
		        $data['mediumId'] = $eventDataObject->mediumId;
		        $data['registered'] = $eventDataObject->registered;
		        $data['dedupId'] .= '-'. $data['mediumId'];
		        break;

			case 'OnMachineRegistered':
		        $data['machineId'] = $eventDataObject->machineId;
		        $data['registered'] = $eventDataObject->registered;
		        $data['dedupId'] .= '-'. $data['machineId'];
		        break;

			case 'OnSessionStateChanged':
				$data['machineId'] = $eventDataObject->machineId;
				$data['state'] = (string)$eventDataObject->state;
				$data['dedupId'] .= '-'. $data['machineId'];
		        break;

		    /* Snapshot events */
			case 'OnSnapshotTaken':
			case 'OnSnapshotDeleted':
			case 'OnSnapshotRestored':
			case 'OnSnapshotChanged':
				$data['machineId'] = $eventDataObject->machineId;
				$data['snapshotId'] = $eventDataObject->snapshotId;
				$data['dedupId'] .= '-'. $data['machineId'] .'-' . $data['snapshotId'];
		        break;

			case 'OnGuestPropertyChanged':
				$data['machineId'] = $eventDataObject->machineId;
				$data['name'] = $eventDataObject->name;
				$data['value'] = $eventDataObject->value;
				$data['flags'] = $eventDataObject->flags;
				$data['dedupId'] .= '-'. $data['machineId'] .'-' . $data['name'];
		        break;

			case 'OnCPUChanged':
				$data['machineId'] = $data['sourceId'];
				$data['cpu'] = $eventDataObject->cpu;
				$data['add'] = $eventDataObject->add;
				$data['dedupId'] .= '-' . $data['cpu'];
				break;

			/* Same end-result as network adapter changed */
			case 'OnNATRedirect':
				$data['machineId'] = $data['sourceId'];
				$data['eventType'] = 'OnNetworkAdapterChanged';
				$data['networkAdapterSlot'] = $eventDataObject->slot;
				$data['dedupId'] = $listenerKey .'-OnNetworkAdapterChanged-'. $data['networkAdapterSlot'];
				break;

			case 'OnNetworkAdapterChanged':
				$data['machineId'] = $data['sourceId'];
		        $data['networkAdapterSlot'] = $eventDataObject->networkAdapter->slot;
		        $data['dedupId'] .= '-'. $data['networkAdapterSlot'];
		        break;

	        /* Storage controller of VM changed */
	        case 'OnStorageControllerChanged':
	        	$data['machineId'] = $eventDataObject->machineId;
	        	$data['dedupId'] .= '-'. $data['machineId'];
	        	break;

	        /* Medium attachment changed */
	        case 'OnMediumChanged':
	        	$data['machineId'] = $data['sourceId'];
	        	$ma = $eventDataObject->mediumAttachment;
	        	$data['controller'] = $ma->controller;
	        	$data['port'] = $ma->port;
	        	$data['device'] = $ma->device;
	        	try {
	        		$data['medium'] = $ma->medium->id;
	        	} catch (Exception $e) {
	        		$data['medium'] = '';
	        	}
	        	$data['dedupId'] .= '-'. $data['controller'] .'-'. $data['port'] .'-'.$data['device'];
	        	break;

	        /* Generic machine changes that should query IMachine */
	        case 'OnVRDEServerChanged':
	        	$data['machineId'] = $data['sourceId'];
	        	break;
	        case 'OnUSBControllerChanged':
	        	$data['machineId'] = $data['sourceId'];
	        	break;
	        case 'OnSharedFolderChanged':
	        	$data['machineId'] = $data['sourceId'];
	        	$data['scope'] = (string)$eventDataObject->scope;
	        	break;
	        case 'OnVRDEServerInfoChanged':
	        	$data['machineId'] = $data['sourceId'];
	        	break;
	        case 'OnCPUExecutionCapChanged':
	        	$data['machineId'] = $data['sourceId'];
	        	$data['executionCap'] = $eventDataObject->executionCap;
	        	break;


        	/* Notification when a USB device is attached to or detached from the virtual USB controller */
	        case 'OnUSBDeviceStateChanged':
	        	$data['machineId'] = $data['sourceId'];
	        	$data['deviceId'] = $eventDataObject->device->id;
	        	$data['attached'] = $eventDataObject->attached;
	        	$data['dedupId'] .= '-'. $data['deviceId'];
	        	break;

	        /* Machine execution error */
	        case 'OnRuntimeError':
	        	$data['id'] = (string)$eventDataObject->id;
	        	$data['machineId'] = $data['sourceId'];
	        	$data['message'] = $eventDataObject->message;
	        	$data['fatal'] = $eventDataObject->fatal;
	        	$data['dedupId'] .= '-' . $data['id'];
	        	break;

	        /* Notification when a storage device is attached or removed. */
        	case 'OnStorageDeviceChanged':
        		$data['machineId'] = $eventDataObject->machineId;
        		$data['storageDevice'] = $eventDataObject->storageDevice;
        		$data['removed'] = $eventDataObject->removed;
        		break;

        	/* On nat network delete / create */
        	case 'OnNATNetworkCreationDeletion':
        		$data['creationEvent'] = $eventDataObject->creationEvent;
        	/* NAT network change */
        	case 'OnNATNetworkSetting':
        		$data['networkName'] = $eventDataObject->networkName;
        		$data['dedupId'] .= '-' . $data['networkName'];
        		break;

        	default:
        	    return null;
		}


		return $data;

	}


	/**
	 * Call overloader.
	 * Returns result of method call. Here is where python's decorators would come in handy.
	 *
	 * @param string $fn method to call
	 * @param array $args arguments for method
	 * @throws Exception
	 * @return array
	 */
	function __call($fn,$args) {

		// Valid session?
		global $_SESSION;

		if(!@$this->skipSessionCheck && !$_SESSION['valid']) {
			throw new Exception(trans('Not logged in.','UIUsers'),vboxconnector::PHPVB_ERRNO_FATAL);
		}

		$req = &$args[0];


		# Access to undefined methods prefixed with remote_
		if(method_exists($this,'remote_'.$fn)) {

			$args[1][0]['data']['responseData'] = $this->{'remote_'.$fn}($req);
			$args[1][0]['data']['success'] = ($args[1][0]['data']['responseData'] !== false);
			$args[1][0]['data']['key'] = $this->settings->key;

		// Not found
		} else {

			throw new Exception('Undefined method: ' . $fn ." - Clear your web browser's cache.",vboxconnector::PHPVB_ERRNO_FATAL);

		}

		return true;
	}

	/**
	 * Enumerate guest properties of a vm
	 *
	 * @param array $args array of arguments. See function body for details.
	 * @return array of guest properties
	 */
	public function remote_machineEnumerateGuestProperties($args) {

		$this->connect();

		/* @var $m IMachine */
		$m = $this->vbox->findMachine($args['vm']);

		$props = $m->enumerateGuestProperties($args['pattern']);
		$m->releaseRemote();

		return $props;

	}

	/**
	 * Set extra data of a vm
	 *
	 * @param array $args array of arguments. See function body for details.
	 * @return array of extra data
	 */
	public function remote_machineSetExtraData($args) {

		$this->connect();

		/* @var $m IMachine */
		$m = $this->vbox->findMachine($args['vm']);

		$m->setExtraData($args['key'],$args['value']);
		$m->releaseRemote();

		return true;

	}

	/**
	 * Enumerate extra data of a vm
	 *
	 * @param array $args array of arguments. See function body for details.
	 * @return array of extra data
	 */
	public function remote_machineEnumerateExtraData($args) {

		$this->connect();

		/* @var $m IMachine */
		$m = $this->vbox->findMachine($args['vm']);

		$props = array();

		$keys = $m->getExtraDataKeys();

		usort($keys,'strnatcasecmp');

		foreach($keys as $k) {
			$props[$k] = $m->getExtraData($k);
		}
		$m->releaseRemote();

		return $props;

	}

	/**
	 * Uses VirtualBox's vfsexplorer to check if a file exists
	 *
	 * @param array $args array of arguments. See function body for details.
	 * @return boolean true if file exists
	 */
	public function remote_fileExists($args) {

		/* No need to go through vfs explorer if local browser is true */
		if($this->settings->browserLocal) {
			return file_exists($args['file']);
		}

		$this->connect();

		$dsep = $this->getDsep();

		$path = str_replace($dsep.$dsep,$dsep,$args['file']);
		$dir = dirname($path);
		$file = basename($path);

		if(substr($dir,-1) != $dsep) $dir .= $dsep;

		/* @var $appl IAppliance */
		$appl = $this->vbox->createAppliance();


		/* @var $vfs IVFSExplorer */
		$vfs = $appl->createVFSExplorer('file://'.$dir);

		/* @var $progress IProgress */
		$progress = $vfs->update();
		$progress->waitForCompletion(-1);
		$progress->releaseRemote();

		$exists = $vfs->exists(array($file));

		$vfs->releaseRemote();
		$appl->releaseRemote();


		return count($exists);

	}

	/**
	 * Install guest additions
	 *
	 * @param array $args array of arguments. See function body for details.
	 * @return array result data
	 */
	public function remote_consoleGuestAdditionsInstall($args) {

		$this->connect();

		$results = array('errored' => 0);

		/* @var $gem IMedium|null */
		$gem = null;
		foreach($this->vbox->DVDImages as $m) { /* @var $m IMedium */
			if(strtolower($m->name) == 'vboxguestadditions.iso') {
				$gem = $m;
				break;
			}
			$m->releaseRemote();
		}

		// Not in media registry. Try to register it.
		if(!$gem) {
			$checks = array(
				'linux' => '/usr/share/virtualbox/VBoxGuestAdditions.iso',
				'osx' => '/Applications/VirtualBox.app/Contents/MacOS/VBoxGuestAdditions.iso',
				'sunos' => '/opt/VirtualBox/additions/VBoxGuestAdditions.iso',
				'windows' => 'C:\Program Files\Oracle\VirtualBox\VBoxGuestAdditions.iso',
				'windowsx86' => 'C:\Program Files (x86)\Oracle\VirtualBox\VBoxGuestAdditions.iso' // Does this exist?
			);
			$hostos = $this->vbox->host->operatingSystem;
			if(stripos($hostos,'windows') !== false) {
				$checks = array($checks['windows'],$checks['windowsx86']);
			} elseif(stripos($hostos,'solaris') !== false || stripos($hostos,'sunos') !== false) {
				$checks = array($checks['sunos']);
			// not sure of uname returned on Mac. This should cover all of them
			} elseif(stripos($hostos,'mac') !== false || stripos($hostos,'apple') !== false || stripos($hostos,'osx') !== false || stripos($hostos,'os x') !== false || stripos($hostos,'darwin') !== false) {
				$checks = array($checks['osx']);
			} elseif(stripos($hostos,'linux') !== false) {
				$checks = array($checks['linux']);
			}

			// Check for config setting
			if(@$this->settings->vboxGuestAdditionsISO)
				$checks = array($this->settings->vboxGuestAdditionsISO);

			// Unknown os and no config setting leaves all checks in place.
			// Try to register medium.
			foreach($checks as $iso) {
				try {
					$gem = $this->vbox->openMedium($iso,'DVD','ReadOnly',false);
					break;
				} catch (Exception $e) {
					// Ignore
				}
			}
			$results['sources'] = $checks;
		}

		// No guest additions found
		if(!$gem) {
			$results['result'] = 'noadditions';
			return $results;
		}

		// create session and lock machine
		/* @var $machine IMachine */
		$machine = $this->vbox->findMachine($args['vm']);
		$this->session = $this->websessionManager->getSessionObject($this->vbox->handle);
		$machine->lockMachine($this->session->handle, 'Shared');

		// Try update from guest if it is supported
		if(!@$args['mount_only']) {
			try {

				/* @var $progress IProgress */
				$progress = $this->session->console->guest->updateGuestAdditions($gem->location,array(),'WaitForUpdateStartOnly');

				// No error info. Save progress.
				$gem->releaseRemote();
				$this->_util_progressStore($progress);
				$results['progress'] = $progress->handle;
				return $results;

			} catch (Exception $e) {

				if(!empty($results['progress']))
					unset($results['progress']);

				// Try to mount medium
				$results['errored'] = 1;
			}
		}

		// updateGuestAdditions is not supported. Just try to mount image.
		$results['result'] = 'nocdrom';
		$mounted = false;
		foreach($machine->storageControllers as $sc) { /* @var $sc IStorageController */
			foreach($machine->getMediumAttachmentsOfController($sc->name) as $ma) { /* @var $ma IMediumAttachment */
				if((string)$ma->type == 'DVD') {
					$this->session->machine->mountMedium($sc->name, $ma->port, $ma->device, $gem->handle, true);
					$results['result'] = 'mounted';
					$mounted = true;
					break;
				}
			}
			$sc->releaseRemote();
			if($mounted) break;
		}


		$this->session->unlockMachine();
		unset($this->session);
		$machine->releaseRemote();
		$gem->releaseRemote();

		return $results;
	}

	/**
	 * Attach USB device identified by $args['id'] to a running VM
	 *
	 * @param array $args array of arguments. See function body for details.
	 * @return boolean true on success
	 */
	public function remote_consoleUSBDeviceAttach($args) {

		$this->connect();

		// create session and lock machine
		/* @var $machine IMachine */
		$machine = $this->vbox->findMachine($args['vm']);
		$this->session = $this->websessionManager->getSessionObject($this->vbox->handle);
		$machine->lockMachine($this->session->handle, 'Shared');

		$this->session->console->attachUSBDevice($args['id']);

		$this->session->unlockMachine();
		unset($this->session);
		$machine->releaseRemote();

		return true;
	}

	/**
	 * Detach USB device identified by $args['id'] from a running VM
	 *
	 * @param array $args array of arguments. See function body for details.
	 * @return boolean true on success
	 */
	public function remote_consoleUSBDeviceDetach($args) {

		$this->connect();

		// create session and lock machine
		/* @var $machine IMachine */
		$machine = $this->vbox->findMachine($args['vm']);
		$this->session = $this->websessionManager->getSessionObject($this->vbox->handle);
		$machine->lockMachine($this->session->handle, 'Shared');

		$this->session->console->detachUSBDevice($args['id']);

		$this->session->unlockMachine();
		unset($this->session);
		$machine->releaseRemote();

		return true;
	}

	/**
	 * Save vms' groups if they have changed
	 *
	 * @param array $args array of arguments. See function body for details.
	 * @return array response data
	 */
	public function remote_machinesSaveGroups($args) {

		$this->connect();

		$response = array('saved'=>array(),'errored'=>false);

		foreach($args['vms'] as $vm) {

			// create session and lock machine
			/* @var $machine IMachine */
			try  {
				$machine = $this->vbox->findMachine($vm['id']);
			} catch (Exception $null) {
				continue;
			}

			$newGroups = $vm['groups'];

			if($this->settings->phpVboxGroups) {

				$oldGroups = explode(',',$machine->getExtraData(vboxconnector::phpVboxGroupKey));
				if(!is_array($oldGroups)) $oldGroups = array("/");
				if(!count(array_diff($oldGroups,$newGroups)) && !count(array_diff($newGroups,$oldGroups))) {
					continue;
				}

			} else {

				$oldGroups = $machine->groups;

				if((string)$machine->sessionState != 'Unlocked' || (!count(array_diff($oldGroups,$newGroups)) && !count(array_diff($newGroups,$oldGroups)))) {
					$machine->releaseRemote();
					continue;
				}

			}

			try {

				$this->session = $this->websessionManager->getSessionObject($this->vbox->handle);

				$machine->lockMachine($this->session->handle, 'Shared');

				usort($newGroups,'strnatcasecmp');

				if($this->settings->phpVboxGroups) {
					$this->session->machine->setExtraData(vboxconnector::phpVboxGroupKey, implode(',', $newGroups));
				} else {
					$this->session->machine->groups = $newGroups;
				}

				$this->session->machine->saveSettings();
				$this->session->unlockMachine();

				unset($this->session);
				$machine->releaseRemote();

			} catch (Exception $e) {

				$this->errors[] = $e;
				$response['errored'] = true;

				try {
				    $this->session->unlockMachine();
				    unset($this->session);
				} catch (Exception $e) {
				    // pass
				}

				continue;

			}

			// Add to saved list
			$response['saved'][] = $vm['id'];

		}


		return $response;


	}


	/**
	 * Clone a virtual machine
	 *
	 * @param array $args array of arguments. See function body for details.
	 * @return array response data
	 */
	public function remote_machineClone($args) {

		// Connect to vboxwebsrv
		$this->connect();

		/* @var $src IMachine */
		$src = $this->vbox->findMachine($args['src']);

		if($args['snapshot'] && $args['snapshot']['id']) {
			/* @var $nsrc ISnapshot */
			$nsrc = $src->findSnapshot($args['snapshot']['id']);
			$src->releaseRemote();
			$src = null;
			$src = $nsrc->machine;
		}
		/* @var $m IMachine */
		$m = $this->vbox->createMachine($this->vbox->composeMachineFilename($args['name'],null,null,null),$args['name'],null,null,null,null,null,null);
		$sfpath = $m->settingsFilePath;

		/* @var $cm CloneMode */
		$cm = new CloneMode(null,$args['vmState']);
		$state = $cm->ValueMap[$args['vmState']];


		$opts = array();
		if(!$args['reinitNetwork']) $opts[] = 'KeepAllMACs';
		if($args['link']) $opts[] = 'Link';

		/* @var $progress IProgress */
		$progress = $src->cloneTo($m->handle,$args['vmState'],$opts);

		// Does an exception exist?
		try {
			if($progress->errorInfo->handle) {
				$this->errors[] = new Exception($progress->errorInfo->text);
				$progress->releaseRemote();
				return false;
			}
		} catch (Exception $null) {}

		$m->releaseRemote();
		$src->releaseRemote();

		$this->_util_progressStore($progress);

		return array(
				'progress' => $progress->handle,
				'settingsFilePath' => $sfpath);

	}


	/**
	 * Turn VRDE on / off on a running VM
	 *
	 * @param array $args array of arguments. See function body for details.
	 * @return boolean true on success
	 */
	public function remote_consoleVRDEServerSave($args) {

		$this->connect();

		// create session and lock machine
		/* @var $m IMachine */
		$m = $this->vbox->findMachine($args['vm']);
		$this->session = $this->websessionManager->getSessionObject($this->vbox->handle);
		$m->lockMachine($this->session->handle, 'Shared');

		if(intval($args['enabled']) == -1) {
			$args['enabled'] = intval(!$this->session->machine->VRDEServer->enabled);
		}

		$this->session->machine->VRDEServer->enabled = intval($args['enabled']);

		$this->session->unlockMachine();
		unset($this->session);

		$m->releaseRemote();

		return true;
	}

	/**
	 * Save running VM settings. Called from machineSave method if the requested VM is running.
	 *
	 * @param array $args array of machine configuration items.
	 * @param string $state state of virtual machine.
	 * @return boolean true on success
	 */
	private function _machineSaveRunning($args, $state) {

		// Client and server must agree on advanced config setting
		$this->settings->enableAdvancedConfig = (@$this->settings->enableAdvancedConfig && @$args['clientConfig']['enableAdvancedConfig']);
		$this->settings->enableHDFlushConfig = (@$this->settings->enableHDFlushConfig && @$args['clientConfig']['enableHDFlushConfig']);

		// Shorthand
		/* @var $m IMachine */
		$m = &$this->session->machine;

		$m->CPUExecutionCap = $args['CPUExecutionCap'];
		$m->description = $args['description'];
		$m->ClipboardMode = $args['ClipboardMode'];

		// Start / stop config
		if(@$this->settings->startStopConfig) {
			$m->setExtraData('pvbx/startupMode', $args['startupMode']);
		}

		// VirtualBox style start / stop config
		if(@$this->settings->vboxAutostartConfig && @$args['clientConfig']['vboxAutostartConfig']) {

			$m->autostopType = $args['autostopType'];
			$m->autostartEnabled = $args['autostartEnabled'];
			$m->autostartDelay = $args['autostartDelay'];

		}

		// Custom Icon
		if(@$this->settings->enableCustomIcons) {
			$m->setExtraData('phpvb/icon', $args['customIcon']);
		}

		// VRDE settings
		try {
			if($m->VRDEServer && $this->vbox->systemProperties->defaultVRDEExtPack) {
				$m->VRDEServer->enabled = $args['VRDEServer']['enabled'];
				$m->VRDEServer->setVRDEProperty('TCP/Ports',$args['VRDEServer']['ports']);
				$m->VRDEServer->setVRDEProperty('VNCPassword',$args['VRDEServer']['VNCPassword'] ? $args['VRDEServer']['VNCPassword'] : null);
				$m->VRDEServer->authType = ($args['VRDEServer']['authType'] ? $args['VRDEServer']['authType'] : 'Null');
				$m->VRDEServer->authTimeout = $args['VRDEServer']['authTimeout'];
			}
		} catch (Exception $e) {
			$this->errors[] = $e;
		}

		// Storage Controllers if machine is in a valid state
		if($state != 'Saved') {

			$scs = $m->storageControllers;
			$attachedEx = $attachedNew = array();
			foreach($scs as $sc) { /* @var $sc IStorageController */
				$mas = $m->getMediumAttachmentsOfController($sc->name);
				foreach($mas as $ma) { /* @var $ma IMediumAttachment */
					$attachedEx[$sc->name.$ma->port.$ma->device] = (($ma->medium->handle && $ma->medium->id) ? $ma->medium->id : null);
				}
			}

			// Incoming list
			foreach($args['storageControllers'] as $sc) {

				$sc['name'] = trim($sc['name']);
				$name = ($sc['name'] ? $sc['name'] : $sc['bus']);

				// Medium attachments
				foreach($sc['mediumAttachments'] as $ma) {

					if($ma['medium'] == 'null') $ma['medium'] = null;

					$attachedNew[$name.$ma['port'].$ma['device']] = $ma['medium']['id'];

					// Compare incoming list with existing
					if($ma['type'] != 'HardDisk' && $attachedNew[$name.$ma['port'].$ma['device']] != $attachedEx[$name.$ma['port'].$ma['device']]) {

						if(is_array($ma['medium']) && $ma['medium']['id'] && $ma['type']) {

							// Host drive
							if(strtolower($ma['medium']['hostDrive']) == 'true' || $ma['medium']['hostDrive'] === true) {
								// CD / DVD Drive
								if($ma['type'] == 'DVD') {
									$drives = $this->vbox->host->DVDDrives;
								// floppy drives
								} else {
									$drives = $this->vbox->host->floppyDrives;
								}
								foreach($drives as $md) {
									if($md->id == $ma['medium']['id']) {
										$med = &$md;
										break;
									}
									$md->releaseRemote();
								}
							} else {
								$med = $this->vbox->openMedium($ma['medium']['location'],$ma['type'],'ReadWrite',false);
							}
						} else {
							$med = null;
						}
						$m->mountMedium($name,$ma['port'],$ma['device'],(is_object($med) ? $med->handle : null),true);
						if(is_object($med)) $med->releaseRemote();
					}

					// Set Live CD/DVD
					if($ma['type'] == 'DVD') {
						if(!$ma['medium']['hostDrive'])
							$m->temporaryEjectDevice($name, $ma['port'], $ma['device'], $ma['temporaryEject']);

					// Set IgnoreFlush
					} elseif($ma['type'] == 'HardDisk') {

						// Remove IgnoreFlush key?
						if($this->settings->enableHDFlushConfig) {

							$xtra = $this->_util_getIgnoreFlushKey($ma['port'], $ma['device'], $sc['controllerType']);

							if($xtra) {
								if((bool)($ma['ignoreFlush'])) {
									$m->setExtraData($xtra, '0');
								} else {
									$m->setExtraData($xtra, '');
								}
							}
						}


					}
				}

			}
		}


		/* Networking */
		$netprops = array('enabled','attachmentType','bridgedInterface','hostOnlyInterface','internalNetwork','NATNetwork','promiscModePolicy','genericDriver');
		if(@$this->settings->enableVDE) $netprops[] = 'VDENetwork';

		for($i = 0; $i < count($args['networkAdapters']); $i++) {

			/* @var $n INetworkAdapter */
			$n = $m->getNetworkAdapter($i);

			// Skip disabled adapters
			if(!$n->enabled) {
				$n->releaseRemote();
				continue;
			}

			for($p = 0; $p < count($netprops); $p++) {
				switch($netprops[$p]) {
					case 'enabled':
					case 'cableConnected':
						break;
					default:
						if((string)$n->{$netprops[$p]} != (string)$args['networkAdapters'][$i][$netprops[$p]])
							$n->{$netprops[$p]} = $args['networkAdapters'][$i][$netprops[$p]];
				}
			}

			/// Not if in "Saved" state
			if($state != 'Saved') {

				// Network properties
				$eprops = $n->getProperties(null);
				$eprops = array_combine($eprops[1],$eprops[0]);
				$iprops = array_map(function($a){$b=explode("=",$a); return array($b[0]=>$b[1]);},preg_split('/[\r|\n]+/',$args['networkAdapters'][$i]['properties']));
				$inprops = array();
				foreach($iprops as $a) {
					foreach($a as $k=>$v)
					$inprops[$k] = $v;
				}

				// Remove any props that are in the existing properties array
				// but not in the incoming properties array
				foreach(array_diff(array_keys($eprops),array_keys($inprops)) as $dk) {
					$n->setProperty($dk, '');
				}

				// Set remaining properties
				foreach($inprops as $k => $v) {
					if(!$k) continue;
					$n->setProperty($k, $v);
				}

				if($n->cableConnected != $args['networkAdapters'][$i]['cableConnected'])
					$n->cableConnected = $args['networkAdapters'][$i]['cableConnected'];

			}

			if($args['networkAdapters'][$i]['attachmentType'] == 'NAT') {

				// Remove existing redirects
				foreach($n->NATEngine->getRedirects() as $r) {
					$n->NATEngine->removeRedirect(array_shift(explode(',',$r)));
				}
				// Add redirects
				foreach($args['networkAdapters'][$i]['redirects'] as $r) {
					$r = explode(',',$r);
					$n->NATEngine->addRedirect($r[0],$r[1],$r[2],$r[3],$r[4],$r[5]);
				}

				// Advanced NAT settings
				if($state != 'Saved' && @$this->settings->enableAdvancedConfig) {
					$aliasMode = $n->NATEngine->aliasMode & 1;
					if(intval($args['networkAdapters'][$i]['NATEngine']['aliasMode'] & 2)) $aliasMode |= 2;
					if(intval($args['networkAdapters'][$i]['NATEngine']['aliasMode'] & 4)) $aliasMode |= 4;
					$n->NATEngine->aliasMode = $aliasMode;
					$n->NATEngine->DNSProxy = $args['networkAdapters'][$i]['NATEngine']['DNSProxy'];
					$n->NATEngine->DNSPassDomain = $args['networkAdapters'][$i]['NATEngine']['DNSPassDomain'];
					$n->NATEngine->DNSUseHostResolver = $args['networkAdapters'][$i]['NATEngine']['DNSUseHostResolver'];
					$n->NATEngine->hostIP = $args['networkAdapters'][$i]['NATEngine']['hostIP'];
				}

			} else if($args['networkAdapters'][$i]['attachmentType'] == 'NATNetwork') {

				if($n->NATNetwork = $args['networkAdapters'][$i]['NATNetwork']);
			}

			$n->releaseRemote();

		}

		/* Shared Folders */
		$sf_inc = array();
		foreach($args['sharedFolders'] as $s) {
			$sf_inc[$s['name']] = $s;
		}


		// Get list of perm shared folders
		$psf_tmp = $m->sharedFolders;
		$psf = array();
		foreach($psf_tmp as $sf) {
			$psf[$sf->name] = $sf;
		}

		// Get a list of temp shared folders
		$tsf_tmp = $this->session->console->sharedFolders;
		$tsf = array();
		foreach($tsf_tmp as $sf) {
			$tsf[$sf->name] = $sf;
		}

		/*
		 *  Step through list and remove non-matching folders
		 */
		foreach($sf_inc as $sf) {

			// Already exists in perm list. Check Settings.
			if($sf['type'] == 'machine' && $psf[$sf['name']]) {

				/* Remove if it doesn't match */
				if($sf['hostPath'] != $psf[$sf['name']]->hostPath || (bool)$sf['autoMount'] != (bool)$psf[$sf['name']]->autoMount || (bool)$sf['writable'] != (bool)$psf[$sf['name']]->writable || $sf['autoMountPoint'] != $psf[$sf['name']]->autoMountPoint) {

					$m->removeSharedFolder($sf['name']);
					$m->createSharedFolder($sf['name'],$sf['hostPath'],(bool)$sf['writable'],(bool)$sf['autoMount'],$sf['autoMountPoint']);
				}

				unset($psf[$sf['name']]);

			// Already exists in perm list. Check Settings.
			} else if($sf['type'] != 'machine' && $tsf[$sf['name']]) {

				/* Remove if it doesn't match */
				if($sf['hostPath'] != $tsf[$sf['name']]->hostPath || (bool)$sf['autoMount'] != (bool)$tsf[$sf['name']]->autoMount || (bool)$sf['writable'] != (bool)$tsf[$sf['name']]->writable || $sf['autoMountPoint'] != $psf[$sf['name']]->autoMountPoint) {

					$this->session->console->removeSharedFolder($sf['name']);
					$this->session->console->createSharedFolder($sf['name'],$sf['hostPath'],(bool)$sf['writable'],(bool)$sf['autoMount'],$sf['autoMountPoint']);

				}

				unset($tsf[$sf['name']]);

			} else {

				// Does not exist or was removed. Add it.
				if($sf['type'] != 'machine') $this->session->console->createSharedFolder($sf['name'],$sf['hostPath'],(bool)$sf['writable'],(bool)$sf['autoMount'],$sf['autoMountPoint']);
				else $this->session->machine->createSharedFolder($sf['name'],$sf['hostPath'],(bool)$sf['writable'],(bool)$sf['autoMount'],$sf['autoMountPoint']);
			}

		}

		/*
		 * Remove remaining
		 */
		foreach($psf as $sf) $m->removeSharedFolder($sf->name);
		foreach($tsf as $sf) $this->session->console->removeSharedFolder($sf->name);

		/*
		 * USB Filters
		 */

		$usbEx = array();
		$usbNew = array();

		$usbc = $this->_machineGetUSBControllers($this->session->machine);

		$deviceFilters = $this->_machineGetUSBDeviceFilters($this->session->machine);

		if($state != 'Saved') {

			// filters
			if(!is_array($args['USBDeviceFilters'])) $args['USBDeviceFilters'] = array();

			if(count($deviceFilters) != count($args['USBDeviceFilters']) || @serialize($deviceFilters) != @serialize($args['USBDeviceFilters'])) {

				// usb filter properties to change
				$usbProps = array('vendorId','productId','revision','manufacturer','product','serialNumber','port','remote');

				// Remove and Add filters
				try {


					$max = max(count($deviceFilters),count($args['USBDeviceFilters']));
					$offset = 0;

					// Remove existing
					for($i = 0; $i < $max; $i++) {

						// Only if filter differs
						if(@serialize($deviceFilters[$i]) != @serialize($args['USBDeviceFilters'][$i])) {

							// Remove existing?
							if($i < count($deviceFilters)) {
								$m->USBDeviceFilters->removeDeviceFilter(($i-$offset));
								$offset++;
							}

							// Exists in new?
							if(count($args['USBDeviceFilters'][$i])) {

								// Create filter
								$f = $m->USBDeviceFilters->createDeviceFilter($args['USBDeviceFilters'][$i]['name']);
								$f->active = (bool)$args['USBDeviceFilters'][$i]['active'];

								foreach($usbProps as $p) {
									$f->$p = $args['USBDeviceFilters'][$i][$p];
								}

								$m->USBDeviceFilters->insertDeviceFilter($i,$f->handle);
								$f->releaseRemote();
								$offset--;
							}
						}

					}

				} catch (Exception $e) { $this->errors[] = $e; }

			}

		}


		$this->session->machine->saveSettings();
		$this->session->unlockMachine();
		unset($this->session);
		$m->releaseRemote();

		return true;

	}

	/**
	 * Save virtual machine settings.
	 *
	 * @param array $args array of arguments. See function body for details.
	 * @return boolean true on success
	 */
	public function remote_machineSave($args) {

		$this->connect();

		// create session and lock machine
		/* @var $machine IMachine */
		$machine = $this->vbox->findMachine($args['id']);

		$vmState = (string)$machine->state;
		$vmRunning = ($vmState == 'Running' || $vmState == 'Paused' || $vmState == 'Saved');
		$this->session = $this->websessionManager->getSessionObject($this->vbox->handle);
		$machine->lockMachine($this->session->handle, ($vmRunning ? 'Shared' : 'Write'));

		// Switch to machineSaveRunning()?
		if($vmRunning) {
			return $this->_machineSaveRunning($args, $vmState);
		}


		// Client and server must agree on advanced config setting
		$this->settings->enableAdvancedConfig = (@$this->settings->enableAdvancedConfig && @$args['clientConfig']['enableAdvancedConfig']);
		$this->settings->enableHDFlushConfig = (@$this->settings->enableHDFlushConfig && @$args['clientConfig']['enableHDFlushConfig']);

		// Shorthand
		/* @var $m IMachine */
		$m = $this->session->machine;

		// General machine settings
		if (@$this->settings->enforceVMOwnership ) {

			$args['name'] = "{$_SESSION['user']}_" . preg_replace('/^' . preg_quote($_SESSION['user']) . '_/', '', $args['name']);

			if ( ($owner = $machine->getExtraData("phpvb/sso/owner")) && $owner !== $_SESSION['user'] && !$_SESSION['admin'] )
			{
				// skip this VM as it is not owned by the user we're logged in as
				throw new Exception("Not authorized to modify this VM");
			}

		}

		// Change OS type and update LongMode
		if(strcasecmp($m->OSTypeId,$args['OSTypeId']) != 0) {

			$m->OSTypeId = $args['OSTypeId'];

			$guestOS = $this->vbox->getGuestOSType($args['OSTypeId']);

			$m->Platform->X86->setCPUProperty('LongMode', ($guestOS->is64Bit ? 1 : 0));
		}

		$m->CPUCount = $args['CPUCount'];
		$m->memorySize = $args['memorySize'];
		$m->FirmwareSettings->setFirmwareType($args['firmwareType']);
		if($args['chipsetType']) $m->Platform->setChipsetType($args['chipsetType']);
		if($m->snapshotFolder != $args['snapshotFolder']) $m->snapshotFolder = $args['snapshotFolder'];
		$m->Platform->setRTCUseUTC($args['RTCUseUTC'] ? 1 : 0);
		$m->Platform->X86->setCpuProperty('PAE', ($args['CpuProperties']['PAE'] ? 1 : 0));
		$m->Platform->X86->setCpuProperty('HWVirt', ($args['CpuProperties']['HWVirt'] ? 1 : 0));
		$m->Platform->X86->setCPUProperty('LongMode', (strpos($args['OSTypeId'],'_64') > - 1 ? 1 : 0));

		// IOAPIC
		$m->FirmwareSettings->IOAPICEnabled = ($args['BIOSSettings']['IOAPICEnabled'] ? 1 : 0);
		$m->CPUExecutionCap = $args['CPUExecutionCap'];
		$m->description = $args['description'];
		$m->ClipboardMode = $args['ClipboardMode'];

		// Start / stop config
		if(@$this->settings->startStopConfig) {
			$m->setExtraData('pvbx/startupMode', $args['startupMode']);
		}


		// VirtualBox style start / stop config
		if(@$this->settings->vboxAutostartConfig && @$args['clientConfig']['vboxAutostartConfig']) {

			$m->autostopType = $args['autostopType'];
			$m->autostartEnabled = $args['autostartEnabled'];
			$m->autostartDelay = $args['autostartDelay'];

		}

		// Determine if host is capable of hw accel
		$hwAccelAvail = $this->vbox->host->getProcessorFeature('HWVirtEx');

		$m->paravirtProvider = $args['paravirtProvider'];
		$m->Platform->X86->setHWVirtExProperty('Enabled', $args['HWVirtExProperties']['Enabled']);
		$m->Platform->X86->setHWVirtExProperty('NestedPaging', ($args['HWVirtExProperties']['Enabled'] && $hwAccelAvail && $args['HWVirtExProperties']['NestedPaging']));

		/* Only if advanced configuration is enabled */
		if(@$this->settings->enableAdvancedConfig) {

			/** @def VBOX_WITH_PAGE_SHARING
 			* Enables the page sharing code.
			* @remarks This must match GMMR0Init; currently we only support page fusion on
			 *          all 64-bit hosts except Mac OS X */

			if($this->vbox->host->getProcessorFeature('LongMode')) {

				$m->pageFusionEnabled = $args['pageFusionEnabled'];
			}

			$m->Platform->X86->HPETEnabled = $args['HPETEnabled'];
			$m->setExtraData("VBoxInternal/Devices/VMMDev/0/Config/GetHostTimeDisabled", $args['disableHostTimeSync']);
			$m->keyboardHIDType = $args['keyboardHIDType'];
			$m->pointingHIDType = $args['pointingHIDType'];
			$m->Platform->X86->setHWVirtExProperty('LargePages', $args['HWVirtExProperties']['LargePages']);
			$m->Platform->X86->setHWVirtExProperty('UnrestrictedExecution', $args['HWVirtExProperties']['UnrestrictedExecution']);
			$m->Platform->X86->setHWVirtExProperty('VPID', $args['HWVirtExProperties']['VPID']);

		}

		/* Custom Icon */
		if(@$this->settings->enableCustomIcons)
			$m->setExtraData('phpvb/icon', $args['customIcon']);

		$m->GraphicsAdapter->VRAMSize = $args['VRAMSize'];
		$m->GraphicsAdapter->graphicsControllerType = $args['graphicsControllerType'];

		// Video
		$m->GraphicsAdapter->setFeature("Acceleration2DVideo", $args['accelerate2DVideoEnabled']);
		$m->GraphicsAdapter->setFeature("Acceleration3D", $args['accelerate3DEnabled']);

		// VRDE settings
		try {
			if($m->VRDEServer && $this->vbox->systemProperties->defaultVRDEExtPack) {
				$m->VRDEServer->enabled = $args['VRDEServer']['enabled'];
				$m->VRDEServer->setVRDEProperty('TCP/Ports',$args['VRDEServer']['ports']);
				if(@$this->settings->enableAdvancedConfig)
					$m->VRDEServer->setVRDEProperty('TCP/Address',$args['VRDEServer']['netAddress']);
				$m->VRDEServer->setVRDEProperty('VNCPassword',$args['VRDEServer']['VNCPassword'] ? $args['VRDEServer']['VNCPassword'] : null);
				$m->VRDEServer->authType = ($args['VRDEServer']['authType'] ? $args['VRDEServer']['authType'] : 'Null');
				$m->VRDEServer->authTimeout = $args['VRDEServer']['authTimeout'];
				$m->VRDEServer->allowMultiConnection = $args['VRDEServer']['allowMultiConnection'];
			}
		} catch (Exception $e) {
			$this->errors[] = $e;
		}

		// Audio controller settings
		$m->audioSettings->Adapter->enabled = ($args['audioAdapter']['enabled'] ? 1 : 0);
		$m->audioSettings->Adapter->audioController = $args['audioAdapter']['audioController'];
		$m->audioSettings->Adapter->audioDriver = $args['audioAdapter']['audioDriver'];

		// Boot order
		$mbp = $this->vbox->getPlatformProperties("x86")->maxBootPosition;
		for($i = 0; $i < $mbp; $i ++) {
			if($args['bootOrder'][$i]) {
				$m->setBootOrder(($i + 1),$args['bootOrder'][$i]);
			} else {
				$m->setBootOrder(($i + 1),'Null');
			}
		}

		// Storage Controllers
		$scs = $m->storageControllers;
		$attachedEx = $attachedNew = array();
		foreach($scs as $sc) { /* @var $sc IStorageController */

			$mas = $m->getMediumAttachmentsOfController($sc->name);

			$cType = (string)$sc->controllerType;

			foreach($mas as $ma) { /* @var $ma IMediumAttachment */

				$attachedEx[$sc->name.$ma->port.$ma->device] = (($ma->medium->handle && $ma->medium->id) ? $ma->medium->id : null);

				// Remove IgnoreFlush key?
				if($this->settings->enableHDFlushConfig && (string)$ma->type == 'HardDisk') {
					$xtra = $this->_util_getIgnoreFlushKey($ma->port, $ma->device, $cType);
					if($xtra) {
						$m->setExtraData($xtra,'');
					}
				}

				if($ma->controller) {
					$m->detachDevice($ma->controller,$ma->port,$ma->device);
				}

			}
			$scname = $sc->name;
			$sc->releaseRemote();
			$m->removeStorageController($scname);
		}

		// Add New
		foreach($args['storageControllers'] as $sc) {

			$sc['name'] = trim($sc['name']);
			$name = ($sc['name'] ? $sc['name'] : $sc['bus']);


			$bust = new StorageBus(null,$sc['bus']);
			$c = $m->addStorageController($name,(string)$bust);
			$c->controllerType = $sc['controllerType'];
			$c->useHostIOCache = $sc['useHostIOCache'];

			// Set sata port count
			if(($sc['bus'] == 'SATA')||($sc['bus'] == 'PCIe')) {
				$max = max(1,intval(@$sc['portCount']));
				foreach($sc['mediumAttachments'] as $ma) {
					$max = max($max,(intval($ma['port'])+1));
				}
				$c->portCount = min(intval($c->maxPortCount),max(count($sc['mediumAttachments']),$max));

			}
			$c->releaseRemote();


			// Medium attachments
			foreach($sc['mediumAttachments'] as $ma) {

				if($ma['medium'] == 'null') $ma['medium'] = null;

				$attachedNew[$name.$ma['port'].$ma['device']] = $ma['medium']['id'];

				if(is_array($ma['medium']) && $ma['medium']['id'] && $ma['type']) {

					// Host drive
					if(strtolower($ma['medium']['hostDrive']) == 'true' || $ma['medium']['hostDrive'] === true) {
						// CD / DVD Drive
						if($ma['type'] == 'DVD') {
							$drives = $this->vbox->host->DVDDrives;
						// floppy drives
						} else {
							$drives = $this->vbox->host->floppyDrives;
						}
						foreach($drives as $md) { /* @var $md IMedium */
							if($md->id == $ma['medium']['id']) {
								$med = &$md;
								break;
							}
							$md->releaseRemote();
						}
					} else {
						/* @var $med IMedium */
						$med = $this->vbox->openMedium($ma['medium']['location'],$ma['type'], 'ReadWrite', false);
					}
				} else {
					$med = null;
				}
				$m->attachDevice($name,$ma['port'],$ma['device'],$ma['type'],(is_object($med) ? $med->handle : null));

				// CD / DVD medium attachment type
				if($ma['type'] == 'DVD') {

					if($ma['medium']['hostDrive'])
						$m->passthroughDevice($name, $ma['port'], $ma['device'], $ma['passthrough']);
					else
						$m->temporaryEjectDevice($name, $ma['port'], $ma['device'], ($ma['temporaryEject'] ? true : false));

				// HardDisk medium attachment type
				} else if($ma['type'] == 'HardDisk') {

					$ma['nonRotational']=($ma['nonRotational']?1:0);
					$ma['discard']=($ma['discard']?1:0);
					$ma['hotPluggable']=($ma['hotPluggable']?1:0);
					$m->nonRotationalDevice($name, $ma['port'], $ma['device'], $ma['nonRotational']);

					// Set Discard (TRIM) Option
					if($this->settings->enableAdvancedConfig) {
						$m->setAutoDiscardForDevice($name, $ma['port'], $ma['device'], $ma['discard']);
					}

					// Remove IgnoreFlush key?
					if($this->settings->enableHDFlushConfig) {

						$xtra = $this->_util_getIgnoreFlushKey($ma['port'], $ma['device'], $sc['controllerType']);

						if($xtra) {
							if($ma['ignoreFlush']) {
								$m->setExtraData($xtra, '');
							} else {
								$m->setExtraData($xtra, 0);
							}
						}
					}


				}

				if($sc['bus'] == 'SATA' || $sc['bus'] == 'USB') {
					$m->setHotPluggableForDevice($name, $ma['port'], $ma['device'], ($ma['hotPluggable'] ? true : false));
				}

				if(is_object($med))
					$med->releaseRemote();
			}

		}

		/*
		 *
		 * Network Adapters
		 *
		 */

		$netprops = array('enabled','attachmentType','adapterType','MACAddress','bridgedInterface',
				'hostOnlyInterface','internalNetwork','NATNetwork','cableConnected','promiscModePolicy','genericDriver');

		for($i = 0; $i < count($args['networkAdapters']); $i++) {
		if(@$this->settings->enableVDE) $netprops[] = 'VDENetwork';

			$n = $m->getNetworkAdapter($i);

			// Skip disabled adapters
			if(!($n->enabled || @$args['networkAdapters'][$i]['enabled']))
				continue;

			for($p = 0; $p < count($netprops); $p++) {
			    /*
				switch($netprops[$p]) {
					case 'enabled':
					case 'cableConnected':
						continue;
				}
				*/
				$n->{$netprops[$p]} = @$args['networkAdapters'][$i][$netprops[$p]];
			}

			// Special case for boolean values
			/*
			$n->enabled = $args['networkAdapters'][$i]['enabled'];
			$n->cableConnected = $args['networkAdapters'][$i]['cableConnected'];
			*/

			// Network properties
			$eprops = $n->getProperties(null);
			$eprops = array_combine($eprops[1],$eprops[0]);
			$iprops = array_map(function($a){$b=explode("=",$a); return array($b[0]=>$b[1]);},preg_split('/[\r|\n]+/',$args['networkAdapters'][$i]['properties']));
			$inprops = array();
			foreach($iprops as $a) {
				foreach($a as $k=>$v)
					$inprops[$k] = $v;
			}
			// Remove any props that are in the existing properties array
			// but not in the incoming properties array
			foreach(array_diff(array_keys($eprops),array_keys($inprops)) as $dk)
				$n->setProperty($dk, '');

			// Set remaining properties
			foreach($inprops as $k => $v)
				$n->setProperty($k, $v);

			// Nat redirects and advanced settings
			if($args['networkAdapters'][$i]['attachmentType'] == 'NAT') {

				// Remove existing redirects
				foreach($n->NATEngine->getRedirects() as $r) {
					$n->NATEngine->removeRedirect(array_shift(explode(',',$r)));
				}
				// Add redirects
				foreach($args['networkAdapters'][$i]['redirects'] as $r) {
					$r = explode(',',$r);
					$n->NATEngine->addRedirect($r[0],$r[1],$r[2],$r[3],$r[4],$r[5]);
				}

				// Advanced NAT settings
				if(@$this->settings->enableAdvancedConfig) {
					$aliasMode = $n->NATEngine->aliasMode & 1;
					if(intval($args['networkAdapters'][$i]['NATEngine']['aliasMode'] & 2)) $aliasMode |= 2;
					if(intval($args['networkAdapters'][$i]['NATEngine']['aliasMode'] & 4)) $aliasMode |= 4;
					$n->NATEngine->aliasMode = $aliasMode;
					$n->NATEngine->DNSProxy = $args['networkAdapters'][$i]['NATEngine']['DNSProxy'];
					$n->NATEngine->DNSPassDomain = $args['networkAdapters'][$i]['NATEngine']['DNSPassDomain'];
					$n->NATEngine->DNSUseHostResolver = $args['networkAdapters'][$i]['NATEngine']['DNSUseHostResolver'];
					$n->NATEngine->hostIP = $args['networkAdapters'][$i]['NATEngine']['hostIP'];
				}

			} else if($args['networkAdapters'][$i]['attachmentType'] == 'NATNetwork') {

				if($n->NATNetwork = $args['networkAdapters'][$i]['NATNetwork']);
			}

			$n->releaseRemote();
		}

		// Serial Ports
		for($i = 0; $i < count($args['serialPorts']); $i++) {

			/* @var $p ISerialPort */
			$p = $m->getSerialPort($i);

			if(!($p->enabled || $args['serialPorts'][$i]['enabled']))
				continue;

			try {
				$p->enabled = $args['serialPorts'][$i]['enabled'];
				$p->IOAddress = @hexdec($args['serialPorts'][$i]['IOBase']);
				$p->IRQ = intval($args['serialPorts'][$i]['IRQ']);
				if($args['serialPorts'][$i]['path']) {
					$p->path = $args['serialPorts'][$i]['path'];
					$p->hostMode = $args['serialPorts'][$i]['hostMode'];
				} else {
					$p->hostMode = $args['serialPorts'][$i]['hostMode'];
					$p->path = $args['serialPorts'][$i]['path'];
				}
				$p->server = $args['serialPorts'][$i]['server'];
				$p->releaseRemote();
			} catch (Exception $e) {
				$this->errors[] = $e;
			}
		}

		// LPT Ports
		if(@$this->settings->enableLPTConfig) {
			$lptChanged = false;

			for($i = 0; $i < count($args['parallelPorts']); $i++) {

				/* @var $p IParallelPort */
				$p = $m->getParallelPort($i);

				if(!($p->enabled || $args['parallelPorts'][$i]['enabled']))
					continue;

				$lptChanged = true;
				try {
					$p->IOBase = @hexdec($args['parallelPorts'][$i]['IOBase']);
					$p->IRQ = intval($args['parallelPorts'][$i]['IRQ']);
					$p->path = $args['parallelPorts'][$i]['path'];
					$p->enabled = $args['parallelPorts'][$i]['enabled'];
					$p->releaseRemote();
				} catch (Exception $e) {
					$this->errors[] = $e;
				}
			}
		}


		$sharedEx = array();
		$sharedNew = array();
		foreach($this->_machineGetSharedFolders($m) as $s) {
			$sharedEx[$s['name']] = array('name'=>$s['name'],'hostPath'=>$s['hostPath'],'autoMount'=>(bool)$s['autoMount'],'writable'=>(bool)$s['writable'],'autoMountPoint'=>$s['autoMountPoint']);
		}
		foreach($args['sharedFolders'] as $s) {
			$sharedNew[$s['name']] = array('name'=>$s['name'],'hostPath'=>$s['hostPath'],'autoMount'=>(bool)$s['autoMount'],'writable'=>(bool)$s['writable'],'autoMountPoint'=>$s['autoMountPoint']);
		}
		// Compare
		if(count($sharedEx) != count($sharedNew) || (@serialize($sharedEx) != @serialize($sharedNew))) {
			foreach($sharedEx as $s) { $m->removeSharedFolder($s['name']);}
			try {
				foreach($sharedNew as $s) {
					$m->createSharedFolder($s['name'],$s['hostPath'],(bool)$s['writable'],(bool)$s['autoMount'],$s['autoMountPoint']);
				}
			} catch (Exception $e) { $this->errors[] = $e; }
		}

		// USB Filters

		$usbEx = array();
		$usbNew = array();

		$usbc = $this->_machineGetUSBControllers($this->session->machine);
		if(!$args['USBControllers'] || !is_array($args['USBControllers'])) $args['USBControllers'] = array();

		// Remove old
		$newNames = array();
		$newByName = array();
		foreach($args['USBControllers'] as $c) {
			$newNames[] = $c['name'];
			$newByName[$c['name']] = $c;
		}
		$exNames = array();
		foreach($usbc as $c) {
			$exNames[] = $c['name'];
			if(in_array($c['name'], $newNames)) continue;
			$this->session->machine->removeUSBController($c['name']);
		}

		$addNames = array_diff($newNames, $exNames);
		foreach($addNames as $name) {
			$this->session->machine->addUSBController($name, $newByName[$name]['type']);
		}

		// filters
		$deviceFilters = $this->_machineGetUSBDeviceFilters($this->session->machine);
		if(!is_array($args['USBDeviceFilters'])) $args['USBDeviceFilters'] = array();

		if(count($deviceFilters) != count($args['USBDeviceFilters']) || @serialize($deviceFilters) != @serialize($args['USBDeviceFilters'])) {

			// usb filter properties to change
			$usbProps = array('vendorId','productId','revision','manufacturer','product','serialNumber','port','remote');

			// Remove and Add filters
			try {


				$max = max(count($deviceFilters),count($args['USBDeviceFilters']));
				$offset = 0;

				// Remove existing
				for($i = 0; $i < $max; $i++) {

					// Only if filter differs
					if(@serialize($deviceFilters[$i]) != @serialize($args['USBDeviceFilters'][$i])) {

						// Remove existing?
						if($i < count($deviceFilters)) {
							$m->USBDeviceFilters->removeDeviceFilter(($i-$offset));
							$offset++;
						}

						// Exists in new?
						if(count($args['USBDeviceFilters'][$i])) {

							// Create filter
							$f = $m->USBDeviceFilters->createDeviceFilter($args['USBDeviceFilters'][$i]['name']);
							$f->active = (bool)$args['USBDeviceFilters'][$i]['active'];

							foreach($usbProps as $p) {
								$f->$p = $args['USBDeviceFilters'][$i][$p];
							}

							$m->USBDeviceFilters->insertDeviceFilter($i,$f->handle);
							$f->releaseRemote();
							$offset--;
						}
					}

				}

			} catch (Exception $e) { $this->errors[] = $e; }

		}

		// Rename goes last
		if($m->name != $args['name']) {
			$m->name = $args['name'];
		}
		$this->session->machine->saveSettings();


		$this->session->unlockMachine();
		unset($this->session);
		$machine->releaseRemote();

		return true;

	}

	/**
	 * Add a virtual machine via its settings file.
	 *
	 * @param array $args array of arguments. See function body for details.
	 * @return boolean true on success
	 */
	public function remote_machineAdd($args) {

		$this->connect();


		/* @var $m IMachine */
		$m = $this->vbox->openMachine($args['file'],null);
		$this->vbox->registerMachine($m->handle);

		$m->releaseRemote();

		return true;

	}

	/**
	 * Get progress operation status. On completion, destory progress operation.
	 *
	 * @param array $args array of arguments. See function body for details.
	 * @return array response data
	 */
	public function remote_progressGet($args) {

		// progress operation result
		$response = array();
		$error = 0;

		// Connect to vboxwebsrv
		$this->connect();

		try {

			try {

				// Force web call to keep session open.
				if($this->persistentRequest['sessionHandle']) {
    				$this->session = new ISession($this->client, $this->persistentRequest['sessionHandle']);
    				if((string)$this->session->state) {}
				}

				/* @var $progress IProgress */
				$progress = new IProgress($this->client, $args['progress']);

			} catch (Exception $e) {
				$this->errors[] = $e;
				throw new Exception('Could not obtain progress operation: '.$args['progress']);
			}

			$response['progress'] = $args['progress'];

			$response['info'] = array(
				'completed' => $progress->completed,
				'canceled' => $progress->canceled,
				'description' => $progress->description,
				'operationDescription' => $progress->operationDescription,
				'timeRemaining' => $this->_util_splitTime($progress->timeRemaining),
				'timeElapsed' => $this->_util_splitTime((time() - $pop['started'])),
				'percent' => $progress->percent
			);


			// Completed? Do not return. Fall to _util_progressDestroy() called later
			if($response['info']['completed'] || $response['info']['canceled']) {

				try {
					if(!$response['info']['canceled'] && $progress->errorInfo->handle) {
						$error = array('message'=>$progress->errorInfo->text,'err'=>$this->_util_resultCodeText($progress->resultCode));
					}
				} catch (Exception $null) {}


			} else {

				$response['info']['cancelable'] = $progress->cancelable;

				return $response;
			}


		} catch (Exception $e) {

			// Force progress dialog closure
			$response['info'] = array('completed'=>1);

			// Does an exception exist?
			try {
				if($progress->errorInfo->handle) {
					$error = array('message'=>$progress->errorInfo->text,'err'=>$this->_util_resultCodeText($progress->resultCode));
				}
			} catch (Exception $null) {}

		}

		if($error) {
			if(@$args['catcherrs']) $response['error'] = $error;
			else $this->errors[] = new Exception($error['message']);

		}

		$this->_util_progressDestroy($pop);

		return $response;

	}

	/**
	 * Cancel a running progress operation
	 *
	 * @param array $args array of arguments. See function body for details.
	 * @param array $response response data passed byref populated by the function
	 * @return boolean true on success
	 */
	public function remote_progressCancel($args) {

		// Connect to vboxwebsrv
		$this->connect();

		try {
			/* @var $progress IProgress */
			$progress = new IProgress($this->client,$args['progress']);
			if(!($progress->completed || $progress->canceled))
				$progress->cancel();
		} catch (Exception $e) {
			$this->errors[] = $e;
		}

		return true;
	}

	/**
	 * Destory a progress operation.
	 *
	 * @param array $pop progress operation details
	 * @return boolean true on success
	 */
	private function _util_progressDestroy($pop) {

		// Connect to vboxwebsrv
		$this->connect();

		try {
			/* @var $progress IProgress */
			$progress = new IProgress($this->client,$pop['progress']);
			$progress->releaseRemote();
		} catch (Exception $e) {}
		try {

			// Close session and logoff
			try {

				if($this->session->handle) {
				    if((string)$this->session->state != 'Unlocked') {
    					$this->session->unlockMachine();
				    }
    				$this->session->releaseRemote();
    				unset($this->session);
				}


			} catch (Exception $e) {
				$this->errors[] = $e;
			}


			// Logoff session associated with progress operation
			$this->websessionManager->logoff($this->vbox->handle);
			unset($this->vbox);

		} catch (Exception $e) {
			$this->errors[] = $e;
		}

		// Remove progress handles
		$this->persistentRequest = array();

		return true;
	}

	/**
	 * Returns a key => value mapping of an enumeration class contained
	 * in vboxServiceWrappers.php (classes that extend VBox_Enum).
	 *
	 * @param array $args array of arguments. See function body for details.
	 * @return array response data
	 * @see vboxServiceWrappers.php
	 */
	public function remote_vboxGetEnumerationMap($args) {

		$c = new $args['class'](null, null);
		return (@isset($args['ValueMap']) ? $c->ValueMap : $c->NameMap);
	}

	/**
	 * Save VirtualBox system properties
	 *
	 * @param array $args array of arguments. See function body for details.
	 * @return boolean true on success
	 */
	public function remote_vboxSystemPropertiesSave($args) {

		// Connect to vboxwebsrv
		$this->connect();

		$this->vbox->systemProperties->defaultMachineFolder = $args['SystemProperties']['defaultMachineFolder'];
		$this->vbox->systemProperties->VRDEAuthLibrary = $args['SystemProperties']['VRDEAuthLibrary'];
		if(@$this->settings->vboxAutostartConfig) {
			$this->vbox->systemProperties->autostartDatabasePath = $args['SystemProperties']['autostartDatabasePath'];
		}

		return true;

	}

	/**
	 * Import a virtual appliance
	 *
	 * @param array $args array of arguments. See function body for details.
	 * @return array response data
	 */
	public function remote_applianceImport($args) {

		// Connect to vboxwebsrv
		$this->connect();

		/* @var $app IAppliance */
		$app = $this->vbox->createAppliance();

		/* @var $progress IProgress */
		$progress = $app->read($args['file']);

		// Does an exception exist?
		try {
			if($progress->errorInfo->handle) {
				$this->errors[] = new Exception($progress->errorInfo->text);
				$app->releaseRemote();
				return false;
			}
		} catch (Exception $null) {}

		$progress->waitForCompletion(-1);

		$app->interpret();

		$a = 0;
		foreach($app->virtualSystemDescriptions as $d) { /* @var $d IVirtualSystemDescription */
			// Replace with passed values
			$args['descriptions'][$a][5] = array_pad($args['descriptions'][$a][5], count($args['descriptions'][$a][3]),true);
			foreach(array_keys($args['descriptions'][$a][5]) as $k) $args['descriptions'][$a][5][$k] = (bool)$args['descriptions'][$a][5][$k];
			$d->setFinalValues($args['descriptions'][$a][5],$args['descriptions'][$a][3],$args['descriptions'][$a][4]);
			$a++;
		}

		/* @var $progress IProgress */
		$progress = $app->importMachines(array($args['reinitNetwork'] ? 'KeepNATMACs' : 'KeepAllMACs'));

		$app->releaseRemote();

		// Does an exception exist?
		try {
			if($progress->errorInfo->handle) {
				$this->errors[] = new Exception($progress->errorInfo->text);
				$progress->releaseRemote();
				return false;
			}
		} catch (Exception $null) {}

		// Save progress
		$this->_util_progressStore($progress);

		return array('progress' => $progress->handle);

	}

	/**
	 * Get a list of VMs that are available for export.
	 *
	 * @param array $args array of arguments. See function body for details.
	 * @return array list of exportable machiens
	 */
	public function remote_vboxGetExportableMachines($args) {

		// Connect to vboxwebsrv
		$this->connect();

		//Get a list of registered machines
		$machines = $this->vbox->machines;

		$response = array();

		foreach ($machines as $machine) { /* @var $machine IMachine */

			if ( @$this->settings->enforceVMOwnership && ($owner = $machine->getExtraData("phpvb/sso/owner")) && $owner !== $_SESSION['user'] && !$_SESSION['admin'] )
			{
				// skip this VM as it is not owned by the user we're logged in as
				continue;
			}

			try {
				$response[] = array(
					'name' => @$this->settings->enforceVMOwnership ? preg_replace('/^' . preg_quote($_SESSION['user']) . '_/', '', $machine->name) : $machine->name,
					'state' => (string)$machine->state,
					'OSTypeId' => $machine->getOSTypeId(),
					'id' => $machine->id,
					'description' => $machine->description
				);
				$machine->releaseRemote();

			} catch (Exception $e) {
				// Ignore. Probably inaccessible machine.
			}
		}
		return $response;
	}


	/**
	 * Read and interpret virtual appliance file
	 *
	 * @param array $args array of arguments. See function body for details.
	 * @return array appliance file content descriptions
	 */
	public function remote_applianceReadInterpret($args) {

		// Connect to vboxwebsrv
		$this->connect();

		/* @var $app IAppliance */
		$app = $this->vbox->createAppliance();

		/* @var $progress IProgress */
		$progress = $app->read($args['file']);

		// Does an exception exist?
		try {
			if($progress->errorInfo->handle) {
				$this->errors[] = new Exception($progress->errorInfo->text);
				$app->releaseRemote();
				return false;
			}
		} catch (Exception $null) {}

		$progress->waitForCompletion(-1);

		$app->interpret();

		$response = array('warnings' => $app->getWarnings(),
			'descriptions' => array());

		$i = 0;
		foreach($app->virtualSystemDescriptions as $d) { /* @var $d IVirtualSystemDescription */
			$desc = array();
			$response['descriptions'][$i] = $d->getDescription();
			foreach($response['descriptions'][$i][0] as $ddesc) {
				$desc[] = (string)$ddesc;
			}
			$response['descriptions'][$i][0] = $desc;
			$i++;
			$d->releaseRemote();
		}
		$app->releaseRemote();
		$app=null;

		return $response;

	}


	/**
	 * Export VMs to a virtual appliance file
	 *
	 * @param array $args array of arguments. See function body for details.
	 * @return array response data
	 */
	public function remote_applianceExport($args) {

		// Connect to vboxwebsrv
		$this->connect();

		/* @var $app IAppliance */
		$app = $this->vbox->createAppliance();

		// Overwrite existing file?
		if($args['overwrite']) {

			$dsep = $this->getDsep();

			$path = str_replace($dsep.$dsep,$dsep,$args['file']);
			$dir = dirname($path);
			$file = basename($path);

			if(substr($dir,-1) != $dsep) $dir .= $dsep;

			/* @var $vfs IVFSExplorer */
			$vfs = $app->createVFSExplorer('file://'.$dir);

			/* @var $progress IProgress */
			$progress = $vfs->remove(array($file));
			$progress->waitForCompletion(-1);
			$progress->releaseRemote();

			$vfs->releaseRemote();
		}

		$appProps = array(
			'name' => 'Name',
			'description' => 'Description',
			'product' => 'Product',
			'vendor' => 'Vendor',
			'version' => 'Version',
			'product-url' => 'ProductUrl',
			'vendor-url' => 'VendorUrl',
			'license' => 'License');


		foreach($args['vms'] as $vm) {

			/* @var $m IMachine */
			$m = $this->vbox->findMachine($vm['id']);
			if (@$this->settings->enforceVMOwnership && ($owner = $m->getExtraData("phpvb/sso/owner")) && $owner !== $_SESSION['user'] && !$_SESSION['admin'] )
			{
				// skip this VM as it is not owned by the user we're logged in as
				continue;
			}
			$desc = $m->exportTo($app->handle, $args['file']);
			$props = $desc->getDescription();
			$ptypes = array();
			foreach($props[0] as $p) {$ptypes[] = (string)$p;}
			$typecount = 0;
			foreach($appProps as $k=>$v) {
				// Check for existing property
				if(($i=array_search($v,$ptypes)) !== false) {
					$props[3][$i] = $vm[$k];
				} else {
					$desc->addDescription($v,$vm[$k],null);
					$props[3][] = $vm[$k];
					$props[4][] = null;
				}
				$typecount++;
			}
			$enabled = array_pad(array(),count($props[3]),true);
			foreach(array_keys($enabled) as $k) $enabled[$k] = (bool)$enabled[$k];
			$desc->setFinalValues($enabled,$props[3],$props[4]);
			$desc->releaseRemote();
			$m->releaseRemote();
		}

		/* @var $progress IProgress */
		$progress = $app->write($args['format'],($args['manifest'] ? array('CreateManifest') : array()),$args['file']);
		$app->releaseRemote();

		// Does an exception exist?
		try {
			if($progress->errorInfo->handle) {
				$this->errors[] = new Exception($progress->errorInfo->text);
				$progress->releaseRemote();
				return false;
			}
		} catch (Exception $null) {}

		// Save progress
		$this->_util_progressStore($progress);

		return array('progress' => $progress->handle);

	}

	/**
	 * Get nat network info
	 *
	 * @param unused $args
	 * @param array $response response data passed byref populated by the function
	 * @return array networking info data
	 */
	public function remote_vboxNATNetworksGet($args) {

		$this->connect();

		$props = array('networkName','enabled','network','IPv6Enabled',
				'advertiseDefaultIPv6RouteEnabled','needDhcpServer','portForwardRules4',
				'portForwardRules6');

		$natNetworks = array();

		foreach($this->vbox->NATNetworks as $n) {


			$netDetails = array();
			foreach($props as $p) {
				$netDetails[$p] = $n->$p;
			}

			$natNetworks[] = $netDetails;
		}

		return $natNetworks;

	}

	/**
	 * Get nat network details
	 *
	 * @param array $args contains network name
	 * @param array $response response data passed byref populated by the function
	 * @return array networking info data
	 */
	public function remote_vboxNATNetworksSave($args) {

		$this->connect();

		$props = array('networkName','enabled','network','IPv6Enabled',
				'advertiseDefaultIPv6RouteEnabled','needDhcpServer');

		$exNetworks = array();
		foreach($this->vbox->NATNetworks as $n) { $exNetworks[$n->networkName] = false; }

		/* Incoming network list */
		foreach($args['networks'] as $net) {

			/* Existing network */
			if($net['orig_networkName']) {

				$network = $this->vbox->findNATNetworkByName($net['orig_networkName']);


				$exNetworks[$net['orig_networkName']] = true;

				foreach($props as $p) {
					$network->$p = $net[$p];
				}

				foreach(array('portForwardRules4','portForwardRules6') as $rules) {

					if(!$net[$rules] || !is_array($net[$rules])) $net[$rules] = array();

					$rules_remove = array_diff($network->$rules, $net[$rules]);
					$rules_add = array_diff($net[$rules], $network->$rules);

					foreach($rules_remove as $rule) {
						$network->removePortForwardRule((strpos($rules,'6')>-1), array_shift(preg_split('/:/',$rule)));
					}
					foreach($rules_add as $r) {
						preg_match('/(.*?):(.+?):\[(.*?)\]:(\d+):\[(.*?)\]:(\d+)/', $r, $rule);
						array_shift($rule);
						$network->addPortForwardRule((strpos($rules,'6')>-1), $rule[0],strtoupper($rule[1]),$rule[2],$rule[3],$rule[4],$rule[5]);
					}
				}

			/* New network */
			} else {

				$network = $this->vbox->createNATNetwork($net['networkName']);

				foreach($props as $p) {
					if($p == 'network' && $net[$p] == '') continue;
					$network->$p = $net[$p];
				}

				foreach($net['portForwardRules4'] as $r) {
					preg_match('/(.*?):(.+?):\[(.*?)\]:(\d+):\[(.*?)\]:(\d+)/', $r, $rule);
					array_shift($rule);
					$network->addPortForwardRule(false, $rule[0],strtoupper($rule[1]),$rule[2],$rule[3],$rule[4],$rule[5]);
				}
				foreach($net['portForwardRules6'] as $r) {
					preg_match('/(.*?):(.+?):\[(.*?)\]:(\d+):\[(.*?)\]:(\d+)/', $r, $rule);
					array_shift($rule);
					$network->addPortForwardRule(true, $rule[0],strtoupper($rule[1]),$rule[2],$rule[3],$rule[4],$rule[5]);
				}

			}

		}

		/* Remove networks not in list */
		foreach($exNetworks as $n=>$v) {
			if($v) continue;
			$n = $this->vbox->findNATNetworkByName($n);
			$this->vbox->removeNATNetwork($n);
		}

		return true;

	}

	/**
	 * Get networking info
	 *
	 * @param unused $args
	 * @param array $response response data passed byref populated by the function
	 * @return array networking info data
	 */
	public function remote_getNetworking($args) {

		// Connect to vboxwebsrv
		$this->connect();

		$response = array();
		$networks = array();
		$nics = array();
		$genericDrivers = array();
		$vdenetworks = array();

		/* Get host nics */
		foreach($this->vbox->host->networkInterfaces as $d) { /* @var $d IHostNetworkInterface */
			$nics[] = $d->name;
			$d->releaseRemote();
		}

		/* Get internal Networks */
		$networks = $this->vbox->internalNetworks;
		/* Generic Drivers */
		$genericDrivers = $this->vbox->genericNetworkDrivers;

		$natNetworks = array();
		foreach($this->vbox->NATNetworks as $n) {
			$natNetworks[] = $n->networkName;
		}

		return array(
			'nics' => $nics,
			'networks' => $networks,
			'genericDrivers' => $genericDrivers,
			'vdenetworks' => $vdenetworks,
			'natNetworks' => $natNetworks
		);

	}

	/**
	 * Get host-only interface information
	 *
	 * @param unused $args
	 * @return array host only interface data
	 */
	public function remote_hostOnlyInterfacesGet($args) {

		// Connect to vboxwebsrv
		$this->connect();

		/*
		 * NICs
		 */
		$response = array('networkInterfaces' => array());
		foreach($this->vbox->host->networkInterfaces as $d) { /* @var $d IHostNetworkInterface */

			if((string)$d->interfaceType != 'HostOnly') {
				$d->releaseRemote();
				continue;
			}


			// Get DHCP Info
			try {
				/* @var $dhcp IDHCPServer */
				$dhcp = $this->vbox->findDHCPServerByNetworkName($d->networkName);
				if($dhcp->handle) {
					$dhcpserver = array(
						'enabled' => $dhcp->enabled,
						'IPAddress' => $dhcp->IPAddress,
						'networkMask' => $dhcp->networkMask,
						'networkName' => $dhcp->networkName,
						'lowerIP' => $dhcp->lowerIP,
						'upperIP' => $dhcp->upperIP
					);
					$dhcp->releaseRemote();
				} else {
					$dhcpserver = array();
				}
			} catch (Exception $e) {
				$dhcpserver = array();
			}

			$response['networkInterfaces'][] = array(
				'id' => $d->id,
				'IPV6Supported' => $d->IPV6Supported,
				'name' => $d->name,
				'IPAddress' => $d->IPAddress,
				'networkMask' => $d->networkMask,
				'IPV6Address' => $d->IPV6Address,
				'IPV6NetworkMaskPrefixLength' => $d->IPV6NetworkMaskPrefixLength,
				'DHCPEnabled' => $d->DHCPEnabled,
				'networkName' => $d->networkName,
				'dhcpServer' => $dhcpserver
			);
			$d->releaseRemote();
		}

		return $response;
	}


	/**
	 * Save host-only interface information
	 *
	 * @param array $args array of arguments. See function body for details.
	 * @return boolean true on success
	 */
	public function remote_hostOnlyInterfacesSave($args) {

		// Connect to vboxwebsrv
		$this->connect();

		$nics = $args['networkInterfaces'];

		for($i = 0; $i < count($nics); $i++) {

			/* @var $nic IHostNetworkInterface */
			$nic = $this->vbox->host->findHostNetworkInterfaceById($nics[$i]['id']);

			// Common settings
			if($nic->IPAddress != $nics[$i]['IPAddress'] || $nic->networkMask != $nics[$i]['networkMask']) {
				$nic->enableStaticIPConfig($nics[$i]['IPAddress'],$nics[$i]['networkMask']);
			}
			if($nics[$i]['IPV6Supported'] &&
				($nic->IPV6Address != $nics[$i]['IPV6Address'] || $nic->IPV6NetworkMaskPrefixLength != $nics[$i]['IPV6NetworkMaskPrefixLength'])) {
				$nic->enableStaticIPConfigV6($nics[$i]['IPV6Address'],intval($nics[$i]['IPV6NetworkMaskPrefixLength']));
			}

			// Get DHCP Info
			try {
				$dhcp = $this->vbox->findDHCPServerByNetworkName($nic->networkName);
			} catch (Exception $e) {$dhcp = null;};

			// Create DHCP server?
			if((bool)@$nics[$i]['dhcpServer']['enabled'] && !$dhcp) {
				$dhcp = $this->vbox->createDHCPServer($nic->networkName);
			}
			if($dhcp->handle) {
				$dhcp->enabled = @$nics[$i]['dhcpServer']['enabled'];
				$dhcp->setConfiguration($nics[$i]['dhcpServer']['IPAddress'],$nics[$i]['dhcpServer']['networkMask'],$nics[$i]['dhcpServer']['lowerIP'],$nics[$i]['dhcpServer']['upperIP']);
				$dhcp->releaseRemote();
			}
			$nic->releaseRemote();

		}

		return true;

	}

	/**
	 * Add Host-only interface
	 *
	 * @param array $args array of arguments. See function body for details.
	 * @return array response data
	 */
	public function remote_hostOnlyInterfaceCreate($args) {

		// Connect to vboxwebsrv
		$this->connect();

		/* @var $progress IProgress */
		list($int,$progress) = $this->vbox->host->createHostOnlyNetworkInterface();
		$int->releaseRemote();

		// Does an exception exist?
		try {
			if($progress->errorInfo->handle) {
				$this->errors[] = new Exception($progress->errorInfo->text);
				$progress->releaseRemote();
				return false;
			}
		} catch (Exception $null) {}

		// Save progress
		$this->_util_progressStore($progress);

		return array('progress' => $progress->handle);


	}


	/**
	 * Remove a host-only interface
	 *
	 * @param array $args array of arguments. See function body for details.
	 * @return array response data
	 */
	public function remote_hostOnlyInterfaceRemove($args) {

		// Connect to vboxwebsrv
		$this->connect();

		/* @var $progress IProgress */
		$progress = $this->vbox->host->removeHostOnlyNetworkInterface($args['id']);

		if(!$progress->handle) return false;

		// Does an exception exist?
		try {
			if($progress->errorInfo->handle) {
				$this->errors[] = new Exception($progress->errorInfo->text);
				$progress->releaseRemote();
				return false;
			}
		} catch (Exception $null) {}

		// Save progress
		$this->_util_progressStore($progress);

		return array('progress' => $progress->handle);

	}

	/**
	 * Get a list of Guest OS Types supported by this VirtualBox installation
	 *
	 * @param unused $args
	 * @return array of os types
	 */
	public function remote_vboxGetGuestOSTypes($args) {

		// Connect to vboxwebsrv
		$this->connect();

		$response = array();

		$ts = $this->vbox->getGuestOSTypes();

		$supp64 = ($this->vbox->host->getProcessorFeature('LongMode') && $this->vbox->host->getProcessorFeature('HWVirtEx'));

		foreach($ts as $g) { /* @var $g IGuestOSType */

			// Avoid multiple calls
			$bit64 = $g->is64Bit;
			$response[] = array(
				'familyId' => $g->familyId,
				'familyDescription' => $g->familyDescription,
				'id' => $g->id,
				'description' => $g->description,
				'is64Bit' => $bit64,
				'recommendedRAM' => $g->recommendedRAM,
				'recommendedHDD' => ($g->recommendedHDD/1024)/1024,
				'supported' => (bool)(!$bit64 || $supp64)
			);
		}

		return $response;
	}

	/**
	 * Set virtual machine state. Running, power off, save state, pause, etc..
	 *
	 * @param array $args array of arguments. See function body for details.
	 * @return array response data or boolean true on success
	 */
	public function remote_machineSetState($args) {

		$vm = $args['vm'];
		$state = $args['state'];

		$states = array(
			'powerDown' => array('result'=>'PoweredOff','progress'=>2),
			'reset' => array(),
			'saveState' => array('result'=>'Saved','progress'=>2),
			'powerButton' => array('acpi'=>true),
			'sleepButton' => array('acpi'=>true),
			'pause' => array('result'=>'Paused','progress'=>false),
			'resume' => array('result'=>'Running','progress'=>false),
			'powerUp' => array('result'=>'Running'),
			'discardSavedState' => array('result'=>'poweredOff','lock'=>'shared','force'=>true)
		);

		// Check for valid state
		if(!is_array($states[$state])) {
			throw new Exception('Invalid state: ' . $state);
		}

		// Connect to vboxwebsrv
		$this->connect();

		// Machine state
		/* @var $machine IMachine */
		$machine = $this->vbox->findMachine($vm);
		$mstate = (string)$machine->state;

		if (@$this->settings->enforceVMOwnership && !$this->skipSessionCheck && ($owner = $machine->getExtraData("phpvb/sso/owner")) && $owner !== $_SESSION['user'] && !$_SESSION['admin'] )
		{
			// skip this VM as it is not owned by the user we're logged in as
			throw new Exception("Not authorized to change state of this VM");
		}

		// If state has an expected result, check
		// that we are not already in it
		if($states[$state]['result']) {
			if($mstate == $states[$state]['result']) {
				$machine->releaseRemote();
				return false;
			}
		}

		// Special case for power up
		if($state == 'powerUp' && $mstate == 'Paused')
			$state = 'resume';

		if($state == 'powerUp') {


			# Try opening session for VM
			try {

				// create session
				$this->session = $this->websessionManager->getSessionObject($this->vbox->handle);

				// set first run
				if($machine->getExtraData('GUI/FirstRun') == 'yes') {
					$machine->lockMachine($this->session->handle, 'Write');
					$this->session->machine->setExtraData('GUI/FirstRun', 'no');
					$this->session->unlockMachine();
				}

				/* @var $progress IProgress */
				$progress = $machine->launchVMProcess($this->session->handle, "headless", NULL);

			} catch (Exception $e) {
				// Error opening session
				$this->errors[] = $e;
				return false;
			}

			// Does an exception exist?
			try {
				if($progress->errorInfo->handle) {
					$this->errors[] = new Exception($progress->errorInfo->text);
					$progress->releaseRemote();
					return false;
				}
			} catch (Exception $null) {
			}

			$this->_util_progressStore($progress);

			return array('progress' => $progress->handle);


		}

		// Open session to machine
		$this->session = $this->websessionManager->getSessionObject($this->vbox->handle);

		// Lock machine
		$machine->lockMachine($this->session->handle,($states[$state]['lock'] == 'write' ? 'Write' : 'Shared'));

		// If this operation returns a progress object save progress
		$progress = null;
		if($states[$state]['progress']) {

			/* @var $progress IProgress */
			if($state == 'saveState') {
				$progress = $this->session->machine->saveState();
			} else {
				$progress = $this->session->console->$state();
			}

			if(!$progress->handle) {

				// should never get here
				try {
					$this->session->unlockMachine();
					$this->session = null;
				} catch (Exception $e) {};

				$machine->releaseRemote();

				throw new Exception('Unknown error settings machine to requested state.');
			}

			// Does an exception exist?
			try {
				if($progress->errorInfo->handle) {
					$this->errors[] = new Exception($progress->errorInfo->text);
					$progress->releaseRemote();
					return false;
				}
			} catch (Exception $null) {}

			// Save progress
			$this->_util_progressStore($progress);

			return array('progress' => $progress->handle);

		// Operation does not return a progress object
		// Just call the function
		} else {

			if($state == 'discardSavedState') {
				$this->session->machine->$state(($states[$state]['force'] ? true : null));
			} else {
				$this->session->console->$state(($states[$state]['force'] ? true : null));
			}

		}

		$vmname = $machine->name;
		$machine->releaseRemote();

		// Check for ACPI button
		if($states[$state]['acpi'] && !$this->session->console->getPowerButtonHandled()) {
			$this->session->console->releaseRemote();
			$this->session->unlockMachine();
			$this->session = null;
			return false;
		}


		if(!$progress->handle) {
			$this->session->console->releaseRemote();
			$this->session->unlockMachine();
			unset($this->session);
		}

		return true;

	}


	/**
	 * Get VirtualBox host memory usage information
	 *
	 * @param unused $args
	 * @return array response data
	 */
	public function remote_hostGetMeminfo($args) {

		// Connect to vboxwebsrv
		$this->connect();

		return $this->vbox->host->memoryAvailable;

	}

	/**
	 * Get VirtualBox host details
	 *
	 * @param unused $args
	 * @return array response data
	 */
	public function remote_hostGetDetails($args) {

		// Connect to vboxwebsrv
		$this->connect();

		/* @var $host IHost */
		$host = &$this->vbox->host;
		$response = array(
			'id' => 'host',
			'operatingSystem' => $host->operatingSystem,
			'OSVersion' => $host->OSVersion,
			'memorySize' => $host->memorySize,
			//'acceleration3DAvailable' => $host->acceleration3DAvailable,
			// changes in 7.1
			// hardcode true so the checkbox would always be enabled in the UI
			// when selected, should fail with an error message if actually not available
			'acceleration3DAvailable' => true,
			'cpus' => array(),
			'networkInterfaces' => array(),
			'DVDDrives' => array(),
			'floppyDrives' => array()
		);

		/*
		 * Processors
		 */
		// TODO https://github.com/phpvirtualbox/phpvirtualbox/issues/53
		$response['cpus'][0] = $host->getProcessorDescription(0);
		for($i = 1; $i < $host->processorCount; $i++) {
			$response['cpus'][$i] = $response['cpus'][0];
		}

		/*
		 * Supported CPU features?
		 */
		$response['cpuFeatures'] = array();
		foreach(array('HWVirtEx'=>'HWVirtEx','PAE'=>'PAE','NestedPaging'=>'Nested Paging','LongMode'=>'Long Mode (64-bit)'
		,'UnrestrictedGuest'=>'Unrestricted Guest','NestedHWVirt'=>'Nested Virtualization') as $k=>$v) {
			$response['cpuFeatures'][$v] = $host->getProcessorFeature($k);
		}

		/*
		 * NICs
		 */
		foreach($host->networkInterfaces as $d) { /* @var $d IHostNetworkInterface */
			$response['networkInterfaces'][] = array(
				'name' => $d->name,
				'IPAddress' => $d->IPAddress,
				'networkMask' => $d->networkMask,
				'IPV6Supported' => $d->IPV6Supported,
				'IPV6Address' => $d->IPV6Address,
				'IPV6NetworkMaskPrefixLength' => $d->IPV6NetworkMaskPrefixLength,
				'status' => (string)$d->status,
				'mediumType' => (string)$d->mediumType,
				'interfaceType' => (string)$d->interfaceType,
				'hardwareAddress' => $d->hardwareAddress,
				'networkName' => $d->networkName,
			);
			$d->releaseRemote();
		}

		/*
		 * Medium types (DVD and Floppy)
		 */
		foreach($host->DVDDrives as $d) { /* @var $d IMedium */

			$response['DVDDrives'][] = array(
				'id' => $d->id,
				'name' => $d->name,
				'location' => $d->location,
				'description' => $d->description,
				'deviceType' => 'DVD',
				'hostDrive' => true
			);
			$d->releaseRemote();
		}

		foreach($host->floppyDrives as $d) { /* @var $d IMedium */

			$response['floppyDrives'][] = array(
				'id' => $d->id,
				'name' => $d->name,
				'location' => $d->location,
				'description' => $d->description,
				'deviceType' => 'Floppy',
				'hostDrive' => true,
			);
			$d->releaseRemote();
		}
		$host->releaseRemote();

		return $response;
	}

	/**
	 * Get a list of USB devices attached to the VirtualBox host
	 *
	 * @param unused $args
	 * @return array of USB devices
	 */
	public function remote_hostGetUSBDevices($args) {

		// Connect to vboxwebsrv
		$this->connect();

		$response = array();

		foreach($this->vbox->host->USBDevices as $d) { /* @var $d IUSBDevice */

			$response[] = array(
				'id' => $d->id,
				'vendorId' => sprintf('%04s',dechex($d->vendorId)),
				'productId' => sprintf('%04s',dechex($d->productId)),
				'revision' => sprintf('%04s',dechex($d->revision)),
				'manufacturer' => $d->manufacturer,
				'product' => $d->product,
				'serialNumber' => $d->serialNumber,
				'address' => $d->address,
				'port' => $d->port,
				'portPath' => $d->portPath,
				'version' => $d->version,
				'speed' => $d->speed,
				'remote' => $d->remote,
				'deviceInfo' => $d->deviceInfo,
				'backend' => $d->backend,
				);
			$d->releaseRemote();
		}

		return $response;
	}


	/**
	 * Get virtual machine or virtualbox host details
	 *
	 * @param array $args array of arguments. See function body for details.
	 * @param ISnapshot $snapshot snapshot instance to use if obtaining snapshot details.
	 * @see hostGetDetails()
	 * @return array machine details
	 */
	public function remote_machineGetDetails($args, $snapshot=null) {

		// Host instead of vm info
		if($args['vm'] == 'host') {

			$response = $this->remote_hostGetDetails($args);

			return $response;
		}


		// Connect to vboxwebsrv
		$this->connect();

		//Get registered machine or snapshot machine
		if($snapshot) {

			/* @var $machine ISnapshot */
			$machine = &$snapshot;

		} else {

			/* @var $machine IMachine */
			$machine = $this->vbox->findMachine($args['vm']);


			// For correct caching, always use id even if a name was passed
			$args['vm'] = $machine->id;

			// Check for accessibility
			if(!$machine->accessible) {

				return array(
					'name' => $machine->id,
					'state' => 'Inaccessible',
					'OSTypeId' => 'Other',
					'id' => $machine->id,
					'sessionState' => 'Inaccessible',
					'accessible' => 0,
					'accessError' => array(
						'resultCode' => $this->_util_resultCodeText($machine->accessError->resultCode),
						'component' => $machine->accessError->component,
						'text' => $machine->accessError->text)
				);
			}

		}

		// Basic data
		$data = $this->_machineGetDetails($machine);

		// Network Adapters
		$data['networkAdapters'] = $this->_machineGetNetworkAdapters($machine);

		// Storage Controllers
		$data['storageControllers'] = $this->_machineGetStorageControllers($machine);

		// Serial Ports
		$data['serialPorts'] = $this->_machineGetSerialPorts($machine);

		// LPT Ports
		$data['parallelPorts'] = $this->_machineGetParallelPorts($machine);

		// Shared Folders
		$data['sharedFolders'] = $this->_machineGetSharedFolders($machine);

		// USB Controllers
		$data['USBControllers'] = $this->_machineGetUSBControllers($machine);
		$data['USBDeviceFilters'] = $this->_machineGetUSBDeviceFilters($machine);


		if (@$this->settings->enforceVMOwnership )
		{
			$data['name'] = preg_replace('/^' . preg_quote($_SESSION['user']) . '_/', '', $data['name']);
		}

		// Items when not obtaining snapshot machine info
		if(!$snapshot) {

			$data['currentSnapshot'] = ($machine->currentSnapshot->handle ? array('id'=>$machine->currentSnapshot->id,'name'=>$machine->currentSnapshot->name) : null);
			$data['snapshotCount'] = $machine->snapshotCount;

			// Start / stop config
			if(@$this->settings->startStopConfig) {
				$data['startupMode'] = $machine->getExtraData('pvbx/startupMode');
			}


		}

		$machine->releaseRemote();

		$data['accessible'] = 1;
		return $data;
	}

	/**
	 * Get runtime data of machine.
	 *
	 * @param array $args array of arguments. See function body for details.
	 * @return array of machine runtime data
	 */
	public function remote_machineGetRuntimeData($args) {

		$this->connect();

		/* @var $machine IMachine */
		$machine = $this->vbox->findMachine($args['vm']);
		$data = array(
			'id' => $args['vm'],
			'state' => (string)$machine->state
		);

		/*
		 * TODO:
		 *
		 * 5.13.13 getGuestEnteredACPIMode
		boolean IConsole::getGuestEnteredACPIMode()
		Checks if the guest entered the ACPI mode G0 (working) or G1 (sleeping). If this method
		returns false, the guest will most likely not respond to external ACPI events.
		If this method fails, the following error codes may be reported:
		 VBOX_E_INVALID_VM_STATE: Virtual machine not in Running state.
		*/

		// Get current console port
		if($data['state'] == 'Running' || $data['state'] == 'Paused') {

			$this->session = $this->websessionManager->getSessionObject($this->vbox->handle);
			$machine->lockMachine($this->session->handle, 'Shared');
			$console = $this->session->console;

			// Get guest additions version
			if(@$this->settings->enableGuestAdditionsVersionDisplay) {
				$data['guestAdditionsVersion'] = $console->guest->additionsVersion;
			}

			$smachine = $this->session->machine;

			$data['CPUExecutionCap'] = $smachine->CPUExecutionCap;
			$data['VRDEServerInfo'] = array('port' => $console->VRDEServerInfo->port);

			$vrde = $smachine->VRDEServer;

			$data['VRDEServer'] = (!$vrde ? null : array(
					'enabled' => $vrde->enabled,
					'ports' => $vrde->getVRDEProperty('TCP/Ports'),
					'netAddress' => $vrde->getVRDEProperty('TCP/Address'),
					'VNCPassword' => $vrde->getVRDEProperty('VNCPassword'),
					'authType' => (string)$vrde->authType,
					'authTimeout' => $vrde->authTimeout,
					'VRDEExtPack' => (string)$vrde->VRDEExtPack
			));

			// Get removable media
			$data['storageControllers'] = $this->_machineGetStorageControllers($smachine);

			// Get network adapters
			$data['networkAdapters'] = $this->_machineGetNetworkAdapters($smachine);

			$machine->releaseRemote();

			// Close session and unlock machine
			$this->session->unlockMachine();
			unset($this->session);

		}


		return $data;

	}

	/**
	 * Remove a virtual machine
	 *
	 * @param array $args array of arguments. See function body for details.
	 * @return boolean true on success or array of response data
	 */
	public function remote_machineRemove($args) {

		// Connect to vboxwebsrv
		$this->connect();

		/* @var $machine IMachine */
		$machine = $this->vbox->findMachine($args['vm']);

		// Only unregister or delete?
		if(!$args['delete']) {

			$machine->unregister('DetachAllReturnNone');
			$machine->releaseRemote();

		} else {

			$hds = array();
			$delete = $machine->unregister('DetachAllReturnHardDisksOnly');
			foreach($delete as $hd) {
				$hds[] = $this->vbox->openMedium($hd->location,'HardDisk','ReadWrite',false)->handle;
			}

			/* @var $progress IProgress */
			$progress = $machine->deleteConfig($hds);

			$machine->releaseRemote();

			// Does an exception exist?
			if($progress) {
				try {
					if($progress->errorInfo->handle) {
						$this->errors[] = new Exception($progress->errorInfo->text);
						$progress->releaseRemote();
						return false;
					}
				} catch (Exception $null) {}

				$this->_util_progressStore($progress);

				return array('progress' => $progress->handle);

			}


		}

		return true;


	}


	/**
	 * Create a new Virtual Machine
	 *
	 * @param array $args array of arguments. See function body for details.
	 * @return boolean true on success
	 */
	public function remote_machineCreate($args) {

		// Connect to vboxwebsrv
		$this->connect();

		$response = array();

		// quota enforcement
		if ( isset($_SESSION['user']) )
		{
			if ( @isset($this->settings->vmQuotaPerUser) && @$this->settings->vmQuotaPerUser > 0 && !$_SESSION['admin'] )
			{
				$newresp = array('data' => array());
				$this->vboxGetMachines(array(), array(&$newresp));
				if ( count($newresp['data']['responseData']) >= $this->settings->vmQuotaPerUser )
				{
					// we're over quota!
					// delete the disk we just created
					if ( isset($args['disk']) )
					{
						$this->mediumRemove(array(
								'medium' => $args['disk'],
								'type' => 'HardDisk',
								'delete' => true
							), $newresp);
					}
					throw new Exception("Sorry, you're over quota. You can only create up to {$this->settings->vmQuotaPerUser} VMs.");
				}
			}
		}

		// create machine
		if (@$this->settings->enforceVMOwnership )
			$args['name'] = $_SESSION['user'] . '_' . $args['name'];

		/* Check if file exists */
		$filename = $this->vbox->composeMachineFilename($args['name'],($this->settings->phpVboxGroups ? '' : $args['group']),$this->vbox->systemProperties->defaultMachineFolder,null);

		if($this->remote_fileExists(array('file'=>$filename))) {
			return array('exists' => $filename);
		}


		/* @var $m IMachine */
		$m = $this->vbox->createMachine(null,$args['name'],"x86",($this->settings->phpVboxGroups ? '' : $args['group']),$args['ostype'],null,null,null,null);

		/* Check for phpVirtualBox groups */
		if($this->settings->phpVboxGroups && $args['group']) {
			$m->setExtraData(vboxconnector::phpVboxGroupKey, $args['group']);
		}

		// Set memory
		$m->memorySize = intval($args['memory']);


		// Save and register
		$m->saveSettings();
		$this->vbox->registerMachine($m->handle);
		$vm = $m->id;
		$m->releaseRemote();

		try {

			$this->session = $this->websessionManager->getSessionObject($this->vbox->handle);

			// Lock VM
			/* @var $machine IMachine */
			$machine = $this->vbox->findMachine($vm);
			$machine->lockMachine($this->session->handle,'Write');

			// OS defaults
			$defaults = $this->vbox->getGuestOSType($args['ostype']);

			// Ownership enforcement
			if ( isset($_SESSION['user']) )
			{
				$this->session->machine->setExtraData('phpvb/sso/owner', $_SESSION['user']);
			}

			// set the vboxauthsimple in VM config
			$this->session->machine->setExtraData('VBoxAuthSimple/users/'.$_SESSION['user'].'', $_SESSION['uHash']);

			// Always set
			$this->session->machine->setExtraData('GUI/FirstRun', 'yes');

			try {
				if($this->session->machine->VRDEServer && $this->vbox->systemProperties->defaultVRDEExtPack) {
					$this->session->machine->VRDEServer->enabled = 1;
					$this->session->machine->VRDEServer->authTimeout = 5000;
					$this->session->machine->VRDEServer->setVRDEProperty('TCP/Ports',($this->settings->vrdeports ? $this->settings->vrdeports : '3390-5000'));
					$this->session->machine->VRDEServer->setVRDEProperty('TCP/Address',($this->settings->vrdeaddress ? $this->settings->vrdeaddress : '127.0.0.1'));
				}
			} catch (Exception $e) {
				//Ignore
			}

			// Other defaults
			$this->session->machine->FirmwareSettings->IOAPICEnabled = $defaults->recommendedIOAPIC;
			$this->session->machine->Platform->RTCUseUTC = $defaults->recommendedRTCUseUTC;
			$this->session->machine->FirmwareSettings->firmwareType = (string)$defaults->recommendedFirmware;
			$this->session->machine->Platform->chipsetType = (string)$defaults->recommendedChipset;
			$this->session->machine->ClipboardMode = 'Disabled';
			if(intval($defaults->recommendedVRAM) > 0) $this->session->machine->GraphicsAdapter->setVRAMSize(intval($defaults->recommendedVRAM));
			$this->session->machine->GraphicsAdapter->setGraphicsControllerType((string)$defaults->recommendedGraphicsController);
			$this->session->machine->Platform->X86->setCpuProperty('PAE',$defaults->recommendedPAE);

			// USB input devices
			if($defaults->recommendedUSBHid) {
				$this->session->machine->pointingHIDType = 'USBMouse';
				$this->session->machine->keyboardHIDType = 'USBKeyboard';
			}

			/* Only if acceleration configuration is available */
			if($this->vbox->host->getProcessorFeature('HWVirtEx')) {
				$this->session->machine->Platform->X86->setHWVirtExProperty('Enabled',$defaults->recommendedVirtEx);
			}

			/*
			 * Hard Disk and DVD/CD Drive
			 */
			$DVDbusType = (string)$defaults->recommendedDVDStorageBus;
			$DVDconType = (string)$defaults->recommendedDVDStorageController;

			// Attach harddisk?
			if($args['disk']) {

				$HDbusType = (string)$defaults->recommendedHDStorageBus;
				$HDconType = (string)$defaults->recommendedHDStorageController;

				$bus = new StorageBus(null,$HDbusType);
				$sc = $this->session->machine->addStorageController(trans($HDbusType,'UIMachineSettingsStorage'),(string)$bus);
				$sc->controllerType = $HDconType;
				$sc->useHostIOCache = (bool)$this->vbox->systemProperties->getDefaultIoCacheSettingForStorageController($HDconType);

				// Set port count?
				if($HDbusType == 'SATA') {
					$sc->portCount = (($HDbusType == $DVDbusType) ? 2 : 1);
				}

				$sc->releaseRemote();

				$m = $this->vbox->openMedium($args['disk'],'HardDisk','ReadWrite',false);

				$this->session->machine->attachDevice(trans($HDbusType,'UIMachineSettingsStorage'),0,0,'HardDisk',$m->handle);

				$m->releaseRemote();

			}

			// Attach DVD/CDROM
			if($DVDbusType) {

				if(!$args['disk'] || ($HDbusType != $DVDbusType)) {

					$bus = new StorageBus(null,$DVDbusType);
					$sc = $this->session->machine->addStorageController(trans($DVDbusType,'UIMachineSettingsStorage'),(string)$bus);
					$sc->controllerType = $DVDconType;
					$sc->useHostIOCache = (bool)$this->vbox->systemProperties->getDefaultIoCacheSettingForStorageController($DVDconType);

					// Set port count?
					if($DVDbusType == 'SATA') {
						$sc->portCount = ($args['disk'] ? 1 : 2);
					}

					$sc->releaseRemote();
				}

				$this->session->machine->attachDevice(trans($DVDbusType,'UIMachineSettingsStorage'),1,0,'DVD',null);

			}

			$this->session->machine->saveSettings();
			$this->session->unlockMachine();
			$this->session = null;

			$machine->releaseRemote();

		} catch (Exception $e) {
			$this->errors[] = $e;
			return false;
		}

		return true;

	}


	/**
	 * Return a list of network adapters attached to machine $m
	 *
	 * @param IMachine $m virtual machine instance
	 * @param int $slot optional slot of single network adapter to get
	 * @return array of network adapter information
	 */
	private function _machineGetNetworkAdapters(&$m, $slot=false) {

		$adapters = array();

		for($i = ($slot === false ? 0 : $slot); $i < ($slot === false ? $this->settings->nicMax : ($slot+1)); $i++) {

			/* @var $n INetworkAdapter */
			$n = $m->getNetworkAdapter($i);

			// Avoid duplicate calls
			$at = (string)$n->attachmentType;
			if($at == 'NAT') $nd = $n->NATEngine; /* @var $nd INATEngine */
			else $nd = null;

			$props = $n->getProperties(null);
			$props = implode("\n",array_map(function($a,$b){return "$a=$b";},$props[1],$props[0]));

			$adapters[] = array(
				'adapterType' => (string)$n->adapterType,
				'slot' => $n->slot,
				'enabled' => $n->enabled,
				'MACAddress' => $n->MACAddress,
				'attachmentType' => $at,
				'genericDriver' => $n->genericDriver,
				'hostOnlyInterface' => $n->hostOnlyInterface,
				'bridgedInterface' => $n->bridgedInterface,
				'properties' => $props,
				'internalNetwork' => $n->internalNetwork,
				'NATNetwork' => $n->NATNetwork,
				'promiscModePolicy' => (string)$n->promiscModePolicy,
				'VDENetwork' => ($this->settings->enableVDE ? $n->VDENetwork : ''),
				'cableConnected' => $n->cableConnected,
				'NATEngine' => ($at == 'NAT' ?
					array('aliasMode' => intval($nd->aliasMode),'DNSPassDomain' => $nd->DNSPassDomain, 'DNSProxy' => $nd->DNSProxy, 'DNSUseHostResolver' => $nd->DNSUseHostResolver, 'hostIP' => $nd->hostIP)
					: array('aliasMode' => 0,'DNSPassDomain' => 0, 'DNSProxy' => 0, 'DNSUseHostResolver' => 0, 'hostIP' => '')),
				'lineSpeed' => $n->lineSpeed,
				'redirects' => (
					$at == 'NAT' ?
					$nd->getRedirects()
					: array()
				)
			);

			$n->releaseRemote();
		}

		return $adapters;

	}


	/**
	 * Return a list of virtual machines along with their states and other basic info
	 *
	 * @param array $args array of arguments. See function body for details.
	 * @return array list of machines
	 */
	public function remote_vboxGetMachines($args) {

		// Connect to vboxwebsrv
		$this->connect();

		$vmlist = array();

		// Look for a request for a single vm
		if($args['vm']) {

			$machines = array($this->vbox->findMachine($args['vm']));

		// Full list
		} else {
			//Get a list of registered machines
			$machines = $this->vbox->machines;

		}



		foreach ($machines as $machine) { /* @var $machine IMachine */


			try {

				if(!$machine->accessible) {

					$vmlist[] = array(
						'name' => $machine->id,
						'state' => 'Inaccessible',
						'OSTypeId' => 'Other',
						'id' => $machine->id,
						'sessionState' => 'Inaccessible',
						'accessible' => 0,
						'accessError' => array(
							'resultCode' => $this->_util_resultCodeText($machine->accessError->resultCode),
							'component' => $machine->accessError->component,
							'text' => $machine->accessError->text),
						'lastStateChange' => 0,
						'groups' => array(),
						'currentSnapshot' => ''

					);

					continue;
				}

				if($this->settings->phpVboxGroups) {
					$groups = explode(',',$machine->getExtraData(vboxconnector::phpVboxGroupKey));
					if(!is_array($groups) || (count($groups) == 1 && !$groups[0])) $groups = array("/");
				} else {
					$groups = $machine->groups;
				}

				usort($groups, 'strnatcasecmp');

				$vmlist[] = array(
					'name' => @$this->settings->enforceVMOwnership ? preg_replace('/^' . preg_quote($_SESSION['user']) . '_/', '', $machine->name) : $machine->name,
					'state' => (string)$machine->state,
					'OSTypeId' => $machine->getOSTypeId(),
					'owner' => (@$this->settings->enforceVMOwnership ? $machine->getExtraData("phpvb/sso/owner") : ''),
					'groups' => $groups,
					'lastStateChange' => (string)($machine->lastStateChange/1000),
					'id' => $machine->id,
					'currentStateModified' => $machine->currentStateModified,
					'sessionState' => (string)$machine->sessionState,
					'currentSnapshotName' => ($machine->currentSnapshot->handle ? $machine->currentSnapshot->name : ''),
					'customIcon' => (@$this->settings->enableCustomIcons ? $machine->getExtraData('phpvb/icon') : '')
				);
				if($machine->currentSnapshot->handle) $machine->currentSnapshot->releaseRemote();


			} catch (Exception $e) {

				if($machine) {

					$vmlist[] = array(
						'name' => $machine->id,
						'state' => 'Inaccessible',
						'OSTypeId' => 'Other',
						'id' => $machine->id,
						'sessionState' => 'Inaccessible',
						'lastStateChange' => 0,
						'groups' => array(),
						'currentSnapshot' => ''
					);

				} else {
					$this->errors[] = $e;
				}
			}

			try {
				$machine->releaseRemote();
			} catch (Exception $e) { }
		}

		return $vmlist;

	}

	/**
	 * Creates a new exception so that input can be debugged.
	 *
	 * @param array $args array of arguments. See function body for details.
	 * @return boolean true on success
	 */
	public function debugInput($args) {
		$this->errors[] = new Exception('debug');
		return true;
	}

	/**
	 * Get a list of media registered with VirtualBox
	 *
	 * @param unused $args
	 * @param array $response response data passed byref populated by the function
	 * @return array of media
	 */
	public function remote_vboxGetMedia($args) {

		// Connect to vboxwebsrv
		$this->connect();

		$response = array();
		$mds = array($this->vbox->hardDisks,$this->vbox->DVDImages,$this->vbox->floppyImages);
		for($i=0;$i<3;$i++) {
			foreach($mds[$i] as $m) {
				/* @var $m IMedium */
				$response[] = $this->_mediumGetDetails($m);
				$m->releaseRemote();
			}
		}
		return $response;
	}

	/**
	 * Get USB controller information
	 *
	 * @param IMachine $m virtual machine instance
	 * @return array USB controller info
	 */
	private function _machineGetUSBControllers(&$m) {

		/* @var $u IUSBController */
		$controllers = &$m->USBControllers;

		$rcons = array();
		foreach($controllers as $c) {
			$rcons[] = array(
				'name' => $c->name,
				'type' => (string)$c->type
			);
			$c->releaseRemote();
		}

		return $rcons;
	}

	/**
	 * Get USB device filters
	 *
	 * @param IMachine $m virtual machine instance
	 * @return array USB device filters
	 */
	private function _machineGetUSBDeviceFilters(&$m) {

		$deviceFilters = array();
		foreach($m->USBDeviceFilters->deviceFilters as $df) { /* @var $df IUSBDeviceFilter */

			$deviceFilters[] = array(
				'name' => $df->name,
				'active' => $df->active,
				'vendorId' => $df->vendorId,
				'productId' => $df->productId,
				'revision' => $df->revision,
				'manufacturer' => $df->manufacturer,
				'product' => $df->product,
				'serialNumber' => $df->serialNumber,
				'port' => $df->port,
				'remote' => $df->remote
				);
			$df->releaseRemote();
		}
		return $deviceFilters;
	}

	/**
	 * Return top-level virtual machine or snapshot information
	 *
	 * @param IMachine $m virtual machine instance
	 * @return array vm or snapshot data
	 */
	private function _machineGetDetails(&$m) {

		if($this->settings->phpVboxGroups) {
			$groups = explode(',',$m->getExtraData(vboxconnector::phpVboxGroupKey));
			if(!is_array($groups) || (count($groups) == 1 && !$groups[0])) $groups = array("/");
		} else {
			$groups = $m->groups;
		}

		usort($groups, 'strnatcasecmp');

		return array(
			'name' => @$this->settings->enforceVMOwnership ? preg_replace('/^' . preg_quote($_SESSION['user']) . '_/', '', $m->name) : $m->name,
			'description' => $m->description,
			'groups' => $groups,
			'id' => $m->id,
			'autostopType' => ($this->settings->vboxAutostartConfig ? (string)$m->autostopType : ''),
			'autostartEnabled' => ($this->settings->vboxAutostartConfig && $m->autostartEnabled),
			'autostartDelay' => ($this->settings->vboxAutostartConfig ? intval($m->autostartDelay) : '0'),
			'settingsFilePath' => $m->settingsFilePath,
			'paravirtProvider' => (string)$m->paravirtProvider,
			'OSTypeId' => $m->OSTypeId,
			'OSTypeDesc' => $this->vbox->getGuestOSType($m->OSTypeId)->description,
			'CPUCount' => $m->CPUCount,
			'HPETEnabled' => $m->Platform->X86->HPETEnabled,
			'memorySize' => $m->memorySize,
			'VRAMSize' => $m->GraphicsAdapter->VRAMSize,
			'graphicsControllerType' => (string)$m->GraphicsAdapter->graphicsControllerType,
			'pointingHIDType' => (string)$m->pointingHIDType,
			'keyboardHIDType' => (string)$m->keyboardHIDType,
			'accelerate2DVideoEnabled' => $m->GraphicsAdapter->isFeatureEnabled("Acceleration2DVideo"),
			'accelerate3DEnabled' => $m->GraphicsAdapter->isFeatureEnabled("Acceleration3D"),
			'BIOSSettings' => array(
				'ACPIEnabled' => $m->FirmwareSettings->ACPIEnabled,
				'IOAPICEnabled' => $m->FirmwareSettings->IOAPICEnabled,
				'timeOffset' => $m->FirmwareSettings->timeOffset
			),
			'firmwareType' => (string)$m->FirmwareSettings->firmwareType,
			'snapshotFolder' => $m->snapshotFolder,
			'ClipboardMode' => (string)$m->ClipboardMode,
			'monitorCount' => $m->GraphicsAdapter->monitorCount,
			'pageFusionEnabled' => $m->pageFusionEnabled,
			'VRDEServer' => (!$m->VRDEServer ? null : array(
				'enabled' => $m->VRDEServer->enabled,
				'ports' => $m->VRDEServer->getVRDEProperty('TCP/Ports'),
				'netAddress' => $m->VRDEServer->getVRDEProperty('TCP/Address'),
				'VNCPassword' => $m->VRDEServer->getVRDEProperty('VNCPassword'),
				'authType' => (string)$m->VRDEServer->authType,
				'authTimeout' => $m->VRDEServer->authTimeout,
				'allowMultiConnection' => $m->VRDEServer->allowMultiConnection,
				'VRDEExtPack' => (string)$m->VRDEServer->VRDEExtPack
				)),
			'audioAdapter' => array(
				'enabled' => $m->audioSettings->Adapter->enabled,
				'audioController' => (string)$m->audioSettings->Adapter->audioController,
				'audioDriver' => (string)$m->audioSettings->Adapter->audioDriver,
				),
			'RTCUseUTC' => $m->Platform->RTCUseUTC,
			'EffectiveParavirtProvider' => (string)$m->getEffectiveParavirtProvider(),
			'HWVirtExProperties' => array(
				'Enabled' => $m->Platform->X86->getHWVirtExProperty('Enabled'),
				'NestedPaging' => $m->Platform->X86->getHWVirtExProperty('NestedPaging'),
				'LargePages' => $m->Platform->X86->getHWVirtExProperty('LargePages'),
				'UnrestrictedExecution' => $m->Platform->X86->getHWVirtExProperty('UnrestrictedExecution'),
				'VPID' => $m->Platform->X86->getHWVirtExProperty('VPID')
				),
			'CpuProperties' => array(
				'PAE' => $m->Platform->X86->getCpuProperty('PAE'),
				'HWVirt' => $m->Platform->X86->getCpuProperty('HWVirt')
				),
			'bootOrder' => $this->_machineGetBootOrder($m),
			'chipsetType' => (string)$m->Platform->chipsetType,
			'GUI' => array(
				'FirstRun' => $m->getExtraData('GUI/FirstRun'),
			),
			'customIcon' => (@$this->settings->enableCustomIcons ? $m->getExtraData('phpvb/icon') : ''),
			'disableHostTimeSync' => intval($m->getExtraData("VBoxInternal/Devices/VMMDev/0/Config/GetHostTimeDisabled")),
			'CPUExecutionCap' => $m->CPUExecutionCap
		);

	}

	/**
	 * Get virtual machine boot order
	 *
	 * @param IMachine $m virtual machine instance
	 * @return array boot order
	 */
	private function _machineGetBootOrder(&$m) {
		$return = array();
		$mbp = $this->vbox->getPlatformProperties("x86")->maxBootPosition;
		for($i = 0; $i < $mbp; $i ++) {
			if(($b = (string)$m->getBootOrder($i + 1)) == 'Null') continue;
			$return[] = $b;
		}
		return $return;
	}

	/**
	 * Get serial port configuration for a virtual machine or snapshot
	 *
	 * @param IMachine $m virtual machine instance
	 * @return array serial port info
	 */
	private function _machineGetSerialPorts(&$m) {
		$ports = array();
		$max = $this->vbox->getPlatformProperties("x86")->serialPortCount;
		for($i = 0; $i < $max; $i++) {
			try {
				/* @var $p ISerialPort */
				$p = $m->getSerialPort($i);
				$ports[] = array(
					'slot' => $p->slot,
					'enabled' => $p->enabled,
					// change in 7.1 - IOBase IOAddress
					'IOBase' => '0x'.strtoupper(sprintf('%3s',dechex($p->IOAddress))),
					'IRQ' => $p->IRQ,
					'hostMode' => (string)$p->hostMode,
					'server' => $p->server,
					'path' => $p->path
				);
				$p->releaseRemote();
			} catch (Exception $e) {
				// Ignore
			}
		}
		return $ports;
	}

	/**
	 * Get parallel port configuration for a virtual machine or snapshot
	 *
	 * @param IMachine $m virtual machine instance
	 * @return array parallel port info
	 */
	private function _machineGetParallelPorts(&$m) {
		if(!@$this->settings->enableLPTConfig) return array();
		$ports = array();
		$max = $this->vbox->getPlatformProperties("x86")->parallelPortCount;
		for($i = 0; $i < $max; $i++) {
			try {
				/* @var $p IParallelPort */
				$p = $m->getParallelPort($i);
				$ports[] = array(
					'slot' => $p->slot,
					'enabled' => $p->enabled,
					'IOBase' => '0x'.strtoupper(sprintf('%3s',dechex($p->IOBase))),
					'IRQ' => $p->IRQ,
					'path' => $p->path
				);
				$p->releaseRemote();
			} catch (Exception $e) {
				// Ignore
			}
		}
		return $ports;
	}

	/**
	 * Get shared folder configuration for a virtual machine or snapshot
	 *
	 * @param IMachine $m virtual machine instance
	 * @return array shared folder info
	 */
	private function _machineGetSharedFolders(&$m) {
		$sfs = &$m->sharedFolders;
		$return = array();
		foreach($sfs as $sf) { /* @var $sf ISharedFolder */
			$return[] = array(
				'name' => $sf->name,
				'hostPath' => $sf->hostPath,
				'accessible' => $sf->accessible,
				'writable' => $sf->writable,
				'autoMount' => $sf->autoMount,
				'autoMountPoint' => $sf->autoMountPoint,
				'lastAccessError' => $sf->lastAccessError,
				'type' => 'machine'
			);
		}
		return $return;
	}

	/**
	 * Add encryption password to VM console
	 *
	 * @param array $args array of arguments. See function body for details.
	 * @return true on success
	 */
	public function remote_consoleAddDiskEncryptionPasswords($args) {

	    $this->connect();

	    /* @var $machine IMachine */
	    $machine = $this->vbox->findMachine($args['vm']);

	    $this->session = $this->websessionManager->getSessionObject($this->vbox->handle);
	    $machine->lockMachine($this->session->handle,'Shared');

	    $response = array('accepted'=>array(),'failed'=>array(),'errors'=>array());

	    foreach($args['passwords'] as $creds) {
	        try {
	            $this->session->console->removeEncryptionPassword($creds['id']);
	        } catch(Exception $e) {
	            // It may not exist yet
	        }

    	    try {
    	        $this->session->console->addEncryptionPassword($creds['id'], $creds['password'], (bool)@$args['clearOnSuspend']);
    	        $response['accepted'][] = $creds['id'];
    		} catch (Exception $e) {
    		    $response['failed'][] = $creds['id'];
    		    $response['errors'][] = $e->getMessage();
    		}
	    }

		$this->session->unlockMachine();
		unset($this->session);
		$machine->releaseRemote();

		return $response;
	}

	/**
	 * Get a list of transient (temporary) shared folders
	 *
	 * @param array $args array of arguments. See function body for details.
	 * @return array of shared folders
	 */
	public function remote_consoleGetSharedFolders($args) {

		$this->connect();

		/* @var $machine IMachine */
		$machine = $this->vbox->findMachine($args['vm']);

		// No need to continue if machine is not running
		if((string)$machine->state != 'Running') {
			$machine->releaseRemote();
			return true;
		}

		$this->session = $this->websessionManager->getSessionObject($this->vbox->handle);
		$machine->lockMachine($this->session->handle,'Shared');

		$sfs = $this->session->console->sharedFolders;

		$response = array();

		foreach($sfs as $sf) { /* @var $sf ISharedFolder */

			$response[] = array(
				'name' => $sf->name,
				'hostPath' => $sf->hostPath,
				'accessible' => $sf->accessible,
				'writable' => $sf->writable,
				'autoMount' => $sf->autoMount,
				'autoMountPoint' => $sf->autoMountPoint,
				'lastAccessError' => $sf->lastAccessError,
				'type' => 'transient'
			);
		}

		$this->session->unlockMachine();
		unset($this->session);
		$machine->releaseRemote();

		return $response;
	}

	/**
	 * Get VirtualBox Host OS specific directory separator
	 *
	 * @return string directory separator string
	 */
	public function getDsep() {

		if(!$this->dsep) {

			/* No need to go through vbox if local browser is true */
			if($this->settings->browserLocal) {

				$this->dsep = DIRECTORY_SEPARATOR;

			} else {

				$this->connect();

			    if(stripos($this->vbox->host->operatingSystem,'windows') !== false) {
					$this->dsep = '\\';
			    } else {
					$this->dsep = '/';
			    }
			}


		}

		return $this->dsep;
	}

	/**
	 * Get medium attachment information for all medium attachments in $mas
	 *
	 * @param IMediumAttachment[] $mas list of IMediumAttachment instances
	 * @return array medium attachment info
	 */
	private function _machineGetMediumAttachments(&$mas) {

		$return = array();

		foreach($mas as $ma) { /** @var $ma IMediumAttachment */
			$return[] = array(
				'medium' => ($ma->medium->handle ? array('id'=>$ma->medium->id) : null),
				'controller' => $ma->controller,
				'port' => $ma->port,
				'device' => $ma->device,
				'type' => (string)$ma->type,
				'passthrough' => $ma->passthrough,
				'temporaryEject' => $ma->temporaryEject,
				'nonRotational' => $ma->nonRotational,
				'hotPluggable' => $ma->hotPluggable,
				'discard' => $ma->discard,
			);
		}

		// sort by port then device
		usort($return,function($a,$b){if($a["port"] == $b["port"]) { if($a["device"] < $b["device"]) { return -1; } if($a["device"] > $b["device"]) { return 1; } return 0; } if($a["port"] < $b["port"]) { return -1; } return 1;});

		return $return;
	}

	/**
	 * Save snapshot details ( description or name)
	 *
	 * @param array $args array of arguments. See function body for details.
	 * @return boolean true on success
	 */
	public function remote_snapshotSave($args) {

		// Connect to vboxwebsrv
		$this->connect();

		/* @var $vm IMachine */
		$vm = $this->vbox->findMachine($args['vm']);

		/* @var $snapshot ISnapshot */
		$snapshot = $vm->findSnapshot($args['snapshot']);
		$snapshot->name = $args['name'];
		$snapshot->description = $args['description'];

		// cleanup
		$snapshot->releaseRemote();
		$vm->releaseRemote();

		return true;
	}

	/**
	 * Get snapshot details
	 *
	 * @param array $args array of arguments. See function body for details.
	 * @return array containing snapshot details
	 */
	public function remote_snapshotGetDetails($args) {

		// Connect to vboxwebsrv
		$this->connect();

		/* @var $vm IMachine */
		$vm = $this->vbox->findMachine($args['vm']);

		/* @var $snapshot ISnapshot */
		$snapshot = $vm->findSnapshot($args['snapshot']);

		$response = $this->_snapshotGetDetails($snapshot,false);
		$response['machine'] = $this->remote_machineGetDetails(array(),$snapshot->machine);

		// cleanup
		$snapshot->releaseRemote();
		$vm->releaseRemote();

		return $response;

	}

	/**
	 * Restore a snapshot
	 *
	 * @param array $args array of arguments. See function body for details.
	 * @return array response data containing progress operation id
	 */
	public function remote_snapshotRestore($args) {

		// Connect to vboxwebsrv
		$this->connect();

		$progress = $this->session = null;

		try {

			// Open session to machine
			$this->session = $this->websessionManager->getSessionObject($this->vbox->handle);

			/* @var $machine IMachine */
			$machine = $this->vbox->findMachine($args['vm']);
			$machine->lockMachine($this->session->handle, 'Write');

			/* @var $snapshot ISnapshot */
			$snapshot = $this->session->machine->findSnapshot($args['snapshot']);

			/* @var $progress IProgress */
			$progress = $this->session->machine->restoreSnapshot($snapshot->handle);

			$snapshot->releaseRemote();
			$machine->releaseRemote();

			// Does an exception exist?
			try {
				if($progress->errorInfo->handle) {
					$this->errors[] = new Exception($progress->errorInfo->text);
					$progress->releaseRemote();
					return false;
				}
			} catch (Exception $null) {}

			$this->_util_progressStore($progress);

		} catch (Exception $e) {

			$this->errors[] = $e;

			if($this->session->handle) {
				try{$this->session->unlockMachine();}catch(Exception $e){}
			}
			return false;
		}

		return array('progress' => $progress->handle);

	}

	/**
	 * Delete a snapshot
	 *
	 * @param array $args array of arguments. See function body for details.
	 * @return array response data containing progress operation id
	 */
	public function remote_snapshotDelete($args) {

		// Connect to vboxwebsrv
		$this->connect();

		$progress = $this->session = null;

		try {

			// Open session to machine
			$this->session = $this->websessionManager->getSessionObject($this->vbox->handle);

			/* @var $machine IMachine */
			$machine = $this->vbox->findMachine($args['vm']);
			$machine->lockMachine($this->session->handle, 'Shared');

			/* @var $progress IProgress */
			$progress = $this->session->machine->deleteSnapshot($args['snapshot']);

			$machine->releaseRemote();

			// Does an exception exist?
			try {
				if($progress->errorInfo->handle) {
					$this->errors[] = new Exception($progress->errorInfo->text);
					$progress->releaseRemote();
					return false;
				}
			} catch (Exception $null) {}

			$this->_util_progressStore($progress);


		} catch (Exception $e) {

			$this->errors[] = $e;

			if($this->session->handle) {
				try{$this->session->unlockMachine();$this->session=null;}catch(Exception $e){}
			}

			return false;
		}

		return array('progress' => $progress->handle);

	}

	/**
	 * Take a snapshot
	 *
	 * @param array $args array of arguments. See function body for details.
	 * @return array response data containing progress operation id
	 */
	public function remote_snapshotTake($args) {

		// Connect to vboxwebsrv
		$this->connect();

		/* @var $machine IMachine */
		$machine = $this->vbox->findMachine($args['vm']);

		$progress = $this->session = null;

		try {

			// Open session to machine
			$this->session = $this->websessionManager->getSessionObject($this->vbox->handle);
			$machine->lockMachine($this->session->handle, ((string)$machine->sessionState == 'Unlocked' ? 'Write' : 'Shared'));

			/* @var $progress IProgress */
			list($progress, $snapshotId) = $this->session->machine->takeSnapshot($args['name'], $args['description'], true);

			// Does an exception exist?
			try {
				if($progress->errorInfo->handle) {
					$this->errors[] = new Exception($progress->errorInfo->text);
					$progress->releaseRemote();
					try{$this->session->unlockMachine(); $this->session=null;}catch(Exception $ed){}
					return false;
				}
			} catch (Exception $null) {}


			$this->_util_progressStore($progress);

		} catch (Exception $e) {

			if(!$progress->handle && $this->session->handle) {
				try{$this->session->unlockMachine();$this->session=null;}catch(Exception $e){}
			}

			return false;
		}

		return array('progress' => $progress->handle);

	}

	/**
	 * Get a list of snapshots for a machine
	 *
	 * @param array $args array of arguments. See function body for details.
	 * @return array list of snapshots
	 */
	public function remote_machineGetSnapshots($args) {

		// Connect to vboxwebsrv
		$this->connect();

		/* @var $machine IMachine */
		$machine = $this->vbox->findMachine($args['vm']);

		$response = array('vm' => $args['vm'],
			'snapshot' => array(),
			'currentSnapshotId' => null);

		/* No snapshots? Empty array */
		if($machine->snapshotCount < 1) {
			return $response;
		} else {

			/* @var $s ISnapshot */
			$s = $machine->findSnapshot(null);
			$response['snapshot'] = $this->_snapshotGetDetails($s,true);
			$s->releaseRemote();
		}

		$response['currentSnapshotId'] = ($machine->currentSnapshot->handle ? $machine->currentSnapshot->id : '');
		if($machine->currentSnapshot->handle) $machine->currentSnapshot->releaseRemote();
		$machine->releaseRemote();

		return $response;
	}


	/**
	 * Return details about snapshot $s
	 *
	 * @param ISnapshot $s snapshot instance
	 * @param boolean $sninfo traverse child snapshots
	 * @return array snapshot info
	 */
	private function _snapshotGetDetails(&$s,$sninfo=false) {

		$children = array();

		if($sninfo)
			foreach($s->children as $c) { /* @var $c ISnapshot */
				$children[] = $this->_snapshotGetDetails($c, true);
				$c->releaseRemote();
			}

		// Avoid multiple soap calls
		$timestamp = (string)$s->timeStamp;

		return array(
			'id' => $s->id,
			'name' => $s->name,
			'description' => $s->description,
			'timeStamp' => floor($timestamp/1000),
			'timeStampSplit' => $this->_util_splitTime(time() - floor($timestamp/1000)),
			'online' => $s->online
		) + (
			($sninfo ? array('children' => $children) : array())
		);
	}

	/**
	 * Return details about storage controllers for machine $m
	 *
	 * @param IMachine $m virtual machine instance
	 * @return array storage controllers' details
	 */
	private function _machineGetStorageControllers(&$m) {

		$sc = array();
		$scs = $m->storageControllers;

		foreach($scs as $c) { /* @var $c IStorageController */
			$sc[] = array(
				'name' => $c->name,
				'maxDevicesPerPortCount' => $c->maxDevicesPerPortCount,
				'useHostIOCache' => $c->useHostIOCache,
				'minPortCount' => $c->minPortCount,
				'maxPortCount' => $c->maxPortCount,
				'portCount' => $c->portCount,
				'bus' => (string)$c->bus,
				'controllerType' => (string)$c->controllerType,
				'mediumAttachments' => $this->_machineGetMediumAttachments($m->getMediumAttachmentsOfController($c->name), $m->id)
			);
			$c->releaseRemote();
		}

		for($i = 0; $i < count($sc); $i++) {

			for($a = 0; $a < count($sc[$i]['mediumAttachments']); $a++) {

				// Value of '' means it is not applicable
				$sc[$i]['mediumAttachments'][$a]['ignoreFlush'] = '';

				// Only valid for HardDisks
				if($sc[$i]['mediumAttachments'][$a]['type'] != 'HardDisk') continue;

				// Get appropriate key
				$xtra = $this->_util_getIgnoreFlushKey($sc[$i]['mediumAttachments'][$a]['port'], $sc[$i]['mediumAttachments'][$a]['device'], $sc[$i]['controllerType']);

				// No such setting for this bus type
				if(!$xtra) continue;

				$sc[$i]['mediumAttachments'][$a]['ignoreFlush'] = $m->getExtraData($xtra);

				if(trim($sc[$i]['mediumAttachments'][$a]['ignoreFlush']) === '')
					$sc[$i]['mediumAttachments'][$a]['ignoreFlush'] = 1;
				else
					$sc[$i]['mediumAttachments'][$a]['ignoreFlush'] = $sc[$i]['mediumAttachments'][$a]['ignoreFlush'];

			}
		}

		return $sc;
	}

	/**
	 * Check medium encryption password
	 *
	 * @param array $args array of arguments. See function body for details.
	 * @return array response data
	 */
	public function remote_mediumCheckEncryptionPassword($args) {

	    // Connect to vboxwebsrv
	    $this->connect();

	    $m = $this->vbox->openMedium($args['medium'],'HardDisk','ReadWrite',false);

	    $retval = $m->checkEncryptionPassword($args['password']);

	    $m->releaseRemote();

	    return $retval;

	}

	/**
	 * Change medium encryption
	 *
	 * @param array $args array of arguments. See function body for details.
	 * @return array response data containing progress id or true
	 */
	public function remote_mediumChangeEncryption($args) {

	    // Connect to vboxwebsrv
	    $this->connect();

	    $m = $this->vbox->openMedium($args['medium'], 'HardDisk', 'ReadWrite', false);

	    /* @var $progress IProgress */
	    if(empty($args['password'])) $args['id'] = "";
	    $progress = $m->changeEncryption($args['old_password'],
	            $args['cipher'], $args['password'], $args['id']);

	    // Does an exception exist?
	    try {
	        if($progress->errorInfo->handle) {
	            $this->errors[] = new Exception($progress->errorInfo->text);
	            $progress->releaseRemote();
	            $m->releaseRemote();
	            return false;
	        }
	    } catch (Exception $null) {
	    }

	    if($args['waitForCompletion']) {
	        $progress->waitForCompletion(-1);
	        $progress->releaseRemote();
	        $m->releaseRemote();
	        return true;
	    }

	    $this->_util_progressStore($progress);

	    return array('progress' => $progress->handle);

	}

	/**
	 * Resize a medium. Currently unimplemented in GUI.
	 *
	 * @param array $args array of arguments. See function body for details.
	 * @return array response data containing progress id
	 */
	public function remote_mediumResize($args) {

		// Connect to vboxwebsrv
		$this->connect();

		$m = $this->vbox->openMedium($args['medium'], 'HardDisk', 'ReadWrite', false);

		/* @var $progress IProgress */
		$progress = $m->resize($args['bytes']);

		// Does an exception exist?
		try {
			if($progress->errorInfo->handle) {
				$this->errors[] = new Exception($progress->errorInfo->text);
				$progress->releaseRemote();
				return false;
			}
		} catch (Exception $null) {
		}

		$this->_util_progressStore($progress);

		return array('progress' => $progress->handle);

	}

	/**
	 * Clone a medium
	 *
	 * @param array $args array of arguments. See function body for details.
	 * @return array response data containing progress id
	 */
	public function remote_mediumCloneTo($args) {

		// Connect to vboxwebsrv
		$this->connect();

		$format = strtoupper($args['format']);
		/* @var $target IMedium */
		$target = $this->vbox->createMedium($format, $args['location'], 'ReadWrite', 'HardDisk');
		$mid = $target->id;

		/* @var $src IMedium */
		$src = $this->vbox->openMedium($args['src'], 'HardDisk', 'ReadWrite', false);

		$type = array(($args['type'] == 'fixed' ? 'Fixed' : 'Standard'));
		if($args['split']) $type[] = 'VmdkSplit2G';

		/* @var $progress IProgress */
		$progress = $src->cloneTo($target->handle,$type,null);

		$src->releaseRemote();
		$target->releaseRemote();

		// Does an exception exist?
		try {
			if($progress->errorInfo->handle) {
				$this->errors[] = new Exception($progress->errorInfo->text);
				$progress->releaseRemote();
				return false;
			}
		} catch (Exception $null) {}

		$this->_util_progressStore($progress);

		return array('progress' => $progress->handle, 'id' => $mid);

	}

	/**
	 * Set medium to a specific type
	 *
	 * @param array $args array of arguments. See function body for details.
	 * @return boolean true on success
	 */
	public function remote_mediumSetType($args) {

		// Connect to vboxwebsrv
		$this->connect();

		/* @var $m IMedium */
		$m = $this->vbox->openMedium($args['medium'], 'HardDisk', 'ReadWrite', false);
		$m->type = $args['type'];
		$m->releaseRemote();

		return true;
	}

	/**
	 * Add iSCSI medium
	 *
	 * @param array $args array of arguments. See function body for details.
	 * @return response data
	 */
	public function remote_mediumAddISCSI($args) {

		// Connect to vboxwebsrv
		$this->connect();

		// {'server':server,'port':port,'intnet':intnet,'target':target,'lun':lun,'enclun':enclun,'targetUser':user,'targetPass':pass}

		// Fix LUN
		$args['lun'] = intval($args['lun']);
		if($args['enclun']) $args['lun'] = 'enc'.$args['lun'];

		// Compose name
		$name = $args['server'].'|'.$args['target'];
		if($args['lun'] != 0 && $args['lun'] != 'enc0')
			$name .= '|'.$args['lun'];

		// Create disk
		/* @var $hd IMedium */
		$hd = $this->vbox->createMedium('iSCSI',$name, 'ReadWrite', 'HardDisk');

		if($args['port']) $args['server'] .= ':'.intval($args['port']);

		$arrProps = array();

		$arrProps["TargetAddress"] = $args['server'];
		$arrProps["TargetName"] = $args['target'];
		$arrProps["LUN"] = $args['lun'];
		if($args['targetUser']) $arrProps["InitiatorUsername"] = $args['targetUser'];
		if($args['targetPass']) $arrProps["InitiatorSecret"] = $args['targetPass'];
		if($args['intnet']) $arrProps["HostIPStack"] = '0';

		$hd->setProperties(array_keys($arrProps),array_values($arrProps));

		$hdid = $hd->id;
		$hd->releaseRemote();

		return array('id' => $hdid);
	}

	/**
	 * Add existing medium by file location
	 *
	 * @param array $args array of arguments. See function body for details.
	 * @return resposne data containing new medium's id
	 */
	public function remote_mediumAdd($args) {

		// Connect to vboxwebsrv
		$this->connect();

		/* @var $m IMedium */
		$m = $this->vbox->openMedium($args['path'], $args['type'], 'ReadWrite', false);

		$mid = $m->id;
		$m->releaseRemote();

		return array('id'=>$mid);
	}

	/**
	 * Get VirtualBox generated machine configuration file name
	 *
	 * @param array $args array of arguments. See function body for details.
	 * @return string filename
	 */
	public function remote_vboxGetComposedMachineFilename($args) {

		// Connect to vboxwebsrv
		$this->connect();

		return $this->vbox->composeMachineFilename($args['name'],($this->settings->phpVboxGroups ? '' : $args['group']),$this->vbox->systemProperties->defaultMachineFolder,null);

	}

	/**
	 * Create base storage medium (virtual hard disk)
	 *
	 * @param array $args array of arguments. See function body for details.
	 * @return response data containing progress id
	 */
	public function remote_mediumCreateBaseStorage($args) {

		// Connect to vboxwebsrv
		$this->connect();

		$format = strtoupper($args['format']);

		$type = array(($args['type'] == 'fixed' ? 'Fixed' : 'Standard'));
		if($args['split']) $type[] = 'VmdkSplit2G';

		/* @var $hd IMedium */
		$hd = $this->vbox->createMedium($format, $args['file'], 'ReadWrite', 'HardDisk');

		/* @var $progress IProgress */
		$progress = $hd->createBaseStorage(intval($args['size'])*1024*1024,$type);

		// Does an exception exist?
		try {
			if($progress->errorInfo->handle) {
				$this->errors[] = new Exception($progress->errorInfo->text);
				$progress->releaseRemote();
				return false;
			}
		} catch (Exception $null) {}

		$this->_util_progressStore($progress);

		$hd->releaseRemote();

		return array('progress' => $progress->handle);

	}

	/**
	 * Release medium from all attachments
	 *
	 * @param array $args array of arguments. See function body for details.
	 * @return boolean true
	 */
	public function remote_mediumRelease($args) {

		// Connect to vboxwebsrv
		$this->connect();

		/* @var $m IMedium */
		$m = $this->vbox->openMedium($args['medium'],$args['type'], 'ReadWrite', false);
		$mediumid = $m->id;

		// connected to...
		$machines = $m->machineIds;
		$released = array();
		foreach($machines as $uuid) {

			// Find medium attachment
			try {
				/* @var $mach IMachine */
				$mach = $this->vbox->findMachine($uuid);
			} catch (Exception $e) {
				$this->errors[] = $e;
				continue;
			}
			$attach = $mach->mediumAttachments;
			$remove = array();
			foreach($attach as $a) {
				if($a->medium->handle && $a->medium->id == $mediumid) {
					$remove[] = array(
						'controller' => $a->controller,
						'port' => $a->port,
						'device' => $a->device);
					break;
				}
			}
			// save state
			$state = (string)$mach->sessionState;

			if(!count($remove)) continue;

			$released[] = $uuid;

			// create session
			$this->session = $this->websessionManager->getSessionObject($this->vbox->handle);

			// Hard disk requires machine to be stopped
			if($args['type'] == 'HardDisk' || $state == 'Unlocked') {

				$mach->lockMachine($this->session->handle, 'Write');

			} else {

				$mach->lockMachine($this->session->handle, 'Shared');

			}

			foreach($remove as $r) {
				if($args['type'] == 'HardDisk') {
					$this->session->machine->detachDevice($r['controller'],$r['port'],$r['device']);
				} else {
					$this->session->machine->mountMedium($r['controller'],$r['port'],$r['device'],null,true);
				}
			}

			$this->session->machine->saveSettings();
			$this->session->machine->releaseRemote();
			$this->session->unlockMachine();
			unset($this->session);
			$mach->releaseRemote();

		}
		$m->releaseRemote();

		return true;
	}

	/**
	 * Remove a medium
	 *
	 * @param array $args array of arguments. See function body for details.
	 * @return response data possibly containing progress operation id
	 */
	public function remote_mediumRemove($args) {

		// Connect to vboxwebsrv
		$this->connect();

		if(!$args['type']) $args['type'] = 'HardDisk';

		/* @var $m IMedium */
		$m = $this->vbox->openMedium($args['medium'],$args['type'], 'ReadWrite', false);

		if($args['delete'] && @$this->settings->deleteOnRemove && (string)$m->deviceType == 'HardDisk') {

			/* @var $progress IProgress */
			$progress = $m->deleteStorage();

			$m->releaseRemote();

			// Does an exception exist?
			try {
				if($progress->errorInfo->handle) {
					$this->errors[] = new Exception($progress->errorInfo->text);
					$progress->releaseRemote();
					return false;
				}
			} catch (Exception $null) { }

			$this->_util_progressStore($progress);
			return array('progress' => $progress->handle);

		} else {
			$m->close();
			$m->releaseRemote();
		}

		return true;
	}

	/**
	 * Get a list of recent media
	 *
	 * @param array $args array of arguments. See function body for details.
	 * @return array of recent media
	 */
	public function remote_vboxRecentMediaGet($args) {

		// Connect to vboxwebsrv
		$this->connect();

		$mlist = array();
		foreach(array(
			array('type'=>'HardDisk','key'=>'GUI/RecentListHD'),
			array('type'=>'DVD','key'=>'GUI/RecentListCD'),
			array('type'=>'Floppy','key'=>'GUI/RecentListFD')) as $r) {
			$list = $this->vbox->getExtraData($r['key']);
			$mlist[$r['type']] = array_filter(explode(';', trim($list,';')));
		}
		return $mlist;
	}

	/**
	 * Get a list of recent media paths
	 *
	 * @param array $args array of arguments. See function body for details.
	 * @return array of recent media paths
	 */
	public function remote_vboxRecentMediaPathsGet($args) {

		// Connect to vboxwebsrv
		$this->connect();

		$mlist = array();
		foreach(array(
			array('type'=>'HardDisk','key'=>'GUI/RecentFolderHD'),
			array('type'=>'DVD','key'=>'GUI/RecentFolderCD'),
			array('type'=>'Floppy','key'=>'GUI/RecentFolderFD')) as $r) {
			$mlist[$r['type']] = $this->vbox->getExtraData($r['key']);
		}
		return $mlist;
	}


	/**
	 * Update recent medium path list
	 *
	 * @param array $args array of arguments. See function body for details.
	 * @return boolean true on success
	 */
	public function remote_vboxRecentMediaPathSave($args) {

		// Connect to vboxwebsrv
		$this->connect();

		$types = array(
			'HardDisk'=>'GUI/RecentFolderHD',
			'DVD'=>'GUI/RecentFolderCD',
			'Floppy'=>'GUI/RecentFolderFD'
		);

		$this->vbox->setExtraData($types[$args['type']], $args['folder']);

		return true;
	}

	/**
	 * Update recent media list
	 *
	 * @param array $args array of arguments. See function body for details.
	 * @return boolean true on success
	 */
	public function remote_vboxRecentMediaSave($args) {

		// Connect to vboxwebsrv
		$this->connect();

		$types = array(
			'HardDisk'=>'GUI/RecentListHD',
			'DVD'=>'GUI/RecentListCD',
			'Floppy'=>'GUI/RecentListFD'
		);

		$this->vbox->setExtraData($types[$args['type']], implode(';',array_unique($args['list'])).';');

		return true;

	}

	/**
	 * Mount a medium on the VM
	 *
	 * @param array $args array of arguments. See function body for details.
	 * @return boolean true on success
	 */
	public function remote_mediumMount($args) {

		// Connect to vboxwebsrv
		$this->connect();

		// Find medium attachment
		/* @var $machine IMachine */
		$machine = $this->vbox->findMachine($args['vm']);
		$state = (string)$machine->sessionState;

		// create session
		$this->session = $this->websessionManager->getSessionObject($this->vbox->handle);

		if($state == 'Unlocked') {
			$machine->lockMachine($this->session->handle,'Write');
			$save = true; // force save on closed session as it is not a "run-time" change
		} else {

			$machine->lockMachine($this->session->handle, 'Shared');
		}

		// Empty medium / eject
		if($args['medium'] == 0) {
			$med = null;
		} else {
			// Host drive
			if(strtolower($args['medium']['hostDrive']) == 'true' || $args['medium']['hostDrive'] === true) {
				// CD / DVD Drive
				if($args['medium']['deviceType'] == 'DVD') {
					$drives = $this->vbox->host->DVDDrives;
				// floppy drives
				} else {
					$drives = $this->vbox->host->floppyDrives;
				}
				foreach($drives as $m) { /* @var $m IMedium */
					if($m->id == $args['medium']['id']) {
						/* @var $med IMedium */
						$med = &$m;
						break;
					}
					$m->releaseRemote();
				}
			// Normal medium
			} else {
				/* @var $med IMedium */
				$med = $this->vbox->openMedium($args['medium']['location'],$args['medium']['deviceType'],'ReadWrite',false);
			}
		}

		$this->session->machine->mountMedium($args['controller'],$args['port'],$args['device'],(is_object($med) ? $med->handle : null),true);

		if(is_object($med)) $med->releaseRemote();

		if($save) $this->session->machine->saveSettings();

		$this->session->unlockMachine();
		$machine->releaseRemote();
		unset($this->session);

		return true;
	}

	/**
	 * Get medium details
	 *
	 * @param IMedium $m medium instance
	 * @return array medium details
	 */
	private function _mediumGetDetails(&$m) {

		$children = array();
		$attachedTo = array();
		$machines = $m->machineIds;
		$hasSnapshots = 0;

		foreach($m->children as $c) { /* @var $c IMedium */
			$children[] = $this->_mediumGetDetails($c);
			$c->releaseRemote();
		}

		foreach($machines as $mid) {
			$sids = $m->getSnapshotIds($mid);
			try {
				/* @var $mid IMachine */
				$mid = $this->vbox->findMachine($mid);
			} catch (Exception $e) {
				$attachedTo[] = array('machine' => $mid .' ('.$e->getMessage().')', 'snapshots' => array());
				continue;
			}

			$c = count($sids);
			$hasSnapshots = max($hasSnapshots,$c);
			for($i = 0; $i < $c; $i++) {
				if($sids[$i] == $mid->id) {
					unset($sids[$i]);
				} else {
					try {
						/* @var $sn ISnapshot */
						$sn = $mid->findSnapshot($sids[$i]);
						$sids[$i] = $sn->name;
						$sn->releaseRemote();
					} catch(Exception $e) { }
				}
			}
			$hasSnapshots = (count($sids) ? 1 : 0);
			$attachedTo[] = array('machine'=>$mid->name,'snapshots'=>$sids);
			$mid->releaseRemote();
		}

		// For $fixed value
		$mvenum = new MediumVariant(null, null);
		$variant = 0;

		foreach($m->variant as $mv) {
			$variant += $mvenum->ValueMap[(string)$mv];
		}

		// Encryption settings
		$encryptionSettings = null;
		if((string)$m->deviceType == 'HardDisk') {
    		try {
    		    list($id, $cipher) = $m->getEncryptionSettings();
    		    if($id) {
        		    $encryptionSettings = array(
        		      'id' => $id,
        		      'cipher' => $cipher,
        		    );
    		    }
		    } catch (Exception $e) {
		        // Pass. Encryption is not configured
    		}

		}
		return array(
				'id' => $m->id,
				'description' => $m->description,
				'state' => (string)$m->refreshState(),
				'location' => $m->location,
				'name' => $m->name,
				'deviceType' => (string)$m->deviceType,
				'hostDrive' => $m->hostDrive,
				'size' => (string)$m->size, /* (string) to support large disks. Bypass integer limit */
				'format' => $m->format,
				'type' => (string)$m->type,
				'parent' => (((string)$m->deviceType == 'HardDisk' && $m->parent->handle) ? $m->parent->id : null),
				'children' => $children,
				'base' => (((string)$m->deviceType == 'HardDisk' && $m->base->handle) ? $m->base->id : null),
				'readOnly' => $m->readOnly,
				'logicalSize' => ($m->logicalSize/1024)/1024,
				'autoReset' => $m->autoReset,
				'hasSnapshots' => $hasSnapshots,
				'lastAccessError' => $m->lastAccessError,
				'variant' => $variant,
				'machineIds' => array(),
				'attachedTo' => $attachedTo,
		        'encryptionSettings' => $encryptionSettings
			);

	}

	/**
	 * Store a progress operation so that its status can be polled via progressGet()
	 *
	 * @param IProgress $progress progress operation instance
	 * @return string progress operation handle / id
	 */
	private function _util_progressStore(&$progress) {

		/* Store vbox and session handle */
		$this->persistentRequest['vboxHandle'] = $this->vbox->handle;
		if($this->session->handle) {
		    $this->persistentRequest['sessionHandle'] = $this->session->handle;
		}

		/* Store server if multiple servers are configured */
		if(@is_array($this->settings->servers) && count($this->settings->servers) > 1)
			$this->persistentRequest['vboxServer'] = $this->settings->name;

		return $progress->handle;
	}

	/**
	 * Get VirtualBox system properties
	 * @param array $args array of arguments. See function body for details.
	 * @return array of system properties
	 */
	public function remote_vboxSystemPropertiesGet($args) {

		// Connect to vboxwebsrv
		$this->connect();

		$mediumFormats = array();

		// Shorthand
		$sp = $this->vbox->systemProperties;

		// capabilities
		$mfCap = new MediumFormatCapabilities(null,'');
		foreach($sp->mediumFormats as $mf) { /* @var $mf IMediumFormat */
			$exts = $mf->describeFileExtensions();
			$dtypes = array();
			foreach($exts[1] as $t) $dtypes[] = (string)$t;
			$caps = array();
			foreach($mf->capabilities as $c) {
				$caps[] = (string)$c;
			}

			$mediumFormats[] = array('id'=>$mf->id,'name'=>$mf->name,'extensions'=>array_map('strtolower',$exts[0]),'deviceTypes'=>$dtypes,'capabilities'=>$caps);

		}

		$scs = array();

		$scts = array('LsiLogic',
			'BusLogic',
			'IntelAhci',
			'PIIX4',
			'ICH6',
			'I82078',
			'USB',
			'NVMe');

		foreach($scts as $t) {
		    $scs[$t] = $this->vbox->getPlatformProperties("x86")->getStorageControllerHotplugCapable($t);
		}

		return array(
			'minGuestRAM' => (string)$sp->minGuestRAM,
			'maxGuestRAM' => (string)$sp->maxGuestRAM,
			'minGuestVRAM' => (string)$sp->minGuestVRAM,
			'maxGuestVRAM' => (string)$sp->maxGuestVRAM,
			'minGuestCPUCount' => (string)$sp->minGuestCPUCount,
			'maxGuestCPUCount' => (string)$sp->maxGuestCPUCount,
			'autostartDatabasePath' => (@$this->settings->vboxAutostartConfig ? $sp->autostartDatabasePath : ''),
			'infoVDSize' => (string)$sp->infoVDSize,
			'networkAdapterCount' => 8, // static value for now
			'maxBootPosition' => (string)$this->vbox->getPlatformProperties("x86")->maxBootPosition,
			'defaultMachineFolder' => (string)$sp->defaultMachineFolder,
			'defaultHardDiskFormat' => (string)$sp->defaultHardDiskFormat,
			'homeFolder' => $this->vbox->homeFolder,
			'VRDEAuthLibrary' => (string)$sp->VRDEAuthLibrary,
			'defaultAudioDriver' => (string)$sp->defaultAudioDriver,
			'defaultVRDEExtPack' => $sp->defaultVRDEExtPack,
			'serialPortCount' => $this->vbox->getPlatformProperties("x86")->serialPortCount,
			'parallelPortCount' => $this->vbox->getPlatformProperties("x86")->parallelPortCount,
			'mediumFormats' => $mediumFormats,
			'scs' => $scs
		);
	}

	/**
	 * Get a list of VM log file names
	 *
	 * @param array $args array of arguments. See function body for details.
	 * @return array of log file names
	 */
	public function remote_machineGetLogFilesList($args) {

		// Connect to vboxwebsrv
		$this->connect();

		/* @var $m IMachine */
		$m = $this->vbox->findMachine($args['vm']);

		$logs = array();

		try { $i = 0; while($l = $m->queryLogFilename($i++)) $logs[] = $l;
		} catch (Exception $null) {}

		$lf = $m->logFolder;
		$m->releaseRemote();

		return array('path' => $lf, 'logs' => $logs);

	}

	/**
	 * Get VM log file contents
	 *
	 * @param array $args array of arguments. See function body for details.
	 * @return string log file contents
	 */
	public function remote_machineGetLogFile($args) {

		// Connect to vboxwebsrv
		$this->connect();

		/* @var $m IMachine */
		$m = $this->vbox->findMachine($args['vm']);
		$log = '';
		try {
			// Read in 8k chunks
			while($l = $m->readLog(intval($args['log']),strlen($log),8192)) {
				if(!count($l) || !strlen($l[0])) break;
				$log .= base64_decode($l[0]);
			}
		} catch (Exception $null) {}
		$m->releaseRemote();

		// Attempt to UTF-8 encode string or json_encode may choke
		// and return an empty string
		if(function_exists('iconv'))
			return iconv("ISO-8859-1", "UTF-8", $log);

		return $log;
	}

	/**
	 * Get a list of USB devices attached to a given VM
	 *
	 * @param array $args array of arguments. See function body for details.
	 * @return array list of devices
	 */
	public function remote_consoleGetUSBDevices($args) {

		// Connect to vboxwebsrv
		$this->connect();

		/* @var $machine IMachine */
		$machine = $this->vbox->findMachine($args['vm']);
		$this->session = $this->websessionManager->getSessionObject($this->vbox->handle);
		$machine->lockMachine($this->session->handle, 'Shared');

		$response = array();
		foreach($this->session->console->USBDevices as $u) { /* @var $u IUSBDevice */
			$response[$u->id] = array('id'=>$u->id,'remote'=>$u->remote);
			$u->releaseRemote();
		}

		$this->session->unlockMachine();
		unset($this->session);
		$machine->releaseRemote();

		return $response;

	}

	/**
	 * Return a string representing the VirtualBox ExtraData key
	 * for this port + device + bus type IgnoreFlush setting
	 *
	 * @param integer port medium attachment port number
	 * @param integer device medium attachment device number
	 * @param string cType controller type
	 * @return string extra data setting string
	 */
	private function _util_getIgnoreFlushKey($port,$device,$cType) {

		$cTypes = array(
			'piix3' => 'piix3ide',
			'piix4' => 'piix3ide',
			'ich6' => 'piix3ide',
			'intelahci' => 'ahci',
			'lsilogic' => 'lsilogicscsi',
			'buslogic' => 'buslogic',
			'lsilogicsas' => 'lsilogicsas',
			'usb' => 'usb',
			'nvme' => 'nvme',
			'virtioscsi' => 'virtioscsi'
		);

		if(!isset($cTypes[strtolower($cType)])) {
			$this->errors[] = new Exception('Invalid controller type: ' . $cType);
			return '';
		}

		$lun = ((intval($device)*2) + intval($port));

		return str_replace('[b]',$lun,str_replace('[a]',$cTypes[strtolower($cType)],"VBoxInternal/Devices/[a]/0/LUN#[b]/Config/IgnoreFlush"));

	}

	/**
	 * Get a newly generated MAC address from VirtualBox
	 *
	 * @param array $args array of arguments. See function body for details
	 * @return string mac address
	 */
	public function remote_vboxGenerateMacAddress($args) {

		// Connect to vboxwebsrv
		$this->connect();

		return $this->vbox->host->generateMACAddress();

	}

	/**
	 * Set group definition
	 *
	 * @param array $args array of arguments. See function body for details
	 * @return boolean true on success
	 */
	public function remote_vboxGroupDefinitionsSet($args) {

		$this->connect();

		// Save a list of valid paths
		$validGroupPaths = array();

		$groupKey = ($this->settings->phpVboxGroups ? vboxconnector::phpVboxGroupKey : 'GUI/GroupDefinitions');

		// Write out each group definition
		foreach($args['groupDefinitions'] as $groupDef) {

			$this->vbox->setExtraData($groupKey.$groupDef['path'], $groupDef['order']);
			$validGroupPaths[] = $groupDef['path'];

		}

		// Remove any unused group definitions
		$keys = $this->vbox->getExtraDataKeys();
		foreach($keys as $k) {
			if(strpos($k,$groupKey) !== 0) continue;
			if(array_search(substr($k,strlen($groupKey)), $validGroupPaths) === false)
				$this->vbox->setExtraData($k,'');
		}

		return true;
	}

	/**
	 * Return group definitions
	 *
	 * @param array $args array of arguments. See function body for details
	 * @return array group definitions
	 */
	public function remote_vboxGroupDefinitionsGet($args) {

		$this->connect();

		$response = array();

		$keys = $this->vbox->getExtraDataKeys();

		$groupKey = ($this->settings->phpVboxGroups ? vboxconnector::phpVboxGroupKey : 'GUI/GroupDefinitions');
		foreach($keys as $grouppath) {

			if(strpos($grouppath,$groupKey) !== 0) continue;

			$subgroups = array();
			$machines = array();

			$response[] = array(
				'name' => substr($grouppath,strrpos($grouppath,'/')+1),
				'path' => substr($grouppath,strlen($groupKey)),
				'order' => $this->vbox->getExtraData($grouppath)
			);
		}

		return $response;

	}

	/**
	 * Format a time span in seconds into days / hours / minutes / seconds
	 * @param integer $t number of seconds
	 * @return array containing number of days / hours / minutes / seconds
	 */
	private function _util_splitTime($t) {

		$spans = array(
			'days' => 86400,
			'hours' => 3600,
			'minutes' => 60,
			'seconds' => 1);

		$time = array();

		foreach($spans as $k => $v) {
			if(!(floor($t / $v) > 0)) continue;
			$time[$k] = floor($t / $v);
			$t -= floor($time[$k] * $v);
		}

		return $time;
	}


	/**
	 * Return VBOX result code text for result code
	 *
	 * @param integer result code number
	 * @return string result code text
	 */
	private function _util_resultCodeText($c) {

		$rcodes = new ReflectionClass('VirtualBox_COM_result_codes');
    	$rcodes = array_flip($rcodes->getConstants());
    	$rcodes['0x80004005'] = 'NS_ERROR_FAILURE';

		return @$rcodes['0x'.strtoupper(dechex($c))] . ' (0x'.strtoupper(dechex($c)).')';
	}
}
