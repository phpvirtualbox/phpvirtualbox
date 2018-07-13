<?php
/**
 * Common PHP utilities.
 *
 * @author Ian Moore (imoore76 at yahoo dot com)
 * @copyright Copyright (C) 2010-2015 Ian Moore (imoore76 at yahoo dot com)
 * @version $Id: utils.php 592 2015-04-12 19:53:44Z imoore76 $
 * @see phpVBoxConfigClass
 * @package phpVirtualBox
 *
*/

require_once(dirname(__FILE__).'/config.php');

/**
 * Initialize session.
 * @param boolean $keepopen keep session open? The default is
 * 			to close the session after $_SESSION has been populated.
 * @uses $_SESSION
 */
function session_init($keepopen = false) {

	$settings = new phpVBoxConfigClass();

	// Sessions provided by auth module?
	if(@$settings->auth->capabilities['sessionStart']) {
		call_user_func(array($settings->auth, $settings->auth->capabilities['sessionStart']), $keepopen);
		return;
	}

	// No session support? No login...
	if(@$settings->noAuth || !function_exists('session_start')) {
		global $_SESSION;
		$_SESSION['valid'] = true;
		$_SESSION['authCheckHeartbeat'] = time();
		$_SESSION['admin'] = true;
		return;
	}

	// Session not is auto-started by PHP
	if(!ini_get('session.auto_start')) {

		ini_set('session.use_trans_sid', 0);
		ini_set('session.use_only_cookies', 1);

		// Session path
		if(isset($settings->sessionSavePath)) {
			session_save_path($settings->sessionSavePath);
		}

		if(isset($settings->session_name)) {
		    $session_name = $settings->session_name;
		} else {
		    $session_name = md5($_SERVER['DOCUMENT_ROOT'].$_SERVER['HTTP_USER_AGENT'].dirname(__FILE__));
		}
		session_name($session_name);
		session_start();
	}

	if(!$keepopen)
		session_write_close();

}


/**
 * Clean (strip slashes from if applicable) $_GET and $_POST and return
 * an array containing a merged array of both.
 * @return array
 */
function clean_request() {

	if($_SERVER['HTTP_X_REQUESTED_WITH'] == 'XMLHttpRequest') {
	   $json = json_decode(file_get_contents('php://input'), true);
	   if(!is_array($json))
	   	   $json = array();
	} else {
		$json = array();
	}
	$req = array_merge_recursive($_GET, $_POST);
	return array_merge_recursive($req, $json);

}

if(!function_exists('hash')) {
// Lower security, but better than nothing
/**
 * Return a hash of the passed string. Mimmics PHP's hash() params
 * @param unused $type
 * @param string $str string to hash
 */
function hash($type,$str='') {
	return sha1(json_encode($str));
}
}