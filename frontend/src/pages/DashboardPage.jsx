import { useState, useEffect } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { FolderKanban, CheckCircle, Users, TrendingUp, Activity } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg transition-transform hover:scale-105">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-400">{title}</p>
        <p className="text-3xl font-bold text-white mt-2">{value}</p>
      </div>
      <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
        <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
      </div>
    </div>
  </div>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ projects: 0, activeTasks: 0, users: 0, completionRate: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await client.get('/dashboard/stats');
        setStats(res.data.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Overview of <span className="text-blue-400 font-medium">Demo Company</span> workspace</p>
        </div>
        <span className="text-slate-400 text-sm bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
          Welcome, {user?.fullName}
        </span>
      </div>

      {loading ? (
        <div className="text-white">Loading stats...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Projects" 
            value={stats.projects} 
            icon={FolderKanban} 
            color="bg-blue-500" 
          />
          <StatCard 
            title="Active Tasks" 
            value={stats.activeTasks} 
            icon={CheckCircle} 
            color="bg-green-500" 
          />
          <StatCard 
            title="Team Members" 
            value={stats.users} 
            icon={Users} 
            color="bg-purple-500" 
          />
          <StatCard 
            title="Completion Rate" 
            value={`${stats.completionRate}%`} 
            icon={TrendingUp} 
            color="bg-orange-500" 
          />
        </div>
      )}

      {/* Activity Section Placeholder - Can be expanded later */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-5 w-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
        </div>
        <div className="text-slate-400 text-sm bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
          <p>System initialized successfully.</p>
          <p className="mt-2">You have joined the <strong>Demo Company</strong> workspace.</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;