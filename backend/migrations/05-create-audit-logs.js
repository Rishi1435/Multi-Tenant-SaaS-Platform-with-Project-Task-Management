'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('audit_logs', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      tenant_id: {
        type: Sequelize.UUID,
        allowNull: true, // Null for system events
        references: { model: 'tenants', key: 'id' }
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' }
      },
      action: { type: Sequelize.STRING, allowNull: false },
      entity_type: { type: Sequelize.STRING },
      entity_id: { type: Sequelize.STRING },
      ip_address: { type: Sequelize.STRING },
      created_at: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface, Sequelize) { await queryInterface.dropTable('audit_logs'); }
};