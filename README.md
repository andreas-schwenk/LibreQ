# LibreQ

A free and flexible toolkit for organizing, tagging, and sharing Moodle questions

## Installation

First install Moodle. Refer e.g. to `docs/moodle-5-*-install.md` in this repository to set up a local testing system.

For LibreQ: Dependencies (`php` and `mariadb` should already be installed):

```bash
sudo apt install php mariadb nodejs npm
```

TODO: Download LibreQ.

Create the database and a mariaDB user:

```bash
cd db
sudo mariadb <create-database.sql
```

Make settings in user/ directory

Start a web server:

```bash
php -S 127.0.0.1:8123
```

Create root topics:
In the LibreQ website, click on Editor -> Manage Root Topics and insert for example the following in the text area, and click on Save Changes:

```bash
Math:1000
Physics:2000
```

## For the question preview, a special role and user must be created to view the questions:

_Hint: You may specify a different role and user name than `puppeteer`._

### Create a new role with privileges to view questions

- Log in to Moodle as admin: Click on `Site Administration` -> `Users|Permissions|Define roles` -> `Add a new role`:
- For `Use role or archetype` choose `No role`. Then click on `Continue`
- For `Short name`, `Custom full name` and `Custom description` use `puppeteer`
- For `Context types where this role may be assigned` choose `System`
- In the area `Capability` enable privileges `moodle/question:useall` and `moodle/question:viewall`
- Click on `Create this role` at the bottom of the page

### Create a user

- Log in to Moodle as admin: Click on `Site Administration` -> `Users|Accounts|Add a new user`
- Use `puppeteer` as user name, fill the required fields and then click on `Create user` at the bottom of the page

## Assign the question viewer role

- Log in to Moodle as admin: Click on `Site Administration` -> `Users|Permissions|Assign system roles`
- Choose the `puppeteer` role. Choose `puppeteer` from the list `Potential users` and click `Add`

## Check privileges

- The new user `puppeteer` cannot browse courses, so we first must obtain a question preview link from another user (e.g. the admin). The required link must have the following form `MOODLE_URL/question/bank/previewquestion/preview.php?id=QUESTION_ID`. If you open a question preview, Moodle will include `cmid` and other parameters in the URL, which must be removed!
- Log in to Moodle with the `puppeteer` user and then go to `MOODLE_URL/question/bank/previewquestion/preview.php?id=QUESTION_ID`, with a numeric value for `QUESTION_ID`.
