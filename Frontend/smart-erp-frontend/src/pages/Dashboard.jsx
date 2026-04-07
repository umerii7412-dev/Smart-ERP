import React, { useEffect, useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { Package, AlertTriangle, RefreshCcw, LayoutDashboard, Tags } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api'; 
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalProducts: 0, lowStock: 0, totalCategories: 0 });
  const [chartData, setChartData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // NOTE: Make sure your backend has this route, or change to '/Inventory'
      const response = await api.get('/Inventory'); 
      const data = response.data;
      
      const lowItems = data.filter(i => i.stockQuantity <= 10).length;
      const uniqueCats = [...new Set(data.map(i => i.category?.name || "Uncategorized"))];

      setStats({
        totalProducts: data.length,
        lowStock: lowItems,
        totalCategories: uniqueCats.length
      });

      // Chart Data
      setChartData(data.slice(0, 10).map(item => ({ name: item.name, quantity: item.stockQuantity })));
      
      // Category Pie Chart Data
      const catCounts = uniqueCats.map(catName => ({
        name: catName,
        value: data.filter(i => (i.category?.name || "Uncategorized") === catName).length
      }));
      setCategoryData(catCounts);

    } catch (err) {
      toast.error("Dashboard sync error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="p-8 bg-[#F8FAFC] min-h-screen space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic flex items-center gap-2">
            <LayoutDashboard className="text-blue-600" /> ERP Analytics Dashboard
          </h1>
          <button onClick={fetchDashboardData} className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-black hover:bg-slate-50 transition-all shadow-sm">
            <RefreshCcw size={14} className={loading ? "animate-spin" : ""} /> {loading ? "Syncing..." : "Refresh"}
          </button>
        </div>

        {/* --- THREE STATS CARDS IN ONE LINE --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div onClick={() => navigate('/inventory')} className="cursor-pointer p-6 bg-white rounded-[24px] border border-slate-100 shadow-sm hover:border-blue-600 transition-all group">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400">Total Products</p>
                <h2 className="text-3xl font-black text-slate-900 mt-1">{stats.totalProducts}</h2>
              </div>
              <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Package size={24} />
              </div>
            </div>
          </div>

          <div onClick={() => navigate('/inventory', { state: { filter: 'low' } })} className="cursor-pointer p-6 bg-white rounded-[24px] border border-slate-100 shadow-sm hover:border-rose-600 transition-all group">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400">Low Stock Items</p>
                <h2 className={`text-3xl font-black mt-1 ${stats.lowStock > 0 ? 'text-rose-600' : 'text-slate-900'}`}>{stats.lowStock}</h2>
              </div>
              <div className="p-3 rounded-2xl bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <AlertTriangle size={24} />
              </div>
            </div>
          </div>

          <div onClick={() => navigate('/categories')} className="cursor-pointer p-6 bg-white rounded-[24px] border border-slate-100 shadow-sm hover:border-emerald-600 transition-all group">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400">Total Categories</p>
                <h2 className="text-3xl font-black text-slate-900 mt-1">{stats.totalCategories}</h2>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Tags size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* --- GRAPHS SECTION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm h-[450px] flex flex-col">
            <h3 className="text-sm font-black uppercase text-slate-800 italic mb-6 text-center">Stock Level Analysis</h3>
            <div className="flex-1 min-h-0 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                  <YAxis fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="quantity" stroke="#2563eb" fill="url(#colorStock)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm h-[450px] flex flex-col">
            <h3 className="text-sm font-black uppercase text-slate-800 italic mb-6 text-center">Category Distribution</h3>
            <div className="flex-1 min-h-0 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;