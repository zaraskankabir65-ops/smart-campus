<?php
require_once 'database.php';

class Auth {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance();
    }
    
    // Тіркелу функциясы
    public function register($data) {
        // Деректерді тексеру
        if (empty($data['username']) || empty($data['email']) || empty($data['password'])) {
            return ['success' => false, 'message' => 'Барлық өрістерді толтырыңыз'];
        }
        
        // Пайдаланушы атын тексеру
        if ($this->userExists($data['username'], 'username')) {
            return ['success' => false, 'message' => 'Бұл пайдаланушы аты бос емес'];
        }
        
        // Email тексеру
        if ($this->userExists($data['email'], 'email')) {
            return ['success' => false, 'message' => 'Бұл email бос емес'];
        }
        
        // Құпия сөзді хэштеу
        $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
        
        // Пайдаланушыны қосу
        $userData = [
            'username' => $data['username'],
            'email' => $data['email'],
            'password' => $hashedPassword,
            'full_name' => $data['full_name'] ?? '',
            'role' => $data['role'] ?? 'student',
            'phone' => $data['phone'] ?? '',
            'created_at' => date('Y-m-d H:i:s')
        ];
        
        try {
            $userId = $this->db->insert('users', $userData);
            
            if ($userId) {
                // Автоматты түрде кіру
                $this->autoLogin($userId);
                return ['success' => true, 'message' => 'Тіркелу сәтті аяқталды'];
            }
            
            return ['success' => false, 'message' => 'Тіркелу кезінде қате орын алды'];
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Қате: ' . $e->getMessage()];
        }
    }
    
    // Кіру функциясы
    public function login($username, $password) {
        // Пайдаланушыны іздеу
        $sql = "SELECT * FROM users WHERE username = ? OR email = ?";
        $user = $this->db->fetchOne($sql, [$username, $username]);
        
        if (!$user) {
            return ['success' => false, 'message' => 'Пайдаланушы табылмады'];
        }
        
        // Құпия сөзді тексеру
        if (!password_verify($password, $user['password'])) {
            return ['success' => false, 'message' => 'Қате құпия сөз'];
        }
        
        // Сессияға сақтау
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['email'] = $user['email'];
        $_SESSION['role'] = $user['role'];
        $_SESSION['full_name'] = $user['full_name'];
        $_SESSION['logged_in'] = true;
        
        // Соңғы кіру уақытын жаңарту
        $this->updateLastLogin($user['id']);
        
        return ['success' => true, 'message' => 'Кіру сәтті', 'user' => $user];
    }
    
    // Автоматты кіру (тіркелгеннен кейін)
    private function autoLogin($userId) {
        $sql = "SELECT * FROM users WHERE id = ?";
        $user = $this->db->fetchOne($sql, [$userId]);
        
        if ($user) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['email'] = $user['email'];
            $_SESSION['role'] = $user['role'];
            $_SESSION['full_name'] = $user['full_name'];
            $_SESSION['logged_in'] = true;
        }
    }
    
    // Шығу функциясы
    public function logout() {
        session_destroy();
        session_start();
        return ['success' => true, 'message' => 'Сіз жүйеден шықтыңыз'];
    }
    
    // Пайдаланушы бар ма жоқ па тексеру
    private function userExists($value, $field) {
        $sql = "SELECT id FROM users WHERE $field = ?";
        $result = $this->db->fetchOne($sql, [$value]);
        return $result !== null;
    }
    
    // Соңғы кіру уақытын жаңарту
    private function updateLastLogin($userId) {
        $sql = "UPDATE users SET last_login = NOW() WHERE id = ?";
        $this->db->query($sql, [$userId]);
    }
    
    // Ағымдағы пайдаланушыны алу
    public static function getUser() {
        if (isset($_SESSION['user_id'])) {
            $db = Database::getInstance();
            $sql = "SELECT * FROM users WHERE id = ?";
            return $db->fetchOne($sql, [$_SESSION['user_id']]);
        }
        return null;
    }
    
    // Тексеру функциялары
    public static function isLoggedIn() {
        return isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true;
    }
    
    public static function isAdmin() {
        return isset($_SESSION['role']) && $_SESSION['role'] === 'admin';
    }
    
    public static function isTeacher() {
        return isset($_SESSION['role']) && $_SESSION['role'] === 'teacher';
    }
    
    public static function isStudent() {
        return isset($_SESSION['role']) && $_SESSION['role'] === 'student';
    }
    
    // Құпия сөзді өзгерту
    public function changePassword($userId, $currentPassword, $newPassword) {
        // Ағымдағы құпия сөзді тексеру
        $sql = "SELECT password FROM users WHERE id = ?";
        $user = $this->db->fetchOne($sql, [$userId]);
        
        if (!password_verify($currentPassword, $user['password'])) {
            return ['success' => false, 'message' => 'Ағымдағы құпия сөз қате'];
        }
        
        // Жаңа құпия сөзді жаңарту
        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
        $sql = "UPDATE users SET password = ? WHERE id = ?";
        $result = $this->db->query($sql, [$hashedPassword, $userId]);
        
        return ['success' => true, 'message' => 'Құпия сөз сәтті өзгертілді'];
    }
}
?>