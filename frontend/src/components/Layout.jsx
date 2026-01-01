import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FolderKanban, CheckSquare, LogOut, User, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Layout = () => {
  const { user, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', href: '/projects', icon: FolderKanban },
  ];

  // Add Tasks link if user is inside a project context (optional logic)

  const NavItem = ({ item }) => {
    const isActive = location.pathname.startsWith(item.href);
    return (
      <NavLink
        to={item.href}
        onClick={() => setIsMobileOpen(false)}
        className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
          ${isActive 
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
      >
        <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
        {item.name}
      </NavLink>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700">
        <span className="text-xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
          SaaS Platform
        </span>
        <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="text-slate-300">
          {isMobileOpen ? <X /> : <Menu />}
        </button>
      </div>

      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 border-r border-slate-700 transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-center h-16 border-b border-slate-700">
              <h1 className="text-xl font-bold text-white tracking-wider">
                NEXUS<span className="text-blue-500">APP</span>
              </h1>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1">
              {navigation.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
            </nav>

            <div className="p-4 border-t border-slate-700">
              <div className="flex items-center mb-4 px-2">
                <div className="bg-blue-500/10 p-2 rounded-full">
                  <User className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">{user?.fullName}</p>
                  <p className="text-xs text-slate-500 truncate w-32">{user?.email}</p>
                </div>
              </div>
              <Button variant="secondary" onClick={logout} className="w-full justify-start">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto bg-slate-900 relative">
           {/* Background Gradients for visuals */}
           <div className="absolute top-0 left-0 w-full h-96 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 pointer-events-none"></div>

           <div className="relative p-4 lg:p-8">
             <Outlet />
           </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;