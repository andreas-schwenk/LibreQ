/**
 * LibreQ (https://github.com/andreas-schwenk/LibreQ)
 * copyright by Andreas Schwenk <contact@arts-and-sciences.com>
 * licensed under GPLv3
 */

import { SCRIPTS_URL } from "./config.js";
import { Login as EditorLogin } from "./editorLogin.js";
import { EditorMenu } from "./editorMenu.js";
import { IO } from "./io.js";

export class Editor {
  div = /** @type {HTMLElement} */ (null);

  user = "";

  login = new EditorLogin(this);
  menu = new EditorMenu(this);

  constructor() {
    IO.receive(SCRIPTS_URL, "session.php", {}, null, (data) => {
      if (data.ok) {
        this.user = data.user;
        // TODO!!! this.userMenu.show();
        this.menu.topicsEditor.show();
      } else {
        this.login.show();
      }
    });
  }
}
