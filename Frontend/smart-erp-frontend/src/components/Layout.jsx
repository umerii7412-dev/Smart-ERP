import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  KeyRound, 
  Landmark, 
  Package, 
  Tags, 
  Users, 
  ShoppingBag, 
  BarChart3,
  LogOut,
  ChevronLeft,
  Menu,
  Wallet // Naya icon import kiya
} from 'lucide-react';

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

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={22} />, adminOnly: false },
    { name: 'Users', path: '/users', icon: <ShieldCheck size={22} />, adminOnly: true },
    { name: 'Roles', path: '/roles', icon: <KeyRound size={22} />, adminOnly: true },
    { name: 'Bank', path: '/bank', icon: <Landmark size={22} />, adminOnly: true },
    { name: 'Inventory', path: '/inventory', icon: <Package size={22} />, adminOnly: false },
    { name: 'Categories', path: '/categories', icon: <Tags size={22} />, adminOnly: false }, 
    { name: 'Expenses', path: '/expenses', icon: <Wallet size={22} />, adminOnly: false }, // <-- Yahan add kiya
    { name: 'Customers', path: '/customers', icon: <Users size={22} />, adminOnly: false },
    { name: 'Orders', path: '/orders', icon: <ShoppingBag size={22} />, adminOnly: false },
    { name: 'Reporting', path: '/reporting', icon: <BarChart3 size={22} />, adminOnly: true },
  ];

  return (
    <div className="flex h-screen bg-[#f5f7fa] font-sans">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-[#003354] text-white transition-all duration-300 flex flex-col shadow-2xl z-20`}>
        <div className="p-6 text-xl font-black border-b border-white/10 truncate tracking-wider text-white">
          {isSidebarOpen ? 'Smart ERP' : 'ERP'}
        </div>

        <nav className="flex-1 mt-6 px-3 space-y-2 overflow-y-auto small-scrollbar">
          {menuItems.map((item) => {
            if (item.adminOnly && userRole !== 'Admin') return null;

            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group ${
                  isActive
                  ? 'bg-white text-[#003354] shadow-lg'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className={`transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-[#003354]' : 'text-white/50'}`}>
                  {item.icon}
                </span>
                {isSidebarOpen && <span className="font-semibold tracking-wide text-[13px] capitalize">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 p-3 rounded-xl bg-red-600 text-white font-bold transition-none shadow-md"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="text-[13px] capitalize">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-8 border-b border-[#ecf0f1] z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg bg-[#f8fafc] text-[#003354] hover:bg-[#003354] hover:text-white transition-colors focus:outline-none shadow-sm border border-slate-200"
            >
              {isSidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
            </button>
            <h2 className="hidden md:block text-slate-400 font-medium text-sm tracking-widest capitalize">
              System / <span className="text-[#003354] font-black">{location.pathname.replace('/', '') || 'Dashboard'}</span>
            </h2>
          </div>

          <div className="flex items-center gap-4 group cursor-pointer p-1 pr-4 rounded-full hover:bg-slate-50 transition-all">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-[#003354] leading-none">{userName}</p>
              <span className="text-[10px] text-slate-400 font-black capitalize tracking-widest">
                {userRole}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#003354] flex items-center justify-center text-white font-bold shadow-md group-hover:shadow-lg transition-all text-lg uppercase">
              {userName.charAt(0)}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-8 bg-[#f5f7fa]">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;