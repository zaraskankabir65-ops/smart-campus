<?php
// smart-campus/test_structure.php

echo "<h3>Файл құрылымын тексеру</h3>";

$files = [
    'index.php' => file_exists('index.php'),
    'login.php' => file_exists('login.php'),
    'register.php' => file_exists('register.php'),
    'dashboard/index.php' => file_exists('dashboard/index.php'),
    'dashboard/student/index.php' => file_exists('dashboard/student/index.php'),
    'includes/config.php' => file_exists('includes/config.php'),
];

echo "<table border='1' cellpadding='10'>";
echo "<tr><th>Файл</th><th>Бар/Жоқ</th><th>Жолы</th></tr>";

foreach ($files as $file => $exists) {
    $path = __DIR__ . '/' . $file;
    echo "<tr>";
    echo "<td>$file</td>";
    echo "<td>" . ($exists ? '✅ Бар' : '❌ Жоқ') . "</td>";
    echo "<td>$path</td>";
    echo "</tr>";
}

echo "</table>";

// Apache тесті
echo "<h3>Apache тесті</h3>";
echo "PHP_SELF: " . $_SERVER['PHP_SELF'] . "<br>";
echo "REQUEST_URI: " . ($_SERVER['REQUEST_URI'] ?? 'N/A') . "<br>";
echo "DOCUMENT_ROOT: " . $_SERVER['DOCUMENT_ROOT'] . "<br>";
?>