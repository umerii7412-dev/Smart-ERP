import React, { useEffect, useState } from 'react';
import api from '../api';
import Layout from '../components/Layout';
import Swal from 'sweetalert2';
import { Plus, X } from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [banks, setBanks] = useState([]);
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Initial state for resetting form
  const initialOrderState = {
    customerId: '',
    customerName: '',
    bankId: '',
    taxPercentage: 0,
    taxAmount: 0,
    discountPercentage: 0,
    discountAmount: 0,
    subtotal: 0,
    totalAmount: 0,
    items: []
  };

  const [newOrder, setNewOrder] = useState(initialOrderState);

  useEffect(() => {
    fetchOrders();
    fetchDropdownData();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/Order');
      setOrders(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [custRes, bankRes, prodRes] = await Promise.all([
        api.get('/Customers'),
        api.get('/Bank'),
        api.get('/Inventory')
      ]);
      setCustomers(custRes.data || []);
      setBanks(bankRes.data || []);
      setProducts(prodRes.data || []);
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: 'Failed to load data',
        icon: 'error',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false
      });
    }
  };

  const calculateTotal = (items, bankId, discPercent) => {
    const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.unitPrice || 0) * parseInt(item.quantity || 0)), 0);
    const selectedBank = banks.find(b => b.id === parseInt(bankId));
    const taxRate = selectedBank ? parseFloat(selectedBank.taxPercentage) : 0;

    const discAmt = (subtotal * (parseFloat(discPercent) || 0)) / 100;
    const taxableAmount = subtotal - discAmt;
    const taxAmt = (taxableAmount * taxRate) / 100;
    const finalTotal = taxableAmount + taxAmt;
    
    setNewOrder(prev => ({
      ...prev,
      items,
      bankId,
      subtotal: subtotal.toFixed(2),
      taxPercentage: taxRate,
      taxAmount: taxAmt.toFixed(2),
      discountPercentage: discPercent,
      discountAmount: discAmt.toFixed(2),
      totalAmount: finalTotal.toFixed(2)
    }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!newOrder.customerId || !newOrder.bankId || newOrder.items.length === 0) {
      return Swal.fire({
        title: 'Field Required',
        text: 'Please complete the order details',
        icon: 'info',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false
      });
    }

    try {
      const payload = {
        CustomerId: Number(newOrder.customerId),
        BankId: Number(newOrder.bankId),
        Subtotal: parseFloat(newOrder.subtotal),
        Discount: parseFloat(newOrder.discountAmount),
        TaxAmount: parseFloat(newOrder.taxAmount),
        TotalAmount: parseFloat(newOrder.totalAmount),
        Items: newOrder.items.map(it => ({
          ProductId: Number(it.productId),
          Quantity: Number(it.quantity),
          UnitPrice: parseFloat(it.unitPrice)
        }))
      };

      await api.post('/Order/place-order', payload);
      Swal.fire({
        title: 'Success',
        text: 'Order saved successfully!',
        icon: 'success',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false
      });
      setShowModal(false);
      setNewOrder(initialOrderState); // Reset form after success
      fetchOrders();
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: 'Could not save order',
        icon: 'error',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false
      });
    }
  };

  return (
    <Layout>
      <div className="p-8 bg-[#f5f7fa] min-h-screen">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold text-[#003354]">Orders</h2>
          <button 
            onClick={() => {
              setNewOrder(initialOrderState); // Clear form data when opening modal
              setShowModal(true);
            }} 
            className="bg-[#003354] text-white px-8 py-3 rounded-2xl font-bold shadow-lg flex items-center gap-2"
          >
            <Plus size={18} /> New Order
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-[#ecf0f1] overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#003354] text-white font-bold text-sm">
              <tr>
                <th className="p-6">ID</th>
                <th className="p-6">Customer</th>
                <th className="p-6">Total Amount</th>
                <th className="p-6 text-center">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="border-b hover:bg-slate-50">
                  <td className="p-5 font-bold">#ORD-{order.id}</td>
                  <td className="p-5">{order.customerName}</td>
                  <td className="p-5 font-bold text-lg">{parseFloat(order.totalAmount).toLocaleString()}</td>
                  <td className="p-5 text-center">
                    <button onClick={() => { setSelectedOrder(order); setShowDetailsModal(true); }} className="bg-[#003354]/10 text-[#003354] px-5 py-2 rounded-xl text-xs font-bold transition-all hover:bg-[#003354] hover:text-white">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-[#003354]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="p-6 bg-[#003354] text-white flex justify-between items-center">
              <h3 className="text-xl font-bold">New Sales Order</h3>
              <button onClick={() => setShowModal(false)}><X size={24}/></button>
            </div>
            
            <form onSubmit={handlePlaceOrder} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 ">Search Customer</label>
                  <input 
                    list="customer-list"
                    placeholder="Type name to search..."
                    className="w-full border-2 border-[#ecf0f1] rounded-xl p-3 text-sm focus:border-[#003354] outline-none"
                    value={newOrder.customerName}
                    onChange={(e) => {
                      const val = e.target.value;
                      const selected = customers.find(c => c.name === val);
                      if (selected) {
                        setNewOrder({...newOrder, customerId: selected.id, customerName: selected.name});
                      } else {
                        setNewOrder({...newOrder, customerName: val, customerId: ''});
                      }
                    }}
                  />
                  <datalist id="customer-list">
                    {customers.map(c => <option key={c.id} value={c.name} />)}
                  </datalist>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 ">Payment Method</label>
                  <select 
                    required 
                    className="w-full border-2 border-[#ecf0f1] rounded-xl p-3 text-sm focus:border-[#003354] outline-none"
                    value={newOrder.bankId}
                    onChange={(e) => calculateTotal(newOrder.items, e.target.value, newOrder.discountPercentage)}
                  >
                    <option value="">-- Select Bank/Cash --</option>
                    {banks.map(b => <option key={b.id} value={b.id}>{b.bankName} ({b.taxPercentage}%)</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-slate-400 uppercase">Items List</label>
                  <button type="button" onClick={() => setNewOrder(p => ({...p, items: [...p.items, {productId:'', quantity:1, unitPrice:0}]}))} className="text-[#003354] font-bold text-xs flex items-center gap-1">
                    <Plus size={14}/> Add Item
                  </button>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {newOrder.items.map((item, index) => (
                    <div key={index} className="flex gap-3 items-center bg-slate-50 p-3 rounded-2xl border border-[#ecf0f1]">
                      <select 
                        className="flex-1 bg-transparent text-sm font-bold outline-none"
                        value={item.productId}
                        onChange={(e) => {
                          const prod = products.find(p => p.id === parseInt(e.target.value));
                          const updated = [...newOrder.items];
                          updated[index] = { ...updated[index], productId: e.target.value, unitPrice: prod?.price || 0 };
                          calculateTotal(updated, newOrder.bankId, newOrder.discountPercentage);
                        }}
                      >
                        <option value="">Select Product</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name} - {p.price}</option>)}
                      </select>

                      <input 
                        type="number" 
                        className="w-16 rounded-lg p-1 text-center border font-bold" 
                        value={item.quantity}
                        onChange={(e) => {
                          const updated = [...newOrder.items];
                          updated[index].quantity = e.target.value;
                          calculateTotal(updated, newOrder.bankId, newOrder.discountPercentage);
                        }}
                      />
                      <span className="text-xs font-bold text-slate-500 w-20 text-right">{(item.unitPrice * item.quantity).toLocaleString()}</span>
                      <button type="button" onClick={() => {
                        const filtered = newOrder.items.filter((_, i) => i !== index);
                        calculateTotal(filtered, newOrder.bankId, newOrder.discountPercentage);
                      }} className="text-red-500"><X size={16}/></button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#003354] rounded-3xl p-6 text-white">
                <div className="grid grid-cols-2 gap-4 border-b border-white/10 mb-4 pb-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold opacity-70">Discount (%)</label>
                    <input 
                      type="number" 
                      className="w-full bg-white/10 rounded-lg p-2 text-white font-bold outline-none border border-white/20" 
                      value={newOrder.discountPercentage}
                      onChange={(e) => calculateTotal(newOrder.items, newOrder.bankId, e.target.value)}
                    />
                  </div>
                  <div className="text-right space-y-1">
                    <div className="flex justify-between text-[11px] opacity-80">
                      <span>Discount ({newOrder.discountPercentage}%):</span>
                      <span>- {newOrder.discountAmount}</span>
                    </div>
                    <div className="flex justify-between text-[11px] opacity-80">
                      <span>Tax ({newOrder.taxPercentage}%):</span>
                      <span>+ {newOrder.taxAmount}</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm font-bold opacity-70 tracking-wide">Total Payable</p>
                  <p className="text-4xl font-bold">{parseFloat(newOrder.totalAmount).toLocaleString()}</p>
                </div>
                <button type="submit" className="w-full bg-white text-[#003354] mt-6 p-4 rounded-2xl font-bold shadow-xl">Confirm & Save Order</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-[#003354]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 bg-[#003354] text-white flex justify-between items-center">
              <h3 className="font-bold">Order Invoice</h3>
              <button onClick={() => setShowDetailsModal(false)}><X size={18}/></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-end border-b pb-4">
                <span className="text-xs font-bold text-slate-400 uppercase">Customer</span>
                <span className="font-bold text-[#003354] text-xl">{selectedOrder.customerName}</span>
              </div>
              
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase">Items</span>
                <div className="bg-slate-50 rounded-2xl p-4 space-y-3 border">
                  {(selectedOrder.orderItems || []).map((item, i) => (
                    <div key={i} className="flex justify-between text-xs font-medium">
                      <span className="text-slate-600">{item.productName} (x{item.qtySold})</span>
                      <span className="font-bold">{item.priceAtSale * item.qtySold}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 space-y-3 border-t border-dashed border-slate-300">
                <div className="flex justify-between text-xs font-bold text-red-500">
                  <span>Discount ({((selectedOrder.discount / (selectedOrder.subtotal || 1)) * 100).toFixed(0)}%) (-)</span>
                  <span>{selectedOrder.discount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-500">
                  <span>Sales Tax ({((selectedOrder.taxAmount / (selectedOrder.totalAmount - selectedOrder.taxAmount || 1)) * 100).toFixed(0)}%) (+)</span>
                  <span>{selectedOrder.taxAmount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t-2 mt-2">
                  <span className="text-sm font-bold text-slate-400 uppercase">Grand Total</span>
                  <span className="text-3xl font-bold text-[#003354]">
                    {parseFloat(selectedOrder.totalAmount).toLocaleString()}
                  </span>
                </div>
              </div>
              <button onClick={() => setShowDetailsModal(false)} className="w-full bg-[#003354] text-white py-4 rounded-2xl font-bold">Close Invoice</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Orders;