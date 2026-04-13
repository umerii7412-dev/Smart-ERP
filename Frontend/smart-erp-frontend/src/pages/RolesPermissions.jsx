import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout'; 
import { X } from 'lucide-react';
import Swal from 'sweetalert2';
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
            Swal.fire({
                title: 'Error',
                text: 'Failed to load data.',
                icon: 'error',
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false
            });
        }
    };

    const getRoleCount = (rName) => {
        return users.filter(user => user.roleName === rName).length;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!roleName.trim()) {
            return Swal.fire({
                title: 'Required',
                text: 'Name is required',
                icon: 'warning',
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false
            });
        }

        try {
            if (editingRole) {
                const id = editingRole.id || editingRole.roleId;
                await updateRole(id, { roleName: roleName });
                Swal.fire({
                    title: 'Updated',
                    text: 'Role updated successfully!',
                    icon: 'success',
                    timer: 3000,
                    timerProgressBar: true,
                    showConfirmButton: false
                });
            } else {
                await createRole({ roleName: roleName });
                Swal.fire({
                    title: 'Created',
                    text: 'Role created successfully!',
                    icon: 'success',
                    timer: 3000,
                    timerProgressBar: true,
                    showConfirmButton: false
                });
            }
            closeModal();
            loadData();
        } catch (err) {
            Swal.fire({
                title: 'Failed',
                text: err.response?.data?.message || "Operation failed",
                icon: 'error',
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false
            });
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
        if (!id) return;

        Swal.fire({
            title: 'Are you sure?',
            text: `You want to delete "${role.roleName || role.name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#003354',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await deleteRole(id);
                    Swal.fire({
                        title: 'Deleted!',
                        text: 'Role has been deleted.',
                        icon: 'success',
                        timer: 3000,
                        timerProgressBar: true,
                        showConfirmButton: false
                    });
                    loadData();
                } catch (err) {
                    Swal.fire({
                        title: 'Error',
                        text: err.response?.data?.message || "Delete failed",
                        icon: 'error',
                        timer: 3000,
                        timerProgressBar: true,
                        showConfirmButton: false
                    });
                }
            }
        });
    };

    return (
        <Layout>
            <div className="p-6 min-h-screen bg-gray-50/50">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-[#003354]">System Management</h1>
                    
                    <button 
                        onClick={() => setIsModalOpen(true)} 
                        className="bg-[#003354] text-white px-8 py-2.5 rounded-xl font-bold text-[13px] shadow-lg shadow-slate-200 hover:opacity-90 transition-all active:scale-95"
                    >
                        + Add Role
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <table className="min-w-full">
                        <thead className="bg-[#003354]">
                            <tr>
                                <th className="px-6 py-4 text-left text-[12px] font-bold text-white border-b border-white/10">Role Name</th>
                                <th className="px-6 py-4 text-center text-[12px] font-bold text-white border-b border-white/10">Total Users</th>
                                <th className="px-6 py-4 text-center text-[12px] font-bold text-white border-b border-white/10">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {roles.map((role) => {
                                const name = role.roleName || role.name;
                                const isSystemRole = name.toLowerCase() === 'admin';
                                
                                return (
                                    <tr key={role.id || role.roleId} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-5 font-bold text-slate-700 text-sm">{name}</td>
                                        <td className="px-6 py-5 text-center">
                                            <span className="bg-slate-100 text-[#003354] px-4 py-1.5 rounded-full text-[12px] font-bold border border-slate-200">
                                                {getRoleCount(name)} Members
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            {!isSystemRole ? (
                                                <div className="flex justify-center gap-2">
                                                    <button onClick={() => openEditModal(role)} className="bg-[#003354] text-white px-4 py-2 rounded-lg hover:opacity-90 font-bold transition-all text-[11px] shadow-sm">Edit</button>
                                                    <button onClick={() => handleDelete(role)} className="text-red-600 bg-red-50 px-4 py-2 rounded-lg hover:bg-red-100 font-bold transition-all text-[11px]">Delete</button>
                                                </div>
                                            ) : (
                                                <span className="text-slate-300 text-[11px] font-bold">System Protected</span>
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
                            <div className="bg-[#003354] p-6 text-white flex justify-between items-center">
                                <h2 className="text-sm font-bold">{editingRole ? "Update Role" : "Add New Role"}</h2>
                                <button onClick={closeModal} className="hover:rotate-90 transition-transform"><X size={20} /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-slate-400 ml-1">Role Name</label>
                                    <input 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-bold outline-none focus:border-[#003354] transition-all text-slate-800"
                                        value={roleName}
                                        onChange={(e) => setRoleName(e.target.value)}
                                        placeholder="Enter name..."
                                        autoFocus
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button type="button" onClick={closeModal} className="flex-1 py-3 text-[12px] font-bold text-slate-400">Cancel</button>
                                    <button type="submit" className="flex-[2] bg-[#003354] text-white py-3 rounded-xl font-bold text-[12px] shadow-lg shadow-slate-100 hover:opacity-90 transition-all">
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