<?php
require_once 'config.php';

class Functions {
    
    // ХТМЛ контентін тазарту
    public static function sanitize($input) {
        if (is_array($input)) {
            foreach ($input as $key => $value) {
                $input[$key] = self::sanitize($value);
            }
            return $input;
        }
        
        return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
    }
    
    // Бағыттау функциясы
    public static function redirect($url) {
        header("Location: " . SITE_URL . $url);
        exit();
    }
    
    // Флэш хабарламасы
    public static function setFlash($type, $message) {
        $_SESSION['flash'] = [
            'type' => $type,
            'message' => $message
        ];
    }
    
    public static function getFlash() {
        if (isset($_SESSION['flash'])) {
            $flash = $_SESSION['flash'];
            unset($_SESSION['flash']);
            return $flash;
        }
        return null;
    }
    
    public static function showFlash() {
        $flash = self::getFlash();
        if ($flash) {
            $type = $flash['type'];
            $message = $flash['message'];
            
            $html = "<div class='alert alert-$type alert-dismissible fade show' role='alert'>";
            $html .= htmlspecialchars($message);
            $html .= "<button type='button' class='btn-close' data-bs-dismiss='alert' aria-label='Close'></button>";
            $html .= "</div>";
            
            return $html;
        }
        return '';
    }
    
    // Файл жүктеу
    public static function uploadFile($file, $allowedTypes = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'], $maxSize = 5242880) {
        if ($file['error'] !== UPLOAD_ERR_OK) {
            return ['success' => false, 'message' => 'Файл жүктеу қатесі'];
        }
        
        // Файл өлшемін тексеру
        if ($file['size'] > $maxSize) {
            return ['success' => false, 'message' => 'Файл өлшемі тым үлкен (макс: 5MB)'];
        }
        
        // Файл түрін тексеру
        $fileExt = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($fileExt, $allowedTypes)) {
            return ['success' => false, 'message' => 'Рұқсат етілмеген файл түрі'];
        }
        
        // Бірегей файл атын құру
        $fileName = uniqid() . '_' . time() . '.' . $fileExt;
        $uploadPath = UPLOAD_PATH . $fileName;
        
        // Файлды жүктеу
        if (move_uploaded_file($file['tmp_name'], $uploadPath)) {
            return [
                'success' => true,
                'file_name' => $fileName,
                'file_path' => 'uploads/' . $fileName,
                'original_name' => $file['name']
            ];
        }
        
        return ['success' => false, 'message' => 'Файлды жүктеу кезінде қате'];
    }
    
    // Тексеру функциялары
    public static function isValidEmail($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL);
    }
    
    public static function isValidPhone($phone) {
        return preg_match('/^\+7\d{10}$/', $phone) || preg_match('/^8\d{10}$/', $phone);
    }
    
    // Құпия сөз күшін тексеру
    public static function isStrongPassword($password) {
        return strlen($password) >= 8 && 
               preg_match('/[A-Z]/', $password) && 
               preg_match('/[a-z]/', $password) && 
               preg_match('/[0-9]/', $password);
    }
    
    // Форматтау функциялары
    public static function formatDate($date, $format = 'd.m.Y H:i') {
        return date($format, strtotime($date));
    }
    
    public static function formatDateTime($dateTime) {
        return self::formatDate($dateTime, 'd.m.Y H:i:s');
    }
    
    // Қысқа мәтінді жасау
    public static function excerpt($text, $length = 100) {
        if (strlen($text) <= $length) {
            return $text;
        }
        
        $excerpt = substr($text, 0, $length);
        $lastSpace = strrpos($excerpt, ' ');
        
        if ($lastSpace !== false) {
            $excerpt = substr($excerpt, 0, $lastSpace);
        }
        
        return $excerpt . '...';
    }
    
    // CSRF токені
    public static function generateCSRFToken() {
        if (empty($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['csrf_token'];
    }
    
    public static function verifyCSRFToken($token) {
        return isset($_SESSION['csrf_token']) && 
               hash_equals($_SESSION['csrf_token'], $token);
    }
    
    // Рөлдерді алу
    public static function getRoles() {
        return [
            'admin' => 'Әкімші',
            'teacher' => 'Оқытушы',
            'student' => 'Студент'
        ];
    }
    
    // Рөл атауын алу
    public static function getRoleName($role) {
        $roles = self::getRoles();
        return $roles[$role] ?? $role;
    }
}
?>