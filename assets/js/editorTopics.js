/**
 * LibreQ (https://github.com/andreas-schwenk/LibreQ)
 * copyright by Andreas Schwenk <contact@arts-and-sciences.com>
 * licensed under GPLv3
 */

import {
  CheckboxInput,
  createBr,
  createButton,
  createDiv,
  createH2,
  createP,
  TextInput,
} from "./dom.js";

/** @import { Editor } from "./editor.js"; */

class TopicNode {
  tree = /** @type {TopicsEditor} */ (null);

  row = 0;
  level = 0;
  name = "";
  code = -1;
  count = 0;

  div = /** @type {HTMLElement} */ (null);
  nameDiv = /** @type {HTMLElement} */ (null);

  /**
   * @param {TopicsEditor} tree
   * @param {number} row
   * @param {number} level
   * @param {string} name
   * @param {number} code
   */
  constructor(tree, row, level, name, code = -1, count = 0) {
    this.tree = tree;
    this.row = row;
    this.level = level;
    this.name = name;
    this.code = code;
    this.count = count;
  }

  refresh() {
    if (this.nameDiv != null) this.nameDiv.innerHTML = this.name;
    // TODO: refresh count
  }
}

export class TopicsEditor {
  editor = /** @type {Editor} */ (null);
  div = /** @type {HTMLElement} */ (null);
  treeDiv = /** @type {HTMLElement} */ (null);
  info = /** @type {HTMLElement} */ (null);

  selectChildrenCheckbox = /** @type {CheckboxInput} */ (null);
  topicNameInput = /** @type {TextInput} */ (null);

  nodes = /** @type {TopicNode[]} */ ([]);
  selectedNode = /** @type {TopicNode} */ (null);
  selectedChildrenNodes = /** @type {TopicNode[]} */ ([]);

  /**
   * @param {Editor} editor
   */
  constructor(editor) {
    this.div = document.getElementById("editor-core");
    this.editor = editor;

    // TODO: test data...
    this.nodes = [
      new TopicNode(this, 0, 0, "Math"),
      new TopicNode(this, 1, 1, "Fundamentals"),
      new TopicNode(this, 2, 2, "Set Theory"),
      new TopicNode(this, 3, 3, "Union, Intersection, Difference"),
      new TopicNode(this, 4, 3, "Cartesian Product"),
      new TopicNode(this, 5, 2, "Numbers"),
      new TopicNode(this, 6, 1, "Elementary Functions"),
      new TopicNode(this, 7, 2, "Polynomials"),
      new TopicNode(this, 8, 3, "Zeros"),
      new TopicNode(this, 9, 2, "Rational Functions"),
      new TopicNode(this, 10, 3, "Domain"),
      new TopicNode(this, 11, 3, "Zeros"),
    ];
  }

  refreshNodes() {
    let allDivs = [];
    this.treeDiv.innerHTML = "";
    let lastNode = null;
    const n = this.nodes.length;
    for (let i = 0; i < n; i++) {
      let node = this.nodes[i];
      node.row = i;
      // create row
      let row = createDiv(this.treeDiv, "topic-row");
      // indentation (leveling)
      for (let i = 0; i < node.level; i++) createDiv(row, "topic-spacer");
      // create div
      let div = createDiv(row, "topic-level", "topic-level-" + node.level);
      node.div = div;
      allDivs.push(div);
      // selection?
      if (node == this.selectedNode) div.classList.add("topic-level-selected");
      if (this.selectedChildrenNodes.includes(node))
        div.classList.add("topic-level-selected-child");
      // indentation valid?
      if (lastNode != null && node.level > lastNode.level + 1) {
        div.classList.add("topic-level-error");
      }
      // name
      let name = createDiv(div);
      name.innerHTML = node.name;
      node.nameDiv = name;
      // count
      let cnt = createDiv(div, "topic-count");
      cnt.innerHTML = node.count.toString();
      // action
      div.addEventListener("click", () => {
        this.selectedNode = node;
        this.selectedChildrenNodes = this.selectChildrenCheckbox.getValue()
          ? this.#getChildrenNodes(node)
          : [];
        this.topicNameInput.setValue(node.name);
        allDivs.forEach((d) => {
          d.classList.remove("topic-level-selected");
          d.classList.remove("topic-level-selected-child");
        });
        div.classList.add("topic-level-selected");
        this.selectedChildrenNodes.forEach((n) =>
          n.div.classList.add("topic-level-selected-child")
        );
      });
      lastNode = node;
    }
  }

  show() {
    this.div.innerHTML = "";
    let p = createP(this.div, `Logged in as '${this.editor.user}'.`);
    p.style.fontStyle = "italic";
    createH2(this.div, "Topic Tree Editor");
    createButton(this.div, "Back to Main Menu", () => {
      this.editor.menu.show();
    });
    createBr(this.div);
    createButton(this.div, "Add Topic", () => {
      // TODO: if a node is selected: add the new one to this as child
      let n = new TopicNode(this, this.nodes.length, 0, "");
      this.nodes.push(n);
      this.refreshNodes();
      n.div.click();
      this.topicNameInput.input.focus();
    });
    createButton(this.div, "Delete Selected Topic", () => {
      if (this.selectedNode == null) return null;
      this.nodes = this.nodes.filter((n) => n !== this.selectedNode);
      this.selectedNode = null;
      this.refreshNodes();
    });
    this.selectChildrenCheckbox = new CheckboxInput(
      this.div,
      "Extend selection to child nodes",
      true
    );
    createBr(this.div);
    this.treeDiv = createDiv(this.div);
    this.treeDiv.style.width = "100%";
    this.treeDiv.tabIndex = 0;
    this.treeDiv.style.outline = "none";
    this.treeDiv.addEventListener("keydown", (e) => {
      if (this.selectedNode == null) return;
      let direction = {
        ArrowLeft: "left",
        ArrowRight: "right",
        ArrowUp: "up",
        ArrowDown: "down",
      }[e.key];
      if (direction != undefined) {
        let nodes = [this.selectedNode, ...this.selectedChildrenNodes];
        this.#moveNodes(nodes, direction);
        this.refreshNodes();
      }
    });
    createBr(this.div);
    this.topicNameInput = new TextInput(this.div, "Topic Name", () => {
      if (this.selectedNode != null) {
        this.selectedNode.name = this.topicNameInput.getValue().trim();
        this.selectedNode.refresh();
      }
    });

    // TODO
    this.refreshNodes();
  }

  /**
   * @param {TopicNode} node
   * @returns {TopicNode[]}
   */
  #getChildrenNodes(node) {
    let res = [];
    for (let i = node.row + 1; i < this.nodes.length; i++) {
      if (this.nodes[i].level <= node.level) break;
      res.push(this.nodes[i]);
    }
    return res;
  }

  /**
   * @param {TopicNode[]} nodes
   * @param {string} direction
   */
  #moveNodes(nodes, direction) {
    if (nodes.length == 0) return;
    let mostLeft = Infinity;
    let mostRight = -Infinity;
    let mostTop = Infinity;
    let mostBottom = -Infinity;
    for (let n of nodes) {
      if (n.level < mostLeft) mostLeft = n.level;
      if (n.level > mostRight) mostRight = n.level;
      if (n.row < mostTop) mostTop = n.row;
      if (n.row > mostBottom) mostBottom = n.row;
    }

    switch (direction) {
      case "left": {
        if (mostLeft > 0) {
          for (let n of nodes) n.level--;
        }
        break;
      }
      case "right": {
        if (mostRight < 7) {
          for (let n of nodes) n.level++;
        }
        break;
      }
      case "up": {
        if (mostTop > 0) {
          this.moveArrayElement(this.nodes, mostTop - 1, mostBottom);
        }
        break;
      }
      case "down": {
        if (mostBottom + 1 < this.nodes.length) {
          console.log("move down");
          this.moveArrayElement(this.nodes, mostBottom + 1, mostTop);
        }
        break;
      }
    }
  }

  /**
   * @param {any[]} array
   * @param {number} fromIndex
   * @param {number} toIndex
   */
  moveArrayElement(array, fromIndex, toIndex) {
    const element = array.splice(fromIndex, 1)[0];
    array.splice(toIndex, 0, element);
  }
}
