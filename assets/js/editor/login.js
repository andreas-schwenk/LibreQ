/**
 * LibreQ (https://github.com/andreas-schwenk/LibreQ)
 * copyright by Andreas Schwenk <contact@arts-and-sciences.com>
 * licensed under GPLv3
 */

/** @import { Editor } from "./index.js"; */

import { SCRIPTS_URL } from "../config.js";
import {
  createButton,
  createInfo,
  PasswordInput,
  TextInput,
} from "../api/dom.js";
import { IO } from "../api/io.js";

export class Login {
  editor = /** @type {Editor} */ (null);
  div = /** @type {HTMLElement} */ (null);

  userInput = /** @type {TextInput} */ (null);
  passwordInput = /** @type {PasswordInput} */ (null);
  info = /** @type {HTMLElement} */ (null);

  /**
   * @param {Editor} editor
   */
  constructor(editor) {
    this.div = document.getElementById("editor-core");
    this.editor = editor;
  }

  show() {
    this.div.innerHTML = "";
    this.userInput = new TextInput(this.div, "Moodle Username");
    this.passwordInput = new PasswordInput(this.div, "Moodle Password");
    createButton(this.div, "Login", () => {
      let body = {
        user: this.userInput.getValue(),
        password: this.passwordInput.getValue(),
      };
      IO.send(SCRIPTS_URL, "login.php", {}, body, this.info, (data) => {
        if (data.ok) {
          this.userInput.save();
          this.passwordInput.save();
          this.editor.user = data.user;
          this.editor.menu.show();
        }
      });
    });
    this.info = createInfo(this.div, "");
  }
}
