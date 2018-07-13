<?php
/*
 * $Id: OpenMediaVault.php 470 2012-10-24 21:43:25Z imooreyahoo@gmail.com $
*/

/*
 * OMV Specific
*/
try {

	// Must be made global or OMV breaks 
	global $xmlConfig, $OMV_DEFAULT_FILE;

	require_once("openmediavault/globals.inc");
	require_once("openmediavault/session.inc");
	require_once("rpc/authentication.inc");

} catch(Exception $e) {

	header("Content-Type: text/html");
	die("Error #".$e->getCode().":<br/>". str_replace("\n", "<br/>",$e->__toString()));
}

class phpvbAuthOpenMediaVault implements phpvbAuth {

	static $session = null;
	
	var $capabilities = array(
		'canChangePassword' => false,
		'sessionStart' => 'sessionStart',
		'canLogout' => true
	);

	var $config = array(
		'allowNonAdmin' => false
	);

	function __construct($userConfig = null) {
		if($userConfig) $this->config = array_merge($this->config,$userConfig);
	}

	function login($username, $password)
	{
		# Try / catch so that we don't expose
		# usernames / passwords
		require_once("rpc/authentication.inc");
		$a = new AuthenticationRpc();
		try {
			
			$auth = $a->login(array('username'=>$username,'password'=>$password));
			
			self::$session = &OMVSession::getInstance();
			
			if(@$auth["authenticated"] &&
			(self::$session->getRole() !== OMV_ROLE_USER || $this->config['allowNonAdmin'])) {
				$_SESSION['admin'] = (self::$session->getRole() !== OMV_ROLE_USER);
				$_SESSION['user'] = $_SESSION['username'];
				$_SESSION['valid'] = ($_SESSION['admin'] || $this->config['allowNonAdmin']);
				$_SESSION['authCheckHeartbeat'] = time();
	
			}
	
			if(!@$_SESSION['valid']) {
				return false;
			}
			return true;
	
		} catch (Exception $e) {
			return false;
		}
		return false;
	}
	
	function sessionStart($keepopen) {
		
		self::$session = &OMVSession::getInstance();
		self::$session->start();
		

		if (self::$session->isAuthenticated() && !self::$session->isTimeout()) {
			
			self::$session->validate();
			self::$session->updateLastAccess();
			
			$_SESSION['admin'] = (self::$session->getRole() !== OMV_ROLE_USER);
			$_SESSION['user'] = $_SESSION['username'];
			$_SESSION['valid'] = (self::$session->getRole() !== OMV_ROLE_USER || $this->config['allowNonAdmin']);
			
		} else {
			
			$_SESSION['admin'] = $_SESSION['user'] = $_SESSION['valid'] = null;
			
		}

		if(!$keepopen)
			session_write_close();

	}


	function logout(&$response)
	{
		require_once("rpc/authentication.inc");
		$a = new AuthenticationRpc();
		$a->logout();
		$response['data']['result'] = 1;
	}

	/* Defined for compatibility with implemented interface */
	function heartbeat($vbox){}
	function changePassword($old, $new){}
	function listUsers(){}
	function updateUser($vboxRequest, $skipExistCheck){}
	function deleteUser($user){}
}
