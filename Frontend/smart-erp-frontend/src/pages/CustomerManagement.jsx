import React, { useEffect, useState } from 'react';
import api, { getCustomers, addCustomer } from '../api'; 
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  
  const initialForm = { 
    name: '', 
    email: '', 
    phone: '', 
    address: '', 
    balance: 0
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await getCustomers(); 
      // Backend se aane wali list ko set kar rahe hain
      const customersOnly = (res.data || []).reverse(); 
      setCustomers(customersOnly);
    } catch (err) {
      toast.error("Customers Loaded Error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isDuplicate = customers.some(c => {
      // ✅ Change: userId ki jagah id use kiya hai mapping ke liye
      if (editingCustomer && c.id === editingCustomer.id) return false;
      return (
        (formData.email && c.email?.toLowerCase() === formData.email.toLowerCase()) ||
        (formData.phone && c.phone === formData.phone)
      );
    });

    if (isDuplicate) {
      return toast.error("Customer with this Email or Phone already exists!");
    }

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        balance: parseFloat(formData.balance) || 0,
      };

      if (editingCustomer) {
        // ✅ Change: userId ki jagah id pass ho rahi hai
        await api.put(`/Customers/${editingCustomer.id}`, payload);
        toast.success("Customer update Successfully");
      } else {
        await addCustomer(payload);
        toast.success("Customer added Successfully");
      }
      
      closeModal();
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData(initialForm);
    setEditingCustomer(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete?")) {
      try {
        await api.delete(`/Customers/${id}`);
        toast.success("Customer deleted Successfully");
        fetchCustomers();
      } catch (err) {
        toast.error("Delete failed");
      }
    }
  };

  const filteredCustomers = customers.filter(c => 
    (c.name?.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (c.phone?.includes(searchTerm)) ||
    (c.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Layout>
      <div className="p-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Customer Directory</h2>
            <p className="text-slate-500 text-sm">Manage your client relationships</p>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <input 
                type="text" 
                placeholder="Search customers..." 
                value={searchTerm}
                className="px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-full pr-10"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 font-bold text-lg"
                >
                  &times;
                </button>
              )}
            </div>

            <button 
              onClick={() => { setEditingCustomer(null); setFormData(initialForm); setShowModal(true); }}
              className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 whitespace-nowrap"
            >
              + Add New
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Customer Info</th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Contact Details</th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Balance</th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="4" className="p-10 text-center text-slate-400 font-bold">Loading Customers...</td></tr>
              ) : filteredCustomers.length === 0 ? (
                <tr><td colSpan="4" className="p-10 text-center text-slate-400">No customers found.</td></tr>
              ) : filteredCustomers.map((customer) => (
                // ✅ Change: Key mein customer.id use kiya hai
                <tr key={customer.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
                        {customer.name?.charAt(0).toUpperCase() || 'C'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-700 leading-none">{customer.name}</p>
                        <p className="text-[10px] text-slate-400 mt-1 max-w-[150px] truncate">{customer.address || 'No Address'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-slate-600 font-bold text-sm">{customer.phone}</p>
                    <p className="text-slate-400 text-xs">{customer.email || 'N/A'}</p>
                  </td>
                  <td className={`p-4 text-sm font-bold ${customer.balance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    Rs. {Number(customer.balance).toLocaleString() || 0}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => { setEditingCustomer(customer); setFormData({...customer}); setShowModal(true); }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => handleDelete(customer.id)} // ✅ Change: id pass ho rahi hai
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl">
              <h3 className="text-2xl font-black text-slate-800 mb-6">
                {editingCustomer ? 'Update Customer' : 'Add New Customer'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Full Name</label>
                      <input 
                        required type="text" value={formData.name || ''}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Email</label>
                      <input 
                        type="email" value={formData.email || ''}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="example@mail.com"
                      />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Phone</label>
                    <input 
                      required type="text" value={formData.phone || ''}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Balance</label>
                    <input 
                      type="number" value={formData.balance || 0}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      onChange={(e) => setFormData({...formData, balance: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Full Address</label>
                  <textarea 
                    rows="2"
                    value={formData.address || ''}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Shop #, Street, City..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button" onClick={closeModal}
                    className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                  >
                    {editingCustomer ? 'Update' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CustomerManagement;