<?php
//
// jQuery File Tree PHP Connector
//
// Version 1.01
//
// Cory S.N. LaViska
// A Beautiful Site (http://abeautifulsite.net/)
// 24 March 2008
//
// History:
//
// 1.01 - updated to work with foreign characters in directory/file names (12 April 2008)
// 1.00 - released (24 March 2008)
//
// Output a list of files for jQuery File Tree
//
//	]--- Modified by Ian Moore for phpVirtualBox.
//
// $Id: jqueryFileTree.php 592 2015-04-12 19:53:44Z imoore76 $
//
//

# Turn off PHP notices
error_reporting(E_ALL & ~E_NOTICE & ~E_STRICT & ~E_WARNING);

global $vbox, $localbrowser, $allowed;

require_once(dirname(__FILE__).'/lib/config.php');
require_once(dirname(__FILE__).'/lib/utils.php');
require_once(dirname(__FILE__).'/lib/vboxconnector.php');

error_reporting(E_ALL & ~E_NOTICE & ~E_STRICT & ~E_WARNING);

session_init();
if(!$_SESSION['valid']) return;

/*
 * Get Settings
 */
$settings = new phpVBoxConfigClass();


$vbox = new vboxconnector();
$vbox->connect();

/*
 * Clean request
 */
global $request;
$request = clean_request();

/*
 * Determine directory separator
 */
$localbrowser = @$settings->browserLocal;
if($localbrowser) {
    define('DSEP', DIRECTORY_SEPARATOR);
} else {
    define('DSEP',$vbox->getDsep());
}

/*
 * Compose allowed file types list
 */
$allowed_exts = $settings->browserRestrictFiles;
if(is_array($allowed_exts) && count($allowed_exts) > 0) $allowed_exts = array_combine($allowed_exts,$allowed_exts);
else $allowed_exts = array();

/* Allowed folders list */
$allowed_folders = @$settings->browserRestrictFolders;
if(!is_array($allowed_folders))
	$allowed_folders = array();

/*
 * Get a list of windows drives
 */
function get_windows_drives() {
    $checklist = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $drives = array();
    for($i = 0; $i < strlen($d); $i++) {
        if(is_dir($checklist[$i].':\\')) {
            $drives[] = $checklist[$i].':\\';
        }
    }
    return $drives;
}

/*
 * Allowed folders in windows if none are set
 */
if(stripos($vbox->vbox->host->operatingSystem,'win') === 0 && !count($allowed_folders)) {

	/*
	 * Assumes web server and vbox host are the same physical machine
	 */
    if($request['fullpath'] && !$settings->forceWindowsAllDriveList && !$settings->noWindowsDriveList && stripos(PHP_OS,'win') === 0) {


        $allowed_folders = get_windows_drives();

    /*
     * Just show all C-Z drive letters if vboxhost is windows and our web server is not...
     */
    } else if($request['fullpath'] && ($settings->forceWindowsAllDriveList || (!$settings->noWindowsDriveList && stripos(PHP_OS,'win') === false))) {
    	$allowed_folders = array();
        for($i = 67; $i < 91; $i++) {
        	$allowed_folders[] = chr($i) .':\\';
        }
    }
    $allowed_folders = array_combine($allowed_folders,$allowed_folders);

}


/* Deterine target DIR requested.
 * In some cases, "dir" passed is just a file name
 */
if(strpos($request['dir'],DSEP)===false) {
	$request['dir'] = DSEP;
}

// Eliminate duplicate DSEPs
$request['dir'] = str_replace(DSEP.DSEP,DSEP,$request['dir']);


/*
 * Check that folder restriction validates if it exists
 */
if($request['dir'] != DSEP && count($allowed_folders)) {
	$valid = false;
	foreach($allowed_folders as $f) {
		if(strpos(strtoupper($request['dir']),strtoupper($f)) === 0) {
			$valid = true;
			break;
		}
	}
	if(!$valid) {
		$request['dir'] = DSEP;
	}
}

/*
 * Populate $returnData with directory listing
 */
$returnData = array();

/* Folder Restriction with root '/' requested */
if($request['dir'] == DSEP && count($allowed_folders)) {

	/* Just return restricted folders */
	foreach($allowed_folders as $f) {
		array_push($returnData, folder_entry($f, true));

	}

} else {


    /* Full, expanded path to $dir */
    if($request['fullpath']) {


    	/* Go through allowed folders if it is set */
    	if(count($allowed_folders)) {


    		foreach($allowed_folders as $f) {

    			/* If this was not exactly the requested folder, but a parent,
    			 * list everything below it.
    			 */
    			if((strtoupper($request['dir']) != strtoupper($f)) && strpos(strtoupper($request['dir']),strtoupper($f)) === 0) {

    				// List entries in this folder
    				$path = explode(DSEP, substr($request['dir'],strlen($f)));

    				if($path[0] == '') {
    				    array_shift($path);
    				}

    			    $folder_entry = folder_entry($f, true);

    			    $folder_entry['children'] = getdir($f, $request['dirsOnly'], $path);
    			    $folder_entry['expanded'] = true;

    			    array_push($returnData, $folder_entry);

    			} else {
    				array_push($returnData, folder_entry($f,true));
    			}

    		}

    	/* Just get full path */
    	} else {

			// List entries in this folder
			$path = explode(DSEP,$request['dir']);
			$root = array_shift($path).DSEP;

			// Folder entry
			$returnData = getdir($root, $request['dirsOnly'], $path);

    	}


    } else {

        /* Default action. Return dir requested */
        $returnData = getdir($request['dir'], $request['dirsOnly']);

    }

}

header('Content-type: application/json');
echo(json_encode($returnData));


/*
 * Get directory entries
 */
function getdir($dir, $dirsOnly=false, $recurse=array()) {

	global $allowed_exts;

	if(!$dir) $dir = DSEP;

	$entries = getDirEntries($dir, $dirsOnly);

    if(!count($entries))
    	return array();

    $dirents = array();
    foreach($entries as $path => $type) {

        if($type == 'folder' && count($recurse) && (strcasecmp($recurse[0],vbox_basename($path)) == 0)) {

        	$entry = folder_entry($path, false, true);

            $entry['children'] = getdir($dir.DSEP.array_shift($recurse), $dirsOnly, $recurse);

            array_push($dirents, $entry);

        } else {

        	// Push folder on to stack
        	if($type == 'folder') {

        	   array_push($dirents, folder_entry($path));

        	// Push file on to stack
        	} else {

        		$ext = strtolower(preg_replace('/^.*\./', '', $path));

                if(count($allowed_exts) && !$allowed_exts['.'.$ext]) continue;

                array_push($dirents, file_entry($path));
        	}
        }

    }

    return $dirents;

}

function vbox_basename($b) { return substr($b,strrpos($b,DSEP)+1); }
function file_entry($f) {
	$f = str_replace(DSEP.DSEP,DSEP,$f);
    $ext = strtolower(preg_replace('/^.*\./', '', $f));
    return array(
        'ext' => $ext,
        'name' => htmlentities(vbox_basename($f), ENT_QUOTES),
        'path' => htmlentities($f, ENT_QUOTES),
        'type' => 'file'
    );
}
function folder_entry($f,$full=false,$expanded=false) {
	$f = str_replace(DSEP.DSEP,DSEP,$f);
    $selected = (strnatcasecmp(rtrim($f,DSEP),rtrim($GLOBALS['request']['dir'],DSEP)) == 0) && $expanded;
    return array(
        'expanded' => (bool)$expanded,
        'selected' => (bool)$selected,
        'path' => htmlentities($f,ENT_QUOTES),
        'name' => htmlentities(($full ? $f : vbox_basename($f)),ENT_QUOTES),
        'type' => 'folder',
		'children' => array()
    );
}



/**
 * Rreturn a list of directory entries
 *
 * @param String $dir
 * @return Array of entries
 */

function getDirEntries($dir, $foldersOnly=false) {

	global $localbrowser, $allowed_exts, $vbox;

	// Append trailing slash if it isn't here
	if(substr($dir,-1) != DSEP)
	    $dir .= DSEP;


    /*
     * Use local file / folder browser (PHP)
     */
	if($localbrowser) {

		// If the dir doesn't exist or we can't scan it, just return
		if(!(file_exists($dir) && ($ents = @scandir($dir))))
			return array();

		$newtypes = array();
		$newents = array();
		for($i = 0; $i < count($ents); $i++) {

			// Skip . and ..
			if($ents[$i] == '.' || $ents[$i] == '..')
				continue;

			$fullpath = $dir.$ents[$i];
			$isdir = @is_dir($fullpath);

			if(!$isdir && $foldersOnly)
				continue;

			array_push($newtypes, $isdir ? 'folder' : 'file');
			array_push($newents, $fullpath);
		}
		return array_combine($newents, $newtypes);

	/*
	 * Use remote file / folder browser (vbox)
	 */
	} else {

		try {


		    $appl = $vbox->vbox->createAppliance();
		    $vfs = $appl->createVFSExplorer('file://'.str_replace(DSEP.DSEP,DSEP,$dir));
		    $progress = $vfs->update();
		    $progress->waitForCompletion(-1);
		    $progress->releaseRemote();
		    list($ents,$types) = $vfs->entryList();
		    $vfs->releaseRemote();
		    $appl->releaseRemote();

		} catch (Exception $e) {

		    echo($e->getMessage());

		    return array();

		}

		// Convert types to file / folder
		$newtypes = array();
		$newents = array();
		for($i = 0; $i < count($types); $i++) {

			// Skip . and ..
			if($ents[$i] == '.' || $ents[$i] == '..')
			    continue;

			$isdir = $types[$i] == 4;

			if(!$isdir && $foldersOnly)
				continue;

			array_push($newtypes, $isdir ? 'folder' : 'file');
			array_push($newents, $dir.$ents[$i]);
		}
		return array_combine($newents,$newtypes);

	}


}
