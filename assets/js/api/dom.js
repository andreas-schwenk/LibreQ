/**
 * LibreQ (https://github.com/andreas-schwenk/LibreQ)
 * copyright by Andreas Schwenk <contact@arts-and-sciences.com>
 * licensed under GPLv3
 */

/**
 * @param {HTMLElement} parent
 * @param {string} text
 * @returns {HTMLElement}
 */
export function createH1(parent, text) {
  let h1 = document.createElement("h1");
  h1.innerHTML = text;
  parent.appendChild(h1);
  return h1;
}

/**
 * @param {HTMLElement} parent
 * @param {string} text
 * @returns {HTMLElement}
 */
export function createH2(parent, text) {
  let h2 = document.createElement("h2");
  h2.innerHTML = text;
  parent.appendChild(h2);
  return h2;
}

/**
 * @param {HTMLElement} parent
 * @param {string[]} classes
 * @returns {HTMLElement}
 */
export function createDiv(parent, ...classes) {
  let div = document.createElement("div");
  div.classList.add(...classes);
  parent.appendChild(div);
  return div;
}

/**
 * @param {HTMLElement} parent
 * @param {string} text
 * @returns {HTMLElement}
 */
export function createInfo(parent, text) {
  let info = document.createElement("div");
  info.classList.add("info");
  info.innerHTML = text;
  parent.appendChild(info);
  return info;
}

/**
 * @param {HTMLElement} parent
 * @param {string} text
 * @returns {HTMLElement}
 */
export function createP(parent, text) {
  let p = document.createElement("p");
  p.innerHTML = text;
  parent.appendChild(p);
  return p;
}

/**
 * @param {HTMLElement} parent
 */
export function createBr(parent) {
  let br = document.createElement("br");
  parent.appendChild(br);
}

/**
 * @param {HTMLElement} parent
 * @param {number} pixels
 * @returns {HTMLElement}
 */
export function createHorizontalSpacer(parent, pixels) {
  let div = document.createElement("div");
  parent.appendChild(div);
  div.style.width = `${pixels}px`;
  return div;
}

/**
 * @param {HTMLElement} parent
 * @param {string} text
 * @param {function} action
 * @returns {HTMLElement}
 */
export function createButton(parent, text, action) {
  let button = document.createElement("div");
  button.classList.add("button");
  button.tabIndex = 0;
  if (text.startsWith("img:")) {
    let img = document.createElement("img");
    img.classList.add("question-button-img");
    img.src = text.split(":")[1];
    button.appendChild(img);
  } else {
    button.innerHTML = text;
  }
  button.addEventListener("click", () => {
    action();
  });
  button.addEventListener("keydown", function (e) {
    if (e.key === "Enter") button.click();
  });
  parent.appendChild(button);
  return button;
}

/**
 * @param {HTMLElement} parent
 * @param {string} position -- l,c,r,lr
 * @param {string} text
 * @param {function} action
 * @returns {HTMLElement}
 */
export function createQuestionButton(parent, position, text, action) {
  let button = createButton(parent, text, action);
  button.classList.remove("button");
  button.classList.add("question-button");
  if (position.includes("l")) button.classList.add("question-button-left");
  if (position.includes("r")) button.classList.add("question-button-right");
  return button;
}

export class TextAreaInput {
  input = /** @type {HTMLTextAreaElement} */ (null);
  savedValue = "";

  /**
   *
   * @param {HTMLElement} parent
   * @param {string} text
   * @param {function} inputEvent
   */
  constructor(parent, text, inputEvent = null) {
    // label
    let label = document.createElement("div");
    label.classList.add("input-label");
    let labelText = document.createElement("span");
    labelText.innerHTML = text + "&nbsp;";
    label.appendChild(labelText);
    this.labelInfo = document.createElement("span");
    this.labelInfo.classList.add("input-info");
    label.appendChild(this.labelInfo);
    parent.appendChild(label);
    // input
    this.input = document.createElement("textarea");
    this.input.setAttribute("autocorrect", "off");
    this.input.setAttribute("autocomplete", "off");
    this.input.setAttribute("autocapitalize", "off");
    this.input.spellcheck = false;
    parent.appendChild(this.input);
    // action
    this.input.addEventListener("input", (event) => {
      this.#updateFont();
      if (inputEvent != null) {
        inputEvent(this.input.value);
      }
    });
  }

  #updateFont() {
    let changed = this.input.value !== this.savedValue;
    this.input.style.fontStyle = changed ? "italic" : "normal";
    this.input.style.backgroundColor = changed
      ? "rgba(225, 207, 2, 0.23)"
      : "white";
  }

  /**
   * @param {string} text
   */
  setInfo(text) {
    this.labelInfo.innerHTML = text;
  }

  // TODO: rename method: it does not save something, but just updates visuals
  save() {
    this.savedValue = this.input.value;
    this.#updateFont();
  }

  /**
   * @param {string} v
   */
  setValue(v) {
    this.savedValue = v;
    this.input.value = v;
  }

  getValue() {
    return this.input.value;
  }
}

export class TextInput {
  input = /** @type {HTMLInputElement} */ (null);
  labelInfo = /** @type {HTMLElement} */ (null);
  savedValue = "";

  /**
   * @param {HTMLElement} parent
   * @param {string} text
   * @param {function} inputEvent
   */
  constructor(parent, text, inputEvent = null) {
    // label
    let label = document.createElement("div");
    label.classList.add("input-label");
    let labelText = document.createElement("span");
    labelText.innerHTML = text + "&nbsp;";
    label.appendChild(labelText);
    this.labelInfo = document.createElement("span");
    this.labelInfo.classList.add("input-info");
    label.appendChild(this.labelInfo);
    parent.appendChild(label);
    // input
    this.input = document.createElement("input");
    this.input.type = "text";
    this.input.setAttribute("autocorrect", "off");
    this.input.setAttribute("autocomplete", "off");
    this.input.setAttribute("autocapitalize", "off");
    this.input.spellcheck = false;
    parent.appendChild(this.input);
    // action
    this.input.addEventListener("input", (event) => {
      this.#updateFont();
      if (inputEvent != null) {
        inputEvent(this.input.value);
      }
    });
  }

  #updateFont() {
    let changed = this.input.value !== this.savedValue;
    this.input.style.fontStyle = changed ? "italic" : "normal";
    this.input.style.backgroundColor = changed
      ? "rgba(225, 207, 2, 0.23)"
      : "white";
  }

  /**
   * @param {string} text
   */
  setInfo(text) {
    this.labelInfo.innerHTML = text;
  }

  // TODO: rename method: it does not save something, but just updates visuals
  save() {
    this.savedValue = this.input.value;
    this.#updateFont();
  }

  /**
   * @param {string} v
   */
  setValue(v) {
    this.savedValue = v;
    this.input.value = v;
  }

  getValue() {
    return this.input.value;
  }
}

export class PasswordInput extends TextInput {
  /**
   * @param {HTMLElement} parent
   * @param {string} text
   * @param {function} inputEvent
   */
  constructor(parent, text, inputEvent = null) {
    super(parent, text, inputEvent);
    this.input.type = "password";
  }
}

export class CheckboxInput {
  input = /** @type {HTMLElement} */ (null);
  value = false;

  /**
   * @param {HTMLElement} parent
   * @param {string} text
   * @param {boolean} value
   */
  constructor(parent, text, value = false) {
    let row = createDiv(parent, "row");
    this.input = createDiv(row, "checkbox");
    let textDiv = createDiv(row, "checkbox-text");
    textDiv.innerHTML = text;
    this.setValue(value);
    row.addEventListener("click", () => {
      this.value = !this.value;
      this.setValue(this.value);
    });
  }

  /**
   * @param {boolean} value
   */
  setValue(value) {
    this.value = value;
    this.input.innerHTML = value ? "X" : "";
  }

  getValue() {
    return this.value;
  }
}
