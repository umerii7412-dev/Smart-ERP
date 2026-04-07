import React, { useEffect, useState } from 'react';
import api from '../api';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); 
  const [newProduct, setNewProduct] = useState({ name: '', category: '', price: '', stockQuantity: '' });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await api.get('/Inventory');
      setProducts(response.data);
    } catch (error) {
      toast.error("Data load nahi ho saka!");
    } finally {
      setLoading(false);
    }
  };

  // --- CSV Report Download Function (Improved for Excel) ---
  const downloadInventoryReport = () => {
    if (products.length === 0) return toast.error("Download karne ke liye data nahi hai!");
    
    const headers = "Product Name,Category,Price,Quantity,Status\n";
    const csvContent = products.map(p => {
      const status = p.stockQuantity <= 10 ? 'Low Stock' : 'In Stock';
      // Double quotes use kiye hain taake agar kisi product name mein comma ho toh Excel kharab na ho
      return `"${p.name}","${p.category}","${p.price}","${p.stockQuantity}","${status}"`;
    }).join("\n");
    
    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Inventory_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Inventory Report Downloaded!");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.put(`/Inventory/${editingProduct.id}`, newProduct);
        toast.success("Product update ho gaya!");
      } else {
        await api.post('/Inventory', newProduct);
        toast.success("Product add ho gaya!");
      }
      closeModal();
      fetchInventory();
    } catch (error) {
      toast.error("Operation fail ho gaya.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Kya aap waqai delete karna chahte hain?")) {
      try {
        await api.delete(`/Inventory/${id}`);
        toast.success("Product delete kar diya gaya!");
        fetchInventory();
      } catch (error) {
        toast.error("Delete nahi ho saka.");
      }
    }
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      category: product.category,
      price: product.price,
      stockQuantity: product.stockQuantity
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setNewProduct({ name: '', category: '', price: '', stockQuantity: '' });
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-2xl font-bold text-slate-800">Stock Inventory</h2>
          
          <div className="flex gap-3 w-full md:w-auto">
            <button 
              onClick={downloadInventoryReport}
              className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-4 py-2 rounded-xl font-bold hover:bg-emerald-100 transition shadow-sm flex items-center gap-2"
            >
              📥 Download Report
            </button>
            <input 
              type="text" 
              placeholder="Search products..." 
              className="border border-slate-200 rounded-xl px-4 py-2 w-full md:w-64 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button 
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold shadow-md hover:bg-blue-700 transition-all flex items-center gap-2"
            >
              <span className="text-xl">+</span> Add Product
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase">
                <tr>
                  <th className="p-4 w-1/4">Product Name</th>
                  <th className="p-4 w-1/6">Category</th>
                  <th className="p-4 w-1/8">Price</th>
                  <th className="p-4 w-1/8">Quantity</th>
                  <th className="p-4 text-center w-1/6">Status</th>
                  <th className="p-4 text-center w-1/6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan="6" className="p-10 text-center animate-pulse text-slate-400">Loading Inventory...</td></tr>
                ) : filteredProducts.length === 0 ? (
                  <tr><td colSpan="6" className="p-10 text-center text-slate-400">No products found.</td></tr>
                ) : (
                  filteredProducts.map((item) => (
                    <tr key={item.id} className={`transition-colors ${item.stockQuantity <= 10 ? 'bg-red-50/70 border-l-4 border-l-red-500' : 'hover:bg-slate-50'}`}>
                      {/* Product Name Column */}
                      <td className="p-4 font-semibold text-slate-700 max-w-[200px] truncate">
                        {item.name}
                      </td>
                      
                      {/* Category Column - Ab ye bilkul alag nazar ayegi */}
                      <td className="p-4 text-slate-600 italic">
                        {item.category || "Uncategorized"}
                      </td>

                      <td className="p-4 text-blue-700 font-bold">
                        ${item.price}
                      </td>

                      <td className={`p-4 font-black ${item.stockQuantity <= 10 ? 'text-red-600 animate-pulse' : 'text-slate-600'}`}>
                        {item.stockQuantity}
                      </td>

                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                          item.stockQuantity > 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {item.stockQuantity > 10 ? 'In Stock' : 'Low Stock'}
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => openEditModal(item)} className="p-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-100 hover:bg-blue-100 transition shadow-sm">✏️</button>
                          <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-50 text-red-600 rounded-lg border border-red-100 hover:bg-red-100 transition shadow-sm">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">{editingProduct ? 'Update Product' : 'Add New Product'}</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-red-500 text-2xl transition">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
                <input type="text" required className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Price ($)</label>
                  <input type="number" required className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                  <input type="number" required className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition" value={newProduct.stockQuantity} onChange={(e) => setNewProduct({...newProduct, stockQuantity: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <input type="text" required className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition" value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeModal} className="flex-1 bg-slate-100 text-slate-600 py-2.5 rounded-lg font-semibold hover:bg-slate-200 transition">Cancel</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 shadow-md transition active:scale-95">{editingProduct ? 'Save Changes' : 'Save Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Inventory;