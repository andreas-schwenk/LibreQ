<?php

/**
 * LibreQ (https://github.com/andreas-schwenk/LibreQ)
 * copyright by Andreas Schwenk <contact@arts-and-sciences.com>
 * licensed under GPLv3
 */

header("Access-Control-Allow-Origin: *");  // Allow requests from any domain
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

header("Content-Type: application/json"); // JSON response
error_reporting(E_ALL);
ini_set('display_errors', 1);

session_start();
session_destroy();

echo json_encode(['ok' => true]);
