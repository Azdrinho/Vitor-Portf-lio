import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, LogOut, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface AdminPanelProps {
  onClose: () => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  onClose, 
  isLoggedIn, 
  setIsLoggedIn
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false); // New state for success animation

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        setError(error.message);
        setLoading(false);
    } else {
        // Successful login
        setIsSuccess(true);
        // Delay closing to show animation
        setTimeout(() => {
            setIsLoggedIn(true);
            setLoading(false);
            onClose();
        }, 1800);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setLoading(false);
    onClose();
  };

  // --- Success Animation Component (Mini Loader) ---
  if (isSuccess) {
      return (
        <motion.div 
            className="fixed inset-0 z-[110] flex flex-col items-center justify-center bg-black text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div className="w-full max-w-sm px-6">
                 <div className="flex items-center gap-3 mb-6">
                    <ShieldCheck size={32} className="text-[#00c05e]" />
                    <h1 className="font-heading text-3xl uppercase tracking-wider text-white">Access Granted</h1>
                 </div>
                 
                 <div className="w-full h-[1px] bg-gray-800 relative overflow-hidden">
                    <motion.div 
                        className="h-full bg-[#00c05e] absolute left-0 top-0"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ ease: "easeInOut", duration: 1.5 }}
                    />
                </div>
                
                <div className="flex justify-between mt-2">
                     <span className="font-mono text-[10px] uppercase text-gray-500">Authenticating...</span>
                     <motion.span 
                        className="font-mono text-[10px] uppercase text-[#00c05e]"
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ repeat: Infinity, duration: 0.5 }}
                     >
                        Verified
                     </motion.span>
                </div>
            </div>
        </motion.div>
      );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl p-8 w-full max-w-sm relative shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
            onClick={onClose} 
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center justify-center text-center pt-4">
            
            {!isLoggedIn ? (
                <form onSubmit={handleLogin} className="w-full space-y-6">
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mb-4">
                            <Lock size={28} />
                        </div>
                        <h2 className="font-heading text-2xl uppercase mb-1">Admin Access</h2>
                        <p className="text-gray-500 text-sm">Enter credentials to edit website.</p>
                    </div>
                    
                    <div className="space-y-3 text-left">
                        <div>
                            <input 
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email"
                                className="w-full p-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-black border border-transparent transition-all"
                                required
                            />
                        </div>
                        <div>
                            <input 
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                className="w-full p-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-black border border-transparent transition-all"
                                required
                            />
                        </div>
                        
                        {error && (
                            <div className="flex items-center gap-2 text-red-500 text-xs bg-red-50 p-2 rounded text-left">
                                <AlertCircle size={14} className="shrink-0" /> {error}
                            </div>
                        )}
                    </div>

                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-[#00c05e] text-white rounded-full font-bold uppercase tracking-wide hover:bg-black transition-colors shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : "Enter Editor Mode"}
                    </button>
                </form>
            ) : (
                <div className="w-full space-y-6">
                     <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                            <LogOut size={28} />
                        </div>
                        <h2 className="font-heading text-2xl uppercase mb-1">Log Out</h2>
                        <p className="text-gray-500 text-sm">Exit editor mode?</p>
                    </div>

                    <button 
                        onClick={handleLogout}
                        disabled={loading}
                        className="w-full py-4 bg-gray-100 text-black rounded-full font-bold uppercase tracking-wide hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center gap-2 mt-4"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : "Sign Out"}
                    </button>
                </div>
            )}

        </div>

      </motion.div>
    </motion.div>
  );
};

export default AdminPanel;