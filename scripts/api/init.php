<?php

/**
 * LibreQ (https://github.com/andreas-schwenk/LibreQ)
 * copyright by Andreas Schwenk <contact@arts-and-sciences.com>
 * licensed under GPLv3
 */

declare(strict_types=1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
error_reporting(E_ALL);
ini_set('display_errors', 1);

function exit_success(string $msg, string $data = "")
{
  echo json_encode([
    'ok' => true,
    'msg' => $msg,
    'data' => $data
  ]);
  exit();
}

function exit_failure(string $msg, string $data = "")
{
  echo json_encode([
    'ok' => false,
    'msg' => $msg,
    'data' => $data
  ]);
  exit();
}
