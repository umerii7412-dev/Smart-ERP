import React, { useEffect, useState } from 'react';
import api from '../api';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [banks, setBanks] = useState([]);
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [newOrder, setNewOrder] = useState({
    customerId: '',
    bankId: '',
    paymentStatus: 'Paid',
    taxPercentage: 0,
    discountPercentage: 0,
    totalAmount: 0,
    items: [] 
  });

  useEffect(() => {
    fetchOrders();
    fetchDropdownData();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/Order');
      setOrders(res.data || []);
    } catch (err) {
      toast.error("Orders loading Failed");
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
      toast.error("Data loading failed!");
    }
  };

  const downloadAllOrdersCSV = () => {
    if (orders.length === 0) return toast.error("No data to download");

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Order ID,Date,Customer,Subtotal,Discount,Tax,Final Total,Status\n";

    orders.forEach(o => {
      csvContent += `${o.id},${new Date(o.orderDate).toLocaleDateString()},${o.customerName},${o.subtotal},${o.discount},${o.taxAmount},${o.totalAmount},${o.paymentStatus}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "All_Orders_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadSingleOrderCSV = (order) => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Product,Quantity,Price,Total\n";
    (order.orderItems || []).forEach(it => {
      csvContent += `${it.productName},${it.qtySold},${it.priceAtSale},${it.qtySold * it.priceAtSale}\n`;
    });
    csvContent += `\nSubtotal,,,${order.subtotal || 0}`;
    csvContent += `\nDiscount,,,${order.discount || 0}`;
    csvContent += `\nTax,,,${order.taxAmount || 0}`;
    csvContent += `\nGrand Total,,,${order.totalAmount || order.finalTotal}`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Order_${order.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const calculateTotal = (items, bankId, discPercent) => {
    const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.unitPrice || 0) * parseInt(item.quantity || 0)), 0);
    
    let taxRate = 0;
    if (bankId) {
      const selectedBank = banks.find(b => b.id === parseInt(bankId));
      taxRate = selectedBank ? parseFloat(selectedBank.taxPercentage) : 0;
    }

    const discAmt = (subtotal * (parseFloat(discPercent) || 0)) / 100;
    const taxableAmount = subtotal - discAmt;
    const taxAmt = (taxableAmount * taxRate) / 100;
    const finalTotal = taxableAmount + taxAmt;
    
    setNewOrder(prev => ({
      ...prev,
      items,
      bankId,
      taxPercentage: taxRate,
      discountPercentage: discPercent,
      totalAmount: finalTotal.toFixed(2)
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...newOrder.items];
    if (field === 'productId') {
      const prod = products.find(p => p.id === parseInt(value));
      updatedItems[index] = {
        ...updatedItems[index],
        productId: value,
        productName: prod?.name || '',
        unitPrice: prod ? prod.price : 0
      };
    } else {
      updatedItems[index][field] = value;
    }
    calculateTotal(updatedItems, newOrder.bankId, newOrder.discountPercentage);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!newOrder.customerId || !newOrder.bankId || newOrder.items.length === 0) {
      return toast.error("Please fill all required fields");
    }

    try {
      const subtotalVal = newOrder.items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0);
      const discAmt = (subtotalVal * parseFloat(newOrder.discountPercentage || 0)) / 100;
      const taxableAmount = subtotalVal - discAmt;
      const taxAmt = (taxableAmount * parseFloat(newOrder.taxPercentage || 0)) / 100;

      const payload = {
        CustomerId: Number(newOrder.customerId),
        BankId: Number(newOrder.bankId),
        PaymentStatus: newOrder.paymentStatus,
        Subtotal: parseFloat(subtotalVal.toFixed(2)),
        Discount: parseFloat(discAmt.toFixed(2)),
        TaxAmount: parseFloat(taxAmt.toFixed(2)),
        TotalAmount: parseFloat(newOrder.totalAmount),
        Items: newOrder.items.map(it => ({
          ProductId: Number(it.productId),
          Quantity: Number(it.quantity),
          UnitPrice: parseFloat(it.unitPrice)
        }))
      };

      await api.post('/Order/place-order', payload);
      toast.success("Order Placed!");
      setShowModal(false);
      setNewOrder({ customerId: '', bankId: '', paymentStatus: 'Paid', taxPercentage: 0, discountPercentage: 0, totalAmount: 0, items: [] });
      fetchOrders();
    } catch (err) {
      console.error("Order Error Details:", err.response?.data);
      toast.error("Error: Check Console");
    }
  };

  return (
    <Layout>
      <div className="p-8 bg-[#f5f7fa] min-h-screen">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-black text-[#2c3e50]">Orders Management</h2>
          <div className="flex gap-4">
            <button 
                onClick={downloadAllOrdersCSV}
                className="bg-emerald-100 text-emerald-700 px-6 py-3 rounded-2xl font-bold border border-emerald-200 hover:bg-emerald-200 transition-all flex items-center gap-2"
            >
                <span className="text-xl">📊</span> Download Reports
            </button>
            <button onClick={() => setShowModal(true)} className="bg-[#3da9f5] text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:bg-[#2980b9] transition-colors">
                + New Order
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-[#ecf0f1] overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#3da9f5]">
              <tr className="text-[11px] font-black uppercase text-black tracking-widest">
                <th className="p-6 font-black text-black">ID</th>
                <th className="p-6 font-black text-black">Customer</th>
                <th className="p-6 font-black text-black">Total</th>
                <th className="p-6 text-center font-black text-black">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="border-b border-[#ecf0f1] hover:bg-[#f5f7fa]">
                  <td className="p-5 font-bold text-[#3da9f5]">#ORD-{order.id}</td>
                  <td className="p-5 font-bold text-[#2c3e50]">{order.customerName}</td>
                  <td className="p-5 font-black text-[#2c3e50]">PKR {parseFloat(order.totalAmount || 0).toLocaleString()}</td>
                  <td className="p-5 text-center flex justify-center gap-2">
                    <button onClick={() => { setSelectedOrder(order); setShowDetailsModal(true); }} className="bg-[#3da9f5] px-6 py-2 rounded-xl text-xs font-black text-white shadow-md hover:bg-[#2980b9] transition-colors">View Invoice</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
         <div className="fixed inset-0 bg-[#2c3e50]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden">
             <div className="p-6 border-b border-[#ecf0f1] flex justify-between items-center">
               <h3 className="text-xl font-black text-[#2c3e50]">New Sales Order</h3>
               <button onClick={() => setShowModal(false)} className="text-2xl text-[#2c3e50]">&times;</button>
             </div>
             <form onSubmit={handlePlaceOrder} className="p-8 space-y-6">
               <div className="grid grid-cols-2 gap-4">
                 <select 
                   required 
                   className="border-2 border-[#ecf0f1] rounded-xl p-3 font-bold focus:border-[#3da9f5] focus:outline-none" 
                   value={newOrder.customerId} 
                   onChange={(e) => setNewOrder({...newOrder, customerId: e.target.value})}
                 >
                   <option value="">Select Customer</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                 
                 <select required className="border-2 border-[#ecf0f1] rounded-xl p-3 font-bold focus:border-[#3da9f5] focus:outline-none" value={newOrder.bankId} onChange={(e) => calculateTotal(newOrder.items, e.target.value, newOrder.discountPercentage)}>
                   <option value="">Bank/Cash</option>
                   {banks.map(b => (
                     <option key={b.id} value={b.id}>
                       {b.bankName} ({b.taxPercentage}%)
                     </option>
                   ))}
                 </select>
               </div>

               <div className="space-y-3">
                 <div className="flex justify-between items-center">
                     <label className="text-xs font-black text-[#95a5a6] uppercase">Items List</label>
                     <button type="button" onClick={() => setNewOrder(p => ({...p, items: [...p.items, {productId:'', quantity:1, unitPrice:0}]}))} className="text-[#3da9f5] font-bold text-xs hover:text-[#2980b9]">+ Add Product</button>
                 </div>
                 <div className="max-h-60 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                     {newOrder.items.map((item, index) => (
                     <div key={index} className="flex gap-2 items-center bg-[#f5f7fa] p-3 rounded-xl border border-[#ecf0f1]">
                         <select className="flex-1 bg-transparent font-bold text-sm outline-none focus:text-[#2c3e50]" value={item.productId} onChange={(e) => handleItemChange(index, 'productId', e.target.value)}>
                         <option value="">Select Product</option>
                         {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                         </select>
                         <input type="number" className="w-16 rounded-lg p-1 text-center font-bold border border-[#ecf0f1] outline-none" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} min="1" />
                         <span className="w-24 text-xs font-black text-right text-[#95a5a6]">PKR {item.unitPrice}</span>
                         <button type="button" onClick={() => {
                             const filtered = newOrder.items.filter((_, i) => i !== index);
                             calculateTotal(filtered, newOrder.bankId, newOrder.discountPercentage);
                         }} className="text-[#e74c3c] ml-2 hover:text-[#c0392b]">×</button>
                     </div>
                     ))}
                 </div>
               </div>

               <div className="bg-[#2c3e50] rounded-3xl p-6 text-white shadow-xl">
                 <div className="flex justify-between items-center">
                   <div className="w-1/3">
                     <label className="text-[10px] font-black text-[#95a5a6] uppercase">Discount (%)</label>
                     <input type="number" className="w-full bg-[#34495e] border-none rounded-lg p-2 mt-1 text-white font-bold outline-none" value={newOrder.discountPercentage} onChange={(e) => calculateTotal(newOrder.items, newOrder.bankId, e.target.value)} />
                   </div>
                   <div className="text-right">
                     <p className="text-[10px] text-[#95a5a6] font-bold uppercase">Payable Amount</p>
                     <p className="text-3xl font-black text-[#3da9f5]">PKR {newOrder.totalAmount}</p>
                     <p className="text-[10px] text-[#7f8c8d] italic">Tax Applied: {newOrder.taxPercentage}%</p>
                   </div>
                 </div>
                 <button type="submit" className="w-full bg-[#3da9f5] mt-6 p-4 rounded-2xl font-black uppercase tracking-widest hover:bg-[#2980b9] transition-all shadow-lg shadow-[#3da9f5]/20">Save Order</button>
               </div>
             </form>
            </div>
         </div>
      )}

      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-[#2c3e50]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 bg-[#3da9f5] text-white flex justify-between items-center">
              <div>
                  <h3 className="font-black text-lg">Order Invoice</h3>
                  <p className="text-[10px] font-bold opacity-80">ID: #ORD-{selectedOrder.id}</p>
              </div>
              <div className="flex gap-2">
                  <button onClick={() => downloadSingleOrderCSV(selectedOrder)} className="text-xs bg-white text-[#3da9f5] px-3 py-1.5 rounded-lg font-black shadow-sm hover:bg-[#ecf0f1]">CSV</button>
                  <button onClick={() => setShowDetailsModal(false)} className="bg-[#2980b9] w-8 h-8 rounded-full flex items-center justify-center font-bold hover:bg-[#2c3e50]">×</button>
              </div>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-center border-b border-[#ecf0f1] pb-4">
                <span className="text-[10px] font-black text-[#95a5a6] uppercase">Customer</span>
                <span className="font-black text-[#2c3e50] text-lg">{selectedOrder.customerName}</span>
              </div>
              
              <div className="space-y-3">
                  <span className="text-[10px] font-black text-[#95a5a6] uppercase">Purchased Items</span>
                  <div className="bg-[#f5f7fa] rounded-2xl p-4 space-y-3 max-h-48 overflow-y-auto custom-scrollbar border border-[#ecf0f1]">
                    {(selectedOrder.orderItems || []).map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-xs">
                        <div>
                            <p className="font-black text-[#2c3e50]">{item.productName}</p>
                            <p className="text-[10px] text-[#95a5a6]">Qty: x{item.qtySold}</p>
                        </div>
                        <span className="font-black text-[#2c3e50]">{(item.priceAtSale * item.qtySold).toLocaleString()}</span>
                    </div>
                    ))}
                  </div>
              </div>

              <div className="pt-4 space-y-2 border-t border-dashed border-[#ecf0f1]">
                <div className="flex justify-between text-[11px] font-bold text-[#95a5a6]">
                    <span>Subtotal Amount</span>
                    <span>PKR {selectedOrder.subtotal?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between text-[11px] font-bold text-[#e74c3c]">
                    <span>Discount Applied ({((selectedOrder.discount / selectedOrder.subtotal) * 100).toFixed(0)}%) (-)</span>
                    <span>PKR {selectedOrder.discount?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between text-[11px] font-bold text-[#95a5a6]">
                    <span>Sales Tax ({((selectedOrder.taxAmount / (selectedOrder.subtotal - selectedOrder.discount)) * 100).toFixed(0)}%) (+)</span>
                    <span>PKR {selectedOrder.taxAmount?.toLocaleString() || 0}</span>
                </div>
                
                <div className="flex justify-between items-end pt-6 border-t border-[#ecf0f1] mt-4">
                  <div>
                      <span className="font-black text-xs text-[#95a5a6] block uppercase">Total Amount</span>
                      <span className="text-4xl font-black text-[#3da9f5] leading-none">
                        PKR {parseFloat(selectedOrder.totalAmount || selectedOrder.finalTotal).toLocaleString()}
                      </span>
                  </div>
                  <span className="text-[10px] font-black text-[#95a5a6] mb-1">PKR Currency</span>
                </div>
              </div>
              
              <button onClick={() => setShowDetailsModal(false)} className="w-full bg-[#2c3e50] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest mt-4 hover:bg-[#1a252f] transition-colors">Close Invoice</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Orders;