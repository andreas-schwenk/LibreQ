<?php

/**
 * LibreQ (https://github.com/andreas-schwenk/LibreQ)
 * copyright by Andreas Schwenk <contact@arts-and-sciences.com>
 * licensed under GPLv3
 */

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
include "../user/config.php";

// Connect to MariaDB
// TODO: in all my projects use try..catch when creating the connection
try {
  $conn = new mysqli($db_moodle_host, $db_moodle_user, $db_moodle_password, $db_moodle_database);
} catch (mysqli_sql_exception $e) {
  echo json_encode([
    'ok' => false,
    'msg' => 'Error: Connection to Moodle database failed!'
  ]);
  exit();
}

// Read raw body content
$raw = file_get_contents('php://input');
// Decode JSON into associative array
$data = json_decode($raw, true);
// Access values
$user = $data['user'] ?? "";
$password = $data['password'] ?? "";

if (strlen($user) == 0 || strlen($password) == 0) {
  echo json_encode([
    'ok' => false,
    'msg' => 'Bitte alle Felder ausfüllen!' // TODO: handle languages everywhere in PHP scripts!!
  ]);
  exit();
}

// Get stored passwordHash
$sql = "SELECT id, username, password FROM mdl_user WHERE username = ?;";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $user);
$stmt->execute();
$result = $stmt->get_result();
$stmt->close();

// Check if the user exists, i.e. a row is returned
if ($row = $result->fetch_assoc()) {
  // Check the password
  $storedHash = $row["password"];
  if (password_verify($password, $storedHash)) {
    $_SESSION['user'] = $user;
    echo json_encode([
      'ok' => true,
      'msg' => 'OK',
      'user' => $user
    ]);
  } else {
    echo json_encode([
      'ok' => false,
      'msg' => 'Ungültiges Passwort'
    ]);
  }
} else {
  echo json_encode([
    'ok' => false,
    'msg' => 'Unbekannter User ' . $user . ''
  ]);
}

// Close connection
$conn->close();
