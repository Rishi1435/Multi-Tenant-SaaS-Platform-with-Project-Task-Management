const { Tenant, User, sequelize } = require('../models');
const bcrypt = require('bcryptjs');

// Get All Tenants (Super Admin)
exports.getAllTenants = async (req, res) => {
    try {
        const tenants = await Tenant.findAll({
            order: [['created_at', 'DESC']]
        });
        res.json({ success: true, data: tenants });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Create New Tenant (Super Admin)
exports.createTenant = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const { name, subdomain, email, password, plan } = req.body;

        const exists = await Tenant.findOne({ where: { subdomain } });
        if (exists) {
            await t.rollback();
            return res.status(400).json({ success: false, message: 'Subdomain already taken' });
        }

        const tenant = await Tenant.create({
            name,
            subdomain: subdomain.toLowerCase(),
            status: 'active',
            subscription_plan: plan || 'free'
        }, { transaction: t });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await User.create({
            tenant_id: tenant.id,
            full_name: 'Workspace Admin',
            email,
            password_hash: hashedPassword,
            role: 'tenant_admin',
            is_active: true
        }, { transaction: t });

        await t.commit();

        res.status(201).json({ success: true, data: tenant });
    } catch (error) {
        await t.rollback();
        console.error('Create Tenant Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// 1. Tenant REQUESTS Upgrade (Strictly sets PENDING_PLAN only)
exports.requestUpgrade = async (req, res) => {
  try {
    const { plan } = req.body;
    const tenantId = req.user.tenantId;

    // Validation: Don't allow requesting the plan they already have
    const currentTenant = await Tenant.findByPk(tenantId);
    if (currentTenant.subscription_plan === plan) {
      return res.status(400).json({ success: false, message: 'You are already on this plan.' });
    }

    // Only update 'pending_plan'. Do NOT touch 'subscription_plan'.
    await Tenant.update({ pending_plan: plan }, { where: { id: tenantId } });
    
    res.json({ success: true, message: `Request sent! Waiting for Super Admin approval for ${plan}.` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 2. Super Admin APPROVES Upgrade
exports.approveUpgrade = async (req, res) => {
  try {
    const { tenantId } = req.body;
    
    const tenant = await Tenant.findByPk(tenantId);
    if (!tenant || !tenant.pending_plan) {
      return res.status(400).json({ success: false, message: 'No pending request found for this tenant.' });
    }

    const newPlan = tenant.pending_plan;

    // Apply the new plan and clear the pending request
    await tenant.update({
      subscription_plan: newPlan, 
      pending_plan: null          
    });

    res.json({ success: true, message: `Successfully upgraded to ${newPlan} plan.` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};