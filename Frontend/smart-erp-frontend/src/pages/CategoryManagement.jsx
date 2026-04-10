import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Plus, Tag, Trash2 } from 'lucide-react'; // Trash2 icon add kiya

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
      toast.error("Categories load nahi ho saki");
    }
  };

  // --- DELETE FUNCTION ---
  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Card click (navigate) ko rokne ke liye
    if (!window.confirm("Are you sure you want to delete?")) return;

    try {
      await api.delete(`/Category/${id}`);
      toast.success("Category delete ho gayi!");
      fetchCategories();
    } catch (err) {
      toast.error("Deleted Failed!");
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory) return;

    // --- CASE INSENSITIVE CHECK ---
    const categoryExists = categories.find(
      (cat) => cat.name.trim().toLowerCase() === newCategory.trim().toLowerCase()
    );

    if (categoryExists) {
      toast.error("Category Already Exist (Small/Capital dono check kar liye)!");
      return;
    }

    setLoading(true);
    try {
      await api.post('/Category', { name: newCategory });
      toast.success("Category Added successfully!");
      setNewCategory("");
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      toast.error("Category Added Error");
    } finally { setLoading(false); }
  };

  return (
    <Layout>
      <div className="p-8 bg-[#F8FAFC] min-h-screen space-y-8 animate-in fade-in duration-500">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight uppercase">
  Categories
</h1>
<p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
  Inventory Classification
</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2"
          >
            <Plus size={16} /> Add Category
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <div 
              key={cat.id} 
              onClick={() => navigate('/inventory', { state: { categoryName: cat.name } })}
              className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-500 cursor-pointer transition-all group relative overflow-hidden"
            >
              {/* DELETE BUTTON (TOP RIGHT) */}
              <button 
                onClick={(e) => handleDelete(e, cat.id)}
                className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 transition-colors z-10"
              >
                <Trash2 size={16} />
              </button>

              <div className="bg-blue-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Tag size={20} />
              </div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">{cat.name}</h3>
              <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase italic">View Products</p>
              
              <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-slate-50 rounded-full group-hover:bg-blue-50 transition-colors"></div>
            </div>
          ))}
        </div>

        {/* Modal Section */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-300">
              <div className="bg-slate-900 p-8 text-white">
                <h2 className="text-xl font-black italic uppercase tracking-tighter text-center">New Category</h2>
              </div>
              <form onSubmit={handleAddCategory} className="p-8 space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Category Name</label>
                  <input 
                    required 
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 mt-2 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. Electronics"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 text-xs font-black uppercase text-slate-400">Cancel</button>
                  <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-xs shadow-lg shadow-blue-100">
                    {loading ? "Saving..." : "Save"}
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