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
      const [invRes, payRes, empRes] = await Promise.all([
        api.get('/Report/inventory-summary'),
        api.get('/Report/payment-by-methods'),
        api.get('/Report/employee-performance')
      ]);

      setInventoryData(invRes.data);
      setPaymentData(payRes.data);
      setEmployeeData(empRes.data);
    } catch (err) {
      toast.error("Reports load karne mein masla hua!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <Layout>
      <div className="p-20 text-center">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
        <p className="font-bold text-slate-600">Loading Analytical Reports...</p>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="space-y-10 pb-10">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black text-slate-800">Enterprise Reporting</h2>
            <p className="text-slate-500">Track your business performance and inventory health</p>
          </div>
          <button 
            onClick={fetchAllReports} 
            className="bg-white border border-slate-200 text-slate-700 px-5 py-2 rounded-lg font-bold shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2"
          >
            🔄 Refresh Data
          </button>
        </div>

        {/* 1. Inventory Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 border-t-4 border-t-blue-500 transition-transform hover:-translate-y-1">
            <p className="text-slate-500 font-bold text-sm uppercase tracking-wider">Total Products</p>
            <h4 className="text-4xl font-black text-slate-800 mt-2">{inventoryData?.totalProducts || 0}</h4>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 border-t-4 border-t-green-500 transition-transform hover:-translate-y-1">
            <p className="text-slate-500 font-bold text-sm uppercase tracking-wider">Total Stock Volume</p>
            <h4 className="text-4xl font-black text-slate-800 mt-2">{inventoryData?.totalStockQuantity || 0}</h4>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 border-t-4 border-t-red-500 transition-transform hover:-translate-y-1">
            <p className="text-slate-500 font-bold text-sm uppercase tracking-wider">Out of Stock</p>
            <h4 className="text-4xl font-black text-red-600 mt-2">{inventoryData?.outOfStockItems || 0}</h4>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 2. Payment Methods (Pie Chart) */}
          <div className="bg-white p-8 rounded-3xl shadow-md border border-slate-50">
            <h3 className="text-xl font-bold text-slate-800 mb-6 border-b pb-4">Revenue by Payment Method</h3>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentData}
                    nameKey="bankName"
                    dataKey="totalReceived"
                    cx="50%" cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={8}
                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {paymentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 3. Employee Performance (Bar Chart) */}
          <div className="bg-white p-8 rounded-3xl shadow-md border border-slate-50">
            <h3 className="text-xl font-bold text-slate-800 mb-6 border-b pb-4">Sales by Employee</h3>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={employeeData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="employeeName" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip cursor={{fill: '#f8fafc'}} />
                  <Bar dataKey="totalSalesGenerated" fill="#2563eb" radius={[10, 10, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Reporting;