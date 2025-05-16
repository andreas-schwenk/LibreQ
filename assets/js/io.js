/**
 * LibreQ (https://github.com/andreas-schwenk/LibreQ)
 * copyright by Andreas Schwenk <contact@arts-and-sciences.com>
 * licensed under GPLv3
 */

export class IO {
  /**
   * The called script must return at least { ok: true|false, msg: "my-msg" }
   * @param {string} baseUrl - e.g. https://mydomain/scripts/
   * @param {string} scriptPath - e.g. login.php
   * @param {Object.<string,any>} params - e.g. filters, pagination, ...
   * @param {Object.<string,any>} body - e.g. passwords, structured data, ...
   * @param {HTMLElement} msgDiv - if not null, then data.msg is set to it
   * @param {function} handler - the handler is called after fetching
   */
  static send(baseUrl, scriptPath, params, body, msgDiv, handler) {
    const searchParams = new URLSearchParams(params);
    params["_version"] = Date.now(); // force reload
    fetch(baseUrl + scriptPath + "?" + searchParams.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then((response) => response.json())
      .then((data) => {
        if (msgDiv != null && "msg" in data) {
          msgDiv.innerHTML = data.msg;
          msgDiv.style.color = data.ok ? "black" : "red";
        }
        handler(data);
      })
      .catch((error) => {
        if (msgDiv != null) {
          msgDiv.innerHTML = "Fehlgeschlagen!";
          msgDiv.style.color = "red";
        }
        console.error("Error:", error);
      });
  }

  /**
   * The called script must return at least { ok: true|false, msg: "my-msg" }
   * @param {string} baseUrl - e.g. https://mydomain/scripts/
   * @param {string} scriptPath - e.g. login.php
   * @param {Object.<string,any>} params - e.g. filters, pagination, ...
   * @param {HTMLElement} msgDiv - if not null, then data.msg is set to it
   * @param {function} handler - the handler is called after fetching
   */
  static receive(baseUrl, scriptPath, params, msgDiv, handler) {
    const searchParams = new URLSearchParams(params);
    params["_version"] = Date.now(); // force reload
    fetch(baseUrl + scriptPath + "?" + searchParams.toString())
      .then((response) => response.json())
      .then((data) => {
        if (msgDiv != null && "msg" in data) {
          msgDiv.innerHTML = data.msg;
          msgDiv.style.color = data.ok ? "black" : "red";
        }
        handler(data);
      })
      .catch((error) => {
        if (msgDiv != null) {
          msgDiv.innerHTML = "Fehlgeschlagen";
          msgDiv.style.color = "red";
        }
        console.error("Error:", error);
      });
  }
}
