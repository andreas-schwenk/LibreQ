/**
 * LibreQ (https://github.com/andreas-schwenk/LibreQ)
 * copyright by Andreas Schwenk <contact@arts-and-sciences.com>
 * licensed under GPLv3
 */

import { SCRIPTS_URL } from "./config.js";
import { createButton, createH2, createInfo, createP } from "./dom.js";
import { TopicsEditor } from "./editorTopics.js";
import { IO } from "./io.js";

/** @import { Editor } from "./editor.js"; */

export class EditorMenu {
  editor = /** @type {Editor} */ (null);
  div = /** @type {HTMLElement} */ (null);
  info = /** @type {HTMLElement} */ (null);

  topicsEditor = /** @type {TopicsEditor} */ (null);

  /**
   * @param {Editor} editor
   */
  constructor(editor) {
    this.div = document.getElementById("editor-core");
    this.editor = editor;
    this.topicsEditor = new TopicsEditor(editor);
  }

  show() {
    this.div.innerHTML = "";
    let p = createP(this.div, `Logged in as '${this.editor.user}'.`);
    p.style.fontStyle = "italic";
    createH2(this.div, "Main Menu");
    createButton(this.div, "Question Tagging", () => {
      // TODO
    });
    createButton(this.div, "Manage Topic Tree", () => {
      this.topicsEditor.show();
    });
    createButton(this.div, "Log Out", () => {
      IO.receive(SCRIPTS_URL, "logout.php", {}, this.info, (data) => {
        if (data.ok) {
          this.editor.login.show();
        }
      });
    });
    this.info = createInfo(this.div, "");
  }
}
