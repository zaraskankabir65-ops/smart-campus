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
    $data = [
        'username' => Functions::sanitize($_POST['username'] ?? ''),
        'email' => Functions::sanitize($_POST['email'] ?? ''),
        'password' => $_POST['password'] ?? '',
        'confirm_password' => $_POST['confirm_password'] ?? '',
        'full_name' => Functions::sanitize($_POST['full_name'] ?? ''),
        'phone' => Functions::sanitize($_POST['phone'] ?? ''),
        'role' => 'student' // Әдепкі студент ретінде тіркелу
    ];
    
    $csrf_token = $_POST['csrf_token'] ?? '';
    
    // CSRF токенін тексеру
    if (!Functions::verifyCSRFToken($csrf_token)) {
        $error = 'Жарамсыз токен. Өтініш, қайта тырысыңыз.';
    } else {
        // Тексерулер
        if (empty($data['username']) || empty($data['email']) || empty($data['password'])) {
            $error = 'Барлық міндетті өрістерді толтырыңыз';
        } elseif (!Functions::isValidEmail($data['email'])) {
            $error = 'Жарамсыз email мекенжайы';
        } elseif ($data['password'] !== $data['confirm_password']) {
            $error = 'Құпия сөздер сәйкес келмейді';
        } elseif (!Functions::isStrongPassword($data['password'])) {
            $error = 'Құпия сөз әлсіз. Кемінде 8 таңбадан тұруы, үлкен әріп, кіші әріп және сан болуы керек';
        } else {
            $auth = new Auth();
            $result = $auth->register($data);
            
            if ($result['success']) {
                Functions::setFlash('success', 'Тіркелу сәтті аяқталды! Сіз автоматты түрде жүйеге кірдіңіз.');
                Functions::redirect('dashboard/student/');
            } else {
                $error = $result['message'];
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="kk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Тіркелу - <?php echo SITE_NAME; ?></title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px 0;
        }
        .register-card {
            background: white;
            border-radius: 15px;
            padding: 40px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            width: 100%;
            max-width: 500px;
        }
        .logo {
            text-align: center;
            margin-bottom: 30px;
            font-size: 28px;
            font-weight: bold;
            color: #667eea;
        }
        .password-strength {
            height: 5px;
            margin-top: 5px;
            border-radius: 3px;
            transition: all 0.3s;
        }
        .strength-weak { background-color: #e74a3b; width: 25%; }
        .strength-medium { background-color: #f6c23e; width: 50%; }
        .strength-strong { background-color: #1cc88a; width: 100%; }
    </style>
</head>
<body>
    <div class="register-card">
        <div class="logo">
            <i class="fas fa-graduation-cap me-2"></i>🎓 <?php echo SITE_NAME; ?>
        </div>
        
        <?php if ($error): ?>
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                <?php echo htmlspecialchars($error); ?>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        <?php endif; ?>
        
        <form method="POST" action="">
            <input type="hidden" name="csrf_token" value="<?php echo Functions::generateCSRFToken(); ?>">
            
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label for="full_name" class="form-label">
                        <i class="fas fa-user me-1"></i> Толық аты-жөні
                    </label>
                    <input type="text" class="form-control" id="full_name" name="full_name" required
                           value="<?php echo htmlspecialchars($_POST['full_name'] ?? ''); ?>">
                </div>
                
                <div class="col-md-6 mb-3">
                    <label for="username" class="form-label">
                        <i class="fas fa-at me-1"></i> Пайдаланушы аты
                    </label>
                    <input type="text" class="form-control" id="username" name="username" required
                           value="<?php echo htmlspecialchars($_POST['username'] ?? ''); ?>">
                    <div class="form-text">Латын әріптері, сандар және _ белгісі</div>
                </div>
            </div>
            
            <div class="mb-3">
                <label for="email" class="form-label">
                    <i class="fas fa-envelope me-1"></i> Email
                </label>
                <input type="email" class="form-control" id="email" name="email" required
                       value="<?php echo htmlspecialchars($_POST['email'] ?? ''); ?>">
            </div>
            
            <div class="mb-3">
                <label for="phone" class="form-label">
                    <i class="fas fa-phone me-1"></i> Телефон нөмірі
                </label>
                <input type="tel" class="form-control" id="phone" name="phone"
                       value="<?php echo htmlspecialchars($_POST['phone'] ?? ''); ?>"
                       pattern="^(\+7|8)\d{10}$">
                <div class="form-text">Пішім: +7XXXXXXXXXX немесе 8XXXXXXXXXX</div>
            </div>
            
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label for="password" class="form-label">
                        <i class="fas fa-lock me-1"></i> Құпия сөз
                    </label>
                    <input type="password" class="form-control" id="password" name="password" required>
                    <div class="password-strength" id="passwordStrength"></div>
                    <div class="form-text" id="passwordHint">Кемінде 8 таңба, үлкен әріп, кіші әріп және сан</div>
                </div>
                
                <div class="col-md-6 mb-3">
                    <label for="confirm_password" class="form-label">
                        <i class="fas fa-lock me-1"></i> Құпия сөзді қайталау
                    </label>
                    <input type="password" class="form-control" id="confirm_password" name="confirm_password" required>
                    <div class="form-text" id="passwordMatch"></div>
                </div>
            </div>
            
            <div class="mb-3 form-check">
                <input type="checkbox" class="form-check-input" id="terms" name="terms" required>
                <label class="form-check-label" for="terms">
                    Мен <a href="#" class="text-decoration-none">қолдану шарттарын</a> оқыдым және келісемін
                </label>
            </div>
            
            <button type="submit" class="btn btn-primary w-100 py-2">
                <i class="fas fa-user-plus me-2"></i> Тіркелу
            </button>
            
            <div class="text-center mt-3">
                <p class="mb-0">
                    Тіркелгіңіз бар ма? 
                    <a href="login.php" class="text-decoration-none fw-bold">Кіру</a>
                </p>
                <p class="mt-2">
                    <a href="index.php" class="text-decoration-none">
                        <i class="fas fa-home me-1"></i> Басты бетке оралу
                    </a>
                </p>
            </div>
        </form>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        // Құпия сөз күшін тексеру
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirm_password');
        const strengthBar = document.getElementById('passwordStrength');
        const passwordHint = document.getElementById('passwordHint');
        const passwordMatch = document.getElementById('passwordMatch');
        
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            let strength = 0;
            
            if (password.length >= 8) strength++;
            if (/[A-Z]/.test(password)) strength++;
            if (/[a-z]/.test(password)) strength++;
            if (/[0-9]/.test(password)) strength++;
            if (/[^A-Za-z0-9]/.test(password)) strength++;
            
            // Күшті бағалау
            strengthBar.className = 'password-strength';
            if (password.length === 0) {
                strengthBar.style.width = '0%';
                passwordHint.textContent = 'Кемінде 8 таңба, үлкен әріп, кіші әріп және сан';
            } else if (strength <= 2) {
                strengthBar.classList.add('strength-weak');
                passwordHint.textContent = 'Әлсіз құпия сөз';
                passwordHint.style.color = '#e74a3b';
            } else if (strength <= 4) {
                strengthBar.classList.add('strength-medium');
                passwordHint.textContent = 'Орташа құпия сөз';
                passwordHint.style.color = '#f6c23e';
            } else {
                strengthBar.classList.add('strength-strong');
                passwordHint.textContent = 'Күшті құпия сөз ✓';
                passwordHint.style.color = '#1cc88a';
            }
            
            checkPasswordMatch();
        });
        
        // Құпия сөздердің сәйкестігін тексеру
        confirmPasswordInput.addEventListener('input', checkPasswordMatch);
        
        function checkPasswordMatch() {
            const password = passwordInput.value;
            const confirm = confirmPasswordInput.value;
            
            if (confirm.length === 0) {
                passwordMatch.textContent = 'Құпия сөзді қайталаңыз';
                passwordMatch.style.color = '#6c757d';
            } else if (password === confirm) {
                passwordMatch.innerHTML = '<i class="fas fa-check"></i> Құпия сөздер сәйкес келеді';
                passwordMatch.style.color = '#1cc88a';
            } else {
                passwordMatch.innerHTML = '<i class="fas fa-times"></i> Құпия сөздер сәйкес келмейді';
                passwordMatch.style.color = '#e74a3b';
            }
        }
        
        // Телефон нөмірін форматтау
        document.getElementById('phone').addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.startsWith('7') || value.startsWith('8')) {
                if (value.length > 11) value = value.substring(0, 11);
            } else {
                if (value.length > 10) value = value.substring(0, 10);
            }
            
            if (value.length >= 1) {
                if (value[0] === '7') {
                    value = '+7' + value.substring(1);
                } else if (value[0] === '8') {
                    value = '8' + value.substring(1);
                } else if (value.length >= 10) {
                    value = '+7' + value;
                }
            }
            
            e.target.value = value;
        });
    </script>
</body>
</html>