import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Plus, Search, Folder, Trash2, Calendar } from 'lucide-react';

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ name: '', description: '', status: 'active' });
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try {
      const res = await client.get('/projects');
      setProjects(res.data.data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      await client.post('/projects', formData);
      setIsModalOpen(false);
      setFormData({ name: '', description: '', status: 'active' });
      fetchProjects();
    } catch (error) { console.error(error); } finally { setSubmitLoading(false); }
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Delete this project?')) return;
    try { await client.delete(`/projects/${id}`); fetchProjects(); } catch (error) { console.error(error); }
  };

  const filtered = projects.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">Projects</h1>
          <p className="text-zinc-500 text-sm mt-1">Manage and track your ongoing work</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/20 border border-indigo-500/50">
          <Plus className="h-4 w-4 mr-2" /> New Project
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md group">
        <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
        <input 
          type="text" 
          placeholder="Search projects..." 
          className="w-full bg-zinc-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 focus:outline-none transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-zinc-500">Loading projects...</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl bg-white/5">
          <Folder className="h-12 w-12 mx-auto text-zinc-600 mb-4" />
          <p className="text-zinc-400">No projects found. Create one to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((project) => (
            <div key={project.id} className="group bg-zinc-900/40 backdrop-blur-sm border border-white/5 p-6 rounded-2xl hover:border-indigo-500/30 hover:bg-zinc-900/60 transition-all duration-300 hover:-translate-y-1 shadow-xl">
              <div className="flex justify-between items-start mb-5">
                <div className="p-3 bg-zinc-800 rounded-xl group-hover:bg-indigo-500/20 transition-colors">
                  <Folder className="h-6 w-6 text-zinc-400 group-hover:text-indigo-400" />
                </div>
                <div className="flex gap-2">
                   <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${
                    project.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                    'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}>
                    {project.status}
                  </span>
                  <button onClick={() => handleDelete(project.id)} className="text-zinc-500 hover:text-red-400 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <Link to={`/projects/${project.id}`} className="block">
                 <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">{project.name}</h3>
              </Link>
              <p className="text-zinc-400 text-sm line-clamp-2 h-10 mb-6">{project.description}</p>
              
              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-zinc-500">
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(project.created_at).toLocaleDateString()}</span>
                <span className="bg-zinc-800 px-2 py-1 rounded text-zinc-300">{project.creator?.full_name}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Project">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Project Name" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Description</label>
            <textarea className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none h-24" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
          </div>
          <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500" isLoading={submitLoading}>Create Project</Button>
        </form>
      </Modal>
    </div>
  );
};
export default ProjectsPage;