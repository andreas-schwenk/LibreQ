/**
 * LibreQ (https://github.com/andreas-schwenk/LibreQ)
 * copyright by Andreas Schwenk <contact@arts-and-sciences.com>
 * licensed under GPLv3
 */

// TODO: translate everything of LibreQ

let language = "EN";

const langDB = {
  "nav.home.EN": "Home",
  "nav.home.DE": "Home",
  "nav.questions.EN": "Questions",
  "nav.questions.DE": "Fragen",
  "nav.editor.EN": "Editor",
  "nav.editor.DE": "Editor",
  "nav.moodle.EN": "Moodle",
  "nav.moodle.DE": "Moodle",
  "nav.help.EN": "Help",
  "nav.help.DE": "Hilfe",
  "nav.legal.EN": "Legal",
  "nav.legal.DE": "Rechtliches",
  "save.EN": "Save",
  "save.DE": "Speichern",
};

/**
 * @param {string} lang
 */
export function setLanguage(lang) {
  language = lang;
}

/**
 * @param {string} id
 * @returns
 */
export function S(id) {
  const key = id + "." + language;
  if (key in langDB) return langDB[key];
  return `<span style="red">${id} IS NOT TRANSLATED</span>`;
}
