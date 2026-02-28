"use client";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { 
  UserCircle, 
  MoreVertical, 
  ShieldCheck,
  Briefcase,
  Search,
  UserPlus,
  Trash2,
  Ban,
  CheckCircle,
  X,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface UserWithRole {
  id: string;
  email: string;
  role: 'admin' | 'staff' | 'borrower';
  status: 'active' | 'deactivated' | 'banned';
}

export default function UserManagementPage() {
  const { role, loading } = useAuth(true);
  const router = useRouter();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Add User Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<'admin' | 'staff' | 'borrower'>('borrower');
  
  // Status feedback
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchUsers = async () => {
    const { data, error } = await supabase.rpc('get_users_with_roles');
    if (error) {
      console.error("Error fetching users:", error.message);
    } else if (data) {
      interface RawUserRow {
        u_id: string;
        u_email: string;
        u_role: 'admin' | 'staff' | 'borrower';
        u_status: 'active' | 'deactivated' | 'banned';
      }
      const mappedData = (data as RawUserRow[]).map((item) => ({
        id: item.u_id,
        email: item.u_email,
        role: item.u_role,
        status: item.u_status || 'active'
      }));
      setUsers(mappedData);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (!loading) {
      if (role !== 'admin') {
        router.push('/dashboard');
      } else {
        fetchUsers();
      }
    }
  }, [loading, role, router]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setErrorMsg("");
    
    try {
      const { error } = await supabase.rpc('admin_create_user', {
        email: newEmail,
        password: newPassword,
        user_role: newRole
      });

      if (error) throw error;

      setSuccessMsg("User created successfully!");
      setNewEmail("");
      setNewPassword("");
      setNewRole('borrower');
      setTimeout(() => {
        setIsAddModalOpen(false);
        setSuccessMsg("");
      }, 1500);
      await fetchUsers();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to permanently delete this user? This cannot be undone.")) return;
    
    setIsUpdating(true);
    const { error } = await supabase.rpc('admin_delete_user', { target_user_id: userId });
    if (error) {
      alert("Error: " + error.message);
    } else {
      await fetchUsers();
    }
    setIsUpdating(false);
  };

  const updateStatus = async (userId: string, newStatus: string) => {
    setIsUpdating(true);
    const { error } = await supabase.rpc('admin_set_user_status', { 
      target_user_id: userId, 
      new_status: newStatus 
    });
    if (error) {
      alert("Error updating status: " + error.message);
    }
    await fetchUsers();
    setIsUpdating(false);
  };

  const updateUserRole = async (userId: string, targetRole: string) => {
    setIsUpdating(true);
    const { error } = await supabase
      .from('user_roles')
      .update({ role: targetRole })
      .eq('user_id', userId);

    if (error) {
      console.error("Error updating role:", error.message);
      alert(error.message);
    }
    
    await fetchUsers();
    setEditingUserId(null);
    setIsUpdating(false);
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading || role !== 'admin' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-t-2 border-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-serif font-semibold text-slate-800 tracking-tight">User Management</h1>
          <p className="text-slate-500 mt-2 font-sans tracking-wide">Securely manage team access and borrower records.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input 
               type="text" 
               placeholder="Search by email..."
               className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none w-64 shadow-sm"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
           <button 
             onClick={() => setIsAddModalOpen(true)}
             className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-500 transition-all shadow-lg shadow-primary-500/25 text-sm font-medium"
           >
             <UserPlus className="w-4 h-4" />
             Add User
           </button>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { icon: ShieldCheck, label: 'Admins', count: users.filter(u => u.role === 'admin').length, color: 'text-primary-600', bg: 'bg-primary-50' },
          { icon: Briefcase, label: 'Staff', count: users.filter(u => u.role === 'staff').length, color: 'text-blue-600', bg: 'bg-blue-50' },
          { icon: UserCircle, label: 'Borrowers', count: users.filter(u => u.role === 'borrower').length, color: 'text-slate-600', bg: 'bg-slate-50' },
          { icon: Ban, label: 'Banned', count: users.filter(u => u.status !== 'active').length, color: 'text-red-600', bg: 'bg-red-50' },
        ].map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i} 
            className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 transition-transform hover:translate-y-[-2px]"
          >
            <div className={`p-3.5 ${stat.bg} ${stat.color} rounded-xl`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <h4 className="text-2xl font-bold text-slate-800 mt-0.5">{stat.count}</h4>
            </div>
          </motion.div>
        ))}
      </div>

      {/* User Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-widest">User & Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-widest">Current Role</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-widest text-right">Settings</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {filteredUsers.map((u) => (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={u.id} 
                    className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors group ${u.status !== 'active' ? 'opacity-60 bg-slate-50/30' : ''}`}
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border shadow-sm group-hover:bg-white transition-all ${u.status === 'banned' ? 'bg-red-50 text-red-400 border-red-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                          {u.status === 'banned' ? <Ban className="w-4 h-4" /> : u.email[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-slate-800">{u.email}</p>
                            {u.status !== 'active' && (
                              <span className="text-[10px] items-center px-1.5 py-0.5 rounded bg-red-100 text-red-600 font-bold uppercase tracking-tighter">
                                {u.status}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 font-mono">ID: {u.id.substring(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center">
                        {editingUserId === u.id ? (
                           <select 
                            className="text-sm bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all shadow-sm"
                            value={u.role || 'borrower'}
                            onChange={(e) => updateUserRole(u.id, e.target.value)}
                            disabled={isUpdating}
                           >
                              <option value="admin">Admin</option>
                              <option value="staff">Staff</option>
                              <option value="borrower">Borrower</option>
                           </select>
                        ) : (
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ring-1 ring-inset ${
                            u.role === 'admin' 
                              ? 'bg-primary-50 text-primary-700 ring-primary-500/20' 
                              : u.role === 'staff' 
                                ? 'bg-blue-50 text-blue-700 ring-blue-500/20' 
                                : 'bg-slate-50 text-slate-600 ring-slate-200'
                          }`}>
                            {u.role === 'admin' && <ShieldCheck className="w-3 h-3" />}
                            {u.role || 'Borrower'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right flex items-center justify-end gap-2">
                      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                        {u.status === 'active' ? (
                          <button 
                            onClick={() => updateStatus(u.id, 'banned')}
                            title="Ban User"
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        ) : (
                          <button 
                            onClick={() => updateStatus(u.id, 'active')}
                            title="Activate User"
                            className="p-2 text-slate-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-all"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDeleteUser(u.id)}
                          title="Delete User"
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <button 
                        onClick={() => setEditingUserId(editingUserId === u.id ? null : u.id)}
                        className={`p-2 rounded-lg transition-all ${editingUserId === u.id ? 'bg-primary-50 text-primary-600' : 'text-slate-400 hover:text-primary-500 hover:bg-primary-50'}`}
                      >
                         <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="py-20 text-center text-slate-400">
              <Search className="w-8 h-8 mx-auto mb-3 opacity-20" />
              <p>No users matched your search.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isUpdating && setIsAddModalOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
              >
                <div className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary-50 rounded-xl">
                        <UserPlus className="w-5 h-5 text-primary-600" />
                      </div>
                      <h2 className="text-xl font-serif font-bold text-slate-800 tracking-tight">Add New Librarian</h2>
                    </div>
                    <button 
                      onClick={() => setIsAddModalOpen(false)}
                      className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {errorMsg && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700 font-medium">{errorMsg}</p>
                    </div>
                  )}

                  {successMsg && (
                    <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-green-700 font-medium">{successMsg}</p>
                    </div>
                  )}

                  <form onSubmit={handleAddUser} className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">STI Outlook Email</label>
                      <input 
                        type="email" 
                        required
                        placeholder="LastName.ID@alabang.sti.edu.ph"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 outline-none focus:border-primary-500 transition-all shadow-sm"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Initial Password</label>
                      <input 
                        type="password" 
                        required
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 outline-none focus:border-primary-500 transition-all shadow-sm"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Assigned Role</label>
                      <select 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-primary-500 transition-all shadow-sm"
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value as 'admin' | 'staff' | 'borrower')}
                      >
                        <option value="borrower">Borrower (Standard)</option>
                        <option value="staff">Staff (Limited Control)</option>
                        <option value="admin">Admin (Full Control)</option>
                      </select>
                    </div>

                    <div className="pt-4 flex gap-3">
                      <button 
                        type="button"
                        onClick={() => setIsAddModalOpen(false)}
                        className="flex-1 py-3 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-all"
                      >
                        Cancel
                      </button>
                      <button 
                        disabled={isUpdating}
                        type="submit"
                        className="flex-1 py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20 transition-all flex items-center justify-center gap-2"
                      >
                        {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
