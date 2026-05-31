# Smart Campus: Premium Attendance System 🎓

Премиум деңгейдегі attendance жүйесі - React, FastAPI, SQLite бөлінісімен құрылған.

## 🚀 Ерекшеліктер

✅ **Light/Dark Mode** - Жылы ақшыл (Warm Cream) және Midnight Dark режимі
✅ **Fully Responsive** - Мобиль, планшет, компьютерде мінсіз
✅ **Real-time KPI Dashboard** - Онлайн/офлайн статистика
✅ **Премиум QR-код** - Шеңбер таймері, логотипі бар
✅ **Автоматты Қолданушы** - Бэкенд қосылғанда автоматты регистрация
✅ **JWT Authentication** - Қауіпсіз токен-негіздегі аутентификация

## 📋 Дайын Қолданушы

```
Email: student@gmail.com
Password: Wiliwonka2954
Role: Student
```

## 🔧 Орындау

### Backend Құру

```bash
cd backend
pip install -r requirements.txt
python main.py
```

Backend `http://localhost:8000` орындалады

### Frontend Құру

```bash
cd frontend
npm install
npm run dev
```

Frontend `http://localhost:5173` орындалады

## 📁 Файл Құрылымы

```
smart-campus/
├── backend/
│   ├── main.py              # FastAPI орындау
│   ├── database.py          # SQLite қосылымы
│   ├── models.py            # ORM моделі
│   ├── schemas.py           # Pydantic схемалары
│   ├── requirements.txt      # Python зависимостері
│   └── .env                 # Конфигурация
│
└── frontend/
    ├── src/
    │   ├── App.jsx          # Негіздегі React компоненті
    │   ├── main.jsx         # Орындау нүктесі
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   └── DashboardPage.jsx
    │   ├── components/
    │   │   └── ThemeToggle.jsx
    │   └── styles/
    │       └── index.css
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```

## 🎨 Түс Схемасы

- **Light Mode**: Warm Cream (#FAF8F3) + Cream (#FFF4E6)
- **Dark Mode**: Midnight Dark (#0F1419) + Gray

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Логин
- `POST /api/auth/logout` - Логаут

### Attendance
- `POST /api/attendance/check-in` - Кірісі
- `POST /api/attendance/check-out` - Шығысы
- `GET /api/attendance/records` - Барлық рекордтар

### Dashboard
- `GET /api/dashboard/stats` - Real-time статистика
- `GET /api/dashboard/online-students` - Онлайнда тұрғандар

### User
- `GET /api/users/me` - Өз профилі
- `PUT /api/users/me` - Профиль өңдеу
- `GET /api/users` - Барлық қолданушылар (Admin)

## 🌐 Мобильді Дизайн

- Bottom Navigation - Мобильде қол салмасын растау
- Responsive Grid - md:, lg: breakpoints
- Touch-friendly UI - Батырмалар қонды екі сәтте басылмаған

## 🔄 Real-time Статистика

Dashboard әр 5 секундта автоматты жаңартылады:
- Онлайн студенттер саны
- Офлайн студенттер саны
- Бүгіндегі регистрация пайызы

## 🎯 Премиум QR-код Ерекшеліктері

1. Шеңбер ротациясы
2. Ортасында "SC" логотипі
3. 30 секундтың қозғалмалы таймері (шеңбер)
4. Автоматты қалпына келтіру

## 🚀 Өндіктеу

```bash
# Frontend Build
cd frontend
npm run build

# Backend Deploy
# Үйінді хост ортасы өлшеп (например, gunicorn, systemd)
# PRODUCTION=True SECRET_KEY=your-real-key uvicorn main:app --host 0.0.0.0
```

## 📞 Техникалық Қолдау

Қандай да болмасын сұрақ немесе қатесі болса, GitHub Issues ашыңыз.

---

**Құрастырылған**: 2026 жыл  
**ZROBIM Architects Стиль** ✨
