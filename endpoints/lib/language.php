<?php
/**
 * __vbox_language class and trans() function
 *
 * @author Ian Moore (imoore76 at yahoo dot com)
 * @copyright Copyright (C) 2010-2015 Ian Moore (imoore76 at yahoo dot com)
 * @version $Id: language.php 591 2015-04-11 22:40:47Z imoore76 $
 * @see languages/languages.txt
 * @package phpVirtualBox
 *
 */

global $_vbox_language;

// Settings contains language
require_once(dirname(__FILE__).'/config.php');
require_once(dirname(__FILE__).'/utils.php');

define('VBOX_BASE_LANG_DIR', dirname(dirname(dirname(__FILE__))) .'/languages');

/**
 * Language class. Parses language file and stores translations in an array.
 *
 * @author Ian Moore (imoore76 at yahoo dot com)
 * @copyright Copyright (C) 2010-2015 Ian Moore (imoore76 at yahoo dot com)
 * @version $Id: language.php 591 2015-04-11 22:40:47Z imoore76 $
 * @package phpVirtualBox
 *
 * @global __vbox_language $GLOBALS['_vbox_language'] global __vbox_language instance
 * @name $_vbox_language
*/
class __vbox_language {

	/**
	 * Static language data used for translations
	 * @var array
	 */
	static $langdata = null;

	/**
	 *
	 * Constructor parses language file and stores translations.
	 */
	function __construct() {

		# Already initialized?
		if(is_array(self::$langdata)) return;

		self::$langdata = array();

		$settings = new phpVBoxConfigClass();
		$lang = strtolower($settings->language);

		if(@$_COOKIE['vboxLanguage']) {
			$lang = str_replace(array('/','\\','.'),'',$_COOKIE['vboxLanguage']);
		}

		// File as specified
		if($lang && file_exists(VBOX_BASE_LANG_DIR.'/source/'.$lang.'.dat')) {
			@define('VBOXLANG', $lang);

		// No lang file found
		} else {
			$lang = 'en';
			@define('VBOXLANG', $lang);
			self::$langdata['contexts'] = array();
			return;
		}


		self::$langdata = unserialize(@file_get_contents(VBOX_BASE_LANG_DIR.'/source/'.$lang.'.dat'));

		$xmlObj = simplexml_load_string(@file_get_contents(VBOX_BASE_LANG_DIR.'/'.$lang.'.xml'));
		$arrXml = $this->objectsIntoArray($xmlObj);

		$lang = array();
		if(!@$arrXml['context'][0]) $arrXml['context'] = array($arrXml['context']);
		foreach($arrXml['context'] as $c) {

			if(!is_array($c) || !@$c['name']) continue;
			if(!@$c['message'][0]) $c['message'] = array($c['message']);

		   	$lang['contexts'][$c['name']] = array();
		   	$lang['contexts'][$c['name']]['messages'] = array();

			foreach($c['message'] as $m) {

		       if(!is_array($m)) continue;

		       $s = $m['source'];
		       unset($m['source']);
		       $lang['contexts'][$c['name']]['messages'][$s] = $m;
	    	}
		}
		self::$langdata = array_merge_recursive(self::$langdata, $lang);
	}

	/**
	 * Translate text.
	 * @param string $item message to translate
	 * @param string $context context in which the translation should be performed
	 */
	function trans($item,$context='phpVirtualBox') {
		$t = @self::$langdata['contexts'][$context]['messages'][$item]['translation'];
		return ($t ? $t : $item);
	}

	/**
	 *
	 * Converts objects into array. Called from class constructor.
	 * @param array|object $arrObjData object or array to convert to array
	 * @param array $arrSkipIndices array of indices to skip
	 * @return array
	 */
	function objectsIntoArray($arrObjData, $arrSkipIndices = array())
	{
	    $arrData = array();

	    // if input is object, convert into array
	    if (is_object($arrObjData)) {
	        $arrObjData = get_object_vars($arrObjData);
	    }

	    if (is_array($arrObjData)) {
	        foreach ($arrObjData as $index => $value) {
	            if (is_object($value) || is_array($value)) {
	                $value = $this->objectsIntoArray($value, $arrSkipIndices); // recursive call
	            }
	            if (in_array($index, $arrSkipIndices)) {
	                continue;
	            }
	            $arrData[$index] = $value;
	        }
	    }
	    return $arrData;
	}

}

/**
 * Translate text. If $GLOBALS['_vbox_language'] is not set, create a new
 * instance and pass params to its trans() method
 * @param string $msg message to translate
 * @param string $context context in which the translation should be performed
 * @uses $_vbox_language
 * @return string
 */
function trans($msg,$context='phpVirtualBox') {
	if(!is_object($GLOBALS['_vbox_language'])) $GLOBALS['_vbox_language'] = new __vbox_language();
	return $GLOBALS['_vbox_language']->trans($msg,$context);
}
