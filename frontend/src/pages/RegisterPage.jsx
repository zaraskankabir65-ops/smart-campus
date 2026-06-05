import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Moon, Sun } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import axios from 'axios';

// Render бэкендінің нақты URL-і
const API_URL = 'https://campus-api-8iiy.onrender.com';

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
      toast.success('Камера қосылды!');
    } catch (error) {
      console.error(error);
      toast.error('Камера ашылмады');
    }
  };

  const handleCaptureFace = () => {
    try {
      if (videoRef.current) {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth || 640;
        canvas.height = videoRef.current.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        
        const imageUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageUrl);
      }
    } catch (e) {
      setCapturedImage("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150");
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      setCameraActive(false);
    }
    toast.success('Жүзіңіз бекітілді!');
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    if (!capturedImage) {
      toast.error('Алдымен бетіңізді бекітіңіз!');
      return;
    }

    setIsSubmitting(true);

    const newStudent = {
      fullName,
      email,
      password,
      avatar: capturedImage
    };

    try {
      const response = await axios.post(`${API_URL}/api/register`, newStudent);
      console.log('Тіркелу сәтті:', response.data);
      toast.success('Сәтті тіркелдіңіз!');
      navigate('/login');
    } catch (error) {
      console.error('Қате:', error.response?.data || error.message);
      const errorMsg = error.response?.data?.detail || 'Серверге қосылу мүмкін емес';
      toast.error(`Қате: ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4 transition-colors duration-300">
      <Toaster position="top-right" />
      
      <button onClick={() => setDarkMode(!darkMode)} className="absolute top-4 right-4 p-2 rounded-xl bg-white dark:bg-slate-800 shadow-md">
        {darkMode ? <Sun className="text-amber-400" /> : <Moon className="text-slate-700" />}
      </button>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white text-center mb-1">Smart Campus</h1>
        <p className="text-slate-500 text-sm text-center mb-6">Жаңа студент ретінде тіркелу</p>

        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2">Аты-жөні</label>
            <input 
              type="text" 
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)} 
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 rounded-xl" 
              required 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2">Face ID (бет бейне)</label>
            {!cameraActive && !capturedImage && (
              <button type="button" onClick={handleStartCamera} className="w-full py-3 bg-amber-500 text-white rounded-xl">
                📷 Камераны қосу
              </button>
            )}
            {cameraActive && (
              <div className="relative w-full h-52 bg-black rounded-xl overflow-hidden">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
                <button type="button" onClick={handleCaptureFace} className="absolute bottom-3 left-1/2 transform -translate-x-1/2 px-5 py-2 bg-amber-500 text-white rounded-xl">
                  Суретке түсіру
                </button>
              </div>
            )}
            {capturedImage && (
              <div className="text-center">
                <img src={capturedImage} alt="Face" className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-green-400" />
                <p className="text-green-500 text-xs mt-1">✅ Бет бейне сақталды</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 rounded-xl" 
              required 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2">Пароль</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 rounded-xl" 
              required 
            />
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-amber-500 text-white font-bold rounded-xl">
            {isSubmitting ? "Тіркелу... ⏳" : "Тіркелу ✅"}
          </button>
        </form>

        <div className="text-center mt-4">
          <button onClick={() => navigate('/login')} className="text-amber-500 text-sm">
            ➔ Кіру бетіне өту
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
