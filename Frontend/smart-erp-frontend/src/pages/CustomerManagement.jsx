import React, { useEffect, useState } from 'react';
import api, { getCustomers, addCustomer } from '../api'; 
import Layout from '../components/Layout';
import Swal from 'sweetalert2';
import { Pencil, Trash2 } from 'lucide-react';

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
      const customersOnly = (res.data || []).reverse(); 
      setCustomers(customersOnly);
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: "Customers Loaded Error",
        icon: 'error',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isDuplicate = customers.some(c => {
      if (editingCustomer && c.id === editingCustomer.id) return false;
      return (
        (formData.email && c.email?.toLowerCase() === formData.email.toLowerCase()) ||
        (formData.phone && c.phone === formData.phone)
      );
    });

    if (isDuplicate) {
      return Swal.fire({
        title: 'Warning',
        text: "Customer with this Email or Phone already exists!",
        icon: 'warning',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false
      });
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
        await api.put(`/Customers/${editingCustomer.id}`, payload);
        Swal.fire({
          title: 'Updated',
          text: "Customer updated Successfully",
          icon: 'success',
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false
        });
      } else {
        await addCustomer(payload);
        Swal.fire({
          title: 'Added',
          text: "Customer added Successfully",
          icon: 'success',
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false
        });
      }
      
      closeModal();
      fetchCustomers();
    } catch (err) {
      Swal.fire({
        title: 'Failed',
        text: err.response?.data?.message || "Operation failed",
        icon: 'error',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false
      });
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData(initialForm);
    setEditingCustomer(null);
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You want to delete this customer?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#003354',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/Customers/${id}`);
          Swal.fire({
            title: 'Deleted!',
            text: "Customer deleted Successfully",
            icon: 'success',
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false
          });
          fetchCustomers();
        } catch (err) {
          Swal.fire({
            title: 'Error',
            text: "Delete failed",
            icon: 'error',
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false
          });
        }
      }
    });
  };

  const filteredCustomers = customers.filter(c => 
    (c.name?.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (c.phone?.includes(searchTerm)) ||
    (c.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Layout>
      <div className="p-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-[#ecf0f1]">
          <div>
            <h2 className="text-2xl font-black text-[#003354] tracking-tight">Customer Directory</h2>
            <p className="text-[#95a5a6] text-sm ">Manage your client relationships</p>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <input 
                type="text" 
                placeholder="Search customers..." 
                value={searchTerm}
                className="px-4 py-2 border border-[#ecf0f1] rounded-xl focus:ring-2 focus:ring-[#003354] outline-none w-full pr-10"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#95a5a6] hover:text-[#003354] font-bold text-lg"
                >
                  &times;
                </button>
              )}
            </div>

            <button 
              onClick={() => { setEditingCustomer(null); setFormData(initialForm); setShowModal(true); }}
              className="bg-[#003354] text-white px-6 py-2 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-[#003354]/10 whitespace-nowrap capitalize tracking-wide text-[13px]"
            >
              + Add New Customer
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#003354] text-white">
              <tr className="text-[12px] font-bold capitalize tracking-wider">
                <th className="p-6 border-b border-white/10">Customer Info</th>
                <th className="p-6 border-b border-white/10">Contact Details</th>
                <th className="p-6 border-b border-white/10">Balance</th>
                <th className="p-6 text-center border-b border-white/10">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ecf0f1]">
              {loading ? (
                <tr><td colSpan="4" className="p-10 text-center text-[#95a5a6] font-bold">Loading Customers...</td></tr>
              ) : filteredCustomers.length === 0 ? (
                <tr><td colSpan="4" className="p-10 text-center text-[#95a5a6]">No customers found.</td></tr>
              ) : filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-[#f5f7fa]/50 transition-colors text-sm">
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#003354]/10 text-[#003354] flex items-center justify-center font-bold text-sm shrink-0">
                        {customer.name?.charAt(0).toUpperCase() || 'C'}
                      </div>
                      <div>
                        <p className="font-bold text-[#2c3e50] leading-none">{customer.name}</p>
                        <p className="text-[10px] text-[#95a5a6] mt-1 max-w-[150px] truncate capitalize">{customer.address || 'No Address'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-[#2c3e50] font-bold">{customer.phone}</p>
                    <p className="text-[#95a5a6] text-xs">{customer.email || 'N/A'}</p>
                  </td>
                  <td className={`p-4 font-black ${customer.balance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {Number(customer.balance).toLocaleString() || 0}
                  </td>
                  <td className="p-4 text-center pr-6">
                    <div className="flex justify-center gap-3">
                      <button 
                        onClick={() => { 
                          setEditingCustomer(customer); 
                          setFormData({...customer}); 
                          setShowModal(true); 
                        }}
                        className="p-2 text-[#003354] bg-[#003354]/5 hover:bg-[#003354]/10 rounded-lg transition-all active:scale-90"
                        title="Edit Customer"
                      >
                        <Pencil size={18} strokeWidth={2.5} />
                      </button>

                      <button 
                        onClick={() => handleDelete(customer.id)}
                        className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all active:scale-90"
                        title="Delete Customer"
                      >
                        <Trash2 size={18} strokeWidth={2.5} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-[#003354]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[32px] p-8 w-full max-w-lg shadow-2xl animate-in zoom-in duration-300">
              <h3 className="text-2xl font-black text-[#003354] mb-6 capitalize">
                {editingCustomer ? 'Update Customer' : 'Add New Customer'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-[#95a5a6] capitalize mb-1 ml-1">Full Name</label>
                      <input 
                        required type="text" value={formData.name || ''}
                        className="w-full p-3 bg-[#f5f7fa] border border-[#ecf0f1] rounded-xl font-bold focus:ring-2 focus:ring-[#003354] outline-none transition-all"
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-[#95a5a6] capitalize mb-1 ml-1">Email Address</label>
                      <input 
                        type="email" value={formData.email || ''}
                        className="w-full p-3 bg-[#f5f7fa] border border-[#ecf0f1] rounded-xl font-bold focus:ring-2 focus:ring-[#003354] outline-none transition-all"
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="e.g. name@mail.com"
                      />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-[#95a5a6] capitalize mb-1 ml-1">Phone Number</label>
                    <input 
                      required type="text" value={formData.phone || ''}
                      className="w-full p-3 bg-[#f5f7fa] border border-[#ecf0f1] rounded-xl font-bold focus:ring-2 focus:ring-[#003354] outline-none transition-all"
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-[#95a5a6] capitalize mb-1 ml-1">Initial Balance</label>
                    <input 
                      type="number" value={formData.balance || 0}
                      className="w-full p-3 bg-[#f5f7fa] border border-[#ecf0f1] rounded-xl font-bold focus:ring-2 focus:ring-[#003354] outline-none transition-all"
                      onChange={(e) => setFormData({...formData, balance: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-[#95a5a6] capitalize mb-1 ml-1">Full Address</label>
                  <textarea 
                    rows="2"
                    value={formData.address || ''}
                    className="w-full p-3 bg-[#f5f7fa] border border-[#ecf0f1] rounded-xl font-bold focus:ring-2 focus:ring-[#003354] outline-none resize-none transition-all"
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Shop, Street, City..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button" onClick={closeModal}
                    className="flex-1 py-3 font-bold text-[#95a5a6] hover:bg-[#f5f7fa] rounded-xl transition-colors capitalize"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 font-bold bg-[#003354] text-white rounded-xl hover:opacity-90 shadow-lg shadow-[#003354]/20 transition-all capitalize"
                  >
                    {editingCustomer ? 'Update Customer' : 'Save Customer'}
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