<?php
/*
 * $Id: parse_vbox_lang.php 350 2011-10-17 17:24:29Z imooreyahoo@gmail.com $
 *
 * Parse VirtualBox (Qt) language files
 */

if(!@$argv[1]) {

   echo("Usage: {$argv[0]} language_file [-php : php print_r style output] [-info : just print info]\n");
   exit;
}

$phpStyle = (@strtolower($argv[2]) == '-php');
$info = (@strtolower($argv[2]) == '-info');

$arrXml = xml2array(file_get_contents($argv[1]));

$lang = array();
$lang['contexts'] = array();


foreach($arrXml['TS']['context'] as $c) {

   $lang['contexts'][$c['name']] = array();
   $lang['contexts'][$c['name']]['messages'] = array();

    if(@$c['message']['source']) $c['message'] = array($c['message']);


    foreach($c['message'] as $m) {

       if(!is_array($m)) continue;

       $s = clean($m['source'],true);
       unset($m['source']);

       // Check for valid translation data
       if(is_array($m['translation']) && count($m['translation']) == 0)
          continue;

       // Translation is a numerusfourm
       if(is_array($m['translation']) && @$m['translation']['numerusform']) {
          if(!is_array($m['translation']['numerusform'])) {
             $m['translation'] = clean($m['translation']['numerusform']);
          } else {
             foreach($m['translation']['numerusform'] as $k=>$v) {
                if(is_array($v)) continue;
                $m['translation']['numerusform'][$k] = clean($v);
             }
          }
       // Translation exists
       } else if(is_array($m['translation'])) {

           // assume unfinished
           $m['translation'] = $s;

       // Translation does not exist yet
       } else {
          $m['translation'] = clean($m['translation']);
       }

       if($phpStyle) {
          $m['htmlized'] = htmlentities($s, ENT_NOQUOTES, 'UTF-8');
          if(strlen($m['htmlized']) == strlen($s)) unset($m['htmlized']);
       }

       // Messages for this context is an array
       if(is_array(@$lang['contexts'][$c['name']]['messages'][$s])) {

          // Translation for this message exists
          if(isset($lang['contexts'][$c['name']]['messages'][$s]['translation'])) {

             // Check to see if incoming translation has 'obsolete'. If so, don't copy it
             if(@$m['translation_attr']['type'] == 'obsolete') continue;

             // Check to see if existing translation has 'obsolete'. If so, overwrite it
             if(@$lang['contexts'][$c['name']]['messages'][$s]['translation_attr']['type'] == 'obsolete') {
                 $lang['contexts'][$c['name']]['messages'][$s] = $m;
                 continue;
             }
          }

           $lang['contexts'][$c['name']]['messages'][$s][] = $m;

       } else {

           $lang['contexts'][$c['name']]['messages'][$s] = $m;
       }

    }
}


function clean($s) {
   return preg_replace('/<\/?qt>/','',str_replace('&','',html_entity_decode(str_replace('&nbsp;',' ',preg_replace('/\(&[A-Za-z]\)(\s*(?:\.\.\.\s*)|:)?$/','\1',$s)), ENT_NOQUOTES, 'UTF-8')));
}


if($info) {
    echo(@$lang['contexts']['@@@']['messages']['English'][0]['translation']);
    $c = @$lang['contexts']['@@@']['messages']['--'][0]['translation'];
    if($c && $c != '--') echo(" (".$c.")");
    echo("\n");

} else if($phpStyle) {
   print_r($lang);
} else {
   echo(serialize($lang));
}


/**
 * xml2array() will convert the given XML text to an array in the XML structure.
 * Link: http://www.bin-co.com/php/scripts/xml2array/
 * Arguments : $contents - The XML text
 *                $get_attributes - 1 or 0. If this is 1 the function will get the attributes as well as the tag values - this results in a different array structure in the return value.
 *                $priority - Can be 'tag' or 'attribute'. This will change the way the resulting array sturcture. For 'tag', the tags are given more importance.
 * Return: The parsed XML in an array form. Use print_r() to see the resulting array structure.
 * Examples: $array =  xml2array(file_get_contents('feed.xml'));
 *              $array =  xml2array(file_get_contents('feed.xml', 1, 'attribute'));
 */
function xml2array($contents, $get_attributes=1, $priority = 'tag') {
    if(!$contents) return array();

    if(!function_exists('xml_parser_create')) {
        //print "'xml_parser_create()' function not found!";
        return array();
    }

    //Get the XML parser of PHP - PHP must have this module for the parser to work
    $parser = xml_parser_create('');
    xml_parser_set_option($parser, XML_OPTION_TARGET_ENCODING, "UTF-8"); # http://minutillo.com/steve/weblog/2004/6/17/php-xml-and-character-encodings-a-tale-of-sadness-rage-and-data-loss
    xml_parser_set_option($parser, XML_OPTION_CASE_FOLDING, 0);
    xml_parser_set_option($parser, XML_OPTION_SKIP_WHITE, 1);
    xml_parse_into_struct($parser, trim($contents), $xml_values);
    xml_parser_free($parser);

    if(!$xml_values) return;//Hmm...

    //Initializations
    $xml_array = array();
    $parents = array();
    $opened_tags = array();
    $arr = array();

    $current = &$xml_array; //Refference

    //Go through the tags.
    $repeated_tag_index = array();//Multiple tags with same name will be turned into an array
    foreach($xml_values as $data) {
        unset($attributes,$value);//Remove existing values, or there will be trouble

        //This command will extract these variables into the foreach scope
        // tag(string), type(string), level(int), attributes(array).
        extract($data);//We could use the array by itself, but this cooler.

        $result = array();
        $attributes_data = array();

        if(isset($value)) {
            if($priority == 'tag') $result = $value;
            else $result['value'] = $value; //Put the value in a assoc array if we are in the 'Attribute' mode
        }

        //Set the attributes too.
        if(isset($attributes) and $get_attributes) {
            foreach($attributes as $attr => $val) {
                if($priority == 'tag') $attributes_data[$attr] = $val;
                else $result['attr'][$attr] = $val; //Set all the attributes in a array called 'attr'
            }
        }

        //See tag status and do the needed.
        if($type == "open") {//The starting of the tag '<tag>'
            $parent[$level-1] = &$current;
            if(!is_array($current) or (!in_array($tag, array_keys($current)))) { //Insert New tag
                $current[$tag] = $result;
                if($attributes_data) $current[$tag. '_attr'] = $attributes_data;
                $repeated_tag_index[$tag.'_'.$level] = 1;

                $current = &$current[$tag];

            } else { //There was another element with the same tag name

                if(isset($current[$tag][0])) {//If there is a 0th element it is already an array
                    $current[$tag][$repeated_tag_index[$tag.'_'.$level]] = $result;
                    $repeated_tag_index[$tag.'_'.$level]++;
                } else {//This section will make the value an array if multiple tags with the same name appear together
                    $current[$tag] = array($current[$tag],$result);//This will combine the existing item and the new item together to make an array
                    $repeated_tag_index[$tag.'_'.$level] = 2;

                    if(isset($current[$tag.'_attr'])) { //The attribute of the last(0th) tag must be moved as well
                        $current[$tag]['0_attr'] = $current[$tag.'_attr'];
                        unset($current[$tag.'_attr']);
                    }

                }
                $last_item_index = $repeated_tag_index[$tag.'_'.$level]-1;
                $current = &$current[$tag][$last_item_index];
            }

        } elseif($type == "complete") { //Tags that ends in 1 line '<tag />'
            //See if the key is already taken.
            if(!isset($current[$tag])) { //New Key
                $current[$tag] = $result;
                $repeated_tag_index[$tag.'_'.$level] = 1;
                if($priority == 'tag' and $attributes_data) $current[$tag. '_attr'] = $attributes_data;

            } else { //If taken, put all things inside a list(array)
                if(isset($current[$tag][0]) and is_array($current[$tag])) {//If it is already an array...

                    // ...push the new element into that array.
                    $current[$tag][$repeated_tag_index[$tag.'_'.$level]] = $result;

                    if($priority == 'tag' and $get_attributes and $attributes_data) {
                        $current[$tag][$repeated_tag_index[$tag.'_'.$level] . '_attr'] = $attributes_data;
                    }
                    $repeated_tag_index[$tag.'_'.$level]++;

                } else { //If it is not an array...
                    $current[$tag] = array($current[$tag],$result); //...Make it an array using using the existing value and the new value
                    $repeated_tag_index[$tag.'_'.$level] = 1;
                    if($priority == 'tag' and $get_attributes) {
                        if(isset($current[$tag.'_attr'])) { //The attribute of the last(0th) tag must be moved as well

                            $current[$tag]['0_attr'] = $current[$tag.'_attr'];
                            unset($current[$tag.'_attr']);
                        }

                        if($attributes_data) {
                            $current[$tag][$repeated_tag_index[$tag.'_'.$level] . '_attr'] = $attributes_data;
                        }
                    }
                    $repeated_tag_index[$tag.'_'.$level]++; //0 and 1 index is already taken
                }
            }

        } elseif($type == 'close') { //End of tag '</tag>'
            $current = &$parent[$level-1];
        }
    }

    return($xml_array);
}
