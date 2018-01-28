<?php
/*
 * Script to check PHP extension requirements before running phpvirtualbox.
 * If one of these two PHP extensions is not enabled, the script will output a javascript variable definition, handled by index.html as a failed test.
 * If both of these PHP extension are enabled, the script will end without any output, handled by index.html as a successfull test.
 *
 * @author : thomas.pochetat@wanadoo.fr
 *
 */

if(!class_exists('SoapClient')) {
	echo('var __vboxCheckPHPRequirements = "PHP does not have the SOAP extension enabled."');
}
else if(!function_exists('json_encode')) {
	echo('var __vboxCheckPHPRequirements = "PHP does not have the JSON extension enabled."');
}

?>
