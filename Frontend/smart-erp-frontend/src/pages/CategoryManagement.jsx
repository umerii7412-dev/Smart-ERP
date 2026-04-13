import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { Plus, Tag, Trash2 } from 'lucide-react';

const CategoryManagement = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/Category');
      setCategories(res.data);
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: "Categories load nahi ho saki",
        icon: 'error',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false
      });
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation(); 
    
    Swal.fire({
      title: 'Are you sure?',
      text: "You want to delete this category?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#003354',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/Category/${id}`);
          Swal.fire({
            title: 'Deleted!',
            text: 'Deleted Successfully!',
            icon: 'success',
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false
          });
          fetchCategories();
        } catch (err) {
          Swal.fire({
            title: 'Error',
            text: 'Deleted Failed!',
            icon: 'error',
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false
          });
        }
      }
    });
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory) return;

    const categoryExists = categories.find(
      (cat) => cat.name.trim().toLowerCase() === newCategory.trim().toLowerCase()
    );

    if (categoryExists) {
      Swal.fire({
        title: 'Already Exist!',
        text: 'Category name must be unique.',
        icon: 'warning',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false
      });
      return;
    }

    setLoading(true);
    try {
      await api.post('/Category', { name: newCategory });
      Swal.fire({
        title: 'Success!',
        text: 'Category Added successfully!',
        icon: 'success',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false
      });
      setNewCategory("");
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: 'Category Added Error',
        icon: 'error',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false
      });
    } finally { setLoading(false); }
  };

  return (
    <Layout>
      <div className="p-8 bg-[#F8FAFC] min-h-screen space-y-8 animate-in fade-in duration-500">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-[#003354] tracking-tight">
              Categories
            </h1>
            <p className="text-slate-400 text-[10px] font-bold capitalize tracking-[0.2em]">
              Inventory Classification
            </p>
          </div>
          
          <button 
            onClick={() => setShowModal(true)}
            className="bg-[#003354] text-white px-8 py-3 rounded-2xl text-[13px] font-bold tracking-wide shadow-xl shadow-slate-200 hover:opacity-90 transition-all flex items-center gap-2 capitalize"
          >
            <Plus size={18} strokeWidth={2.5} /> Add Category
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <div 
              key={cat.id} 
              onClick={() => navigate('/inventory', { state: { categoryName: cat.name } })}
              className="bg-white p-6 rounded-[28px] border border-[#ecf0f1] shadow-sm hover:shadow-md hover:border-[#003354] cursor-pointer transition-all group relative overflow-hidden"
            >
              <button 
                onClick={(e) => handleDelete(e, cat.id)}
                className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 transition-colors z-10"
              >
                <Trash2 size={16} />
              </button>

              <div className="bg-slate-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-[#003354] group-hover:bg-[#003354] group-hover:text-white transition-colors">
                <Tag size={20} />
              </div>
              
              <h3 className="text-sm font-black text-slate-800 capitalize tracking-tight">{cat.name}</h3>
              <p className="text-[10px] text-slate-400 font-bold mt-1 capitalize italic">View Products</p>
              
              <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-slate-50 rounded-full group-hover:bg-slate-100 transition-colors"></div>
            </div>
          ))}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-300">
              <div className="bg-[#003354] p-8 text-white text-center">
                <h2 className="text-xl font-black italic capitalize tracking-tighter">New Category</h2>
              </div>
              <form onSubmit={handleAddCategory} className="p-8 space-y-6">
                <div>
                  <label className="text-[10px] font-black capitalize text-slate-400 ml-1 tracking-widest">Category Name</label>
                  <input 
                    required 
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 mt-2 text-sm font-bold focus:ring-2 focus:ring-[#003354] outline-none"
                    placeholder="e.g. Electronics"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 text-xs font-black capitalize text-slate-400 hover:text-slate-600 transition-colors">Cancel</button>
                  <button type="submit" disabled={loading} className="flex-1 bg-[#003354] text-white py-4 rounded-2xl font-bold text-[13px] shadow-lg shadow-slate-200 hover:opacity-90 capitalize tracking-wide">
                    {loading ? "Saving..." : "Save Category"}
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

export default CategoryManagement;