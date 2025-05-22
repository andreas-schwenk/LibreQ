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

session_start();
require_once '../api/init.php';
require_once '../api/db.php';
include "../../user/config.php";

// TODO: check if user is allowed to do that!

$db = new Database($db_libreq);

// Get domain
$domain = trim($_GET['domain'] ?? ""); // TODO: return error, if not given

// Get topics for the domain
$sql = "SELECT * FROM topic WHERE id0 = ? ORDER BY position ASC;";
$rows = $db->query($sql, "i", [$domain]);

// Build output string
$topics = '';
foreach($rows as $row) {
  $topics = $topics . str_repeat(' ', 2 * $row['depth']);
  $topics = $topics . $row['name'] . " : " . $row['code'] . "\n";
}

// Return output
exit_success('Loaded topics table', $topics);
