import React, { createContext, useContext, useState, useEffect } from 'react';
import { CheckCircle, XCircle, Info } from 'lucide-react';

interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
}

interface UiContextType {
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
    isAuthenticated: boolean;
    login: (username: string) => void;
    logout: () => void;
    user: string | null;
}

const UiContext = createContext<UiContextType | undefined>(undefined);

export const UiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<string | null>(null);

    // Load auth state
    useEffect(() => {
        const storedUser = localStorage.getItem('waqf_user');
        if (storedUser) {
            setUser(storedUser);
            setIsAuthenticated(true);
        }
    }, []);

    const login = (username: string) => {
        localStorage.setItem('waqf_user', username);
        setUser(username);
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem('waqf_user');
        setUser(null);
        setIsAuthenticated(false);
    };

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    };

    return (
        <UiContext.Provider value={{ showToast, isAuthenticated, login, logout, user }}>
            {children}
            <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-md px-4">
                {toasts.map(toast => (
                    <div key={toast.id} className={`toast-enter flex items-center gap-3 p-4 rounded-xl shadow-2xl border ${
                        toast.type === 'success' ? 'bg-navy-900 text-white border-teal-500' : 
                        toast.type === 'error' ? 'bg-red-600 text-white border-red-400' : 'bg-white text-gray-800 border-gray-200'
                    }`}>
                        {toast.type === 'success' && <CheckCircle className="text-teal-400" size={24} />}
                        {toast.type === 'error' && <XCircle className="text-white" size={24} />}
                        {toast.type === 'info' && <Info className="text-blue-500" size={24} />}
                        <span className="font-bold">{toast.message}</span>
                    </div>
                ))}
            </div>
        </UiContext.Provider>
    );
};

export const useUi = () => {
    const context = useContext(UiContext);
    if (!context) throw new Error('useUi must be used within UiProvider');
    return context;
};