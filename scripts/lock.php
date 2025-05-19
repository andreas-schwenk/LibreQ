<?php

/**
 * LibreQ (https://github.com/andreas-schwenk/LibreQ)
 * copyright by Andreas Schwenk <contact@arts-and-sciences.com>
 * licensed under GPLv3
 */

// TODO: this script is not yet used!

// Start Session
session_start();

header("Access-Control-Allow-Origin: *");  // Allow requests from any domain
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

header("Content-Type: application/json"); // JSON response
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Check for valid session (adjust as needed)
if (!isset($_SESSION['user'])) {
  echo json_encode(['ok' => false, 'msg' => 'Unauthorized: no session']);
  exit;
}

// Setup database connection
$conn = new mysqli('localhost', 'username', 'password', 'database');
if ($conn->connect_error) {
  echo json_encode(['ok' => false, 'msg' => 'Database error']);
  exit;
}

// Parse input parameters
$type     = $_GET['type']     ?? '';
$resource = $_GET['resource'] ?? '';
$user     = $_SESSION['user']; // from session
$ttl      = 300; // seconds (5 minutes)

// Define response structure
$response = ['ok' => false, 'msg' => 'Unknown action'];

switch ($type) {
  case 'acquire':
    // Optional: clean expired locks first
    $stmt = $conn->prepare("DELETE FROM resource_locks WHERE resource = ? AND expires_at < NOW()");
    $stmt->bind_param("s", $resource);
    $stmt->execute();

    // Attempt to acquire
    $stmt = $conn->prepare("INSERT IGNORE INTO resource_locks (resource, user, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? SECOND))");
    $stmt->bind_param("ssi", $resource, $user, $ttl);
    $stmt->execute();

    if ($stmt->affected_rows === 0) {
      $response = ['ok' => false, 'msg' => 'Resource is already locked'];
    } else {
      $response = ['ok' => true, 'msg' => 'Lock acquired'];
    }
    break;

  case 'release':
    $stmt = $conn->prepare("DELETE FROM resource_locks WHERE resource = ? AND user = ?");
    $stmt->bind_param("ss", $resource, $user);
    $stmt->execute();

    if ($stmt->affected_rows === 0) {
      $response = ['ok' => false, 'msg' => 'No lock held or not owner'];
    } else {
      $response = ['ok' => true, 'msg' => 'Lock released'];
    }
    break;

  case 'check':
    $stmt = $conn->prepare("SELECT user, locked_at FROM resource_locks WHERE resource = ?");
    $stmt->bind_param("s", $resource);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
      $response = ['ok' => true, 'msg' => 'Locked by ' . $row['user'] . ' at ' . $row['locked_at']];
    } else {
      $response = ['ok' => true, 'msg' => 'Resource is free'];
    }
    break;

  case 'cleanup':
    $stmt = $conn->prepare("DELETE FROM resource_locks WHERE expires_at < NOW()");
    $stmt->execute();
    $response = ['ok' => true, 'msg' => 'Expired locks cleaned'];
    break;
}

echo json_encode($response);
