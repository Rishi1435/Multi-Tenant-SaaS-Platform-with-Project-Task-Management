const { Tenant, User, Project } = require('../models');

// GET /api/tenants (Super Admin Only)
exports.getAllTenants = async (req, res) => {
  try {
    const tenants = await Tenant.findAll({
      include: [
        { model: User, attributes: ['id'] }, // Count users logic can be added
        { model: Project, attributes: ['id'] }
      ]
    });

    // Transform data to return counts
    const data = tenants.map(t => ({
      id: t.id,
      name: t.name,
      subdomain: t.subdomain,
      status: t.status,
      plan: t.subscription_plan,
      userCount: t.Users.length,
      projectCount: t.Projects.length
    }));

    res.json({ success: true, data: data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};