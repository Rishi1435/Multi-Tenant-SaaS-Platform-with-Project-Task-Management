import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FolderKanban, Users, LogOut, User, Menu, X, Building } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/Button';

const Layout = () => {
  const { user, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  let navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', href: '/projects', icon: FolderKanban },
    { name: 'Team', href: '/team', icon: Users },
  ];

  if (user?.role === 'super_admin') {
    navigation = [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Workspaces', href: '/admin/tenants', icon: Building }, // <--- Special Admin Route
    ];
  }

  const NavItem = ({ item }) => {
    const isActive = location.pathname.startsWith(item.href);
    return (
      <NavLink
        to={item.href}
        onClick={() => setIsMobileOpen(false)}
        className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-300
          ${isActive 
            ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]' 
            : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-100'
          }`}
      >
        <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-indigo-400' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
        {item.name}
      </NavLink>
    );
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-zinc-900/80 backdrop-blur-md border-b border-white/5">
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">
          SaaS_Platform
        </span>
        <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="text-zinc-400">
          {isMobileOpen ? <X /> : <Menu />}
        </button>
      </div>

      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-zinc-900/50 backdrop-blur-xl border-r border-white/5 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-center h-20 border-b border-white/5">
              <h1 className="text-xl font-bold tracking-wider">
                SaaS_<span className="text-indigo-500">Platform</span>
              </h1>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigation.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
            </nav>

            <div className="p-4 border-t border-white/5 bg-zinc-900/30">
              <div className="flex items-center mb-4 px-2">
                <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                  {user?.fullName?.charAt(0)}
                </div>
                <div className="ml-3 overflow-hidden">
                  <p className="text-sm font-medium text-white truncate">{user?.fullName}</p>
                  <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
                </div>
              </div>
              <Button variant="secondary" onClick={logout} className="w-full justify-start border border-white/10 hover:bg-white/5 text-zinc-400 hover:text-white">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto bg-black relative selection:bg-indigo-500/30">
           {/* Ambient Background Glows */}
           <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
           <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[100px] translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
           
           <div className="relative p-6 lg:p-10 max-w-7xl mx-auto">
             <Outlet />
           </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;