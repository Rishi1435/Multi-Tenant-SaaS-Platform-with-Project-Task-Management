import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../api/client';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { ArrowLeft, CheckCircle2, Clock, Calendar, Plus, Circle } from 'lucide-react';

const getStatusColor = (s) => {
  switch(s) {
    case 'completed': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    case 'in_progress': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    default: return 'text-zinc-400 bg-zinc-800 border-zinc-700';
  }
};

const ProjectDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'medium', dueDate: '' });

  useEffect(() => { fetchProjectData(); }, [id]);

  const fetchProjectData = async () => {
    try {
      const [projRes, tasksRes] = await Promise.all([client.get('/projects'), client.get(`/projects/${id}/tasks`)]);
      setProject(projRes.data.data.find(p => p.id === id));
      setTasks(tasksRes.data.data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try { await client.post(`/projects/${id}/tasks`, taskForm); setIsTaskModalOpen(false); setTaskForm({ title: '', description: '', priority: 'medium', dueDate: '' }); fetchProjectData(); } catch (error) { console.error(error); }
  };

  const handleStatusUpdate = async (taskId, newStatus) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    await client.patch(`/tasks/${taskId}/status`, { status: newStatus });
  };

  if (loading) return <div className="text-zinc-500">Loading...</div>;
  if (!project) return <div>Not found</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 border-b border-white/5 pb-8">
        <button onClick={() => navigate('/projects')} className="p-2 hover:bg-white/5 rounded-xl text-zinc-400 hover:text-white transition-colors"><ArrowLeft className="h-5 w-5" /></button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white">{project.name}</h1>
          <p className="text-zinc-400 text-sm mt-1">{project.description}</p>
        </div>
        <Button onClick={() => setIsTaskModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-500"><Plus className="h-4 w-4 mr-2" /> Add Task</Button>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-indigo-400" /> Tasks ({tasks.length})</h2>
        {tasks.length === 0 ? (
          <div className="py-12 bg-white/5 rounded-2xl border border-dashed border-white/10 text-center text-zinc-500">No tasks yet.</div>
        ) : (
          <div className="grid gap-3">
            {tasks.map((task) => (
              <div key={task.id} className="bg-zinc-900/40 backdrop-blur-sm p-4 rounded-xl border border-white/5 flex items-center justify-between hover:border-indigo-500/30 transition-all group">
                <div className="flex items-start gap-4">
                  <div className="pt-1">
                    {task.status === 'completed' ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <Circle className="h-5 w-5 text-zinc-600" />}
                  </div>
                  <div>
                    <h3 className={`font-medium text-white ${task.status === 'completed' ? 'line-through text-zinc-600' : ''}`}>{task.title}</h3>
                    <p className="text-sm text-zinc-500 line-clamp-1">{task.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <select value={task.status} onChange={(e) => handleStatusUpdate(task.id, e.target.value)} className={`appearance-none pl-3 pr-8 py-1.5 rounded-lg text-xs font-bold border cursor-pointer focus:outline-none uppercase tracking-wider ${getStatusColor(task.status)}`}>
                     <option value="todo" className="bg-zinc-900 text-zinc-400">Todo</option>
                     <option value="in_progress" className="bg-zinc-900 text-amber-400">In Progress</option>
                     <option value="completed" className="bg-zinc-900 text-emerald-400">Done</option>
                  </select>
                  {task.due_date && <span className="text-xs text-zinc-500 flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(task.due_date).toLocaleDateString()}</span>}
                  <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-300 border border-white/5">{task.assignee?.full_name?.charAt(0) || '?'}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="New Task">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <Input label="Task Title" required value={taskForm.title} onChange={(e) => setTaskForm({...taskForm, title: e.target.value})} />
          <div><label className="block text-sm font-medium text-zinc-400 mb-1">Description</label><textarea className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-white outline-none" value={taskForm.description} onChange={(e) => setTaskForm({...taskForm, description: e.target.value})} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-zinc-400 mb-1">Priority</label><select className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-white outline-none" value={taskForm.priority} onChange={(e) => setTaskForm({...taskForm, priority: e.target.value})}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div>
            <Input label="Due Date" type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm({...taskForm, dueDate: e.target.value})} />
          </div>
          <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500">Create Task</Button>
        </form>
      </Modal>
    </div>
  );
};
export default ProjectDetailsPage;