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

// TODO: check if session-user is set and it is the admin defined in the config file!

// TODO: check that different codes are submitted and each code has a distance of at least 1000 to each other code!

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

// delete old domain contents
$sql = "DELETE FROM domain;";
$result = $conn->query($sql);
if (!$result) {
  echo json_encode([
    'ok' => false,
    'msg' => 'Deleting the domain table failed.',
  ]);
  $conn->close();
  exit();
}

// Get rows
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
$input = $data['data'];

// Clean input and split lines
$lines = explode("\n", $input);
$lines = array_filter(array_map('trim', $lines), fn($line) => $line !== '');

// Fill new contents
$stmt = $conn->prepare("INSERT INTO domain (code, name, position) VALUES (?, ?, ?)");
if (!$stmt) {
  echo json_encode([
    'ok' => false,
    'msg' => 'Prepare failed'
  ]);
  exit();
}
$stmt->bind_param("isi", $code, $name, $position);
$position = 0;
foreach ($lines as $line) {
  $parts = explode(':', $line, 2);
  if (count($parts) !== 2) {
    echo json_encode([
      'ok' => false,
      'msg' => "Invalid format in line: '$line'"
    ]);
    exit();
  }
  $name = trim($parts[0]);
  $code = trim($parts[1]);
  if (!is_numeric($code) || intval($code) != $code || $code < 0) {
    echo json_encode([
      'ok' => false,
      'msg' => "Invalid code in line: '$line'"
    ]);
    exit();
  }
  if (!$stmt->execute()) {
    echo json_encode([
      'ok' => false,
      'msg' => 'Insert failed: ' . $stmt->error
    ]);
    exit();
  }
  $position++;
}
echo json_encode([
  'ok' => true,
  'msg' => 'Domain table populated successfully'
]);
