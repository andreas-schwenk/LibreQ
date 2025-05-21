/**
 * LibreQ (https://github.com/andreas-schwenk/LibreQ)
 * copyright by Andreas Schwenk <contact@arts-and-sciences.com>
 * licensed under GPLv3
 */

import { SCRIPTS_URL } from "../config.js";
import { Login as EditorLogin } from "./login.js";
import { EditorMenu } from "./menu.js";
import { IO } from "../api/io.js";

export class Editor {
  div = /** @type {HTMLElement} */ (null);

  user = "";

  login = new EditorLogin(this);
  menu = new EditorMenu(this);

  constructor() {
    IO.receive(SCRIPTS_URL, "editor/session.php", {}, null, (data) => {
      if (data.ok) {
        this.user = data.data;
        this.menu.show();
        //this.menu.topicsEditor.show(); // TODO: this is a test
      } else {
        this.login.show();
      }
    });
  }
}
