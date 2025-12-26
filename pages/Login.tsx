import React, { useState } from 'react';
import { useUi } from '../contexts/UiContext';
import { ShieldCheck, User, Lock } from 'lucide-react';

const Login: React.FC = () => {
  const { login } = useUi();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      // Simulate login
      login(username);
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-navy-800 to-navy-900 p-8 text-center">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm shadow-xl p-2">
                <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/5/52/Ministry_of_Endowments_and_Religious_Affairs_%28Oman%29_Logo.png" 
                    alt="Ministry Logo" 
                    className="w-full h-full object-contain"
                    onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement?.classList.add('bg-white/10');
                        // Show icon if image fails
                        const icon = document.createElement('div');
                        icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gold-500"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>';
                        e.currentTarget.parentElement?.appendChild(icon);
                    }}
                />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">نظام تقييم الأوقاف</h1>
            <p className="text-navy-100 text-sm">وزارة الأوقاف والشؤون الدينية</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">اسم المستخدم</label>
                <div className="relative">
                    <User className="absolute top-3 right-3 text-gray-400" size={20} />
                    <input 
                        type="text" 
                        required
                        className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-800 outline-none"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="أدخل اسم المستخدم"
                    />
                </div>
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">كلمة المرور</label>
                <div className="relative">
                    <Lock className="absolute top-3 right-3 text-gray-400" size={20} />
                    <input 
                        type="password" 
                        required
                        className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-800 outline-none"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                    />
                </div>
            </div>
            
            <button type="submit" className="w-full bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold py-3 rounded-lg shadow-lg transition-transform active:scale-95">
                تسجيل الدخول
            </button>
            
            <p className="text-center text-xs text-gray-400 mt-4">
                الإصدار 1.2.0 &copy; {new Date().getFullYear()}
            </p>
        </form>
      </div>
    </div>
  );
};

export default Login;