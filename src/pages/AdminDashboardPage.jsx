import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  QrCode, Users, Settings, LogOut, Calendar, Moon, Sun,
  Plus, Trash2, Edit, Save, X, UserPlus, Search, UsersRound,
  Maximize2, Minimize2
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";

const API_URL = 'http://192.168.123.9:3001';

export default function AdminDashboardPage({ currentUser, onLogout }) {
  const navigate = useNavigate();
  
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });
  
  const [activeTab, setActiveTab] = useState("students");
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [qrSize, setQrSize] = useState(300);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Сабақ кестесі
  const [schedule, setSchedule] = useState([
    { id: 1, day: "Дүйсенбі", time: "09:00-10:30", subject: "Веб-бағдарламалау", teacher: "А.Б. Жұмабаев", room: "206" },
    { id: 2, day: "Дүйсенбі", time: "10:45-12:15", subject: "Дерекқор", teacher: "М.С. Нұрлан", room: "208" },
    { id: 3, day: "Сейсенбі", time: "09:00-10:30", subject: "Желілер", teacher: "Р.Т. Аман", room: "210" },
    { id: 4, day: "Сейсенбі", time: "10:45-12:15", subject: "Киберқауіпсіздік", teacher: "А.М. Серік", room: "212" },
    { id: 5, day: "Сәрсенбі", time: "09:00-10:30", subject: "Java", teacher: "Д.К. Ерлан", room: "205" },
    { id: 6, day: "Сәрсенбі", time: "10:45-12:15", subject: "Python", teacher: "Н.Ж. Айгүл", room: "207" },
    { id: 7, day: "Бейсенбі", time: "09:00-10:30", subject: "Мобильді қосымша", teacher: "Б.Р. Дастан", room: "209" },
    { id: 8, day: "Бейсенбі", time: "10:45-12:15", subject: "UI/UX дизайн", teacher: "Ж.А. Аружан", room: "211" },
    { id: 9, day: "Жұма", time: "09:00-10:30", subject: "Startup", teacher: "Т.Қ. Бауыржан", room: "203" },
  ]);
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [newScheduleItem, setNewScheduleItem] = useState({ day: "", time: "", subject: "", teacher: "", room: "" });
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudent, setNewStudent] = useState({ fullName: "", email: "", password: "" });

  // Студенттерді жүктеу
  const loadStudents = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/students`);
      setStudents(response.data || []);
      console.log("Жүктелген студенттер саны:", response.data?.length || 0);
    } catch (error) {
      console.warn("JSON Server қосылмаған, LocalStorage тексерілуде...");
      const users = JSON.parse(localStorage.getItem("campus_users") || "[]");
      const studentList = users.filter(u => u.role === "student");
      setStudents(studentList);
    }
  };

  useEffect(() => {
    loadStudents();
    const interval = setInterval(loadStudents, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
      setQrSize(500);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
      setQrSize(300);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
        setQrSize(300);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleDarkMode = () => setDarkMode(!darkMode);
  const totalStudents = students.length;

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("activeUser");
      navigate("/login");
    }
    toast.success("Сәтті шықтыңыз");
  };

  const qrUrl = `http://${window.location.hostname}:5173/register`;

  const handleAddStudent = async () => {
    if (!newStudent.fullName || !newStudent.email || !newStudent.password) {
      toast.error("Барлық өрістерді толтырыңыз!");
      return;
    }
    
    const student = {
      id: Date.now(),
      ...newStudent,
      role: "student",
      faceImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=60",
      registeredAt: new Date().toISOString(),
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=60"
    };
    
    try {
      await axios.post(`${API_URL}/api/students`, student);
      loadStudents();
      toast.success("Студент сәтті қосылды!");
    } catch (error) {
      // localStorage-ға сақтау
      const users = JSON.parse(localStorage.getItem("campus_users") || "[]");
      users.push(student);
      localStorage.setItem("campus_users", JSON.stringify(users));
      loadStudents();
      toast.success("Студент локальды жадыға қосылды!");
    }
    
    setNewStudent({ fullName: "", email: "", password: "" });
    setShowAddStudent(false);
  };

  const handleDeleteStudent = async (email) => {
    const userToDelete = students.find(s => s.email === email);
    if (userToDelete) {
      try {
        await axios.delete(`${API_URL}/api/students/${userToDelete.id}`);
        loadStudents();
        toast.success("Студент өшірілді!");
      } catch (error) {
        // localStorage-дан өшіру
        const users = JSON.parse(localStorage.getItem("campus_users") || "[]");
        const filtered = users.filter(u => u.email !== email);
        localStorage.setItem("campus_users", JSON.stringify(filtered));
        loadStudents();
        toast.success("Студент локальды жадыдан өшірілді!");
      }
    }
  };

  const filteredStudents = students.filter(s => 
    s.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSchedule = () => {
    if (!newScheduleItem.day || !newScheduleItem.time || !newScheduleItem.subject) {
      toast.error("Күн, уақыт және пән міндетті!");
      return;
    }
    const newId = Math.max(...schedule.map(s => s.id), 0) + 1;
    setSchedule([...schedule, { ...newScheduleItem, id: newId }]);
    setNewScheduleItem({ day: "", time: "", subject: "", teacher: "", room: "" });
    setShowAddSchedule(false);
    toast.success("Сабақ кестеге қосылды!");
  };

  const handleDeleteSchedule = (id) => {
    setSchedule(schedule.filter(s => s.id !== id));
    toast.success("Сабақ өшірілді!");
  };

  const handleEditSchedule = (item) => setEditingSchedule(item);
  const handleSaveEdit = () => {
    setSchedule(schedule.map(s => s.id === editingSchedule.id ? editingSchedule : s));
    setEditingSchedule(null);
    toast.success("Сабақ өңделді!");
  };

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <Toaster position="top-right" />

      {/* Dark Mode Toggle */}
      <button
        onClick={toggleDarkMode}
        className="fixed top-4 right-4 z-50 p-2 rounded-full bg-white dark:bg-slate-800 shadow-md border hover:scale-110 transition-all"
      >
        {darkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-slate-700" />}
      </button>

      {/* Sidebar - Сол жақ мәзір */}
      <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 p-6 flex flex-col justify-between shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="p-2 bg-amber-500 rounded-xl text-white shadow-md shadow-amber-500/20">
              <QrCode className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-wide text-slate-900 dark:text-white">Smart Campus</span>
          </div>

          <nav className="space-y-2">
            <button 
              onClick={() => setActiveTab("students")} 
              className={`w-full flex items-center gap-3 px-4 py-3 font-medium rounded-xl transition-all ${
                activeTab === "students" 
                  ? "bg-amber-500 text-white shadow-md shadow-amber-500/10" 
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-amber-600 dark:hover:text-amber-500"
              }`}
            >
              <Users className="w-5 h-5" /> Студенттер
            </button>
            <button 
              onClick={() => setActiveTab("qr")} 
              className={`w-full flex items-center gap-3 px-4 py-3 font-medium rounded-xl transition-all ${
                activeTab === "qr" 
                  ? "bg-amber-500 text-white shadow-md shadow-amber-500/10" 
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-amber-600 dark:hover:text-amber-500"
              }`}
            >
              <QrCode className="w-5 h-5" /> QR Бөлімі
            </button>
            <button 
              onClick={() => setActiveTab("schedule")} 
              className={`w-full flex items-center gap-3 px-4 py-3 font-medium rounded-xl transition-all ${
                activeTab === "schedule" 
                  ? "bg-amber-500 text-white shadow-md shadow-amber-500/10" 
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-amber-600 dark:hover:text-amber-500"
              }`}
            >
              <Calendar className="w-5 h-5" /> Сабақ кестесі
            </button>
            <button 
              onClick={() => setActiveTab("settings")} 
              className={`w-full flex items-center gap-3 px-4 py-3 font-medium rounded-xl transition-all ${
                activeTab === "settings" 
                  ? "bg-amber-500 text-white shadow-md shadow-amber-500/10" 
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-amber-600 dark:hover:text-amber-500"
              }`}
            >
              <Settings className="w-5 h-5" /> Баптаулар
            </button>
          </nav>
        </div>

        <button 
          onClick={handleLogoutClick} 
          className="flex items-center gap-3 px-4 py-3 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-medium rounded-xl transition-all mt-auto w-full"
        >
          <LogOut className="w-5 h-5" /> Шығу
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        
        {/* Студенттер бөлімі */}
        {activeTab === "students" && (
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Студенттер базасы</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Жүйеге тіркелген барлық студенттер</p>
              </div>
              
              {/* Статистика картасы */}
              <div className="bg-white dark:bg-slate-800 px-6 py-3 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4">
                <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
                  <UsersRound size={24} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-amber-500">{totalStudents}</div>
                  <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Барлық студенттер</div>
                </div>
              </div>
            </div>

            {/* Қосу кнопкасы */}
            <div className="mb-6 flex justify-between items-center">
              <div className="relative max-w-md flex-1">
                <Search className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Студент атымен немесе Email арқылы іздеу..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400" 
                />
              </div>
              <button 
                onClick={() => setShowAddStudent(true)} 
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl flex items-center gap-2 transition-all shadow-md shadow-amber-500/20"
              >
                <UserPlus className="w-4 h-4" /> Жаңа студент
              </button>
            </div>

            {/* Студенттер кестесі */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                      <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Бет бейнесі</th>
                      <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Студент аты-жөні</th>
                      <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Электрондық пошта</th>
                      <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Тіркелген уақыты</th>
                      <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Әрекет</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((student, index) => (
                        <tr key={index} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                          <td className="p-4">
                            <img 
                              src={student.faceImage || student.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=60"} 
                              alt="Face" 
                              className="w-12 h-12 rounded-full object-cover border-2 border-amber-400 shadow-sm" 
                            />
                          </td>
                          <td className="p-4 font-bold text-slate-800 dark:text-white">{student.fullName}</td>
                          <td className="p-4 text-slate-500 dark:text-slate-400">{student.email}</td>
                          <td className="p-4 text-slate-500 dark:text-slate-400">
                            <span className="px-3 py-1 bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400 rounded-full text-xs font-bold">
                              {new Date(student.registeredAt).toLocaleDateString() || "Жақында"}
                            </span>
                          </td>
                          <td className="p-4">
                            <button 
                              onClick={() => handleDeleteStudent(student.email)} 
                              className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="p-8 text-center text-slate-400 dark:text-slate-500 font-medium">
                          Серверде әлі ешқандай студент тіркелмеді. Телефоннан тіркеліп көріңіз!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Жаңа студент қосу модалы */}
            {showAddStudent && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddStudent(false)}>
                <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Жаңа студент қосу</h2>
                    <button onClick={() => setShowAddStudent(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                      <X className="w-5 h-5 text-slate-500" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <input 
                      type="text" 
                      placeholder="Аты-жөні" 
                      value={newStudent.fullName} 
                      onChange={(e) => setNewStudent({...newStudent, fullName: e.target.value})} 
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                    <input 
                      type="email" 
                      placeholder="Email" 
                      value={newStudent.email} 
                      onChange={(e) => setNewStudent({...newStudent, email: e.target.value})} 
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                    <input 
                      type="password" 
                      placeholder="Пароль" 
                      value={newStudent.password} 
                      onChange={(e) => setNewStudent({...newStudent, password: e.target.value})} 
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                    <button 
                      onClick={handleAddStudent} 
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all shadow-md shadow-amber-500/20"
                    >
                      Қосу
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* QR Бөлімі */}
        {activeTab === "qr" && (
          <div>
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Ұстаз панелі</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Студенттерге экрандағы QR кодты көрсетіңіз</p>
            </div>

            <div className="flex flex-col items-center justify-center bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 mb-8">
              <div className="flex justify-end w-full mb-4">
                <button
                  onClick={toggleFullscreen}
                  className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 hover:bg-amber-200 transition-all"
                  title={isFullscreen ? "Кішірейту" : "Толық экран"}
                >
                  {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </button>
              </div>
              
              <span className="text-sm font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-4 py-1.5 rounded-full mb-6">
                📸 Тіркелу үшін сканерлеңіз
              </span>
              
              <div className="bg-white rounded-2xl shadow-2xl p-4 transition-all duration-300">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(qrUrl)}`} 
                  alt="QR Code" 
                  className="rounded-xl mx-auto transition-all duration-300"
                  style={{ width: qrSize, height: qrSize }}
                />
              </div>
              
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-6 text-center max-w-md">
                Студенттер өз телефондары арқылы осы кодты сканерлеп, тіркеледі
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl shadow-md p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-100 text-xs font-medium">Барлық студенттер</p>
                    <p className="text-2xl font-bold mt-1">{totalStudents}</p>
                  </div>
                  <div className="bg-white/20 p-2 rounded-full">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl shadow-md p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-100 text-xs font-medium">Бүгінгі кіргендер</p>
                    <p className="text-2xl font-bold mt-1">
                      {students.filter(s => {
                        const today = new Date().toDateString();
                        const regDate = new Date(s.registeredAt).toDateString();
                        return regDate === today;
                      }).length}
                    </p>
                  </div>
                  <div className="bg-white/20 p-2 rounded-full">
                    <UserPlus className="w-5 h-5" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl shadow-md p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-100 text-xs font-medium">Белсенді студенттер</p>
                    <p className="text-2xl font-bold mt-1">{students.length}</p>
                  </div>
                  <div className="bg-white/20 p-2 rounded-full">
                    <UsersRound className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Сабақ кестесі бөлімі */}
        {activeTab === "schedule" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Сабақ кестесі</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Апталық сабақ кестесі</p>
              </div>
              <button 
                onClick={() => setShowAddSchedule(true)} 
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl flex items-center gap-2 transition-all shadow-md shadow-amber-500/20"
              >
                <Plus className="w-4 h-4" /> Сабақ қосу
              </button>
            </div>

            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-md">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                    <tr>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Күн</th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Уақыт</th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Пән</th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Оқытушы</th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Аудитория</th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Әрекет</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {schedule.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                        {editingSchedule?.id === item.id ? (
                          <>
                            <td className="px-6 py-3"><input value={editingSchedule.day} onChange={(e) => setEditingSchedule({...editingSchedule, day: e.target.value})} className="px-2 py-1 border rounded w-24" /></td>
                            <td className="px-6 py-3"><input value={editingSchedule.time} onChange={(e) => setEditingSchedule({...editingSchedule, time: e.target.value})} className="px-2 py-1 border rounded w-28" /></td>
                            <td className="px-6 py-3"><input value={editingSchedule.subject} onChange={(e) => setEditingSchedule({...editingSchedule, subject: e.target.value})} className="px-2 py-1 border rounded" /></td>
                            <td className="px-6 py-3"><input value={editingSchedule.teacher} onChange={(e) => setEditingSchedule({...editingSchedule, teacher: e.target.value})} className="px-2 py-1 border rounded" /></td>
                            <td className="px-6 py-3"><input value={editingSchedule.room} onChange={(e) => setEditingSchedule({...editingSchedule, room: e.target.value})} className="px-2 py-1 border rounded w-16" /></td>
                            <td className="px-6 py-3 flex gap-2">
                              <button onClick={handleSaveEdit} className="text-green-500"><Save className="w-4 h-4" /></button>
                              <button onClick={() => setEditingSchedule(null)} className="text-slate-500"><X className="w-4 h-4" /></button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-6 py-3 text-slate-900 dark:text-white">{item.day}</td>
                            <td className="px-6 py-3 text-slate-600 dark:text-slate-300">{item.time}</td>
                            <td className="px-6 py-3 font-medium text-slate-900 dark:text-white">{item.subject}</td>
                            <td className="px-6 py-3 text-slate-500 dark:text-slate-400">{item.teacher}</td>
                            <td className="px-6 py-3 text-slate-600 dark:text-slate-300">{item.room}</td>
                            <td className="px-6 py-3 flex gap-2">
                              <button onClick={() => handleEditSchedule(item)} className="text-amber-500"><Edit className="w-4 h-4" /></button>
                              <button onClick={() => handleDeleteSchedule(item.id)} className="text-rose-500"><Trash2 className="w-4 h-4" /></button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {showAddSchedule && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddSchedule(false)}>
                <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Жаңа сабақ қосу</h2>
                    <button onClick={() => setShowAddSchedule(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                      <X className="w-5 h-5 text-slate-500" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <input type="text" placeholder="Күн" value={newScheduleItem.day} onChange={(e) => setNewScheduleItem({...newScheduleItem, day: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700 border" />
                    <input type="text" placeholder="Уақыт" value={newScheduleItem.time} onChange={(e) => setNewScheduleItem({...newScheduleItem, time: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700 border" />
                    <input type="text" placeholder="Пән" value={newScheduleItem.subject} onChange={(e) => setNewScheduleItem({...newScheduleItem, subject: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700 border" />
                    <input type="text" placeholder="Оқытушы" value={newScheduleItem.teacher} onChange={(e) => setNewScheduleItem({...newScheduleItem, teacher: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700 border" />
                    <input type="text" placeholder="Аудитория" value={newScheduleItem.room} onChange={(e) => setNewScheduleItem({...newScheduleItem, room: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700 border" />
                    <button onClick={handleAddSchedule} className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all">Қосу</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Баптаулар бөлімі */}
        {activeTab === "settings" && (
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Жүйелік баптаулар</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Интерфейс пен профиль параметрлері</p>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-4">Интерфейс стилі</h3>
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <span className="text-slate-700 dark:text-slate-300">Қараңғы режимді қолдау (Dark Mode)</span>
                <button onClick={toggleDarkMode} className="flex items-center gap-2 text-xs bg-amber-500 text-white font-bold px-3 py-1 rounded-full hover:bg-amber-600 transition-all">
                  {darkMode ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
                  {darkMode ? "Жарық режим" : "Қараңғы режим"}
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}