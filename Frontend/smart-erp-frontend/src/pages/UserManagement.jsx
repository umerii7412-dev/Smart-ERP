import React, { useEffect, useState } from 'react';
import { getAllUsers, toggleUserStatus, registerUser, getUserPermissions, assignUserPermissions, getAllBaseRoles } from '../api'; 
import Layout from '../components/Layout'; 
import Swal from 'sweetalert2';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const [isPermModalOpen, setIsPermModalOpen] = useState(false); 
  const [permissionsList, setPermissionsList] = useState([]); 
  const [targetUser, setTargetUser] = useState(null); 

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    roleId: 3 
  });

  const currentUserRole = localStorage.getItem('role');
  const isAdmin = currentUserRole === 'Admin';

 useEffect(() => {
  const controller = new AbortController();
  const signal = controller.signal;

  // Dono functions ko signal pass karein
  loadUsers(signal);
  loadRoles(signal);

  return () => {
    controller.abort(); // Cleanup function: purani requests cancel karega
  };
}, []);

 const loadUsers = async (signal) => {
  try {
    const res = await getAllUsers({ signal }); // API call mein signal bhejain
    setUsers(res.data);
  } catch (err) {
    if (err.name === 'CanceledError' || err.name === 'AbortError') return;
    Swal.fire('Error', 'Users loading Error!', 'error');
  } finally {
    // Ye check zaroori hai taake unmounted component par state update na ho
    if (!signal.aborted) setLoading(false);
  }
};

const loadRoles = async (signal) => {
  try {
    const res = await getAllBaseRoles({ signal });
    setRoles(res.data);
  } catch (err) {
    if (err.name === 'CanceledError' || err.name === 'AbortError') return;
    console.error("Roles fetch error");
  }
};

  const handleOpenPermissions = async (user) => {
    setTargetUser(user);
    try {
      const res = await getUserPermissions(user.userId);
      setPermissionsList(res.data); 
      setIsPermModalOpen(true);
    } catch (err) {
      Swal.fire('Error', 'Permissions loading Error!', 'error');
    }
  };

  const togglePermission = (id) => {
    setPermissionsList(prev => prev.map(p => 
      p.id === id ? { ...p, isAssigned: !p.isAssigned } : p
    ));
  };

  const handleSavePermissions = async () => {
    const assignedIds = permissionsList.filter(p => p.isAssigned).map(p => p.id);
    try {
      await assignUserPermissions({ 
        userId: targetUser.userId, 
        permissionIds: assignedIds 
      });
      Swal.fire({
        title: 'Success',
        text: 'Permissions updated!',
        icon: 'success',
        timer: 5000,
        timerProgressBar: true,
        showConfirmButton: false
      });
      setIsPermModalOpen(false);
    } catch (err) {
      Swal.fire('Error', 'Update failed!', 'error');
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await registerUser(newUser);
      Swal.fire({
        title: 'Success',
        text: 'User Added Successfully!',
        icon: 'success',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false
      });
      setShowModal(false);
      setNewUser({ name: '', email: '', password: '', roleId: 3 });
      loadUsers();
    } catch (err) {
      Swal.fire('Error', 'User registration fail!', 'error');
    }
  };

  const handleStatusChange = async (id) => {
    if (!isAdmin) {
      Swal.fire('Access Denied', 'Only Admin can Block', 'warning');
      return;
    }
    try {
      await toggleUserStatus(id);
      Swal.fire({
        title: 'Updated',
        text: 'Status updated successfully!',
        icon: 'success',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false
      });
      loadUsers();
    } catch (err) {
      Swal.fire('Error', 'Action fail!', 'error');
    }
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-[#003354]">User Control Center</h1>
            <p className="text-[#95a5a6] text-sm font-medium mt-1">Manage system access and permissions</p>
          </div>
          
          {isAdmin && (
            <button 
              onClick={() => setShowModal(true)}
              className="bg-[#003354] text-white px-6 py-3 rounded-2xl text-sm font-black shadow-lg hover:opacity-90 transition-all active:scale-95 capitalize"
            >
              + Create New User
            </button>
          )}
        </div>

        <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#003354]">
              <tr className="text-[12px] font-[950] text-white border-b border-white/10">
                <th className="p-6 font-black text-left">User Info</th>
                <th className="p-6 text-center font-black">Designation / Role</th>
                <th className="p-6 text-center font-black">Status</th>
                <th className="p-6 text-right font-black">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map((user) => (
                <tr key={user.userId} className="hover:bg-slate-50 transition-all group border-b border-[#ecf0f1]">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-8 rounded-lg bg-slate-100 text-[#003354] flex items-center justify-center font-bold">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-[#2c3e50]">{user.name}</p>
                        <p className="text-xs text-[#95a5a6] font-medium">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <span className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-xl text-[11px] font-black">
                      {user.roleName || user.role?.name || 'Employee'}
                    </span>
                  </td>
                  <td className="p-6 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[11px] font-black ${
                      user.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {user.isActive ? 'Active' : 'Blocked'}
                    </span>
                  </td>
                  <td className="p-6 text-right space-x-2">
                    {(user.roleName !== 'Admin' && user.role?.name !== 'Admin') ? (
                      <>
                        <button 
  onClick={() => handleOpenPermissions(user)}
  className="px-4 py-2 rounded-xl text-[11px] bg-[#003354] text-white hover:opacity-90 transition-all shadow-sm"
>
  Grant Permission
</button>

<button 
  onClick={() => handleStatusChange(user.userId)}
  className={`px-4 py-2 rounded-xl text-[11px] transition-all shadow-sm ${
    user.isActive 
      ? 'bg-red-600 text-white hover:bg-red-700' 
      : 'bg-[#003354] text-white hover:opacity-90'
  }`}
>
  {user.isActive ? 'Block Access' : 'Unblock Access'}
</button>
                      </>
                    ) : (
                      <span className="text-slate-300 text-[11px] font-black italic px-4">
                        System Protected
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isPermModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="bg-[#003354] p-6 text-white flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-black">Grant Permissions</h2>
                    <p className="text-[11px] font-bold opacity-80">User: {targetUser?.name}</p>
                </div>
                <button onClick={() => setIsPermModalOpen(false)} className="text-2xl hover:scale-110 transition-transform">×</button>
              </div>
              <div className="p-8 max-h-[400px] overflow-y-auto space-y-6">
                 {Array.from(new Set(permissionsList.map(p => p.module))).map(moduleName => (
                    <div key={moduleName} className="space-y-3">
                        <h3 className="text-[11px] font-black text-slate-400 ml-1">{moduleName} System</h3>
                        <div className="grid grid-cols-1 gap-2">
                            {permissionsList.filter(p => p.module === moduleName).map(perm => (
                                <label key={perm.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200">
                                    <span className="text-sm font-bold text-slate-700">{perm.name.replace(/_/g, ' ')}</span>
                                    <input 
                                        type="checkbox" 
                                        className="w-5 h-5 rounded-lg border-slate-300 text-[#003354] focus:ring-[#003354]"
                                        checked={perm.isAssigned}
                                        onChange={() => togglePermission(perm.id)}
                                    />
                                </label>
                            ))}
                        </div>
                    </div>
                 ))}
              </div>
              <div className="p-6 bg-slate-50 border-t flex gap-3">
                <button 
                  onClick={() => setIsPermModalOpen(false)}
                  className="flex-1 py-4 text-xs font-black text-slate-400 hover:text-slate-600"
                >
                  Discard
                </button>
                <button 
                  onClick={handleSavePermissions}
                  className="flex-[2] bg-[#003354] text-white py-4 rounded-2xl font-black text-xs shadow-lg hover:opacity-90 transition-all"
                >
                  Save Access Rights
                </button>
              </div>
            </div>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden">
              <div className="bg-[#003354] p-6 text-white flex justify-between items-center">
                <h2 className="text-xl font-black tracking-tight">Register New User</h2>
                <button onClick={() => setShowModal(false)} className="text-2xl hover:rotate-90 transition-transform">×</button>
              </div>
              <form onSubmit={handleAddUser} className="p-8 space-y-5">
                <div>
                  <label className="text-[11px] font-black text-slate-400 ml-1">Full Name</label>
                  <input required className="w-full bg-slate-50 border-none rounded-2xl p-4 mt-1 text-sm font-bold focus:ring-2 focus:ring-[#003354] outline-none" value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} />
                </div>
                <div>
                  <label className="text-[11px] font-black text-slate-400 ml-1">Email</label>
                  <input required type="email" className="w-full bg-slate-50 border-none rounded-2xl p-4 mt-1 text-sm font-bold focus:ring-2 focus:ring-[#003354] outline-none" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} />
                </div>
                <div>
                  <label className="text-[11px] font-black text-slate-400 ml-1">Password</label>
                  <input required type="password" className="w-full bg-slate-50 border-none rounded-2xl p-4 mt-1 text-sm font-bold focus:ring-2 focus:ring-[#003354] outline-none" value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} />
                </div>
                <div>
                  <label className="text-[11px] font-black text-slate-400 ml-1">Role</label>
                  <select className="w-full bg-slate-50 border-none rounded-2xl p-4 mt-1 text-sm font-bold outline-none cursor-pointer focus:ring-2 focus:ring-[#003354]" value={newUser.roleId} onChange={(e) => setNewUser({...newUser, roleId: parseInt(e.target.value)})}>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="w-full bg-[#003354] text-white py-4 rounded-2xl font-black text-xs shadow-lg hover:opacity-90 transition-all">
                  Add User
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default UserManagement;