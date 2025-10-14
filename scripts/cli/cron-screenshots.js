/**
 * LibreQ (https://github.com/andreas-schwenk/LibreQ)
 * copyright by Andreas Schwenk <contact@arts-and-sciences.com>
 * licensed under GPLv3
 */

import fs from "fs";
import puppeteer from "puppeteer";
import mariadb from "mariadb";

let timeLimit = 60; // seconds  TODO: use this!!
let start = Date.now();

const imageDir = "cache/preview/";

fs.mkdirSync(imageDir, { recursive: true });

// TODO: This file must read the LibreQ database for files that must be updated
//      -> In case of success, a (new) column for the screenshot-date is filled.
//      -> This file is triggered to run by a cron job. A parameter gives
//         the max number of seconds, this script processes.

const config = JSON.parse(
  fs.readFileSync("./user/config.secrets.json", "utf-8")
);
const moodleUrl = config["puppeteer-moodle-url"];
const moodleUser = config["puppeteer-moodle-user"];
const moodlePassword = config["puppeteer-moodle-password"];
const viewportWidth = config["puppeteer-viewport-width"];
const viewportHeight = config["puppeteer-viewport-height"];

async function main() {
  // get all relevant questions
  const pool = mariadb.createPool({
    host: config.db_libreq.host,
    user: config.db_libreq.user,
    password: config.db_libreq.password,
    database: config.db_libreq.database,
    connectionLimit: 5,
  });
  let conn;
  let rows = [];
  try {
    conn = await pool.getConnection();
    rows = await conn.query(`
      SELECT * 
      FROM moodle_question 
      WHERE img_timemodified < timemodified
    `);
    //console.log(rows);
  } catch (err) {
    console.error("Database error:", err);
    process.exit(-1);
  } finally {
    if (conn) conn.end();
  }

  // start puppeteer
  let browser = await puppeteer.launch({
    headless: true,
    //args: ["--no-sandbox"],
  });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(60000);
  await page.setViewport({
    width: viewportWidth,
    height: viewportHeight,
    isLandscape: true,
  });

  // Go to Moodle login page
  let url = moodleUrl + "login/index.php";
  await page.goto(url, {
    waitUntil: "load",
    timeout: 0,
  });

  // log in to Moodle
  const userInput = await page.waitForSelector("#username");
  await userInput.focus();
  await userInput.type(moodleUser);
  const userPassword = await page.waitForSelector("#password");
  await userPassword.focus();
  await userPassword.type(moodlePassword);
  await page.click("#loginbtn");
  await page.waitForNavigation({ waitUntil: "networkidle0" });

  // Go to the question preview
  for (let row of rows) {
    let end = Date.now();
    let deltaSeconds = (end - start) / 1000;
    if (deltaSeconds > timeLimit) {
      console.log(
        "... no more time left: will continue when next cron job starts"
      );
      process.exit(0);
    }
    let questionId = Number(row.questionid);
    for (let i = 0; i < 3; i++) {
      url =
        moodleUrl +
        "question/bank/previewquestion/preview.php?id=" +
        questionId;
      await page.goto(url, {
        waitUntil: "load",
        timeout: 0,
      });
      // Replace light-blue background color by white color
      await page.evaluate(() => {
        document.querySelectorAll(".content").forEach((element) => {
          let htmlElement = /** @type {HTMLElement} */ (element);
          htmlElement.style.backgroundColor = "white";
          for (let child of htmlElement.childNodes) {
            let htmlElement = /** @type {HTMLElement} */ (child);
            htmlElement.style.backgroundColor = "white";
          }
        });
      });
      const basePath = imageDir + questionId + "-" + i;
      const questionDiv = await page.$(".content");
      await questionDiv.screenshot({
        path: `${basePath}.png`,
      });
    }
    // update database
    // TODO: increase error column in case of errors
    // TODO: update screenshot-date
    xxx;
  }
  // Close browser
  browser.close();
  console.log("..ready");
}

main();
