-- Foreign keys are intentionally not used to keep the schema compatible with a wide range of tools,
-- simplify backups, restores, and migrations, and avoid potential issues during bulk imports or deletes.
-- Referential integrity is handled at the application level where needed.
-- Junction tables (e.g., for tags or topics) are not used to maintain a flat and easily queryable structure.
-- This follows the KISS principle, prioritizing simplicity and performance over full normalization,
-- even if it results in slightly higher data usage or less flexibility.


-- This table is used for faster queries within the LibreQ database;
-- The table is updated by cron.php
-- CREATE TABLE mdl_question (
--   id BIGINT AUTO_INCREMENT PRIMARY KEY,
--   name VARCHAR(255),
--   qtype VARCHAR(20),
--   timecreated BIGINT,
--   timemodified BIGINT
-- );

CREATE TABLE moodle_hierarchy (
  id BIGINT PRIMARY KEY,
  depth INT,                             -- 0=course, 1=bank, 2..=category
  name VARCHAR(256),
  course_id BIGINT
);




CREATE TABLE question (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  moodle_id BIGINT,
  -- mdl_question.id (identifier of the question)
  moodle_name VARCHAR(512),
  -- mdl_question.name (name of the question)
  moodle_type VARCHAR(32),
  -- mdl_question.qtype (question type, e.g. "stack", "multichoice", "stack")
  moodle_created BIGINT,
  -- mdl_question.timecreated (UNIX timestamp)
  moodle_modified BIGINT,
  -- mdl_question.timemodified (UNIX timestamp)
  moodle_xml MEDIUMTEXT,
  -- XML data of the question
  name VARCHAR(512) DEFAULT '',
  -- custom name of the question (optionally overwrites moodle_name)
  topicA BIGINT DEFAULT -1,
  -- reference to topic.id; only leaves of the topic tree are referenced
  topicB BIGINT DEFAULT -1,
  -- If more than one topic is given, then the question belongs to multiple entries in the tree
  topicC BIGINT DEFAULT -1,
  -- topicA, ... is used to generate the help table question_topic_cache
  topicD BIGINT DEFAULT -1,
  filter0 BIGINT DEFAULT -1,
  -- filters: defined in tags.json
  filter1 BIGINT DEFAULT -1,
  filter2 BIGINT DEFAULT -1,
  filter3 BIGINT DEFAULT -1,
  filter4 BIGINT DEFAULT -1,
  filter5 BIGINT DEFAULT -1,
  filter6 BIGINT DEFAULT -1,
  filter7 BIGINT DEFAULT -1,
  filter8 BIGINT DEFAULT -1,
  filter9 BIGINT DEFAULT -1,
  filter10 BIGINT DEFAULT -1,
  filter11 BIGINT DEFAULT -1,
  qa0 BOOLEAN DEFAULT FALSE,
  -- quality assurance flags: defined in tags.json
  qa1 BOOLEAN DEFAULT FALSE,
  qa2 BOOLEAN DEFAULT FALSE,
  qa3 BOOLEAN DEFAULT FALSE,
  qa4 BOOLEAN DEFAULT FALSE,
  qa5 BOOLEAN DEFAULT FALSE,
  qa6 BOOLEAN DEFAULT FALSE,
  qa7 BOOLEAN DEFAULT FALSE,
  image0 BIGINT DEFAULT -1,
  -- reference to image.id
  image1 BIGINT DEFAULT -1,
  image2 BIGINT DEFAULT -1,
  created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  public BOOLEAN DEFAULT FALSE -- whether the question is visible in the public database
);

-- precomputed helper structure
CREATE TABLE question_topic_cache (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  question_id BIGINT,
  topic0 BIGINT DEFAULT -1,
  topic1 BIGINT DEFAULT -1,
  topic2 BIGINT DEFAULT -1,
  topic3 BIGINT DEFAULT -1,
  topic4 BIGINT DEFAULT -1,
  topic5 BIGINT DEFAULT -1,
  topic6 BIGINT DEFAULT -1,
  topic7 BIGINT DEFAULT -1
);

-- TODO: think about queries!;  e.g. "all of depth 0", "all of depth 1 with parents in list"
-- TODO: atomic query-sequence, that UPDATEs parent nodes, but never deletes them, as long as avoidable (reduces total corruption!)
-- CREATE TABLE topic___OLD (
--   id       BIGINT AUTO_INCREMENT PRIMARY KEY,
--   name     VARCHAR(512),
--   depth    INT,                -- 0..7
--   id0      BIGINT DEFAULT -1,  -- topic.id of depth 0, or -1 if not applicable
--   id1      BIGINT DEFAULT -1,  -- topic.id of depth 1, ...
--   id2      BIGINT DEFAULT -1,  -- ...
--   id3      BIGINT DEFAULT -1,
--   id4      BIGINT DEFAULT -1,
--   id5      BIGINT DEFAULT -1,
--   id6      BIGINT DEFAULT -1,
--   id7      BIGINT DEFAULT -1,
--   position BIGINT              -- for sorting purposes
-- );
-- TODO: ===== THIS IS NEW =====
CREATE TABLE domain (
  -- can only be edited by an admin
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  code BIGINT,
  -- must never change; values: 1e6, 2e6, ...
  name VARCHAR(512),
  -- A hashtag at the beginning of the name means "temporarily hidden"
  position BIGINT -- for sorting purposes
);

CREATE TABLE topic (
  -- includes the domain (unaltered from table domain); can be edited with advanced privileges
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  code BIGINT,
  name VARCHAR(512),
  depth INT,
  -- 0..7
  position BIGINT,
  -- for sorting purposes: use e.g. the domain code + the row number
  id0 BIGINT DEFAULT -1,
  -- topic.id of depth 0 (the domain code!), or -1 if not applicable
  id1 BIGINT DEFAULT -1,
  -- topic.id of depth 1, ...
  id2 BIGINT DEFAULT -1,
  -- ...
  id3 BIGINT DEFAULT -1,
  id4 BIGINT DEFAULT -1,
  id5 BIGINT DEFAULT -1,
  id6 BIGINT DEFAULT -1,
  id7 BIGINT DEFAULT -1
);

CREATE TABLE topic_write_access (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  moodle_user_id BIGINT,
  -- mdl_user.id
  domain_code BIGINT
);

-- Example:
--------------------------------------------------------
-- id name               depth, id0, id1, id2, ...   pos
-- -----------------------------------------------------
-- 0  Math                   0,   0,  -1,  -1,         0  -- id*10000
-- 1    Basics               1,   0,   1,  -1,         1
-- 2      Set Theory         2,   0,   1,   2,         2
-- 3    Numbers              1,   0,   3,  -1,         3
-- 4    Elementary Functions 1,   0,   4,  -1,         4
-- 5      Polynomials        2,   0,   4,   5,         5
-- 6  Physics                0,   1,  -1,  -1,     10000  -- id*10000
-- 7    Mechanics            1,   1,   7,  -1,     10001
--------------------------------------------------------
-- Examples of topic queries with filters:
-- (a) Display topics with depth 0:
--       SELECT * FROM topic WHERE depth=0;
-- (b) Display topics at depth 1 where the root parent is 0
--        SELECT * FROM topic WHERE depth=1 AND id0=0;
-- (c) Display topics at depth 2 where the root parent is 0 and the immediate parent is 1
--        SELECT * FROM topic WHERE depth=2 AND id0=0 AND id1=1;
-- (d) Same as (c) but additionally get all with immediate parent is 3
--        SELECT * FROM topic WHERE depth=2 AND id0=0 AND (id1=1 OR id1=3);
-- Examples of question queries with filters:
-- (a) Get all questions TODO
--        SELECT * FROM question WHERE   TODO;
-- Example:  
--   Assume the following questions:
--         id=0, topic0=2 (Math -> Basics -> Set Theory)
--         id=1, topic0=4 (Math -> Elementary Functions)
--   User selected topics Math -> Basics, so all questions mounted to topic
--   Basics(id=1, depth=1, id0=0, id1=1, id2=-1) and its children are shown.
--   New help table  question_topic_cache with columns id, question_id, topic0, topic1, topic2, ...
--   Example:  id=0, question_id=1, topic0=0, topic1=1, topic2=-1
--   SELECT question_id FROM question_topic_cache WHERE topic0=0 and topic1=1 and topic2=topic2;
--   --> topic2=topic2 disables filtering for that column (needed to write generic statements
--       that work for all columns)
CREATE TABLE image (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  data LONGBLOB NOT NULL,
  updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

--- Queries to update table question_topic_cache
-- DELETE FROM question_topic_cache;
-- INSERT INTO question_topic_cache (question_id, topic0, topic1, topic2, topic3, topic4, topic5, topic6, topic7)
-- SELECT q.id, t.id0, t.id1, t.id2, t.id3, t.id4, t.id5, t.id6, t.id7
-- FROM question q
-- JOIN topic t ON q.topicA = t.id
-- WHERE q.topicA != -1
-- UNION ALL
-- SELECT q.id, t.id0, t.id1, t.id2, t.id3, t.id4, t.id5, t.id6, t.id7
-- FROM question q
-- JOIN topic t ON q.topicB = t.id
-- WHERE q.topicB != -1
-- UNION ALL
-- SELECT q.id, t.id0, t.id1, t.id2, t.id3, t.id4, t.id5, t.id6, t.id7
-- FROM question q
-- JOIN topic t ON q.topicC = t.id
-- WHERE q.topicC != -1
-- UNION ALL
-- SELECT q.id, t.id0, t.id1, t.id2, t.id3, t.id4, t.id5, t.id6, t.id7
-- FROM question q
-- JOIN topic t ON q.topicD = t.id
-- WHERE q.topicD != -1;
-- Tables for privileges and access
-- CREATE TABLE user_topic_access___OLD (
--   id              BIGINT AUTO_INCREMENT PRIMARY KEY,
--   moodle_user_id  BIGINT,       -- mdl_user.id
--   topic           BIGINT        -- reference to topic.id
-- );
CREATE TABLE resource_locks (
  resource VARCHAR(255) PRIMARY KEY,
  -- uniquely identifies the locked resource
  user VARCHAR(255),
  -- who locked it
  locked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ***** ACQUIRE THE LOCK *****
-- // TODO: need an unlocking after some time via a cron job
-- $resource = "resource-abc";
-- $user = "user@example.com";
-- $stmt = $conn->prepare("INSERT IGNORE INTO resource_locks (resource, user) VALUES (?, ?)");
-- $stmt->bind_param("ss", $resource, $user);
-- $stmt->execute();
-- if ($stmt->affected_rows === 0) {
--     echo "Resource is already locked.";
-- } else {
--     echo "Lock acquired successfully.";
-- }
-- ***** RELEASE THE LOCK *****
-- $stmt = $conn->prepare("DELETE FROM resource_locks WHERE resource = ? AND user = ?");
-- $stmt->bind_param("ss", $resource, $user);
-- $stmt->execute();
-- ***** CHECK WHO HOLDS THE LOCK *****
-- $stmt = $conn->prepare("SELECT user, locked_at FROM resource_locks WHERE resource = ?");
-- $stmt->bind_param("s", $resource);
-- $stmt->execute();
-- $result = $stmt->get_result();
-- if ($row = $result->fetch_assoc()) {
--     echo "Resource is locked by: " . $row['user'];
-- } else {
--     echo "Resource is free.";
-- }