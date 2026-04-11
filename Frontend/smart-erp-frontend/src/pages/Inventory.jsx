import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; 
import api from '../api';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';
import { Trash2, Pencil, Plus } from 'lucide-react'; // Plus icon add kiya hai consistent look ke liye

const Inventory = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); 
  const [newProduct, setNewProduct] = useState({ name: '', categoryId: '', price: '', stockQuantity: '' });
  const [categories, setCategories] = useState([]); 

  useEffect(() => {
    fetchInventory();
    fetchCategories();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await api.get('/Inventory');
      setProducts(response.data);
    } catch (error) {
      toast.error("Data Not Loaded!");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/Category');
      setCategories(response.data);
    } catch (error) {
      console.error("Categories Not Loaded");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete?")) return;
    try {
      await api.delete(`/Inventory/${id}`);
      toast.success("Product Deleted!");
      fetchInventory();
    } catch (error) {
      toast.error("Delete Error!");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const productExists = products.find(
      (p) => p.name.trim().toLowerCase() === newProduct.name.trim().toLowerCase() && p.id !== (editingProduct?.id || 0)
    );
    if (productExists) {
      toast.error("Already Exist!");
      return;
    }
    const productData = {
      id: editingProduct ? editingProduct.id : 0,
      name: newProduct.name,
      description: "No Description", 
      price: parseFloat(newProduct.price),
      stockQuantity: parseInt(newProduct.stockQuantity),
      categoryId: parseInt(newProduct.categoryId)
    };
    try {
      if (editingProduct) {
        await api.put(`/Inventory/${editingProduct.id}`, productData);
        toast.success("Product updated!");
      } else {
        await api.post('/Inventory', productData);
        toast.success("Product added Successfully!");
      }
      closeModal();
      fetchInventory();
    } catch (error) {
      toast.error("Operation fail.");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setNewProduct({ name: '', categoryId: '', price: '', stockQuantity: '' });
  };

  const filteredProducts = products.filter(p => {
    const productName = typeof p.name === 'object' ? p.name.name : p.name;
    const categoryName = p.category?.name || "Uncategorized";

    const matchesSearch = productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          categoryName.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (location.state?.filter === 'low') {
        return matchesSearch && p.stockQuantity <= 10;
    }
    
    if (location.state?.categoryName) {
        return matchesSearch && categoryName === location.state.categoryName;
    }

    return matchesSearch;
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-[#2c3e50]">
              {location.state?.categoryName ? `${location.state.categoryName} Products` : 
               location.state?.filter === 'low' ? 'Low Stock Inventory' : 'Stock Inventory'}
            </h2>
            {(location.state?.categoryName || location.state?.filter) && (
              <button 
                onClick={() => navigate('/inventory', { replace: true, state: {} })}
                className="mt-2 text-xs bg-[#ecf0f1] px-4 py-1.5 rounded-full font-semibold hover:bg-[#bdc3c7] transition-colors text-[#2c3e50]"
              >
                Clear Filter ✕
              </button>
            )}
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <input type="text" placeholder="Search..." className="border border-slate-200 rounded-xl px-4 py-2 w-full md:w-64 outline-none shadow-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            
            {/* UPDATED ADD PRODUCT BUTTON */}
           <button 
  onClick={() => setShowModal(true)} 
  className="bg-[#003354] text-white px-6 py-2.5 rounded-2xl font-black shadow-lg hover:opacity-90 transition-all active:scale-95 uppercase tracking-widest text-xs flex items-center gap-2"
>
  <Plus size={18} /> Add Product
</button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
             {/* UPDATED TABLE HEADER */}
<thead className="erp-table-header">
  <tr className="text-[11px] font-black uppercase text-white tracking-[0.2em] border-b border-white/10">
    <th className="p-6 font-black text-left">Product Name</th>
    <th className="p-6 font-black text-left">Category</th>
    <th className="p-6 font-black text-left">Price</th>
    <th className="p-6 text-center font-black">Quantity</th>
    <th className="p-6 text-center font-black">Status</th>
    <th className="p-6 text-right pr-10 font-black">Actions</th>
  </tr>
</thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan="6" className="p-10 text-center animate-pulse text-slate-400">Loading...</td></tr>
                ) : filteredProducts.length === 0 ? (
                  <tr><td colSpan="6" className="p-10 text-center text-slate-400">No products found for this filter.</td></tr>
                ) : (
                  filteredProducts.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-semibold text-slate-700 pl-6">
                        {typeof item.name === 'object' ? item.name.name : item.name}
                      </td>
                      <td className="p-4 text-slate-600 italic">
                        {item.category?.name || "Uncategorized"}
                      </td>
                      <td className="p-4 text-blue-700 font-bold">Rs. {item.price}</td>
                      <td className="p-4 font-black text-center">{item.stockQuantity}</td>
                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${item.stockQuantity > 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {item.stockQuantity > 10 ? 'In Stock' : 'Low Stock'}
                        </span>
                      </td>
                      <td className="p-4 text-right pr-6">
                         <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => { setEditingProduct(item); setNewProduct({ name: item.name, categoryId: item.categoryId, price: item.price, stockQuantity: item.stockQuantity }); setShowModal(true); }} 
                            className="p-2 bg-blue-50 text-blue-600 rounded-lg transition shadow-sm hover:bg-blue-100"
                          >
                            <Pencil size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)} 
                            className="p-2 bg-red-50 text-red-600 rounded-lg transition shadow-sm hover:bg-red-100"
                          >
                            <Trash2 size={16} />
                          </button>
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

      {/* Modal remains same but check for styling consistency if needed */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">{editingProduct ? 'Update Product' : 'Add New Product'}</h3>
              <button onClick={closeModal} className="text-2xl text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
               <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Product Name</label>
                <input type="text" required className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:border-[#3da9f5] transition-all" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Price</label>
                  <input type="number" required className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:border-[#3da9f5] transition-all" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Quantity</label>
                  <input type="number" required className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:border-[#3da9f5] transition-all" value={newProduct.stockQuantity} onChange={(e) => setNewProduct({...newProduct, stockQuantity: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Category</label>
                <select required className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:border-[#3da9f5] transition-all" value={newProduct.categoryId} onChange={(e) => setNewProduct({...newProduct, categoryId: e.target.value})}>
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeModal} className="flex-1 bg-slate-100 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-all">Cancel</button>
                <button type="submit" className="flex-1 bg-[#3da9f5] text-white py-2.5 rounded-xl font-bold shadow-md hover:bg-[#2980b9] transition-all">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Inventory;