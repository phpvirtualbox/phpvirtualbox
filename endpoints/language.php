<?php
/*
 * Injects language translations into phpVirtualBox as a JavaScript object and
 * provides interface translation logic
 * Copyright (C) 2010-2015 Ian Moore (imoore76 at yahoo dot com)
 *
 * $Id: language.php 595 2015-04-17 09:50:36Z imoore76 $
 */


error_reporting(E_ALL & ~E_NOTICE & ~E_STRICT);

require_once(dirname(__FILE__).'/lib/language.php');

if(!is_object($_vbox_language)) $_vbox_language = new __vbox_language();


header("Content-type: application/javascript; charset=utf-8", true);

//Set no caching
header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT");
header("Cache-Control: no-store, no-cache, must-revalidate, post-check=0, pre-check=0");
header("Pragma: no-cache");

if(isset($_GET['debug']) && $_GET['debug']) {
	print_r(__vbox_language::$langdata);
	return;
}

/*
 * Dump in JavaScript
 */
echo('var __vboxLangData = ' . json_encode(__vbox_language::$langdata) .";\n\nvar __vboxLangName = '".constant('VBOXLANG')."';\n\n");


?>


// Failsafe wrapper
function trans(s,c,n,h) {

    if(s && c && c.constructor === Array) {
        o = c.shift();
        n = c.shift();
        h = c.shift();
        c = o;
    }
	if(!c) c = 'VBoxGlobal';

	var r = transreal(s,c,n,h);

	if(typeof r != 'string') {
	   // console.log('Could not translate ' + s + ' with ' + c);
	   return s;
	}

	return r;
}

function transreal(w,context,number,comment) {

	try {

		if(__vboxLangData['contexts'][context]['messages'][w]['translation']) {

			if(__vboxLangData['contexts'][context]['messages'][w]['translation']['numerusform']) {

				var t = __vboxLangData['contexts'][context]['messages'][w]['translation']['numerusform'];

				if(!number) number = 1;

				if(number <= 1 && t[0]) return t[0];
				if(number > 1 && t[1]) return t[1];
				if(t[0]) return t[0];
				return t[1];
			}
			/*
			if (__vboxLangData['contexts'][context]['messages'][w] && __vboxLangData['contexts'][context]['messages'][w]['translation_attr'] && __vboxLangData['contexts'][context]['messages'][w]['translation_attr']['type'] == 'obsolete') {
			   console.log(w + ' in ' + context + ' is obsolete');
			}
			*/
			return __vboxLangData['contexts'][context]['messages'][w]['translation'];

		} else if(__vboxLangData['contexts'][context]['messages'][w][0]) {

			if(comment) {
				for(var i in __vboxLangData['contexts'][context]['messages'][w]) {
					if(__vboxLangData['contexts'][context]['messages'][w][i]['comment'] == comment) {
					    /*
						if (__vboxLangData['contexts'][context]['messages'][w][i]['translation_attr'] && __vboxLangData['contexts'][context]['messages'][w][i]['translation_attr']['type'] == 'obsolete') {
						    console.log(w + ' ' + ' and ' + comment + ' is obsolete');
			             }
			             */

					    return __vboxLangData['contexts'][context]['messages'][w][i]['translation'];
					}
				}
			}
			/*
			if (__vboxLangData['contexts'][context]['messages'][w][0] && __vboxLangData['contexts'][context]['messages'][w][0]['translation_attr'] && __vboxLangData['contexts'][context]['messages'][w][0]['translation_attr']['type'] == 'obsolete') {
			   console.log(w + ' in ' + context + ' is obsolete');
			}
			*/

			return __vboxLangData['contexts'][context]['messages'][w][0]['translation'];

		} else {
			return w;
		}

	} catch(err) {
		// console.log(w + ' - ' + context + ': ' + err);
		return w;
	}
}

