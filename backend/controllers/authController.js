const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sequelize, Tenant, User } = require('../models');

exports.login = async (req, res) => {
  try {
    const { email, password, tenantSubdomain } = req.body;

    // 1. Find Tenant
    // (If logging in as Super Admin, they might not provide a subdomain, 
    // but for now let's assume standard tenant login flow)
    let tenantId = null;
    if (tenantSubdomain) {
      const tenant = await Tenant.findOne({ where: { subdomain: tenantSubdomain } });
      if (!tenant) {
        return res.status(404).json({ success: false, message: 'Tenant not found' });
      }
      tenantId = tenant.id;
    }

    // 2. Find User
    // We look for a user with this email who belongs to this tenant OR is a super_admin
    const user = await User.findOne({ 
      where: { email },
      include: [{ model: Tenant }] 
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // 3. Check Tenant Association
    // If user is NOT super_admin, they MUST belong to the requested tenant
    if (user.role !== 'super_admin' && user.tenant_id !== tenantId) {
      return res.status(401).json({ success: false, message: 'User does not belong to this tenant' });
    }

    // 4. Verify Password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // 5. Generate Token
    // Payload: userId, tenantId (from user, or the one they logged into), role
    const token = jwt.sign(
      { 
        userId: user.id, 
        tenantId: user.tenant_id || tenantId, // Use context tenant for super_admin
        role: user.role 
      },
      process.env.JWT_SECRET || 'dev_secret_key_change_in_production',
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          tenantId: user.tenant_id
        }
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    // req.user is set by the middleware (which we will build next)
    const user = await User.findByPk(req.user.userId, {
      attributes: { exclude: ['password_hash'] },
      include: [{ model: Tenant }]
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.registerTenant = async (req, res) => {
  const t = await sequelize.transaction(); // Start Transaction

  try {
    const { tenantName, subdomain, adminEmail, adminPassword, adminFullName } = req.body;

    // 1. Check if subdomain exists
    const existingTenant = await Tenant.findOne({ where: { subdomain } });
    if (existingTenant) {
      await t.rollback();
      return res.status(409).json({ success: false, message: 'Subdomain already exists' });
    }

    // 2. Check if email exists (globally or per tenant logic)
    // For new tenant registration, we usually check if this email is already a super admin or conflicting
    // But per requirements, email is unique per tenant. Since this is a NEW tenant, we are safe.

    // 3. Hash Password
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    // 4. Create Tenant
    const newTenant = await Tenant.create({
      name: tenantName,
      subdomain: subdomain.toLowerCase(),
      status: 'active',
      subscription_plan: 'free' // Default to free
    }, { transaction: t });

    // 5. Create Admin User
    const newAdmin = await User.create({
      tenant_id: newTenant.id,
      email: adminEmail,
      password_hash: passwordHash,
      full_name: adminFullName,
      role: 'tenant_admin',
      is_active: true
    }, { transaction: t });

    // Commit Transaction
    await t.commit();

    res.status(201).json({
      success: true,
      message: 'Tenant registered successfully',
      data: {
        tenantId: newTenant.id,
        subdomain: newTenant.subdomain,
        adminUser: {
          id: newAdmin.id,
          email: newAdmin.email,
          role: newAdmin.role
        }
      }
    });

  } catch (error) {
    await t.rollback();
    console.error('Registration Error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration', error: error.message });
  }
};