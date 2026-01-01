import { useState, useEffect } from 'react';
import client from '../api/client';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Building2, Plus, Globe, Users, AlertTriangle } from 'lucide-react'; // Added AlertTriangle icon

const AdminTenantsPage = () => {
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', subdomain: '', email: '', password: '', plan: 'free' });

    useEffect(() => {
        fetchTenants();
    }, []);

    const fetchTenants = async () => {
        try {
            const res = await client.get('/tenants');
            setTenants(res.data.data);
        } catch (error) {
            console.error('Failed to fetch tenants', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTenant = async (e) => {
        e.preventDefault();
        try {
            await client.post('/tenants', formData);
            setIsModalOpen(false);
            setFormData({ name: '', subdomain: '', email: '', password: '', plan: 'free' });
            fetchTenants();
            alert('New Workspace Created Successfully!');
        } catch (error) {
            console.error('Failed to create tenant', error);
            alert('Error: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleApproveUpgrade = async (tenantId, planName) => {
        if(!window.confirm(`Are you sure you want to approve the upgrade to ${planName.toUpperCase()}?`)) return;
        
        try {
            await client.post('/tenants/approve-upgrade', { tenantId });
            fetchTenants(); 
            alert('Upgrade approved successfully.');
        } catch (error) {
            alert('Approval failed: ' + (error.response?.data?.message || error.message));
        }
    };

    // Calculate pending requests
    const pendingCount = tenants.filter(t => t.pending_plan).length;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">Platform Administration</h1>
                    <p className="text-slate-400 text-sm">Manage workspaces and billing</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Workspace
                </Button>
            </div>

            {/* Notification Banner for Pending Requests */}
            {pendingCount > 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex items-center justify-between animate-pulse">
                    <div className="flex items-center gap-3">
                        <div className="bg-yellow-500 text-black font-bold h-8 w-8 rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/50">
                            {pendingCount}
                        </div>
                        <div>
                            <h3 className="text-yellow-400 font-bold flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" /> Action Required
                            </h3>
                            <p className="text-yellow-500/80 text-sm">
                                {pendingCount} workspace{pendingCount > 1 ? 's are' : ' is'} waiting for plan approval.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="text-white">Loading workspaces...</div>
            ) : (
                <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                    {tenants.map((tenant) => (
                        <div key={tenant.id} className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col justify-between hover:border-slate-600 transition-colors">
                            <div className="flex justify-between items-start w-full">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Building2 className="h-5 w-5 text-blue-400" />
                                        <h3 className="text-xl font-bold text-white">{tenant.name}</h3>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                                        <Globe className="h-4 w-4" />
                                        <span>{tenant.subdomain}.saas-platform.com</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                                        <Users className="h-4 w-4" />
                                        <span className="capitalize">{tenant.subscription_plan} Plan</span>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${tenant.status === 'active'
                                    ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                                }`}>
                                    {tenant.status.toUpperCase()}
                                </span>
                            </div>

                            {/* PENDING REQUEST SECTION */}
                            {tenant.pending_plan && (
                                <div className="mt-4 pt-4 border-t border-slate-700 flex items-center justify-between bg-yellow-500/5 p-3 rounded-lg border border-yellow-500/10">
                                    <div className="text-xs text-yellow-400">
                                        <span className="block font-bold mb-0.5">Upgrade Request Pending</span>
                                        Requesting switch to <strong>{tenant.pending_plan.toUpperCase()}</strong>
                                    </div>
                                    <Button 
                                        size="xs" 
                                        onClick={() => handleApproveUpgrade(tenant.id, tenant.pending_plan)}
                                        className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold h-8 text-xs border-none shadow-lg shadow-yellow-500/20"
                                    >
                                        Approve
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Create Tenant Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register New Organization">
                <form onSubmit={handleCreateTenant} className="space-y-4">
                    <Input
                        label="Company Name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Acme Corp"
                    />
                    <Input
                        label="Subdomain"
                        required
                        value={formData.subdomain}
                        onChange={(e) => setFormData({ ...formData, subdomain: e.target.value.toLowerCase() })}
                        placeholder="acme"
                    />
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-300 mb-1">Subscription Plan</label>
                        <div className="grid grid-cols-3 gap-3">
                            {['free', 'pro', 'enterprise'].map((plan) => (
                                <button
                                    key={plan}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, plan })}
                                    className={`py-2 px-3 rounded-lg border text-sm font-medium capitalize transition-all ${formData.plan === plan
                                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg'
                                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                                    }`}
                                >
                                    {plan}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="border-t border-slate-700 pt-4 mt-4">
                        <h4 className="text-sm font-medium text-slate-300 mb-3">Admin Account Details</h4>
                        <Input
                            label="Admin Email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                        <Input
                            label="Admin Password"
                            type="password"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>
                    <Button type="submit" className="w-full mt-2">Launch Workspace</Button>
                </form>
            </Modal>
        </div>
    );
};

export default AdminTenantsPage;