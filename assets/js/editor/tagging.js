/**
 * LibreQ (https://github.com/andreas-schwenk/LibreQ)
 * copyright by Andreas Schwenk <contact@arts-and-sciences.com>
 * licensed under GPLv3
 */

import {
  createBr,
  createButton,
  createDiv,
  createH2,
  createHorizontalSpacer,
  createHr,
  createInfo,
  createP,
  createQuestionButton,
} from "../api/dom.js";
import { IO } from "../api/io.js";
import { SCRIPTS_URL } from "../config.js";
import { config } from "../index.js";

/** @import { Editor } from "./index.js"; */

export class TaggingEditor {
  editor = /** @type {Editor} */ (null);
  div = /** @type {HTMLElement} */ (null);
  info = /** @type {HTMLElement} */ (null);

  hierarchyDiv = /** @type {HTMLElement} */ (null);
  hierarchyEntries = /** @type {HierarchyEntry[]} */ ([]);

  questions = /** @type {Question[]} */ ([]); // currently visible questions
  questionsDiv = /** @type {HTMLElement} */ (null);

  rootTopic = /** @type {Topic} */ (null);

  /**
   * @param {Editor} editor
   */
  constructor(editor) {
    this.div = document.getElementById("editor-core");
    this.editor = editor;
  }

  show() {
    this.div.innerHTML = "";
    let p = createP(this.div, `Logged in as '${this.editor.user}'.`);
    p.style.fontStyle = "italic";
    createH2(this.div, "Question Tagging Editor");
    createButton(this.div, "Back to Main Menu", () => {
      this.editor.menu.show();
    });
    this.info = createInfo(this.div, "");
    createP(this.div, "Hierarchy:");
    this.hierarchyDiv = createDiv(this.div);
    createP(this.div, "Questions:");
    this.questionsDiv = createDiv(this.div);

    this.loadMoodleHierarchy();
    this.loadTopicHierarchy();
  }

  loadMoodleHierarchy() {
    IO.receive(
      SCRIPTS_URL,
      "editor/hierarchy-read.php",
      {},
      this.info,
      (data) => {
        if (data.ok) {
          let rows = JSON.parse(data.data).rows;
          this.hierarchyEntries = [];
          for (let row of rows)
            this.hierarchyEntries.push(HierarchyEntry.fromJSON(row));
          this.refreshHierarchy();
        }
      }
    );
  }

  loadTopicHierarchy() {
    IO.receive(
      SCRIPTS_URL,
      "editor/topics-read-all.php",
      {},
      this.info,
      (data) => {
        if (data.ok) {
          let rows = JSON.parse(data.data).rows;
          this.rootTopic = new Topic();
          for (let row of rows) {
            let topic = new Topic();
            topic.code = row.code;
            topic.depth = row.depth;
            topic.name = row.name;
            let path = [
              row.id0,
              row.id1,
              row.id2,
              row.id3,
              row.id4,
              row.id5,
              row.id6,
              row.id7,
            ].filter((value) => value >= 0);
            let t = this.rootTopic;
            for (let i = 0; i < path.length; i++) {
              let code = path[i];
              if (!(code in t.map)) {
                t.map[code] = topic;
                t.children.push(topic);
                topic.parent = t;
              } else t = t.map[code];
            }
          }
        }
      }
    );
  }

  refreshHierarchy() {
    this.hierarchyDiv.innerHTML = "";
    for (let entry of this.hierarchyEntries) {
      let row = createDiv(this.hierarchyDiv, "topic-row");
      for (let i = 0; i < entry.depth; i++) createDiv(row, "topic-spacer");
      let item = createDiv(row, "topic-level");
      item.classList.add("topic-level-" + entry.depth);
      let name = entry.name === "top" ? "Question Bank" : entry.name;
      if (entry.questionCnt > 0) name += ` (${entry.questionCnt})`;
      item.innerHTML = name;
      item.addEventListener("click", () => {
        this.loadQuestions(entry.id, entry.depth);
      });
    }
  }

  /**
   *
   * @param {number} hierarchyId
   * @param {number} hierarchyDepth
   */
  loadQuestions(hierarchyId, hierarchyDepth) {
    const params = {
      id: hierarchyId,
      depth: hierarchyDepth,
    };
    IO.receive(
      SCRIPTS_URL,
      "editor/questions-read.php",
      params,
      this.info,
      (data) => {
        if (data.ok) {
          let rows = JSON.parse(data.data).rows;
          // read
          this.questions = [];
          for (let row of rows)
            this.questions.push(Question.fromJSON(this, row));
          // render
          // TODO: show untagged ones first
          this.questionsDiv.innerHTML = "";
          for (let question of this.questions) {
            question.render(this.questionsDiv);
            createBr(this.questionsDiv);
          }
        }
      }
    );
  }
}

class Topic {
  code = -1;
  name = "";
  depth = -1;
  parent = /** @type {Topic} */ (null);
  children = /** @type {Topic[]} */ ([]);
  // for fast access of children:
  map = /** @type {Object.<number,Topic>} */ ({});
}

class Question {
  taggingEditor = /** @type {TaggingEditor} */ (null);

  id = 0; // mdl_bankentries.id
  version = 0;
  questionId = 0; // mdl_question.id
  name = "";
  qtype = "";
  timecreated = 0;
  timemodified = 0;

  /**
   * @param {TaggingEditor} taggingEditor
   */
  constructor(taggingEditor) {
    this.taggingEditor = taggingEditor;
  }

  /**
   * @param {HTMLElement} parent
   */
  render(parent) {
    let div = createDiv(parent, "question");
    // buttons
    let c = createDiv(div, "question-button-container");
    createQuestionButton(
      c,
      "l",
      "img:assets/images/icons/eye-solid.svg",
      () => {
        // TODO: preview in Moodle
      }
    );
    createQuestionButton(
      c,
      "r",
      "img:assets/images/icons/pencil-solid.svg",
      () => {
        // TODO: edit in Moodle
      }
    );
    // title
    let title = createDiv(div, "question-title");
    title.innerHTML = this.name;
    // version
    let version = createDiv(div, "question-version");
    version.innerHTML = "Question version: " + this.version;
    // topic selection
    if (this.taggingEditor.rootTopic != null) {
      let topicSelectionDiv = createDiv(div);
      let ts = new TopicSelector(
        topicSelectionDiv,
        this.taggingEditor.rootTopic
      );
    }
    // separator
    createBr(div);
    // filters
    for (let filter of config.filters) {
      let filterDiv = createDiv(div);
      let name = filter.name;
      let code = filter.code; // TODO
      let values = filter.values;
      new FilterSelector(filterDiv, name, values);
    }
    // separator
    createBr(div);
    // quality assurance
    let qaDiv = createDiv(div);
    let qaValues = config.qa.map((x) => x.name);
    let qaCodes = config.qa.map((x) => x.code);
    new QualityAssuranceSelector(qaDiv, "QA", qaValues);
  }

  /**
   * @param {TaggingEditor} taggingEditor
   * @param {Object.<string,any>} data
   * @returns {Question}
   */
  static fromJSON(taggingEditor, data) {
    let q = new Question(taggingEditor);
    q.id = data.id;
    q.version = data.version;
    q.questionId = data.questionId;
    q.name = data.name;
    q.qtype = data.qtype;
    q.timecreated = data.timecreated;
    q.timemodified = data.timemodified;
    return q;
  }
}

class HierarchyEntry {
  id = 0;
  depth = 0;
  name = "";
  questionCnt = 0;
  courseId = 0;

  /**
   * @param {any} data
   * @returns {HierarchyEntry}
   */
  static fromJSON(data) {
    let entry = new HierarchyEntry();
    entry.id = parseInt(data["id"]);
    entry.depth = parseInt(data["depth"]);
    entry.name = data["name"];
    entry.questionCnt = parseInt(data["question_cnt"]);
    entry.courseId = parseInt(data["course_id"]);
    return entry;
  }
}

class FilterSelector {
  div = /** @type {HTMLElement} */ (null);

  selectedIdx = -1;

  /**
   * @param {HTMLElement} div
   * @param {string} name
   * @param {string[]} optionNames
   */
  constructor(div, name, optionNames) {
    this.div = div;
    let container = createDiv(this.div, "question-filter-tag-container");
    let head = createDiv(container, "question-filter-tag-head");
    head.innerHTML = name;
    let optionDivs = [];
    for (let i = 0; i < optionNames.length; i++) {
      let optionName = optionNames[i];
      let optionDiv = createDiv(container, "question-filter-tag");
      optionDiv.innerHTML = optionName;
      optionDivs.push(optionDiv);
      optionDiv.addEventListener("click", () => {
        this.selectedIdx = i;
        for (let o of optionDivs)
          o.classList.remove("question-filter-tag-selected");
        optionDiv.classList.add("question-filter-tag-selected");
      });
    }
  }
}

class QualityAssuranceSelector {
  div = /** @type {HTMLElement} */ (null);
  selectedIdx = /** @type {Set<number>} */ (new Set());

  /**
   * @param {HTMLElement} div
   * @param {string} name
   * @param {string[]} optionNames
   */
  constructor(div, name, optionNames) {
    this.div = div;
    let container = createDiv(this.div, "question-filter-tag-container");
    let head = createDiv(container, "question-filter-tag-head");
    head.innerHTML = name;
    let optionDivs = [];
    for (let i = 0; i < optionNames.length; i++) {
      let optionName = optionNames[i];
      let optionDiv = createDiv(container, "question-filter-tag");
      optionDiv.innerHTML = optionName;
      optionDivs.push(optionDiv);
      optionDiv.addEventListener("click", () => {
        if (this.selectedIdx.has(i)) {
          this.selectedIdx.delete(i);
          optionDiv.classList.remove("question-filter-tag-selected");
        } else {
          this.selectedIdx.add(i);
          optionDiv.classList.add("question-filter-tag-selected");
        }
      });
    }
  }
}

class TopicSelector {
  div = /** @type {HTMLElement} */ (null);
  rootTopic = /** @type {Topic} */ (null);

  selectedTopicCode = -1;
  rows = /** @type {HTMLElement[]} */ ([]);

  /**
   * @param {HTMLElement} div
   * @param {Topic} rootTopic
   */
  constructor(div, rootTopic) {
    this.div = div;
    this.rootTopic = rootTopic;
    this.click(this.rootTopic);
  }

  /**
   * @param {Topic} topic
   */
  click(topic) {
    for (let i = topic.depth + 1; i < this.rows.length; i++)
      this.div.removeChild(this.rows[i]);
    this.rows = this.rows.slice(0, topic.depth + 1);

    let row = createDiv(this.div, "question-filter-tag-container");
    this.rows.push(row);

    let head = createDiv(row, "question-filter-tag-head");
    head.innerHTML = "Level " + (topic.depth + 1);
    let childDivs = [];
    for (let child of topic.children) {
      let childDiv = createDiv(row, "question-filter-tag");
      childDivs.push(childDiv);
      childDiv.innerHTML = child.name;
      childDiv.addEventListener("click", () => {
        this.selectedTopicCode = child.code;
        for (let c of childDivs)
          c.classList.remove("question-filter-tag-selected");
        childDiv.classList.add("question-filter-tag-selected");
        if (child.children.length > 0) this.click(child);
      });
    }
  }
}
