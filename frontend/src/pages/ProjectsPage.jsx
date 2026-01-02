import { useState, useEffect } from 'react';
import client from '../api/client';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Plus, Folder, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Textarea } from '../components/ui/Textarea';

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const navigate = useNavigate();

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
    try {
      await client.post('/projects', formData);
      setIsModalOpen(false);
      setFormData({ name: '', description: '' });
      fetchProjects();
    } catch (error) {
      alert('Failed to create project');
    }
  };

  // Helper to safely format dates
  const formatDate = (dateString) => {
    if (!dateString) return 'No Date';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Projects</h1>
          <p className="text-zinc-400 text-sm mt-1">Manage and track your ongoing work</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> New Project
        </Button>
      </div>

      {loading ? (
        <div className="text-zinc-500">Loading projects...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => navigate(`/projects/${project.id}`)}
              className="group bg-zinc-900/50 hover:bg-zinc-900 border border-white/5 hover:border-indigo-500/50 p-5 rounded-xl transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${project.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}>
                  {project.status}
                </span>
              </div>

              <div className="mb-4">
                <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                  <Folder className="h-5 w-5 text-indigo-400" />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">{project.name}</h3>
                <p className="text-zinc-500 text-sm line-clamp-2 mt-1 h-10">{project.description || 'No description provided'}</p>
              </div>

              <div className="flex items-center gap-2 text-xs text-zinc-600 border-t border-white/5 pt-3 mt-2">
                <Calendar className="h-3 w-3" />
                {/* Fix: Check both casing styles */}
                <span>{formatDate(project.created_at || project.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Project">
        <form onSubmit={handleCreate} className="space-y-5">
          <Input
            label="Project Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Website Redesign"
          />

          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="What is this project about?"
          />

          <Button type="submit" className="w-full py-3">Create Project</Button>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectsPage;