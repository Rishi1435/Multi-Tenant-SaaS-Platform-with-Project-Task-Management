import { useState, useEffect } from 'react';
import client from '../api/client';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Plus, Mail, Shield, Trash2, User } from 'lucide-react';

const TeamPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', role: 'user' });

  useEffect(() => { fetchUsers(); }, []);
  const fetchUsers = async () => {
    try { const res = await client.get('/users'); setUsers(res.data.data); } catch (error) { console.error(error); } finally { setLoading(false); }
  };
  const handleInvite = async (e) => {
    e.preventDefault();
    try { await client.post('/users', formData); setIsModalOpen(false); setFormData({ fullName: '', email: '', password: '', role: 'user' }); fetchUsers(); } 
    catch (error) { alert('Error: ' + error.message); }
  };
  const handleDelete = async (id) => {
    if(!window.confirm('Remove user?')) return;
    try { await client.delete(`/users/${id}`); fetchUsers(); } catch (error) { alert('Error: ' + error.message); }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Team Members</h1>
          <p className="text-zinc-400 text-sm mt-1">Manage workspace access</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-500"><Plus className="h-4 w-4 mr-2" /> Add Member</Button>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <div key={user.id} className="bg-zinc-900/40 backdrop-blur-sm p-6 rounded-2xl border border-white/5 flex justify-between items-start hover:bg-zinc-900/60 transition-colors">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {user.full_name.charAt(0)}
              </div>
              <div>
                <h3 className="text-white font-bold">{user.full_name}</h3>
                <div className="flex items-center text-zinc-500 text-xs mt-1"><Mail className="h-3 w-3 mr-1" />{user.email}</div>
                <div className="flex items-center text-indigo-400 text-xs mt-1 capitalize font-medium"><Shield className="h-3 w-3 mr-1" />{user.role.replace('_', ' ')}</div>
              </div>
            </div>
            <button onClick={() => handleDelete(user.id)} className="text-zinc-600 hover:text-red-400 p-2 hover:bg-white/5 rounded-lg transition-colors"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Team Member">
        <form onSubmit={handleInvite} className="space-y-4">
          <Input label="Full Name" required value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
          <Input label="Email" type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          <Input label="Temp Password" type="password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Role</label>
            <select className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:border-indigo-500 outline-none" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
              <option value="user">Member</option>
              <option value="tenant_admin">Admin</option>
            </select>
          </div>
          <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500">Create User</Button>
        </form>
      </Modal>
    </div>
  );
};
export default TeamPage;