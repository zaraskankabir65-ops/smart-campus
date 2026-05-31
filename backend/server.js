const express = require('express');
const cors = require('cors');
const app = express();

// CORS - барлық доменнен кіруге рұқсат
app.use(cors());

// Телефоннан келетін селфи суреттерінің көлемі үлкен болғандықтан, лимитті 50мб-қа көтердік
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

let students = []; // Сервер жадындағы уақытша база (массив)

// ============================================
// 1. ТІРКЕЛУ API (СТУДЕНТ)
// ============================================
app.post('/api/register', (req, res) => {
  const student = req.body;
  
  // Егер дәл осындай email бұрын тіркелсе, ескісін өшіріп, жаңасын жазамыз
  const existingIndex = students.findIndex(s => s.email === student.email);
  if (existingIndex !== -1) {
    students[existingIndex] = student;
    console.log(`Студент жаңартылды: ${student.fullName}`);
  } else {
    students.push(student);
    console.log(`Жаңа студент тіркелді: ${student.fullName}`);
  }
  
  res.status(201).json({ 
    message: "Студент серверге сәтті тіркелді!", 
    student,
    totalStudents: students.length
  });
});

// ============================================
// 2. БАРЛЫҚ СТУДЕНТТЕРДІ АЛУ API (Ұстаз панелі үшін)
// ============================================
app.get('/api/students', (req, res) => {
  res.json(students);
});

// ============================================
// 3. БІР СТУДЕНТТІ АЛУ API (EMAIL БОЙЫНША)
// ============================================
app.get('/api/students/:email', (req, res) => {
  const student = students.find(s => s.email === req.params.email);
  if (student) {
    res.json(student);
  } else {
    res.status(404).json({ error: "Студент табылмады" });
  }
});

// ============================================
// 4. СТУДЕНТТІ ӨШІРУ API
// ============================================
app.delete('/api/students/:email', (req, res) => {
  const email = req.params.email;
  const studentExists = students.some(s => s.email === email);
  
  if (studentExists) {
    students = students.filter(s => s.email !== email);
    console.log(`Студент өшірілді: ${email}`);
    res.json({ message: "Студент сәтті өшірілді!", totalStudents: students.length });
  } else {
    res.status(404).json({ error: "Студент табылмады" });
  }
});

// ============================================
// 5. АДМИН ЛОГИН API (Телефоннан немесе компьютерден кіру үшін)
// ============================================
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;

  // Өзіңізге ыңғайлы админ логин мен паролін осы жерге жазып қойыңыз
  // ҚАЛАУЫҢЫЗ БОЙЫНША ӨЗГЕРТЕ АЛАСЫЗ!
  if (email === 'admin@mail.ru' && password === 'admin123') {
    return res.status(200).json({ 
      message: "Админ жүйеге сәтті кірді!", 
      token: "mock-admin-token",
      role: "admin"
    });
  } else {
    return res.status(401).json({ 
      error: "Қате email немесе пароль!" 
    });
  }
});

// ============================================
// 6. СТУДЕНТ ЛОГИН API (Телефоннан кіру үшін)
// ============================================
app.post('/api/student/login', (req, res) => {
  const { email, password } = req.body;
  
  const student = students.find(s => s.email === email && s.password === password);
  
  if (student) {
    return res.status(200).json({ 
      message: "Студент сәтті кірді!", 
      student,
      token: "mock-student-token"
    });
  } else {
    return res.status(401).json({ 
      error: "Қате email немесе пароль! Немесе әлі тіркелмегенсіз." 
    });
  }
});

// ============================================
// 7. СТАТИСТИКА API (Барлық студенттер саны)
// ============================================
app.get('/api/stats', (req, res) => {
  const today = new Date().toDateString();
  const todayRegistered = students.filter(s => {
    const regDate = new Date(s.registeredAt).toDateString();
    return regDate === today;
  }).length;
  
  res.json({
    totalStudents: students.length,
    todayRegistered: todayRegistered,
    activeStudents: students.length
  });
});

// ============================================
// 8. СЕРВЕРДІ ІСКЕ ҚОСУ
// ============================================
const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`=========================================`);
  console.log(`🚀 Бэкенд сервер іске қосылды!`);
  console.log(`📡 Порт: ${PORT}`);
  console.log(`🔗 Жергілікті сілтеме: http://localhost:${PORT}`);
  console.log(`🌐 Желілік сілтеме: http://192.168.xxx.xxx:${PORT}`);
  console.log(`=========================================`);
  console.log(`📋 API ENDPOINTTER:`);
  console.log(`   POST   /api/register     - Студент тіркеу`);
  console.log(`   GET    /api/students     - Барлық студенттер`);
  console.log(`   GET    /api/students/:email - Бір студент`);
  console.log(`   DELETE /api/students/:email - Студент өшіру`);
  console.log(`   POST   /api/admin/login  - Админ кіру (admin@mail.ru / admin123)`);
  console.log(`   POST   /api/student/login - Студент кіру`);
  console.log(`   GET    /api/stats        - Статистика`);
  console.log(`=========================================`);
});