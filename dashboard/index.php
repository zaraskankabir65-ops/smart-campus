<?php
// dashboard/index.php - Бағыттау файлы

// Сессияны бастау
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Кіруді тексеру
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    header("Location: ../login.php");
    exit();
}

// Рөліне қарай бағыттау
$role = $_SESSION['role'] ?? 'student';

if ($role === 'admin') {
    if (file_exists('admin/index.php')) {
        header("Location: admin/index.php");
    } else {
        // Егер admin бумасы жоқ болса, студент бумасына бағыттау
        header("Location: student/index.php");
    }
} elseif ($role === 'teacher') {
    if (file_exists('teacher/index.php')) {
        header("Location: teacher/index.php");
    } else {
        header("Location: student/index.php");
    }
} else {
    // Әдепкі студент ретінде
    header("Location: student/index.php");
}
exit();
?>