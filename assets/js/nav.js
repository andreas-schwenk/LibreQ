/**
 * LibreQ (https://github.com/andreas-schwenk/LibreQ)
 * copyright by Andreas Schwenk <contact@arts-and-sciences.com>
 * licensed under GPLv3
 */

import { S } from "./lang.js";

export function createNavItems() {
  let list = ["home", "questions", "editor", "moodle", "help", "legal"];
  let parent = document.getElementById("nav");
  for (let id of list) {
    let item = document.createElement("div");
    item.classList.add("nav-item");
    item.addEventListener("click", () => {
      window.location.href = "index.html?page=" + id;
    });
    item.innerHTML = S("nav." + id);
    parent.appendChild(item);
  }
}

/*

<div
        class="nav-item"
        onclick="window.location.href = 'index.html?page=home'"
      >
        Home
      </div>
      <div
        class="nav-item"
        onclick="window.location.href = 'index.html?page=questions'"
      >
        Questions
      </div>
      <div
        class="nav-item"
        onclick="window.location.href = 'index.html?page=editor'"
      >
        Editor
      </div>
      <div class="nav-item" onclick="window.location.href = 'moodle/'">
        Moodle
      </div>
      <div
        class="nav-item"
        onclick="window.location.href = 'index.html?page=help'"
      >
        Help
      </div>
      <div
        class="nav-item"
        onclick="window.location.href = 'index.html?page=legal'"
      >
        Legal
      </div>

*/
