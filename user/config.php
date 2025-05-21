<?php

/**
 * LibreQ (https://github.com/andreas-schwenk/LibreQ)
 * copyright by Andreas Schwenk <contact@arts-and-sciences.com>
 * licensed under GPLv3
 */

// ----- General preferences -----

// The following moodle user is e.g. allowed to create root topics (domains)
$admin_moodle_user_id = "admin"; // TODO: implement!

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

// --- TODO: remove the following!!

// Moodle
$db_moodle_host = "127.0.0.1";
$db_moodle_user = "moodle";
$db_moodle_password = "moodle";
$db_moodle_database = "moodle";

// LibreQ
$db_libreq_host = "127.0.0.1";
$db_libreq_user = "libreq";
$db_libreq_password = "libreq";
$db_libreq_database = "libreq";
