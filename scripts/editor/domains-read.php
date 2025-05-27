<?php

/**
 * LibreQ (https://github.com/andreas-schwenk/LibreQ)
 * copyright by Andreas Schwenk <contact@arts-and-sciences.com>
 * licensed under GPLv3
 */

// This file reads the root topics (domains) from table "domains"

session_start();
require_once '../api/init.php';
require_once '../api/db.php';
require_once "../../user/config.php";

$db = new Database($db_libreq);
$rows = $db->query("SELECT * FROM domain ORDER BY position ASC", "", []);
$data = '';
foreach ($rows as $row)
  $data = $data . $row['name'] . ':' . $row['code'] . "\n";
exit_success('Loaded domains table', $data);
