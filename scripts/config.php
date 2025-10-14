<?php

/**
 * LibreQ (https://github.com/andreas-schwenk/LibreQ)
 * copyright by Andreas Schwenk <contact@arts-and-sciences.com>
 * licensed under GPLv3
 */

$cwd = getcwd();

// Read config file and set global variables
$path = __DIR__ .  "/../user/config.secrets.json";
$config_secrets = json_decode(file_get_contents($path), true);

$db_moodle = $config_secrets['db_moodle'];
$db_libreq = $config_secrets['db_libreq'];
