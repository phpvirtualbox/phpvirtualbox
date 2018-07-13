<?php
/**
 * Simple RDP connection file generator
 *
 * @author Ian Moore (imoore76 at yahoo dot com)
 * @copyright Copyright (C) 2010-2015 Ian Moore (imoore76 at yahoo dot com)
 * @version $Id: rdp.php 591 2015-04-11 22:40:47Z imoore76 $
 * @package phpVirtualBox
 *
 */

# Turn off PHP notices
error_reporting(E_ALL & ~E_NOTICE & ~E_STRICT & ~E_WARNING);

require_once(dirname(__FILE__).'/lib/utils.php');
$_GET = clean_request();

foreach(array('port','host','vm') as $g) {
	@$_GET[$g] = str_replace(array("\n","\r","\0"),'',@$_GET[$g]);
}


header("Content-type: application/x-rdp",true);
header("Content-disposition: attachment; filename=\"". str_replace(array('"','.'),'_',$_GET['vm']) .".rdp\"",true);


echo('
full address:s:'.@$_GET['host'].(@$_GET['port'] ? ':'.@$_GET['port'] : '').'
compression:i:1
displayconnectionbar:i:1
protocol:i:4
');
