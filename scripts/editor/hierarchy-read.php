<?php

/**
 * LibreQ (https://github.com/andreas-schwenk/LibreQ)
 * copyright by Andreas Schwenk <contact@arts-and-sciences.com>
 * licensed under GPLv3
 */

// TODO: select only courses the current user has access to

session_start();
require_once '../api/init.php';
require_once '../api/db.php';
require_once "config.php";

$db = new Database($db_libreq);
$sql = "SELECT * FROM moodle_hierarchy ORDER BY id ASC";
$rows = $db->query($sql, "", []);
exit_success('Loaded moodle hierarchy', json_encode([
  'rows' => $rows
]));
