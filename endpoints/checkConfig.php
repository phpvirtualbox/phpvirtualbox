<?php
/*
 * Script to check that config.php syntax is correct before running phpvirtualbox.
 * If the syntax of config.php is correct, the script will output a javascript variable definition, handled by index.html as a successful test.
 * If there is a syntax error in config.php, the script will end without any output, handled by index.html as a failed test.
 * 
 * @author : thomas.pochetat@wanadoo.fr
 *
 */

if (file_exists(dirname(dirname(__FILE__))).'/config.php')
{
	include(dirname(dirname(__FILE__)).'/config.php');
}

echo('var __vboxCheckConfig = "OK"');

?>
