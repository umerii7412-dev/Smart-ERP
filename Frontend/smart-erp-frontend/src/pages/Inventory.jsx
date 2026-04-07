import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; 
import api from '../api';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';
import { Trash2, Pencil } from 'lucide-react'; // Icons import kiye

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

  // --- DELETE FUNCTION ---
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete?")) return;

    try {
      await api.delete(`/Inventory/${id}`);
      toast.success("Product Deleted!");
      fetchInventory(); // List update karne ke liye
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

  // --- FILTER LOGIC ---
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (p.category && p.category.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (location.state?.filter === 'low') {
        return matchesSearch && p.stockQuantity <= 10;
    }
    
    if (location.state?.categoryName) {
        return matchesSearch && p.category?.name === location.state.categoryName;
    }

    return matchesSearch;
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-slate-800">
              {location.state?.categoryName ? `${location.state.categoryName} Products` : 
               location.state?.filter === 'low' ? 'Low Stock Inventory' : 'Stock Inventory'}
            </h2>
            {(location.state?.categoryName || location.state?.filter) && (
              <button 
                onClick={() => navigate('/inventory', { replace: true, state: {} })}
                className="text-xs bg-slate-200 px-3 py-1 rounded-full font-bold hover:bg-slate-300"
              >
                Clear Filter ✕
              </button>
            )}
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <input type="text" placeholder="Search..." className="border border-slate-200 rounded-xl px-4 py-2 w-full md:w-64 outline-none shadow-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold shadow-md hover:bg-blue-700 transition-all flex items-center gap-2">
              + Add Product
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase">
                <tr>
                  <th className="p-4">Product Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Quantity</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Actions</th>
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
                      <td className="p-4 font-semibold text-slate-700">{item.name}</td>
                      <td className="p-4 text-slate-600 italic">{item.category?.name || "Uncategorized"}</td>
                      <td className="p-4 text-blue-700 font-bold">{item.price}</td>
                      <td className="p-4 font-black">{item.stockQuantity}</td>
                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${item.stockQuantity > 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {item.stockQuantity > 10 ? 'In Stock' : 'Low Stock'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                         <div className="flex justify-center gap-2">
                          {/* Edit Button */}
                          <button 
                            onClick={() => { setEditingProduct(item); setNewProduct({ name: item.name, categoryId: item.categoryId, price: item.price, stockQuantity: item.stockQuantity }); setShowModal(true); }} 
                            className="p-2 bg-blue-50 text-blue-600 rounded-lg transition shadow-sm hover:bg-blue-100"
                          >
                            <Pencil size={16} />
                          </button>
                          {/* Delete Button Add Kar Diya Gaya Hai */}
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

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold">{editingProduct ? 'Update Product' : 'Add New Product'}</h3>
              <button onClick={closeModal} className="text-2xl">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
               <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
                <input type="text" required className="w-full border border-slate-200 rounded-lg p-2.5 outline-none" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Price</label>
                  <input type="number" required className="w-full border border-slate-200 rounded-lg p-2.5 outline-none" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                  <input type="number" required className="w-full border border-slate-200 rounded-lg p-2.5 outline-none" value={newProduct.stockQuantity} onChange={(e) => setNewProduct({...newProduct, stockQuantity: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select required className="w-full border border-slate-200 rounded-lg p-2.5 outline-none" value={newProduct.categoryId} onChange={(e) => setNewProduct({...newProduct, categoryId: e.target.value})}>
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeModal} className="flex-1 bg-slate-100 py-2.5 rounded-lg font-semibold">Cancel</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-semibold shadow-md">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Inventory;