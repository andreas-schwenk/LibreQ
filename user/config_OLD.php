<?php

/**
 * LibreQ (https://github.com/andreas-schwenk/LibreQ)
 * copyright by Andreas Schwenk <contact@arts-and-sciences.com>
 * licensed under GPLv3
 */

// ----- General preferences -----

// TODO: this file (and other files in the directory must be hidden with e.g. .htaccess!!!)

// TODO: move this content to config.json + config.secrets.json; move comments to README.md

// The langauge; supported: "en" and "de" (German)
$language = "en";
// The HTML <title> name
$title = "LibreQ";
// The Websites URL
$url = "https://github.com/andreas-schwenk/LibreQ";

// ----- Moodle preferences -----

// The following moodle user is e.g. allowed to create root topics (domains)
$editor_admin_moodle_user = "admin"; // TODO: implement!

// ----- Database configuration -----

$db_moodle = [
  'host' => '127.0.0.1',
  'user' => 'moodle',
  'password' => 'moodle',
  'database' => 'moodle'
];

$db_libreq = [
  'host' => '127.0.0.1',
  'user' => 'libreq',
  'password' => 'libreq',
  'database' => 'libreq'
];
