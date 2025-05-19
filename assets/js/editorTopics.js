/**
 * LibreQ (https://github.com/andreas-schwenk/LibreQ)
 * copyright by Andreas Schwenk <contact@arts-and-sciences.com>
 * licensed under GPLv3
 */

// TODO: toggle the public visibility of topics)

import { SCRIPTS_URL } from "./config.js";
import {
  CheckboxInput,
  createBr,
  createButton,
  createDiv,
  createH2,
  createInfo,
  createP,
  TextInput,
} from "./dom.js";
import { IO } from "./io.js";

/** @import { Editor } from "./editor.js"; */

class TopicNode {
  tree = /** @type {TopicsEditor} */ (null);

  row = 0;
  depth = 0;
  name = "";
  databaseId = -1;
  count = 0;

  div = /** @type {HTMLElement} */ (null);
  nameDiv = /** @type {HTMLElement} */ (null);
  countDiv = /** @type {HTMLElement} */ (null);

  /**
   * @param {TopicsEditor} tree
   * @param {number} row
   * @param {number} depth
   * @param {string} name
   * @param {number} databaseId
   */
  constructor(tree, row, depth, name, databaseId = -1, count = 0) {
    this.tree = tree;
    this.row = row;
    this.depth = depth;
    this.name = name;
    this.databaseId = databaseId;
    this.count = count;
  }

  refresh() {
    if (this.nameDiv != null) this.nameDiv.innerHTML = this.name;
    if (this.countDiv != null) this.countDiv.innerHTML = this.count.toString();
  }
}

export class TopicsEditor {
  editor = /** @type {Editor} */ (null);
  div = /** @type {HTMLElement} */ (null);
  treeDiv = /** @type {HTMLElement} */ (null);
  saveInfo = /** @type {HTMLElement} */ (null);

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
      new TopicNode(this, 12, 0, "Physics"),
      new TopicNode(this, 13, 0, "Biology"),
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
      for (let i = 0; i < node.depth; i++) createDiv(row, "topic-spacer");
      // create div
      let div = createDiv(row, "topic-level", "topic-level-" + node.depth);
      node.div = div;
      allDivs.push(div);
      // selection?
      if (node == this.selectedNode) div.classList.add("topic-level-selected");
      if (this.selectedChildrenNodes.includes(node))
        div.classList.add("topic-level-selected-child");
      // indentation valid?
      if (lastNode != null && node.depth > lastNode.depth + 1) {
        div.classList.add("topic-level-error");
      }
      // name
      let name = createDiv(div);
      name.innerHTML = node.name;
      node.nameDiv = name;
      // count
      let count = createDiv(div, "topic-count");
      count.innerHTML = node.count.toString();
      node.countDiv = count;
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
      // TODO: warn in case of unsaved changes
      this.editor.menu.show();
    });
    createBr(this.div);

    createButton(this.div, "Save Changes", () => {
      this.save();
    });
    this.saveInfo = createInfo(this.div, "");

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
        event.preventDefault();
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
      if (this.nodes[i].depth <= node.depth) break;
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
      if (n.depth < mostLeft) mostLeft = n.depth;
      if (n.depth > mostRight) mostRight = n.depth;
      if (n.row < mostTop) mostTop = n.row;
      if (n.row > mostBottom) mostBottom = n.row;
    }

    switch (direction) {
      case "left": {
        if (mostLeft > 0) {
          for (let n of nodes) n.depth--;
        }
        break;
      }
      case "right": {
        if (mostRight < 7) {
          for (let n of nodes) n.depth++;
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

  save() {
    // Check validity and create pseudo-ids for new topics
    let pseudoIds = [];
    let pseudoId = -1000;
    let valid = true;
    let lastDepth = -1;
    for (let node of this.nodes) {
      if (node.databaseId < 0) node.databaseId = pseudoId;
      pseudoIds.push(pseudoId);
      pseudoId--;
      if (node.depth > lastDepth + 1) {
        valid = false;
        this.saveInfo.innerHTML =
          "ERROR: Invalid structure (refer to red lines)";
        this.saveInfo.style.color = "red";
        return;
      }
      lastDepth = node.depth;
    }
    // Gather data
    let id = new Array(8).fill(-1);
    let rows = [];
    for (let node of this.nodes) {
      id[node.depth] = node.databaseId;
      id.fill(-1, node.depth + 1);
      rows.push({
        id: node.databaseId,
        name: node.name,
        depth: node.depth,
        id0: id[0],
        id1: id[1],
        id2: id[2],
        id3: id[3],
        id4: id[4],
        id5: id[5],
        id6: id[6],
        id7: id[7],
        position: node.row,
      });
    }
    // Send data
    let params = { type: "save_topic_tree" };
    let body = { pseudoIds: pseudoIds, rows: rows };
    console.log(JSON.stringify(body, null, 4));
    IO.send(SCRIPTS_URL, "edit.php", params, body, this.saveInfo, (data) => {
      // TODO
      let bp = 1337;
    });

    // info
    this.saveInfo.innerHTML = "Saved changes.";
    this.saveInfo.style.color = "green";

    // TODO: must load again to get new IDs!!!
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
