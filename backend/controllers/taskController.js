const { Task, Project, User } = require('../models');

// 1. Create Task (POST /api/projects/:projectId/tasks)
exports.createTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, priority, assignedTo, dueDate } = req.body;

    // Verify Project belongs to Tenant
    const project = await Project.findOne({
      where: { id: projectId, tenant_id: req.user.tenantId }
    });

    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const task = await Task.create({
      project_id: projectId,
      tenant_id: req.user.tenantId, // Inherit from user/token
      title,
      description,
      priority: priority || 'medium',
      status: 'todo',
      assigned_to: assignedTo || null,
      due_date: dueDate || null
    });

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 2. Get Tasks for Project (GET /api/projects/:projectId/tasks)
exports.getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Security Check
    const project = await Project.findOne({
      where: { id: projectId, tenant_id: req.user.tenantId }
    });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const tasks = await Task.findAll({
      where: { project_id: projectId },
      include: [{ model: User, as: 'assignee', attributes: ['id', 'full_name', 'email'] }],
      order: [['priority', 'DESC'], ['created_at', 'ASC']]
    });

    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 3. Update Task Status (PATCH /api/tasks/:id/status)
exports.updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const task = await Task.findOne({
      where: { id, tenant_id: req.user.tenantId }
    });

    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    task.status = status;
    await task.save();

    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createTask = async (req, res) => {
  try {
    // Add assigneeId to destructuring
    const { title, description, status, priority, dueDate, assigneeId } = req.body; 
    const tenantId = req.user.tenantId;
    const { projectId } = req.params; 

    // Determine project_id: either from URL params or body
    const finalProjectId = projectId || req.body.projectId;

    const task = await Task.create({
      tenant_id: tenantId,
      project_id: finalProjectId,
      title,
      description,
      status: status || 'todo',
      priority: priority || 'medium',
      due_date: dueDate,
      assignee_id: assigneeId || null, // <--- SAVE IT HERE
      created_by: req.user.userId
    });

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete a Task
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenantId;

    // 1. Find the task and ensure it belongs to this tenant
    const task = await Task.findOne({ where: { id, tenant_id: tenantId } });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // 2. Destroy it
    await task.destroy();

    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};