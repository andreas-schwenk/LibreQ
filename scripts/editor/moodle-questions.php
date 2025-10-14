<?php

/**
 * LibreQ (https://github.com/andreas-schwenk/LibreQ)
 * copyright by Andreas Schwenk <contact@arts-and-sciences.com>
 * licensed under GPLv3
 */

// This file gets all moodle questions from a given moodle course

session_start();
require_once '../api/init.php';
require_once '../api/db.php';
require_once "../config.php";

// TODO: this is old!!

$db = new Database($db_moodle);
$course_id = trim($_GET['course_id'] ?? ""); // TODO: return error, if not given
$sql = "SELECT q.id AS question_id
      FROM mdl_question_versions qv
      JOIN (
          SELECT questionbankentryid, MAX(version) AS max_version
          FROM mdl_question_versions
          GROUP BY questionbankentryid
      ) latest ON latest.questionbankentryid = qv.questionbankentryid AND latest.max_version = qv.version
      JOIN mdl_question q ON q.id = qv.questionid
      JOIN mdl_question_bank_entries qbe ON qbe.id = qv.questionbankentryid
      JOIN mdl_question_categories qc ON qc.id = qbe.questioncategoryid
      JOIN mdl_context ctx ON ctx.id = qc.contextid
      WHERE ctx.contextlevel = 70
        AND ctx.instanceid = ?  -- the course ID
      ORDER BY qc.name, q.name;";
$rows = $db->query($sql, "i", [$course_id]);
$data = json_encode([
  'rows' => $rows
]);
exit_success('Loaded questions', $data);

// TODO: check permissions!!!
