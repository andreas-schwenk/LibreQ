<?php

/**
 * LibreQ (https://github.com/andreas-schwenk/LibreQ)
 * copyright by Andreas Schwenk <contact@arts-and-sciences.com>
 * licensed under GPLv3
 */

// THIS FILE IS INTENDED FOR PUBLIC QUERIES

// Preferences
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include database configuration
include "../user/config.php";

// Connect to MariaDB
$conn = new mysqli($db_libreq_host, $db_libreq_user, $db_libreq_password, $db_libreq_database);

if ($conn->connect_error) {
  echo json_encode([
    'ok' => false,
    'msg' => 'Database connection failed: ' . $conn->connect_error,
    'data' => []
  ]);
  exit;
}

$result = $conn->query("SELECT * FROM question");
if (!$result) {
  echo json_encode([
    'ok' => false,
    'msg' => 'Query failed: ' . $conn->error,
    'data' => []
  ]);
  $conn->close();
  exit;
}

$questions = [];
while ($row = $result->fetch_assoc()) {
  $questions[] = $row;
}

echo json_encode([
  'ok' => true,
  'msg' => '',
  'data' => $questions
], JSON_UNESCAPED_UNICODE);

$conn->close();
