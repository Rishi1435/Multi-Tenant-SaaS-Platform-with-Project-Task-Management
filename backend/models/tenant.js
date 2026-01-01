module.exports = (sequelize, DataTypes) => {
  const Tenant = sequelize.define('Tenant', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: DataTypes.STRING,
    subdomain: DataTypes.STRING,
    status: DataTypes.ENUM('active', 'suspended'),
    subscription_plan: {
      type: DataTypes.ENUM('free', 'pro', 'enterprise'),
      defaultValue: 'free'
    },
    pending_plan: {
      type: DataTypes.ENUM('free', 'pro', 'enterprise'),
      allowNull: true
    },
    max_users: DataTypes.INTEGER,
    max_projects: DataTypes.INTEGER
  }, {
    tableName: 'tenants',
    underscored: true
  });
  Tenant.associate = (models) => {
    Tenant.hasMany(models.User, { foreignKey: 'tenant_id' });
    Tenant.hasMany(models.Project, { foreignKey: 'tenant_id' });
  };
  return Tenant;
};