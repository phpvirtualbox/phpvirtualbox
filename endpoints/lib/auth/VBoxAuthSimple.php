<?php
/**
 * @author Audun Larsen (larsen at xqus dot com)
 * @copyright Copyright (C) 2014 Audun Larsen (larsen at xqus dot com)
 * @link http://xqus.com/blog/phpvirtbox-vboxauthsimple
 * @package phpVirtualBox
 * @see vboxconnector
 * @see ajax.php
 *
 */
class phpvbAuthVBoxAuthSimple implements phpvbAuth {

  /**
   * A list of capabilities describing this authentication module.
   */
  var $capabilities = array(
    'canChangePassword' => false,
    'canModifyUsers' => false,
    'canLogout' => true,
  );

  /**
   * Log in function. Populates $_SESSION.
   *
   * @param string $username user name
   * @param string $password password
   */
  function login($username, $password) {
    $vbox = new vboxconnector(true);

    $vbox->skipSessionCheck = true;

    $vbox->settings->username = $username;
    $vbox->settings->password = $password;

    $vbox->connect();

    if($vbox->connected == true) {
      $_SESSION['valid'] = true;
      $_SESSION['user'] = $username;
      $_SESSION['password'] = $password;
      $_SESSION['authCheckHeartbeat'] = time();

      return true;
    }

    return false;
  }

  /**
   * Change password function.
   *
   * @param string $old old password
   * @param string $new new password
   * @return boolean true on success
   */
  function changePassword($old, $new) {

  }

  /**
   * Revalidate login info and set authCheckHeartbeat session variable.
   *
   * @param vboxconnector $vbox vboxconnector object instance
   */
  function heartbeat($vbox) {
    $_SESSION['valid'] = true;
    $_SESSION['authCheckHeartbeat'] = time();
  }

  /**
   * Log out user present in $_SESSION.
   *
   * @param array $response response passed byref by ajax.php and populated within function
   */
  function logout(&$response) {
    $_SESSION = array();
    $response['data']['result'] = 1;
  }

  /**
   * Return a list of users.
   *
   * @return array list of users
   */
  function listUsers() {

  }

  /**
   *
   * Update user information such as password and admin status
   * @param array $vboxRequest request passed from ajax.php representing the ajax request. Contains user, password and administration level.
   * @param boolean $skipExistCheck Do not check that the user exists first. Essentially, if this is set and the user does not exist, it is added.
   */
  function updateUser($vboxRequest, $skipExistCheck) {

  }

  /**
   *
   * Remove the user $user
   * @param string $user Username to remove
   */
  function deleteUser($user) {

  }

}
