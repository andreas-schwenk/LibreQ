/**
 * LibreQ (https://github.com/andreas-schwenk/LibreQ)
 * copyright by Andreas Schwenk <contact@arts-and-sciences.com>
 * licensed under GPLv3
 */

import { SCRIPTS_URL } from "../config.js";
import {
  createBr,
  createButton,
  createH2,
  createInfo,
  createP,
} from "../api/dom.js";
import { DomainsEditor } from "./domains.js";
import { IO } from "../api/io.js";
import { TopicsDomainSelection } from "./topics-1.js";
import { TaggingMoodleCourseSelection as TaggingCourseSelection } from "./tagging.js";

/** @import { Editor } from "./index.js"; */

export class EditorMenu {
  editor = /** @type {Editor} */ (null);
  div = /** @type {HTMLElement} */ (null);
  info = /** @type {HTMLElement} */ (null);

  taggingCourseSelection = /** @type {TaggingCourseSelection} */ (null);
  topicsDomainSelection = /** @type {TopicsDomainSelection} */ (null);
  domainsEditor = /** @type {DomainsEditor} */ (null);

  /**
   * @param {Editor} editor
   */
  constructor(editor) {
    this.div = document.getElementById("editor-core");
    this.editor = editor;
    this.taggingCourseSelection = new TaggingCourseSelection(editor);
    this.topicsDomainSelection = new TopicsDomainSelection(editor);
    this.domainsEditor = new DomainsEditor(editor);
  }

  show() {
    this.div.innerHTML = "";
    let p = createP(this.div, `Logged in as '${this.editor.user}'.`);
    p.style.fontStyle = "italic";
    createH2(this.div, "Main Menu");
    createButton(this.div, "Log Out", () => {
      IO.receive(SCRIPTS_URL, "editor/logout.php", {}, this.info, (data) => {
        if (data.ok) {
          this.editor.login.show();
        }
      });
    });
    createP(this.div, "Options for question editors:");
    createButton(this.div, "Question Tagging", () => {
      this.taggingCourseSelection.show();
    });
    createP(this.div, "Options for authorized users:");
    createButton(this.div, "Manage Topic Trees", () => {
      this.topicsDomainSelection.show();
    });

    createP(this.div, "Options for admins:");
    createButton(this.div, "Manage Root Topics", () => {
      this.domainsEditor.show();
    });
    createButton(this.div, "Manage Root Topic Access", () => {
      // TODO
    });
    this.info = createInfo(this.div, "");
  }
}
