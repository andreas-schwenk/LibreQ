/**
 * LibreQ (https://github.com/andreas-schwenk/LibreQ)
 * copyright by Andreas Schwenk <contact@arts-and-sciences.com>
 * licensed under GPLv3
 */

import { SCRIPTS_URL } from "../config.js";
import {
  createDiv,
  createHorizontalSpacer,
  createQuestionButton,
} from "../api/dom.js";
import { IO } from "../api/io.js";

export class QuestionPool {
  questionsDiv = /** @type {HTMLElement} */ (null);

  questions = /** @type {Question[]} */ ([]);

  constructor() {
    this.questionsDiv = document.getElementById("questions-list");
    let errorDiv = document.createElement("div"); // TODO: CSS

    let params = {};
    IO.receive(
      SCRIPTS_URL,
      "public/questions.php",
      params,
      errorDiv,
      (data) => {
        if (data.ok) {
          let rows = JSON.parse(data.data).rows;
          this.fromJSON(rows);
          this.createDOM();
        }
      }
    );
  }

  /**
   * @param {any} data
   */
  fromJSON(data) {
    this.questions = [];
    for (let d of data) {
      let q = Question.fromJSON(d);
      this.questions.push(q);
    }
  }

  createDOM() {
    this.questionsDiv.innerHTML = "";
    for (let question of this.questions) {
      question.createDOM(this.questionsDiv);
    }
  }
}

export class Question {
  div = /** @type {HTMLElement} */ (null);

  id = 0;
  moodle_id = 0;
  moodle_name = "";
  moodle_type = "";
  moodle_created = 0;
  moodle_modified = 0;
  name = "";

  /**
   * @param {HTMLElement} parent
   */
  createDOM(parent) {
    this.div = createDiv(parent, "question");
    // title
    let title = createDiv(this.div, "question-title");
    title.innerHTML = this.name.length > 0 ? this.name : this.moodle_name;
    // date
    let date = createDiv(this.div, "question-date");
    date.innerHTML = new Date(this.moodle_modified * 1000).toLocaleString();
    // footer
    let footer = createDiv(this.div, "question-footer");
    // preview buttons
    let c = createDiv(footer, "question-button-container");
    let preview1 = createQuestionButton(c, "l", "1", () => {
      // TODO
    });
    let preview2 = createQuestionButton(c, "c", "2", () => {
      // TODO
    });
    let preview3 = createQuestionButton(c, "r", "3", () => {
      // TODO
    });
    createHorizontalSpacer(footer, 10);
    // get buttons
    c = createDiv(footer, "question-button-container");
    createQuestionButton(
      c,
      "l",
      "img:assets/images/icons/paperclip-solid.svg",
      () => {
        // TODO
      }
    );
    createQuestionButton(
      c,
      "r",
      "img:assets/images/icons/download-solid.svg",
      () => {
        // TODO
      }
    );
    createHorizontalSpacer(footer, 10);
    // comment button
    c = createDiv(footer, "question-button-container");
    createQuestionButton(
      c,
      "lr",
      "img:assets/images/icons/comments-solid.svg",
      () => {
        // TODO
      }
    );
    createHorizontalSpacer(footer, 10);
    // edit buttons
    c = createDiv(footer, "question-button-container");
    createQuestionButton(
      c,
      "l",
      "img:assets/images/icons/pencil-solid.svg",
      () => {
        // TODO
      }
    );
    createQuestionButton(
      c,
      "r",
      "img:assets/images/icons/tags-solid.svg",
      () => {
        // TODO
      }
    );
  }

  /**
   * @param {Object.<string,any>} data
   * @returns {Question}
   */
  static fromJSON(data) {
    let q = new Question();
    q.id = data.id;
    q.moodle_id = data.moodle_id;
    q.moodle_name = data.moodle_name;
    q.moodle_type = data.moodle_type;
    q.moodle_created = data.moodle_created;
    q.moodle_modified = data.moodle_modified;
    q.name = data.name;
    return q;
  }
}
