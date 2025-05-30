<?php

/**
 * LibreQ (https://github.com/andreas-schwenk/LibreQ)
 * copyright by Andreas Schwenk <contact@arts-and-sciences.com>
 * licensed under GPLv3
 */

// This file logs in a Moodle user into the LibreQ editor

session_start();
require_once '../api/init.php';
require_once '../api/db.php';
require_once 'config.php';

// Read raw body content
$raw = file_get_contents('php://input');
// Decode JSON into associative array
$data = json_decode($raw, true);
// Access values
$user = $data['user'] ?? "";
$password = $data['password'] ?? "";

// Check if user and password are set
// TODO: handle languages everywhere in PHP scripts!!
if (strlen($user) == 0 || strlen($password) == 0)
  exit_failure("Bitte alle Felder ausfüllen ");

// Get user password hash
$db = new Database($db_moodle);
$sql = "SELECT id, username, password FROM mdl_user WHERE username = ?;";
$rows = $db->query($sql, "s", [$user]);

// User available?
if (count($rows) == 0)
  exit_failure('Unbekannter User ' . $user);
$row = $rows[0];

// Check the password
$storedHash = $row["password"];
if (password_verify($password, $storedHash) == false)
  exit_failure('Ungültiges Passwort');
// Login successful
$_SESSION['user'] = $user;
exit_success('Login successful', json_encode([
  'user' => $user
]));
