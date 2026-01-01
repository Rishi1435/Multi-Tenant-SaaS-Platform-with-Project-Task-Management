import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Building2 } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    tenantName: '',
    subdomain: '',
    adminFullName: '',
    adminEmail: '',
    adminPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await register(formData);
      // Redirect to login with success message usually, but for now just go to login
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-500/10 flex items-center justify-center rounded-full">
            <Building2 className="h-6 w-6 text-blue-500" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-white">
            Create Workspace
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Get started with your free trial
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <Input
            label="Organization Name"
            required
            value={formData.tenantName}
            onChange={(e) => setFormData({...formData, tenantName: e.target.value})}
          />
          <div className="relative">
            <Input
              label="Subdomain"
              required
              value={formData.subdomain}
              onChange={(e) => setFormData({...formData, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '')})}
            />
            <span className="absolute right-3 top-9 text-slate-500 text-sm">.nexusapp.com</span>
          </div>
          <Input
            label="Admin Full Name"
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
            minLength={8}
            value={formData.adminPassword}
            onChange={(e) => setFormData({...formData, adminPassword: e.target.value})}
          />

          {error && (
            <p className="text-sm text-red-500 text-center bg-red-500/10 p-2 rounded">{error}</p>
          )}

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Create Workspace
          </Button>

          <div className="text-center">
            <Link to="/login" className="text-sm text-blue-500 hover:text-blue-400">
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;