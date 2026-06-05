import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, QrCode, LogOut, User, ChevronDown, X, ScanLine, Moon, Sun, Camera } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

export default function StudentDashboardPage({ currentUser, onLogout }) {
  const navigate = useNavigate();
  
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });
  
  const [user, setUser] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    const activeUser = currentUser || JSON.parse(localStorage.getItem("activeUser"));
    if (!activeUser || activeUser.role !== "student") {
      navigate("/login");
      return;
    }
    setUser(activeUser);
  }, [currentUser, navigate]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("activeUser");
      navigate("/login");
    }
    toast.success("Сәтті шықтыңыз");
  };

  // Автоматты түрде сканерлеу (кнопкасыз)
  const handleAutoScan = () => {
    if (isScanning) return;
    
    setIsScanning(true);
    toast.loading("QR код сканерленуде...", { id: "qrScan" });
    
    // 2 секундтан кейін сканерлеу сәтті аяқталады
    setTimeout(() => {
      setIsScanning(false);
      toast.dismiss("qrScan");
      toast.success("QR код сәтті сканерленді! Сабаққа қатысуыңыз расталды.", { duration: 4000 });
      
      setAttendanceStatus({
        date: new Date().toLocaleString(),
        subject: "Веб-бағдарламалау",
        status: "Қатысты"
      });
    }, 2000);
  };

  // Бет жүктелгенде автоматты түрде сканерлеу басталады
  useEffect(() => {
    // 1 секундтан кейін сканерлеу басталады
    const timer = setTimeout(() => {
      handleAutoScan();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-white flex flex-col transition-colors duration-300">
      <Toaster position="top-right" />
      
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3 sticky top-0 z-20 shadow-sm flex justify-between items-center transition-colors">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-500 rounded-lg text-white">
            <QrCode className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-wide text-slate-900 dark:text-white">Smart Campus</span>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-700 hover:scale-110 transition-all duration-300"
            aria-label="Dark Mode"
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            )}
          </button>

          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 rounded-full px-3 py-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
            >
              {user.faceImage ? (
                <img src={user.faceImage} alt="Profile" className="w-7 h-7 rounded-full object-cover border border-amber-500" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-bold">
                  {user.fullName?.charAt(0) || "С"}
                </div>
              )}
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200 hidden sm:inline-block">
                {user.fullName?.split(" ")[0] || user.fullName}
              </span>
              <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden z-30">
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    setShowProfileModal(true);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-700 dark:text-slate-200"
                >
                  <User className="w-4 h-4" /> Менің бетім
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 text-rose-600 dark:text-rose-400"
                >
                  <LogOut className="w-4 h-4" /> Шығу
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 flex flex-col items-center justify-center max-w-md mx-auto w-full space-y-6">
        
        <div className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm text-center transition-colors">
          {user.faceImage ? (
            <img src={user.faceImage} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-amber-500 mx-auto mb-3" />
          ) : (
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-3">
              <User className="w-8 h-8" />
            </div>
          )}
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user.fullName}</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{user.email}</p>
          <span className="inline-block text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold px-3 py-1 rounded-full mt-3 border border-emerald-200/30">
            Жүйеге сәтті кірді
          </span>
        </div>

        {/* QR КОДТЫ СКАНЕРЛЕУ БӨЛІМІ - КНОПКАСЫЗ, ТЕК ГАЛОЧКА */}
        <div className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center space-y-4 transition-colors">
          
          {!attendanceStatus ? (
            <>
              {/* Сканерлеу анимациясы */}
              <div className="relative">
                <div className={`p-4 rounded-2xl transition-all duration-300 ${isScanning ? 'bg-amber-500/20 animate-pulse' : 'bg-amber-500/10'}`}>
                  {isScanning ? (
                    <>
                      <div className="absolute inset-0 rounded-2xl border-2 border-amber-500 animate-ping"></div>
                      <ScanLine className="w-12 h-12 text-amber-500 animate-spin" style={{ animationDuration: '2s' }} />
                    </>
                  ) : (
                    <Camera className="w-12 h-12 text-amber-500" />
                  )}
                </div>
              </div>
              
              <div className="text-center">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {isScanning ? "Сканерленуде..." : "QR кодты сканерлеу"}
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 px-4">
                  {isScanning 
                    ? "QR код ізделуде, күте тұрыңыз..." 
                    : "Сабаққа қатысу үшін ұстаз көрсеткен QR кодты сканерлеңіз"}
                </p>
              </div>
            </>
          ) : (
            <>
              {/* ТЕК ГАЛОЧКА - СКАНЕРЛЕУ СӘТТІ ӨТКЕНДЕ */}
              <div className="relative">
                <div className="p-4 bg-emerald-500/20 rounded-2xl">
                  <div className="absolute inset-0 rounded-2xl border-2 border-emerald-500 animate-ping opacity-75"></div>
                  <CheckCircle className="w-16 h-16 text-emerald-500" />
                </div>
              </div>
              
              <div className="text-center">
                <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" /> Қатысу расталды!
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                  Сіз сабаққа сәтті қатыстыңыз
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  {attendanceStatus.date} — {attendanceStatus.subject}
                </p>
              </div>

              {/* Қайта сканерлеу кнопкасы (қажет болса) */}
              <button
                onClick={() => {
                  setAttendanceStatus(null);
                  handleAutoScan();
                }}
                className="mt-2 text-xs text-amber-500 hover:underline font-medium"
              >
                Қайта сканерлеу
              </button>
            </>
          )}
        </div>

        <div className="w-full text-center text-xs text-slate-400 dark:text-slate-500 px-6">
          Егер журналда атыңыз көрінбесе, ұстазға хабарласыңыз немесе бетті жаңартыңыз.
        </div>
      </main>

      {/* ПРОФИЛЬ МОДАЛЫ */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowProfileModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-end">
              <button onClick={() => setShowProfileModal(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            <div className="flex flex-col items-center text-center -mt-2">
              {user.faceImage ? (
                <img src={user.faceImage} alt="Profile" className="w-28 h-28 rounded-full object-cover border-4 border-amber-500 mb-3" />
              ) : (
                <div className="w-28 h-28 rounded-full bg-amber-500 flex items-center justify-center text-white text-4xl font-bold mb-3">
                  {user.fullName?.charAt(0) || "С"}
                </div>
              )}
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{user.fullName}</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">{user.email}</p>
              <div className="mt-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-4 py-2 rounded-full text-xs font-semibold">
                Жүйеге сәтті кірді
              </div>
            </div>

            <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-4">
              <h3 className="font-semibold text-left mb-2 text-slate-900 dark:text-white">Сабаққа қатысуыңыз расталды!</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 text-left">
                Сіз QR кодты сәтті сканерледіңіз. Деректеріңіз ұстаздың журналына автоматты түрде жіберілді.
              </p>
            </div>

            <button onClick={() => setShowProfileModal(false)} className="mt-6 w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl transition-all">
              Жабу
            </button>
          </div>
        </div>
      )}
    </div>
  );
}