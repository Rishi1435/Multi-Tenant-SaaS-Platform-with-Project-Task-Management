module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    tenant_id: DataTypes.UUID,
    email: DataTypes.STRING,
    password_hash: DataTypes.STRING,
    full_name: DataTypes.STRING,
    role: DataTypes.ENUM('super_admin', 'tenant_admin', 'user'),
    is_active: DataTypes.BOOLEAN
  }, {
    tableName: 'users',
    underscored: true
  });
  User.associate = (models) => {
    User.belongsTo(models.Tenant, { foreignKey: 'tenant_id' });
    User.hasMany(models.Project, { foreignKey: 'created_by' });
  };
  return User;
};