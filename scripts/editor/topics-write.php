<?php

/**
 * LibreQ (https://github.com/andreas-schwenk/LibreQ)
 * copyright by Andreas Schwenk <contact@arts-and-sciences.com>
 * licensed under GPLv3
 */

// TODO: writes topic string to the topics table

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

// TODO: check if user is allowed!

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

// Get input data
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
$domain = $data['domain'];
$src = $data['src'];
$lines = explode("\n", $input);
$lines = array_filter(array_map('trim', $lines), fn($line) => $line !== '');
$n = count($lines);

// Check input source and build rows
$rows = [];
$id = [-1, -1, -1, -1, -1, -1, -1, -1];
for ($i = 0; $i < $n; $i++) {
  $code = XXX;
  $name = XXX;
  $depth = XXX;
  $row = [
    'code' => $code,
    'name' => $name,
    'depth' => $depth,
    'position' => $i,   // TODO: add code of the domain!
    'id0' => $id[0],
    'id1' => $id[1],
    'id2' => $id[2],
    'id3' => $id[3],
    'id4' => $id[4],
    'id5' => $id[5],
    'id6' => $id[6],
    'id7' => $id[7]
  ];
  array_push($rows, $row);
}

// Remove all rows of table "topic" with the given domain
$sql = "REMOVE FROM topic WHERE id0 = ?;";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $domain);
$stmt->execute();

// Insert the rows
// TODO


// Close the connection
$stmt->close();

// Return output
echo json_encode([
  'ok' => true,
  'msg' => 'Written topics table',
]);
