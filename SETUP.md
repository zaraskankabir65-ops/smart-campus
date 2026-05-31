# Setup Guide - Smart Campus Premium 🎓

## ⚡ Бұрын Қосылғанда:

### 1. Backend Қосылмасын

```bash
# Backend папкасына орын ауыстыру
cd smart-campus/backend

# Python зависимостерін орнату
pip install -r requirements.txt

# Бэкенд сервисін өндіктету
python main.py
```

**Нәтиже**: `http://localhost:8000` іске қосылады
- API docs: `http://localhost:8000/docs`
- Дайын қолданушы автоматты құрылады ✅

### 2. Frontend Қосылмасын

Басқа терминалда:

```bash
# Frontend папкасына орын ауыстыру
cd smart-campus/frontend

# Node.js зависимостерін орнату
npm install

# Development сервері өндіктету
npm run dev
```

**Нәтиже**: `http://localhost:5173` іске қосылады

## 🔑 Қалыпты Логин

```
Email:    student@gmail.com
Password: Wiliwonka2954
```

## 📱 Функциялар Тексеру

1. ✅ **Light/Dark Mode** - Жоғарыда оң жақ батырмасын басыңыз
2. ✅ **Мобильді дизайн** - Browser DevTools-та `Ctrl+Shift+M` басыңыз
3. ✅ **Real-time КПИ** - Online/Offline студенттер санын көрерсіңіз
4. ✅ **QR Кодт** - Таймер әрі шеңбер ротациясын көрерсіңіз
5. ✅ **Check-In** - "Check In" батырмасын басыңыз

## 🐛 Құйпасындағы Қатедерімі:

```bash
# 1. Портты бөлу барлығын тексеру
# Port 8000 (Backend) және 5173 (Frontend)
# Windows: netstat -ano | findstr LISTENING

# 2. Зависимостер орнатылды ма тексеру
pip list | grep fastapi      # Backend қай болса
npm list react                # Frontend қай болса

# 3. Database құрылды ма?
# backend/database.db файлы болу керек
```

## 🎉 Әзірлеу!

Енді `http://localhost:5173` орындап, логин жасаңыз!

---
**Автор**: ZROBIM Architects  
**Түрі**: Premium Attendance System  
**Статусы**: ✅ Ready to Launch
