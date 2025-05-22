<?php

/**
 * LibreQ (https://github.com/andreas-schwenk/LibreQ)
 * copyright by Andreas Schwenk <contact@arts-and-sciences.com>
 * licensed under GPLv3
 */

// THIS FILE IS INTENDED FOR PUBLIC QUERIES

session_start();
require_once 'api/init.php';
require_once 'api/db.php';
include "../user/config.php";

$db = new Database($db_libreq);
$rows = $db->query("SELECT * FROM question", "", []);
$data = json_encode([
  'rows' => $rows
]);
exit_success('Loaded questions', $data);
