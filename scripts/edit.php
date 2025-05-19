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

// Check if user is logged in
// TODO: check if user is allowed to edit questions / topic tree!
if (isset($_SESSION['user']) == false) {
  echo json_encode([
    'ok' => false,
    'msg' => 'Not logged in'
  ]);
  exit();
}

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

// echo json_encode([
//   'ok' => true,
//   'msg' => "TODO: debugging test..."
// ]);
// exit();

// Get the query type
$type = trim($_GET['type'] ?? "");

// Handle query
switch ($type) {
  case "save_topic_tree": {
      $raw = file_get_contents('php://input');
      $data = json_decode($raw, true);
      // create rows for pseudo-ids
      $pseudoIds = $data['pseudoIds'];
      $map = [];
      foreach ($pseudoIds as $pseudoId) {
        $sql = "INSERT INTO topic (name, depth, position) VALUES (?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $name = '';
        $depth = 0;
        $position = 0;
        $stmt->bind_param("sii", $name, $depth, $position);
        $stmt->execute();
        $map[$pseudoId] = $stmt->insert_id;
        $stmt->close();
      }
      // insert the created IDs in the data rows
      $rows = $data['rows'];
      foreach ($rows as $row) {
        if (array_key_exists($row['id'], $map)) {
          echo $row['id'] . " >> " . $map[$row['id']] . ";";
          $row['id'] = $map[$row['id']];
          echo " NEW ROW: ";
          var_dump($row);
        }
      }
      // send feedback
      echo json_encode([
        'ok' => true,
        'msg' => json_encode($rows)
      ]);
      break;
    }
  default: {
      echo json_encode([
        'ok' => false,
        'msg' => 'Error: Unknown request!'
      ]);
      exit();
      break;
    }
}
