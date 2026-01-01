'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tenants', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      subdomain: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      status: {
        type: Sequelize.ENUM('active', 'suspended', 'trial'),
        defaultValue: 'active'
      },
      subscription_plan: {
        type: Sequelize.ENUM('free', 'pro', 'enterprise'),
        defaultValue: 'free'
      },
      max_users: {
        type: Sequelize.INTEGER,
        defaultValue: 5
      },
      max_projects: {
        type: Sequelize.INTEGER,
        defaultValue: 3
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tenants');
  }
};