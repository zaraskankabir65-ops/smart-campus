<?php
// smart-campus/test_redirect.php

// Сессия деректерін орнату
session_start();
$_SESSION['logged_in'] = true;
$_SESSION['role'] = 'student';
$_SESSION['username'] = 'testuser';
$_SESSION['full_name'] = 'Тест Пайдаланушы';

echo "<h3>Бағыттау тесті</h3>";
echo "<p>Сессия деректері орнатылды.</p>";
echo "<p>Бағыттау жолдары:</p>";
echo "<ul>";
echo "<li><a href='dashboard/'>dashboard/ (әдепкі)</a></li>";
echo "<li><a href='dashboard/index.php'>dashboard/index.php (тікелей)</a></li>";
echo "<li><a href='dashboard/student/'>dashboard/student/</a></li>";
echo "<li><a href='dashboard/student/index.php'>dashboard/student/index.php (тікелей)</a></li>";
echo "</ul>";

// Тікелей бағыттау тесті
echo "<h4>Тікелей бағыттау:</h4>";
echo "<button onclick=\"window.location.href='dashboard/'\">dashboard/ бағыттау</button>";
?>