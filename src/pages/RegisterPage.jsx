import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Scan, CheckCircle2, Smartphone, UserPlus, LogIn, Moon, Sun } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import axios from 'axios';

// Ноутбугіңіздің ағымдағы IP адресі мен Бэкенд порты (3001)
const API_URL = `http://${window.location.hostname}:3001`;

const RegisterPage = () => {
  const navigate = useNavigate();
  
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  // 📷 НАҒЫЗ КАМЕРАНЫ ҚОСУ
  const handleStartCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      streamRef.current = stream;
      setCameraActive(true);
      
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 200);
      toast.success('Камера қосылды! Жүзіңізді туралаңыз.');
    } catch (error) {
      console.error(error);
      setCameraActive(true);
      toast.error('Камера ашылмады, тестілік режим қосылды.');
    }
  };

  // 📸 СУРЕТКЕ ТҮСІРУ (БЕТТІ БЕКІТУ)
  const handleCaptureFace = () => {
    try {
      if (videoRef.current) {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth || 640;
        canvas.height = videoRef.current.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        
        const imageUrl = canvas.toDataURL('image/png');
        setCapturedImage(imageUrl); // Студенттің өз суреті сақталды
      }
    } catch (e) {
      setCapturedImage("https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200");
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    toast.success('Жүзіңіз сәтті бекітілді!');
  };

  // 📡 СЕРВЕРГЕ ТІРКЕЛУДІ ЖІБЕРУ
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!faceSaved && !capturedImage) {
      toast.error('Өтініш, алдымен Face ID бетті бекітуден өтіңіз!');
      return;
    }

    setIsSubmitting(true);

    const newStudent = {
      fullName,
      email,
      password,
      role: 'student',
      avatar: capturedImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200",
      time: new Date().toLocaleTimeString()
    };

    try {
      // Деректерді LocalStorage-ге де, Ноутбуктегі Нағыз Серверге де жібереміз
      localStorage.setItem('registeredStudent', JSON.stringify(newStudent));
      
      await axios.post(`${API_URL}/api/register`, newStudent);
      
      toast.success('Серверге сәтті тіркелдіңіз!');
      navigate('/login');
    } catch (error) {
      console.error("Сервермен байланыс үзілді:", error);
      // Сервер өшіп тұрса да локальді жұмыс істей береді
      toast.success('Офлайн режимде тіркелдіңіз.');
      navigate('/login');
    } finally {
      setIsSubmitting(false);
    }
  };

  const faceSaved = !!capturedImage;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4 transition-colors duration-300">
      <Toaster position="top-right" />
      
      <button onClick={() => setDarkMode(!darkMode)} className="absolute top-4 right-4 p-2 rounded-xl bg-white dark:bg-slate-800 shadow-md">
        {darkMode ? <Sun className="text-amber-400" /> : <Moon className="text-slate-700" />}
      </button>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-xl w-full max-w-md border border-slate-100 dark:border-slate-700">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white text-center mb-1">Smart Campus</h1>
        <p className="text-slate-500 text-sm text-center mb-6">Жаңа Студент ретінде тіркелу</p>

        <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-xl mb-6">
          <button type="button" onClick={() => navigate('/login')} className="flex-1 py-2 text-sm font-bold text-slate-500 dark:text-slate-300 rounded-lg hover:bg-white dark:hover:bg-slate-600 transition-all">➔ Кіру бетіне өту</button>
          <button type="button" className="flex-1 py-2 text-sm font-bold bg-white dark:bg-slate-600 text-amber-500 rounded-lg shadow-sm">+ Тіркелу</button>
        </div>

        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Студенттің аты-жөні</label>
            <input type="text" placeholder="Мысалы: Жарасқан Кабір" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400" required />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Биометрия (Face ID)</label>
            {!cameraActive ? (
              <button type="button" onClick={handleStartCamera} className="w-full py-4 bg-white dark:bg-slate-700 border-2 border-dashed border-amber-300 rounded-xl text-amber-600 dark:text-amber-400 font-bold flex items-center justify-center gap-2">📷 Камераны қосу</button>
            ) : (
              <div className="w-full h-52 bg-slate-950 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden">
                {!faceSaved ? (
                  <>
                    <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]" />
                    <div className="absolute w-28 h-28 border-4 border-dashed border-amber-400 rounded-full bg-black/10 pointer-events-none"></div>
                    <button type="button" onClick={handleCaptureFace} className="absolute bottom-3 px-5 py-2 bg-amber-500 text-slate-950 text-xs font-bold rounded-xl shadow-lg">Бетті бекіту</button>
                  </>
                ) : (
                  <div className="text-center z-10">
                    <img src={capturedImage} alt="Face" className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-green-400 mb-2 shadow-lg" />
                    <p className="text-green-400 text-xs font-bold bg-slate-900/80 px-3 py-1 rounded-full inline-block">Бет бейнеңіз сақталды</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Email / Пошта</label>
            <input type="email" placeholder="zaraskankabir65@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400" required />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Пароль</label>
            <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400" required />
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md mt-4">
            {isSubmitting ? "Тексерілуде..." : "✅ Тіркелуді аяқтау"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;