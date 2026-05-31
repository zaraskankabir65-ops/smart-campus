<?php
require_once 'includes/config.php';
require_once 'includes/auth.php';
require_once 'includes/functions.php';

// Егер кіру жасаған болса, басқа бетке бағыттау
if (Auth::isLoggedIn()) {
    Functions::redirect('dashboard/');
}

$error = '';
$success = '';

// Форманы өңдеу
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = Functions::sanitize($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';
    $csrf_token = $_POST['csrf_token'] ?? '';
    
    // CSRF токенін тексеру
    if (!Functions::verifyCSRFToken($csrf_token)) {
        $error = 'Жарамсыз токен. Өтініш, қайта тырысыңыз.';
    } else {
        $auth = new Auth();
        $result = $auth->login($username, $password);
        
        if ($result['success']) {
            Functions::setFlash('success', 'Кіру сәтті аяқталды!');
            
            // Рөліне қарай бағыттау
            if (Auth::isAdmin()) {
                Functions::redirect('dashboard/admin/');
            } elseif (Auth::isTeacher()) {
                Functions::redirect('dashboard/teacher/');
            } else {
                Functions::redirect('dashboard/student/');
            }
        } else {
            $error = $result['message'];
        }
    }
}
?>
<!DOCTYPE html>
<html lang="kk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Кіру - <?php echo SITE_NAME; ?></title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .login-card {
            background: white;
            border-radius: 15px;
            padding: 40px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            width: 100%;
            max-width: 400px;
        }
        .logo {
            text-align: center;
            margin-bottom: 30px;
            font-size: 28px;
            font-weight: bold;
            color: #667eea;
        }
        .btn-primary {
            background-color: #667eea;
            border-color: #667eea;
        }
        .btn-primary:hover {
            background-color: #5a67d8;
            border-color: #5a67d8;
        }
    </style>
</head>
<body>
    <div class="login-card">
        <div class="logo">
            <i class="fas fa-graduation-cap me-2"></i>🎓 <?php echo SITE_NAME; ?>
        </div>
        
        <?php echo Functions::showFlash(); ?>
        
        <?php if ($error): ?>
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                <?php echo htmlspecialchars($error); ?>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        <?php endif; ?>
        
        <form method="POST" action="">
            <input type="hidden" name="csrf_token" value="<?php echo Functions::generateCSRFToken(); ?>">
            
            <div class="mb-3">
                <label for="username" class="form-label">
                    <i class="fas fa-user me-1"></i> Пайдаланушы аты немесе Email
                </label>
                <input type="text" class="form-control" id="username" name="username" required 
                       value="<?php echo htmlspecialchars($_POST['username'] ?? ''); ?>">
            </div>
            
            <div class="mb-3">
                <label for="password" class="form-label">
                    <i class="fas fa-lock me-1"></i> Құпия сөз
                </label>
                <input type="password" class="form-control" id="password" name="password" required>
                <div class="form-text">
                    <a href="forgot-password.php" class="text-decoration-none">Құпия сөзді ұмыттыңыз ба?</a>
                </div>
            </div>
            
            <div class="mb-3 form-check">
                <input type="checkbox" class="form-check-input" id="remember" name="remember">
                <label class="form-check-label" for="remember">Мені есте сақтау</label>
            </div>
            
            <button type="submit" class="btn btn-primary w-100 py-2">
                <i class="fas fa-sign-in-alt me-2"></i> Кіру
            </button>
            
            <div class="text-center mt-3">
                <p class="mb-0">
                    Тіркелгіңіз жоқ па? 
                    <a href="register.php" class="text-decoration-none fw-bold">Тіркелу</a>
                </p>
                <p class="mt-2">
                    <a href="index.php" class="text-decoration-none">
                        <i class="fas fa-home me-1"></i> Басты бетке оралу
                    </a>
                </p>
            </div>
        </form>
        
        <hr class="my-4">
        
        <div class="text-center">
            <p class="text-muted small mb-2">Немесе келесі арқылы кіріңіз:</p>
            <div class="d-flex justify-content-center gap-2">
                <button class="btn btn-outline-primary btn-sm">
                    <i class="fab fa-google"></i> Google
                </button>
                <button class="btn btn-outline-primary btn-sm">
                    <i class="fab fa-microsoft"></i> Microsoft
                </button>
            </div>
        </div>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        // Құпия сөзді көрсету/жасыру
        document.addEventListener('DOMContentLoaded', function() {
            const passwordInput = document.getElementById('password');
            const showPassword = document.createElement('button');
            showPassword.type = 'button';
            showPassword.className = 'btn btn-sm btn-outline-secondary position-absolute';
            showPassword.style.right = '10px';
            showPassword.style.top = '50%';
            showPassword.style.transform = 'translateY(-50%)';
            showPassword.innerHTML = '<i class="fas fa-eye"></i>';
            
            const parentDiv = passwordInput.parentElement;
            parentDiv.style.position = 'relative';
            parentDiv.appendChild(showPassword);
            
            showPassword.addEventListener('click', function() {
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
                this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
            });
        });
    </script>
</body>
</html>