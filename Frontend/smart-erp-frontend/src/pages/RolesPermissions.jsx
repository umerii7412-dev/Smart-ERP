import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import Layout from '../components/Layout'; 
import { X } from 'lucide-react';
import { 
    getUsersWithRoles, 
    getAllBaseRoles, 
    createRole, 
    deleteRole,
    updateRole 
} from '../api';

const Roles = () => {
    const [users, setUsers] = useState([]); 
    const [roles, setRoles] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState(null); 
    const [roleName, setRoleName] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [userRes, roleRes] = await Promise.all([
                getUsersWithRoles(),
                getAllBaseRoles()
            ]);
            setUsers(userRes.data || []);
            setRoles(roleRes.data || []);
        } catch (err) {
            toast.error("Failed to load data.");
        }
    };

    const getRoleCount = (rName) => {
        return users.filter(user => user.roleName === rName).length;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!roleName.trim()) return toast.error("Name is required");

        try {
            if (editingRole) {
                const id = editingRole.id || editingRole.roleId;
                await updateRole(id, { roleName: roleName });
                toast.success("Role updated!");
            } else {
                await createRole({ roleName: roleName });
                toast.success("Role created!");
            }
            closeModal();
            loadData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Operation failed");
        }
    };

    const openEditModal = (role) => {
        setEditingRole(role);
        setRoleName(role.roleName || role.name);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingRole(null);
        setRoleName("");
    };

    const handleDelete = async (role) => {
        const id = role.id || role.roleId || role._id;
        if (!id) return toast.error("Role ID not found");

        if (window.confirm(`Are you sure you want to delete "${role.roleName || role.name}"?`)) {
            try {
                await deleteRole(id);
                toast.success("Deleted successfully");
                loadData();
            } catch (err) {
                const msg = err.response?.data?.message || "Deleted failed";
                toast.error(msg, { duration: 4000 }); 
            }
        }
    };

    return (
        <Layout>
            <div className="p-6 min-h-screen bg-gray-50/50">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">System Management</h1>
                    {/* Add Role Button */}
                  <button 
    onClick={() => setIsModalOpen(true)} 
    className="bg-[#3da9f5] text-white px-8 py-2.5 rounded-xl font-bold normal-case text-[11px] tracking-widest shadow-lg shadow-blue-100 hover:bg-[#3498db] transition-all active:scale-95"
>
    + Add Role
</button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <table className="min-w-full">
                        {/* Table Header - Matching Button Color exactly */}
                        <thead className="bg-[#3da9f5]">
                            <tr>
                                <th className="px-6 py-4 text-left text-[11px] font-[900] text-black uppercase tracking-[0.2em]">Role Name</th>
                                <th className="px-6 py-4 text-center text-[11px] font-[900] text-black uppercase tracking-[0.2em]">Total Users</th>
                                <th className="px-6 py-4 text-center text-[11px] font-[900] text-black uppercase tracking-[0.2em]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {roles.map((role) => {
                                const name = role.roleName || role.name;
                                const isSystemRole = name.toLowerCase() === 'admin';
                                
                                return (
                                    <tr key={role.id || role.roleId} className="hover:bg-blue-50/20 transition-colors">
                                        <td className="px-6 py-5 font-bold text-slate-700 uppercase text-sm">{name}</td>
                                        <td className="px-6 py-5 text-center">
                                            <span className="bg-blue-50 text-[#3da9f5] px-4 py-1.5 rounded-full text-[11px] font-bold border border-blue-100">
                                                {getRoleCount(name)} Members
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-center space-x-2">
                                            {!isSystemRole ? (
                                                <div className="flex justify-center gap-2">
                                                    {/* Edit Button - Same color as Add Role */}
                                                    <button onClick={() => openEditModal(role)} className="bg-[#3da9f5] text-white px-4 py-2 rounded-lg hover:bg-[#3498db] font-bold transition-all text-[10px] uppercase shadow-sm">Edit</button>
                                                    <button onClick={() => handleDelete(role)} className="text-red-600 bg-red-50 px-4 py-2 rounded-lg hover:bg-red-100 font-bold transition-all text-[10px] uppercase">Delete</button>
                                                </div>
                                            ) : (
                                                <span className="text-slate-300 text-[10px] font-bold uppercase tracking-widest">System Protected</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* MODAL */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-[30px] w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden">
                            <div className="bg-[#3da9f5] p-6 text-white flex justify-between items-center">
                                <h2 className="text-sm font-bold uppercase tracking-widest">{editingRole ? "Update Role" : "Add New Role"}</h2>
                                <button onClick={closeModal} className="hover:rotate-90 transition-transform"><X size={20} /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Role Name</label>
                                    <input 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-bold outline-none focus:border-[#3da9f5] transition-all text-slate-800"
                                        value={roleName}
                                        onChange={(e) => setRoleName(e.target.value)}
                                        placeholder="Enter name..."
                                        autoFocus
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button type="button" onClick={closeModal} className="flex-1 py-3 text-[11px] font-bold uppercase text-slate-400">Cancel</button>
                                    <button type="submit" className="flex-[2] bg-[#3da9f5] text-white py-3 rounded-xl font-bold uppercase text-[11px] tracking-widest shadow-lg shadow-blue-50 hover:bg-[#3498db] transition-all">
                                        {editingRole ? "Save Changes" : "Create Role"}
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

export default Roles;