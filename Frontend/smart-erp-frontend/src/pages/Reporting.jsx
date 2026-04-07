import React, { useEffect, useState } from 'react';
import api from '../api';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Reporting = () => {
  const [inventoryData, setInventoryData] = useState(null);
  const [paymentData, setPaymentData] = useState([]);
  const [employeeData, setEmployeeData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllReports();
  }, []);

  const fetchAllReports = async () => {
    setLoading(true);
    try {
      // Promise.allSettled use kiya hai taake agar ek API fail ho to baaki load ho sakein
      const [invRes, payRes, empRes] = await Promise.allSettled([
        api.get('/Report/inventory-summary'),
        api.get('/Report/payment-by-methods'),
        api.get('/Report/employee-performance')
      ]);

      if (invRes.status === 'fulfilled') setInventoryData(invRes.value.data);
      else console.error("Inventory Report Error:", invRes.reason);

      if (payRes.status === 'fulfilled') setPaymentData(payRes.value.data);
      else console.error("Payment Report Error:", payRes.reason);

      if (empRes.status === 'fulfilled') setEmployeeData(empRes.value.data);
      else console.error("Employee Report Error:", empRes.reason);

      if (invRes.status === 'rejected' && payRes.status === 'rejected') {
        toast.error("Data load karne mein masla aa raha hai");
      }

    } catch (err) {
      console.error("General Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const inventoryChartData = inventoryData ? [
    { name: 'Total Products', value: inventoryData.totalProducts || 0 },
    { name: 'Total Stock', value: inventoryData.totalStockQuantity || 0 },
    { name: 'Out of Stock', value: inventoryData.outOfStockItems || 0 },
  ] : [];

  if (loading) return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
        <p className="font-bold text-slate-600 uppercase tracking-widest">Analytics Load ho rahi hain...</p>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="space-y-8 pb-10">
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight italic">Enterprise Analytics</h2>
            <p className="text-slate-500 font-medium">Business performance tracking</p>
          </div>
          <button 
            onClick={fetchAllReports} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Total Products" value={inventoryData?.totalProducts} color="blue" />
          <StatCard title="Stock Volume" value={inventoryData?.totalStockQuantity} color="green" />
          <StatCard title="Out of Stock" value={inventoryData?.outOfStockItems} color="red" />
        </div>

        {/* Charts Container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Inventory Chart */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-6 border-b pb-4">Inventory Overview</h3>
            {/* Fixed height wrapper for ResponsiveContainer */}
            <div className="w-full h-[350px]"> 
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={inventoryChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11}} />
                  <Tooltip cursor={{fill: '#f8fafc'}} />
                  <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-6 border-b pb-4">Revenue by Method</h3>
            <div className="w-full h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentData}
                    nameKey="bankName"
                    dataKey="totalReceived"
                    cx="50%" cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                  >
                    {paymentData.length > 0 ? paymentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    )) : <Cell fill="#e2e8f0" />}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Performance Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-6 border-b pb-4">Top Employee Sales</h3>
            <div className="w-full h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={employeeData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="employeeName" type="category" axisLine={false} tickLine={false} tick={{fontSize: 12}} width={100} />
                  <Tooltip />
                  <Bar dataKey="totalSalesGenerated" fill="#10b981" radius={[0, 5, 5, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};

const StatCard = ({ title, value, color }) => {
  const themes = {
    blue: "border-t-blue-600 shadow-blue-50",
    green: "border-t-green-600 shadow-green-50",
    red: "border-t-red-600 shadow-red-50"
  };
  return (
    <div className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-100 border-t-4 ${themes[color]}`}>
      <p className="text-slate-400 font-bold text-xs uppercase tracking-tighter">{title}</p>
      <h4 className="text-4xl font-black text-slate-800 mt-2">{value?.toLocaleString() || 0}</h4>
    </div>
  );
};

export default Reporting;