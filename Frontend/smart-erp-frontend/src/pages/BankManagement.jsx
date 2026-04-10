import React, { useEffect, useState, useCallback } from 'react';
import Layout from '../components/Layout';
import api from '../api';
import toast from 'react-hot-toast';
import { Landmark, Plus, Settings2, Save, X, Trash2, Loader2 } from 'lucide-react';

const BankManagement = () => {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTaxId, setEditingTaxId] = useState(null);
  const [tempTax, setTempTax] = useState(0);

  const [newBank, setNewBank] = useState({ bankName: '', taxPercentage: 0, currentBalance: 0 });

  const fetchBanks = useCallback(async () => {
    try {
      const res = await api.get('/Bank');
      setBanks(res.data || []);
    } catch (err) {
      toast.error("Banks loading Failed!");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBanks(); }, [fetchBanks]);

  const handleUpdateTax = async (id) => {
    try {
      const bankData = banks.find(b => b.id === id);
      const payload = { ...bankData, taxPercentage: parseFloat(tempTax) };
      await api.put(`/Bank/${id}`, payload);
      toast.success("Tax Rate Updated!");
      setEditingTaxId(null);
      fetchBanks();
    } catch (err) {
      toast.error("Updated fail!");
    }
  };

  const handleAddBank = async (e) => {
    e.preventDefault();
    try {
      await api.post('/Bank', {
        bankName: newBank.bankName,
        currentBalance: parseFloat(newBank.currentBalance),
        taxPercentage: parseFloat(newBank.taxPercentage)
      });
      toast.success("Bank Added Successfully!");
      setShowAddModal(false);
      setNewBank({ bankName: '', taxPercentage: 0, currentBalance: 0 });
      fetchBanks();
    } catch (err) {
      toast.error("Bank added Error");
    }
  };

  if (loading) return <Layout><div className="flex h-[60vh] items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40}/></div></Layout>;

  return (
    <Layout>
      <div className="space-y-10">
        {/* Header Section */}
        <div className="flex justify-between items-center bg-white p-10 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-100">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Payment Methods</h1>
            <p className="text-slate-400 font-bold text-sm tracking-tight mt-1">Manage banks and applicable tax rates</p>
          </div>
          <button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white px-10 py-5 rounded-[24px] font-black flex items-center gap-3 shadow-2xl shadow-blue-200 uppercase text-xs transition-all hover:bg-blue-700 active:scale-95">
            <Plus size={20} /> Add New Bank
          </button>
        </div>

        {/* Bank Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {banks.map((bank) => (
            <div key={bank.id} className="bg-white p-10 rounded-[45px] relative group border border-slate-50 shadow-[0_10px_40px_rgba(0,0,0,0.02)] hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500 hover:-translate-y-2">
              <div className="flex justify-between items-start mb-8">
                <div className="p-5 bg-blue-50 rounded-[25px] text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-inner">
                  <Landmark size={28} />
                </div>
                <button 
                  onClick={async () => { if(window.confirm("Delete this bank?")) { await api.delete(`/Bank/${bank.id}`); fetchBanks(); } }} 
                  className="p-2 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              <h3 className="text-2xl font-black text-slate-800 uppercase italic mb-8 tracking-tight">{bank.bankName}</h3>
              
              <div className="space-y-2 p-6 bg-slate-50/50 rounded-[30px] border border-slate-100/50">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tax Percentage</span>
                  {editingTaxId === bank.id ? (
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        className="w-20 bg-white border-2 border-blue-200 rounded-xl p-2 text-sm font-black text-center focus:ring-0 outline-none" 
                        value={tempTax} 
                        onChange={(e) => setTempTax(e.target.value)} 
                      />
                      <button onClick={() => handleUpdateTax(bank.id)} className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100">
                        <Save size={18}/>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-black text-slate-800 italic">{bank.taxPercentage}%</span>
                      <button onClick={() => { setEditingTaxId(bank.id); setTempTax(bank.taxPercentage); }} className="p-2 text-slate-300 hover:text-blue-600 hover:bg-white rounded-lg transition-all">
                        <Settings2 size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Decorative gradient element */}
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-transparent rounded-full -mr-10 -mb-10 opacity-50"></div>
            </div>
          ))}
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-in fade-in duration-300">
            <div className="bg-white rounded-[50px] overflow-hidden w-full max-w-xl shadow-[0_50px_100px_rgba(0,0,0,0.2)]">
              <div className="p-10 bg-[#0f172a] text-white flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black uppercase italic tracking-widest">New Method</h3>
                  <p className="text-slate-400 text-xs font-bold mt-1 uppercase">Enter bank account details</p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-3 hover:bg-slate-800 rounded-2xl transition-all"><X size={28} /></button>
              </div>
              <form onSubmit={handleAddBank} className="p-12 space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Account/Bank Name</label>
                  <input 
                    required 
                    placeholder="e.g. HBL Main Account"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-[25px] p-6 font-bold outline-none focus:border-blue-500 focus:bg-white transition-all" 
                    onChange={(e) => setNewBank({...newBank, bankName: e.target.value})} 
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Tax Rate (%)</label>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-[25px] p-6 font-bold outline-none focus:border-blue-500 focus:bg-white transition-all" 
                      onChange={(e) => setNewBank({...newBank, taxPercentage: e.target.value})} 
                    />
                  </div>
                  {/* <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Opening Balance</label>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-[25px] p-6 font-bold outline-none focus:border-blue-500 focus:bg-white transition-all" 
                      onChange={(e) => setNewBank({...newBank, currentBalance: e.target.value})} 
                    />
                  </div> */}
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white py-7 rounded-[30px] font-black uppercase tracking-widest text-sm hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 active:scale-[0.98]">
                  Confirm & Save Method
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BankManagement;