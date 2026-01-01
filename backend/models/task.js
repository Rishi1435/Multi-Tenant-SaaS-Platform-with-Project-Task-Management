module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define('Task', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    project_id: DataTypes.UUID,
    tenant_id: DataTypes.UUID,
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    status: DataTypes.ENUM('todo', 'in_progress', 'completed'),
    priority: DataTypes.ENUM('low', 'medium', 'high'),
    assigned_to: DataTypes.UUID,
    due_date: DataTypes.DATEONLY
  }, {
    tableName: 'tasks',
    underscored: true
  });
  Task.associate = (models) => {
    Task.belongsTo(models.Project, { foreignKey: 'project_id' });
    Task.belongsTo(models.User, { foreignKey: 'assigned_to', as: 'assignee' });
  };
  return Task;
};