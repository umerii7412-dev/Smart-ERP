import React, { useState } from 'react';

import api from '../api';

import { useNavigate } from 'react-router-dom';

import toast from 'react-hot-toast';



const Login = () => {

  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');

  const navigate = useNavigate();



  const handleLogin = async (e) => {

    e.preventDefault();

    try {

      const response = await api.post('/Auth/login', { email, password });

     

      // Token, Role aur Name save karein taake layout mein use ho sakain

      localStorage.setItem('token', response.data.token);

      localStorage.setItem('role', response.data.role);

      localStorage.setItem('userName', response.data.userName);

     

      toast.success('Login Successful!');

      navigate('/dashboard');

    } catch (error) {

      // Backend se jo "Account Blocked" ka message aayega wo yahan show hoga

      toast.error(error.response?.data || 'Login Fail ho gaya!');

    }

  };



  return (

    <div className="min-h-screen flex items-center justify-center bg-slate-100">

      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200">

        <div className="text-center mb-8">

          <h1 className="text-3xl font-bold text-blue-900">Smart ERP</h1>

          <p className="text-slate-500 mt-2">Login your Account</p>

        </div>



        <form onSubmit={handleLogin} className="space-y-6">

          <div>

            <label className="block text-sm font-medium text-slate-700">Email Address</label>

            <input

              type="email"

              className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition"

              placeholder="admin@erp.com"

              value={email}

              onChange={(e) => setEmail(e.target.value)}

              required

            />

          </div>



          <div>

            <label className="block text-sm font-medium text-slate-700">Password</label>

            <input

              type="password"

              className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition"

              placeholder="••••••••"

              value={password}

              onChange={(e) => setPassword(e.target.value)}

              required

            />

          </div>



          <button

            type="submit"

            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition duration-300 shadow-lg shadow-blue-200"

          >

            Sign In

          </button>

        </form>

      </div>

    </div>

  );

};



export default Login;