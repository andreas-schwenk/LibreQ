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
  name            VARCHAR(512) DEFAULT '',     -- custom name of the question (optionally overwrites moodle_name)
  topic0          VARCHAR(64) DEFAULT '',      -- reference to topic.code; only leaves of the topic tree are referenced
  topic1          VARCHAR(64) DEFAULT '',      -- If more than one topic is given, then the question belongs to multiple entries in the tree
  topic2          VARCHAR(64) DEFAULT '',
  topic3          VARCHAR(64) DEFAULT '',
  topic4          VARCHAR(64) DEFAULT '',
  topic5          VARCHAR(64) DEFAULT '',
  topic6          VARCHAR(64) DEFAULT '',
  topic7          VARCHAR(64) DEFAULT '',
  filter0         BIGINT DEFAULT -1,          -- filters: defined in tags.json
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
  filter12        BIGINT DEFAULT -1,
  filter13        BIGINT DEFAULT -1,
  filter14        BIGINT DEFAULT -1,
  filter15        BIGINT DEFAULT -1,
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
  code            VARCHAR(64)   -- reference to topic.code
);

CREATE TABLE topic (
  id       BIGINT AUTO_INCREMENT PRIMARY KEY,
  name     VARCHAR(512),
  code     VARCHAR(64),
  level    INT,
  parent0  BIGINT,  -- topic.id, or -1 if not applicable
  parent1  BIGINT,
  parent2  BIGINT,
  parent3  BIGINT,
  parent4  BIGINT,
  parent5  BIGINT,
  parent6  BIGINT,
  parent7  BIGINT,
  position BIGINT   -- for sorting purposes
);

CREATE TABLE image (
  id       BIGINT AUTO_INCREMENT PRIMARY KEY,
  data     LONGBLOB NOT NULL,
  updated  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
