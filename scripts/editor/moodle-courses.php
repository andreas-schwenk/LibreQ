<?php

/**
 * LibreQ (https://github.com/andreas-schwenk/LibreQ)
 * copyright by Andreas Schwenk <contact@arts-and-sciences.com>
 * licensed under GPLv3
 */

// This file gets all moodle courses the current user has access to

session_start();
require_once '../api/init.php';
require_once '../api/db.php';
require_once "../../user/config.php";

$db = new Database($db_moodle);
$sql = "SELECT id, shortname, fullname
        FROM mdl_course 
        WHERE id > 1 AND visible = 1 
        ORDER BY FULLNAME";
$rows = $db->query($sql, "", []);
$data = json_encode([
  'rows' => $rows
]);
exit_success('Loaded moodle courses', $data);

// TODO: only list courses that current user has access to!!
// $sql = "SELECT c.id, c.shortname, c.fullname
// FROM mdl_course c
// JOIN mdl_enrol e ON e.courseid = c.id
// JOIN mdl_user_enrolments ue ON ue.enrolid = e.id
// WHERE ue.userid = ?
//   AND c.id > 1
//   AND c.visible = 1
// ORDER BY c.fullname;"
