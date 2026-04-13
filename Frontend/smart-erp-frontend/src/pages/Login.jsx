import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const bgImage = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop";

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/Auth/login', { email, password });
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);
      localStorage.setItem('userName', response.data.userName);
      
      Swal.fire({
        title: 'Login Successful!',
        text: `Welcome back, ${response.data.userName}`,
        icon: 'success',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
      });

      navigate('/dashboard');
    } catch (error) {
      Swal.fire({
        title: 'Login Failed!',
        text: error.response?.data || 'Invalid credentials, please try again.',
        icon: 'error',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    }
  };

  return (
    /* fixed inset-0 aur bg-cover pory view-port ko cover kar leta hai */
    <div 
      className="fixed inset-0 w-screen h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat font-sans"
      style={{ 
        backgroundImage: `url('${bgImage}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Dark Overlay - isko bhi inset-0 rakha hai taaki white gaps na bachein */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[3px]"></div>

      {/* Login Card */}
      <div className="bg-white/10 backdrop-blur-2xl p-10 rounded-[40px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)] w-full max-w-md border border-white/20 relative z-10 mx-4 animate-in fade-in zoom-in duration-500">
        
        <div className="text-center mb-10">
          <div className="inline-block p-4 bg-white/20 backdrop-blur-md rounded-2xl mb-4 border border-white/30 shadow-xl">
            <h1 className="text-2xl font-black text-white tracking-tighter italic">S-ERP</h1>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">Smart ERP System</h2>
          <p className="text-white/60 mt-2 text-sm font-semibold tracking-wide">Enter your credentials to continue</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="group">
            <label className="block text-[11px] font-black text-white/70 ml-2 mb-1 uppercase tracking-widest transition-colors group-focus-within:text-white">
              Email
            </label>
            <input
              type="email"
              className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-2xl focus:bg-white/20 focus:border-white/50 outline-none transition-all font-bold text-white placeholder-white/30 shadow-inner"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="group">
            <label className="block text-[11px] font-black text-white/70 ml-2 mb-1 uppercase tracking-widest transition-colors group-focus-within:text-white">
              Password
            </label>
            <input
              type="password"
              className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-2xl focus:bg-white/20 focus:border-white/50 outline-none transition-all font-bold text-white placeholder-white/30 shadow-inner"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-white text-[#003354] py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-white/90 hover:-translate-y-1 transition-all active:scale-95"
            >
              Login
            </button>
          </div>
        </form>

        <div className="mt-10 pt-6 border-t border-white/10 text-center">
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.25em]">
            Enterprise Grade Security 2026
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;