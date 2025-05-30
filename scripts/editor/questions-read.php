<?php

/**
 * LibreQ (https://github.com/andreas-schwenk/LibreQ)
 * copyright by Andreas Schwenk <contact@arts-and-sciences.com>
 * licensed under GPLv3
 */

// This file gets all moodle questions from a given moodle course

session_start();
require_once '../api/init.php';
require_once '../api/db.php';
require_once "config.php";

// TODO: check privileges

$depth = (int) ($_GET['depth'] ?? 0);
$id = (int) ($_GET['id'] ?? 0);

if ($depth < 0 || $depth >= 8)
  exit_failure("Invalid value for depth");

$db = new Database($db_libreq);
$sql = "SELECT * from moodle_question WHERE h$depth= ?";
$rows = $db->query($sql, "i", [$id]);

exit_success("OK", json_encode([
  'rows' => $rows
]));
