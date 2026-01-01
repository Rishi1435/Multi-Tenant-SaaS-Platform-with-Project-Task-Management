import { useState, useEffect } from 'react';
import client from '../api/client';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Plus, Search, Folder, MoreVertical, Trash2 } from 'lucide-react';

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [formData, setFormData] = useState({ name: '', description: '', status: 'active' });
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await client.get('/projects');
      setProjects(res.data.data);
    } catch (error) {
      console.error('Failed to fetch projects', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      await client.post('/projects', formData);
      setIsModalOpen(false);
      setFormData({ name: '', description: '', status: 'active' });
      fetchProjects(); // Refresh list
    } catch (error) {
      console.error('Failed to create project', error);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Are you sure? This will delete all tasks in this project.')) return;
    try {
      await client.delete(`/projects/${id}`);
      fetchProjects();
    } catch (error) {
      console.error('Failed to delete', error);
    }
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your team's workspace</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
        <input 
          type="text" 
          placeholder="Search projects..." 
          className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Grid Layout */}
      {loading ? (
        <div className="text-center py-20 text-slate-500">Loading projects...</div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-20 bg-slate-800/50 rounded-xl border border-dashed border-slate-700">
          <Folder className="h-12 w-12 mx-auto text-slate-600 mb-4" />
          <h3 className="text-lg font-medium text-slate-300">No projects found</h3>
          <p className="text-slate-500 text-sm mt-1">Get started by creating a new project.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div key={project.id} className="group bg-slate-800 rounded-xl border border-slate-700 p-5 hover:border-blue-500/50 transition-colors shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Folder className="h-6 w-6 text-blue-500" />
                </div>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full border ${
                    project.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                    project.status === 'completed' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                    'bg-slate-700 text-slate-400 border-slate-600'
                  }`}>
                    {project.status}
                  </span>
                  <button 
                    onClick={() => handleDelete(project.id)}
                    className="text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-white mb-2">{project.name}</h3>
              <p className="text-slate-400 text-sm line-clamp-2 h-10">{project.description || 'No description provided.'}</p>

              <div className="mt-4 pt-4 border-t border-slate-700 flex items-center justify-between text-xs text-slate-500">
                <span>Created by {project.creator?.full_name || 'Unknown'}</span>
                <span>{new Date(project.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Create New Project"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input 
            label="Project Name" 
            required 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
            <textarea 
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-blue-500 focus:border-blue-500 focus:outline-none h-24"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>
          <div className="pt-2">
            <Button type="submit" className="w-full" isLoading={submitLoading}>Create Project</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectsPage;