const { Project, Task, User, Tenant } = require('../models');

exports.getDashboardStats = async (req, res) => {
  try {
    // ==========================================
    // 1. SUPER ADMIN VIEW
    // ==========================================
    if (req.user.role === 'super_admin') {
      const [tenantCount, userCount, activeTenants] = await Promise.all([
        Tenant.count(),
        User.count(),
        Tenant.count({ where: { status: 'active' } })
      ]);

      const recentTenants = await Tenant.findAll({
        limit: 5,
        order: [['created_at', 'DESC']],
        attributes: ['id', 'name', 'created_at', 'subscription_plan']
      });

      return res.json({
        success: true,
        data: {
          role: 'super_admin',
          stats: [
            { title: 'Total Workspaces', value: tenantCount, icon: 'Building', color: 'blue' },
            { title: 'Total Users', value: userCount, icon: 'Users', color: 'purple' },
            { title: 'Active Tenants', value: activeTenants, icon: 'Activity', color: 'green' },
            { title: 'System Health', value: '100%', icon: 'Server', color: 'emerald' }
          ],
          activities: recentTenants.map(t => ({
            id: t.id,
            text: `New workspace registered: ${t.name}`,
            subtext: `${t.subscription_plan.toUpperCase()} Plan`,
            // Fix: Handle both casing styles for date
            time: t.createdAt || t.created_at || new Date()
          }))
        }
      });
    }

    // ==========================================
    // 2. TENANT ADMIN / USER VIEW
    // ==========================================
    const tenantId = req.user.tenantId;
    
    const tenant = await Tenant.findByPk(tenantId, {
      attributes: ['name', 'subscription_plan', 'pending_plan'] 
    });
    
    const [projectCount, taskCount, userCount, activeTasks] = await Promise.all([
      Project.count({ where: { tenant_id: tenantId } }),
      Task.count({ where: { tenant_id: tenantId } }),
      User.count({ where: { tenant_id: tenantId } }),
      Task.count({ where: { tenant_id: tenantId, status: ['todo', 'in_progress'] } })
    ]);

    const recentTasks = await Task.findAll({
      where: { tenant_id: tenantId },
      limit: 5,
      order: [['created_at', 'DESC']],
      include: [{ model: User, as: 'assignee', attributes: ['full_name'] }]
    });

    const completionRate = taskCount > 0 ? Math.round(((taskCount - activeTasks) / taskCount) * 100) : 0;

    res.json({
      success: true,
      data: {
        role: 'user',
        companyName: tenant.name,
        plan: tenant.subscription_plan,
        pendingPlan: tenant.pending_plan, 
        stats: [
          { title: 'Active Projects', value: projectCount, icon: 'FolderKanban', color: 'blue' },
          { title: 'Pending Tasks', value: activeTasks, icon: 'Activity', color: 'rose' },
          { title: 'Team Members', value: userCount, icon: 'Users', color: 'violet' },
          { title: 'Completion Rate', value: `${completionRate}%`, icon: 'BarChart3', color: 'emerald' }
        ],
        activities: recentTasks.map(t => ({
          id: t.id,
          text: `New task created: ${t.title}`,
          subtext: t.assignee ? `Assigned to ${t.assignee.full_name}` : 'Unassigned',
          time: t.createdAt || t.created_at || new Date()
        }))
      }
    });

  } catch (error) {
    console.error('Dashboard Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};