const { Project, User, Tenant,Task } = require('../models');
const PLAN_LIMITS = require('../utils/planLimits'); // Import limits


//1. Create Tenant

exports.createProject = async (req, res) => {
  try {
    const { name, description, status } = req.body;
    const tenantId = req.user.tenantId;

    // 1. Fetch Tenant to check Plan
    const tenant = await Tenant.findByPk(tenantId);
    const limits = PLAN_LIMITS[tenant.subscription_plan] || PLAN_LIMITS['free'];

    // 2. Count existing projects
    const currentCount = await Project.count({ where: { tenant_id: tenantId } });

    // 3. ENFORCE LIMIT
    if (currentCount >= limits.max_projects) {
      return res.status(403).json({ 
        success: false, 
        message: `Plan limit reached (${limits.max_projects} projects). Upgrade your plan to create more.` 
      });
    }

    // 4. Create Project (Existing logic)
    const project = await Project.create({
      tenant_id: tenantId,
      name,
      description,
      status: status || 'active',
      created_by: req.user.userId
    });

    res.status(201).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


// 2. List Projects (Scoped to Tenant)
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.findAll({
      where: { tenant_id: req.user.tenantId }, // STRICT ISOLATION
      include: [
        { model: User, as: 'creator', attributes: ['full_name'] },
        { model: Task, attributes: ['id', 'status'] } // To count tasks later if needed
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 3. Update Project
exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;

    // Ensure project belongs to this tenant
    const project = await Project.findOne({ 
      where: { id, tenant_id: req.user.tenantId } 
    });

    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    await project.update(req.body);
    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 4. Delete Project
exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    // Ensure project belongs to this tenant
    const project = await Project.findOne({ 
      where: { id, tenant_id: req.user.tenantId } 
    });

    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    await project.destroy(); // Cascade delete handles tasks
    res.json({ success: true, message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};