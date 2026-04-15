import React, { useEffect, useState } from 'react';
import { getAllExpenses, addExpense } from '../api'; 
import Layout from '../components/Layout'; 
import Swal from 'sweetalert2';

const ExpenseManagement = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const [newExpense, setNewExpense] = useState({
    title: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const controller = new AbortController();
    loadExpenses(controller.signal);
    return () => controller.abort();
  }, []);

  const loadExpenses = async (signal) => {
    try {
      const res = await getAllExpenses({ signal });
      setExpenses(res.data);
    } catch (err) {
      if (err.name !== 'CanceledError') {
        Swal.fire('Error', 'Expenses loading failed!', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      await addExpense(newExpense);
      Swal.fire({ title: 'Success', text: 'Expense Recorded!', icon: 'success', timer: 2000, showConfirmButton: false });
      setShowModal(false);
      setNewExpense({ title: '', amount: '', description: '', date: new Date().toISOString().split('T')[0] });
      loadExpenses();
    } catch (err) {
      Swal.fire('Error', 'Failed to add expense!', 'error');
    }
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-[#003354]">Expense Management</h1>
            <p className="text-[#95a5a6] text-sm font-medium mt-1">Track your business spending with dates</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-[#003354] text-white px-6 py-3 rounded-2xl text-sm font-black shadow-lg hover:opacity-90 transition-all active:scale-95"
          >
            + Add Expense
          </button>
        </div>

        <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#003354]">
              <tr className="text-[12px] font-[950] text-white tracking-wider ">
                <th className="p-6">Title</th>
                <th className="p-6">Description</th>
                <th className="p-6">Amount</th>
                <th className="p-6 text-center">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50 transition-all border-b border-[#ecf0f1]">
                  {/* 1. Title Column */}
                  <td className="p-6 font-semibold text-[#2c3e50]">
                    {exp.title}
                  </td>
                  
                  {/* 2. Description Column */}
                  <td className="p-6 text-[11px] text-[#95a5a6] font-bold ">
                    {exp.description || '---'}
                  </td>

                  {/* 3. Amount Column */}
                  <td className="p-6 font-bold text-[#003354]">
                    {Number(exp.amount).toLocaleString()}
                  </td>

                  {/* 4. Date Column */}
                  <td className="p-6 text-center text-[11px] text-slate-500 font-black">
                    {new Date(exp.date).toLocaleDateString('en-GB')} {/* Format: DD/MM/YYYY */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {expenses.length === 0 && !loading && (
            <div className="p-10 text-center text-slate-400 font-medium">No expenses found.</div>
          )}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
              <div className="bg-[#003354] p-6 text-white flex justify-between items-center">
                <h2 className="text-xl font-black">Record Expense</h2>
                <button onClick={() => setShowModal(false)} className="text-2xl hover:rotate-90 transition-transform">×</button>
              </div>
              <form onSubmit={handleAddExpense} className="p-8 space-y-5 overflow-y-auto max-h-[80vh]">
                <div>
                  <label className="text-[11px] font-black text-slate-400 ml-1 uppercase">Date</label>
                  <input type="date" required className="w-full bg-slate-50 border-none rounded-2xl p-4 mt-1 text-sm font-bold focus:ring-2 focus:ring-[#003354] outline-none" 
                    value={newExpense.date} onChange={(e) => setNewExpense({...newExpense, date: e.target.value})} />
                </div>
                <div>
                  <label className="text-[11px] font-black text-slate-400 ml-1 uppercase">Title</label>
                  <input required placeholder="Office Supplies" className="w-full bg-slate-50 border-none rounded-2xl p-4 mt-1 text-sm font-bold focus:ring-2 focus:ring-[#003354] outline-none" 
                    value={newExpense.title} onChange={(e) => setNewExpense({...newExpense, title: e.target.value})} />
                </div>
                <div>
                  <label className="text-[11px] font-black text-slate-400 ml-1 uppercase">Amount</label>
                  <input required type="number" placeholder="0" className="w-full bg-slate-50 border-none rounded-2xl p-4 mt-1 text-sm font-bold focus:ring-2 focus:ring-[#003354] outline-none" 
                    value={newExpense.amount} onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})} />
                </div>
                <div>
                  <label className="text-[11px] font-black text-slate-400 ml-1 uppercase">Description</label>
                  <textarea placeholder="Details..." className="w-full bg-slate-50 border-none rounded-2xl p-4 mt-1 text-sm font-bold focus:ring-2 focus:ring-[#003354] outline-none" 
                    rows="2" value={newExpense.description} onChange={(e) => setNewExpense({...newExpense, description: e.target.value})} />
                </div>
                <button type="submit" className="w-full bg-[#003354] text-white py-4 rounded-2xl font-black text-xs shadow-lg hover:opacity-90 transition-all">
                  Save Expense
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ExpenseManagement;