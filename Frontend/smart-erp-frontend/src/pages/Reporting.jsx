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
        api.get('/Order'), 
        api.get('/Report/product-details')   
      ]);

      if (invRes.status === 'fulfilled') setInventorySummary(invRes.value.data);
      if (payRes.status === 'fulfilled') setPaymentData(payRes.value.data || []);
      if (custRes.status === 'fulfilled') setCustomers(custRes.value.data || []);
      if (orderRes.status === 'fulfilled') setOrders(orderRes.value.data || []);
      if (prodRes.status === 'fulfilled') setProducts(prodRes.value.data || []);

    } catch (err) {
      toast.error("Data fetch karne mein masla hua");
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Download/Export CSV Logic
  const handleDownloadCSV = () => {
    let dataToExport = [];
    let headers = "";
    let filename = `Report_${activeTab}_${new Date().toLocaleDateString()}.csv`;

    if (activeTab === 'customers') {
      headers = "Name,Email,Phone,Balance\n";
      dataToExport = customers.map(c => `${c.name},${c.email},${c.phone},${c.balance || 0}`);
    } else if (activeTab === 'inventory') {
      headers = "Product Name,Category,Stock,Price\n";
      dataToExport = products.map(p => {
        const pName = typeof p.name === 'object' ? p.name.name : p.name;
        const pCat = typeof p.category === 'object' ? p.category.name : (p.category || "General");
        return `"${pName}","${pCat}",${p.stockQuantity},${p.price}`;
      });
    } else if (activeTab === 'orders') {
      headers = "Order ID,Customer,Date,Total Amount\n";
      dataToExport = orders.map(o => `${o.id},${o.customerName || 'Walk-in'},${new Date(o.orderDate).toLocaleDateString()},${o.totalAmount}`);
    } else if (activeTab === 'banks') {
      headers = "Bank Name,Total Received,Transactions\n";
      dataToExport = paymentData.map(b => `${b.bankName},${b.totalReceived},${b.transactionCount}`);
    } else {
      // Overview/General
      headers = "Metric,Value\n";
      dataToExport = [
        `Total Products,${inventorySummary?.totalProducts || 0}`,
        `Total Stock,${inventorySummary?.totalStockQuantity || 0}`,
        `Out of Stock,${inventorySummary?.outOfStockItems || 0}`,
        `Total Sales,${orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)}`
      ];
    }

    const csvContent = "data:text/csv;charset=utf-8," + headers + dataToExport.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`${activeTab} report downloaded!`);
  };

  const totalSalesAmount = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

  if (loading) return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-12 h-12 border-4 border-[#3498db] border-t-transparent rounded-full mb-4"></div>
        <p className="font-bold text-[#2c3e50] uppercase tracking-widest">Loading Reports...</p>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="space-y-6 pb-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-[#ecf0f1] gap-4">
          <div>
            <h2 className="text-3xl font-bold text-[#2c3e50] uppercase tracking-tight">
  Enterprise Reporting
</h2>
            <p className="text-[#95a5a6] font-medium tracking-tight">Real-time business insights & system analytics</p>
          </div>
          <div className="flex gap-2">
            {/* ✅ Export CSV Button */}
            <button 
              onClick={handleDownloadCSV} 
              className="bg-[#2c3e50] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#1a252f] transition-all shadow-lg flex items-center gap-2"
            >
              <span>📥</span> Export CSV
            </button>
            <button 
              onClick={fetchAllReports} 
              className="bg-[#3498db] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#2980b9] transition-all shadow-lg shadow-[#3498db]/20 flex items-center gap-2"
            >
              <span>🔄</span> Refresh Data
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-[#ecf0f1]">
          {['overview', 'banks', 'customers', 'inventory', 'orders'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-3 font-bold capitalize transition-all border-b-4 ${
                activeTab === tab ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Products" value={inventorySummary?.totalProducts || products.length} color="blue" onClick={() => setActiveTab('inventory')} />
                <StatCard title="Active Customers" value={customers.length} color="green" onClick={() => setActiveTab('customers')} />
                <StatCard title="Total Orders" value={orders.length} color="purple" onClick={() => setActiveTab('orders')} />
                <StatCard title="Total Sales" value={`Rs. ${totalSalesAmount.toLocaleString()}`} color="red" onClick={() => setActiveTab('banks')} />
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="font-black text-slate-700 mb-6 uppercase tracking-wider text-sm">Stock Analytics</h3>
                <div style={{ width: '100%', height: '350px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'Products', val: inventorySummary?.totalProducts || products.length },
                      { name: 'Stock Qty', val: inventorySummary?.totalStockQuantity || 0 },
                      { name: 'Out of Stock', val: inventorySummary?.outOfStockItems || 0 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                      <Bar dataKey="val" fill="#3b82f6" radius={[10, 10, 0, 0]} barSize={60} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'banks' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-xl font-black mb-8 text-slate-800 uppercase italic">Revenue Distribution</h3>
                <div style={{ width: '100%', height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={paymentData} 
                        nameKey="bankName" 
                        dataKey="totalReceived" 
                        cx="50%" 
                        cy="50%" 
                        innerRadius={70} 
                        outerRadius={100} 
                        paddingAngle={8}
                      >
                        {paymentData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        formatter={(value) => `Rs. ${value.toLocaleString()}`}
                      />
                      <Legend verticalAlign="bottom" iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <h3 className="text-xl font-black text-slate-800 uppercase italic mb-6">Bank Ledger</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-separate border-spacing-y-2">
                    <thead>
                      <tr className="text-slate-400 text-[10px] uppercase font-black tracking-widest">
                        <th className="pb-4">Institution</th>
                        <th className="pb-4 text-right">Total Collection</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentData.length > 0 ? paymentData.map((bank, i) => (
                        <tr key={i} className="group hover:bg-slate-50 transition-all rounded-xl">
                          <td className="py-4 pl-4 rounded-l-xl bg-slate-50/50 group-hover:bg-blue-50/50">
                            <span className="font-black text-slate-700 uppercase">{bank.bankName || "Unknown Bank"}</span>
                          </td>
                          <td className="py-4 text-right pr-4 rounded-r-xl bg-slate-50/50 group-hover:bg-blue-50/50">
                            <span className="text-green-600 font-black">Rs. {bank.totalReceived?.toLocaleString() || 0}</span>
                          </td>
                        </tr>
                      )) : <NoDataFound />}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'customers' && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-in fade-in duration-500">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-900 text-white text-[10px] uppercase font-black tracking-widest">
                  <tr>
                    <th className="p-5">Customer Profile</th>
                    <th className="p-5">Contact Details</th>
                    <th className="p-5 text-right">Outstanding Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customers.length > 0 ? customers.map((c, i) => (
                    <tr key={i} className="hover:bg-slate-50/80 transition-all">
                      <td className="p-5">
                        <div className="font-black text-slate-800 text-lg">{c.name}</div>
                        <div className="text-xs text-blue-500 font-bold uppercase">{c.customerType || 'Retail'}</div>
                      </td>
                      <td className="p-5">
                        <div className="text-slate-600 font-medium">{c.email}</div>
                        <div className="text-slate-400 text-sm font-bold">{c.phone}</div>
                      </td>
                      <td className="p-5 text-right font-black text-2xl text-slate-900">
                        <span className="text-sm font-bold text-slate-400 mr-2 block mb-1">Rs.</span>
                        {c.balance?.toLocaleString() || 0}
                      </td>
                    </tr>
                  )) : <NoDataFound />}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-in fade-in duration-500">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 border-b">
                  <tr>
                    <th className="p-5">Product Info</th>
                    <th className="p-5">Category</th>
                    <th className="p-5 text-center">Stock Level</th>
                    <th className="p-5 text-right">Unit Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {products.length > 0 ? products.map((p, i) => (
                    <tr key={i} className="hover:bg-blue-50/30 transition-all">
                      <td className="p-5 font-bold text-slate-800">
                        {typeof p.name === 'object' ? p.name.name : p.name}
                      </td>
                      <td className="p-5">
                        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
                          {typeof p.category === 'object' ? p.category.name : (p.category || "General")}
                        </span>
                      </td>
                      <td className="p-5 text-center">
                        <div className={`inline-flex items-center px-4 py-1.5 rounded-xl font-black text-xs border-2 ${
                          p.stockQuantity < 10 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'
                        }`}>
                          {p.stockQuantity} UNITS
                        </div>
                      </td>
                      <td className="p-5 text-right font-black text-slate-900">Rs. {p.price?.toLocaleString()}</td>
                    </tr>
                  )) : <NoDataFound />}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-in fade-in duration-500">
              <table className="w-full text-left">
                <thead className="bg-indigo-900 text-white text-[10px] font-black uppercase tracking-widest">
                  <tr>
                    <th className="p-5">Order ID</th>
                    <th className="p-5">Customer</th>
                    <th className="p-5">Date</th>
                    <th className="p-5 text-right">Total Bill</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {orders.length > 0 ? orders.map((o, i) => (
                    <tr key={i} className="hover:bg-indigo-50/50 transition-all">
                      <td className="p-5 font-black text-indigo-600">#ORD-{o.id}</td>
                      <td className="p-5 font-bold text-slate-700">{o.customerName || "Walk-in"}</td>
                      <td className="p-5 text-slate-400 font-bold">{new Date(o.orderDate).toLocaleDateString()}</td>
                      <td className="p-5 text-right font-black text-lg text-slate-900">Rs. {o.totalAmount?.toLocaleString()}</td>
                    </tr>
                  )) : <NoDataFound />}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

const StatCard = ({ title, value, color, onClick }) => {
  const themes = {
    blue: "border-t-blue-600 shadow-blue-50 hover:border-blue-300",
    green: "border-t-green-500 shadow-green-50 hover:border-green-300",
    purple: "border-t-purple-600 shadow-purple-50 hover:border-purple-300",
    red: "border-t-red-500 shadow-red-50 hover:border-red-300"
  };
  return (
    <div 
      onClick={onClick}
      className={`bg-white p-6 rounded-3xl shadow-sm border border-slate-100 border-t-8 cursor-pointer transform transition-all hover:-translate-y-2 active:scale-95 group ${themes[color]}`}
    >
      <div className="flex justify-between items-start mb-4">
        <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">{title}</p>
        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300">→</span>
      </div>
      <h4 className="text-2xl font-black text-slate-800 break-words">{value || 0}</h4>
      <div className="mt-4 w-10 h-1 bg-slate-100 rounded-full group-hover:w-full transition-all duration-500"></div>
    </div>
  );
};

const NoDataFound = () => (
  <tr>
    <td colSpan="100%" className="p-20 text-center">
      <div className="text-slate-300 text-5xl mb-4">📂</div>
      <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Invalid Data</p>
    </td>
  </tr>
);

export default Reporting;