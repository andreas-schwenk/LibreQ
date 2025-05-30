<?php

/**
 * LibreQ (https://github.com/andreas-schwenk/LibreQ)
 * copyright by Andreas Schwenk <contact@arts-and-sciences.com>
 * licensed under GPLv3
 */

// This file writes the root topics (domains) to table "domains"

session_start();
require_once '../api/init.php';
require_once '../api/db.php';
require_once "config.php";

$db = new Database($db_libreq);

// delete old domain contents
$rows = $db->query("DELETE FROM domain;", "", []);

// parse, check and insert new contents
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
$input = $data['data'];
$lines = explode("\n", $input);
$lines = array_filter(array_map('trim', $lines), fn($line) => $line !== '');
$params_list = [];
$position = 0;
foreach ($lines as $line) {
  $parts = explode(':', $line, 2);
  if (count($parts) !== 2)
    exit_failure("Invalid format in line: '$line'");
  $name = trim($parts[0]);
  $code = trim($parts[1]);
  if (!is_numeric($code) || intval($code) != $code || $code < 0)
    exit_failure("Invalid code in line: '$line'");
  array_push(
    $params_list,
    [$code, $name, $position]
  );
  $position++;
}
$sql = "INSERT INTO domain (code, name, position) VALUES (?, ?, ?)";
$db->query_sequence($sql, "isi", $params_list);
exit_success("Domain table populated successfully");
