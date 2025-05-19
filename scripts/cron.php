<?php

/**
 * LibreQ (https://github.com/andreas-schwenk/LibreQ)
 * copyright by Andreas Schwenk <contact@arts-and-sciences.com>
 * licensed under GPLv3
 */

// TODO: make sure that not everyone can start this script!!

// Preferences
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
//header("Content-Type: application/json");
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include database configuration
include "../user/config.php";

// Connect to databases
try {
  $conn = new mysqli($db_libreq_host, $db_libreq_user, $db_libreq_password, $db_libreq_database);
} catch (mysqli_sql_exception $e) {
  echo json_encode([
    'ok' => false,
    'msg' => 'Error: Connection to the LibreQ database failed!'
  ]);
  exit();
}
try {
  $conn_moodle = new mysqli($db_moodle_host, $db_moodle_user, $db_moodle_password, $db_moodle_database);
} catch (mysqli_sql_exception $e) {
  echo json_encode([
    'ok' => false,
    'msg' => 'Error: Connection to the Moodle database failed!'
  ]);
  exit();
}

// ---- TODO: must sync questions from moodle (do not do too much per cron call; also delete questions no longer in moodle) -----

// Minimal non-default values
$moodle_id = 123;
$moodle_name = 'Quadratic Equations';
$moodle_type = 'stack';
$moodle_created = time();
$moodle_modified = time();
$moodle_xml = '';

// Build SQL with only the necessary fields
$sql = "INSERT INTO question (
  moodle_id, moodle_name, moodle_type, moodle_created, moodle_modified, moodle_xml
) VALUES (?, ?, ?, ?, ?, ?)";

$stmt = $mysqli->prepare($sql);
$stmt->bind_param("issiis", $moodle_id, $moodle_name, $moodle_type, $moodle_created, $moodle_modified, $moodle_xml);

// Execute
$stmt->execute();

if ($stmt->affected_rows > 0) {
  echo "Inserted question with ID: " . $stmt->insert_id;
} else {
  echo "Insert failed: " . $stmt->error;
}

$stmt->close();
$mysqli->close();
