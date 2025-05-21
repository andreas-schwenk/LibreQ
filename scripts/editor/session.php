<?php

/**
 * LibreQ (https://github.com/andreas-schwenk/LibreQ)
 * copyright by Andreas Schwenk <contact@arts-and-sciences.com>
 * licensed under GPLv3
 */

// This file checks, if a user is already logged in

session_start();
require_once '../api/init.php';

if (isset($_SESSION['user']))
  exit_success('Already logged in', $_SESSION['user']);
else
  exit_failure('Not logged in');
