const { User } = require('../models');
const bcrypt = require('bcryptjs');
const PLAN_LIMITS = require('../utils/planLimits');

// 1. Get All Users (Scoped to Tenant)
exports.getTenantUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { tenant_id: req.user.tenantId },
      attributes: { exclude: ['password_hash'] }, // Security: Don't send passwords
      order: [['created_at', 'DESC']]
    });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 2. Create New User (Tenant Admin Only)
exports.createUser = async (req, res) => {
  try {
    const { email, fullName, password, role } = req.body;
    const tenantId = req.user.tenantId;

    // 1. Fetch Tenant & Limits
    const tenant = await Tenant.findByPk(tenantId);
    const limits = PLAN_LIMITS[tenant.subscription_plan] || PLAN_LIMITS['free'];

    // 2. Count existing users
    const currentCount = await User.count({ where: { tenant_id: tenantId } });

    // 3. ENFORCE LIMIT
    if (currentCount >= limits.max_users) {
      return res.status(403).json({ 
        success: false, 
        message: `Plan limit reached (${limits.max_users} users). Upgrade your plan to add more team members.` 
      });
    }
    // Check if user exists in this tenant
    const existingUser = await User.findOne({ 
      where: { email, tenant_id: req.user.tenantId } 
    });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists in this workspace' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      tenant_id: req.user.tenantId, // Lock to current tenant
      email,
      full_name: fullName,
      password_hash: passwordHash,
      role: role || 'user',
      is_active: true
    });

    res.status(201).json({ 
      success: true, 
      data: { id: newUser.id, email: newUser.email, fullName: newUser.full_name } 
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 3. Delete User (Tenant Admin Only)
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Security: Find user AND ensure they belong to your tenant
    const user = await User.findOne({ 
      where: { id: userId, tenant_id: req.user.tenantId } 
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found in this workspace' });
    }

    // Prevent admin from deleting themselves
    if (user.id === req.user.userId) {
      return res.status(400).json({ success: false, message: 'You cannot remove yourself.' });
    }

    await user.destroy();
    res.json({ success: true, message: 'User removed successfully' });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};