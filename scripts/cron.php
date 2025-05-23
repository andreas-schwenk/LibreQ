<?php

/**
 * LibreQ (https://github.com/andreas-schwenk/LibreQ)
 * copyright by Andreas Schwenk <contact@arts-and-sciences.com>
 * licensed under GPLv3
 */

// TODO: make sure that not everyone can start this script!!

session_start();
require_once 'api/init.php';
require_once 'api/db.php';
include "../user/config.php";

// TODO: save date of last sync and show it in the frontend

$db_moodle = new Database($db_moodle);
$db_libreq = new Database($db_libreq);

$sql = "SELECT id, contextlevel, instanceid, path, depth 
        FROM mdl_context ORDER BY path";
$mdl_context_rows = $db_moodle->query($sql, "", []);

$sql = "SELECT id, category, fullname 
        FROM mdl_course";
$mdl_course_rows = $db_moodle->query($sql, "", []);

$sql = "SELECT id, course, module, instance 
        FROM mdl_course_modules";
$mdl_course_modules_rows = $db_moodle->query($sql, "", []);

$sql = "SELECT id, name 
        FROM mdl_modules";
$mdl_modules_rows = $db_moodle->query($sql, "", []);

$sql = "SELECT id, questioncategoryid, idnumber, ownerid 
        FROM mdl_question_bank_entries";
$mdl_question_bank_entries_rows = $db_moodle->query($sql, "", []);

$sql = "SELECT id, questionbankentryid, version, questionid, status 
        FROM mdl_question_versions";
$mdl_question_versions_rows = $db_moodle->query($sql, "", []);

$sql = "SELECT id, name, qtype, timecreated, timemodified 
        FROM mdl_question";
$mdl_question_rows = $db_moodle->query($sql, "", []);

$sql = "SELECT id, parent, name, contextid 
        FROM mdl_question_categories";
$mdl_question_categories_rows = $db_moodle->query($sql, "", []);


class HierarchyEntry
{
  public int $id = 0;
  public int $depth = 0;
  public string $name = "";
  public int $course_id = 0;
}

class Course
{
  public int $id = 0;
  public string $name = "";
  public int $contextid = 0;
  public string $path = "";
  public array $moduleids = [];
}

class QuestionCategory
{
  public int $id = 0;
  public int $parent_id = 0;
  public array $children = [];
  public string $name = "";
  public int $contextid = 0;
}

$qbank_module_id = '';
foreach ($mdl_modules_rows as $row) {
  if (strcmp($row['name'], 'qbank') == 0) {
    $qbank_module_id = $row['id'];
  }
}

print("QBANK_MODULE_ID\n");
print_r($qbank_module_id);
print("\n\n");

$courses = [];
foreach ($mdl_context_rows as $ctx_row) {
  if ($ctx_row['contextlevel'] == 50 && $ctx_row['depth'] >= 3) { // 50=course
    foreach ($mdl_course_rows as $course_row) {
      if ($course_row['id'] == $ctx_row['instanceid']) {
        break;
      }
    }
    $course = new Course();
    $course->id = $course_row['id'];
    $course->name = $course_row['fullname'];
    $course->contextid = $ctx_row['id'];
    $course->path = $ctx_row['path'];
    $courses[$course->id] = $course;
    $coursePath = $course->path;
  } else if (
    $ctx_row['contextlevel'] == 70  // 70=module
    && isset($course)
    && str_starts_with($ctx_row['path'], $course->path . "/")
  ) {
    $is_qbank = false;
    foreach ($mdl_course_modules_rows as $row) {
      if ($row['id'] == $ctx_row['instanceid']) {
        if ($row['module'] == $qbank_module_id) {
          $is_qbank = true;
          break;
        }
      }
    }
    if ($is_qbank)
      $course->moduleids[] = $ctx_row['id'];
  }
}

print("COURSES\n");
print_r($courses);
print("\n\n");

$question_categories = [];
foreach ($mdl_question_categories_rows as $row) {
  $qc = new QuestionCategory();
  $qc->id = $row['id'];
  $qc->parent_id = $row['parent'];
  $qc->name = $row['name'];
  $qc->contextid = $row['contextid'];
  $question_categories[$qc->id] = $qc;
}
foreach ($question_categories as $qc) {
  if ($qc->parent_id > 0) {
    $question_categories[$qc->parent_id]->children[$qc->id] = $qc;
  }
}
$root_categories = array_values(
  array_filter($question_categories, fn($qc) => $qc->parent_id == 0)
);
$root_categories_by_contextid = [];
foreach ($root_categories as $rc) {
  $root_categories_by_contextid[$rc->contextid] = $rc;
}

print("ROOT CATEGORIES\n");
print_r($root_categories_by_contextid);

#print("TEST\n");
#print_r(array_key_exists('16', $root_categories_by_contextid));
#exit();

$hierarchy_id_ctr = 0;
$hierarchy = [];

function generate_categories(Course $course, QuestionCategory $qc, int $depth)
{
  global $hierarchy;
  global $hierarchy_id_ctr;
  $he = new HierarchyEntry();
  $he->id = $hierarchy_id_ctr++;
  $he->depth = $depth;
  $he->name = $qc->name;
  $he->course_id = $course->id;
  $hierarchy[] = $he;
  foreach ($qc->children as $child) {
    generate_categories($course, $child, $depth + 1);
  }
}

foreach ($courses as $course) {
  // entry for the course
  $he = new HierarchyEntry();
  $he->id = $hierarchy_id_ctr++;
  $he->depth = 0;
  $he->name = $course->name;
  $he->course_id = $course->id;
  $hierarchy[] = $he;
  // entries for the question categories
  foreach ($course->moduleids as $mi) {
    if (array_key_exists($mi, $root_categories_by_contextid)) {
      generate_categories($course, $root_categories_by_contextid[$mi], 1);
    }
  }
}

print("HIERARCHY\n");
print_r($hierarchy);
print("\n\n");


$sql = "DELETE FROM moodle_hierarchy";
$db_libreq->query($sql, "", []);

$sql = "INSERT INTO moodle_hierarchy (id, depth, name, course_id) 
        VALUES (?, ?, ?, ?)";
$params_list = [];
foreach ($hierarchy as $he) {
  $params_list[] = [
    $he->id,
    $he->depth,
    $he->name,
    $he->course_id,
  ];
}
$db_libreq->query_sequence($sql, "iisi", $params_list);


//print_r($courses);
//print_r($question_categories);

exit_success("blub");



// ------ TODO: THE FOLLOWING IS OLD -------

exit();

$db_moodle = new Database($db_moodle);
$db_libreq = new Database($db_libreq);

// Get all questions from the Moodle database
$sql = "SELECT id, name, qtype, timecreated, timemodified FROM mdl_question";
$rows = $db_moodle->query($sql, "", []);

// Prepare the rows to be inserted in the LibreQ database
$params_list = [];
foreach ($rows as $row) {
  array_push($params_list, [
    $row['id'],
    $row['name'],
    $row['qtype'],
    $row['timecreated'],
    $row['timemodified']
  ]);
}

// Remove all from the LibreQ database
$sql = "DELETE FROM mdl_question";
$db_libreq->query($sql, "", []);

// Insert the rows into the LibreQ database
$sql = "INSERT INTO mdl_question 
        (id, name, qtype, timecreated, timemodified)
        VALUES (?, ?, ?, ?, ?)";
$db_libreq->query_sequence($sql, "issii", $params_list);

exit_success('synced moodle questions');
