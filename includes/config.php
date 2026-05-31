<?php
// SMART CAMPUS - Баптау файлы

// Дерекқор конфигурациясы
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'smart_campus');

// Жүйе константалары
define('SITE_NAME', 'SMART CAMPUS');
define('SITE_URL', 'http://localhost/smart-campus/');
define('DEFAULT_TIMEZONE', 'Asia/Almaty');

// Файлдар үшін тұрақты жолдар
define('UPLOAD_PATH', $_SERVER['DOCUMENT_ROOT'] . '/smart-campus/uploads/');
define('ASSETS_URL', SITE_URL . 'assets/');

// Сессияны бастау
session_start();

// Уақыт белдеуін орнату
date_default_timezone_set(DEFAULT_TIMEZONE);

// Хаттарды баптау (әзірлеу режимінде)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Автожабдырлаушы функция
spl_autoload_register(function ($class_name) {
    $file = __DIR__ . '/' . $class_name . '.php';
    if (file_exists($file)) {
        require_once $file;
    }
});
?>