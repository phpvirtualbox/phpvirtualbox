# About

April 2025

Project adopted by Anonie Muss. Updated from https://github.com/studnitskiy/phpvirtualbox where
it had been modified to work with VirtualBox 7.1. Thanks to studnitskiy for his work, and now that
he is a member of the github project, I hope he will continue to contribute.

## Roadmap

- [ ] ~~Use Guacamole instead of Flash RDP client~~ Not possible without some gateway server
- [ ] Ensure feature parity with VirtualBox 7.1 minus Oracle Cloud features
- [x] PHP 8.4 compatibility
- [x] jQuery and jQuery UI updates
- [ ] Create a release process where javascript and CSS are minified and releses do not contain unnecessary build artifacts
- [ ] UI parity with VirtualBox 7.1 minus Oracle Cloud features

## History

October 2024

VirtualBox 7.1 support for x86 hosts only, no ARM hosts support.
I've basically made it stop complaining and allow my existing environment to work.
Minimally tested with PHP 8.2 (PHP-FPM + nginx).

Original text follows

This repository is a continuation of phpVirtualBox, which is no longer supported by the official authors (last commit on thier repository was sent on Jan 27, 2021 - written on Jan 18, 2023).

Right now (from 2022), this software is updated by *[Bartek Sz.](https://github.com/BartekSz95)* and various contributors (see https://github.com/BartekSz95/phpvirtualbox/graphs/contributors).

phpVirtualBox was from 2017 to 2021 maintained by Smart Guide Pty Ltd (tudor at smartguide dot com dot au) with support from various contributors.

Originally Copyright © 2010-2015 by Ian Moore (imoore76 at yahoo dot com).

FREE, WITHOUT WARRANTY:

All files of this program (phpVirtualBox) are distributed under the
terms contained in the LICENSE.txt file in this folder unless otherwise
specified in an individual source file. By using this software, you are
agreeing to the terms contained therein. If you have not received and read
the license file, or do not agree with its conditions, please cease using
this software immediately and remove any copies you may have in your
possession.

# Requirements

- PHP 8.X - **Older versions are not considered.**

- Webserver (eg. Apache HTTPD, nginx)

- VirtualBox 7.1.x

# Installation from ZIP file

1) Download ZIP file from GitHub project site: https://github.com/phpvirtualbox/phpvirtualbox/archive/master.zip.
2) Unzip the ZIP file into a folder accessible by your web server.
3) Rename config.php-example to config.php and edit as needed.

Read the wiki for more information : https://github.com/phpvirtualbox/phpvirtualbox/wiki

# Post installation

Default login is (**username**/**password**): *admin*/*admin*

Please report bugs/feature requests to GitHub:
https://github.com/phpvirtualbox/phpvirtualbox/issues

# Password Recovery

Rename the file recovery.php-disabled to recovery.php, navigate to it in your web browser, and follow the instructions presented.
