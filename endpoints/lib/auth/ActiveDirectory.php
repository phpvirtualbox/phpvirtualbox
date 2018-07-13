<?php
/*
 * $Id: ActiveDirectory.php 501 2013-07-11 17:44:37Z imooreyahoo@gmail.com $
* Experimental!
*/
class phpvbAuthActiveDirectory implements phpvbAuth {

	var $capabilities = array(
		'canChangePassword' => false,
		'canLogout' => true
	);

	var $config = array(
		'host' => '127.0.0.1',
		'admin_group' => null,
		'adminUser' => null,
		'user_group' => null,
		'container' => 'CN=Users',
		'domain' =>   'internal.local',
		'filter' => '(&(objectclass=User)(objectCategory=Person))'
	);

	/**
	 * Constructor
	 * @param array $userConfig - user configuration for this module
	 */
	function phpvbAuthActiveDirectory($userConfig = null) {
		// Merge user config
		if($userConfig) {
			$this->config = array_merge($this->config,$userConfig);
		}		
	}

	/**
	 * Test log in and set $_SESSION vars
	 * @param string $username
	 * @param string $password
	 * @see phpvbAuth::login()
	 */
	function login($username, $password)
	{
		global $_SESSION;


		/*
		 * Check for LDAP functionality and provide some direction
		 */
		if(!function_exists('ldap_connect')) {

			$ex = 'LDAP support is not enabled in your PHP configuration.';

			if(strtolower(substr(PHP_OS, 0, 3)) == 'win') {

				ob_start();
				phpinfo(INFO_GENERAL);
				$phpinfo = ob_get_contents();
				ob_end_clean();
				preg_match('/Loaded Configuration File <\/td><td.*?>(.*?)\s*</', $phpinfo, $phpinfo);

				$ex .= ' You probably just need to uncomment the line ;extension=php_ldap.dll in php.ini'.
						(count($phpinfo) > 1 ? ' (' .trim($phpinfo[1]).')' : '') . ' by removing the ";" and restart your web server.';

			} else if(strtolower(substr(PHP_OS, 0, 5)) == 'Linux') {

				$ex .= ' You probably need to install the php5-ldap (or similar depending on your distribution) package and restart your web server.';
					
			}
			throw new Exception($ex);
		}

		$_SESSION['valid'] = false;

		// Connect to server
		if(!($auth = ldap_connect($this->config['host']))) {
			throw new Exception('Active Directory error ('.ldap_errno($auth).') ' . ldap_error($auth));
		}

		// Set relevant LDAP options
		ldap_set_option($auth,LDAP_OPT_PROTOCOL_VERSION, 3);
		

		// Main login /bind
		if(!($bind = @ldap_bind($auth, $username . "@" .$this->config['domain'], $password))) {
			if(ldap_errno($auth) == 49) return false;
			throw new Exception('Active Directory error ('.ldap_errno($auth).') ' . ldap_error($auth));
		}
		
		
		// Get user information from AD
		////////////////////////////////////
		
		
		// Set filter and sanitize username before sending it to AD
		$filter = "(sAMAccountName=" .
			str_replace(array(',','=','+','<','>',';','\\','"','#','(',')','*',chr(0)), '', $username) . ")";
		if($this->config['filter'] && false) {
			$filter = '(&'. $this->config['filter'] .' ('. $filter .'))';
		}
		
		$result = @ldap_search($auth,
				$this->config['container'] . ',DC=' . join(',DC=', explode('.', $this->config['domain'])),
				$filter, array("memberof","useraccountcontrol"));

		if(!result) throw new Exception ("Unable to search Active Directory server: " . ldap_error($auth));
		@list($entries) = @ldap_get_entries($auth, $result);
		@ldap_unbind($auth);
		if(!$entries) {
			throw new Exception("Permission denied");
		}
		
		
		// Check for disabled user
		if((intval($entries['useraccountcontrol'][0]) & 2)) {
			throw new Exception('This account is disabled in Active Directory.');
		}

		// check for valid admin group
		if($this->config['admin_group']) {
			foreach($entries['memberof'] as $group) {
				list($group) = explode(',', $group);
				if(strtolower($group) == strtolower('cn='.$this->config['admin_group'])) {
					$_SESSION['admin'] = $_SESSION['valid'] = true;
					break;
				}
			}
		}
		
		// Admin user explicitly set?
		if(!$_SESSION['admin'] && $this->config['adminUser']) {
			$_SESSION['admin'] = (strtolower($this->config['adminUser']) == strtolower($username));
			// Admin is ok
			$_SESSION['valid'] = ($_SESSION['admin'] || $_SESSION['valid']);
		}

		// check for valid user group
		if($this->config['user_group'] && !$_SESSION['valid']) {
			foreach($entries['memberof'] as $group) {
				list($group) = explode(',', $group);
				if(strtolower($group) == strtolower('cn='.$this->config['user_group'])) {
					$_SESSION['valid'] = true;
					break;
				}
			}
		} else {
			$_SESSION['valid'] = true;
		}
		
		if(!$_SESSION['valid'])
			throw new Exception("Permission denied");

		// Admin user explicitly set?
		if(!$_SESSION['admin'] && $this->config['adminUser']) {
			$_SESSION['admin'] = (strtolower($this->config['adminUser']) == strtolower($username));
		}

		// No admin information specified makes everyone an admin
		if(!$this->config['adminUser'] && !$this->config['admin_group'])
			$_SESSION['admin'] = true;
		
		// user has permission. establish session variables
		$_SESSION['user'] = $username;
		$_SESSION['authCheckHeartbeat'] = time();

		
		return true;
		
	}

	function heartbeat($vbox)
	{
		global $_SESSION;

		$_SESSION['valid'] = true;
		$_SESSION['authCheckHeartbeat'] = time();
	}

	function changePassword($old, $new)
	{
	}

	function logout(&$response)
	{
		global $_SESSION;
		if(function_exists('session_destroy')) session_destroy();
		else unset($_SESSION['valid']);
		$response['data']['result'] = 1;
	}

	function listUsers()
	{

	}

	function updateUser($vboxRequest, $skipExistCheck)
	{

	}

	function deleteUser($user)
	{

	}
}
