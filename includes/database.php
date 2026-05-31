<?php
require_once 'config.php';

class Database {
    private $conn;
    private static $instance = null;
    
    // Singleton үлгісі
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        $this->connect();
    }
    
    private function connect() {
        try {
            $this->conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
            
            if ($this->conn->connect_error) {
                throw new Exception("Дерекқорға қосылым қатесі: " . $this->conn->connect_error);
            }
            
            $this->conn->set_charset("utf8mb4");
            
        } catch (Exception $e) {
            die($e->getMessage());
        }
    }
    
    public function getConnection() {
        return $this->conn;
    }
    
    public function query($sql, $params = []) {
        $stmt = $this->conn->prepare($sql);
        
        if (!$stmt) {
            throw new Exception("SQL дайындау қатесі: " . $this->conn->error);
        }
        
        if (!empty($params)) {
            $types = '';
            foreach ($params as $param) {
                if (is_int($param)) {
                    $types .= 'i';
                } elseif (is_float($param)) {
                    $types .= 'd';
                } else {
                    $types .= 's';
                }
            }
            $stmt->bind_param($types, ...$params);
        }
        
        $stmt->execute();
        return $stmt;
    }
    
    public function fetchAll($sql, $params = []) {
        $stmt = $this->query($sql, $params);
        $result = $stmt->get_result();
        $rows = [];
        
        while ($row = $result->fetch_assoc()) {
            $rows[] = $row;
        }
        
        $stmt->close();
        return $rows;
    }
    
    public function fetchOne($sql, $params = []) {
        $stmt = $this->query($sql, $params);
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        
        $stmt->close();
        return $row ?: null;
    }
    
    public function insert($table, $data) {
        $columns = implode(', ', array_keys($data));
        $placeholders = implode(', ', array_fill(0, count($data), '?'));
        $values = array_values($data);
        
        $sql = "INSERT INTO $table ($columns) VALUES ($placeholders)";
        $stmt = $this->query($sql, $values);
        
        $insertId = $stmt->insert_id;
        $stmt->close();
        
        return $insertId;
    }
    
    public function update($table, $data, $where, $whereParams = []) {
        $setParts = [];
        $values = [];
        
        foreach ($data as $column => $value) {
            $setParts[] = "$column = ?";
            $values[] = $value;
        }
        
        $setClause = implode(', ', $setParts);
        $values = array_merge($values, $whereParams);
        
        $sql = "UPDATE $table SET $setClause WHERE $where";
        $stmt = $this->query($sql, $values);
        $affectedRows = $stmt->affected_rows;
        
        $stmt->close();
        return $affectedRows;
    }
    
    public function lastInsertId() {
        return $this->conn->insert_id;
    }
}
?>