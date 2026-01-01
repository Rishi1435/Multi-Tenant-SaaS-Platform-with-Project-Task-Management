const { Project, Task, User } = require('../models');

exports.getDashboardStats = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;

    // Run counts in parallel for performance
    const [projectCount, taskCount, userCount, activeTasks] = await Promise.all([
      Project.count({ where: { tenant_id: tenantId } }),
      Task.count({ where: { tenant_id: tenantId } }),
      User.count({ where: { tenant_id: tenantId } }),
      Task.count({ where: { tenant_id: tenantId, status: ['todo', 'in_progress'] } })
    ]);

    // Calculate completion rate (avoid division by zero)
    const completedTasks = taskCount - activeTasks;
    const completionRate = taskCount > 0 ? Math.round((completedTasks / taskCount) * 100) : 0;

    res.json({
      success: true,
      data: {
        projects: projectCount,
        totalTasks: taskCount,
        activeTasks: activeTasks,
        users: userCount,
        completionRate: completionRate
      }
    });
  } catch (error) {
    console.error('Dashboard Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};