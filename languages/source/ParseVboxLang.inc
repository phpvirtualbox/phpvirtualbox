<?php
/**
 * Symbols for ParseVboxLang.php
 *
 * @author    Ian Moore <imooreyahoo@gmail.com>
 * @copyright 2010-2015 Ian Moore
 * @license   https://github.com/phpvirtualbox/phpvirtualbox/blob/master/LICENSE.txt GPLv3
 * @link      https://github.com/phpvirtualbox/phpvirtualbox
 */

/**
 * Class ParseVboxLang
 */
class ParseVboxLang
{

    /**
     * Short command line options
     *
     * @var string
     */
    public static $shortopts = 'i:o:I:O:pnFVh';

    /**
     * Long command line options
     *
     * @var string[]
     */
    public static $longopts = [
        'infile:',          // -i
        'outfile:',         // -o
        'indir:',           // -I
        'outdir:',          // -O
        'print',            // -p
        'info',             // -n
        'force',            // -F
        'verbose',          // -V
        'help',             // -h
    ];


    /**
     * Print usage information
     *
     * @param array $a Command line arguments.
     *
     * @return void
     */
    public static function printUsage(array $a)
    {
        echo 'Use:  php '.$a[0].' [OPTIONS]... SOURCE OUTPUT'."\n";
        echo '      php '.$a[0].' --infile VirtualBox_en.ts --outfile en.dat'."\n";
        echo '      php '.$a[0].' --indir ../../../virtualbox-nls/ --outdir ./'."\n";
        echo '      php '.$a[0].' --infile VirtualBox_en.ts -p'."\n";
        echo '      php '.$a[0].' --infile VirtualBox_en.ts --info'."\n";
        echo "\n";
        echo 'Arguments:'."\n";
        echo '  -i, --infile    single file input'."\n";
        echo '  -o, --outfile   single file output'."\n";
        echo '  -I, --indir     batch processing directory input'."\n";
        echo '  -O, --outdir    batch processing directory output'."\n";
        echo '  -F, --force     overwrite existing files.'."\n";
        echo '  -p, --print     print json encoded output to stdout'."\n";
        echo '  -n, --info      print translation info for file or directory of files.'."\n";
        echo '  -V, --verbose   verbose output'."\n";
        echo '  -h, --help      print this text'."\n";
        echo "\n";
        echo 'See languages/languages.txt for instructions on adding a new language.'."\n";
        echo "\n";
        exit(0);

    }//end printUsage()


    /**
     * Convert single VirtualBox Qt ts file.
     *
     * @param string  $infile  Qt ts file to convert.
     * @param string  $outfile Converted phpvirtualbox dat file.
     * @param boolean $force   Overwrite outfile if file exists.
     * @param boolean $verbose Print translation summary per context.
     *
     * @return void
     */
    public static function convertFile(string $infile, string $outfile, bool $force=false, bool $verbose=false)
    {
        if (file_exists($outfile) === false || (file_exists($outfile) === true && $force === true)) {
            file_put_contents($outfile, static::serializeTs($infile, $verbose));
        } else {
            echo 'File not converted. Use --force (or -F) to overwrite existing '.$outfile.'.'."\n";
        }

    }//end convertFile()


    /**
     * Batch convert VirtualBox Qt ts files.
     *
     * @param string  $indir  Directory containing Qt ts files to convert.
     * @param string  $outdir Directory to store converted phpvirtualbox dat files.
     * @param boolean $force  If files in target directory should be overwritten.
     *
     * @return void
     */
    public static function convertFiles(string $indir, string $outdir, bool $force)
    {
        $files = glob($indir.'/VirtualBox*.{ts}', GLOB_BRACE);
        foreach ($files as $infile) {
            $filename = basename($infile);

            preg_match('/(?<=VirtualBox_)[A-Za-z_]*/', $filename, $languageCode);
            $languageCode = $languageCode[0];
            $outfile      = $outdir.'/'.strtolower($languageCode).'.dat';

            echo '========================================';
            echo '=================================='."\n\n";
            if ($filename === 'VirtualBox_xx_YY.ts') {
                echo '  Skipping VirtualBox_xx_YY.ts'."\n";
                echo "\n";
            } else {
                static::convertFile($infile, $outfile, $force);

                echo "\n";
            }
        }//end foreach

    }//end convertFiles()


    /**
     * Print translation info from VirtualBox Qt ts file.
     *
     * @param string $ts Qt ts file to extract info from.
     *
     * @return void
     */
    public static function printFileInfo(string $ts)
    {
        $filename = basename($ts);
        if ($filename === 'VirtualBox_xx_YY.ts') {
            echo '  Skipping VirtualBox_xx_YY.ts'."\n";
            return;
        }

        preg_match('/(?<=VirtualBox_)[A-Za-z_]*/', $filename, $languageCodeFilename);

        $xml                  = simplexml_load_file($ts);
        $languageCodeTs       = $xml['language'];
        $languageCodeFilename = strtolower($languageCodeFilename[0]);

        if ((string) $xml->context->name === '@@@') {
            foreach ($xml->context->message as $message) {
                $c = 'Native language name';
                if ((string) $message->comment === $c) {
                    $nativeLang = $message->translation;
                }

                $c = 'Native language country name (empty if this language is for all countries)';
                if ((string) $message->comment === $c) {
                    $nativeCountry = $message->translation;
                }

                $c = 'Language name, in English';
                if ((string) $message->comment === $c) {
                    $nativeLangEn = $message->translation;
                }

                $c = 'Language country name, in English (empty if native country name is empty)';
                if ((string) $message->comment === $c) {
                    $nativeCountryEn = $message->translation;
                }
            }//end foreach
        } else {
            $nativeLang      = 'English';
            $nativeLangEn    = 'English';
            $nativeCountry   = '--';
            $nativeCountryEn = '--';
        }//end if

        echo 'File name:                           ';
        echo $filename."\n";
        echo '  Language code filename:            ';
        echo $languageCodeFilename."\n";
        echo '  Language code Qt:                  ';
        echo $languageCodeTs."\n";
        echo '  Native language name:              ';
        echo $nativeLang."\n";
        echo '  Language name, in English:         ';
        echo $nativeLangEn."\n";
        echo '  Native language country name:      ';
        echo $nativeCountry."\n";
        echo '  Language country name, in English: ';
        echo $nativeCountryEn."\n";
        echo "\n".'Translation files:'."\n";
        // XML file in languages directory?
        if (file_exists(dirname(__FILE__).'/../'.$languageCodeFilename.'.xml') === true) {
            echo '  languages/'.$languageCodeFilename.'.xml exists.'."\n";
        } else {
            echo '  languages/'.$languageCodeFilename.'.xml missing.'."\n";
        }

        // Dat file in languages/source directory?
        if (file_exists(dirname(__FILE__).'/'.$languageCodeFilename.'.dat') === true) {
            echo '  languages/sources/'.$languageCodeFilename.'.dat exists.'."\n";
        } else {
            echo '  languages/sources/'.$languageCodeFilename.'.dat missing.'."\n";
        }

        echo "\n".'Translation setting:'."\n";
        // Language exist in panes/settingsGlobalLanguage.html?
        // "{'id':'bg','name':'Bulgarian','name_tr':'Български (България)'},".
        $translationSetting  = '{\'id\':\'';
        $translationSetting .= $languageCodeFilename;
        $translationSetting .= '\',\'name\':\'';
        $translationSetting .= $nativeLangEn;
        if ($nativeLangEn !== 'English') {
            $translationSetting .= '\',\'name_tr\':\'';
            $translationSetting .= $nativeLang;
        }

        $translationSettingAlt     = $translationSetting.' ('.$nativeCountry.')\'},';
        $translationSettingAltRegx = str_replace('(', '\(', $translationSettingAlt);
        $translationSettingAltRegx = str_replace(')', '\)', $translationSettingAltRegx);
        $translationSetting       .= '\'},';
        $translationSettingRegx    = str_replace('(', '\(', $translationSetting);
        $translationSettingRegx    = str_replace(')', '\)', $translationSettingRegx);

        $settingsFile = dirname(__FILE__).'/../../panes/settingsGlobalLanguage.html';
        if (file_exists($settingsFile) === true) {
            $contents = file_get_contents($settingsFile);
            if (preg_match_all('/'.$translationSettingRegx.'/', $contents) === 1) {
                echo '  '.$translationSetting.' present in ';
                echo 'panes/settingsGlobalLanguage.html'."\n";
            } else if (preg_match('/'.$translationSettingAltRegx.'/', $contents) === 1) {
                echo '  '.$translationSettingAlt.' present in ';
                echo 'panes/settingsGlobalLanguage.html'."\n";
            } else {
                echo '  '.$translationSetting.' missing in ';
                echo 'panes/settingsGlobalLanguage.html'."\n";
            }
        } else {
            echo 'Could not open: '.$settingsFile."\n";
        }

        unset($settingsFile);
        unset($xml);

    }//end printFileInfo()


    /**
     * Print translation info from a directory of VirtualBox Qt ts files.
     *
     * @param string $dir Directory to extract info from.
     *
     * @return void
     */
    public static function printFilesInfo(string $dir)
    {
        $files = glob($dir.'/VirtualBox*.{ts}', GLOB_BRACE);
        foreach ($files as $file) {
            echo '=======================================================';
            echo '=================================================='."\n\n";
            static::printFileInfo($file);
            echo "\n";
        }

    }//end printFilesInfo()


    /**
     * Print json encoded array to stdout.
     *
     * @param string $ts Qt ts file to print.
     *
     * @return void
     */
    public static function printJson(string $ts)
    {
        static::serializeTs($ts, false, true);

    }//end printJson()


    /**
     * Convert VirtualBox Qt ts file to serialized language array.
     *
     * @param string  $ts      Qt ts file to convert.
     * @param boolean $verbose Print translation summary per context.
     * @param boolean $json    Print json encoded array to stdout.
     *
     * @return string Serialized language array.
     */
    private static function serializeTs(string $ts, bool $verbose=false, bool $json=false)
    {
        $filename    = basename($ts);
        $xml         = simplexml_load_file($ts);
        $lang        = [];
        $stats       = [];
        $messages    = 0;
        $converted   = 0;
        $numerusform = 0;
        $vanished    = 0;
        $fuzzy       = 0;
        $unfinished  = 0;
        $obsolete    = 0;
        $duplicate   = 0;

        foreach ($xml->context as $c) {
            $context = (string) $c->name;
            $lang['contexts'][$context]['messages'] = [];
            $stats[$context]['messages']            = count($c->message);
            $stats[$context]['converted']           = 0;
            $stats[$context]['numerusform']         = 0;
            $stats[$context]['vanished']            = 0;
            $stats[$context]['fuzzy']               = 0;
            $stats[$context]['unfinished']          = 0;
            $stats[$context]['obsolete']            = 0;
            $stats[$context]['duplicate']           = 0;

            foreach ($c->message as $m) {
                static::getMessage($m, $lang['contexts'][$context]['messages'], $stats[$context]);
            }

            $messages    += $stats[$context]['messages'];
            $converted   += $stats[$context]['converted'];
            $numerusform += $stats[$context]['numerusform'];
            $vanished    += $stats[$context]['vanished'];
            $fuzzy       += $stats[$context]['fuzzy'];
            $unfinished  += $stats[$context]['unfinished'];
            $obsolete    += $stats[$context]['obsolete'];
            $duplicate   += $stats[$context]['duplicate'];
            if ($verbose === true) {
                echo '  Context: '.$context.'   (';
                echo $stats[$context]['converted'].'/';
                echo $stats[$context]['messages'].')'."\n";
            }
        }//end foreach

        if ($json === true) {
            echo json_encode($lang, JSON_PRETTY_PRINT);
        } else {
            $done = ($messages - $unfinished);
            echo 'File name:                '.$filename."\n";
            echo '  Contexts:               ';
            echo count($lang['contexts']).'/'.count($xml->context)."\n";
            echo '  Translations:           ';
            echo $converted.'/'.$fuzzy.'/'.$done.'/'.$messages;
            echo ' (converted/fuzzy/done/total)'."\n";
            echo '  Fuzzy + done:           '.($fuzzy + $done)."\n";
            echo '  Converted + duplicates: '.($converted + $duplicate)."\n";
            echo '  Unfinished + done:      '.($unfinished + $done)."\n";
            echo '  Numerusform:            '.$numerusform."\n";
            echo '  Vanished:               '.$vanished."\n";
            echo '  Unfinished:             '.$unfinished."\n";
            echo '  Obsolete:               '.$obsolete."\n";
            echo '  Duplicate:              '.$duplicate."\n";
            echo '  Status:                 ';
            if (($converted + $duplicate) === ($fuzzy + $done)) {
                echo "OK\n";
            } else {
                echo 'ERROR: ';
                echo (($fuzzy + $done) - ($converted + $duplicate));
                echo ' strings have not been converted.'."\n";
                echo '                    ';
                echo 'Use --verbose to view translation summary per context ';
                echo 'and compare with Qt Linguist.'."\n";
            }
        }//end if

        unset($xml);
        return serialize($lang);

    }//end serializeTs()


    /**
     * Extract message from context.
     *
     * @param object $m        SimpleXMLElement object.
     * @param array  $messages Reference to $lang messages array.
     * @param array  $stats    Reference to $stats context array.
     *
     * @return void
     */
    private static function getMessage(object $m, array &$messages, array &$stats)
    {
        $type = (string) $m->translation['type'];
        switch ($type) {
            // Translations marked as done. Include these, translated or not.
            case '':
                static::getTranslation($m, $messages, $stats, true);
            break;

            // Skip obsoletes. Qt Linguist ignore these, translated or not.
            case 'obsolete':
                $stats['obsolete']++;
                $stats['messages']--;
            break;

            // Not sure what this means but Qt Linguist counts them so include if not empty.
            case 'vanished':
                static::getTranslation($m, $messages, $stats);
                $stats['vanished']++;
            break;

            // Include translations marked as unfinished if not empty (fuzzy translations).
            case 'unfinished':
                static::getTranslation($m, $messages, $stats);
                $stats['unfinished']++;
            break;

            default:
                // Do nothing.
            break;
        }//end switch

    }//end getMessage()


    /**
     * Extract translation from message.
     *
     * @param object  $m            SimpleXMLElement object.
     * @param array   $messages     Reference to $lang messages array.
     * @param array   $stats        Reference to $stats context array.
     * @param boolean $includeEmpty Whether of not to add if translation is empty.
     *
     * @return void
     */
    private static function getTranslation(object $m, array &$messages, array &$stats, bool $includeEmpty=false)
    {
        $source      = static::clean((string) $m->source);
        $translation = static::clean((string) $m->translation);

        if ((string) $m['numerus'] === 'yes') {
            foreach ($m->translation->numerusform as $n) {
                $messages[$source]['translation']['numerusform'][] = static::clean((string) $n);
            }

            $stats['numerusform']++;
        }

        if ($translation !== '' || $includeEmpty === true) {
            if (isset($messages[$source]['translation']) === false) {
                $messages[$source]['translation'] = $translation;
                $stats['converted']++;
            } else {
                $stats['duplicate']++;
            }

            if ((string) $m->translation['type'] === 'unfinished') {
                $stats['fuzzy']++;
            }
        }

    }//end getTranslation()


    /**
     * Clean strings before inserting into array (ampersands, et al.).
     *
     * Remove <qt> and </qt>. Remove &.
     * Replace &nbsp with space.
     *
     * @param string $s String to clean.
     *
     * @return string Cleaned string.
     */
    private static function clean(string $s)
    {
        return preg_replace(
            '/<\/?qt>/',
            '',
            str_replace(
                '&',
                '',
                html_entity_decode(
                    str_replace(
                        '&nbsp;',
                        ' ',
                        preg_replace(
                            '/\(&[A-Za-z]\)(\s*(?:\.\.\.\s*)|:)?$/',
                            '\1',
                            $s
                        )
                    ),
                    ENT_NOQUOTES,
                    'UTF-8'
                )
            )
        );

    }//end clean()


}//end class
