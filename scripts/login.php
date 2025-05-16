<?php

/**
 * LibreQ (https://github.com/andreas-schwenk/LibreQ)
 * copyright by Andreas Schwenk <contact@arts-and-sciences.com>
 * licensed under GPLv3
 */

header("Access-Control-Allow-Origin: *");  // Allow requests from any domain
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

header("Content-Type: application/json"); // JSON response
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include database configuration
include "config.php";

// Connect to MariaDB
$conn = new mysqli($db_moodle_host, $db_moodle_user, $db_moodle_password, $db_libreq_database);

// Session
session_start();

// Read raw body content
$raw = file_get_contents('php://input');
// Decode JSON into associative array
$data = json_decode($raw, true);
// Access values
$user = $data['email'] ?? "";
$password = $data['password'] ?? "";

if (strlen($user) == 0 || strlen($password) == 0) {
  echo json_encode([
    'ok' => false,
    'msg' => 'Bitte alle Felder ausfüllen!'
  ]);
  exit();
}

// Check connection
if ($conn->connect_error) {
  echo json_encode(["error" => "❌ Database connection failed: " . $conn->connect_error]);
  exit();
}

// Get stored passwordHash
$sql = "SELECT hash FROM users WHERE mail = ?;";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $user);
$stmt->execute();
$result = $stmt->get_result();
$stmt->close();

// Check if the user exists, i.e. a row is returned
if ($row = $result->fetch_assoc()) {
  // Check the password
  $storedHash = $row["hash"];
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
