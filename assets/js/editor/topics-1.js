/**
 * LibreQ (https://github.com/andreas-schwenk/LibreQ)
 * copyright by Andreas Schwenk <contact@arts-and-sciences.com>
 * licensed under GPLv3
 */

import { createButton, createH2, createInfo, createP } from "../api/dom.js";
import { IO } from "../api/io.js";
import { SCRIPTS_URL } from "../config.js";
import { TopicsEditor } from "./topics-2.js";

/** @import { Editor } from "./index.js"; */

export class TopicsDomainSelection {
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
    createH2(this.div, "Topic Tree Editor");
    createButton(this.div, "Back to Main Menu", () => {
      this.editor.menu.show();
    });
    this.info = createInfo(this.div, "");
    createP(this.div, "Select a domain:");
    IO.receive(
      SCRIPTS_URL,
      "editor/domains-read.php",
      {},
      this.info,
      (data) => {
        if (data.ok) {
          let domainSrc = data.data;
          let lines = domainSrc.trim().split("\n");
          for (let line of lines) {
            let tokens = line.split(":");
            let name = tokens[0];
            let code = parseInt(tokens[1]);
            createButton(this.div, name, () => {
              this.topicsEditor.show(code, name);
            });
          }
        }
      }
    );
  }
}
