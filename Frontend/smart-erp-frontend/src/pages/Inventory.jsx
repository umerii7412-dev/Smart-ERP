import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; 
import api from '../api';
import Layout from '../components/Layout';
import Swal from 'sweetalert2';
import { Trash2, Pencil, Plus, X } from 'lucide-react';

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
      Swal.fire({
        title: 'Error',
        text: "Data Not Loaded!",
        icon: 'error',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false
      });
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
    Swal.fire({
      title: 'Are you sure?',
      text: "You want to delete this product?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#003354',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/Inventory/${id}`);
          Swal.fire({
            title: 'Deleted!',
            text: 'Product Deleted!',
            icon: 'success',
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false
          });
          fetchInventory();
        } catch (error) {
          Swal.fire({
            title: 'Error',
            text: 'Delete Error!',
            icon: 'error',
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false
          });
        }
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const productExists = products.find(
      (p) => p.name.trim().toLowerCase() === newProduct.name.trim().toLowerCase() && p.id !== (editingProduct?.id || 0)
    );
    if (productExists) {
      Swal.fire({
        title: 'Warning',
        text: "Product already exists!",
        icon: 'warning',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false
      });
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
        Swal.fire({
          title: 'Updated',
          text: "Product updated!",
          icon: 'success',
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false
        });
      } else {
        await api.post('/Inventory', productData);
        Swal.fire({
          title: 'Success',
          text: "Product added Successfully!",
          icon: 'success',
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false
        });
      }
      closeModal();
      fetchInventory();
    } catch (error) {
      Swal.fire({
        title: 'Failed',
        text: "Operation failed.",
        icon: 'error',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false
      });
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
            <h2 className="text-3xl font-black text-[#003354] tracking-tight">
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
          
          <div className="flex gap-3 w-full md:w-auto items-center">
            <div className="relative w-full md:w-72 group">
              <input 
                type="text" 
                placeholder="Search products..." 
                className="border border-slate-200 rounded-xl px-4 py-2.5 w-full outline-none shadow-sm focus:ring-2 focus:ring-[#003354]/10 focus:border-[#003354] transition-all pr-10" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <X size={16} strokeWidth={3} />
                </button>
              )}
            </div>
            
            <button 
              onClick={() => setShowModal(true)} 
              className="bg-[#003354] text-white px-6 py-2.5 rounded-2xl font-black shadow-lg hover:opacity-90 transition-all active:scale-95 capitalize text-xs flex items-center gap-2 shrink-0"
            >
              <Plus size={18} /> Add Product
            </button>
          </div>
        </div>

        <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#003354] text-white">
                <tr className="text-[12px] font-black border-b border-white/10">
                  <th className="p-6 text-left">Product Name</th>
                  <th className="p-6 text-left">Category</th>
                  <th className="p-6 text-left">Price</th>
                  <th className="p-6 text-center">Quantity</th>
                  <th className="p-6 text-center">Status</th>
                  <th className="p-6 text-right pr-10">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan="6" className="p-10 text-center animate-pulse text-slate-400 font-bold">Loading...</td></tr>
                ) : filteredProducts.length === 0 ? (
                  <tr><td colSpan="6" className="p-10 text-center text-slate-400 font-medium">No products found.</td></tr>
                ) : (
                  filteredProducts.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors border-b border-[#ecf0f1]">
                      <td className="p-5 font-bold text-slate-700 pl-6 capitalize">
                        {typeof item.name === 'object' ? item.name.name : item.name}
                      </td>
                      <td className="p-5">
                        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg font-bold text-xs">
                          {item.category?.name || "Uncategorized"}
                        </span>
                      </td>
                      <td className="p-5 text-[#003354] font-black">{item.price.toLocaleString()}</td>
                      <td className="p-5 font-black text-center">{item.stockQuantity}</td>
                      <td className="p-5 text-center">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${item.stockQuantity > 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {item.stockQuantity > 10 ? 'In Stock' : 'Low Stock'}
                        </span>
                      </td>
                      <td className="p-5 text-right pr-6">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => { 
                              setEditingProduct(item); 
                              setNewProduct({ 
                                name: item.name, 
                                categoryId: item.categoryId, 
                                price: item.price, 
                                stockQuantity: item.stockQuantity 
                              }); 
                              setShowModal(true); 
                            }} 
                            className="p-2.5 text-[#003354] bg-[#003354]/5 hover:bg-[#003354]/10 rounded-xl transition-all active:scale-90"
                          >
                            <Pencil size={16} strokeWidth={2.5} />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)} 
                            className="p-2.5 bg-red-50 text-red-600 rounded-xl transition hover:bg-red-100 active:scale-90"
                          >
                            <Trash2 size={16} strokeWidth={2.5} />
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 flex justify-between items-center bg-[#003354] text-white">
              <h3 className="text-xl font-black">{editingProduct ? 'Update Product' : 'Add New Product'}</h3>
              <button onClick={closeModal} className="text-3xl font-light hover:rotate-90 transition-transform">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
               <div>
                <label className="text-[11px] font-black text-slate-400 ml-1">Product Name</label>
                <input type="text" required className="w-full bg-slate-50 border-none rounded-2xl p-4 mt-1 text-sm font-bold focus:ring-2 focus:ring-[#003354] outline-none" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-black text-slate-400 ml-1">Price</label>
                  <input type="number" required className="w-full bg-slate-50 border-none rounded-2xl p-4 mt-1 text-sm font-bold focus:ring-2 focus:ring-[#003354] outline-none" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} />
                </div>
                <div>
                  <label className="text-[11px] font-black text-slate-400 ml-1">Stock Quantity</label>
                  <input type="number" required className="w-full bg-slate-50 border-none rounded-2xl p-4 mt-1 text-sm font-bold focus:ring-2 focus:ring-[#003354] outline-none" value={newProduct.stockQuantity} onChange={(e) => setNewProduct({...newProduct, stockQuantity: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-black text-slate-400 ml-1">Category</label>
                <select required className="w-full bg-slate-50 border-none rounded-2xl p-4 mt-1 text-sm font-bold outline-none cursor-pointer focus:ring-2 focus:ring-[#003354]" value={newProduct.categoryId} onChange={(e) => setNewProduct({...newProduct, categoryId: e.target.value})}>
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeModal} className="flex-1 py-4 text-xs font-black text-slate-400 hover:text-slate-600 capitalize">Cancel</button>
                <button type="submit" className="flex-[2] bg-[#003354] text-white py-4 rounded-2xl font-black shadow-lg hover:opacity-90 transition-all text-xs capitalize">Save product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Inventory;