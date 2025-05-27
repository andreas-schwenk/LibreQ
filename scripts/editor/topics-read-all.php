<?php

/**
 * LibreQ (https://github.com/andreas-schwenk/LibreQ)
 * copyright by Andreas Schwenk <contact@arts-and-sciences.com>
 * licensed under GPLv3
 */

// This file reads the entire "topic" table

session_start();
require_once '../api/init.php';
require_once '../api/db.php';
require_once "../../user/config.php";

// Get topics for the domain
$db = new Database($db_libreq);
$sql = "SELECT * FROM topic ORDER BY position ASC";
$rows = $db->query($sql, "", []);

// Return output
exit_success('Loaded topics table', json_encode([
  'rows' => $rows
]));
