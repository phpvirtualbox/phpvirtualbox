<?php
/*
 * $Id: LDAP.php 501 2013-07-11 17:44:37Z imooreyahoo@gmail.com $
 * Experimental!
 */


class phpvbAuthLDAP implements phpvbAuth {
	
	var $capabilities = array(
		'canChangePassword' => false,
		'canLogout' => true
	);
	
	var $config = array(
		'host' => '127.0.0.1', // LDAP server ip
		'bind_dn' => 'uid=%s, ou=admins, dc=internal, dc=local', // %s will be replaced with login username
		'adminUser' => ''
	);
	
	function phpvbAuthLDAP($userConfig = null) {
		if($userConfig) $this->config = array_merge($this->config,$userConfig);
	}
	
	function login($username, $password)
	{
		global $_SESSION;
		
		// Check for LDAP functions
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
				
				$ex .= ' You probably need to install the php5-ldap (or similar depending on your distribution) package.';	
			
			}
			throw new Exception($ex);
		}

		$auth = ldap_connect($this->config['host']);
		
		if(!$auth) return false;
		
		ldap_set_option($auth,LDAP_OPT_PROTOCOL_VERSION, 3);
		
		if(!@ldap_bind($auth, sprintf($this->config['bind_dn'], $username), $password))
			return false;
		
		
		$_SESSION['valid'] = true;
		$_SESSION['user'] = $username;
		$_SESSION['admin'] = (!$this->config['adminUser']) || ($_SESSION['user'] == $this->config['adminUser']);
		$_SESSION['authCheckHeartbeat'] = time();
		
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
