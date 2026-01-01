module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define('Project', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    tenant_id: DataTypes.UUID,
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    status: DataTypes.ENUM('active', 'archived', 'completed'),
    created_by: DataTypes.UUID
  }, {
    tableName: 'projects',
    underscored: true
  });
  Project.associate = (models) => {
    Project.belongsTo(models.Tenant, { foreignKey: 'tenant_id' });
    Project.belongsTo(models.User, { foreignKey: 'created_by', as: 'creator' });
    Project.hasMany(models.Task, { foreignKey: 'project_id' });
  };
  return Project;
};