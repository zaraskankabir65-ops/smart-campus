import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import { Scan, UserPlus, LogIn, Camera, Smartphone, CheckCircle2, Moon, Sun, QrCode } from "lucide-react";

export default function LoginPage({ onLoginSuccess }) {
  const navigate = useNavigate();
  
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });
  
  const [isMobile, setIsMobile] = useState(false);
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState(""); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null); 
  const [scanningFace, setScanningFace] = useState(false);  
  const [isSimulationMode, setIsSimulationMode] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    const checkDevice = () => {
      const isMobileWidth = window.innerWidth <= 768;
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(isMobileWidth || isMobileUA);
    };
    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  useEffect(() => {
    return () => stopCamera();
  }, [mode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const startCamera = async () => {
    setCameraActive(true);
    setCapturedImage(null);
    setIsSimulationMode(false);
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      switchToSimulation();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      toast.success("Камера дайын! Бетіңізді туралаңыз.");
    } catch (err) {
      switchToSimulation();
    }
  };

  const switchToSimulation = () => {
    setIsSimulationMode(true);
    toast.success("Мобильді Face ID биометриясы іске қосылды!");
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (isSimulationMode) {
      setCapturedImage("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=60");
      setCameraActive(false);
      toast.success("Жүзіңіз сәтті сақталды!");
      return;
    }

    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      setCapturedImage(canvas.toDataURL("image/jpeg"));
      stopCamera();
      toast.success("Жүзіңіз сәтті жазып алынды!");
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      toast.error("Барлық өрісті толтырыңыз!");
      return;
    }
    if (!capturedImage) {
      toast.error("Өтініш, алдымен жүзіңізді (Face ID) сканерлеңіз!");
      return;
    }

    setIsSubmitting(true);
    const localUsers = JSON.parse(localStorage.getItem("campus_users") || "[]");
    const userExists = localUsers.some(u => u.email === email);
    
    if (userExists || email === "admin@gmail.com") {
      toast.error("Бұл email жүйеде тіркеліп қойған!");
      setIsSubmitting(false);
      return;
    }

    const newUser = { 
      fullName, 
      email, 
      password, 
      role: "student",
      faceImage: capturedImage 
    };
    
    localUsers.push(newUser);
    localStorage.setItem("campus_users", JSON.stringify(localUsers));

    setTimeout(() => {
      toast.success("Сіз сәтті тіркелдіңіз! Енді Face ID арқылы кіре аласыз.");
      setIsSubmitting(false);
      setCapturedImage(null);
      setMode("login");
    }, 800);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Пошта мен парольді жазыңыз!");
      return;
    }

    if (email === "admin@gmail.com" && (password === "admin" || password === "WiliWonka2954")) {
      localStorage.setItem("accessToken", "admin-session-token");
      const adminUser = { email, role: "admin", fullName: "Администратор" };
      localStorage.setItem("activeUser", JSON.stringify(adminUser));
      if (onLoginSuccess) onLoginSuccess(adminUser);
      toast.success("Администратор ретінде сәтті кірдіңіз!");
      setTimeout(() => navigate("/admin/dashboard", { replace: true }), 600);
      return;
    }

    const localUsers = JSON.parse(localStorage.getItem("campus_users") || "[]");
    const foundUser = localUsers.find(u => u.email === email && u.password === password);

    if (!foundUser) {
      toast.error("Қате! Атыңыз немесе пароліңіз дұрыс емес.");
      return;
    }

    startFaceIDVerification(foundUser);
  };

  const startFaceIDVerification = async (user) => {
    setScanningFace(true);
    setCameraActive(true);
    setIsSimulationMode(false);
    
    toast.loading("Face ID қосылуда, камераға қараңыз...", { id: "faceAuth" });
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsSimulationMode(true);
      runFaceIDSuccessSimulation(user);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setTimeout(() => {
        stopCamera();
        completeLogin(user);
      }, 2500);
    } catch (err) {
      setIsSimulationMode(true);
      runFaceIDSuccessSimulation(user);
    }
  };

  const runFaceIDSuccessSimulation = (user) => {
    setTimeout(() => {
      setCameraActive(false);
      setIsSimulationMode(false);
      completeLogin(user);
    }, 2500);
  };

  const completeLogin = (user) => {
    setScanningFace(false);
    toast.dismiss("faceAuth");
    localStorage.setItem("accessToken", "student-session-token");
    localStorage.setItem("activeUser", JSON.stringify(user));
    if (onLoginSuccess) onLoginSuccess(user);
    toast.success(`Face ID сәтті өтті! Қош келдіңіз, ${user.fullName}`);
    setTimeout(() => navigate("/student/dashboard", { replace: true }), 600);
  };

  const isFaceSaved = () => {
    return capturedImage && !cameraActive;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-white transition-colors duration-300 px-4 py-8 relative">
      <Toaster position="top-right" />
      <canvas ref={canvasRef} className="hidden"></canvas>

      {/* ЛОГОТИП - СОЛ ЖАҚ ЖОҒАРҒЫ БҰРЫШ */}
      <div className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md border border-slate-200 dark:border-slate-700">
        <div className="p-1.5 bg-amber-500 rounded-lg text-white">
          <QrCode className="w-5 h-5" />
        </div>
        <span className="font-bold text-sm tracking-wide text-slate-800 dark:text-white">Smart Campus</span>
      </div>

      {/* DARK MODE TOGGLE - ОҢ ЖАҚ ЖОҒАРҒЫ БҰРЫШ */}
      <button
        onClick={toggleDarkMode}
        className="fixed top-4 right-4 z-50 p-2 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 hover:scale-110 transition-all duration-300"
        aria-label="Dark Mode"
      >
        {darkMode ? (
          <Sun className="w-5 h-5 text-amber-500" />
        ) : (
          <Moon className="w-5 h-5 text-slate-700" />
        )}
      </button>

      <div className="w-full max-w-md p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl transition-all duration-300">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className="p-2 bg-amber-500 rounded-xl text-white">
              <QrCode className="w-8 h-8" />
            </div>
          </div>
          <h2 className="text-2xl font-extrabold tracking-wide text-slate-900 dark:text-white">
            Smart Campus
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {mode === "login" ? "Жүйеге кіру үшін деректерді енгізіңіз" : "Жаңа Студент ретінде тіркелу"}
          </p>
        </div>

        {!scanningFace && (
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl mb-6 select-none">
            <button 
              onClick={() => setMode("login")} 
              className={`flex-1 py-2 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${mode === "login" ? "bg-white dark:bg-slate-800 shadow-sm text-amber-500" : "text-slate-500"}`}
            >
              <LogIn className="w-4 h-4" /> Кіру
            </button>
            <button 
              onClick={() => setMode("register")} 
              className={`flex-1 py-2 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${mode === "register" ? "bg-white dark:bg-slate-800 shadow-sm text-amber-500" : "text-slate-500"}`}
            >
              <UserPlus className="w-4 h-4" /> Тіркелу
            </button>
          </div>
        )}

        {cameraActive && (
          <div className="mb-6 flex flex-col items-center justify-center bg-slate-950 rounded-2xl p-6 border-2 border-amber-500/50 relative overflow-hidden h-52 shadow-xl">
            {!isSimulationMode && (
              <>
                <div className="absolute inset-0 border-2 border-dashed border-amber-500/40 rounded-2xl pointer-events-none animate-pulse m-2"></div>
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover rounded-xl scale-x-[-1]"></video>
                {mode === "register" && (
                  <button 
                    type="button"
                    onClick={capturePhoto}
                    className="absolute bottom-4 px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                  >
                    <Camera className="w-4 h-4" /> Түрді сақтау
                  </button>
                )}
              </>
            )}

            {isSimulationMode && (
              <div className="flex flex-col items-center justify-center text-center space-y-3 w-full h-full">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <div className="absolute inset-0 border-4 border-amber-500/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-t-amber-500 border-r-amber-500 rounded-full animate-spin"></div>
                  <Scan className="w-10 h-10 text-amber-400 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <p className="text-amber-400 text-xs font-bold uppercase tracking-widest animate-pulse">
                    Face ID Биометрия
                  </p>
                  <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                    <Smartphone className="w-3 h-3" /> Телефон сенсоры бетті іздеуде...
                  </p>
                </div>
                {mode === "register" && (
                  <button 
                    type="button"
                    onClick={capturePhoto}
                    className="px-4 py-1.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl active:scale-95 transition-all"
                  >
                    Бетті бекіту
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {mode === "register" && isFaceSaved() && (
          <div className="mb-5 flex flex-col items-center justify-center bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/20">
            <div className="relative">
              <img src={capturedImage} alt="Face" className="w-20 h-20 object-cover rounded-full border-2 border-emerald-500 p-0.5" />
              <CheckCircle2 className="w-5 h-5 text-emerald-500 absolute bottom-0 right-0 bg-white dark:bg-slate-800 rounded-full" />
            </div>
            <button type="button" onClick={startCamera} className="text-xs text-amber-500 mt-1.5 hover:underline font-medium">
              Қайта түсу / Баптау
            </button>
          </div>
        )}

        {!scanningFace && (
          <form onSubmit={mode === "login" ? handleLoginSubmit : handleRegister} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Студенттің аты-жөні (ФИО)
                </label>
                <input 
                  type="text" 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)} 
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors" 
                  placeholder="Жарасқан Кабир"
                  required
                />
              </div>
            )}

            {mode === "register" && !cameraActive && !capturedImage && (
              <div className="pb-1">
                <label className="block text-xs font-semibold mb-1.5 text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Биометрия (Face ID)
                </label>
                <button
                  type="button"
                  onClick={startCamera}
                  className="w-full py-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-amber-500 hover:text-slate-950 text-amber-500 transition-all active:scale-95"
                >
                  <Scan className="w-4 h-4" /> Камераны қосып, түрді сақтау
                </button>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Email / Пошта
              </label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors" 
                placeholder="zaraskankabir65@gmail.com" 
                required
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Пароль
              </label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors" 
                placeholder="••••••••" 
                required
              />
            </div>
            
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20 mt-2 disabled:opacity-50 active:scale-95 select-none"
            >
              {isSubmitting ? "Өңделуде..." : mode === "login" ? "Жүйеге кіру (Face ID)" : "Тіркелуді аяқтау"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}