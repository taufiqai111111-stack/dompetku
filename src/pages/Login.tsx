import React, { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { useNavigate } from 'react-router-dom';
import { Wallet, Lock, User } from 'lucide-react';

export default function Login() {
  const { login } = useStore();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'taufiqn' && password === 'togutn1') {
      login();
      navigate('/');
    } else {
      setError('Username atau password salah');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-sky-600 p-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">DompetKu</h1>
          <p className="text-sky-100 mt-2">Masuk untuk mengelola keuangan Anda</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-3 bg-rose-50 text-rose-600 text-sm rounded-lg border border-rose-100 text-center">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 block">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                  placeholder="Masukkan username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  required
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-sky-200"
            >
              Masuk
            </button>
          </form>
        </div>
        
        <div className="bg-slate-50 p-4 text-center text-xs text-slate-400 border-t border-slate-100">
          &copy; {new Date().getFullYear()} DompetKu. All rights reserved.
        </div>
      </div>
    </div>
  );
}
