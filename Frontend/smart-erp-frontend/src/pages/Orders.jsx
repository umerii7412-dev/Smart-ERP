import React, { useEffect, useState } from 'react';
import api from '../api';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [banks, setBanks] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [newOrder, setNewOrder] = useState({
    customerId: '',
    bankId: '',
    paymentStatus: 'Paid',
    taxAmount: 0,
    totalAmount: 0,
    items: [] 
  });

  useEffect(() => {
    fetchOrders();
    fetchDropdownData();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Swagger: GET /api/Order
      const res = await api.get('/Order');
      setOrders(res.data);
    } catch (err) { 
      toast.error("Orders load nahi ho sakay"); 
      console.error(err);
    } finally { 
      setLoading(false); 
    }
  };

  const fetchDropdownData = async () => {
    try {
      // Swagger ke exact routes use kiye hain
      const [custRes, bankRes, prodRes] = await Promise.all([
        api.get('/Customer'),
        api.get('/Bank'),
        api.get('/Inventory')
      ]);
      setCustomers(custRes.data);
      setBanks(bankRes.data);
      setProducts(prodRes.data);
    } catch (err) { 
      console.error("Dropdown data error:", err); 
      // Toast nahi dikhaya taake user disturb na ho agar koi ek API slow ho
    }
  };

  const addItem = () => {
    setNewOrder(prev => ({
      ...prev,
      items: [...prev.items, { productId: '', quantity: 1, unitPrice: 0 }]
    }));
  };

  const removeItem = (index) => {
    const updatedItems = newOrder.items.filter((_, i) => i !== index);
    calculateTotal(updatedItems, newOrder.taxAmount);
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...newOrder.items];
    
    if (field === 'productId') {
      const selectedId = parseInt(value);
      const prod = products.find(p => p.id === selectedId);
      updatedItems[index].productId = selectedId;
      updatedItems[index].unitPrice = prod ? parseFloat(prod.price) : 0;
    } else if (field === 'quantity') {
      updatedItems[index].quantity = value < 1 ? 1 : parseInt(value);
    } else {
      updatedItems[index][field] = value;
    }

    calculateTotal(updatedItems, newOrder.taxAmount);
  };

  const calculateTotal = (items, tax) => {
    const subtotal = items.reduce((sum, item) => {
      const price = parseFloat(item.unitPrice) || 0;
      const qty = parseInt(item.quantity) || 0;
      return sum + (qty * price);
    }, 0);

    const taxVal = parseFloat(tax) || 0;
    setNewOrder(prev => ({
      ...prev,
      items: items,
      totalAmount: (subtotal + taxVal).toFixed(2)
    }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (newOrder.items.length === 0) return toast.error("Kam az kam ek item add karein!");
    if (!newOrder.customerId || !newOrder.bankId) return toast.error("Customer aur Bank select karein!");

    try {
      const dataToSubmit = {
        customerId: parseInt(newOrder.customerId),
        bankId: parseInt(newOrder.bankId),
        paymentStatus: newOrder.paymentStatus,
        taxAmount: parseFloat(newOrder.taxAmount),
        totalAmount: parseFloat(newOrder.totalAmount),
        items: newOrder.items.map(item => ({
          productId: parseInt(item.productId),
          quantity: parseInt(item.quantity),
          unitPrice: parseFloat(item.unitPrice)
        }))
      };

      await api.post('/Order/place-order', dataToSubmit);
      toast.success("Order Successfully Placed!");
      setShowModal(false);
      // Reset Form
      setNewOrder({ customerId: '', bankId: '', paymentStatus: 'Paid', taxAmount: 0, totalAmount: 0, items: [] });
      fetchOrders();
    } catch (err) { 
      console.error(err);
      toast.error(err.response?.data || "Order fail ho gaya"); 
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-slate-800">Advanced Sales Orders</h2>
            <p className="text-slate-500 text-sm">Manage and track your customer shipments</p>
          </div>
          <button 
            onClick={() => setShowModal(true)} 
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 transition-all"
          >
            + Create New Order
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan="5" className="p-20 text-center animate-pulse text-blue-500 font-bold">Connecting to Server...</td></tr>
                ) : orders.length === 0 ? (
                  <tr><td colSpan="5" className="p-20 text-center text-slate-400 font-medium">No orders found in database.</td></tr>
                ) : orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-mono text-blue-600 font-bold">#ORD-{order.id}</td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-700">{order.customer?.name || "Walk-in Customer"}</div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-tighter">Registered Client</div>
                    </td>
                    <td className="p-4 font-black text-slate-800">${parseFloat(order.totalAmount || order.finalTotal).toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${
                        order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white transition-all">Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b flex justify-between items-center bg-white">
              <div>
                <h3 className="text-xl font-black text-slate-800">New Sales Order</h3>
                <p className="text-xs text-slate-400">Fill in the details to generate invoice</p>
              </div>
              <button onClick={() => setShowModal(false)} className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all text-2xl">&times;</button>
            </div>
            
            <form onSubmit={handlePlaceOrder} className="p-6 space-y-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase mb-1">Customer</label>
                  <select 
                    required className="w-full border-2 border-slate-100 rounded-xl p-3 outline-none focus:border-blue-500 transition-all bg-slate-50 font-semibold"
                    value={newOrder.customerId}
                    onChange={(e) => setNewOrder({...newOrder, customerId: e.target.value})}
                  >
                    <option value="">Select Customer</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase mb-1">Deposit Account</label>
                  <select 
                    required className="w-full border-2 border-slate-100 rounded-xl p-3 outline-none focus:border-blue-500 transition-all bg-slate-50 font-semibold"
                    value={newOrder.bankId}
                    onChange={(e) => setNewOrder({...newOrder, bankId: e.target.value})}
                  >
                    <option value="">Select Bank/Cash</option>
                    {banks.map(b => <option key={b.id} value={b.id}>{b.bankName}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-black text-slate-700 uppercase text-xs tracking-widest">Selected Items</h4>
                  <button type="button" onClick={addItem} className="text-[10px] bg-slate-800 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-blue-600 transition-all tracking-tighter">+ ADD PRODUCT</button>
                </div>
                
                {newOrder.items.length === 0 && (
                  <div className="text-center py-6 border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 text-sm">No items added yet</div>
                )}

                {newOrder.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 items-end relative group">
                    <div className="col-span-12 md:col-span-6">
                      <label className="text-[10px] uppercase font-black text-slate-400 mb-1 block">Product</label>
                      <select 
                        required className="w-full border-2 border-white rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 shadow-sm font-bold"
                        value={item.productId}
                        onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                      >
                        <option value="">Select Product</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name} (${p.price})</option>)}
                      </select>
                    </div>
                    <div className="col-span-5 md:col-span-2">
                      <label className="text-[10px] uppercase font-black text-slate-400 mb-1 block">Qty</label>
                      <input 
                        type="number" min="1" required className="w-full border-2 border-white rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 shadow-sm font-bold text-center"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      />
                    </div>
                    <div className="col-span-5 md:col-span-3">
                      <label className="text-[10px] uppercase font-black text-slate-400 mb-1 block">Price</label>
                      <input 
                        type="text" readOnly className="w-full bg-white/50 border-2 border-transparent rounded-xl p-2.5 text-sm font-black text-slate-600"
                        value={`$${item.unitPrice}`}
                      />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <button type="button" onClick={() => removeItem(index)} className="w-full bg-white text-red-500 hover:bg-red-500 hover:text-white h-10 rounded-xl shadow-sm transition-all flex items-center justify-center">🗑️</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 space-y-4 border border-slate-100">
                <div className="flex justify-between items-end">
                   <div className="w-1/3">
                      <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Tax / Service ($)</label>
                      <input 
                        type="number" className="w-full border-2 border-white rounded-xl p-2 text-sm outline-none font-bold"
                        value={newOrder.taxAmount}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNewOrder({...newOrder, taxAmount: val});
                          calculateTotal(newOrder.items, val);
                        }}
                      />
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Total Payable</p>
                      <p className="text-4xl font-black text-slate-800 tracking-tighter">${newOrder.totalAmount}</p>
                   </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <select 
                    className="flex-1 border-2 border-slate-200 rounded-2xl p-4 font-black text-xs bg-white outline-none focus:border-blue-500"
                    value={newOrder.paymentStatus}
                    onChange={(e) => setNewOrder({...newOrder, paymentStatus: e.target.value})}
                  >
                    <option value="Paid">✅ FULLY PAID</option>
                    <option value="Unpaid">❌ UNPAID</option>
                    <option value="Partial">⚠️ PARTIAL</option>
                  </select>
                  <button type="submit" className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 uppercase tracking-widest text-xs">
                    Confirm & Save Order
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Orders;