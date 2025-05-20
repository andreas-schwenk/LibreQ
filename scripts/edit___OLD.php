<?php

/**
 * LibreQ (https://github.com/andreas-schwenk/LibreQ)
 * copyright by Andreas Schwenk <contact@arts-and-sciences.com>
 * licensed under GPLv3
 */

// TODO for all php files: do not use type: create separate files.
//    here:   topics_load.php  topics_save.php

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
  case "load_topic_tree": {
      // Query all rows from the 'topic' table
      $result = $conn->query("SELECT * FROM topic ORDER BY position ASC");
      if (!$result) {
        echo json_encode([
          'ok' => false,
          'msg' => 'Query failed'
        ]);
        exit();
      }
      // Fetch all rows as associative arrays
      $topics = [];
      while ($row = $result->fetch_assoc()) {
        $topics[] = $row;
      }
      // Return JSON response
      echo json_encode([
        'ok' => true,
        'msg' => 'Topics loaded successfully',
        'rows' => $topics
      ]);
      break;
    }
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
      $n = count($rows);
      for ($i = 0; $i < $n; $i++) {
        if (array_key_exists($rows[$i]['id'], $map))
          $rows[$i]['id'] = $map[$rows[$i]['id']];
        for ($j = 0; $j < 8; $j++) {
          if (array_key_exists($rows[$i]['id' . $j], $map))
            $rows[$i]['id' . $j] = $map[$rows[$i]['id' . $j]];
        }
      }
      // update the table
      foreach ($rows as $row) {
        $sql = "UPDATE topic
                SET name = ?, depth = ?, id0 = ?, id1 = ?, id2 = ?, id3 = ?, 
                  id4 = ?, id5 = ?, id6 = ?, id7 = ?, position = ?
                WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $id = $row['id'];
        $name = $row['name'];
        $depth = $row['depth'];
        $id0 = $row['id0'];
        $id1 = $row['id1'];
        $id2 = $row['id2'];
        $id3 = $row['id3'];
        $id4 = $row['id4'];
        $id5 = $row['id5'];
        $id6 = $row['id6'];
        $id7 = $row['id7'];
        $position = $row['position'];
        $stmt->bind_param(
          "siiiiiiiiiii",
          $name,
          $depth,
          $id0,
          $id1,
          $id2,
          $id3,
          $id4,
          $id5,
          $id6,
          $id7,
          $position,
          $id
        );
        $stmt->execute();
        $stmt->close();
      }
      // send feedback
      echo json_encode([
        'ok' => true,
        'msg' => 'Saved entries',
        'rows' => json_encode($rows)
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
