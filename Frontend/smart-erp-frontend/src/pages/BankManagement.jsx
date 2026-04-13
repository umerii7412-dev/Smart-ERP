import React, { useEffect, useState, useCallback } from 'react';
import Layout from '../components/Layout';
import api from '../api';
import Swal from 'sweetalert2';
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
      Swal.fire({
        title: 'Error',
        text: 'Banks loading Failed!',
        icon: 'error',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false
      });
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
      Swal.fire({
        title: 'Updated!',
        text: 'Tax Rate Updated Successfully!',
        icon: 'success',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false
      });
      setEditingTaxId(null);
      fetchBanks();
    } catch (err) {
      Swal.fire({
        title: 'Failed',
        text: 'Update failed!',
        icon: 'error',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false
      });
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
      Swal.fire({
        title: 'Success!',
        text: 'Bank Added Successfully!',
        icon: 'success',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false
      });
      setShowAddModal(false);
      setNewBank({ bankName: '', taxPercentage: 0, currentBalance: 0 });
      fetchBanks();
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: 'Error adding bank',
        icon: 'error',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false
      });
    }
  };

  const handleDeleteBank = async (bank) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `Delete "${bank.bankName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#003354',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/Bank/${bank.id}`);
          Swal.fire({
            title: 'Deleted!',
            text: 'Bank deleted successfully.',
            icon: 'success',
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false
          });
          fetchBanks();
        } catch (err) {
          Swal.fire({
            title: 'Error',
            text: 'Delete failed!',
            icon: 'error',
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false
          });
        }
      }
    });
  };

  if (loading) return <Layout><div className="flex h-[60vh] items-center justify-center"><Loader2 className="animate-spin text-[#003354]" size={40}/></div></Layout>;

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex justify-between items-center bg-white p-8 rounded-[32px] shadow-sm border border-[#ecf0f1]">
          <div>
            <h1 className="text-2xl font-black text-[#003354] tracking-tight">Payment Methods</h1>
            <p className="text-[#95a5a6] font-bold text-[10px] tracking-widest mt-1 capitalize opacity-80">Manage banks and tax rates</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)} 
            className="bg-[#003354] text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-lg shadow-slate-200 capitalize tracking-wide text-[13px] transition-all hover:opacity-90 active:scale-95"
          >
            <Plus size={18} /> Add New Bank
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {banks.map((bank) => (
            <div key={bank.id} className="bg-white p-6 rounded-[32px] relative group border border-[#ecf0f1] shadow-sm hover:shadow-lg transition-all duration-500 hover:-translate-y-1 overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-slate-50 rounded-[18px] text-[#003354] group-hover:bg-[#003354] group-hover:text-white transition-all duration-500 shadow-inner border border-slate-100">
                  <Landmark size={22} />
                </div>
                <button 
                  onClick={() => handleDeleteBank(bank)} 
                  className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <h3 className="text-lg font-black text-[#2c3e50] mb-4 tracking-tight truncate" title={bank.bankName}>
                {bank.bankName}
              </h3>
              
              <div className="p-4 bg-[#f5f7fa]/50 rounded-[22px] border border-[#ecf0f1]/50">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black text-[#95a5a6] capitalize tracking-widest">Tax Rate</span>
                  {editingTaxId === bank.id ? (
                    <div className="flex items-center gap-1">
                      <input 
                        type="number" 
                        className="w-14 bg-white border border-[#003354] rounded-lg p-1 text-xs font-bold text-center outline-none" 
                        value={tempTax} 
                        onChange={(e) => setTempTax(e.target.value)} 
                      />
                      <button onClick={() => handleUpdateTax(bank.id)} className="p-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-all">
                        <Save size={14}/>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-black text-[#003354]">{bank.taxPercentage}%</span>
                      <button onClick={() => { setEditingTaxId(bank.id); setTempTax(bank.taxPercentage); }} className="p-1.5 text-slate-400 hover:text-[#003354] hover:bg-white rounded-md transition-all">
                        <Settings2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-br from-slate-100 to-transparent rounded-full -mr-6 -mb-6 opacity-40 pointer-events-none"></div>
            </div>
          ))}
        </div>

        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-6">
            <div className="bg-white rounded-[40px] overflow-hidden w-full max-w-lg shadow-2xl">
              <div className="p-8 bg-[#003354] text-white flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-black tracking-widest">New Method</h3>
                  <p className="text-slate-400 text-[10px] font-bold mt-1 capitalize">Enter bank account details</p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X size={24} /></button>
              </div>
              <form onSubmit={handleAddBank} className="p-10 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#95a5a6] capitalize tracking-[0.1em] ml-2">Bank Name</label>
                  <input 
                    required 
                    placeholder="e.g. HBL Account"
                    className="w-full bg-[#f5f7fa] border-2 border-[#ecf0f1] rounded-2xl p-5 font-bold outline-none focus:border-[#003354] focus:bg-white transition-all text-sm" 
                    onChange={(e) => setNewBank({...newBank, bankName: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#95a5a6] capitalize tracking-[0.1em] ml-2">Tax Rate (%)</label>
                  <input 
                    type="number" 
                    placeholder="0.00"
                    className="w-full bg-[#f5f7fa] border-2 border-[#ecf0f1] rounded-2xl p-5 font-bold outline-none focus:border-[#003354] focus:bg-white transition-all text-sm" 
                    onChange={(e) => setNewBank({...newBank, taxPercentage: e.target.value})} 
                  />
                </div>
                <button type="submit" className="w-full bg-[#003354] text-white py-5 rounded-[24px] font-black capitalize tracking-widest text-[13px] hover:opacity-95 transition-all shadow-xl active:scale-95">
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