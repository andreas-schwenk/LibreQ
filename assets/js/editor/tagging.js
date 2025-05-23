/**
 * LibreQ (https://github.com/andreas-schwenk/LibreQ)
 * copyright by Andreas Schwenk <contact@arts-and-sciences.com>
 * licensed under GPLv3
 */

import {
  createButton,
  createDiv,
  createH2,
  createInfo,
  createP,
} from "../api/dom.js";
import { IO } from "../api/io.js";
import { SCRIPTS_URL } from "../config.js";

/** @import { Editor } from "./index.js"; */

export class TaggingMoodleCourseSelection {
  editor = /** @type {Editor} */ (null);
  div = /** @type {HTMLElement} */ (null);
  info = /** @type {HTMLElement} */ (null);

  hierarchyDiv = /** @type {HTMLElement} */ (null);
  hierarchyEntries = /** @type {HierarchyEntry[]} */ ([]);

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
    IO.receive(
      SCRIPTS_URL,
      "editor/hierarchy-read.php",
      {},
      this.info,
      (data) => {
        if (data.ok) {
          let rows = JSON.parse(data.data).rows;
          console.log(rows);
          this.hierarchyEntries = [];
          for (let row of rows) {
            this.hierarchyEntries.push(HierarchyEntry.fromJSON(row));
          }
          this.refreshHierarchy();
        }
      }
    );
  }

  refreshHierarchy() {
    this.hierarchyDiv.innerHTML = "";
    for (let he of this.hierarchyEntries) {
      let row = createDiv(this.hierarchyDiv, "topic-row");
      for (let i = 0; i < he.depth; i++) createDiv(row, "topic-spacer");
      let item = createDiv(row, "topic-level");
      item.classList.add("topic-level-" + he.depth);
      let name = he.name === "top" ? "Question Bank" : he.name;
      item.innerHTML = name;
    }
  }
}

class HierarchyEntry {
  id = 0;
  depth = 0;
  name = "";
  courseId = 0;

  /**
   * @param {any} data
   * @returns {HierarchyEntry}
   */
  static fromJSON(data) {
    let he = new HierarchyEntry();
    he.id = parseInt(data["id"]);
    he.depth = parseInt(data["depth"]);
    he.name = data["name"];
    he.courseId = parseInt(data["course_id"]);
    return he;
  }
}
