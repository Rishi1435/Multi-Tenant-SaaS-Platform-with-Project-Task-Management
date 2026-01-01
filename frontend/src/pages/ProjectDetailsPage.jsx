import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../api/client';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { ArrowLeft, CheckCircle2, Clock, AlertCircle, Plus } from 'lucide-react';

const PriorityBadge = ({ priority }) => {
  const colors = {
    high: 'bg-red-500/10 text-red-400 border-red-500/20',
    medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    low: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs border ${colors[priority] || colors.low} uppercase tracking-wide font-medium`}>
      {priority}
    </span>
  );
};

const ProjectDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Task Form
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'medium', dueDate: '' });

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const fetchProjectData = async () => {
    try {
      // Parallel fetch for speed
      const [projRes, tasksRes] = await Promise.all([
        client.get('/projects'), // We filter client-side or implement get-one endpoint later. For now let's just grab list and find one.
        client.get(`/projects/${id}/tasks`)
      ]);

      // Note: Ideally backend has GET /projects/:id, but filtering list works for MVP
      const foundProject = projRes.data.data.find(p => p.id === id);
      setProject(foundProject);
      setTasks(tasksRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await client.post(`/projects/${id}/tasks`, taskForm);
      setIsTaskModalOpen(false);
      setTaskForm({ title: '', description: '', priority: 'medium', dueDate: '' });
      fetchProjectData(); // Refresh
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      // Optimistic UI Update
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      await client.patch(`/tasks/${taskId}/status`, { status: newStatus });
    } catch (error) {
      fetchProjectData(); // Revert on error
    }
  };

  if (loading) return <div className="text-white p-8">Loading...</div>;
  if (!project) return <div className="text-white p-8">Project not found</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-slate-700 pb-6">
        <button 
          onClick={() => navigate('/projects')}
          className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{project.name}</h1>
          <p className="text-slate-400 text-sm">{project.description}</p>
        </div>
        <Button onClick={() => setIsTaskModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-blue-500" />
          Tasks ({tasks.length})
        </h2>

        {tasks.length === 0 ? (
          <div className="text-center py-12 bg-slate-800 rounded-xl border border-dashed border-slate-700 text-slate-500">
            No tasks yet. Create one to get started!
          </div>
        ) : (
          <div className="grid gap-3">
            {tasks.map((task) => (
              <div key={task.id} className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex items-center justify-between hover:border-slate-600 transition-colors">
                <div className="flex items-start gap-4">
                  {/* Status Checkbox/Dropdown */}
                  <select 
                    value={task.status}
                    onChange={(e) => handleStatusUpdate(task.id, e.target.value)}
                    className={`mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-transparent cursor-pointer ${
                      task.status === 'completed' ? 'text-green-500' : 'text-slate-400'
                    }`}
                    title="Change Status"
                  >
                     <option value="todo">Todo</option>
                     <option value="in_progress">In Progress</option>
                     <option value="completed">Done</option>
                  </select>

                  <div>
                    <h3 className={`font-medium text-white ${task.status === 'completed' ? 'line-through text-slate-500' : ''}`}>
                      {task.title}
                    </h3>
                    <p className="text-sm text-slate-400">{task.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <PriorityBadge priority={task.priority} />
                  {task.due_date && (
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(task.due_date).toLocaleDateString()}
                    </span>
                  )}
                  <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400" title={task.assignee?.full_name}>
                    {task.assignee?.full_name?.charAt(0) || '?'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        title="Create New Task"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <Input
            label="Task Title"
            required
            value={taskForm.title}
            onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
          />
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
            <textarea
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
              value={taskForm.description}
              onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Priority</label>
              <select
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                value={taskForm.priority}
                onChange={(e) => setTaskForm({...taskForm, priority: e.target.value})}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <Input
              label="Due Date"
              type="date"
              value={taskForm.dueDate}
              onChange={(e) => setTaskForm({...taskForm, dueDate: e.target.value})}
            />
          </div>
          <Button type="submit" className="w-full mt-2">Create Task</Button>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectDetailsPage;