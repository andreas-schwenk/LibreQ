-- Foreign keys are intentionally not used to keep the schema compatible with a wide range of tools,
-- simplify backups, restores, and migrations, and avoid potential issues during bulk imports or deletes.
-- Referential integrity is handled at the application level where needed.

-- Junction tables (e.g., for tags or topics) are not used to maintain a flat and easily queryable structure.
-- This follows the KISS principle, prioritizing simplicity and performance over full normalization,
-- even if it results in slightly higher data usage or less flexibility.

CREATE TABLE question (
  id              BIGINT AUTO_INCREMENT PRIMARY KEY,
  moodle_id       BIGINT,           -- mdl_question.id (identifier of the question)
  moodle_name     VARCHAR(512),     -- mdl_question.name (name of the question)
  moodle_type     VARCHAR(32),      -- mdl_question.qtype (question type, e.g. "stack", "multichoice", "stack")
  moodle_created  BIGINT,           -- mdl_question.timecreated (UNIX timestamp)
  moodle_modified BIGINT,           -- mdl_question.timemodified (UNIX timestamp)
  moodle_xml      MEDIUMTEXT,       -- XML data of the question
  name            VARCHAR(512) DEFAULT '',  -- custom name of the question (optionally overwrites moodle_name)
  topic0          BIGINT DEFAULT -1,        -- reference to topic.id; only leaves of the topic tree are referenced
  topic1          BIGINT DEFAULT -1,        -- If more than one topic is given, then the question belongs to multiple entries in the tree
  topic2          BIGINT DEFAULT -1,
  topic3          BIGINT DEFAULT -1,
  filter0         BIGINT DEFAULT -1,        -- filters: defined in tags.json
  filter1         BIGINT DEFAULT -1,
  filter2         BIGINT DEFAULT -1,
  filter3         BIGINT DEFAULT -1,
  filter4         BIGINT DEFAULT -1,
  filter5         BIGINT DEFAULT -1,
  filter6         BIGINT DEFAULT -1,
  filter7         BIGINT DEFAULT -1,
  filter8         BIGINT DEFAULT -1,
  filter9         BIGINT DEFAULT -1,
  filter10        BIGINT DEFAULT -1,
  filter11        BIGINT DEFAULT -1,
  qa0             BOOLEAN DEFAULT FALSE,  -- quality assurance flags: defined in tags.json
  qa1             BOOLEAN DEFAULT FALSE,
  qa2             BOOLEAN DEFAULT FALSE,
  qa3             BOOLEAN DEFAULT FALSE,
  qa4             BOOLEAN DEFAULT FALSE,
  qa5             BOOLEAN DEFAULT FALSE,
  qa6             BOOLEAN DEFAULT FALSE,
  qa7             BOOLEAN DEFAULT FALSE,
  image0          BIGINT DEFAULT -1,  -- reference to image.id
  image1          BIGINT DEFAULT -1,
  image2          BIGINT DEFAULT -1,
  created         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated         TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  public          BOOLEAN DEFAULT FALSE   -- whether the question is visible in the public database
);

CREATE TABLE user_topic_access (
  id              BIGINT AUTO_INCREMENT PRIMARY KEY,
  moodle_user_id  BIGINT,       -- mdl_user.id
  topic           BIGINT        -- reference to topic.id
);

-- TODO: think about queries!;  e.g. "all of depth 0", "all of depth 1 with parents in list"
-- TODO: atomic query-sequence, that UPDATEs parent nodes, but never deletes them, as long as avoidable (reduces total corruption!)

CREATE TABLE topic (
  id       BIGINT AUTO_INCREMENT PRIMARY KEY,
  name     VARCHAR(512),
  depth    INT,                -- 0..7
  id0      BIGINT DEFAULT -1,  -- topic.id of depth 0, or -1 if not applicable
  id1      BIGINT DEFAULT -1,  -- topic.id of depth 1, ...
  id2      BIGINT DEFAULT -1,  -- ...
  id3      BIGINT DEFAULT -1,
  id4      BIGINT DEFAULT -1,
  id5      BIGINT DEFAULT -1,
  id6      BIGINT DEFAULT -1,
  id7      BIGINT DEFAULT -1,
  position BIGINT              -- for sorting purposes
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


CREATE TABLE image (
  id       BIGINT AUTO_INCREMENT PRIMARY KEY,
  data     LONGBLOB NOT NULL,
  updated  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
