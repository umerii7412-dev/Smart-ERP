import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api'; 
import toast from 'react-hot-toast';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Landmark, ArrowUpRight, ArrowDownLeft, History, FilterX, TrendingUp } from 'lucide-react';

const BankManagement = () => {
  const [banks, setBanks] = useState([]); 
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBankId, setSelectedBankId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [banksRes, transRes] = await Promise.all([
        api.get('/Bank'), 
        api.get('/Bank/Transactions') 
      ]);
      setBanks(banksRes.data);
      setTransactions(transRes.data || []);
    } catch (err) {
      toast.error("Data load karne mein masla hua");
    } finally {
      setLoading(false);
    }
  };

  const totalBalance = banks.reduce((sum, b) => sum + (b.currentBalance || 0), 0);

  const filteredTransactions = selectedBankId 
    ? transactions.filter(t => t.bank?.id === selectedBankId)
    : transactions;

  return (
    <Layout>
      <div className="p-8 bg-[#F8FAFC] min-h-screen space-y-8 animate-in fade-in duration-500">
        
        {/* --- TOP SECTION: Stats & Full Width Chart --- */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1 font-serif">Financial Overview</p>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight italic uppercase">
                {totalBalance.toLocaleString()}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 text-emerald-600 px-4 py-2 rounded-2xl flex items-center gap-2 shadow-sm border border-emerald-200">
                <TrendingUp size={16} />
                <span className="text-xs font-black uppercase tracking-tighter italic font-serif">Live Balance</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm flex flex-col h-[350px] relative overflow-hidden group">
            <div className="flex justify-between items-center mb-6 relative z-10">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2 italic font-serif">
                <History size={14} /> {selectedBankId ? 'Method Specific Analytics' : 'Global Cash Flow Analysis'}
              </h3>
              {selectedBankId && (
                <button 
                  onClick={() => setSelectedBankId(null)} 
                  className="text-[9px] font-black text-blue-600 uppercase flex items-center gap-1 bg-blue-50 px-4 py-2 rounded-full hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                >
                  <FilterX size={12} /> Clear Filter
                </button>
              )}
            </div>
            
            <div className="flex-1 w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredTransactions.slice(0, 20).reverse()}>
                  <defs>
                    <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="transactionDate" hide />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{ stroke: '#2563eb', strokeWidth: 2 }}
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                    formatter={(value) => [value.toLocaleString(), 'Amount']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#2563eb" 
                    fill="url(#colorAmt)" 
                    strokeWidth={4}
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-50 -mr-16 -mt-16 group-hover:bg-blue-100 transition-colors"></div>
          </div>
        </div>

        {/* --- MIDDLE SECTION: Bank/Method Cards --- */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-black uppercase text-slate-800 tracking-tighter italic font-serif">Payment Methods</h3>
            <span className="bg-slate-900 text-white text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest italic">{banks.length} Connected</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {banks.map((bank) => (
              <div 
                key={bank.id} 
                onClick={() => setSelectedBankId(selectedBankId === bank.id ? null : bank.id)}
                className={`cursor-pointer p-6 rounded-[28px] shadow-sm border-2 transition-all duration-300 active:scale-95 group ${
                  selectedBankId === bank.id 
                  ? 'bg-slate-900 border-slate-900 text-white -translate-y-2 shadow-xl' 
                  : 'bg-white border-transparent hover:border-blue-600 hover:shadow-md'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <p className={`text-[10px] font-black uppercase tracking-widest ${selectedBankId === bank.id ? 'text-blue-400' : 'text-slate-400 group-hover:text-blue-600'}`}>
                    {bank.bankName}
                  </p>
                  <div className={`p-2 rounded-xl transition-colors ${selectedBankId === bank.id ? 'bg-white/10' : 'bg-slate-50 group-hover:bg-blue-50'}`}>
                    <Landmark size={14} className={selectedBankId === bank.id ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'} />
                  </div>
                </div>
                <h2 className={`text-2xl font-black ${selectedBankId === bank.id ? 'text-white' : 'text-slate-800'}`}>
                  {bank.currentBalance?.toLocaleString() || 0}
                </h2>
                <div className="mt-4 flex items-center justify-between">
                  <span className={`text-[9px] font-black uppercase tracking-tighter italic ${selectedBankId === bank.id ? 'text-blue-300' : 'text-blue-500'}`}>
                    {selectedBankId === bank.id ? 'Filtering Active' : 'Select to filter'}
                  </span>
                  <div className={`w-6 h-1 rounded-full transition-all ${selectedBankId === bank.id ? 'bg-blue-400 w-10' : 'bg-slate-100 group-hover:bg-blue-200'}`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- BOTTOM SECTION: Transaction Log --- */}
        <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <h3 className="text-sm font-black uppercase text-slate-800 tracking-wider italic font-serif">
              {selectedBankId ? 'Detailed Ledger' : 'Recent Activities'}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50">
                <tr className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em]">
                  <th className="px-8 py-5">Transaction Activity</th>
                  <th className="px-8 py-5 text-center">Method Source</th>
                  <th className="px-8 py-5 text-center">Flow Type</th>
                  <th className="px-8 py-5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredTransactions.map((t, i) => (
                  <tr key={i} className="hover:bg-slate-50/80 transition-all group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-2xl transition-transform group-hover:scale-110 ${t.type === 'Credit' ? 'bg-emerald-50 text-emerald-600 shadow-sm shadow-emerald-100' : 'bg-rose-50 text-rose-600 shadow-sm shadow-rose-100'}`}>
                          {t.type === 'Credit' ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800 uppercase tracking-tight group-hover:text-blue-600 transition-colors italic">
                            {t.description}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mt-0.5">
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            {new Date(t.transactionDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className="text-[9px] font-black text-slate-500 uppercase bg-slate-100 px-4 py-1.5 rounded-full border border-slate-200 shadow-sm">
                        {t.bank?.bankName || 'N/A'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-tighter ${
                        t.type === 'Credit' ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${t.type === 'Credit' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                        {t.type === 'Credit' ? 'Deposit' : 'Expense'}
                      </div>
                    </td>
                    <td className={`px-8 py-5 text-right font-black text-sm ${t.type === 'Credit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      <span className="font-serif italic">{t.type === 'Credit' ? '+' : '-'}</span>{t.amount.toLocaleString()}
                    </td>
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

export default BankManagement;