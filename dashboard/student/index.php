<?php
// Мәліметтер базасына қосылу
include('../../includes/config.php');
include('../../includes/database.php');
include('../../includes/functions.php');

// Мұнда сессия арқылы студенттің ID-ін аламыз (мысалы: $user_id = $_SESSION['user_id'];)
// Мысал ретінде статистиканы тарту:
// $query = "SELECT * FROM users WHERE id = $user_id";
?>

<!DOCTYPE html>
<html lang="kk">
<head>
    <meta charset="UTF-8">
    <title>Smart Campus | Dashboard</title>
    <link rel="stylesheet" href="../../assets/css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <div class="container">
        <aside class="sidebar">
            <div class="logo">
                <i class="fas fa-user-graduate"></i>
            </div>
            <nav>
                <ul>
                    <li class="active"><i class="fas fa-th-large"></i> Dashboard</li>
                    <li><i class="fas fa-wallet"></i> Payment Info</li>
                    <li><i class="fas fa-edit"></i> Registration</li>
                    <li><i class="fas fa-book"></i> Courses</li>
                    <li><i class="fas fa-file-alt"></i> Result</li>
                    <li><i class="fas fa-calendar-alt"></i> Schedule</li>
                </ul>
            </nav>
            <div class="logout">
                <a href="../../logout.php"><i class="fas fa-sign-out-alt"></i> Logout</a>
            </div>
        </aside>

        <main class="main-content">
            <header>
                <input type="text" placeholder="Search...">
                <div class="user-profile">
                    <span>John Doe <br><small>3rd year</small></span>
                    <img src="../../assets/images/user.jpg" alt="User">
                </div>
            </header>

            <section class="welcome-banner">
                <div class="text">
                    <h1>Welcome back, John!</h1>
                    <p>Always stay updated in your student portal</p>
                </div>
                <img src="../../assets/images/student-illustration.png" alt="">
            </section>

            <section class="finance-cards">
                <div class="card">
                    <h3>$ 10,000</h3>
                    <p>Total Payable</p>
                </div>
                <div class="card active">
                    <h3>$ 5,000</h3>
                    <p>Total Paid</p>
                </div>
                <div class="card">
                    <h3>$ 300</h3>
                    <p>Others</p>
                </div>
            </section>
        </main>
    </div>
</body>
</html>