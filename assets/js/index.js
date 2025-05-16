/**
 * LibreQ (https://github.com/andreas-schwenk/LibreQ)
 * copyright by Andreas Schwenk <contact@arts-and-sciences.com>
 * licensed under GPLv3
 */

import { createNavItems } from "./nav.js";
import { QuestionPool } from "./questions.js";

let config = {};

document.addEventListener("DOMContentLoaded", function () {
  fetch("user/config.json?v=" + Date.now())
    .then((x) => x.json())
    .then((data) => {
      config = data;
      init();
    });
});

/**
 * Initializes website.
 */
export function init() {
  // update year
  let year = document.getElementById("year");
  if (year) year.innerHTML = "" + new Date().getFullYear();

  // show requested page
  const list = ["home", "questions", "editor", "help", "legal"];
  let params = new URLSearchParams(window.location.search);
  let pageParam = params.has("page") ? params.get("page") : "home";
  if (!list.includes(pageParam)) pageParam = "home";
  let page = document.getElementById(pageParam);

  // nav
  createNavItems(config.nav);

  // home
  switch (pageParam) {
    case "home": {
      loadHTMLContent("user/home.html", "home-contents");
      break;
    }
    case "questions": {
      loadHTMLContent("user/questions.html", "questions-contents");
      new QuestionPool();
      break;
    }
    case "editor": {
      loadHTMLContent("user/editor.html", "editor-contents");
      break;
    }
    case "help": {
      loadHTMLContent("user/help.html", "help-contents");
      break;
    }
    case "legal": {
      loadHTMLContent("user/legal.html", "legal-contents");
      break;
    }
  }

  // footer
  loadHTMLContent("user/footer.html", "footer-contents");

  // show page
  page.style.display = "block";

  // show footer (enabling here avoids flickering)
  setTimeout(() => {
    document.getElementById("footer").classList.add("fade-in");
    document.getElementById("footer").style.display = "block";
  }, 500);
}

/**
 * @param {string} path
 * @param {string} target
 */
export function loadHTMLContent(path, target) {
  fetch(path + "?v=" + Date.now())
    .then((x) => x.text())
    .then((html) => {
      document.getElementById(target).innerHTML = html;
    });
}
