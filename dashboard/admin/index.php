<?php
require_once 'includes/config.php';

try {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS);
    
    if ($conn->connect_error) {
        die("MySQL серверіне қосылым қатесі: " . $conn->connect_error);
    }
    
    echo "<h2>SMART CAMPUS - Дерекқорды орнату</h2>";
    echo "<pre>";
    
    // Дерекқорды жасау
    $sql = "CREATE DATABASE IF NOT EXISTS " . DB_NAME . " CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci";
    if ($conn->query($sql) === TRUE) {
        echo "✓ Дерекқор '" . DB_NAME . "' жасалды\n";
    } else {
        echo "✗ Дерекқорды жасау қатесі: " . $conn->error . "\n";
    }
    
    $conn->select_db(DB_NAME);
    
    // 1. Пайдаланушылар кестесі
    $sql = "CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'teacher', 'student') DEFAULT 'student',
        full_name VARCHAR(100),
        phone VARCHAR(20),
        avatar VARCHAR(255),
        is_active BOOLEAN DEFAULT TRUE,
        last_login DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";
    
    if ($conn->query($sql) === TRUE) {
        echo "✓ 'users' кестесі жасалды\n";
    } else {
        echo "✗ 'users' кестесін жасау қатесі: " . $conn->error . "\n";
    }
    
    // 2. Пәндер кестесі
    $sql = "CREATE TABLE IF NOT EXISTS courses (
        id INT PRIMARY KEY AUTO_INCREMENT,
        course_code VARCHAR(20) UNIQUE NOT NULL,
        course_name VARCHAR(100) NOT NULL,
        description TEXT,
        credits INT DEFAULT 3,
        teacher_id INT,
        semester INT,
        academic_year VARCHAR(10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE SET NULL
    )";
    
    if ($conn->query($sql) === TRUE) {
        echo "✓ 'courses' кестесі жасалды\n";
    } else {
        echo "✗ 'courses' кестесін жасау қатесі: " . $conn->error . "\n";
    }
    
    // 3. Студент-пән байланысы
    $sql = "CREATE TABLE IF NOT EXISTS student_courses (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT,
        course_id INT,
        enrolled_date DATE,
        status ENUM('active', 'completed', 'dropped') DEFAULT 'active',
        grade DECIMAL(3,2),
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        UNIQUE KEY unique_enrollment (student_id, course_id)
    )";
    
    if ($conn->query($sql) === TRUE) {
        echo "✓ 'student_courses' кестесі жасалды\n";
    } else {
        echo "✗ 'student_courses' кестесін жасау қатесі: " . $conn->error . "\n";
    }
    
    // 4. Сабақ кестесі
    $sql = "CREATE TABLE IF NOT EXISTS schedule (
        id INT PRIMARY KEY AUTO_INCREMENT,
        course_id INT,
        day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'),
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        classroom VARCHAR(50),
        class_type ENUM('lecture', 'practice', 'lab', 'seminar') DEFAULT 'lecture',
        week_type ENUM('odd', 'even', 'all') DEFAULT 'all',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    )";
    
    if ($conn->query($sql) === TRUE) {
        echo "✓ 'schedule' кестесі жасалды\n";
    } else {
        echo "✗ 'schedule' кестесін жасау қатесі: " . $conn->error . "\n";
    }
    
    // 5. Тапсырмалар
    $sql = "CREATE TABLE IF NOT EXISTS assignments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        course_id INT,
        teacher_id INT,
        deadline DATETIME,
        max_score INT DEFAULT 100,
        file_path VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE SET NULL
    )";
    
    if ($conn->query($sql) === TRUE) {
        echo "✓ 'assignments' кестесі жасалды\n";
    } else {
        echo "✗ 'assignments' кестесін жасау қатесі: " . $conn->error . "\n";
    }
    
    // 6. Жіберілген тапсырмалар
    $sql = "CREATE TABLE IF NOT EXISTS assignment_submissions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        assignment_id INT,
        student_id INT,
        submitted_file VARCHAR(255),
        submission_text TEXT,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        score INT,
        feedback TEXT,
        status ENUM('submitted', 'graded', 'late') DEFAULT 'submitted',
        FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_submission (assignment_id, student_id)
    )";
    
    if ($conn->query($sql) === TRUE) {
        echo "✓ 'assignment_submissions' кестесі жасалды\n";
    } else {
        echo "✗ 'assignment_submissions' кестесін жасау қатесі: " . $conn->error . "\n";
    }
    
    // 7. Жатақхана бөлмелері
    $sql = "CREATE TABLE IF NOT EXISTS hostel_rooms (
        id INT PRIMARY KEY AUTO_INCREMENT,
        room_number VARCHAR(10) UNIQUE NOT NULL,
        floor INT,
        capacity INT DEFAULT 2,
        current_occupancy INT DEFAULT 0,
        type ENUM('standard', 'premium', 'suite') DEFAULT 'standard',
        price_per_month DECIMAL(10,2),
        amenities TEXT,
        is_available BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    
    if ($conn->query($sql) === TRUE) {
        echo "✓ 'hostel_rooms' кестесі жасалды\n";
    } else {
        echo "✗ 'hostel_rooms' кестесін жасау қатесі: " . $conn->error . "\n";
    }
    
    // 8. Жатақхана тіркеулері
    $sql = "CREATE TABLE IF NOT EXISTS hostel_allocations (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT,
        room_id INT,
        check_in_date DATE,
        check_out_date DATE,
        monthly_fee DECIMAL(10,2),
        payment_status ENUM('paid', 'pending', 'overdue') DEFAULT 'pending',
        status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (room_id) REFERENCES hostel_rooms(id) ON DELETE RESTRICT,
        UNIQUE KEY unique_allocation (student_id, room_id, status)
    )";
    
    if ($conn->query($sql) === TRUE) {
        echo "✓ 'hostel_allocations' кестесі жасалды\n";
    } else {
        echo "✗ 'hostel_allocations' кестесін жасау қатесі: " . $conn->error . "\n";
    }
    
    // 9. Өтініштер (Tickets)
    $sql = "CREATE TABLE IF NOT EXISTS tickets (
        id INT PRIMARY KEY AUTO_INCREMENT,
        ticket_number VARCHAR(20) UNIQUE,
        student_id INT,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        category ENUM('document', 'problem', 'request', 'other') DEFAULT 'request',
        priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
        status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
        assigned_to INT,
        admin_response TEXT,
        resolution_date DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
    )";
    
    if ($conn->query($sql) === TRUE) {
        echo "✓ 'tickets' кестесі жасалды\n";
    } else {
        echo "✗ 'tickets' кестесін жасау қатесі: " . $conn->error . "\n";
    }
    
    // 10. Хабарландырулар
    $sql = "CREATE TABLE IF NOT EXISTS notifications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(200) NOT NULL,
        content TEXT,
        type ENUM('info', 'warning', 'success', 'danger') DEFAULT 'info',
        target_roles JSON,
        is_active BOOLEAN DEFAULT TRUE,
        start_date DATE,
        end_date DATE,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    )";
    
    if ($conn->query($sql) === TRUE) {
        echo "✓ 'notifications' кестесі жасалды\n";
    } else {
        echo "✗ 'notifications' кестесін жасау қатесі: " . $conn->error . "\n";
    }
    
    // 11. Хабарландыруларды оқу
    $sql = "CREATE TABLE IF NOT EXISTS notification_reads (
        id INT PRIMARY KEY AUTO_INCREMENT,
        notification_id INT,
        user_id INT,
        read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_notification_read (notification_id, user_id)
    )";
    
    if ($conn->query($sql) === TRUE) {
        echo "✓ 'notification_reads' кестесі жасалды\n";
    } else {
        echo "✗ 'notification_reads' кестесін жасау қатесі: " . $conn->error . "\n";
    }
    
    // 12. Хабарламалар
    $sql = "CREATE TABLE IF NOT EXISTS messages (
        id INT PRIMARY KEY AUTO_INCREMENT,
        sender_id INT,
        receiver_id INT,
        message TEXT,
        is_read BOOLEAN DEFAULT FALSE,
        read_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
    )";
    
    if ($conn->query($sql) === TRUE) {
        echo "✓ 'messages' кестесі жасалды\n";
    } else {
        echo "✗ 'messages' кестесін жасау қатесі: " . $conn->error . "\n";
    }
    
    // 13. Аттестациялар
    $sql = "CREATE TABLE IF NOT EXISTS grades (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT,
        course_id INT,
        assignment_id INT,
        score DECIMAL(5,2),
        grade_point DECIMAL(3,2),
        letter_grade VARCHAR(2),
        semester VARCHAR(20),
        academic_year VARCHAR(10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE SET NULL
    )";
    
    if ($conn->query($sql) === TRUE) {
        echo "✓ 'grades' кестесі жасалды\n";
    } else {
        echo "✗ 'grades' кестесін жасау қатесі: " . $conn->error . "\n";
    }
    
    // Әдепкі деректерді енгізу
    echo "\n--- Әдепкі деректерді енгізу ---\n";
    
    // Әкімші құру
    $adminPassword = password_hash('admin123', PASSWORD_DEFAULT);
    $sql = "INSERT INTO users (username, email, password, full_name, role, phone) VALUES
            ('admin', 'admin@campus.kz', '$adminPassword', 'Басты Әкімші', 'admin', '+77001234567'),
            ('teacher1', 'teacher@campus.kz', '$adminPassword', 'Құрметті Мұғалім', 'teacher', '+77001234568'),
            ('student1', 'student@campus.kz', '$adminPassword', 'Өнерпаз Студент', 'student', '+77001234569')
            ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP";
    
    if ($conn->query($sql) === TRUE) {
        echo "✓ Әдепкі пайдаланушылар құрылды\n";
        echo "   Админ: admin / admin123\n";
        echo "   Мұғалім: teacher1 / admin123\n";
        echo "   Студент: student1 / admin123\n";
    } else {
        echo "✗ Пайдаланушыларды құру қатесі: " . $conn->error . "\n";
    }
    
    // Пәндерді құру
    $sql = "INSERT INTO courses (course_code, course_name, description, credits, teacher_id) VALUES
            ('MATH101', 'Математика', 'Жоғары математика негіздері', 4, 2),
            ('PHYS201', 'Физика', 'Физика негіздері', 3, 2),
            ('CS301', 'Бағдарламалау', 'PHP және MySQL', 5, 2),
            ('ENG102', 'Ағылшын тілі', 'Ағылшын тілінің негіздері', 3, 2)
            ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP";
    
    if ($conn->query($sql) === TRUE) {
        echo "✓ Әдепкі пәндер құрылды\n";
    } else {
        echo "✗ Пәндерді құру қатесі: " . $conn->error . "\n";
    }
    
    // Студентті пәндерге тіркеу
    $sql = "INSERT INTO student_courses (student_id, course_id, enrolled_date) VALUES
            (3, 1, '2024-01-01'),
            (3, 2, '2024-01-01'),
            (3, 3, '2024-01-01')
            ON DUPLICATE KEY UPDATE status = 'active'";
    
    if ($conn->query($sql) === TRUE) {
        echo "✓ Студент пәндерге тіркелді\n";
    } else {
        echo "✗ Тіркеу қатесі: " . $conn->error . "\n";
    }
    
    // Сабақ кестесі
    $sql = "INSERT INTO schedule (course_id, day_of_week, start_time, end_time, classroom, class_type) VALUES
            (1, 'Monday', '09:00:00', '10:30:00', '305', 'lecture'),
            (1, 'Wednesday', '09:00:00', '10:30:00', '305', 'practice'),
            (2, 'Tuesday', '11:00:00', '12:30:00', '402', 'lecture'),
            (3, 'Thursday', '14:00:00', '15:30:00', '101', 'lab')
            ON DUPLICATE KEY UPDATE classroom = VALUES(classroom)";
    
    if ($conn->query($sql) === TRUE) {
        echo "✓ Әдепкі сабақ кестесі құрылды\n";
    } else {
        echo "✗ Сабақ кестесін құру қатесі: " . $conn->error . "\n";
    }
    
    // Жатақхана бөлмелері
    $sql = "INSERT INTO hostel_rooms (room_number, floor, capacity, type, price_per_month, is_available) VALUES
            ('101', 1, 2, 'standard', 15000.00, true),
            ('102', 1, 2, 'standard', 15000.00, true),
            ('201', 2, 2, 'standard', 15000.00, false),
            ('202', 2, 2, 'standard', 15000.00, true),
            ('301', 3, 1, 'premium', 25000.00, true)
            ON DUPLICATE KEY UPDATE is_available = VALUES(is_available)";
    
    if ($conn->query($sql) === TRUE) {
        echo "✓ Жатақхана бөлмелері құрылды\n";
    } else {
        echo "✗ Бөлмелерді құру қатесі: " . $conn->error . "\n";
    }
    
    // Студентті жатақханаға бөлу
    $sql = "INSERT INTO hostel_allocations (student_id, room_id, check_in_date, monthly_fee, status) VALUES
            (3, 3, '2024-01-01', 15000.00, 'active')
            ON DUPLICATE KEY UPDATE status = 'active'";
    
    if ($conn->query($sql) === TRUE) {
        echo "✓ Студент жатақханаға бөлінді\n";
    } else {
        echo "✗ Бөлу қатесі: " . $conn->error . "\n";
    }
    
    // Өтініштер
    $sql = "INSERT INTO tickets (ticket_number, student_id, title, description, category, status) VALUES
            ('TKT-20240001', 3, 'Справка сұрауы', 'Оқу ақысы туралы справка қажет', 'document', 'open'),
            ('TKT-20240002', 3, 'Интернет проблемасы', 'Жатақханада интернет жұмыс істемейді', 'problem', 'in_progress')
            ON DUPLICATE KEY UPDATE status = VALUES(status)";
    
    if ($conn->query($sql) === TRUE) {
        echo "✓ Әдепкі өтініштер құрылды\n";
    } else {
        echo "✗ Өтініштерді құру қатесі: " . $conn->error . "\n";
    }
    
    // Хабарландырулар
    $sql = "INSERT INTO notifications (title, content, type, target_roles, is_active) VALUES
            ('Жүйеге қош келдіңіз', 'SMART CAMPUS жүйесіне қош келдіңіз!', 'info', '[\"student\", \"teacher\", \"admin\"]', true),
            ('Төлем мерзімі', 'Алдын-ала төлем мерзімі жақындап қалды', 'warning', '[\"student\"]', true),
            ('Жаңарту туралы', 'Жүйе жаңартылды. Жаңа мүмкіндіктер қосылды.', 'success', '[\"student\", \"teacher\", \"admin\"]', true)
            ON DUPLICATE KEY UPDATE is_active = VALUES(is_active)";
    
    if ($conn->query($sql) === TRUE) {
        echo "✓ Әдепкі хабарландырулар құрылды\n";
    } else {
        echo "✗ Хабарландыруларды құру қатесі: " . $conn->error . "\n";
    }
    
    echo "\n--- Орнату аяқталды ---\n";
    echo "\nКелесі қадамдар:\n";
    echo "1. install.php файлын жойыңыз\n";
    echo "2. Басты бетке өтіңіз: http://localhost/smart-campus/\n";
    echo "3. Админ ретінде кіріңіз: admin / admin123\n";
    
    $conn->close();
    
} catch (Exception $e) {
    echo "Қате: " . $e->getMessage();
}
?>