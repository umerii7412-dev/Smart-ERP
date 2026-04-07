import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import api from './api'; 
import Login from './pages/Login';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import Reporting from './pages/Reporting';
import Layout from './components/Layout';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

const Dashboard = () => {
  const [stats, setStats] = useState({ totalSales: 0, activeOrders: 0, lowStock: 0 });
  const [chartData, setChartData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [rawInventory, setRawInventory] = useState([]); // Alert table ke liye
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/Inventory');
      const data = res.data;
      setRawInventory(data);

      const lowStockCount = data.filter(item => item.stockQuantity <= 10).length;
      const totalPrice = data.reduce((sum, item) => sum + (item.price * item.stockQuantity), 0);
      
      const categoryData = data.reduce((acc, item) => {
        const found = acc.find(c => c.name === item.category);
        if (found) found.value += 1;
        else acc.push({ name: item.category || 'Other', value: 1 });
        return acc;
      }, []);

      setStats({
        totalSales: totalPrice.toLocaleString(),
        activeOrders: data.length,
        lowStock: lowStockCount
      });
      setPieData(categoryData);
      setChartData(data.map(item => ({ name: item.name, val: item.stockQuantity })));
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <Layout>
      <div className="space-y-8 pb-10">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">ERP Analytics Dashboard</h2>
            <p className="text-slate-500 text-sm">Real-time inventory and sales insights</p>
          </div>
          <button onClick={fetchDashboardData} className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-50">
            {loading ? "Refreshing..." : "Refresh Data"}
          </button>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100 border-l-4 border-l-blue-600">
            <h3 className="text-slate-500 text-sm font-medium">Inventory Value</h3>
            <p className="text-3xl font-bold text-slate-800 mt-2">${stats.totalSales}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100 border-l-4 border-l-green-500">
            <h3 className="text-slate-500 text-sm font-medium">Total Products</h3>
            <p className="text-3xl font-bold text-slate-800 mt-2">{stats.activeOrders}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100 border-l-4 border-l-red-500">
            <h3 className="text-slate-500 text-sm font-medium text-red-600">Low Stock Items</h3>
            <p className="text-3xl font-bold text-red-600 mt-2">{stats.lowStock}</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Current Stock Levels</h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{fill: '#64748b', fontSize: 10}} />
                    <YAxis tick={{fill: '#64748b', fontSize: 12}} />
                    <Tooltip />
                    <Area type="monotone" dataKey="val" stroke="#2563eb" fill="#dbeafe" />
                  </AreaChart>
                </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Category Distribution</h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* --- LOW STOCK ALERT TABLE --- */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 border-t-4 border-t-red-500">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">⚠️ Low Stock Alerts</h3>
            <Link to="/inventory" className="text-blue-600 text-sm font-bold hover:underline">Manage All Inventory →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 text-xs uppercase border-b">
                  <th className="pb-3">Product Name</th>
                  <th className="pb-3">Current Stock</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {rawInventory.filter(p => p.stockQuantity <= 10).map((item) => (
                  <tr key={item.id} className="hover:bg-red-50/50">
                    <td className="py-4 font-semibold text-slate-700">{item.name}</td>
                    <td className="py-4 text-red-600 font-black">{item.stockQuantity}</td>
                    <td className="py-4"><span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase">Restock Required</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/reporting" element={<ProtectedRoute><Reporting /></ProtectedRoute>} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;