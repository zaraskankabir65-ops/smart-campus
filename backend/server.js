const express = require('express');
const cors = require('cors');
const app = express();

// CORS - барлық доменнен кіруге рұқсат
app.use(cors());

// Телефоннан келетін селфи суреттерінің көлемі үлкен болғандықтан, лимитті 50мб-қа көтердік
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Басты бет (Сервердің істеп тұрғанын тексеру)
app.get('/', (req, res) => {
  res.send('🚀 Smart Campus сервері іске қосылды және жұмыс істеп тұр!');
});

let students = []; 

// 1. ТІРКЕЛУ API
app.post('/api/register', (req, res) => {
  const student = req.body;
  const existingIndex = students.findIndex(s => s.email === student.email);
  if (existingIndex !== -1) {
    students[existingIndex] = student;
  } else {
    students.push(student);
  }
  res.status(201).json({ message: "Студент тіркелді!", student });
});

// 2. БАРЛЫҚ СТУДЕНТТЕРДІ АЛУ
app.get('/api/students', (req, res) => {
  res.json(students);
});

// 3. БІР СТУДЕНТТІ АЛУ
app.get('/api/students/:email', (req, res) => {
  const student = students.find(s => s.email === req.params.email);
  student ? res.json(student) : res.status(404).json({ error: "Табылмады" });
});

// 4. СТУДЕНТТІ ӨШІРУ
app.delete('/api/students/:email', (req, res) => {
  students = students.filter(s => s.email !== req.params.email);
  res.json({ message: "Өшірілді" });
});

// 5. АДМИН ЛОГИН
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'admin@mail.ru' && password === 'admin123') {
    return res.status(200).json({ message: "Кірдіңіз", role: "admin" });
  }
  res.status(401).json({ error: "Қате пароль!" });
});

// 6. СТУДЕНТ ЛОГИН
app.post('/api/student/login', (req, res) => {
  const { email, password } = req.body;
  const student = students.find(s => s.email === email && s.password === password);
  student ? res.status(200).json({ student }) : res.status(401).json({ error: "Қате!" });
});

// 7. СТАТИСТИКА
app.get('/api/stats', (req, res) => {
  res.json({ totalStudents: students.length });
});

// 8. СЕРВЕРДІ ІСКЕ ҚОСУ
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Сервер ${PORT} портында іске қосылды!`);
});