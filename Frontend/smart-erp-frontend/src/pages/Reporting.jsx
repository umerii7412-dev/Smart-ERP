import React, { useEffect, useState } from 'react';
import api from '../api';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const Reporting = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  
  // Data States
  const [inventorySummary, setInventorySummary] = useState(null);
  const [paymentData, setPaymentData] = useState([]); 
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchAllReports();
  }, []);

  const fetchAllReports = async () => {
    setLoading(true);
    try {
      const [invRes, payRes, custRes, orderRes, prodRes] = await Promise.allSettled([
        api.get('/Report/inventory-summary'),
        api.get('/Report/payment-by-methods'),
        api.get('/Report/customer-report'), 
        api.get('/Bank/Transactions'), 
        api.get('/Report/product-details')   
      ]);

      if (invRes.status === 'fulfilled') setInventorySummary(invRes.value.data);
      if (payRes.status === 'fulfilled') setPaymentData(payRes.value.data);
      if (custRes.status === 'fulfilled') setCustomers(custRes.value.data);
      if (orderRes.status === 'fulfilled') setOrders(orderRes.value.data);
      if (prodRes.status === 'fulfilled') setProducts(prodRes.value.data);

    } catch (err) {
      toast.error("Data loading error");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    const reportDate = new Date().toLocaleDateString();
    let csvContent = "data:text/csv;charset=utf-8,";
    
    if (activeTab === 'customers') {
      csvContent += "Customer Name,Email,Phone,Balance\n";
      customers.forEach(c => csvContent += `${c.name},${c.email},${c.phone},${c.balance || 0}\n`);
    } else if (activeTab === 'inventory') {
      csvContent += "Product Name,Category,Total Stock,Price\n";
      products.forEach(p => {
        const pName = typeof p.name === 'object' ? p.name.name : p.name;
        const pCat = typeof p.category === 'object' ? p.category.name : p.category;
        csvContent += `${pName},${pCat},${p.stockQuantity},${p.price}\n`;
      });
    } else {
      csvContent += "Report Summary\nTotal Products," + (inventorySummary?.totalProducts || 0);
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ERP_${activeTab}_Report_${reportDate}.csv`);
    document.body.appendChild(link);
    link.click();
    toast.success("Downloaded Successfully");
  };

  if (loading) return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
        <p className="font-bold text-slate-600 uppercase">Generating Reports...</p>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="space-y-6 pb-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100 gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-800 italic">Enterprise Reporting</h2>
            <p className="text-slate-500 font-medium">Detailed business insights & tracking</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleDownloadCSV} className="bg-slate-800 text-white px-5 py-2 rounded-xl font-bold flex items-center gap-2 transition-all hover:bg-black">
              📥 Export CSV
            </button>
            <button onClick={fetchAllReports} className="bg-blue-600 text-white px-5 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all">
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
          {['overview', 'banks', 'customers', 'inventory', 'orders'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-t-lg font-bold capitalize transition-all ${
                activeTab === tab ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          
          {/* 1. OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Total Products" value={inventorySummary?.totalProducts} color="blue" />
              <StatCard title="Active Customers" value={customers.length} color="green" />
              <StatCard title="Total Orders" value={orders.length} color="purple" />
              <div className="md:col-span-2 bg-white p-6 rounded-2xl border" style={{ minHeight: '400px' }}>
                <h3 className="font-bold mb-4">Inventory Summary Chart</h3>
                <div style={{ width: '100%', height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'Products', val: inventorySummary?.totalProducts || 0 },
                      { name: 'Stock', val: inventorySummary?.totalStockQuantity || 0 },
                      { name: 'OOS', val: inventorySummary?.outOfStockItems || 0 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="val" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* 2. BANK REPORT TAB */}
          {activeTab === 'banks' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border shadow-sm">
                <h3 className="text-lg font-bold mb-6">Payment Distribution by Bank</h3>
                <div style={{ width: '100%', height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={paymentData} nameKey="bankName" dataKey="totalReceived" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                        {paymentData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border shadow-sm">
                <h3 className="text-lg font-bold mb-4">Bank Wise Details</h3>
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="p-3">Bank Name</th>
                      <th className="p-3 text-right">Amount Received</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentData.map((bank, i) => (
                      <tr key={i} className="border-b">
                        <td className="p-3 font-semibold uppercase">{bank.bankName}</td>
                        <td className="p-3 text-right text-green-600 font-bold">Rs. {bank.totalReceived?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. CUSTOMER REPORT TAB */}
          {activeTab === 'customers' && (
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-800 text-white text-xs uppercase font-bold">
                  <tr>
                    <th className="p-4">Customer Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Contact</th>
                    <th className="p-4 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {customers.map((c, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-4 font-bold text-slate-700">{c.name}</td>
                      <td className="p-4 text-slate-500">{c.email}</td>
                      <td className="p-4 text-slate-500">{c.phone}</td>
                      <td className="p-4 text-right font-black text-blue-600">Rs. {c.balance || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 4. PRODUCT/INVENTORY REPORT TAB */}
          {activeTab === 'inventory' && (
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
               <table className="w-full text-left">
                <thead className="bg-slate-100 text-xs font-bold uppercase">
                  <tr>
                    <th className="p-4">Product Name</th>
                    <th className="p-4">Category</th>
                    <th className="p-4 text-center">Remaining Stock</th>
                    <th className="p-4 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {products.map((p, i) => (
                    <tr key={i} className="hover:bg-slate-50 text-sm">
                      {/* ✅ FIX: Safety check for Name and Category Objects */}
                      <td className="p-4 font-semibold">
                        {typeof p.name === 'object' ? p.name.name : p.name}
                      </td>
                      <td className="p-4">
                        {typeof p.category === 'object' ? p.category.name : (p.category || "General")}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded-full font-bold ${p.stockQuantity < 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                          {p.stockQuantity}
                        </span>
                      </td>
                      <td className="p-4 text-right font-bold">Rs. {p.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 5. ORDERS REPORT TAB */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
               <table className="w-full text-left">
                <thead className="bg-indigo-900 text-white text-xs font-bold uppercase">
                  <tr>
                    <th className="p-4">Transaction ID</th>
                    <th className="p-4">Description</th>
                    <th className="p-4">Type</th>
                    <th className="p-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {orders.map((o, i) => (
                    <tr key={i} className="hover:bg-indigo-50 text-sm">
                      <td className="p-4 font-mono font-bold text-indigo-600">#{o.id}</td>
                      <td className="p-4 font-medium">{o.description}</td>
                      <td className="p-4 italic">{o.transactionType}</td>
                      <td className="p-4 text-right font-black">Rs. {o.amount?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
};

const StatCard = ({ title, value, color }) => {
  const themes = {
    blue: "border-t-blue-600 shadow-blue-50",
    green: "border-t-green-600 shadow-green-50",
    purple: "border-t-purple-600 shadow-purple-50",
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