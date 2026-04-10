import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const userRole = localStorage.getItem('role') || 'User'; 
  const userName = localStorage.getItem('userName') || 'System User';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Menu items - Updated label to 'Roles'
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '🏠', adminOnly: false },
    { name: 'Users', path: '/users', icon: '🛡️', adminOnly: true },
    { name: 'Roles', path: '/roles', icon: '🔑', adminOnly: true }, // Updated name
    { name: 'Bank', path: '/bank', icon: '💎', adminOnly: true },
    { name: 'Inventory', path: '/inventory', icon: '📦', adminOnly: false },
    { name: 'Categories', path: '/categories', icon: '📑', adminOnly: false }, 
    { name: 'Customers', path: '/customers', icon: '👥', adminOnly: false },
    { name: 'Orders', path: '/orders', icon: '🛍️', adminOnly: false },
    { name: 'Reporting', path: '/reporting', icon: '📊', adminOnly: true },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-[#1e293b] text-white transition-all duration-300 flex flex-col shadow-2xl z-20`}>
        <div className="p-6 text-xl font-black border-b border-slate-700 truncate tracking-wider text-blue-400">
          {isSidebarOpen ? 'SMART ERP' : 'ERP'}
        </div>

        <nav className="flex-1 mt-6 px-3 space-y-2 overflow-y-auto small-scrollbar">
          {menuItems.map((item) => {
            if (item.adminOnly && userRole !== 'Admin') return null;

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group ${
                  location.pathname === item.path
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
                {isSidebarOpen && <span className="font-semibold">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

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
        {/* Header */}
        <header className="h-16 bg-white shadow-md flex items-center justify-between px-8 border-b border-slate-200 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors focus:outline-none shadow-sm"
            >
              {isSidebarOpen ? '❮' : '☰'}
            </button>
            <h2 className="hidden md:block text-slate-400 font-medium">
              System / <span className="text-slate-800 font-bold capitalize">{location.pathname.replace('/', '') || 'Dashboard'}</span>
            </h2>
          </div>

          <div className="flex items-center gap-4 group cursor-pointer p-1 pr-4 rounded-full hover:bg-slate-50 transition-all">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-800 leading-none">{userName}</p>
              <span className="text-[10px] text-blue-600 font-black uppercase tracking-widest">
                {userRole}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-200 group-hover:rotate-6 transition-transform text-lg uppercase">
              {userName.charAt(0)}
            </div>
          </div>
        </header>

        {/* Main View Port */}
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