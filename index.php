<?php
require_once 'includes/config.php';
require_once 'includes/auth.php';

// Егер кіру жасаған болса, рөліне қарай бағыттау
if (Auth::isLoggedIn()) {
    if (Auth::isAdmin()) {
        Functions::redirect('dashboard/admin/');
    } elseif (Auth::isTeacher()) {
        Functions::redirect('dashboard/teacher/');
    } else {
        Functions::redirect('dashboard/student/');
    }
}
?>
<!DOCTYPE html>
<html lang="kk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo SITE_NAME; ?> - Басты бет</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        :root {
            --primary-color: #4e73df;
            --secondary-color: #858796;
            --success-color: #1cc88a;
            --info-color: #36b9cc;
            --warning-color: #f6c23e;
            --danger-color: #e74a3b;
        }
        
        .hero-section {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 100px 0;
            text-align: center;
        }
        
        .feature-card {
            border: none;
            border-radius: 10px;
            box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15);
            transition: transform 0.3s;
            height: 100%;
        }
        
        .feature-card:hover {
            transform: translateY(-5px);
        }
        
        .feature-icon {
            font-size: 3rem;
            margin-bottom: 20px;
            color: var(--primary-color);
        }
        
        .navbar-brand {
            font-weight: bold;
            font-size: 1.5rem;
        }
        
        .btn-primary {
            background-color: var(--primary-color);
            border-color: var(--primary-color);
        }
        
        .btn-primary:hover {
            background-color: #2e59d9;
            border-color: #2e59d9;
        }
        
        footer {
            background-color: #f8f9fc;
            border-top: 1px solid #e3e6f0;
        }
    </style>
</head>
<body>
    <!-- Навигация -->
    <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
        <div class="container">
            <a class="navbar-brand" href="index.php">
                <i class="fas fa-graduation-cap me-2"></i>🎓 <?php echo SITE_NAME; ?>
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item">
                        <a class="nav-link active" href="index.php">Басты бет</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#features">Мүмкіндіктер</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#about">Біз туралы</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="login.php">Кіру</a>
                    </li>
                    <li class="nav-item">
                        <a class="btn btn-primary ms-2" href="register.php">Тіркелу</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>

    <!-- Герой бөлімі -->
    <section class="hero-section">
        <div class="container">
            <h1 class="display-4 fw-bold mb-4">Университеттің цифрлық экожүйесіне қош келдіңіз!</h1>
            <p class="lead mb-4">Барлық университет қызметтері бір платформада</p>
            <a href="register.php" class="btn btn-light btn-lg me-2">
                <i class="fas fa-user-plus me-2"></i>Тіркелу
            </a>
            <a href="login.php" class="btn btn-outline-light btn-lg">
                <i class="fas fa-sign-in-alt me-2"></i>Кіру
            </a>
        </div>
    </section>

    <!-- Мүмкіндіктер бөлімі -->
    <section id="features" class="py-5">
        <div class="container">
            <h2 class="text-center mb-5">Біздің мүмкіндіктер ⭐⭐⭐⭐⭐</h2>
            <div class="row g-4">
                <div class="col-md-4">
                    <div class="card feature-card h-100">
                        <div class="card-body text-center p-4">
                            <div class="feature-icon">
                                <i class="fas fa-calendar-alt"></i>
                            </div>
                            <h4 class="card-title">Сабақ кестесі</h4>
                            <p class="card-text">Онлайн сабақ кестесі, аудиториялар, мұғалімдер және күнтізбе көрінісі</p>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-4">
                    <div class="card feature-card h-100">
                        <div class="card-body text-center p-4">
                            <div class="feature-icon">
                                <i class="fas fa-tasks"></i>
                            </div>
                            <h4 class="card-title">Тапсырмалар</h4>
                            <p class="card-text">Үй тапсырмалары, дедлайндар, файл жүктеу және бағалау жүйесі</p>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-4">
                    <div class="card feature-card h-100">
                        <div class="card-body text-center p-4">
                            <div class="feature-icon">
                                <i class="fas fa-home"></i>
                            </div>
                            <h4 class="card-title">Жатақхана</h4>
                            <p class="card-text">Бөлмелерді басқару, брондау жүйесі және төлем бақылауы</p>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-4">
                    <div class="card feature-card h-100">
                        <div class="card-body text-center p-4">
                            <div class="feature-icon">
                                <i class="fas fa-ticket-alt"></i>
                            </div>
                            <h4 class="card-title">Өтініш жүйесі</h4>
                            <p class="card-text">Студенттер өтініш жазады, деканат жауап береді, статусты бақылау</p>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-4">
                    <div class="card feature-card h-100">
                        <div class="card-body text-center p-4">
                            <div class="feature-icon">
                                <i class="fas fa-bell"></i>
                            </div>
                            <h4 class="card-title">Хабарландыру</h4>
                            <p class="card-text">Жаңалықтар, хабарландырулар және маңызды ескертулер</p>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-4">
                    <div class="card feature-card h-100">
                        <div class="card-body text-center p-4">
                            <div class="feature-icon">
                                <i class="fas fa-comments"></i>
                            </div>
                            <h4 class="card-title">Чат жүйесі</h4>
                            <p class="card-text">Студент-мұғалім байланысы, топтық чаттар және форум</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Біз туралы -->
    <section id="about" class="py-5 bg-light">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-md-6">
                    <h2 class="mb-4">Біз туралы</h2>
                    <p class="lead">
                        <strong>SMART CAMPUS</strong> - бұл университеттің барлық қызметтерін бір платформаға біріктіретін инновациялық шешім.
                    </p>
                    <p>
                        Біз студенттер мен оқытушылардың өзара әрекеттесуін жеңілдетеміз,
                        әкімшілік процестерді автоматтандырамыз және оқу процесін тиімді етеміз.
                    </p>
                    <ul class="list-unstyled">
                        <li><i class="fas fa-check text-success me-2"></i> Орталықтандырылған басқару</li>
                        <li><i class="fas fa-check text-success me-2"></i> Уақытты үнемдеу</li>
                        <li><i class="fas fa-check text-success me-2"></i> Қолдану қарапайымдылығы</li>
                        <li><i class="fas fa-check text-success me-2"></i> Тиімділікті арттыру</li>
                    </ul>
                </div>
                <div class="col-md-6">
                    <img src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" 
                         alt="SMART CAMPUS" class="img-fluid rounded shadow">
                </div>
            </div>
        </div>
    </section>

    <!-- Футер -->
    <footer class="py-4">
        <div class="container">
            <div class="row">
                <div class="col-md-6">
                    <h5><?php echo SITE_NAME; ?></h5>
                    <p class="text-muted">Университеттің цифрлық экожүйесі</p>
                </div>
                <div class="col-md-6 text-end">
                    <p class="text-muted mb-0">&copy; <?php echo date('Y'); ?> <?php echo SITE_NAME; ?>. Барлық құқықтар қорғалған.</p>
                </div>
            </div>
        </div>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        // Жылжымалы навигация
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            });
        });
    </script>
</body>
</html>