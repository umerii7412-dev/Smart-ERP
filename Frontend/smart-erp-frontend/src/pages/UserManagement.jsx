import React, { useEffect, useState } from 'react';
import { getAllUsers, toggleUserStatus, registerUser } from '../api'; 
import Layout from '../components/Layout'; 
import toast from 'react-hot-toast';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // New User Form State
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Employee'
  });

  // Current User Role check
  const currentUserRole = localStorage.getItem('role');
  const isAdmin = currentUserRole === 'Admin';

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await getAllUsers();
      setUsers(res.data);
    } catch (err) {
      toast.error("Users load nahi ho sakay");
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await registerUser(newUser);
      toast.success("Naya user add ho gaya!");
      setShowModal(false);
      setNewUser({ name: '', email: '', password: '', role: 'Employee' });
      loadUsers();
    } catch (err) {
      toast.error("User registration fail!");
    }
  };

  const handleStatusChange = async (id) => {
    if (!isAdmin) {
      toast.error("Sirf Admin block kar sakta hai");
      return;
    }
    try {
      await toggleUserStatus(id);
      toast.success("Status updated!");
      loadUsers();
    } catch (err) {
      toast.error("Action fail!");
    }
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-slate-800">User Control Center</h1>
            <p className="text-slate-500 text-sm font-medium">Manage system access and permissions</p>
          </div>
          
          {/* Add User Button - Sirf Admin ko dikhega */}
          {isAdmin && (
            <button 
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-sm font-black shadow-lg hover:bg-blue-700 transition-all active:scale-95"
            >
              + Create New User
            </button>
          )}
        </div>

        <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50">
              <tr className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                <th className="p-6">User Info</th>
                <th className="p-6 text-center">Designation / Role</th>
                <th className="p-6 text-center">Status</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map((user, index) => (
                <tr key={user.userId} className="hover:bg-slate-50/50 transition-all group">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{user.name}</p>
                        <p className="text-xs text-slate-400 font-medium">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <span className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase">
                      {user.role}
                    </span>
                  </td>
                  <td className="p-6 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${
                      user.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {user.isActive ? 'Active' : 'Blocked'}
                    </span>
                  </td>
                  <td className="p-6 text-right space-x-2">
                    {/* Admin protection: Buttons hide for Admin role rows */}
                    {user.role !== 'Admin' ? (
                      <>
                        <button 
                          className="px-4 py-2 rounded-xl text-[10px] font-black uppercase bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all"
                        >
                          Grant Permission
                        </button>
                        <button 
                          onClick={() => handleStatusChange(user.userId)}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                            user.isActive ? 'bg-slate-800 text-white hover:bg-red-600' : 'bg-blue-600 text-white'
                          }`}
                        >
                          {user.isActive ? 'Block Access' : 'Unblock Access'}
                        </button>
                      </>
                    ) : (
                      <span className="text-[10px] font-black text-slate-300 uppercase italic px-4">
                        System Protected
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* --- ADD USER MODAL --- */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden">
              <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
                <h2 className="text-xl font-black italic uppercase tracking-tight">Register New User</h2>
                <button onClick={() => setShowModal(false)} className="text-2xl hover:rotate-90 transition-transform">×</button>
              </div>
              <form onSubmit={handleAddUser} className="p-8 space-y-5">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Full Name</label>
                  <input 
                    required className="w-full bg-slate-50 border-none rounded-2xl p-4 mt-1 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Enter name"
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Email</label>
                  <input 
                    required type="email" className="w-full bg-slate-50 border-none rounded-2xl p-4 mt-1 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="email@example.com"
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Password</label>
                  <input 
                    required type="password" className="w-full bg-slate-50 border-none rounded-2xl p-4 mt-1 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="••••••••"
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Role</label>
                  <select 
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 mt-1 text-sm font-bold outline-none"
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  >
                    <option value="Employee">Employee</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-xs shadow-lg hover:bg-blue-700 transition-all">
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