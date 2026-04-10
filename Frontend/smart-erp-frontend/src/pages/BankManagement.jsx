import React, { useEffect, useState, useCallback } from 'react';
import Layout from '../components/Layout';
import api from '../api';
import toast from 'react-hot-toast';
import { Landmark, Plus, Settings2, Save, X, Trash2, Percent, Loader2 } from 'lucide-react';

const BankManagement = () => {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTaxId, setEditingTaxId] = useState(null);
  const [tempTax, setTempTax] = useState(0);

  const [newBank, setNewBank] = useState({
    bankName: '',
    taxPercentage: 0,
    currentBalance: 0 
  });

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
      // Direct payload sending based on your model
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

  if (loading) return <Layout><div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40}/></div></Layout>;

  return (
    <Layout>
      <div className="p-8 bg-[#F8FAFC] min-h-screen">
        <div className="flex justify-between items-center mb-8 bg-white p-8 rounded-[30px] shadow-sm border border-slate-100">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic font-serif">Payment Method</h1>
          <button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-lg shadow-blue-100 uppercase text-xs transition-transform active:scale-95">
            <Plus size={18} /> Add Method
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {banks.map((bank) => (
            <div key={bank.id} className="bg-white rounded-[35px] border border-slate-100 p-8 shadow-sm relative group overflow-hidden">
              <div className="flex justify-between mb-6">
                <div className="p-4 bg-slate-50 group-hover:bg-blue-50 rounded-2xl transition-colors">
                  <Landmark size={24} className="text-slate-400 group-hover:text-blue-600" />
                </div>
                <button onClick={async () => { if(window.confirm("Delete?")) { await api.delete(`/Bank/${bank.id}`); fetchBanks(); } }} className="text-slate-200 hover:text-red-500"><Trash2 size={18} /></button>
              </div>

              <h3 className="text-xl font-black text-slate-800 uppercase italic mb-6">{bank.bankName}</h3>
              
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase">Applicable Tax</span>
                {editingTaxId === bank.id ? (
                  <div className="flex items-center gap-2">
                    <input type="number" className="w-16 bg-white border-2 border-blue-100 rounded-lg p-1 text-xs font-black text-center" value={tempTax} onChange={(e) => setTempTax(e.target.value)} />
                    <button onClick={() => handleUpdateTax(bank.id)} className="text-emerald-600"><Save size={18}/></button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-slate-800 italic">{bank.taxPercentage}%</span>
                    <button onClick={() => { setEditingTaxId(bank.id); setTempTax(bank.taxPercentage); }} className="text-slate-300 hover:text-blue-600"><Settings2 size={16} /></button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden">
              <div className="p-6 bg-slate-900 text-white flex justify-between">
                <h3 className="text-lg font-black uppercase italic tracking-widest">Add Bank</h3>
                <button onClick={() => setShowAddModal(false)}><X size={24} /></button>
              </div>
              <form onSubmit={handleAddBank} className="p-10 space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase">Bank Name</label>
                  <input required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none" onChange={(e) => setNewBank({...newBank, bankName: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase">Tax Rate (%)</label>
                    <input type="number" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none" onChange={(e) => setNewBank({...newBank, taxPercentage: e.target.value})} />
                  </div>
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all">Save Payment Method</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BankManagement;