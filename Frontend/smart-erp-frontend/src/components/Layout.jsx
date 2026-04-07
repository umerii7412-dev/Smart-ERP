import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation(); // Active page check karne ke liye

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Menu items array - UPDATED with Reporting
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Inventory', path: '/inventory', icon: '📦' },
    { name: 'Orders', path: '/orders', icon: '🛒' },
    { name: 'Reporting', path: '/reporting', icon: '📈' }, // Naya link yahan add kiya hai
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar - Color fixed to Slate-900 */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-[#1e293b] text-white transition-all duration-300 flex flex-col shadow-2xl z-20`}>
        
        {/* Logo Section */}
        <div className="p-6 text-xl font-black border-b border-slate-700 truncate tracking-wider text-blue-400">
          {isSidebarOpen ? 'SMART ERP' : 'ERP'}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 mt-6 px-3 space-y-2">
          {menuItems.map((item) => (
            <Link 
              key={item.name}
              to={item.path} 
              className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group ${
                location.pathname === item.path 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {isSidebarOpen && <span className="font-semibold">{item.name}</span>}
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <button 
          onClick={handleLogout} 
          className="m-4 p-3 bg-slate-800 text-red-400 font-bold rounded-xl hover:bg-red-600 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 border border-slate-700 shadow-sm"
        >
          <span>🚪</span>
          {isSidebarOpen && "Logout"}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white shadow-md flex items-center justify-between px-8 border-b border-slate-200 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!isSidebarOpen)} 
              className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors focus:outline-none shadow-sm"
            >
              {isSidebarOpen ? '❮' : '☰'}
            </button>
            <h2 className="hidden md:block text-slate-400 font-medium">
              System / <span className="text-slate-800 font-bold capitalize">{location.pathname.replace('/', '')}</span>
            </h2>
          </div>

          <div className="flex items-center gap-4 group cursor-pointer p-1 pr-4 rounded-full hover:bg-slate-50 transition-all">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-800 leading-none">Admin User</p>
              <span className="text-[10px] text-blue-600 font-black uppercase tracking-widest">Super Admin</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-200 group-hover:rotate-6 transition-transform">
              A
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-8 bg-[#f8fafc]">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;