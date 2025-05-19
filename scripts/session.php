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

// Check login
if (isset($_SESSION['user'])) {
  echo json_encode([
    'ok' => true,
    'msg' => 'already logged in',
    'user' => $_SESSION['user']
  ]);
} else {
  echo json_encode([
    'ok' => false,
    'msg' => 'not logged in'
  ]);
}
