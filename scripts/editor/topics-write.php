<?php

/**
 * LibreQ (https://github.com/andreas-schwenk/LibreQ)
 * copyright by Andreas Schwenk <contact@arts-and-sciences.com>
 * licensed under GPLv3
 */

// TODO: writes topic string to the topics table

session_start();
require_once '../api/init.php';
require_once '../api/db.php';
include "../../user/config.php";

// TODO: check if user is allowed to do that!

$db = new Database($db_libreq);

// Get input data
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
$domain = $data['domain'];
$src = $data['src'];
$lines = explode("\n", $input);
$lines = array_filter(array_map('trim', $lines), fn($line) => $line !== '');
$n = count($lines);

// helper functions
function countLeadingSpacesDiv2(string $str): int
{
  preg_match('/^( *)/', $str, $matches);
  $spaces = strlen($matches[1]);
  return intdiv($spaces, 2); // divide by 2 as integer
}
function setArrayValuesToMinusOne(array &$arr, int $startIndex): void
{
  $count = count($arr);
  for ($i = $startIndex; $i < $count; $i++) {
    $arr[$i] = -1;
  }
}

// Check input source and build rows
$rows = [];
$id = [-1, -1, -1, -1, -1, -1, -1, -1];
for ($i = 0; $i < $n; $i++) {
  $parts = explode(':', $line, 2);
  if (count($parts) !== 2)
    exit_failure("Invalid format in line: '$line'");
  $name = trim($parts[0]);
  $code = trim($parts[1]);
  $depth = countLeadingSpacesDiv2($line);
  // TODO: check that depth does not exceed range
  setArrayValuesToMinusOne($id, $depth + 1);
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

print_r($rows);
exit();

// Remove all rows of table "topic" with the given domain
// $sql = "REMOVE FROM topic WHERE id0 = ?;";
// $stmt = $conn->prepare($sql);
// $stmt->bind_param("s", $domain);
// $stmt->execute();
$db->query("REMOVE FROM topic WHERE id0 = ?", "i", $domain);

// Insert rows
// TODO


// Close the connection
$stmt->close();

// Return output
echo json_encode([
  'ok' => true,
  'msg' => 'Written topics table',
]);
