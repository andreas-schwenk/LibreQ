/**
 * LibreQ (https://github.com/andreas-schwenk/LibreQ)
 * copyright by Andreas Schwenk <contact@arts-and-sciences.com>
 * licensed under GPLv3
 */

// TODO: translate everything of LibreQ

let language = "en";

const langDB = {
  "nav.home.en": "Home",
  "nav.home.de": "Home",
  "nav.questions.en": "Questions",
  "nav.questions.de": "Fragen",
  "nav.editor.en": "Editor",
  "nav.editor.de": "Editor",
  "nav.moodle.en": "Moodle",
  "nav.moodle.de": "Moodle",
  "nav.help.en": "Help",
  "nav.help.de": "Hilfe",
  "nav.legal.en": "Legal",
  "nav.legal.de": "Rechtliches",
  "save.en": "Save",
  "save.de": "Speichern",
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
