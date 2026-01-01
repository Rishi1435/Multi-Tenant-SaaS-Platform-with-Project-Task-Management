module.exports = (sequelize, DataTypes) => {
  return sequelize.define('AuditLog', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    tenant_id: DataTypes.UUID,
    user_id: DataTypes.UUID,
    action: DataTypes.STRING,
    entity_type: DataTypes.STRING,
    entity_id: DataTypes.STRING,
    ip_address: DataTypes.STRING
  }, {
    tableName: 'audit_logs',
    underscored: true,
    updatedAt: false // Audit logs usually don't need update timestamps
  });
};