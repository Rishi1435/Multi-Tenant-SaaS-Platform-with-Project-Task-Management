import { useAuth } from '../context/AuthContext';
import { CheckSquare, FolderKanban, Users, TrendingUp } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <span className="text-slate-400 text-sm">
          Welcome back, <span className="text-blue-400 font-medium">{user?.fullName}</span>
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Projects" 
          value="12" 
          icon={FolderKanban} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Active Tasks" 
          value="34" 
          icon={CheckSquare} 
          color="bg-green-500" 
        />
        <StatCard 
          title="Team Members" 
          value="8" 
          icon={Users} 
          color="bg-purple-500" 
        />
        <StatCard 
          title="Completion Rate" 
          value="87%" 
          icon={TrendingUp} 
          color="bg-orange-500" 
        />
      </div>

      {/* Recent Activity Placeholder */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
        <div className="text-slate-400 text-center py-8">
          Activity feed coming soon...
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;