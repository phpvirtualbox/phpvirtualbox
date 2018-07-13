<?php
/**
 * Interface for phpVirtualBox authentication modules
 *
 * @author Ian Moore (imoore76 at yahoo dot com)
 * @copyright Copyright (C) 2010-2015 Ian Moore (imoore76 at yahoo dot com)
 * @version $Id: authinterface.php 595 2015-04-17 09:50:36Z imoore76 $
 * @package phpVirtualBox
 * 
 * A class wishing to implement this interface must also contain
 * a list of capabilities describing its capabilities in a public
 * object member array called capabilities.
 * 
 * boolean canChangePassword - Users can change passwords
 * boolean canModifyUsers - Users can be modified
 * boolean canLogout - Users can log out
 * 	
 * E.g.
 * var $capabilities = array(
 *		'canChangePassword' => true,
 *		'canModifyUsers' => true,
 *		'canLogout' => true
 *	);
 *
 * The implementing class may also define a public autoLoginHook
 * method that auto-populates $_SESSION. This would automatically
 * log the user in, bypassing the login() function.
 * 
 * E.g.
 * 
 * 	function autoLoginHook()
 *	{
 *		global $_SESSION;
 *
 *		// HTTP Authentication passthrough
 *		if ( isset($_SERVER['HTTP_X_WEBAUTH_USER']) )
 *		{
 *			$_SESSION['valid'] = true;
 *			$_SESSION['user'] = $_SERVER['HTTP_X_WEBAUTH_USER']];
 *			$_SESSION['admin'] = ($_SESSION['user'] === 'bob');
 *			$_SESSION['authCheckHeartbeat'] = time();
 *		}
 *	}
 *
 * Implementing classes should be prefixed with phpvbAuth. E.g.
 * phpvbAuthMySiteAuth. authLib in config.php would then be set
 * to 'MySiteAuth'
 */
interface phpvbAuth {

	/**
	*
	* Log in function. Populates $_SESSION
	* @param string $username user name
	* @param string $password password
	*/
	function login($username, $password);
	
	/**
	*
	* Change password function.
	* @param string $old old password
	* @param string $new new password
	* @return boolean true on success
	*/
	function changePassword($old, $new);
	
	/**
	*
	* Revalidate login info and set authCheckHeartbeat session variable.
	* @param vboxconnector $vbox vboxconnector object instance
	*/
	function heartbeat($vbox);
	
	/**
	*
	* Log out user present in $_SESSION
	* @param array $response response passed byref by API and populated within function
	*/
	function logout(&$response);
	
	/**
	*
	* Return a list of users
	* @return array list of users
	*/
	function listUsers();
	
	/**
	*
	* Update user information such as password and admin status
	* @param array $vboxRequest request passed from API representing the ajax request. Contains user, password and administration level.
	* @param boolean $skipExistCheck Do not check that the user exists first. Essentially, if this is set and the user does not exist, it is added.
	*/
	function updateUser($vboxRequest, $skipExistCheck);
	
	
	/**
	*
	* Remove the user $user
	* @param string $user Username to remove
	*/
	function deleteUser($user);
	
	
	
}