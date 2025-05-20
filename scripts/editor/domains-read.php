<?php

/**
 * LibreQ (https://github.com/andreas-schwenk/LibreQ)
 * copyright by Andreas Schwenk <contact@arts-and-sciences.com>
 * licensed under GPLv3
 */

// This file writes the root topics (domains) to table "domains"

// Start Session
session_start();

// Preferences
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include database configuration
include "../../user/config.php";

// TODO: check if session-user is set and it is a user that has topic tree write access!

// Connect to the database
try {
  $conn = new mysqli($db_libreq_host, $db_libreq_user, $db_libreq_password, $db_libreq_database);
} catch (mysqli_sql_exception $e) {
  echo json_encode([
    'ok' => false,
    'msg' => 'Error: Connection to the LibreQ database failed!'
  ]);
  exit();
}

$result = $conn->query("SELECT * FROM domain ORDER BY position ASC");
if (!$result) {
  echo json_encode([
    'ok' => false,
    'msg' => 'Query failed'
  ]);
  exit();
}

$data = '';
while ($row = $result->fetch_assoc()) {
  $data = $data . $row['name'] . ':' . $row['code'] . "\n";
}

echo json_encode([
  'ok' => true,
  'msg' => 'Loaded domains table',
  'data' => $data
]);
