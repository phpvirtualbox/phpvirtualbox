<?php
/**
 *
 * MySQL authentication module. Uses MySQL capability to store or
 * retrieve user credentials. Called from API when authentication
 * functions are requested.
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * version 3 as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * @author Filippo Callegari (callegari.filippo@gmail.com)
 * @version $Id:1.0 MySQL.php 2015-03-10 23:49:11 Tio Igor
 * @package phpVirtualBox
 *
 */
 
 
/**
 *	struct of db:
 *		CREATE TABLE users(
 *			username VARCHAR(20) PRIMARY KEY,
 *			password VARCHAR(40),
 *			admin ENUM('0','1') DEFAULT '0'
 *			)ENGINE=InnoDB;
 *
 *	user:admin, pass:admin
 *	INSERT INTO users(username,password,admin)
 *		VALUES("admin","$1$65CMtT1M$GSDBTEZ6o5Web.4cDL6rz1",'1')
 *
 */
class phpvbAuthMySQL implements phpvbAuth
{
	
	var $capabilities = array(
			'canChangePassword' => true,
			'canModifyUsers' => true,
			'canLogout' => true
		);
	
	/**
	 *
	 * Connect to MySQL DB.
	 * return PDOconnection.
	 */
	function newPDO()
	{
		$host="127.0.0.1";
		$port=3306;
		$user="MySQLuser";
		$pass="MySQLpassword";
		$db="vboxDB";
		
		try{
			return new PDO("mysql:host=$host;port=$port;dbname=$db;charset=utf8",$user,$pass);
		}catch (PDOException $e){throw new Exception("Can't connect to MySQL db!",vboxconnector::PHPVB_ERRNO_CONNECT);}
	}
	
	/**
	 *
	 * Select row from username
	 * @param $username the user we search
	 * return row
	 */
	function PDO_selectUser($username)
	{
		try{
			$statement=$this->newPDO()->prepare("SELECT username, password, admin FROM users WHERE username=:username");
			$statement->bindValue(":username",$username, PDO::PARAM_STR);
			$statement->execute();
		}catch(PDOException $e){throw new Exception("Can't execute requested query!",vboxconnector::PHPVB_ERRNO_FATAL);}
		return $statement->fetch(PDO::FETCH_ASSOC);
		
	}

	/**
	 *
	 * Generate a random salt.
	 * @param $lenght the lenght of the salt, default is 8.
	 *
	 * On Linux (in particular Ubuntu), the password is generate with this command:
	 * "echo "${username}:${password}" | chpasswd -S -c $crypt_method | cut -d: -f2".
	 * in this particoular implementation I use MD5.
	 *
	 * Max length is 20 char!
	 */
	function generateRandomSalt($length = 8)
	{
		return substr(sha1(rand().time()), rand(0,20-$length), $length);
	}

	/**
	 *
	 * Revalidate login info and set authCheckHeartbeat session variable.
	 * @param vboxconnector $vbox vboxconnector object instance, THIS VARIABLE WILL NOT USED.
	 */
	function heartbeat($vbox)
	{
		global $_SESSION;		
		
		$q=$this->PDO_selectUser(@$_SESSION['user']);
		$p=isset($q['password'])?$q['password']:0;
		
		if($p && $p!=@$_SESSION[uHash])
		{
			$_SESSION['valid']=false;
			session_destroy();
		}
		else
		{
			$_SESSION['admin']=intval(q['admin']);
			$_SESSION['authCheckHeartbeat']=time();
		}
	
		if(!isset($_SESSION['valid']) || !$_SESSION['valid'])
			throw new Exception(trans('Not logged in.','UIUsers'), vboxconnector::PHPVB_ERRNO_FATAL);
	}
	
	/**
	 *
	 * Log in function. Populates $_SESSION
	 * @param string $username user name
	 * @param string $password password
	 */
	function login($username, $password)
	{
		global $_SESSION;
		
		$q=$this->PDO_selectUser($username);
		$p=isset($q['password'])?$q['password']:0;
		
		if($p && password_verify($password,$p))
		{
			$_SESSION['valid'] = true;
			$_SESSION['user'] = $username;
			$_SESSION['admin'] = intval($q['admin']);
			$_SESSION['authCheckHeartbeat'] = time();
			$_SESSION['uHash'] = $p;
		}
		
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
	 * Change password function.
	 * @param string $old old password
	 * @param string $new new password
	 * @return boolean true on success
	 */
	function changePassword($old, $new)
	{
		global $_SESSION;
		
		$p=$this->PDO_selectUser($_SESSION['user']);
		$p=isset($p['password'])?$p['password']:0;		//along the time is changed?
		
		if($p && password_verify($old, $p))
		{
			$np=crypt($new, '$1$'.$this->generateRandomSalt().'$');		//look the MD5 format!!
																		//look here for more info: http://php.net/manual/en/faq.passwords.php
			try{
				$sth=$this->newPDO()->prepare("UPDATE users SET password=:password WHERE username=:username");
				$sth->bindValue(":password",$np,PDO::PARAM_STR);
				$sth->bindValue(":username",$_SESSION['user'],PDO::PARAM_STR);
				$sth->execute();
			}catch(PDOException $e){throw new Exception("Can't execute requested query!",vboxconnector::PHPVB_ERRNO_FATAL);}
			
			return true;
		}
		
		return false;
	}
	
	/**
	 *
	 * Return a list of users
	 * @return array list of users
	 */
	function listUsers()
	{
		$response = array();
		
		try{
			$sth=$this->newPDO()->prepare("SELECT * FROM users");
			$sth->execute();
		}catch(PDOException $e){throw new Exception("Can't display users list!",vboxconnector::PHPVB_ERRNO_FATAL);}
		
		while(($row=$sth->fetch(PDO::FETCH_ASSOC))!==FALSE)
		{
			$response[$row['username']]=array('username'=> $row['username'], 'admin'=> intval($row['admin']));
		}
		
		return $response;
	}
	
	/**
	 *
	 * Update user information such as password and admin status
	 * @param array $vboxRequest request passed from API representing the ajax request. Contains user, password and administration level.
	 * @param boolean $skipExistCheck Do not check that the user exists first. Essentially, if this is set and the user does not exist, it is added.
	 */
	function updateUser($vboxRequest, $skipExistCheck)
	{
		global $_SESSION;
		
		
		if(!$_SESSION['admin'])	return;
		
		$q=$this->PDO_selectUser($vboxRequest['u']);
		if(!$skipExistCheck && $q)	return;

		$np=($vboxRequest['p'])?crypt($vboxRequest['p'], '$1$'.$this->generateRandomSalt().'$'):0;
		
		$query="INSERT INTO `users`(`username`, `password`,`admin`) 
					VALUES (:username, :password, :admin)
					ON DUPLICATE KEY UPDATE `password`=:password, `admin`=:admin";

		$sth=$this->newPDO()->prepare($query);
		try{
			$sth->bindValue(":username",$vboxRequest['u'],PDO::PARAM_STR);
			$sth->bindValue(":password",($vboxRequest['p']?$np:$q['password']),PDO::PARAM_STR);
			$sth->bindValue(":admin",($vboxRequest['a']?"1":"0"),PDO::PARAM_STR);
			
			$sth->execute();
		}catch(PDOException $e){throw new Exception("Can't execute requested query!",vboxconnector::PHPVB_ERRNO_FATAL);}
	}
	
	/**
	 *
	 * Remove the user $user
	 * @param string $user Username to remove
	 */
	function deleteUser($user)
	{
		$sth=$this->newPDO()->prepare("DELETE FROM users  WHERE username=:username");
		try{
			$sth->bindValue(":username",$user,PDO::PARAM_STR);
			$sth->execute();
		}catch(PDOException $e){throw new Exception("Can't execute requested query!",vboxconnector::PHPVB_ERRNO_FATAL);}

	}
}
