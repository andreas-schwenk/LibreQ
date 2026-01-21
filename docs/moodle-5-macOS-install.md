# 📘 Moodle 5 Installation on macOS (for LibreQ)

> This guide sets up Moodle 5 locally for development and testing using PHP’s built-in server.
> **No Apache or Nginx required.** > **Not recommended for production!** Use a Linux setup for that.

> We assume using Moodle 5.1 or newer!

## 📦 Prerequisites

### 🍺 Install Homebrew

Follow the instructions at [https://brew.sh](https://brew.sh)

### 🗂 Assumed Directory Structure

You can change these paths, but be consistent throughout the guide:

- LibreQ base directory: `~/LibreQ/`
- Moodle source: `~/LibreQ/moodle`
- Moodle data dir: `~/LibreQ/moodledata`

```bash
mkdir -p ~/LibreQ/moodle
mkdir -p ~/LibreQ/moodledata
```

## 🔧 Install Dependencies

```bash
brew install wget mariadb php git maxima libyaml gnuplot composer php-intl
```

### (Optional) Install `yaml` PECL extension for better YAML performance

```bash
echo $(brew --prefix libyaml) | pecl install yaml
```

## ⚙️ Configure PHP

Get the location of `php.ini` ("Loaded Configuration File"):

```bash
php --ini
```

Edit it with e.g. `nano`:

```bash
nano /opt/homebrew/etc/php/8.4/php.ini
```

Uncomment and set the following:

```ini
max_input_vars = 10000
```

## 🛢 Setup the Database

Start the MariaDB service:

```bash
brew services start mariadb
```

Start MariaDB:

```bash
sudo mariadb
```

Create the database and user:

```sql
create database moodle;
CREATE USER 'moodle'@'127.0.0.1' IDENTIFIED BY 'moodle';
GRANT ALL PRIVILEGES ON moodle.* TO 'moodle'@'127.0.0.1';
exit;
```

Test login:

```bash
mariadb -h 127.0.0.1 -u moodle -p
```

## ⬇️ Get Moodle Source Code

```bash
cd ~/LibreQ/
git clone git://git.moodle.org/moodle.git
cd moodle
git branch -a
```

All available branches are listed. Check out the branch that matches your desired Moodle version.
For example, use `MOODLE_500_STABLE` to get Moodle 5.0:

```bash
git branch --track MOODLE_500_STABLE origin/MOODLE_500_STABLE
git checkout MOODLE_500_STABLE
```

## 📝 Configure Moodle

Create `config.php`:

```bash
nano ~/LibreQ/moodle/config.php
```

Paste the following (replace `USER` with your macOS username):

```php
<?php  // Moodle configuration file
unset($CFG);
global $CFG;
$CFG = new stdClass();
$CFG->dbtype    = 'mariadb';
$CFG->dblibrary = 'native';
$CFG->dbhost    = '127.0.0.1';
$CFG->dbname    = 'moodle';
$CFG->dbuser    = 'moodle';
$CFG->dbpass    = 'moodle';
$CFG->prefix    = 'mdl_';
$CFG->dboptions = [
    'dbpersist' => false,
    'dbport'    => '',
    'dbsocket'  => '',
    'dbcollation' => 'utf8mb4_unicode_ci',
];
$CFG->wwwroot   = 'http://localhost:8123';
$CFG->dataroot  = '/Users/USER/LibreQ/moodledata';   // ← replace USER
$CFG->admin     = 'admin';
$CFG->directorypermissions = 0777;
require_once(__DIR__ . '/lib/setup.php');
```

Run composer:

```bash
cd ~/LibreQ/moodle
composer install --no-dev --classmap-authoritative
```

## 🌐 Start Development Server

```bash
cd ~/LibreQ/moodle
php -S 127.0.0.1:8123 -t public
```

Open [http://127.0.0.1:8123](http://127.0.0.1:8123) in your browser and complete the setup via GUI.

Use e.g. `dev@localhost.localdomain` for support email fields.

## 🔁 Run Moodle Cron Job

```bash
cd ~/LibreQ/moodle
php admin/cli/cron.php
```

### (Optional) Add to crontab

```bash
crontab -e
```

Add this line (replace `USER` with your macOS username):

```bash
* * * * * /opt/homebrew/bin/php /Users/USER/LibreQ/moodle/admin/cli/cron.php >/dev/null 2>&1
```

> ⚠️ **Note:** Running the cron job every minute consumes system resources. Be sure to disable it when it's no longer needed.

## ➕ Install STACK Plugin

Install required plugins:

```bash
git clone https://github.com/maths/moodle-qbehaviour_dfexplicitvaildate.git ~/LibreQ/moodle/public/question/behaviour/dfexplicitvaildate
git clone https://github.com/maths/moodle-qbehaviour_dfcbmexplicitvaildate.git ~/LibreQ/moodle/public/question/behaviour/dfcbmexplicitvaildate
git clone https://github.com/maths/moodle-qbehaviour_adaptivemultipart.git ~/LibreQ/moodle/public/question/behaviour/adaptivemultipart
git clone https://github.com/maths/moodle-qtype_stack.git ~/LibreQ/moodle/public/question/type/stack
```

## ⚙️ Configure STACK Plugin

Find binaries and versions:

```bash
which maxima     # e.g. /opt/homebrew/bin/maxima
maxima --version
which gnuplot    # e.g. /opt/homebrew/bin/gnuplot
```

In Moodle GUI:

- Go to: **Site administration → Plugins → Question types → STACK**
- Set the version and use the paths from commands above. For example:

  ```
  Maxima command:  /opt/homebrew/bin/maxima --very-quiet
  Plot command:    /opt/homebrew/bin/gnuplot
  ```

- Go to the same site again and choose **healthcheck script** and then **Create Maxima image**.

Troubleshooting:

- If Homebrew installed a version newer than the one supported by STACK, you’ll need to compile and install Maxima from source. Download the required version from SourceForge (adjust the version number as needed):

  ```bash
  brew install sbcl texinfo
  wget https://sourceforge.net/projects/maxima/files/Maxima-source/5.47.0-source/maxima-5.47.0.tar.gz
  tar -xzf maxima-5.47.0.tar.gz
  cd maxima-5.47.0
  PREFIX="/opt/maxima-5.47.0"
  ./configure --prefix="$PREFIX" --with-sbcl="$(brew --prefix sbcl)/bin/sbcl" --enable-readline
  make
  sudo make install
  ```

  ```bash
  Maxima command:  /opt/maxima-5.47.0/bin/maxima --very-quiet
  ```

## ✅ Done

You now have a local Moodle 5 development setup including the STACK plugin for use with **LibreQ**!
