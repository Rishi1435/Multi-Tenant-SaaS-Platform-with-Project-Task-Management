const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sequelize, Tenant, User } = require('../models');

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