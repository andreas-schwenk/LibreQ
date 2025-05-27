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
$mdl_question_rows = index_by_column($mdl_question_rows, "id");

$sql = "SELECT id, parent, name, contextid 
        FROM mdl_question_categories";
$mdl_question_categories_rows = $db_moodle->query($sql, "", []);


class HierarchyEntry
{
  public int $id = 0;
  public int $depth = 0;
  public string $name = "";
  public int $question_cnt = 0;
  public int $course_id = 0;
}

class Course
{
  public int $id = 0;
  public string $name = "";
  public int $contextid = 0;
  public string $path = "";
  public array $moduleids = [];
  public $hierarchy_entry_id = -1;
}

class QuestionCategory
{
  public int $id = 0;
  public int $parent_id = 0;
  public ?QuestionCategory $parent = null;
  public array $children = [];
  public string $name = "";
  public int $contextid = 0;
  public $hierarchy_entry_id = -1;
  public ?Course $course = null; // only set for root categories
}

class Question
{
  public int $bank_entries_id = 0;
  public int $version = 0;
  public int $questionid = 0;
  public string $name = "";
  public string $type = "";
  public int $created;
  public int $modified;
  public array $hierarchy = [];
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
    $qc->parent = $question_categories[$qc->parent_id];
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
  $qc->hierarchy_entry_id = $he->id;
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
  $course->hierarchy_entry_id = $he->id;
  $hierarchy[] = $he;
  // entries for the question categories
  foreach ($course->moduleids as $mi) {
    if (array_key_exists($mi, $root_categories_by_contextid)) {
      $root = $root_categories_by_contextid[$mi];
      $root->course = $course;
      generate_categories($course, $root, 1);
    }
  }
}

print("HIERARCHY\n");
print_r($hierarchy);
print("\n\n");

$questions = []; // key := questionbankentryid

foreach ($mdl_question_bank_entries_rows as $row) {
  $id = $row['id'];
  $question = new Question();
  $question->bank_entries_id = $id;
  $category_id = $row['questioncategoryid'];
  $category = $question_categories[$category_id];
  if ($category->hierarchy_entry_id < 0) {
    // question belongs e.g. to a quiz question bank -> ignore it
    continue;
  }
  $questions[$id] = $question;
  $question->hierarchy[] = $category->hierarchy_entry_id;
  while ($category->parent != null) {
    array_unshift($question->hierarchy, $category->parent->hierarchy_entry_id);
    $category = $category->parent;
  }
  array_unshift($question->hierarchy, $category->course->hierarchy_entry_id);
  foreach ($question->hierarchy as $he) {
    $hierarchy[$he]->question_cnt++;
  }
}

foreach ($mdl_question_versions_rows as $row) {
  $id = $row['questionbankentryid'];
  if (array_key_exists($id, $questions)) {
    $version = $row['version'];
    if ($version > $questions[$id]->version) {
      $questions[$id]->version = $version;
      $questions[$id]->questionid = $row['questionid'];
    }
  }
}

foreach ($questions as $question) {
  $mdl_question = $mdl_question_rows[$question->questionid];
  $question->name = $mdl_question['name'];
  $question->type = $mdl_question['qtype'];
  $question->created = $mdl_question['timecreated'];
  $question->modified = $mdl_question['timemodified'];
}


print("QUESTIONS\n");
print_r($questions);


// write results into database
// (a) hierarchy
$sql = "DELETE FROM moodle_hierarchy";
$db_libreq->query($sql, "", []);
$sql = "INSERT INTO moodle_hierarchy (id, depth, name, question_cnt, course_id) 
        VALUES (?, ?, ?, ?, ?)";
$params_list = [];
foreach ($hierarchy as $he) {
  $params_list[] = [
    $he->id,
    $he->depth,
    $he->name,
    $he->question_cnt,
    $he->course_id,
  ];
}
$db_libreq->query_sequence($sql, "iisii", $params_list);

// (b) questions
$sql = "DELETE FROM moodle_question";
$db_libreq->query($sql, "", []);
$sql = "INSERT INTO moodle_question (id, questionid, name, qtype, 
          timecreated, timemodified, h0, h1, h2, h3, h4, h5, h6, h7)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
$params_list = [];
foreach ($questions as $question) {
  $n = count($question->hierarchy);
  $params_list[] = [
    $question->bank_entries_id,
    $question->version,
    $question->questionid,
    $question->name,
    $question->type,
    $question->created,
    $question->modified,
    $h0 = ($n > 0) ? $question->hierarchy[0] : -1,
    $h1 = ($n > 1) ? $question->hierarchy[1] : -1,
    $h2 = ($n > 2) ? $question->hierarchy[2] : -1,
    $h3 = ($n > 3) ? $question->hierarchy[3] : -1,
    $h4 = ($n > 4) ? $question->hierarchy[4] : -1,
    $h5 = ($n > 5) ? $question->hierarchy[5] : -1,
    $h6 = ($n > 6) ? $question->hierarchy[6] : -1,
    $h7 = ($n > 7) ? $question->hierarchy[7] : -1
  ];
}
$db_libreq->query_sequence($sql, "iiissiiiiiiiiii", $params_list);

//print("QUESTIONS___prepared\n");
//print_r($params_list);


exit_success("cron ended successfully");
