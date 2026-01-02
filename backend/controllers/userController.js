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

// Get all users for the current tenant (Team Members)
exports.getTeamMembers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { tenant_id: req.user.tenantId },
      attributes: ['id', 'full_name', 'email'] // Only fetch what we need
    });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
// 2. Create New User (Tenant Admin Only)
// Create a new user (Team Member)
exports.createUser = async (req, res) => {
  try {
    // FIX: Destructure BOTH naming conventions
    const { fullName, full_name, email, password, role } = req.body;
    
    // Get Tenant ID from the logged-in admin's token
    const tenantId = req.user.tenantId; 

    // Validation
    if (!email || !password || (!fullName && !full_name)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide full name, email, and password' 
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create User
    const user = await User.create({
      tenant_id: tenantId,
      full_name: fullName || full_name, // <--- FIX: Use whichever is provided
      email,
      password, // The model hook will hash this
      role: role || 'member'
    });

    res.status(201).json({ success: true, data: user });

  } catch (error) {
    console.error("Create User Error:", error); // This helps you see the error in terminal
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