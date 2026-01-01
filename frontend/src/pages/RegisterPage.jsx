import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Building2 } from 'lucide-react';

const RegisterPage = () => {
  // Restore the exact state variables your backend expects
  const [formData, setFormData] = useState({ 
    tenantName: '', 
    subdomain: '', 
    adminFullName: '', 
    adminEmail: '', 
    adminPassword: '' 
  });
  
  const navigate = useNavigate();
  const { register } = useAuth(); // Use the Context method
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Use the context register function which handles the API call correctly
      await register(formData);
      // On success, redirect to login
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try a different subdomain.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

      <div className="w-full max-w-lg bg-zinc-900/60 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-violet-600 mb-4 shadow-lg shadow-violet-900/50">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Start your journey</h1>
          <p className="text-zinc-400 text-sm mt-2">Create a new workspace for your team</p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg mb-4 text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Organization Name" 
            placeholder="Acme Inc" 
            required 
            value={formData.tenantName} 
            onChange={(e) => setFormData({...formData, tenantName: e.target.value})} 
          />
          
          <div className="relative">
             <Input 
               label="Workspace Subdomain" 
               placeholder="acme" 
               required 
               value={formData.subdomain} 
               onChange={(e) => setFormData({...formData, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '')})} 
             />
             {/* Visual hint for subdomain */}
             <span className="absolute right-3 top-[2.4rem] text-zinc-600 text-xs pointer-events-none">.saas-platform.com</span>
          </div>
          
          <div className="h-px bg-white/10 my-4"></div>
          
          <Input 
            label="Admin Full Name" 
            placeholder="John Doe" 
            required 
            value={formData.adminFullName} 
            onChange={(e) => setFormData({...formData, adminFullName: e.target.value})} 
          />
          <Input 
            label="Admin Email" 
            type="email" 
            required 
            value={formData.adminEmail} 
            onChange={(e) => setFormData({...formData, adminEmail: e.target.value})} 
          />
          <Input 
            label="Password" 
            type="password" 
            required 
            minLength={6}
            value={formData.adminPassword} 
            onChange={(e) => setFormData({...formData, adminPassword: e.target.value})} 
          />
          
          <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-500 mt-4 h-11" isLoading={isLoading}>
            Launch Workspace
          </Button>
        </form>

        <p className="text-center mt-6 text-sm text-zinc-500">
          Already have an account? <Link to="/login" className="text-violet-400 hover:text-violet-300 transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
};
export default RegisterPage;