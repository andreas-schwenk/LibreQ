<?php

/**
 * LibreQ (https://github.com/andreas-schwenk/LibreQ)
 * copyright by Andreas Schwenk <contact@arts-and-sciences.com>
 * licensed under GPLv3
 */

// This file reads the "topic" table for a given domain (column "id0") from the
// LibreQ database. The result is returned as a string inside a JSON response.
// Each line represents one row. The depth is encoded by the number of leading
// spaces (divided by two). After the indentation comes the "name", followed by
// a colon and the "code". The "position" column determines the line order.

/* Example

Math : 0
  Fundamentals : 1
    Set Theory : 5
  Numbers : 2
  Elementary Functions : 3
    Polynomials : 4
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

// Get domain
$domain = trim($_GET['domain'] ?? ""); // TODO: return error, if not given

// Get topics for the domain
$sql = "SELECT * FROM topic WHERE id0 = ? ORDER BY position ASC;";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $domain);
$stmt->execute();
$result = $stmt->get_result();

// Build output string
$topics = '';
while ($row = $result->fetch_assoc()) {
  $topics = $topics . str_repeat(' ', 2 * $row['depth']);
  $topics = $topics . $row['name'] . " : " . $row['code'] . "\n";
}

// Close the connection
$stmt->close();

// Return output
echo json_encode([
  'ok' => true,
  'msg' => 'Loaded topics table',
  'topics' => $topics
]);
