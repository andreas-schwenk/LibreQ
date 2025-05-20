/**
 * LibreQ (https://github.com/andreas-schwenk/LibreQ)
 * copyright by Andreas Schwenk <contact@arts-and-sciences.com>
 * licensed under GPLv3
 */

import { SCRIPTS_URL } from "../config.js";
import {
  createButton,
  createH2,
  createInfo,
  createP,
  TextAreaInput,
} from "../api/dom.js";
import { IO } from "../api/io.js";

/** @import { Editor } from "./index.js"; */

export class DomainsEditor {
  editor = /** @type {Editor} */ (null);
  div = /** @type {HTMLElement} */ (null);
  info = /** @type {HTMLElement} */ (null);

  textArea = /** @type {TextAreaInput} */ (null);

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
    createH2(this.div, "Root Topic Editor");
    createButton(this.div, "Back to Main Menu", () => {
      // TODO: warn in case of unsaved changes
      this.editor.menu.show();
    });
    createP(this.div, "Edit the root topics (domains) in the text area below.");
    createP(
      this.div,
      'Each line defines one root topic in the format <span style="border-style:solid;border-color:black;border-width:1px; padding:0 4px; font-weight:bold;">Name : Index</span> . The index must be a whole number chosen with enough spacing to accommodate all nested subtopics. This ensures that each topic tree has sufficient number space for its children without overlap, which is important for internal structure and future extensions. For example, use values like 0, 1000, 2000, and so on. Spaces around the colon are optional. Empty lines are not critical.'
    );
    createP(
      this.div,
      "The order of lines determines how topics appear in the question pool, and while you're free to rename or rearrange them at any time, each assigned index must remain fixed permanently."
    );
    createP(
      this.div,
      "Add a hashtag (#) at the beginning of a line to temporarily hide a root topic from the question pool. It remains available for editing, such as tagging questions."
    );
    p = createP(
      this.div,
      "Do this with caution! Changing or removing an index may break links to existing topics."
    );
    p.style.color = "red";
    p.style.fontWeight = "bold";
    this.textArea = new TextAreaInput(this.div, "Root Topics", () => {
      // TODO
    });
    createButton(this.div, "Save Changes", () => {
      this.save();
    });
    this.info = createInfo(this.div, "");
    this.load();
  }

  load() {
    IO.receive(
      SCRIPTS_URL,
      "editor/domains-read.php",
      {},
      this.info,
      (data) => {
        if (data.ok) {
          this.textArea.setValue(data.data);
        }
      }
    );
  }

  save() {
    let src = this.textArea.getValue();
    let body = { data: src };
    IO.send(
      SCRIPTS_URL,
      "editor/domains-write.php",
      {},
      body,
      this.info,
      () => {
        this.textArea.save();
      }
    );
  }
}
