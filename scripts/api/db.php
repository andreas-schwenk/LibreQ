<?php

/**
 * LibreQ (https://github.com/andreas-schwenk/LibreQ)
 * copyright by Andreas Schwenk <contact@arts-and-sciences.com>
 * licensed under GPLv3
 */

require_once 'init.php';

class Database
{
  private mysqli $connection;

  public function __construct($config)
  {
    if (!isset($config['host']) || !isset($config['user']) || !isset($config['password']) || !isset($config['database'])) {
      exit_failure('Error: Database configuration misses attributes');
    }
    try {
      $this->connection = new mysqli($config['host'], $config['user'], $config['password'], $config['database']);
    } catch (mysqli_sql_exception $e) {
      exit_failure('Error: Connection to the database failed!');
    }
  }

  // TODO: query function without result
  // TODO: query for multiple bind/executes (e.g. for inserts)

  /**
   * @param $sql    The SQL query (example: "SELECT * FROM table WHERE x = ?;")
   * @param $types  The parameter types (example: "i")
   * @param $params The parameters; must be not constants (example: "[$x]")
   */
  public function query(string $sql, string $types, array $params): array
  {
    $get_result = str_starts_with($sql, 'SELECT');
    $stmt = $this->prepare($sql);
    $rows = [];
    $this->bind_and_execute($stmt, $types, $params, $get_result, $rows);
    $stmt->close();
    return $rows;
  }

  public function query_sequence(string $sql, string $types, array $params_list): array
  {
    $get_result = str_starts_with($sql, 'SELECT');
    $stmt = $this->prepare($sql);
    $rows = [];
    foreach ($params_list as $params)
      $this->bind_and_execute($stmt, $types, $params, $get_result, $rows);
    $stmt->close();
    return $rows;
  }

  private function prepare(string $sql): mysqli_stmt
  {
    $stmt = $this->connection->prepare($sql);
    if (!$stmt) exit_failure("Prepare failed: " . $this->connection->error);
    return $stmt;
  }


  private function bind_and_execute(mysqli_stmt $stmt, string $types, array $params, bool $get_result, array &$rows)
  {
    if (strlen($types) > 0) {
      if (!$stmt->bind_param($types, ...$params))
        exit_failure("Bind failed: " . $stmt->error);
    }
    if (!$stmt->execute())
      exit_failure("Execute failed: " . $stmt->error);
    if ($get_result) {
      $result = $stmt->get_result();
      if (!$result)
        exit_failure("Getting result failed: " . $stmt->error);
      while ($row = $result->fetch_assoc()) {
        $rows[] = $row;
      }
    }
  }
}

function index_by_column(array $rows, string $column_id)
{
  $result = [];
  foreach ($rows as $row) {
    $result[$row[$column_id]] = $row;
  }
  return $result;
}
