import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import Layout from '../components/Layout'; 
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

    // --- Create or Update Logic ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!roleName.trim()) return toast.error("Name is required");

        try {
            if (editingRole) {
                // ✅ UPDATED: Sahi ID property use ki hai
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
            // ✅ Backend se aane wala specific message display hoga
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

    // --- Delete Logic ---
    const handleDelete = async (role) => {
        // ✅ UPDATED: Fallback ID check taake delete sahi hit kare
        const id = role.id || role.roleId || role._id;
        
        if (!id) return toast.error("Role ID not found");

        if (window.confirm(`Are you sure you want to delete "${role.roleName || role.name}"?`)) {
            try {
                await deleteRole(id);
                toast.success("Deleted successfully");
                loadData();
            } catch (err) {
                // ✅ Error Handling: "Assigned to users" wala error yahan toast mein nazar aayega
                const msg = err.response?.data?.message || "Deleted failed";
                toast.error(msg, { duration: 4000 }); 
            }
        }
    };

    return (
        <Layout>
            <div className="p-6 min-h-screen bg-gray-50">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold">System Management</h1>
                    <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition-all">+ Add Role</button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="min-w-full">
                        <thead className="bg-slate-800 text-white text-xs uppercase">
                            <tr>
                                <th className="px-6 py-4 text-left">Role Name</th>
                                <th className="px-6 py-4 text-center">Total Users</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {roles.map((role) => {
                                const name = role.roleName || role.name;
                                const isSystemRole = name.toLowerCase() === 'admin';
                                
                                return (
                                    <tr key={role.id || role.roleId} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-gray-800 uppercase">{name}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="bg-gray-100 px-3 py-1 rounded-full text-sm font-semibold text-gray-600">
                                                {getRoleCount(name)} Members
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center space-x-2">
                                            {!isSystemRole ? (
                                                <>
                                                    <button onClick={() => openEditModal(role)} className="text-blue-600 bg-blue-50 px-3 py-1.5 rounded hover:bg-blue-100 font-bold transition-all">Edit</button>
                                                    <button onClick={() => handleDelete(role)} className="text-red-600 bg-red-50 px-3 py-1.5 rounded hover:bg-red-100 font-bold transition-all">Delete</button>
                                                </>
                                            ) : (
                                                <span className="text-gray-400 italic text-xs">System Protected</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* MODAL (For both Add & Edit) */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                        <div className="bg-white p-8 rounded-xl w-full max-w-md shadow-2xl border border-gray-100">
                            <h2 className="text-xl font-bold mb-4 text-gray-800">{editingRole ? "Edit Role" : "Add New Role"}</h2>
                            <form onSubmit={handleSubmit}>
                                <input 
                                    className="w-full border border-gray-300 p-3 rounded-lg mb-6 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                    value={roleName}
                                    onChange={(e) => setRoleName(e.target.value)}
                                    placeholder="Enter role name..."
                                    autoFocus
                                />
                                <div className="flex justify-end gap-3 font-semibold">
                                    <button type="button" onClick={closeModal} className="text-gray-500 hover:text-gray-700">Cancel</button>
                                    <button type="submit" className="bg-indigo-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-indigo-700 shadow-md">
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