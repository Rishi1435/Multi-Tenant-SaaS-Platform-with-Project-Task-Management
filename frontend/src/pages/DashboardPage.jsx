import { useState, useEffect } from 'react';
import client from '../api/client';
import { FolderKanban, Activity, Users, BarChart3, Building, Server, Crown, Zap } from 'lucide-react';
import { Modal } from '../components/ui/Modal'; 
import { Button } from '../components/ui/Button'; 

// Icon Map to convert string names from backend to React Components
const iconMap = {
  FolderKanban, Activity, Users, BarChart3, Building, Server
};

const StatCard = ({ title, value, iconName, color, delay }) => {
  const Icon = iconMap[iconName] || Activity; 
  
  const getGradient = (c) => {
    switch(c) {
      case 'blue': return 'from-blue-500 to-cyan-400';
      case 'rose': return 'from-rose-500 to-orange-400';
      case 'violet': return 'from-violet-500 to-fuchsia-400';
      case 'emerald': return 'from-emerald-500 to-teal-400';
      case 'purple': return 'from-purple-500 to-indigo-400';
      default: return 'from-slate-500 to-slate-400';
    }
  };

  return (
    <div 
      className="relative overflow-hidden bg-zinc-900/50 backdrop-blur-md border border-white/5 p-6 rounded-2xl shadow-xl group hover:border-white/10 transition-all duration-300 hover:-translate-y-1"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-10 blur-2xl bg-gradient-to-br ${getGradient(color)} group-hover:opacity-20 transition-opacity`} />
      
      <div className="relative flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-zinc-400 tracking-wide">{title}</p>
          <h3 className="text-3xl font-bold text-white mt-2 font-sans tracking-tight">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${getGradient(color)} bg-opacity-10 shadow-lg shadow-black/50`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  // Added pendingPlan to initial state
  const [data, setData] = useState({ stats: [], activities: [], role: 'user', plan: 'free', companyName: '', pendingPlan: null });
  const [loading, setLoading] = useState(true);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await client.get('/dashboard/stats');
        setData(res.data.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleUpgradeRequest = async (newPlan) => {
    if(data.plan === newPlan) return; // Prevent requesting current plan

    if(!window.confirm(`Send request to Super Admin to upgrade to ${newPlan.toUpperCase()}?`)) return;
    
    try {
      await client.patch('/tenants/upgrade', { plan: newPlan });
      setIsUpgradeModalOpen(false);
      alert('Request sent successfully! Waiting for Super Admin approval.');
      window.location.reload(); 
    } catch (error) {
      alert('Request failed: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="space-y-8 min-h-[80vh]">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">
            {data.role === 'super_admin' ? 'Platform Overview' : 'Dashboard'}
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            {data.role === 'super_admin' 
              ? 'Monitoring system performance and tenant growth' 
              : `Workspace: ${data.companyName || 'Loading...'}`
            }
          </p>
        </div>

        {/* Plan Badge & Upgrade Action (Only for Tenants) */}
        {data.role !== 'super_admin' && (
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full flex items-center gap-2 shadow-inner">
              {data.plan === 'enterprise' ? <Crown className="h-4 w-4 text-amber-400" /> : <Zap className="h-4 w-4 text-indigo-400" />}
              <span className="text-zinc-400 text-xs uppercase tracking-wider font-bold">Plan:</span>
              <span className={`text-sm font-bold capitalize ${data.plan === 'enterprise' ? 'text-amber-400' : 'text-indigo-400'}`}>
                {data.plan}
              </span>
            </div>

            {/* LOGIC: Show Pending Badge OR Upgrade Button */}
            {data.pendingPlan ? (
              <span className="px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold rounded-full flex items-center gap-2 animate-pulse">
                 <span className="h-1.5 w-1.5 rounded-full bg-yellow-400"></span>
                 Request Pending ({data.pendingPlan})
              </span>
            ) : (
              data.plan !== 'enterprise' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsUpgradeModalOpen(true)} 
                  className="text-xs border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300 transition-colors"
                >
                  Request Upgrade
                </Button>
              )
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-zinc-500">Loading analytics...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.stats.map((stat, index) => (
              <StatCard 
                key={index}
                title={stat.title}
                value={stat.value}
                iconName={stat.icon}
                color={stat.color}
                delay={index * 100}
              />
            ))}
          </div>

          <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6">
             <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-8 rounded-lg bg-zinc-800 flex items-center justify-center border border-white/10">
                  <Activity className="h-4 w-4 text-zinc-400" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  {data.role === 'super_admin' ? 'Recent Registrations' : 'Recent Activity'}
                </h3>
             </div>

             <div className="space-y-4">
               {data.activities.length === 0 ? (
                 <div className="text-zinc-500 text-center py-8">No recent activity found.</div>
               ) : (
                 data.activities.map((item, idx) => (
                   <div key={idx} className="flex items-center gap-4 p-4 rounded-xl bg-zinc-900/50 border border-white/5 hover:bg-zinc-800/50 transition-colors">
                      <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                      <div className="flex-1">
                        <p className="text-zinc-200 font-medium">{item.text}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">{item.subtext}</p>
                      </div>
                      <span className="text-xs text-zinc-600 font-mono">
                        {new Date(item.time).toLocaleDateString()}
                      </span>
                   </div>
                 ))
               )}
             </div>
          </div>
        </>
      )}

      {/* Upgrade Request Modal */}
      <Modal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} title="Request Plan Upgrade">
        <div className="space-y-4">
           <p className="text-zinc-400 text-sm mb-4">Select a plan to request approval from the Administrator.</p>
           
           {['pro', 'enterprise'].map((planName) => {
             const isCurrent = data.plan === planName;
             return (
               <div 
                 key={planName}
                 className={`group border p-4 rounded-xl transition-all duration-200 relative overflow-hidden
                   ${isCurrent 
                     ? 'border-zinc-700 bg-zinc-800/50 opacity-50 cursor-not-allowed' 
                     : 'border-zinc-700 hover:border-indigo-500 hover:bg-zinc-900/80 cursor-pointer'
                   }`}
                 onClick={() => !isCurrent && handleUpgradeRequest(planName)}
               >
                 <div className="flex justify-between items-center mb-2">
                   <h3 className={`text-lg font-bold capitalize ${isCurrent ? 'text-zinc-500' : 'text-white group-hover:text-indigo-400'}`}>
                     {planName} Plan
                   </h3>
                   {isCurrent && <span className="text-xs font-bold bg-zinc-700 text-zinc-300 px-2 py-1 rounded">Current Plan</span>}
                   {!isCurrent && planName === 'pro' && <span className="text-xs font-bold bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded">Recommended</span>}
                   {!isCurrent && planName === 'enterprise' && <Crown className="h-4 w-4 text-amber-500" />}
                 </div>
                 <ul className="text-zinc-400 text-sm space-y-1">
                    {planName === 'pro' ? (
                        <>
                            <li className="flex items-center gap-2"><span className="text-indigo-500">✓</span> 25 Team Members</li>
                            <li className="flex items-center gap-2"><span className="text-indigo-500">✓</span> 15 Active Projects</li>
                        </>
                    ) : (
                        <>
                            <li className="flex items-center gap-2"><span className="text-amber-500">✓</span> 100 Team Members</li>
                            <li className="flex items-center gap-2"><span className="text-amber-500">✓</span> 50 Active Projects</li>
                            <li className="flex items-center gap-2"><span className="text-amber-500">✓</span> Priority Support</li>
                        </>
                    )}
                 </ul>
               </div>
             );
           })}
        </div>
      </Modal>
    </div>
  );
};

export default DashboardPage;