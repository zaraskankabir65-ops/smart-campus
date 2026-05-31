<?php
require_once 'includes/config.php';
require_once 'includes/auth.php';
require_once 'includes/functions.php';

$auth = new Auth();
$result = $auth->logout();

Functions::setFlash('success', 'Сіз жүйеден сәтті шықтыңыз.');
Functions::redirect('login.php');
?>