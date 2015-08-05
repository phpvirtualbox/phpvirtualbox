<?php
/**
 *
 * Built-in authentication module. Uses VirtualBox's set/getExtraData capability
 * to store / retrieve user credentials. Called from API when authentication
 * functions are requested.
 *
 * @author Ian Moore (imoore76 at yahoo dot com)
 * @copyright Copyright (C) 2010-2015 Ian Moore (imoore76 at yahoo dot com)
 * @version $Id: Builtin.php 595 2015-04-17 09:50:36Z imoore76 $
 * @package phpVirtualBox
 * @see vboxconnector
 *
 */
class phpvbAuthBuiltin implements phpvbAuth {

	/**
	 *
	 * A list of capabilities describing this authentication module.
	 * @var array capability values:
	 * 		@var boolean canChangePassword
	 * 		@var boolean canModifyUsers
	 * 		@var boolean canLogout
	 *
	 */
	var $capabilities = array(
			'canChangePassword' => true,
			'canModifyUsers' => true,
			'canLogout' => true
		);

	/**
	 *
	 * Log in function. Populates $_SESSION
	 * @param string $username user name
	 * @param string $password password
	 */
	function login($username, $password)
	{
		global $_SESSION;

		$vbox = new vboxconnector(true);
		$vbox->skipSessionCheck = true;
		$vbox->connect();
		$p = $vbox->vbox->getExtraData('phpvb/users/'.$username.'/pass');

		// Check for initial login
		if($username == 'admin' && !$p && !$vbox->vbox->getExtraData('phpvb/usersSetup')) {
			$vbox->vbox->setExtraData('phpvb/usersSetup','1');
			$vbox->vbox->setExtraData('phpvb/users/'.$username.'/pass', hash('sha512', 'admin'));
			$vbox->vbox->setExtraData('phpvb/users/'.$username.'/admin', '1');
			$p = hash('sha512', 'admin');
		}

		if($p == hash('sha512', $password)) {
			$_SESSION['valid'] = true;
			$_SESSION['user'] = $username;
			$_SESSION['admin'] = intval($vbox->vbox->getExtraData('phpvb/users/'.$username.'/admin'));
			$_SESSION['authCheckHeartbeat'] = time();
			$_SESSION['uHash'] = $p;
		}
	}

	/**
	 *
	 * Change password function.
	 * @param string $old old password
	 * @param string $new new password
	 * @return boolean true on success
	 */
	function changePassword($old, $new)
	{
		global $_SESSION;

		// Use main / auth server
		$vbox = new vboxconnector(true);
		$vbox->connect();
		$p = $vbox->vbox->getExtraData('phpvb/users/'.$_SESSION['user'].'/pass');

		if($p == hash('sha512', $old)) {
			$np = hash('sha512', $new);
			$vbox->vbox->setExtraData('phpvb/users/'.$_SESSION['user'].'/pass', $np);
			$response['data']['result'] = 1;
			$_SESSION['uHash'] = $np;
			return true;
		}
		return false;
	}

	/**
	 *
	 * Revalidate login info and set authCheckHeartbeat session variable.
	 * @param vboxconnector $vbox vboxconnector object instance
	 */
	function heartbeat($vbox)
	{
		global $_SESSION;

		// Check to see if we only have 1 server or are already connected
		// to the authentication master server
		if(@$vbox->settings->authMaster || count($vbox->settings->servers) == 1) {
			$vbcheck = &$vbox;
		} else {
			$vbcheck = new vboxconnector(true);
		}

		$vbcheck->connect();
		$p = $vbcheck->vbox->getExtraData('phpvb/users/'.$_SESSION['user'].'/pass');
		if(!@$p || @$_SESSION['uHash'] != $p) {
			if(function_exists('session_destroy')) session_destroy();
			unset($_SESSION['valid']);
		} else {
			$_SESSION['admin'] = intval($vbcheck->vbox->getExtraData('phpvb/users/'.$_SESSION['user'].'/admin'));
			$_SESSION['authCheckHeartbeat'] = time();
		}

		if(!@$_SESSION['valid'])
			throw new Exception(trans('Not logged in.','UIUsers'), vboxconnector::PHPVB_ERRNO_FATAL);
	}

	/**
	 *
	 * Log out user present in $_SESSION
	 * @param array $response response passed byref by API and populated within function
	 */
	function logout(&$response)
	{
		global $_SESSION;
		if(function_exists('session_destroy')) session_destroy();
		else unset($_SESSION['valid']);
		$response['data']['result'] = 1;
	}

	/**
	 *
	 * Return a list of users
	 * @return array list of users
	 */
	function listUsers()
	{
		$response = array();

		// Use main / auth server
		$vbox = new vboxconnector(true);
		$vbox->connect();

		$keys = $vbox->vbox->getExtraDataKeys();
		foreach($keys as $k) {
			if(strpos($k,'phpvb/users/') === 0) {
				$user = substr($k,12,strpos($k,'/',13)-12);
				if(isset($response[$user])) continue;
				$admin = intval($vbox->vbox->getExtraData('phpvb/users/'.$user.'/admin'));
				$response[$user] = array('username'=>$user,'admin'=>$admin);
			}
		}
		return $response;
	}

	/**
	 *
	 * Update user information such as password and admin status
	 * @param array $vboxRequest request passed from API representing the request. Contains user, password and administration level.
	 * @param boolean $skipExistCheck Do not check that the user exists first. Essentially, if this is set and the user does not exist, it is added.
	 */
	function updateUser($vboxRequest, $skipExistCheck)
	{
		global $_SESSION;

		// Must be an admin
		if(!$_SESSION['admin']) break;

		// Use main / auth server
		$vbox = new vboxconnector(true);
		$vbox->connect();

		// See if it exists
		if(!$skipExistCheck && $vbox->vbox->getExtraData('phpvb/users/'.$vboxRequest['u'].'/pass'))
			break;

		if($vboxRequest['p'])
			$vbox->vbox->setExtraData('phpvb/users/'.$vboxRequest['u'].'/pass', hash('sha512', $vboxRequest['p']));

		$vbox->vbox->setExtraData('phpvb/users/'.$vboxRequest['u'].'/admin', ($vboxRequest['a'] ? '1' : '0'));
	}

	/**
	 *
	 * Remove the user $user
	 * @param string $user Username to remove
	 */
	function deleteUser($user)
	{
		// Use main / auth server
		$vbox = new vboxconnector(true);
		$vbox->connect();

		$vbox->vbox->setExtraData('phpvb/users/'.$user.'/pass','');
		$vbox->vbox->setExtraData('phpvb/users/'.$user.'/admin','');
		$vbox->vbox->setExtraData('phpvb/users/'.$user,'');
	}
}
