import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ShieldCheck } from 'lucide-react';

const LoginPage = () => {
  const [formData, setFormData] = useState({ subdomain: '', email: '', password: '' });
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      // Pass arguments in the order your Context expects: email, password, subdomain
      await login(formData.email, formData.password, formData.subdomain);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials or workspace not found');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-900/20 rounded-full blur-3xl -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-900/10 rounded-full blur-3xl translate-y-1/2 pointer-events-none"></div>

      <div className="w-full max-w-md bg-zinc-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-indigo-600 mb-4 shadow-lg shadow-indigo-900/50">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back</h1>
          <p className="text-zinc-400 text-sm mt-2">Sign in to your SaaS workspace</p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg mb-4 text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Input 
              label="Workspace Subdomain" 
              placeholder="e.g. demo" 
              value={formData.subdomain}
              onChange={(e) => setFormData({...formData, subdomain: e.target.value})}
            />
             {/* Helper text for Super Admin */}
            <p className="text-[10px] text-zinc-600 mt-1 text-right">Leave empty for Super Admin</p>
          </div>

          <Input 
            label="Email Address" 
            type="email" 
            required
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
          <Input 
            label="Password" 
            type="password" 
            required
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
          
          <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 mt-2 h-11 text-base" isLoading={isLoading}>
            Sign In
          </Button>
        </form>
        
        <p className="text-center mt-6 text-sm text-zinc-500">
          Don't have a workspace? <Link to="/register" className="text-indigo-400 hover:text-indigo-300 transition-colors">Register new tenant</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;