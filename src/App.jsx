import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Беттерді импорттау
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboardPage from './pages/StudentDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Қолданушыны тексеру
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('accessToken');
      const user = localStorage.getItem('activeUser');
      
      if (token && user) {
        try {
          setCurrentUser(JSON.parse(user));
        } catch (e) {
          console.error('Қолданушыны оқу қатесі:', e);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  // Шығу функциясы
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('activeUser');
    setCurrentUser(null);
  };

  // Кіру сәтті болғанда
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <Toaster position="top-right" />
      
      <Routes>
        {/* Логин беті */}
        <Route 
          path="/login" 
          element={
            currentUser ? (
              <Navigate to={currentUser.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />
            ) : (
              <LoginPage onLoginSuccess={handleLoginSuccess} />
            )
          } 
        />
        
        {/* Тіркелу беті */}
        <Route 
          path="/register" 
          element={
            currentUser ? (
              <Navigate to={currentUser.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />
            ) : (
              <RegisterPage />
            )
          } 
        />
        
        {/* Студент дашборды */}
        <Route 
          path="/student/dashboard" 
          element={
            currentUser && currentUser.role === 'student' ? (
              <StudentDashboardPage currentUser={currentUser} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        
        {/* Админ дашборды */}
        <Route 
          path="/admin/dashboard" 
          element={
            currentUser && currentUser.role === 'admin' ? (
              <AdminDashboardPage currentUser={currentUser} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        
        {/* Басқа барлық жолдар логинге бағыттайды */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;