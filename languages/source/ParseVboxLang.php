<?php
/**
 * Parse VirtualBox (Qt) language files
 *
 * @author    Ian Moore <imooreyahoo@gmail.com>
 * @copyright 2010-2015 Ian Moore
 * @license   https://github.com/phpvirtualbox/phpvirtualbox/blob/master/LICENSE.txt GPLv3
 * @link      https://github.com/phpvirtualbox/phpvirtualbox
 */
require_once 'ParseVboxLang.inc';

// Get command line options.
$o = getopt(ParseVboxLang::$shortopts, ParseVboxLang::$longopts);
if (isset($o['infile']) === true) {
    $infile = $o['infile'];
} else if (isset($o['i']) === true) {
    $infile = $o['i'];
}

if (isset($o['outfile']) === true) {
    $outfile = $o['outfile'];
} else if (isset($o['o']) === true) {
    $outfile = $o['o'];
}

if (isset($o['indir']) === true) {
    $indir = $o['indir'];
} else if (isset($o['I']) === true) {
    $indir = $o['I'];
}

if (isset($o['outdir']) === true) {
    $outdir = $o['outdir'];
} else if (isset($o['O']) === true) {
    $outdir = $o['O'];
}

// File input.
if (isset($infile) === true) {
    if (isset($o['print']) === true || isset($o['p']) === true) {
        ParseVboxLang::printJson($infile);
    } else if (isset($o['info']) === true || isset($o['n']) === true) {
        ParseVboxLang::printFileInfo($infile);
    } else if (isset($outfile) === true) {
        if (isset($o['force']) === true || isset($o['F']) === true) {
            $force = true;
        } else {
            $force = false;
        }

        if (isset($o['verbose']) === true || isset($o['V']) === true) {
            $verbose = true;
        } else {
            $verbose = false;
        }

        ParseVboxLang::convertFile($infile, $outfile, $force, $verbose);
    } else {
        ParseVboxLang::printUsage($argv);
    }//end if
}//end if

// Directory input.
if (isset($indir) === true) {
    if (isset($outdir) === true) {
        if (isset($o['force']) === true || isset($o['F']) === true) {
            $force = true;
        } else {
            $force = false;
        }

        ParseVboxLang::convertFiles($indir, $outdir, $force);
    } else if (isset($o['info']) === true || isset($o['n']) === true) {
        ParseVboxLang::printFilesInfo($indir);
    } else {
        ParseVboxLang::printUsage($argv);
    }
}

// Help input, no input or wrong input.
if (empty($o) === true || isset($o['help']) === true || isset($o['h']) === true) {
    ParseVboxLang::printUsage($argv);
}
