# LibreQ

A free and flexible toolkit for organizing, tagging, and sharing Moodle questions



## Installation

Dependencies:

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
In the LibreQ website, click on  Editor -> Manage Root Topics and insert for example the following in the text area, and click on Save Changes:

```bash
Math:1000
Physics:2000
```
